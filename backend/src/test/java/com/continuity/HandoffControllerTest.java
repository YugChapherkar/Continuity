package com.continuity;

import com.continuity.dto.AcceptHandoffRequest;
import com.continuity.dto.CreateHandoffRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class HandoffControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetHandoffs() throws Exception {
        mockMvc.perform(get("/api/handoffs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.id == 'HO-2026-089')]").exists());
    }

    @Test
    void testCreateHandoff() throws Exception {
        CreateHandoffRequest req = new CreateHandoffRequest();
        req.setRecipientId("user-sarah");
        req.setExecutiveSummary("Handing over Sentinel gateway edge routing for EMEA shift.");
        req.setNote("Review Envoy rate limiter settings.");
        req.setCompletedItems(List.of("Tested ingress TLS"));
        req.setNextSteps(List.of("Deploy canary"));
        req.setCriticalBlockers(List.of("Check rate limits"));
        req.setRunbookCommands(List.of("./bin/sentinel-status"));

        mockMvc.perform(post("/api/projects/sentinel-gateway/handoffs")
                        .header("X-User-Id", "user-jessica")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.projectId").value("sentinel-gateway"))
                .andExpect(jsonPath("$.recipientId").value("user-sarah"))
                .andExpect(jsonPath("$.status").value("Pending"))
                .andExpect(jsonPath("$.pinnedVersionId").exists())
                .andExpect(jsonPath("$.pinnedVersionHash").exists());
    }

    @Test
    void testAcceptHandoffUnauthorizedThrowsForbidden() throws Exception {
        AcceptHandoffRequest req = new AcceptHandoffRequest("Unauthorized acceptance attempt");

        // HO-2026-089 has recipient 'user-jessica'. User 'user-alex' is unauthorized to accept it
        mockMvc.perform(post("/api/handoffs/HO-2026-089/accept")
                        .header("X-User-Id", "user-alex")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAcceptHandoffAuthorizedTransfersOwnership() throws Exception {
        AcceptHandoffRequest req = new AcceptHandoffRequest("Verified runbook and assumed guardianship.");

        // HO-2026-089 has recipient 'user-jessica'.
        mockMvc.perform(post("/api/handoffs/HO-2026-089/accept")
                        .header("X-User-Id", "user-jessica")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Accepted"))
                .andExpect(jsonPath("$.acceptedAt").exists());

        // Verify project ownership transferred to Jessica
        mockMvc.perform(get("/api/projects/apollo-core"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ownerId").value("user-jessica"));
    }

    @Test
    void testValidateHandoffReadiness() throws Exception {
        CreateHandoffRequest req = new CreateHandoffRequest();
        req.setExecutiveSummary("Complete lossless handoff for Apollo Core consensus engine.");
        req.setCompletedItems(List.of("Tested io_uring journals"));
        req.setRunbookCommands(List.of("./bin/apollo-ctl status"));
        req.setNextSteps(List.of("Deploy canary node"));

        mockMvc.perform(post("/api/projects/apollo-core/handoffs/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").isNumber())
                .andExpect(jsonPath("$.ready").isBoolean())
                .andExpect(jsonPath("$.satisfiedChecks").isArray());
    }
}
