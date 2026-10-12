package com.continuity.service;

import com.continuity.dto.*;
import com.continuity.entity.*;
import com.continuity.exception.ResourceNotFoundException;
import com.continuity.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectVersionRepository versionRepository;
    private final ArchitectureDecisionRepository decisionRepository;
    private final TaskRepository taskRepository;
    private final VersionFileRepository fileRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectVersionRepository versionRepository,
                          ArchitectureDecisionRepository decisionRepository,
                          TaskRepository taskRepository,
                          VersionFileRepository fileRepository,
                          UserRepository userRepository,
                          ActivityService activityService) {
        this.projectRepository = projectRepository;
        this.versionRepository = versionRepository;
        this.decisionRepository = decisionRepository;
        this.taskRepository = taskRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProjectDto getProjectById(String projectId) {
        ProjectEntity entity = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        return toDto(entity);
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request, String currentUserId) {
        String id = (request.getId() != null && !request.getId().isBlank())
                ? request.getId()
                : request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");

        ProjectEntity project = new ProjectEntity();
        project.setId(id);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus() != null ? request.getStatus() : "Active");
        project.setOwnerId(currentUserId);
        project.setTeam(request.getTeam() != null ? request.getTeam() : "Core Engineering");
        project.setRepositoryUrl(request.getRepositoryUrl());
        project.setArchitectureSummary(request.getArchitectureSummary());
        project.setQuickstartGuide(request.getQuickstartGuide());
        project.setCurrentVersionId("v1.0.0");
        project.setUpdatedAt(LocalDateTime.now());

        ProjectEntity saved = projectRepository.save(project);

        // Initial default version
        ProjectVersionEntity initialVersion = new ProjectVersionEntity();
        initialVersion.setId(new ProjectVersionId(saved.getId(), "v1.0.0"));
        initialVersion.setHash("0000001");
        initialVersion.setTimestamp(LocalDateTime.now().toString());
        initialVersion.setAuthorName(resolveUserName(currentUserId));
        initialVersion.setAuthorAvatar("");
        initialVersion.setCommitMessage("feat: initialize project workspace");
        initialVersion.setChangedFilesCount(0);
        initialVersion.setIndexingStatus("READY");
        versionRepository.save(initialVersion);

        activityService.recordActivity("PROJECT_CREATED", currentUserId, resolveUserName(currentUserId),
                saved.getId(), saved.getName(), "Initialized project workspace " + saved.getName());

        return toDto(saved);
    }

    @Transactional
    public ProjectDto updateProject(String projectId, UpdateProjectRequest request, String currentUserId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getOwnerId() != null) project.setOwnerId(request.getOwnerId());
        if (request.getTeam() != null) project.setTeam(request.getTeam());
        if (request.getRepositoryUrl() != null) project.setRepositoryUrl(request.getRepositoryUrl());
        if (request.getArchitectureSummary() != null) project.setArchitectureSummary(request.getArchitectureSummary());
        if (request.getQuickstartGuide() != null) project.setQuickstartGuide(request.getQuickstartGuide());
        project.setUpdatedAt(LocalDateTime.now());

        ProjectEntity saved = projectRepository.save(project);
        activityService.recordActivity("PROJECT_UPDATED", currentUserId, resolveUserName(currentUserId),
                saved.getId(), saved.getName(), "Updated configuration for " + saved.getName());

        return toDto(saved);
    }

    @Transactional
    public ArchitectureDecisionDto addDecision(String projectId, CreateDecisionRequest request, String currentUserId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        String id = "ADR-0" + (45 + (int)(Math.random() * 50));
        ArchitectureDecisionEntity decision = new ArchitectureDecisionEntity();
        decision.setId(id);
        decision.setProjectId(projectId);
        decision.setTitle(request.getTitle());
        decision.setDate(request.getDate() != null ? request.getDate() : LocalDateTime.now().toLocalDate().toString());
        decision.setContext(request.getContext());
        decision.setDecision(request.getDecision());
        decision.setConsequences(request.getConsequences());
        decision.setStatus(request.getStatus() != null ? request.getStatus() : "Accepted");

        ArchitectureDecisionEntity saved = decisionRepository.save(decision);

        activityService.recordActivity("ADR_REGISTERED", currentUserId, resolveUserName(currentUserId),
                projectId, resolveProjectName(projectId), "Registered " + saved.getId() + ": " + saved.getTitle());

        return new ArchitectureDecisionDto(saved.getId(), saved.getTitle(), saved.getDate(),
                saved.getContext(), saved.getDecision(), saved.getConsequences(), saved.getStatus());
    }

    public ProjectDto toDto(ProjectEntity entity) {
        ProjectDto dto = new ProjectDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setCurrentVersionId(entity.getCurrentVersionId());
        dto.setOwnerId(entity.getOwnerId());
        dto.setTeam(entity.getTeam());
        dto.setRepositoryUrl(entity.getRepositoryUrl());
        dto.setArchitectureSummary(entity.getArchitectureSummary());
        dto.setQuickstartGuide(entity.getQuickstartGuide());
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : LocalDateTime.now().toString());

        // Attach decisions
        dto.setDecisions(decisionRepository.findByProjectId(entity.getId()).stream()
                .map(d -> new ArchitectureDecisionDto(d.getId(), d.getTitle(), d.getDate(), d.getContext(), d.getDecision(), d.getConsequences(), d.getStatus()))
                .collect(Collectors.toList()));

        // Attach versions
        dto.setVersions(versionRepository.findByIdProjectIdOrderByTimestampDesc(entity.getId()).stream()
                .map(v -> new ProjectVersionDto(
                        v.getVersionId(),
                        v.getHash(),
                        v.getTimestamp(),
                        new AuthorDto(v.getAuthorName(), v.getAuthorAvatar()),
                        v.getCommitMessage(),
                        v.getChangedFilesCount() != null ? v.getChangedFilesCount() : 0,
                        new ArrayList<>(),
                        v.getIndexingStatus()
                ))
                .collect(Collectors.toList()));

        // Attach tasks
        dto.setTasks(taskRepository.findByProjectId(entity.getId()).stream()
                .map(t -> new TaskDto(t.getId(), t.getTitle(), t.getStatus(), t.getPriority(), t.getAssignee(), t.getDescription(), t.getCreatedAt(), t.getBlockers(), t.getDeadline()))
                .collect(Collectors.toList()));

        // Attach files for latest version
        String activeVersion = entity.getCurrentVersionId() != null ? entity.getCurrentVersionId() : "v1.0.0";
        List<VersionFileEntity> files = fileRepository.findByProjectIdAndVersionId(entity.getId(), activeVersion);
        if (files.isEmpty()) {
            files = fileRepository.findByProjectId(entity.getId());
        }
        dto.setFiles(files.stream()
                .map(f -> new ProjectFileDto(f.getName(), f.getPath(), (f.getSizeBytes() / 1024) + " KB", f.getFileType(), f.getContentSnippet()))
                .collect(Collectors.toList()));

        return dto;
    }

    private String resolveUserName(String userId) {
        return userRepository.findById(userId).map(UserEntity::getName).orElse(userId);
    }

    private String resolveProjectName(String projectId) {
        return projectRepository.findById(projectId).map(ProjectEntity::getName).orElse(projectId);
    }
}
