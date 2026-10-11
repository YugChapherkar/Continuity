package com.continuity.controller;

import com.continuity.dto.*;
import com.continuity.security.SecurityUtils;
import com.continuity.service.HandoffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Handoffs", description = "Digital handoff lifecycle and attestations")
public class HandoffController {

    private final HandoffService handoffService;

    public HandoffController(HandoffService handoffService) {
        this.handoffService = handoffService;
    }

    @GetMapping("/api/handoffs")
    @Operation(summary = "Get all handoff packages")
    public ResponseEntity<List<HandoffDto>> getHandoffs() {
        return ResponseEntity.ok(handoffService.getAllHandoffs());
    }

    @PostMapping("/api/projects/{projectId}/handoffs")
    @Operation(summary = "Create and dispatch a new handoff package")
    public ResponseEntity<HandoffDto> createHandoff(@PathVariable String projectId,
                                                    @Valid @RequestBody CreateHandoffRequest request,
                                                    @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        HandoffDto created = handoffService.createHandoff(projectId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api/handoffs/{handoffId}")
    @Operation(summary = "Get handoff dossier details")
    public ResponseEntity<HandoffDto> getHandoffById(@PathVariable String handoffId) {
        return ResponseEntity.ok(handoffService.getHandoffById(handoffId));
    }

    @PostMapping("/api/handoffs/{handoffId}/accept")
    @Operation(summary = "Accept handoff, attest losslessness, and assume project ownership")
    public ResponseEntity<HandoffDto> acceptHandoff(@PathVariable String handoffId,
                                                    @RequestBody(required = false) AcceptHandoffRequest request,
                                                    @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        HandoffDto accepted = handoffService.acceptHandoff(handoffId, request, currentUserId);
        return ResponseEntity.ok(accepted);
    }

    @PostMapping("/api/handoffs/{handoffId}/request-clarification")
    @Operation(summary = "Request clarification on a handoff dossier")
    public ResponseEntity<HandoffDto> requestClarification(@PathVariable String handoffId,
                                                           @Valid @RequestBody RequestClarificationRequest request,
                                                           @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String currentUserId = userId != null ? userId : SecurityUtils.getCurrentUserId();
        HandoffDto updated = handoffService.requestClarification(handoffId, request, currentUserId);
        return ResponseEntity.ok(updated);
    }
}
