package com.continuity.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class CreateHandoffRequest {
    private String projectId;
    private String senderId;

    @NotBlank(message = "Recipient ID is required")
    private String recipientId;

    private String note;

    @NotBlank(message = "Executive summary is required")
    private String executiveSummary;

    private List<String> completedItems = new ArrayList<>();
    private List<String> nextSteps = new ArrayList<>();
    private List<String> criticalBlockers = new ArrayList<>();
    private List<String> runbookCommands = new ArrayList<>();

    public CreateHandoffRequest() {}

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }
    public List<String> getCompletedItems() { return completedItems; }
    public void setCompletedItems(List<String> completedItems) { this.completedItems = completedItems != null ? completedItems : new ArrayList<>(); }
    public List<String> getNextSteps() { return nextSteps; }
    public void setNextSteps(List<String> nextSteps) { this.nextSteps = nextSteps != null ? nextSteps : new ArrayList<>(); }
    public List<String> getCriticalBlockers() { return criticalBlockers; }
    public void setCriticalBlockers(List<String> criticalBlockers) { this.criticalBlockers = criticalBlockers != null ? criticalBlockers : new ArrayList<>(); }
    public List<String> getRunbookCommands() { return runbookCommands; }
    public void setRunbookCommands(List<String> runbookCommands) { this.runbookCommands = runbookCommands != null ? runbookCommands : new ArrayList<>(); }
}
