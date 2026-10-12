package com.continuity.dto;

public class TaskDto {
    private String id;
    private String title;
    private String status; // Critical | Blocked | In Progress | Done
    private String priority; // P0 | P1 | P2
    private String assignee;
    private String description;
    private String createdAt;
    private String blockers;
    private String deadline;

    public TaskDto() {}

    public TaskDto(String id, String title, String status, String priority, String assignee, String description, String createdAt, String blockers) {
        this(id, title, status, priority, assignee, description, createdAt, blockers, null);
    }

    public TaskDto(String id, String title, String status, String priority, String assignee, String description, String createdAt, String blockers, String deadline) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.priority = priority;
        this.assignee = assignee;
        this.description = description;
        this.createdAt = createdAt;
        this.blockers = blockers;
        this.deadline = deadline;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getBlockers() { return blockers; }
    public void setBlockers(String blockers) { this.blockers = blockers; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
}
