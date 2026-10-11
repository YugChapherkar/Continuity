package com.continuity.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequestDto {
    @NotBlank(message = "Question query is required")
    private String query;

    private String versionId;
    private String handoffId;

    public ChatRequestDto() {}

    public ChatRequestDto(String query, String versionId, String handoffId) {
        this.query = query;
        this.versionId = versionId;
        this.handoffId = handoffId;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getVersionId() { return versionId; }
    public void setVersionId(String versionId) { this.versionId = versionId; }
    public String getHandoffId() { return handoffId; }
    public void setHandoffId(String handoffId) { this.handoffId = handoffId; }
}
