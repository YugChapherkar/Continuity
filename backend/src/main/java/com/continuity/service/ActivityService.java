package com.continuity.service;

import com.continuity.dto.AuditLogEntryDto;
import com.continuity.entity.ActivityLogEntity;
import com.continuity.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public List<AuditLogEntryDto> getAllActivity() {
        return activityLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AuditLogEntryDto> getProjectActivity(String projectId) {
        return activityLogRepository.findByProjectIdOrderByTimestampDesc(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ActivityLogEntity recordActivity(String action, String actorId, String actorName,
                                            String projectId, String projectName, String detail) {
        Optional<ActivityLogEntity> lastLog = activityLogRepository.findFirstByOrderByTimestampDesc();
        String prevHash = lastLog.map(ActivityLogEntity::getHash).orElse("00000000000000000000000000000000");

        String formattedDate = java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .format(java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC));
        String id = "AUDIT-" + (8900 + (int)(Math.random() * 1000));

        String rawContent = prevHash + ":" + action + ":" + actorId + ":" + projectId + ":" + detail + ":" + System.currentTimeMillis();
        String hash = computeSha256(rawContent);

        ActivityLogEntity entry = new ActivityLogEntity();
        entry.setId(id);
        entry.setTimestamp(formattedDate);
        entry.setPrevHash(prevHash);
        entry.setHash(hash);
        entry.setAction(action);
        entry.setActorId(actorId);
        entry.setActorName(actorName);
        entry.setProjectId(projectId);
        entry.setProjectName(projectName);
        entry.setDetail(detail);
        entry.setVerifiable(true);

        return activityLogRepository.save(entry);
    }

    public AuditLogEntryDto toDto(ActivityLogEntity e) {
        return new AuditLogEntryDto(
                e.getId(),
                e.getTimestamp(),
                e.getHash(),
                e.getPrevHash(),
                e.getAction(),
                e.getActorId(),
                e.getActorName(),
                e.getProjectId(),
                e.getProjectName(),
                e.getDetail(),
                e.getVerifiable() != null ? e.getVerifiable() : true
        );
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString();
        } catch (Exception ex) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
