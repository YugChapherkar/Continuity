package com.continuity.service;

import com.continuity.dto.AuthorDto;
import com.continuity.dto.ChangedFileDto;
import com.continuity.dto.ProjectVersionDto;
import com.continuity.entity.ProjectEntity;
import com.continuity.entity.ProjectVersionEntity;
import com.continuity.entity.ProjectVersionId;
import com.continuity.entity.UserEntity;
import com.continuity.entity.VersionFileEntity;
import com.continuity.exception.ConflictException;
import com.continuity.exception.ResourceNotFoundException;
import com.continuity.repository.ProjectRepository;
import com.continuity.repository.ProjectVersionRepository;
import com.continuity.repository.UserRepository;
import com.continuity.repository.VersionFileRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VersionService {

    private final ProjectRepository projectRepository;
    private final ProjectVersionRepository versionRepository;
    private final VersionFileRepository fileRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final RagKnowledgeService ragKnowledgeService;
    private final ActivityService activityService;

    public VersionService(ProjectRepository projectRepository,
                          ProjectVersionRepository versionRepository,
                          VersionFileRepository fileRepository,
                          UserRepository userRepository,
                          StorageService storageService,
                          RagKnowledgeService ragKnowledgeService,
                          ActivityService activityService) {
        this.projectRepository = projectRepository;
        this.versionRepository = versionRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.ragKnowledgeService = ragKnowledgeService;
        this.activityService = activityService;
    }

    public List<ProjectVersionDto> getProjectVersions(String projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        return versionRepository.findByIdProjectIdOrderByTimestampDesc(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProjectVersionDto getVersion(String projectId, String versionId) {
        ProjectVersionEntity entity = versionRepository.findByIdProjectIdAndIdId(projectId, versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Version " + versionId + " not found for project " + projectId));

        return toDto(entity);
    }

    public Resource downloadSnapshot(String projectId, String versionId) {
        ProjectVersionEntity version = versionRepository.findByIdProjectIdAndIdId(projectId, versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Version not found"));

        if (version.getSnapshotPath() == null) {
            throw new ResourceNotFoundException("Snapshot file not found on disk");
        }

        File file = new File(version.getSnapshotPath());
        if (!file.exists()) {
            throw new ResourceNotFoundException("Snapshot file missing from storage: " + version.getSnapshotPath());
        }

        return new FileSystemResource(file);
    }

    @Transactional
    public ProjectVersionDto createVersion(String projectId,
                                           MultipartFile zipArchive,
                                           String commitMessage,
                                           String baseVersionId,
                                           String currentUserId) throws IOException {

        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        // Stale base version validation (Optimistic concurrency / Branch isolation check)
        String currentLatestVersionId = project.getCurrentVersionId();
        if (baseVersionId != null && !baseVersionId.isBlank() && currentLatestVersionId != null) {
            if (!baseVersionId.equals(currentLatestVersionId)) {
                throw new ConflictException("Conflict: Provided base version (" + baseVersionId + ") is stale. Current project head is at " + currentLatestVersionId + ". Please rebase or pull latest changes before committing.");
            }
        }

        UserEntity author = userRepository.findById(currentUserId).orElse(null);
        String authorName = author != null ? author.getName() : currentUserId;
        String authorAvatar = author != null ? author.getAvatar() : "";

        // Generate semantic next version identifier
        String newVersionId = generateNextVersionId(currentLatestVersionId);
        String hash = UUID.randomUUID().toString().substring(0, 7);

        // Store complete snapshot archive
        File snapshotArchive = storageService.saveSnapshotArchive(projectId, newVersionId, zipArchive);

        // Extract and inspect files
        StorageService.ExtractionResult extraction = storageService.extractAndInspectArchive(snapshotArchive, projectId, newVersionId);

        // Compute diff against parent snapshot
        List<VersionFileEntity> parentFiles = (currentLatestVersionId != null)
                ? fileRepository.findByProjectIdAndVersionId(projectId, currentLatestVersionId)
                : new ArrayList<>();

        List<ChangedFileDto> changedFiles = storageService.computeFileDifferences(extraction.fileEntities, parentFiles);

        // Save file entities
        fileRepository.saveAll(extraction.fileEntities);

        // Save version record
        ProjectVersionEntity versionEntity = new ProjectVersionEntity();
        versionEntity.setId(new ProjectVersionId(projectId, newVersionId));
        versionEntity.setHash(hash);
        versionEntity.setParentVersionId(currentLatestVersionId);
        versionEntity.setTimestamp(LocalDateTime.now().toString());
        versionEntity.setAuthorName(authorName);
        versionEntity.setAuthorAvatar(authorAvatar);
        versionEntity.setCommitMessage(commitMessage);
        versionEntity.setChangedFilesCount(changedFiles.size());
        versionEntity.setSnapshotPath(snapshotArchive.getAbsolutePath());
        versionEntity.setIndexingStatus("READY");

        versionRepository.save(versionEntity);

        // Update project latest version
        project.setCurrentVersionId(newVersionId);
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);

        // Asynchronously or immediately index in RAG
        ragKnowledgeService.indexVersionFiles(projectId, newVersionId, extraction.fileEntities);

        // Record audit activity
        activityService.recordActivity("VERSION_PINNED", currentUserId, authorName,
                projectId, project.getName(), "Committed version " + newVersionId + " (" + hash + "): " + commitMessage);

        ProjectVersionDto dto = toDto(versionEntity);
        dto.setChangedFiles(changedFiles);
        return dto;
    }

    private String generateNextVersionId(String currentVersion) {
        if (currentVersion == null || !currentVersion.startsWith("v")) {
            return "v1.0.1";
        }
        try {
            String[] parts = currentVersion.substring(1).split("\\.");
            if (parts.length == 3) {
                int patch = Integer.parseInt(parts[2]) + 1;
                return "v" + parts[0] + "." + parts[1] + "." + patch;
            }
        } catch (Exception ignored) {}
        return currentVersion + "-1";
    }

    public ProjectVersionDto toDto(ProjectVersionEntity entity) {
        return new ProjectVersionDto(
                entity.getVersionId(),
                entity.getHash(),
                entity.getTimestamp(),
                new AuthorDto(entity.getAuthorName(), entity.getAuthorAvatar()),
                entity.getCommitMessage(),
                entity.getChangedFilesCount() != null ? entity.getChangedFilesCount() : 0,
                new ArrayList<>(),
                entity.getIndexingStatus()
        );
    }
}
