package com.continuity.dto;

public class AcceptHandoffRequest {
    private String signoffNote;

    public AcceptHandoffRequest() {}

    public AcceptHandoffRequest(String signoffNote) {
        this.signoffNote = signoffNote;
    }

    public String getSignoffNote() { return signoffNote; }
    public void setSignoffNote(String signoffNote) { this.signoffNote = signoffNote; }
}
