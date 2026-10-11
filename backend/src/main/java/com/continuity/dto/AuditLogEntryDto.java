package com.continuity.dto;

public class AuditLogEntryDto {
    private String id;
    private String timestamp;
    private String hash;
    private String prevHash;
    private String action;
    private String actorId;
    private String actorName;
    private String projectId;
    private String projectName;
    private String detail;
    private boolean verifiable;

    public AuditLogEntryDto() {}

    public AuditLogEntryDto(String id, String timestamp, String hash, String prevHash, String action,
                            String actorId, String actorName, String projectId, String projectName, String detail, boolean verifiable) {
        this.id = id;
        this.timestamp = timestamp;
        this.hash = hash;
        this.prevHash = prevHash;
        this.action = action;
        this.actorId = actorId;
        this.actorName = actorName;
        this.projectId = projectId;
        this.projectName = projectName;
        this.detail = detail;
        this.verifiable = verifiable;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }
    public String getPrevHash() { return prevHash; }
    public void setPrevHash(String prevHash) { this.prevHash = prevHash; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }
    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public boolean isVerifiable() { return verifiable; }
    public void setVerifiable(boolean verifiable) { this.verifiable = verifiable; }
}
