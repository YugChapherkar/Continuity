package com.continuity.dto;

import java.util.ArrayList;
import java.util.List;

public class HandoffBriefingDto {
    private String executiveSummary;
    private List<String> completedItems = new ArrayList<>();
    private List<String> nextSteps = new ArrayList<>();
    private List<String> criticalBlockers = new ArrayList<>();
    private List<String> architecturalDecisions = new ArrayList<>();
    private List<String> keyFiles = new ArrayList<>();
    private List<String> runbookCommands = new ArrayList<>();

    public HandoffBriefingDto() {}

    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }
    public List<String> getCompletedItems() { return completedItems; }
    public void setCompletedItems(List<String> completedItems) { this.completedItems = completedItems != null ? completedItems : new ArrayList<>(); }
    public List<String> getNextSteps() { return nextSteps; }
    public void setNextSteps(List<String> nextSteps) { this.nextSteps = nextSteps != null ? nextSteps : new ArrayList<>(); }
    public List<String> getCriticalBlockers() { return criticalBlockers; }
    public void setCriticalBlockers(List<String> criticalBlockers) { this.criticalBlockers = criticalBlockers != null ? criticalBlockers : new ArrayList<>(); }
    public List<String> getArchitecturalDecisions() { return architecturalDecisions; }
    public void setArchitecturalDecisions(List<String> architecturalDecisions) { this.architecturalDecisions = architecturalDecisions != null ? architecturalDecisions : new ArrayList<>(); }
    public List<String> getKeyFiles() { return keyFiles; }
    public void setKeyFiles(List<String> keyFiles) { this.keyFiles = keyFiles != null ? keyFiles : new ArrayList<>(); }
    public List<String> runbookCommands() { return runbookCommands; }
    public List<String> getRunbookCommands() { return runbookCommands; }
    public void setRunbookCommands(List<String> runbookCommands) { this.runbookCommands = runbookCommands != null ? runbookCommands : new ArrayList<>(); }
}
