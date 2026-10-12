package com.continuity.dto;

import java.util.ArrayList;
import java.util.List;

public class TrustFabricIncidentResponse {
    private String incidentId;
    private String handoffId;
    private String serial;
    private String verdict;
    private Integer riskScore;
    private String anchorTx;
    private String anchorId;
    private String besuBlockNumber;
    private String status;
    private HandoffDto handoff;
    private List<TaskDto> recallTasks = new ArrayList<>();
    private List<String> affectedCustodians = new ArrayList<>();
    private String completenessGateStatus; // "BLOCKED: Inspection & Recall Tasks Incomplete"

    public TrustFabricIncidentResponse() {}

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    public String getHandoffId() { return handoffId; }
    public void setHandoffId(String handoffId) { this.handoffId = handoffId; }
    public String getSerial() { return serial; }
    public void setSerial(String serial) { this.serial = serial; }
    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
    public String getAnchorTx() { return anchorTx; }
    public void setAnchorTx(String anchorTx) { this.anchorTx = anchorTx; }
    public String getAnchorId() { return anchorId; }
    public void setAnchorId(String anchorId) { this.anchorId = anchorId; }
    public String getBesuBlockNumber() { return besuBlockNumber; }
    public void setBesuBlockNumber(String besuBlockNumber) { this.besuBlockNumber = besuBlockNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public HandoffDto getHandoff() { return handoff; }
    public void setHandoff(HandoffDto handoff) { this.handoff = handoff; }
    public List<TaskDto> getRecallTasks() { return recallTasks; }
    public void setRecallTasks(List<TaskDto> recallTasks) { this.recallTasks = recallTasks != null ? recallTasks : new ArrayList<>(); }
    public List<String> getAffectedCustodians() { return affectedCustodians; }
    public void setAffectedCustodians(List<String> affectedCustodians) { this.affectedCustodians = affectedCustodians != null ? affectedCustodians : new ArrayList<>(); }
    public String getCompletenessGateStatus() { return completenessGateStatus; }
    public void setCompletenessGateStatus(String completenessGateStatus) { this.completenessGateStatus = completenessGateStatus; }
}
