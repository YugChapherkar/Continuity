package com.continuity.dto;

import java.util.ArrayList;
import java.util.List;

public class ProjectVersionDto {
    private String id;
    private String hash;
    private String timestamp;
    private AuthorDto author;
    private String commitMessage;
    private int changedFilesCount;
    private List<ChangedFileDto> changedFiles = new ArrayList<>();
    private String indexingStatus;

    public ProjectVersionDto() {}

    public ProjectVersionDto(String id, String hash, String timestamp, AuthorDto author,
                             String commitMessage, int changedFilesCount, List<ChangedFileDto> changedFiles, String indexingStatus) {
        this.id = id;
        this.hash = hash;
        this.timestamp = timestamp;
        this.author = author;
        this.commitMessage = commitMessage;
        this.changedFilesCount = changedFilesCount;
        this.changedFiles = changedFiles != null ? changedFiles : new ArrayList<>();
        this.indexingStatus = indexingStatus;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public AuthorDto getAuthor() { return author; }
    public void setAuthor(AuthorDto author) { this.author = author; }
    public String getCommitMessage() { return commitMessage; }
    public void setCommitMessage(String commitMessage) { this.commitMessage = commitMessage; }
    public int getChangedFilesCount() { return changedFilesCount; }
    public void setChangedFilesCount(int changedFilesCount) { this.changedFilesCount = changedFilesCount; }
    public List<ChangedFileDto> getChangedFiles() { return changedFiles; }
    public void setChangedFiles(List<ChangedFileDto> changedFiles) { this.changedFiles = changedFiles; }
    public String getIndexingStatus() { return indexingStatus; }
    public void setIndexingStatus(String indexingStatus) { this.indexingStatus = indexingStatus; }
}
