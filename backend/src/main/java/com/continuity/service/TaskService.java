package com.continuity.service;

import com.continuity.dto.CreateTaskRequest;
import com.continuity.dto.TaskDto;
import com.continuity.dto.UpdateTaskRequest;
import com.continuity.entity.ProjectEntity;
import com.continuity.entity.TaskEntity;
import com.continuity.exception.ResourceNotFoundException;
import com.continuity.repository.ProjectRepository;
import com.continuity.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ActivityService activityService;

    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       ActivityService activityService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.activityService = activityService;
    }

    public List<TaskDto> getTasksByProject(String projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDto createTask(String projectId, CreateTaskRequest request, String currentUserId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        String taskId = "TSK-" + (100 + (int)(Math.random() * 900));
        TaskEntity task = new TaskEntity();
        task.setId(taskId);
        task.setProjectId(projectId);
        task.setTitle(request.getTitle());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "In Progress");
        task.setPriority(request.getPriority() != null ? request.getPriority() : "P1");
        task.setAssignee(request.getAssignee() != null ? request.getAssignee() : currentUserId);
        task.setDescription(request.getDescription());
        task.setCreatedAt(LocalDate.now().toString());
        task.setBlockers(request.getBlockers());
        task.setDeadline(request.getDeadline() != null ? request.getDeadline() : LocalDate.now().plusDays(7).toString());

        TaskEntity saved = taskRepository.save(task);

        activityService.recordActivity("TASK_CREATED", currentUserId, currentUserId,
                projectId, project.getName(), "Created task " + saved.getId() + ": " + saved.getTitle());

        return toDto(saved);
    }

    @Transactional
    public TaskDto updateTask(String taskId, UpdateTaskRequest request, String currentUserId) {
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        String oldStatus = task.getStatus();
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getAssignee() != null) task.setAssignee(request.getAssignee());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getBlockers() != null) task.setBlockers(request.getBlockers());
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());

        TaskEntity saved = taskRepository.save(task);

        if (request.getStatus() != null && !request.getStatus().equals(oldStatus)) {
            activityService.recordActivity("TASK_STATUS_CHANGED", currentUserId, currentUserId,
                    task.getProjectId(), task.getProjectId(), "Updated task " + task.getId() + " status from " + oldStatus + " to " + request.getStatus());
        }

        return toDto(saved);
    }

    public TaskDto toDto(TaskEntity entity) {
        return new TaskDto(
                entity.getId(),
                entity.getTitle(),
                entity.getStatus(),
                entity.getPriority(),
                entity.getAssignee(),
                entity.getDescription(),
                entity.getCreatedAt(),
                entity.getBlockers(),
                entity.getDeadline()
        );
    }
}
