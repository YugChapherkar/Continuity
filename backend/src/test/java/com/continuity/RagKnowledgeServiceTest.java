package com.continuity;

import com.continuity.dto.ChatRequestDto;
import com.continuity.dto.ChatResponseDto;
import com.continuity.dto.KnowledgeStatusDto;
import com.continuity.service.RagKnowledgeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class RagKnowledgeServiceTest {

    @Autowired
    private RagKnowledgeService ragKnowledgeService;

    @Test
    void testGetKnowledgeStatus() {
        KnowledgeStatusDto status = ragKnowledgeService.getIndexStatus("apollo-core", "v2.4.0");
        assertNotNull(status);
        assertEquals("apollo-core", status.getProjectId());
    }

    @Test
    void testQueryProjectChatReturnsGroundedCitations() {
        ChatRequestDto request = new ChatRequestDto(
                "Explain ADR-041 follower read barrier invariants",
                "v2.4.0",
                null
        );

        ChatResponseDto response = ragKnowledgeService.processChatQuery("apollo-core", request);
        assertNotNull(response);
        assertNotNull(response.getResponse());
        assertTrue(response.getResponse().contains("ADR-041"));
        assertFalse(response.getCitations().isEmpty());
        assertTrue(response.getCitations().contains("ADR-041"));
        assertEquals("v2.4.0", response.getPinnedVersionId());
    }

    @Test
    void testQueryWithHandoffPinsExactVersionContext() {
        ChatRequestDto request = new ChatRequestDto(
                "What are the critical blockers before deployment?",
                null,
                "HO-2026-089"
        );

        ChatResponseDto response = ragKnowledgeService.processChatQuery("apollo-core", request);
        assertNotNull(response);
        assertTrue(response.getResponse().contains("Blocker") || response.getResponse().contains("ulimit") || response.getResponse().contains("Chaos Mesh"));
        assertEquals("v2.4.0", response.getPinnedVersionId());
    }

    @Test
    void testReindexProjectUpdatesFileCount() {
        KnowledgeStatusDto status = ragKnowledgeService.reindexProject("apollo-core", "v2.4.0");
        assertNotNull(status);
        assertEquals("apollo-core", status.getProjectId());
        assertEquals("READY", status.getStatus());
        assertTrue(status.getFileCount() >= 0);
    }

    @Test
    void testQueryTeamMembersReturnsCustodianshipMatrix() {
        ChatRequestDto request = new ChatRequestDto(
                "Who are the assigned custodians like Jessica and Yash?",
                null,
                null
        );

        ChatResponseDto response = ragKnowledgeService.processChatQuery("apollo-core", request);
        assertNotNull(response);
        assertTrue(response.getResponse().contains("Jessicaa Chauhab") || response.getResponse().contains("Yash Lokhande"));
    }
}
