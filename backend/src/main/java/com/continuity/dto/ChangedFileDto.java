package com.continuity.dto;

public class ChangedFileDto {
    private String path;
    private int insertions;
    private int deletions;

    public ChangedFileDto() {}

    public ChangedFileDto(String path, int insertions, int deletions) {
        this.path = path;
        this.insertions = insertions;
        this.deletions = deletions;
    }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public int getInsertions() { return insertions; }
    public void setInsertions(int insertions) { this.insertions = insertions; }
    public int getDeletions() { return deletions; }
    public void setDeletions(int deletions) { this.deletions = deletions; }
}
