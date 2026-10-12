package com.continuity;

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
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetNotifications() throws Exception {
        mockMvc.perform(get("/api/notifications")
                        .header("X-User-Id", "user-jessica"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.id == 'notif-1')]").exists());
    }

    @Test
    void testMarkAsRead() throws Exception {
        mockMvc.perform(patch("/api/notifications/notif-1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("notif-1"))
                .andExpect(jsonPath("$.read").value(true));
    }

    @Test
    void testMarkAllAsRead() throws Exception {
        mockMvc.perform(post("/api/notifications/read-all")
                        .header("X-User-Id", "user-jessica"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }
}
