package com.continuity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "notifications")
public class NotificationEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "recipient_id", nullable = false, length = 64)
    private String recipientId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "type", nullable = false, length = 32)
    private String type;

    @Column(name = "read", nullable = false)
    private boolean read = false;

    @Column(name = "timestamp", nullable = false, length = 64)
    private String timestamp;

    @Column(name = "link", length = 512)
    private String link;

    public NotificationEntity() {
    }

    public NotificationEntity(String id, String recipientId, String title, String message, String type, boolean read, String timestamp, String link) {
        this.id = id;
        this.recipientId = recipientId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.read = read;
        this.timestamp = timestamp;
        this.link = link;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}
