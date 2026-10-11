package com.continuity.controller;

import com.continuity.dto.AuditLogEntryDto;
import com.continuity.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Tag(name = "Activity", description = "Verifiable audit logs and activity timelines")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/api/activity")
    @Operation(summary = "Get global immutable audit activity log")
    public ResponseEntity<List<AuditLogEntryDto>> getAllActivity() {
        return ResponseEntity.ok(activityService.getAllActivity());
    }

    @GetMapping("/api/projects/{projectId}/activity")
    @Operation(summary = "Get project-specific activity history")
    public ResponseEntity<List<AuditLogEntryDto>> getProjectActivity(@PathVariable String projectId) {
        return ResponseEntity.ok(activityService.getProjectActivity(projectId));
    }
}
