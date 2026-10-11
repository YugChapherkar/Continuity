package com.continuity;

import com.continuity.dto.CreateProjectRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetHealth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void testGetProjects() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("apollo-core"));
    }

    @Test
    void testGetProjectById() throws Exception {
        mockMvc.perform(get("/api/projects/apollo-core"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Apollo Core Distributed Consensus"))
                .andExpect(jsonPath("$.decisions").isArray())
                .andExpect(jsonPath("$.versions").isArray())
                .andExpect(jsonPath("$.tasks").isArray());
    }

    @Test
    void testCreateProject() throws Exception {
        CreateProjectRequest req = new CreateProjectRequest();
        req.setId("test-sentinel-v2");
        req.setName("Test Sentinel V2");
        req.setDescription("Unit test generated project");
        req.setStatus("Active");
        req.setTeam("Test Team");

        mockMvc.perform(post("/api/projects")
                        .header("X-User-Id", "user-jessica")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("test-sentinel-v2"))
                .andExpect(jsonPath("$.name").value("Test Sentinel V2"));
    }
}
