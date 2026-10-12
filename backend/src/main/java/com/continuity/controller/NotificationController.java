package com.continuity.controller;

import com.continuity.dto.NotificationDto;
import com.continuity.security.SecurityUtils;
import com.continuity.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Notifications", description = "Operational alerts and handoff notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/api/notifications")
    @Operation(summary = "Get user notifications and alerts")
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "recipientId", required = false) String paramRecipientId) {
        String recipientId = paramRecipientId != null ? paramRecipientId
                : (headerUserId != null ? headerUserId : SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(notificationService.getNotifications(recipientId));
    }

    @PatchMapping("/api/notifications/{id}/read")
    @Operation(summary = "Mark a notification as read (PATCH)")
    public ResponseEntity<NotificationDto> markAsReadPatch(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PostMapping("/api/notifications/{id}/read")
    @Operation(summary = "Mark a notification as read (POST)")
    public ResponseEntity<NotificationDto> markAsReadPost(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PostMapping("/api/notifications/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "recipientId", required = false) String paramRecipientId) {
        String recipientId = paramRecipientId != null ? paramRecipientId
                : (headerUserId != null ? headerUserId : SecurityUtils.getCurrentUserId());
        notificationService.markAllAsRead(recipientId);
        return ResponseEntity.ok(Map.of("status", "ok", "message", "All notifications marked as read"));
    }
}
