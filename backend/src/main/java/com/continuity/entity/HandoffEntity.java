package com.continuity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "handoffs")
public class HandoffEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "project_id", nullable = false, length = 64)
    private String projectId;

    @Column(name = "project_name", nullable = false)
    private String projectName;

    @Column(name = "sender_id", nullable = false, length = 64)
    private String senderId;

    @Column(name = "recipient_id", nullable = false, length = 64)
    private String recipientId;

    @Column(name = "pinned_version_id", nullable = false, length = 64)
    private String pinnedVersionId;

    @Column(name = "pinned_version_hash", nullable = false, length = 64)
    private String pinnedVersionHash;

    @Column(name = "status", nullable = false, length = 64)
    private String status = "Pending"; // Pending | Accepted | Completed

    @Column(name = "created_at", nullable = false, length = 64)
    private String createdAt;

    @Column(name = "accepted_at", length = 64)
    private String acceptedAt;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "executive_summary", columnDefinition = "TEXT")
    private String executiveSummary;

    @Column(name = "completed_items_json", columnDefinition = "TEXT")
    private String completedItemsJson = "[]";

    @Column(name = "next_steps_json", columnDefinition = "TEXT")
    private String nextStepsJson = "[]";

    @Column(name = "critical_blockers_json", columnDefinition = "TEXT")
    private String criticalBlockersJson = "[]";

    @Column(name = "runbook_commands_json", columnDefinition = "TEXT")
    private String runbookCommandsJson = "[]";

    @Column(name = "architectural_decisions_json", columnDefinition = "TEXT")
    private String architecturalDecisionsJson = "[]";

    @Column(name = "key_files_json", columnDefinition = "TEXT")
    private String keyFilesJson = "[]";

    @Column(name = "completeness_score")
    private Integer completenessScore = 100;

    public HandoffEntity() {
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

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getPinnedVersionId() {
        return pinnedVersionId;
    }

    public void setPinnedVersionId(String pinnedVersionId) {
        this.pinnedVersionId = pinnedVersionId;
    }

    public String getPinnedVersionHash() {
        return pinnedVersionHash;
    }

    public void setPinnedVersionHash(String pinnedVersionHash) {
        this.pinnedVersionHash = pinnedVersionHash;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(String acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(String executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public String getCompletedItemsJson() {
        return completedItemsJson;
    }

    public void setCompletedItemsJson(String completedItemsJson) {
        this.completedItemsJson = completedItemsJson;
    }

    public String getNextStepsJson() {
        return nextStepsJson;
    }

    public void setNextStepsJson(String nextStepsJson) {
        this.nextStepsJson = nextStepsJson;
    }

    public String getCriticalBlockersJson() {
        return criticalBlockersJson;
    }

    public void setCriticalBlockersJson(String criticalBlockersJson) {
        this.criticalBlockersJson = criticalBlockersJson;
    }

    public String getRunbookCommandsJson() {
        return runbookCommandsJson;
    }

    public void setRunbookCommandsJson(String runbookCommandsJson) {
        this.runbookCommandsJson = runbookCommandsJson;
    }

    public String getArchitecturalDecisionsJson() {
        return architecturalDecisionsJson;
    }

    public void setArchitecturalDecisionsJson(String architecturalDecisionsJson) {
        this.architecturalDecisionsJson = architecturalDecisionsJson;
    }

    public String getKeyFilesJson() {
        return keyFilesJson;
    }

    public void setKeyFilesJson(String keyFilesJson) {
        this.keyFilesJson = keyFilesJson;
    }

    public Integer getCompletenessScore() {
        return completenessScore;
    }

    public void setCompletenessScore(Integer completenessScore) {
        this.completenessScore = completenessScore;
    }
}
