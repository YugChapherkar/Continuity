package com.continuity.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateProjectRequest {
    private String id;

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;
    private String status = "Active";
    private String team;
    private String repositoryUrl;
    private String architectureSummary;
    private String quickstartGuide;

    public CreateProjectRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }
    public String getRepositoryUrl() { return repositoryUrl; }
    public void setRepositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; }
    public String getArchitectureSummary() { return architectureSummary; }
    public void setArchitectureSummary(String architectureSummary) { this.architectureSummary = architectureSummary; }
    public String getQuickstartGuide() { return quickstartGuide; }
    public void setQuickstartGuide(String quickstartGuide) { this.quickstartGuide = quickstartGuide; }
}
