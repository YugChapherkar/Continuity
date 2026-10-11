package com.continuity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "project_versions")
public class ProjectVersionEntity {

    @EmbeddedId
    private ProjectVersionId id;

    @Column(name = "hash", nullable = false, length = 64)
    private String hash;

    @Column(name = "parent_version_id", length = 64)
    private String parentVersionId;

    @Column(name = "timestamp", nullable = false, length = 64)
    private String timestamp;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_avatar", length = 512)
    private String authorAvatar;

    @Column(name = "commit_message", nullable = false, columnDefinition = "TEXT")
    private String commitMessage;

    @Column(name = "changed_files_count")
    private Integer changedFilesCount = 0;

    @Column(name = "snapshot_path", length = 1024)
    private String snapshotPath;

    @Column(name = "indexing_status", length = 64)
    private String indexingStatus = "PENDING";

    public ProjectVersionEntity() {
    }

    public ProjectVersionId getId() {
        return id;
    }

    public void setId(ProjectVersionId id) {
        this.id = id;
    }

    public String getVersionId() {
        return id != null ? id.getId() : null;
    }

    public String getProjectId() {
        return id != null ? id.getProjectId() : null;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String getParentVersionId() {
        return parentVersionId;
    }

    public void setParentVersionId(String parentVersionId) {
        this.parentVersionId = parentVersionId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorAvatar() {
        return authorAvatar;
    }

    public void setAuthorAvatar(String authorAvatar) {
        this.authorAvatar = authorAvatar;
    }

    public String getCommitMessage() {
        return commitMessage;
    }

    public void setCommitMessage(String commitMessage) {
        this.commitMessage = commitMessage;
    }

    public Integer getChangedFilesCount() {
        return changedFilesCount;
    }

    public void setChangedFilesCount(Integer changedFilesCount) {
        this.changedFilesCount = changedFilesCount;
    }

    public String getSnapshotPath() {
        return snapshotPath;
    }

    public void setSnapshotPath(String snapshotPath) {
        this.snapshotPath = snapshotPath;
    }

    public String getIndexingStatus() {
        return indexingStatus;
    }

    public void setIndexingStatus(String indexingStatus) {
        this.indexingStatus = indexingStatus;
    }
}
