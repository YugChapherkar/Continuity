package com.continuity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class VersionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private byte[] createTestZipArchive() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry entry1 = new ZipEntry("src/main.rs");
            zos.putNextEntry(entry1);
            zos.write("fn main() { println!(\"Hello Apollo\"); }".getBytes());
            zos.closeEntry();

            ZipEntry entry2 = new ZipEntry("README.md");
            zos.putNextEntry(entry2);
            zos.write("# Apollo Core Consensus v2.4.1\nOperational runbook".getBytes());
            zos.closeEntry();
        }
        return baos.toByteArray();
    }

    @Test
    void testGetVersions() throws Exception {
        mockMvc.perform(get("/api/projects/apollo-core/versions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("v2.4.0"));
    }

    @Test
    void testUploadVersionSuccess() throws Exception {
        byte[] zipBytes = createTestZipArchive();
        MockMultipartFile zipFile = new MockMultipartFile(
                "file",
                "apollo-snapshot.zip",
                "application/zip",
                zipBytes
        );

        mockMvc.perform(multipart("/api/projects/apollo-core/versions")
                        .file(zipFile)
                        .param("commitMessage", "feat: speculative read barrier test commit")
                        .param("baseVersionId", "v2.4.0")
                        .header("X-User-Id", "user-marcus"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("v2.4.1"))
                .andExpect(jsonPath("$.author.name").value("Marcus Vance"))
                .andExpect(jsonPath("$.indexingStatus").value("READY"));
    }

    @Test
    void testUploadVersionRejectsStaleBaseWithConflict() throws Exception {
        byte[] zipBytes = createTestZipArchive();
        MockMultipartFile zipFile = new MockMultipartFile(
                "file",
                "apollo-snapshot.zip",
                "application/zip",
                zipBytes
        );

        // Current head is v2.4.0 or v2.4.1. An outdated baseVersionId like v1.0.0 must be rejected with 409 Conflict
        mockMvc.perform(multipart("/api/projects/apollo-core/versions")
                        .file(zipFile)
                        .param("commitMessage", "stale commit attempt")
                        .param("baseVersionId", "v1.0.0")
                        .header("X-User-Id", "user-marcus"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").exists());
    }
}
