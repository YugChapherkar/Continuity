package com.continuity.controller;

import com.continuity.dto.*;
import com.continuity.security.SecurityUtils;
import com.continuity.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Project workspace management")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "Get all projects")
    public ResponseEntity<List<ProjectDto>> getProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @PostMapping
    @Operation(summary = "Create a new project workspace")
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody CreateProjectRequest request,
                                                    @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        ProjectDto created = projectService.createProject(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable String projectId) {
        return ResponseEntity.ok(projectService.getProjectById(projectId));
    }

    @PatchMapping("/{projectId}")
    @Operation(summary = "Update project workspace details")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable String projectId,
                                                    @RequestBody UpdateProjectRequest request,
                                                    @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(projectService.updateProject(projectId, request, currentUserId));
    }

    @PostMapping("/{projectId}/decisions")
    @Operation(summary = "Record an Architectural Decision (ADR)")
    public ResponseEntity<ArchitectureDecisionDto> addDecision(@PathVariable String projectId,
                                                               @Valid @RequestBody CreateDecisionRequest request,
                                                               @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        ArchitectureDecisionDto created = projectService.addDecision(projectId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
