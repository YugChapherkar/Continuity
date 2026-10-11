package com.continuity.controller;

import com.continuity.dto.CreateTaskRequest;
import com.continuity.dto.TaskDto;
import com.continuity.dto.UpdateTaskRequest;
import com.continuity.security.SecurityUtils;
import com.continuity.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Tasks", description = "Task and action item management")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/api/projects/{projectId}/tasks")
    @Operation(summary = "Get tasks for a project")
    public ResponseEntity<List<TaskDto>> getTasks(@PathVariable String projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @PostMapping("/api/projects/{projectId}/tasks")
    @Operation(summary = "Create task for a project")
    public ResponseEntity<TaskDto> createTask(@PathVariable String projectId,
                                              @Valid @RequestBody CreateTaskRequest request,
                                              @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        TaskDto created = taskService.createTask(projectId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/api/tasks/{taskId}")
    @Operation(summary = "Update task status, assignee, priority, or blockers")
    public ResponseEntity<TaskDto> updateTask(@PathVariable String taskId,
                                              @RequestBody UpdateTaskRequest request,
                                              @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(taskService.updateTask(taskId, request, currentUserId));
    }
}
