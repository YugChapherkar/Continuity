package com.continuity.dto;

public class ProjectFileDto {
    private String name;
    private String path;
    private String size;
    private String type; // code | config | doc | schema
    private String contentSnippet;

    public ProjectFileDto() {}

    public ProjectFileDto(String name, String path, String size, String type, String contentSnippet) {
        this.name = name;
        this.path = path;
        this.size = size;
        this.type = type;
        this.contentSnippet = contentSnippet;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getContentSnippet() { return contentSnippet; }
    public void setContentSnippet(String contentSnippet) { this.contentSnippet = contentSnippet; }
}
