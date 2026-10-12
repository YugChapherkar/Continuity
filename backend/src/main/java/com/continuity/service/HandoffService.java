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
    private final TaskRepository taskRepository;
    private final ActivityService activityService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public HandoffService(HandoffRepository handoffRepository,
                          HandoffAuditTrailRepository auditTrailRepository,
                          ProjectRepository projectRepository,
                          ProjectVersionRepository versionRepository,
                          ArchitectureDecisionRepository decisionRepository,
                          VersionFileRepository fileRepository,
                          UserRepository userRepository,
                          TaskRepository taskRepository,
                          ActivityService activityService,
                          NotificationService notificationService,
                          ObjectMapper objectMapper) {
        this.handoffRepository = handoffRepository;
        this.auditTrailRepository = auditTrailRepository;
        this.projectRepository = projectRepository;
        this.versionRepository = versionRepository;
        this.decisionRepository = decisionRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.activityService = activityService;
        this.notificationService = notificationService;
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

        int score = calculateCompletenessScore(projectId, request);
        handoff.setCompletenessScore(score);

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
        trail.setDetail("Generated transfer dossier for " + project.getName() + " (version " + pinnedVersionId + ", completeness: " + score + "%).");
        trail.setHash(pseudoHash);
        auditTrailRepository.save(trail);

        // Global activity log
        activityService.recordActivity("HANDOFF_INITIATED", currentUserId, resolveUserName(currentUserId),
                projectId, project.getName(), "Initiated handoff " + saved.getId() + " with pinned commit hash " + pinnedVersionHash);

        // Send operational alert to recipient
        notificationService.createNotification(
                request.getRecipientId(),
                "Handoff Awaiting Sign-off",
                "Handoff package " + saved.getId() + " for " + project.getName() + " was assigned to you by " + resolveUserName(currentUserId) + " (Completeness: " + score + "%).",
                "handoff",
                "/handoffs/" + saved.getId()
        );

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

        // Send operational alert to previous owner / sender
        notificationService.createNotification(
                handoff.getSenderId(),
                "Handoff Accepted",
                resolveUserName(currentUserId) + " accepted ownership of " + handoff.getProjectName() + " (Dossier " + handoff.getId() + ").",
                "handoff",
                "/handoffs/" + handoff.getId()
        );

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

        // Send operational alert to sender
        notificationService.createNotification(
                handoff.getSenderId(),
                "Clarification Requested",
                resolveUserName(currentUserId) + " requested clarification on " + handoff.getId() + ": \"" + request.getQuestion() + "\"",
                "handoff",
                "/handoffs/" + handoff.getId()
        );

        return toDto(handoff);
    }

    public int calculateCompletenessScore(String projectId, CreateHandoffRequest request) {
        if (request == null) return 0;
        int score = 0;

        // 1. Executive summary present & >50 chars (+30%)
        if (request.getExecutiveSummary() != null && request.getExecutiveSummary().trim().length() > 50) {
            score += 30;
        } else if (request.getExecutiveSummary() != null && request.getExecutiveSummary().trim().length() >= 20) {
            score += 15;
        }

        // 2. At least 1 verified completion item (+25%)
        if (request.getCompletedItems() != null && !request.getCompletedItems().isEmpty()) {
            score += 25;
        }

        // 3. Non-empty runbook commands (+25%)
        if (request.getRunbookCommands() != null && !request.getRunbookCommands().isEmpty()) {
            score += 25;
        }

        // 4. All pending tasks assigned with set deadlines (+20%)
        boolean tasksCompliant = true;
        if (projectId != null && !projectId.isBlank()) {
            List<TaskEntity> projectTasks = taskRepository.findByProjectId(projectId);
            for (TaskEntity task : projectTasks) {
                if (!"Done".equalsIgnoreCase(task.getStatus())) {
                    if (task.getAssignee() == null || task.getAssignee().isBlank() ||
                        "Unassigned".equalsIgnoreCase(task.getAssignee()) ||
                        task.getDeadline() == null || task.getDeadline().isBlank()) {
                        tasksCompliant = false;
                        break;
                    }
                }
            }
        }
        if (tasksCompliant && ((request.getNextSteps() != null && !request.getNextSteps().isEmpty()) || (projectId != null && !projectId.isBlank()))) {
            score += 20;
        }

        return Math.min(100, score);
    }

    public int calculateCompletenessScore(CreateHandoffRequest request) {
        return calculateCompletenessScore(null, request);
    }

    public HandoffReadinessDto validateHandoffReadiness(String projectId, CreateHandoffRequest request) {
        int score = calculateCompletenessScore(projectId, request);
        List<String> warnings = new ArrayList<>();
        List<String> satisfiedChecks = new ArrayList<>();

        if (request.getExecutiveSummary() == null || request.getExecutiveSummary().trim().length() <= 50) {
            warnings.add("Executive summary is under 50 characters; detailed operational context recommended.");
        } else {
            satisfiedChecks.add("Executive briefing depth verified (" + request.getExecutiveSummary().trim().length() + " chars > 50 chars).");
        }

        if (request.getCompletedItems() == null || request.getCompletedItems().isEmpty()) {
            warnings.add("Completed milestones or verified tests are missing.");
        } else {
            satisfiedChecks.add("Completed milestones verified (" + request.getCompletedItems().size() + " items).");
        }

        if (request.getRunbookCommands() == null || request.getRunbookCommands().isEmpty()) {
            warnings.add("Runbook verification commands are missing. Recipient lacks immediate diagnostic tools.");
        } else {
            satisfiedChecks.add("Runbook commands verified (" + request.getRunbookCommands().size() + " commands).");
        }

        if (request.getNextSteps() == null || request.getNextSteps().isEmpty()) {
            warnings.add("Immediate next steps are missing. Shift continuity may stall.");
        } else {
            satisfiedChecks.add("Immediate next steps defined (" + request.getNextSteps().size() + " steps).");
        }

        // Project-level checks: unassigned or critical blockers
        List<TaskEntity> projectTasks = taskRepository.findByProjectId(projectId);
        long unresolvedP0 = projectTasks.stream()
                .filter(t -> ("P0".equalsIgnoreCase(t.getPriority()) || "Critical".equalsIgnoreCase(t.getStatus())) && !"Done".equalsIgnoreCase(t.getStatus()))
                .count();
        if (unresolvedP0 > 0) {
            warnings.add(unresolvedP0 + " critical P0 task(s) currently unresolved in project workspace.");
        } else {
            satisfiedChecks.add("All P0 critical tasks in project workspace resolved or verified.");
        }

        long unassigned = projectTasks.stream()
                .filter(t -> t.getAssignee() == null || t.getAssignee().trim().isEmpty() || "Unassigned".equalsIgnoreCase(t.getAssignee()))
                .count();
        if (unassigned > 0) {
            warnings.add(unassigned + " task(s) in workspace are currently unassigned.");
        }

        boolean ready = score >= 75 && unresolvedP0 == 0;
        return new HandoffReadinessDto(score, ready, warnings, satisfiedChecks);
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
        dto.setCompletenessScore(entity.getCompletenessScore() != null ? entity.getCompletenessScore() : 100);

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
