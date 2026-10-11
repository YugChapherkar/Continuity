package com.continuity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "architecture_decisions")
public class ArchitectureDecisionEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "project_id", nullable = false, length = 64)
    private String projectId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "date", nullable = false, length = 64)
    private String date;

    @Column(name = "context", columnDefinition = "TEXT")
    private String context;

    @Column(name = "decision", columnDefinition = "TEXT")
    private String decision;

    @Column(name = "consequences", columnDefinition = "TEXT")
    private String consequences;

    @Column(name = "status", length = 64)
    private String status = "Accepted";

    public ArchitectureDecisionEntity() {
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getConsequences() {
        return consequences;
    }

    public void setConsequences(String consequences) {
        this.consequences = consequences;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
