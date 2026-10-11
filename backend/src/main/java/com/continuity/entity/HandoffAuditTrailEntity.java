package com.continuity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "handoff_audit_trail")
public class HandoffAuditTrailEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "handoff_id", nullable = false, length = 64)
    private String handoffId;

    @Column(name = "action", nullable = false, length = 64)
    private String action;

    @Column(name = "actor", nullable = false)
    private String actor;

    @Column(name = "timestamp", nullable = false, length = 64)
    private String timestamp;

    @Column(name = "detail", columnDefinition = "TEXT")
    private String detail;

    @Column(name = "hash", length = 64)
    private String hash;

    public HandoffAuditTrailEntity() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getHandoffId() {
        return handoffId;
    }

    public void setHandoffId(String handoffId) {
        this.handoffId = handoffId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getActor() {
        return actor;
    }

    public void setActor(String actor) {
        this.actor = actor;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }
}
