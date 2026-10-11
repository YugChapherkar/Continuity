package com.continuity.controller;

import com.continuity.dto.ChatRequestDto;
import com.continuity.dto.ChatResponseDto;
import com.continuity.dto.KnowledgeStatusDto;
import com.continuity.service.RagKnowledgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Knowledge & RAG", description = "Project knowledge indexing and Gemini File Search RAG queries")
public class KnowledgeController {

    private final RagKnowledgeService ragKnowledgeService;

    public KnowledgeController(RagKnowledgeService ragKnowledgeService) {
        this.ragKnowledgeService = ragKnowledgeService;
    }

    @GetMapping("/api/projects/{projectId}/knowledge/status")
    @Operation(summary = "Check indexing status of project knowledge")
    public ResponseEntity<KnowledgeStatusDto> getKnowledgeStatus(@PathVariable String projectId,
                                                                 @RequestParam(value = "versionId", required = false) String versionId) {
        return ResponseEntity.ok(ragKnowledgeService.getIndexStatus(projectId, versionId));
    }

    @PostMapping("/api/projects/{projectId}/knowledge/import")
    @Operation(summary = "Trigger knowledge re-indexing for project")
    public ResponseEntity<KnowledgeStatusDto> triggerKnowledgeImport(@PathVariable String projectId,
                                                                     @RequestParam(value = "versionId", required = false) String versionId) {
        return ResponseEntity.ok(ragKnowledgeService.getIndexStatus(projectId, versionId));
    }

    @PostMapping("/api/projects/{projectId}/chat")
    @Operation(summary = "Query project-specific RAG knowledge base")
    public ResponseEntity<ChatResponseDto> projectChat(@PathVariable String projectId,
                                                       @Valid @RequestBody ChatRequestDto request) {
        return ResponseEntity.ok(ragKnowledgeService.processChatQuery(projectId, request));
    }

    @PostMapping("/api/assistant/chat")
    @Operation(summary = "Terminal AI assistant chat endpoint")
    public ResponseEntity<ChatResponseDto> generalAssistantChat(@Valid @RequestBody ChatRequestDto request,
                                                                @RequestParam(value = "projectId", required = false, defaultValue = "apollo-core") String projectId) {
        return ResponseEntity.ok(ragKnowledgeService.processChatQuery(projectId, request));
    }
}
