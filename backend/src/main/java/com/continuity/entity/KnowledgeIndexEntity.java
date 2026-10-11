package com.continuity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "knowledge_index")
public class KnowledgeIndexEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "project_id", nullable = false, length = 64)
    private String projectId;

    @Column(name = "version_id", length = 64)
    private String versionId;

    @Column(name = "file_search_store_id")
    private String fileSearchStoreId;

    @Column(name = "status", nullable = false, length = 64)
    private String status; // PENDING | INDEXING | READY | FAILED

    @Column(name = "file_count")
    private Integer fileCount = 0;

    @Column(name = "last_indexed_at", length = 64)
    private String lastIndexedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public KnowledgeIndexEntity() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getVersionId() {
        return versionId;
    }

    public void setVersionId(String versionId) {
        this.versionId = versionId;
    }

    public String getFileSearchStoreId() {
        return fileSearchStoreId;
    }

    public void setFileSearchStoreId(String fileSearchStoreId) {
        this.fileSearchStoreId = fileSearchStoreId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getFileCount() {
        return fileCount;
    }

    public void setFileCount(Integer fileCount) {
        this.fileCount = fileCount;
    }

    public String getLastIndexedAt() {
        return lastIndexedAt;
    }

    public void setLastIndexedAt(String lastIndexedAt) {
        this.lastIndexedAt = lastIndexedAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
