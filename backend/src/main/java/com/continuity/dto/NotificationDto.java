package com.continuity.dto;

public class NotificationDto {
    private String id;
    private String recipientId;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String timestamp;
    private String link;

    public NotificationDto() {}

    public NotificationDto(String id, String recipientId, String title, String message, String type, boolean read, String timestamp, String link) {
        this.id = id;
        this.recipientId = recipientId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.read = read;
        this.timestamp = timestamp;
        this.link = link;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}
