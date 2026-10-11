package com.continuity.dto;

public class UserDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private String avatar;
    private String initials;
    private String department;
    private String bio;
    private String location;
    private Integer activeProjectsCount;
    private Integer pendingHandoffsCount;

    public UserDto() {}

    public UserDto(String id, String name, String email, String role, String avatar, String initials,
                   String department, String bio, String location, Integer activeProjectsCount, Integer pendingHandoffsCount) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.avatar = avatar;
        this.initials = initials;
        this.department = department;
        this.bio = bio;
        this.location = location;
        this.activeProjectsCount = activeProjectsCount;
        this.pendingHandoffsCount = pendingHandoffsCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getInitials() { return initials; }
    public void setInitials(String initials) { this.initials = initials; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getActiveProjectsCount() { return activeProjectsCount; }
    public void setActiveProjectsCount(Integer activeProjectsCount) { this.activeProjectsCount = activeProjectsCount; }
    public Integer getPendingHandoffsCount() { return pendingHandoffsCount; }
    public void setPendingHandoffsCount(Integer pendingHandoffsCount) { this.pendingHandoffsCount = pendingHandoffsCount; }
}
