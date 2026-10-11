package com.continuity.dto;

public class AuthorDto {
    private String name;
    private String avatar;

    public AuthorDto() {}

    public AuthorDto(String name, String avatar) {
        this.name = name;
        this.avatar = avatar;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
