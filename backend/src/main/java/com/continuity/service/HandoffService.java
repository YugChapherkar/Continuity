package com.continuity.service;

import com.continuity.dto.*;
import com.continuity.entity.*;
import com.continuity.exception.BadRequestException;
import com.continuity.exception.ResourceNotFoundException;
import com.continuity.exception.UnauthorizedException;
import com.continuity.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HandoffService {

    private final HandoffRepository handoffRepository;
    private final HandoffAuditTrailRepository auditTrailRepository;
    private final ProjectRepository projectRepository;
    private final ProjectVersionRepository versionRepository;
    private final ArchitectureDecisionRepository decisionRepository;
    private final VersionFileRepository fileRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final ObjectMapper objectMapper;

    public HandoffService(HandoffRepository handoffRepository,
                          HandoffAuditTrailRepository auditTrailRepository,
                          ProjectRepository projectRepository,
                          ProjectVersionRepository versionRepository,
                          ArchitectureDecisionRepository decisionRepository,
                          VersionFileRepository fileRepository,
                          UserRepository userRepository,
                          ActivityService activityService,
                          ObjectMapper objectMapper) {
        this.handoffRepository = handoffRepository;
        this.auditTrailRepository = auditTrailRepository;
        this.projectRepository = projectRepository;
        this.versionRepository = versionRepository;
        this.decisionRepository = decisionRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
        this.objectMapper = objectMapper;
    }

    public List<HandoffDto> getAllHandoffs() {
        return handoffRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public HandoffDto getHandoffById(String handoffId) {
        HandoffEntity entity = handoffRepository.findById(handoffId)
                .orElseThrow(() -> new ResourceNotFoundException("Handoff dossier not found: " + handoffId));
        return toDto(entity);
    }

    @Transactional
    public HandoffDto createHandoff(String projectId, CreateHandoffRequest request, String currentUserId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        // Get latest pinned version
        Optional<ProjectVersionEntity> latestVerOpt = versionRepository.findFirstByIdProjectIdOrderByTimestampDesc(projectId);
        String pinnedVersionId = latestVerOpt.map(ProjectVersionEntity::getVersionId).orElse("v1.0.0");
        String pinnedVersionHash = latestVerOpt.map(ProjectVersionEntity::getHash).orElse("0000001");

        String handoffId = "HO-2026-" + (100 + (int)(Math.random() * 899));
        String nowIso = LocalDateTime.now().toString();
        String formattedDate = java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .format(java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC));
        String pseudoHash = UUID.randomUUID().toString().replace("-", "");

        List<ArchitectureDecisionEntity> decisions = decisionRepository.findByProjectId(projectId);
        List<String> decisionStrings = decisions.stream().map(d -> d.getId() + ": " + d.getTitle()).toList();

        List<VersionFileEntity> files = fileRepository.findByProjectIdAndVersionId(projectId, pinnedVersionId);
        List<String> filePaths = files.stream().map(VersionFileEntity::getPath).toList();

        HandoffEntity handoff = new HandoffEntity();
        handoff.setId(handoffId);
        handoff.setProjectId(projectId);
        handoff.setProjectName(project.getName());
        handoff.setSenderId(currentUserId);
        handoff.setRecipientId(request.getRecipientId());
        handoff.setPinnedVersionId(pinnedVersionId);
        handoff.setPinnedVersionHash(pinnedVersionHash);
        handoff.setStatus("Pending");
        handoff.setCreatedAt(nowIso);
        handoff.setNote(request.getNote() != null ? request.getNote() : "Engineering handoff for " + project.getName());
        handoff.setExecutiveSummary(request.getExecutiveSummary());

        try {
            handoff.setCompletedItemsJson(objectMapper.writeValueAsString(request.getCompletedItems()));
            handoff.setNextStepsJson(objectMapper.writeValueAsString(request.getNextSteps()));
            handoff.setCriticalBlockersJson(objectMapper.writeValueAsString(request.getCriticalBlockers()));
            handoff.setRunbookCommandsJson(objectMapper.writeValueAsString(request.getRunbookCommands()));
            handoff.setArchitecturalDecisionsJson(objectMapper.writeValueAsString(decisionStrings));
            handoff.setKeyFilesJson(objectMapper.writeValueAsString(filePaths));
        } catch (Exception e) {
            throw new BadRequestException("Failed to serialize handoff items: " + e.getMessage());
        }

        HandoffEntity saved = handoffRepository.save(handoff);

        // Add initial audit trail
        HandoffAuditTrailEntity trail = new HandoffAuditTrailEntity();
        trail.setId("HT-" + UUID.randomUUID().toString().substring(0, 8));
        trail.setHandoffId(saved.getId());
        trail.setAction("HANDOFF_INITIATED");
        trail.setActor(resolveUserName(currentUserId));
        trail.setTimestamp(formattedDate);
        trail.setDetail("Generated transfer dossier for " + project.getName() + " (version " + pinnedVersionId + ").");
        trail.setHash(pseudoHash);
        auditTrailRepository.save(trail);

        // Global activity log
        activityService.recordActivity("HANDOFF_INITIATED", currentUserId, resolveUserName(currentUserId),
                projectId, project.getName(), "Initiated handoff " + saved.getId() + " with pinned commit hash " + pinnedVersionHash);

        return toDto(saved);
    }

    @Transactional
    public HandoffDto acceptHandoff(String handoffId, AcceptHandoffRequest request, String currentUserId) {
        HandoffEntity handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() -> new ResourceNotFoundException("Handoff dossier not found: " + handoffId));

        // Authorization check: only intended recipient can accept
        if (currentUserId != null && !currentUserId.equals(handoff.getRecipientId())) {
            throw new UnauthorizedException("Only the intended recipient (" + handoff.getRecipientId() + ") can accept this handoff dossier. Current user: " + currentUserId);
        }

        if (!"Pending".equalsIgnoreCase(handoff.getStatus())) {
            throw new BadRequestException("Handoff " + handoffId + " has already been " + handoff.getStatus());
        }

        String nowIso = LocalDateTime.now().toString();
        String formattedDate = java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .format(java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC));
        String pseudoHash = UUID.randomUUID().toString().replace("-", "");
        String note = (request != null && request.getSignoffNote() != null && !request.getSignoffNote().isBlank())
                ? request.getSignoffNote()
                : "Verified losslessness, attested runbook readiness, and assumed ownership.";

        handoff.setStatus("Accepted");
        handoff.setAcceptedAt(nowIso);
        HandoffEntity saved = handoffRepository.save(handoff);

        // Append to handoff audit trail
        HandoffAuditTrailEntity trail = new HandoffAuditTrailEntity();
        trail.setId("HT-" + UUID.randomUUID().toString().substring(0, 8));
        trail.setHandoffId(saved.getId());
        trail.setAction("HANDOFF_ACCEPTED");
        trail.setActor(resolveUserName(currentUserId));
        trail.setTimestamp(formattedDate);
        trail.setDetail("Attestation: \"" + note + "\"");
        trail.setHash(pseudoHash);
        auditTrailRepository.save(trail);

        // Transfer project ownership to recipient
        ProjectEntity project = projectRepository.findById(handoff.getProjectId()).orElse(null);
        if (project != null) {
            project.setOwnerId(handoff.getRecipientId());
            project.setStatus("Active");
            project.setUpdatedAt(LocalDateTime.now());
            projectRepository.save(project);
        }

        // Global activity log
        activityService.recordActivity("HANDOFF_ACCEPTED", currentUserId, resolveUserName(currentUserId),
                handoff.getProjectId(), handoff.getProjectName(),
                "Accepted operational guardianship for dossier " + handoff.getId() + ". Primary owner transferred to " + resolveUserName(currentUserId));

        return toDto(saved);
    }

    @Transactional
    public HandoffDto requestClarification(String handoffId, RequestClarificationRequest request, String currentUserId) {
        HandoffEntity handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() -> new ResourceNotFoundException("Handoff dossier not found: " + handoffId));

        String formattedDate = java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME
                .format(java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC));
        String pseudoHash = UUID.randomUUID().toString().replace("-", "");

        HandoffAuditTrailEntity trail = new HandoffAuditTrailEntity();
        trail.setId("HT-" + UUID.randomUUID().toString().substring(0, 8));
        trail.setHandoffId(handoff.getId());
        trail.setAction("CLARIFICATION_REQUESTED");
        trail.setActor(resolveUserName(currentUserId));
        trail.setTimestamp(formattedDate);
        trail.setDetail("Clarification requested: \"" + request.getQuestion() + "\"");
        trail.setHash(pseudoHash);
        auditTrailRepository.save(trail);

        activityService.recordActivity("CLARIFICATION_REQUESTED", currentUserId, resolveUserName(currentUserId),
                handoff.getProjectId(), handoff.getProjectName(),
                "Requested clarification on handoff " + handoff.getId() + ": " + request.getQuestion());

        return toDto(handoff);
    }

    public HandoffDto toDto(HandoffEntity entity) {
        HandoffDto dto = new HandoffDto();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        dto.setProjectName(entity.getProjectName());
        dto.setSenderId(entity.getSenderId());
        dto.setRecipientId(entity.getRecipientId());
        dto.setPinnedVersionId(entity.getPinnedVersionId());
        dto.setPinnedVersionHash(entity.getPinnedVersionHash());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setAcceptedAt(entity.getAcceptedAt());
        dto.setNote(entity.getNote());

        HandoffBriefingDto briefing = new HandoffBriefingDto();
        briefing.setExecutiveSummary(entity.getExecutiveSummary());
        briefing.setCompletedItems(parseList(entity.getCompletedItemsJson()));
        briefing.setNextSteps(parseList(entity.getNextStepsJson()));
        briefing.setCriticalBlockers(parseList(entity.getCriticalBlockersJson()));
        briefing.setRunbookCommands(parseList(entity.getRunbookCommandsJson()));
        briefing.setArchitecturalDecisions(parseList(entity.getArchitecturalDecisionsJson()));
        briefing.setKeyFiles(parseList(entity.getKeyFilesJson()));
        dto.setBriefing(briefing);

        List<HandoffAuditTrailEntity> trails = auditTrailRepository.findByHandoffIdOrderByTimestampAsc(entity.getId());
        dto.setAuditTrail(trails.stream()
                .map(t -> new HandoffAuditTrailItemDto(t.getAction(), t.getActor(), t.getTimestamp(), t.getDetail(), t.getHash()))
                .collect(Collectors.toList()));

        return dto;
    }

    private List<String> parseList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String resolveUserName(String userId) {
        return userRepository.findById(userId).map(UserEntity::getName).orElse(userId);
    }
}
