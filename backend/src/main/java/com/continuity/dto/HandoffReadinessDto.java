package com.continuity.dto;

import java.util.ArrayList;
import java.util.List;

public class HandoffReadinessDto {
    private int score;
    private boolean ready;
    private List<String> warnings = new ArrayList<>();
    private List<String> satisfiedChecks = new ArrayList<>();

    public HandoffReadinessDto() {}

    public HandoffReadinessDto(int score, boolean ready, List<String> warnings, List<String> satisfiedChecks) {
        this.score = score;
        this.ready = ready;
        this.warnings = warnings != null ? warnings : new ArrayList<>();
        this.satisfiedChecks = satisfiedChecks != null ? satisfiedChecks : new ArrayList<>();
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public boolean isReady() {
        return ready;
    }

    public void setReady(boolean ready) {
        this.ready = ready;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }

    public List<String> getSatisfiedChecks() {
        return satisfiedChecks;
    }

    public void setSatisfiedChecks(List<String> satisfiedChecks) {
        this.satisfiedChecks = satisfiedChecks;
    }
}
