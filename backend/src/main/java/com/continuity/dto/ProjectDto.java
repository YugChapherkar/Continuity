package com.continuity.dto;

import java.util.ArrayList;
import java.util.List;

public class ProjectDto {
    private String id;
    private String name;
    private String description;
    private String status;
    private String currentVersionId;
    private String ownerId;
    private String team;
    private String repositoryUrl;
    private String architectureSummary;
    private String quickstartGuide;
    private List<ArchitectureDecisionDto> decisions = new ArrayList<>();
    private List<ProjectVersionDto> versions = new ArrayList<>();
    private List<TaskDto> tasks = new ArrayList<>();
    private List<ProjectFileDto> files = new ArrayList<>();
    private String updatedAt;

    public ProjectDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCurrentVersionId() { return currentVersionId; }
    public void setCurrentVersionId(String currentVersionId) { this.currentVersionId = currentVersionId; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }
    public String getRepositoryUrl() { return repositoryUrl; }
    public void setRepositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; }
    public String getArchitectureSummary() { return architectureSummary; }
    public void setArchitectureSummary(String architectureSummary) { this.architectureSummary = architectureSummary; }
    public String getQuickstartGuide() { return quickstartGuide; }
    public void setQuickstartGuide(String quickstartGuide) { this.quickstartGuide = quickstartGuide; }
    public List<ArchitectureDecisionDto> getDecisions() { return decisions; }
    public void setDecisions(List<ArchitectureDecisionDto> decisions) { this.decisions = decisions != null ? decisions : new ArrayList<>(); }
    public List<ProjectVersionDto> getVersions() { return versions; }
    public void setVersions(List<ProjectVersionDto> versions) { this.versions = versions != null ? versions : new ArrayList<>(); }
    public List<TaskDto> getTasks() { return tasks; }
    public void setTasks(List<TaskDto> tasks) { this.tasks = tasks != null ? tasks : new ArrayList<>(); }
    public List<ProjectFileDto> getFiles() { return files; }
    public void setFiles(List<ProjectFileDto> files) { this.files = files != null ? files : new ArrayList<>(); }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
