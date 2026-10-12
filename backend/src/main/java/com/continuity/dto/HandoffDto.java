package com.continuity.dto;

import java.util.ArrayList;
import java.util.List;

public class HandoffDto {
    private String id;
    private String projectId;
    private String projectName;
    private String senderId;
    private String recipientId;
    private String pinnedVersionId;
    private String pinnedVersionHash;
    private String status; // Pending | Accepted | Completed
    private String createdAt;
    private String acceptedAt;
    private String note;
    private Integer completenessScore = 100;
    private HandoffBriefingDto briefing;
    private List<HandoffAuditTrailItemDto> auditTrail = new ArrayList<>();

    public HandoffDto() {}

    public Integer getCompletenessScore() { return completenessScore; }
    public void setCompletenessScore(Integer completenessScore) { this.completenessScore = completenessScore; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    public String getPinnedVersionId() { return pinnedVersionId; }
    public void setPinnedVersionId(String pinnedVersionId) { this.pinnedVersionId = pinnedVersionId; }
    public String getPinnedVersionHash() { return pinnedVersionHash; }
    public void setPinnedVersionHash(String pinnedVersionHash) { this.pinnedVersionHash = pinnedVersionHash; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(String acceptedAt) { this.acceptedAt = acceptedAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public HandoffBriefingDto getBriefing() { return briefing; }
    public void setBriefing(HandoffBriefingDto briefing) { this.briefing = briefing; }
    public List<HandoffAuditTrailItemDto> getAuditTrail() { return auditTrail; }
    public void setAuditTrail(List<HandoffAuditTrailItemDto> auditTrail) { this.auditTrail = auditTrail != null ? auditTrail : new ArrayList<>(); }
}
