-- =========================================================================
-- CONTINUITY PLATFORM SCHEMA MIGRATION V6: EMPLOYEE WORKBENCH & CUSTODIANSHIP
-- =========================================================================

-- 1. Extend Tasks table with blocker details reference
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocker_description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocker_severity VARCHAR(20);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocker_status VARCHAR(30);

-- 2. Extend Handoffs table with task-level scoping, readiness score, and resolution states
ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS task_id VARCHAR(64);
ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS task_title VARCHAR(255);
ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS setup_instructions TEXT;
ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS readiness_score INT DEFAULT 100;
ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS decline_reason TEXT;
ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS clarification_request TEXT;
ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS declined_at TIMESTAMP;

-- 3. Task Ownership Timeline Table (Historical Transfer Pedigree)
CREATE TABLE IF NOT EXISTS task_ownership_records (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL,
    previous_owner_id VARCHAR(64),
    previous_owner_name VARCHAR(255),
    new_owner_id VARCHAR(64) NOT NULL,
    new_owner_name VARCHAR(255) NOT NULL,
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transferred_by VARCHAR(64) NOT NULL,
    transferred_by_name VARCHAR(255) NOT NULL,
    handoff_id VARCHAR(64),
    reason TEXT NOT NULL,
    method VARCHAR(50) NOT NULL, -- 'Assignment', 'Recipient Acceptance', 'Manager Override'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_ownership_task_id ON task_ownership_records(task_id);
CREATE INDEX IF NOT EXISTS idx_task_ownership_new_owner ON task_ownership_records(new_owner_id);

-- 4. Task Discussion Comments Table
CREATE TABLE IF NOT EXISTS task_comments (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL,
    author_id VARCHAR(64) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

-- 5. Operational Blocker Lifecycle Table
CREATE TABLE IF NOT EXISTS task_blockers (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL,
    reported_by VARCHAR(64) NOT NULL,
    reported_by_name VARCHAR(255) NOT NULL,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'High', -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(30) NOT NULL DEFAULT 'Reported', -- 'Reported', 'Acknowledged', 'Escalated', 'Resolved'
    acknowledged_by VARCHAR(64),
    acknowledged_by_name VARCHAR(255),
    acknowledged_at TIMESTAMP,
    escalated_to VARCHAR(64),
    escalated_to_name VARCHAR(255),
    escalated_at TIMESTAMP,
    escalation_reason TEXT,
    resolution_notes TEXT,
    resolved_by VARCHAR(64),
    resolved_by_name VARCHAR(255),
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_blockers_task_id ON task_blockers(task_id);
CREATE INDEX IF NOT EXISTS idx_task_blockers_status ON task_blockers(status);
