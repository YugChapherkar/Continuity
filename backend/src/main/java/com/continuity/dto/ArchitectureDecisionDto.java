package com.continuity.dto;

public class ArchitectureDecisionDto {
    private String id;
    private String title;
    private String date;
    private String context;
    private String decision;
    private String consequences;
    private String status;

    public ArchitectureDecisionDto() {}

    public ArchitectureDecisionDto(String id, String title, String date, String context, String decision, String consequences, String status) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.context = context;
        this.decision = decision;
        this.consequences = consequences;
        this.status = status != null ? status : "Accepted";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public String getConsequences() { return consequences; }
    public void setConsequences(String consequences) { this.consequences = consequences; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
