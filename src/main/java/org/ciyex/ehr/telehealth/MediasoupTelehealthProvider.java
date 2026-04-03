package org.ciyex.ehr.telehealth;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.client.TelehealthServiceClient;
import org.ciyex.sdk.telehealth.TelehealthProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

/**
 * Mediasoup-backed implementation of the SDK TelehealthProvider interface.
 * Delegates HTTP calls to the ciyex-telehealth microservice via TelehealthServiceClient.
 */
@Component
@Slf4j
public class MediasoupTelehealthProvider implements TelehealthProvider {

    private final TelehealthServiceClient telehealthClient;
    private final ObjectMapper objectMapper;

    @Value("${services.telehealth-public-url:${services.telehealth-url:http://localhost:8088}}")
    private String telehealthPublicUrl;

    public MediasoupTelehealthProvider(TelehealthServiceClient telehealthClient, ObjectMapper objectMapper) {
        this.telehealthClient = telehealthClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public String vendorId() {
        return "mediasoup";
    }

    @Override
    public SessionResult createSession(SessionRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("orgAlias", request.orgAlias());
        body.put("encounterId", request.encounterId());
        if (request.patient() != null) {
            body.put("patientId", request.patient().patientId());
            body.put("patientName", request.patient().firstName() + " " + request.patient().lastName());
        }
        if (request.provider() != null) {
            body.put("providerId", request.provider().providerId());
            body.put("providerName", request.provider().name());
        }
        body.put("recordingEnabled", request.recordingEnabled());
        body.put("waitingRoomEnabled", request.waitingRoomEnabled());
        body.put("screenShareEnabled", request.screenShareEnabled());
        body.put("maxDurationMinutes", request.maxDurationMinutes());
        if (request.metadata() != null) {
            body.putAll(request.metadata());
        }

        Object result = telehealthClient.createSession(body);
        return toSessionResult(result);
    }

    @Override
    public JoinToken generateJoinToken(String sessionId, Participant participant) {
        // Retrieve session details and build join info for the participant
        Object session = telehealthClient.getSession(sessionId);
        Map<String, Object> sessionMap = toMap(session);

        String roomName = getString(sessionMap, "roomName");
        String wsUrl = telehealthPublicUrl.replaceFirst("^http", "ws") + "/ws/telehealth";
        String joinUrl = wsUrl + "?room=" + roomName + "&peerId=" + participant.userId() + "&role=" + participant.role();

        return new JoinToken(
                sessionId + ":" + participant.userId(),
                joinUrl,
                Instant.now().plusSeconds(3600)
        );
    }

    @Override
    public void endSession(String sessionId) {
        telehealthClient.endSession(sessionId);
    }

    @Override
    public SessionStatus getSessionStatus(String sessionId) {
        Object result = telehealthClient.getSession(sessionId);
        Map<String, Object> map = toMap(result);

        List<String> participants = new ArrayList<>();
        Object participantData = map.get("participants");
        if (participantData instanceof List<?> list) {
            for (Object p : list) {
                if (p instanceof Map<?, ?> pm) {
                    String name = pm.get("name") != null ? pm.get("name").toString() : pm.get("id").toString();
                    participants.add(name);
                } else if (p instanceof String s) {
                    participants.add(s);
                }
            }
        }

        return new SessionStatus(
                sessionId,
                getString(map, "status"),
                parseInstant(map.get("startedAt")),
                parseInstant(map.get("endedAt")),
                getInt(map, "durationSeconds"),
                participants
        );
    }

    @Override
    public RecordingInfo getRecording(String sessionId) {
        Object result = telehealthClient.getRecordings(sessionId);

        // The recordings endpoint may return a list; take the first recording
        if (result instanceof List<?> list && !list.isEmpty()) {
            Map<String, Object> rec = toMap(list.getFirst());
            return new RecordingInfo(
                    getString(rec, "id"),
                    sessionId,
                    getString(rec, "url"),
                    getString(rec, "storagePath"),
                    getInt(rec, "durationSeconds"),
                    getLong(rec, "sizeBytes")
            );
        }

        Map<String, Object> rec = toMap(result);
        return new RecordingInfo(
                getString(rec, "id"),
                sessionId,
                getString(rec, "url"),
                getString(rec, "storagePath"),
                getInt(rec, "durationSeconds"),
                getLong(rec, "sizeBytes")
        );
    }

    @Override
    public ConnectionStatus testConnection(Map<String, String> config) {
        try {
            // Use the health endpoint of the telehealth service
            telehealthClient.getSession("health-check-ping");
            return new ConnectionStatus(true, "Connected to mediasoup telehealth service");
        } catch (Exception e) {
            // A 404 for a non-existent session still proves connectivity
            if (e.getMessage() != null && e.getMessage().contains("404")) {
                return new ConnectionStatus(true, "Connected to mediasoup telehealth service");
            }
            return new ConnectionStatus(false, "Failed to connect: " + e.getMessage());
        }
    }

    // ---- Mapping helpers ----

    private SessionResult toSessionResult(Object obj) {
        Map<String, Object> map = toMap(obj);
        return new SessionResult(
                getString(map, "id"),
                getString(map, "roomName"),
                telehealthPublicUrl,
                telehealthPublicUrl,
                parseInstant(map.get("createdAt")),
                parseInstant(map.get("expiresAt"))
        );
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(Object obj) {
        if (obj instanceof Map) {
            return (Map<String, Object>) obj;
        }
        return objectMapper.convertValue(obj, Map.class);
    }

    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : null;
    }

    private int getInt(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof Number n) return n.intValue();
        if (val instanceof String s) {
            try { return Integer.parseInt(s); } catch (NumberFormatException e) { return 0; }
        }
        return 0;
    }

    private long getLong(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof Number n) return n.longValue();
        if (val instanceof String s) {
            try { return Long.parseLong(s); } catch (NumberFormatException e) { return 0L; }
        }
        return 0L;
    }

    private Instant parseInstant(Object val) {
        if (val == null) return null;
        if (val instanceof Instant i) return i;
        try {
            return Instant.parse(val.toString());
        } catch (Exception e) {
            return null;
        }
    }
}
