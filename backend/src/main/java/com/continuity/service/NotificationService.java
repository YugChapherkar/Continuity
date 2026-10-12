package com.continuity.service;

import com.continuity.dto.NotificationDto;
import com.continuity.entity.NotificationEntity;
import com.continuity.exception.ResourceNotFoundException;
import com.continuity.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationDto> getNotifications(String recipientId) {
        List<NotificationEntity> entities;
        if (recipientId != null && !recipientId.isBlank() && !"all".equalsIgnoreCase(recipientId)) {
            entities = notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId);
        } else {
            entities = notificationRepository.findAllByOrderByTimestampDesc();
        }
        return entities.stream().map(this::toDto).collect(Collectors.toList());
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
