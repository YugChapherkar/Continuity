package com.continuity.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateTaskRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String status = "In Progress"; // Critical | Blocked | In Progress | Done
    private String priority = "P1";        // P0 | P1 | P2
    private String assignee;
    private String description;
    private String blockers;
    private String deadline;

    public CreateTaskRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBlockers() { return blockers; }
    public void setBlockers(String blockers) { this.blockers = blockers; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
}
