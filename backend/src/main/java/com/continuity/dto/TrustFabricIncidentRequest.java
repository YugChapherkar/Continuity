package com.continuity.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
public class TrustFabricIncidentRequest {
    private String caseId = "TC-1042";
    private String serial = "LOT-A-000123";
    private String lotId = "LOT-A";
    private String verdict = "CLONE_DETECTED";
    private Integer riskScore = 80;
    private String confidence = "high";
    private List<Map<String, String>> checks = new ArrayList<>();
    private List<String> nextSteps = new ArrayList<>();
    private String evidenceBundleUrl = "http://localhost:8000/products/LOT-A-000123/bundle";

    public TrustFabricIncidentRequest() {}

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getSerial() { return serial; }
    public void setSerial(String serial) { this.serial = serial; }
    public String getLotId() { return lotId; }
    public void setLotId(String lotId) { this.lotId = lotId; }
    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }
    public List<Map<String, String>> getChecks() { return checks; }
    public void setChecks(List<Map<String, String>> checks) { this.checks = checks != null ? checks : new ArrayList<>(); }
    public List<String> getNextSteps() { return nextSteps; }
    public void setNextSteps(List<String> nextSteps) { this.nextSteps = nextSteps != null ? nextSteps : new ArrayList<>(); }
    public String getEvidenceBundleUrl() { return evidenceBundleUrl; }
    public void setEvidenceBundleUrl(String evidenceBundleUrl) { this.evidenceBundleUrl = evidenceBundleUrl; }
}
