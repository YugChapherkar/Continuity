package com.continuity.dto;

import java.util.ArrayList;
import java.util.List;

public class ChatResponseDto {
    private String response;
    private String model;
    private List<String> citations = new ArrayList<>();
    private String pinnedVersionId;
    private String handoffId;

    public ChatResponseDto() {}

    public ChatResponseDto(String response, String model, List<String> citations, String pinnedVersionId, String handoffId) {
        this.response = response;
        this.model = model;
        this.citations = citations != null ? citations : new ArrayList<>();
        this.pinnedVersionId = pinnedVersionId;
        this.handoffId = handoffId;
    }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public List<String> getCitations() { return citations; }
    public void setCitations(List<String> citations) { this.citations = citations; }
    public String getPinnedVersionId() { return pinnedVersionId; }
    public void setPinnedVersionId(String pinnedVersionId) { this.pinnedVersionId = pinnedVersionId; }
    public String getHandoffId() { return handoffId; }
    public void setHandoffId(String handoffId) { this.handoffId = handoffId; }
}
