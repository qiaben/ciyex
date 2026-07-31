package org.ciyex.ehr.usermgmt.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.ciyex.ehr.notification.entity.NotificationConfig;
import org.ciyex.ehr.notification.repository.NotificationConfigRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * Sends SMS using practice-specific provider config from the notification_config table.
 * Each practice configures its own SMS provider (Twilio/Vonage) in Settings &gt;
 * Notifications — there is no global fallback. Providers are called via their REST
 * APIs directly so no vendor SDK dependency is required.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final NotificationConfigRepository configRepo;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    /** Send an SMS using the org's configured provider (org from RequestContext). */
    public void sendSms(String to, String body) {
        sendSms(orgFromContext(), to, body);
    }

    /** Send an SMS with explicit orgAlias — safe to call from @Async threads. */
    public void sendSms(String orgAlias, String to, String body) {
        NotificationConfig nc = requireSmsConfig(orgAlias);
        String provider = nc.getProvider() == null ? "" : nc.getProvider().trim().toLowerCase();
        Map<String, Object> cfg = parseConfig(nc);
        String countryCode = str(cfg, "default_country_code");
        String toE164 = toE164(to, countryCode, orgAlias);
        switch (provider) {
            case "twilio" -> sendViaTwilio(orgAlias, cfg, toE164, body);
            case "vonage" -> sendViaVonage(orgAlias, cfg, toE164, body);
            default -> throw new RuntimeException(
                    "Unsupported SMS provider '" + provider + "' for practice '" + orgAlias + "'");
        }
    }

    private static final String DEFAULT_COUNTRY_CODE_DIGITS = "1";

    /**
     * Normalizes a recipient number to E.164 for Twilio/Vonage. Patient phone numbers are
     * often stored/entered without a country code (e.g. "(720) 586-7797"), which providers
     * reject (Twilio error 21211) — this strips formatting and applies the practice's
     * configured default country code (Settings &gt; Notifications &gt; SMS Configuration
     * "Default Country Code"), falling back to +1 for practices that haven't set one.
     */
    private static String toE164(String raw, String countryCode, String orgAlias) {
        if (raw == null) {
            throw new RuntimeException("Missing recipient phone number for practice '" + orgAlias + "'");
        }
        String trimmed = raw.trim();
        if (trimmed.startsWith("+")) {
            return "+" + trimmed.substring(1).replaceAll("[^0-9]", "");
        }
        String digits = trimmed.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) {
            throw new RuntimeException("Invalid recipient phone number '" + raw + "' for practice '" + orgAlias + "'");
        }
        String ccDigits = (countryCode == null || countryCode.isBlank())
                ? DEFAULT_COUNTRY_CODE_DIGITS
                : countryCode.replaceAll("[^0-9]", "");
        if (ccDigits.isEmpty()) {
            ccDigits = DEFAULT_COUNTRY_CODE_DIGITS;
        }
        // Already carries the country code (e.g. "17205551234" for +1, "917200586797" for +91) — don't double-prepend.
        if (digits.length() > 10 && digits.startsWith(ccDigits)) {
            return "+" + digits;
        }
        return "+" + ccDigits + digits;
    }

    private void sendViaTwilio(String orgAlias, Map<String, Object> cfg, String to, String body) {
        String sid = str(cfg, "account_sid");
        String token = str(cfg, "auth_token");
        String from = str(cfg, "from_number");
        if (sid == null || token == null || from == null) {
            throw new RuntimeException("Incomplete Twilio SMS configuration for practice '" + orgAlias + "'");
        }
        String auth = Base64.getEncoder()
                .encodeToString((sid + ":" + token).getBytes(StandardCharsets.UTF_8));
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("To", to);
        form.add("From", from);
        form.add("Body", body);
        try {
            restClient.post()
                    .uri("https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json", sid)
                    .header("Authorization", "Basic " + auth)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();
            log.info("SMS sent via Twilio to {} for org {}", to, orgAlias);
        } catch (Exception e) {
            log.error("Twilio SMS send failed for org {}: {}", orgAlias, e.getMessage());
            throw new RuntimeException("SMS delivery failed: " + e.getMessage(), e);
        }
    }

    private void sendViaVonage(String orgAlias, Map<String, Object> cfg, String to, String body) {
        String apiKey = str(cfg, "api_key");
        String apiSecret = str(cfg, "api_secret");
        String from = str(cfg, "from_number");
        if (apiKey == null || apiSecret == null || from == null) {
            throw new RuntimeException("Incomplete Vonage SMS configuration for practice '" + orgAlias + "'");
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("api_key", apiKey);
        form.add("api_secret", apiSecret);
        form.add("to", to);
        form.add("from", from);
        form.add("text", body);
        try {
            restClient.post()
                    .uri("https://rest.nexmo.com/sms/json")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();
            log.info("SMS sent via Vonage to {} for org {}", to, orgAlias);
        } catch (Exception e) {
            log.error("Vonage SMS send failed for org {}: {}", orgAlias, e.getMessage());
            throw new RuntimeException("SMS delivery failed: " + e.getMessage(), e);
        }
    }

    private NotificationConfig requireSmsConfig(String orgAlias) {
        var configOpt = configRepo.findByOrgAliasAndChannelType(orgAlias, "sms");
        if (configOpt.isPresent() && Boolean.TRUE.equals(configOpt.get().getEnabled())) {
            return configOpt.get();
        }
        throw new RuntimeException("No SMS configuration found for practice '" + orgAlias
                + "'. Configure SMS in Settings > Notifications.");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseConfig(NotificationConfig nc) {
        try {
            return objectMapper.readValue(nc.getConfig(), Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid SMS configuration for practice '" + nc.getOrgAlias() + "'", e);
        }
    }

    private String orgFromContext() {
        try {
            return RequestContext.get().getOrgName();
        } catch (Exception e) {
            throw new RuntimeException("Cannot determine org for SMS config — no RequestContext available");
        }
    }

    private static String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v == null) {
            return null;
        }
        String s = v.toString().trim();
        return s.isEmpty() ? null : s;
    }
}
