package com.continuity.controller;

import com.continuity.dto.ProjectVersionDto;
import com.continuity.security.SecurityUtils;
import com.continuity.service.VersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/versions")
@Tag(name = "Versions", description = "Project snapshot and commit versioning")
public class VersionController {

    private final VersionService versionService;

    public VersionController(VersionService versionService) {
        this.versionService = versionService;
    }

    @GetMapping
    @Operation(summary = "Get version history for project")
    public ResponseEntity<List<ProjectVersionDto>> getVersions(@PathVariable String projectId) {
        return ResponseEntity.ok(versionService.getProjectVersions(projectId));
    }

    @GetMapping("/{versionId}")
    @Operation(summary = "Get specific version record")
    public ResponseEntity<ProjectVersionDto> getVersion(@PathVariable String projectId,
                                                        @PathVariable String versionId) {
        return ResponseEntity.ok(versionService.getVersion(projectId, versionId));
    }

    @GetMapping("/{versionId}/download")
    @Operation(summary = "Download complete project ZIP snapshot")
    public ResponseEntity<Resource> downloadSnapshot(@PathVariable String projectId,
                                                     @PathVariable String versionId) {
        Resource resource = versionService.downloadSnapshot(projectId, versionId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + projectId + "-" + versionId + ".zip\"")
                .body(resource);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and commit a new project snapshot version")
    public ResponseEntity<ProjectVersionDto> uploadVersion(
            @PathVariable String projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("commitMessage") String commitMessage,
            @RequestParam(value = "baseVersionId", required = false) String baseVersionId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) throws IOException {

        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        ProjectVersionDto created = versionService.createVersion(projectId, file, commitMessage, baseVersionId, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
