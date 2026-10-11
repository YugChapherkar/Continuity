package com.continuity.dto;

public class KnowledgeStatusDto {
    private String projectId;
    private String versionId;
    private String status; // PENDING | INDEXING | READY | FAILED
    private int fileCount;
    private String lastIndexedAt;
    private String errorMessage;

    public KnowledgeStatusDto() {}

    public KnowledgeStatusDto(String projectId, String versionId, String status, int fileCount, String lastIndexedAt, String errorMessage) {
        this.projectId = projectId;
        this.versionId = versionId;
        this.status = status;
        this.fileCount = fileCount;
        this.lastIndexedAt = lastIndexedAt;
        this.errorMessage = errorMessage;
    }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getVersionId() { return versionId; }
    public void setVersionId(String versionId) { this.versionId = versionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getFileCount() { return fileCount; }
    public void setFileCount(int fileCount) { this.fileCount = fileCount; }
    public String getLastIndexedAt() { return lastIndexedAt; }
    public void setLastIndexedAt(String lastIndexedAt) { this.lastIndexedAt = lastIndexedAt; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
