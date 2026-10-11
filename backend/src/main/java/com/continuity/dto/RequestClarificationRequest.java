package com.continuity.dto;

import jakarta.validation.constraints.NotBlank;

public class RequestClarificationRequest {
    @NotBlank(message = "Question or clarification request is required")
    private String question;

    public RequestClarificationRequest() {}

    public RequestClarificationRequest(String question) {
        this.question = question;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
}
