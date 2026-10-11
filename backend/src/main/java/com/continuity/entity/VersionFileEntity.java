package com.continuity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "version_file_metadata")
public class VersionFileEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "version_id", nullable = false, length = 64)
    private String versionId;

    @Column(name = "project_id", nullable = false, length = 64)
    private String projectId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "path", nullable = false, length = 1024)
    private String path;

    @Column(name = "size_bytes")
    private Long sizeBytes = 0L;

    @Column(name = "file_type", nullable = false, length = 64)
    private String fileType;

    @Column(name = "content_snippet", columnDefinition = "TEXT")
    private String contentSnippet;

    @Column(name = "file_hash", length = 64)
    private String fileHash;

    public VersionFileEntity() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVersionId() {
        return versionId;
    }

    public void setVersionId(String versionId) {
        this.versionId = versionId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getContentSnippet() {
        return contentSnippet;
    }

    public void setContentSnippet(String contentSnippet) {
        this.contentSnippet = contentSnippet;
    }

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }
}
