package org.ciyex.ehr.notification;

import org.ciyex.ehr.notification.entity.NotificationTemplate;
import org.hibernate.SessionFactory;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.AvailableSettings;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Regression test for the "column \"variables\" is of type jsonb but expression is of
 * type character varying" error when saving a Notification Template.
 *
 * The {@code variables} column is jsonb and the entity field is a String holding a JSON
 * array. Without {@code @JdbcTypeCode(SqlTypes.JSON)} on the field, Hibernate binds the
 * value as varchar and Postgres rejects it. This test persists a template and reads it
 * back to prove the jsonb round-trip works.
 *
 * Bootstraps Hibernate directly (no Spring test slice — Boot 4 relocated {@code @DataJpaTest})
 * against the real Postgres, since jsonb is unavailable on H2. Skips itself when the
 * ciyexdb datasource is unreachable (e.g. CI without a database).
 */
class NotificationTemplateJsonbTest {

    private static final String URL =
            System.getenv().getOrDefault("DATABASE_URL", "jdbc:postgresql://localhost:5432/ciyexdb");
    private static final String USER =
            System.getenv().getOrDefault("DATABASE_USERNAME", "postgres");
    private static final String PASS =
            System.getenv().getOrDefault("DATABASE_PASSWORD", "postgres");

    @Test
    void savesVariablesIntoJsonbColumn() {
        // Skip when the local Postgres isn't reachable.
        try (Connection c = DriverManager.getConnection(URL, USER, PASS)) {
            Assumptions.assumeTrue(c.isValid(2), "ciyexdb connection not valid");
        } catch (Exception e) {
            Assumptions.abort("ciyexdb not reachable: " + e.getMessage());
        }

        StandardServiceRegistry registry = new StandardServiceRegistryBuilder()
                .applySetting(AvailableSettings.JAKARTA_JDBC_URL, URL)
                .applySetting(AvailableSettings.JAKARTA_JDBC_USER, USER)
                .applySetting(AvailableSettings.JAKARTA_JDBC_PASSWORD, PASS)
                .applySetting(AvailableSettings.HBM2DDL_AUTO, "none")
                .applySetting(AvailableSettings.SHOW_SQL, "true")
                // Match the app's camelCase field → snake_case column mapping.
                .applySetting(AvailableSettings.PHYSICAL_NAMING_STRATEGY,
                        "org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy")
                .build();

        try (SessionFactory sf = new MetadataSources(registry)
                .addAnnotatedClass(NotificationTemplate.class)
                .buildMetadata()
                .buildSessionFactory()) {

            String variablesJson = "[\"patient_name\",\"appointment_date\",\"appointment_time\"]";

            Long id = sf.fromTransaction(session -> {
                NotificationTemplate t = NotificationTemplate.builder()
                        .name("JSONB Test Reminder")
                        .templateKey("test.jsonb.reminder")
                        .channelType("SMS")
                        .body("Hi {{patient_name}}, your appointment is {{appointment_date}}.")
                        .isActive(true)
                        .isDefault(false)
                        .variables(variablesJson)
                        .orgAlias("jsonb-test-org")
                        .build();
                session.persist(t);
                session.flush(); // triggers the INSERT — this is where the varchar→jsonb error fired
                return t.getId();
            });
            assertNotNull(id, "template should persist and receive an id");

            try {
                // Fresh session so we read from the DB, not the persistence-context cache.
                String reloaded = sf.fromSession(session ->
                        session.find(NotificationTemplate.class, id).getVariables());
                // Postgres jsonb normalizes formatting (adds spaces after commas), so compare
                // JSON content, not the raw string. That reformatting is itself proof the value
                // was stored as real jsonb rather than an opaque varchar.
                assertEquals(variablesJson.replaceAll("\\s+", ""), reloaded.replaceAll("\\s+", ""),
                        "variables should round-trip through the jsonb column unchanged");
            } finally {
                sf.inTransaction(session ->
                        session.createMutationQuery("delete from NotificationTemplate where id = :id")
                                .setParameter("id", id)
                                .executeUpdate());
            }
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }
}
