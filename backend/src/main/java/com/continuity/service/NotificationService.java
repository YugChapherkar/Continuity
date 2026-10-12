package com.continuity.service;

import com.continuity.dto.NotificationDto;
import com.continuity.entity.NotificationEntity;
import com.continuity.entity.ProjectEntity;
import com.continuity.entity.TaskEntity;
import com.continuity.entity.UserEntity;
import com.continuity.exception.ResourceNotFoundException;
import com.continuity.repository.NotificationRepository;
import com.continuity.repository.ProjectRepository;
import com.continuity.repository.TaskRepository;
import com.continuity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               TaskRepository taskRepository,
                               UserRepository userRepository,
                               ProjectRepository projectRepository) {
        this.notificationRepository = notificationRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    public List<NotificationDto> getNotifications(String recipientId) {
        syncOverdueTaskAlerts();

        List<NotificationEntity> entities;
        if (recipientId != null && !recipientId.isBlank() && !"all".equalsIgnoreCase(recipientId)) {
            entities = notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId);
        } else {
            entities = notificationRepository.findAllByOrderByTimestampDesc();
        }
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void syncOverdueTaskAlerts() {
        LocalDate today = LocalDate.now();
        List<TaskEntity> tasks = taskRepository.findAll();
        for (TaskEntity task : tasks) {
            if (task.getDeadline() != null && !task.getDeadline().isBlank() && !"Done".equalsIgnoreCase(task.getStatus())) {
                try {
                    LocalDate deadline = LocalDate.parse(task.getDeadline().trim());
                    if (deadline.isBefore(today)) {
                        String title = "Overdue: [" + task.getId() + "] " + task.getTitle();
                        String recipientId = resolveAssigneeId(task.getAssignee(), task.getProjectId());
                        if (!notificationRepository.existsByRecipientIdAndTitle(recipientId, title)) {
                            createNotification(
                                    recipientId,
                                    title,
                                    "Task [" + task.getId() + "] '" + task.getTitle() + "' was due on " + task.getDeadline() + " and remains unresolved (" + task.getStatus() + ", Priority: " + task.getPriority() + ").",
                                    "task",
                                    "/projects/" + task.getProjectId()
                            );
                        }
                    }
                } catch (Exception ignored) {
                    // ignore non-standard date formats
                }
            }
        }
    }

    private String resolveAssigneeId(String assignee, String projectId) {
        if (assignee != null && !assignee.isBlank()) {
            Optional<UserEntity> userOpt = userRepository.findAll().stream()
                    .filter(u -> u.getName().equalsIgnoreCase(assignee.trim()) || u.getId().equalsIgnoreCase(assignee.trim()))
                    .findFirst();
            if (userOpt.isPresent()) {
                return userOpt.get().getId();
            }
        }
        if (projectId != null && !projectId.isBlank()) {
            Optional<ProjectEntity> projOpt = projectRepository.findById(projectId);
            if (projOpt.isPresent()) {
                return projOpt.get().getOwnerId();
            }
        }
        return "user-jessica";
    }

    @Transactional
    public NotificationDto markAsRead(String id) {
        NotificationEntity entity = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        entity.setRead(true);
        NotificationEntity saved = notificationRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public void markAllAsRead(String recipientId) {
        List<NotificationEntity> entities;
        if (recipientId != null && !recipientId.isBlank() && !"all".equalsIgnoreCase(recipientId)) {
            entities = notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId);
        } else {
            entities = notificationRepository.findAll();
        }
        for (NotificationEntity entity : entities) {
            entity.setRead(true);
        }
        notificationRepository.saveAll(entities);
    }

    @Transactional
    public NotificationDto createNotification(String recipientId, String title, String message, String type, String link) {
        String id = "notif-" + UUID.randomUUID().toString().substring(0, 8);
        String formattedDate = DateTimeFormatter.RFC_1123_DATE_TIME
                .format(ZonedDateTime.now(ZoneOffset.UTC));

        NotificationEntity entity = new NotificationEntity(
                id,
                recipientId,
                title,
                message,
                type != null ? type : "system",
                false,
                formattedDate,
                link
        );

        NotificationEntity saved = notificationRepository.save(entity);
        return toDto(saved);
    }

    public NotificationDto toDto(NotificationEntity entity) {
        return new NotificationDto(
                entity.getId(),
                entity.getRecipientId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.isRead(),
                entity.getTimestamp(),
                entity.getLink()
        );
    }
}
