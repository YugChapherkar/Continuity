package com.continuity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ProjectVersionId implements Serializable {

    @Column(name = "project_id", length = 64)
    private String projectId;

    @Column(name = "id", length = 64)
    private String id;

    public ProjectVersionId() {
    }

    public ProjectVersionId(String projectId, String id) {
        this.projectId = projectId;
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjectVersionId that = (ProjectVersionId) o;
        return Objects.equals(projectId, that.projectId) && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(projectId, id);
    }
}
