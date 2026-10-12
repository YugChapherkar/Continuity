package com.continuity.dto;

public class AcceptHandoffRequest {
    private String signoffNote;
    private Boolean forceAccept = false;

    public AcceptHandoffRequest() {}

    public AcceptHandoffRequest(String signoffNote) {
        this.signoffNote = signoffNote;
    }

    public String getSignoffNote() { return signoffNote; }
    public void setSignoffNote(String signoffNote) { this.signoffNote = signoffNote; }
    public Boolean getForceAccept() { return forceAccept; }
    public void setForceAccept(Boolean forceAccept) { this.forceAccept = forceAccept; }
}
