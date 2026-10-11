package com.continuity.dto;

public class HandoffAuditTrailItemDto {
    private String action;
    private String actor;
    private String timestamp;
    private String detail;
    private String hash;

    public HandoffAuditTrailItemDto() {}

    public HandoffAuditTrailItemDto(String action, String actor, String timestamp, String detail, String hash) {
        this.action = action;
        this.actor = actor;
        this.timestamp = timestamp;
        this.detail = detail;
        this.hash = hash;
    }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }
}
