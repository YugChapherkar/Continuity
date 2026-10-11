package com.continuity.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateDecisionRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String date;
    private String context;

    @NotBlank(message = "Decision description is required")
    private String decision;

    private String consequences;
    private String status = "Accepted";

    public CreateDecisionRequest() {}

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
