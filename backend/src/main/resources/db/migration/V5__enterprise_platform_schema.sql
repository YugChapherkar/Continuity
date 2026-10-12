-- V5__enterprise_platform_schema.sql
-- Enterprise Continuity Platform: RBAC roles, Teams, Milestones, Progress Reports, Reviews & Client Deliveries

-- 1. Extend Users table with strict RBAC system role, account status, and team reference
ALTER TABLE users ADD COLUMN IF NOT EXISTS system_role VARCHAR(64) DEFAULT 'Employee';
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(32) DEFAULT 'Active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id VARCHAR(64);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'Active',
    leader_id VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Team Memberships Table
CREATE TABLE IF NOT EXISTS team_memberships (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id),
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    role VARCHAR(32) DEFAULT 'Member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_team_user UNIQUE (team_id, user_id)
);

-- 4. Extend Projects table with enterprise delivery fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_deliverables_json TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date VARCHAR(64);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline VARCHAR(64);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority VARCHAR(16) DEFAULT 'P1';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget VARCHAR(64);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id VARCHAR(64) REFERENCES teams(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_leader_id VARCHAR(64) REFERENCES users(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS health VARCHAR(32) DEFAULT 'Green';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS health_reasons_json TEXT;

-- 5. Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'Planned',
    milestone_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Extend Tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id VARCHAR(64) REFERENCES project_milestones(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS creator_id VARCHAR(64) REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date VARCHAR(64);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date VARCHAR(64);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_effort_hours INT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dependencies_json TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS evidence_urls_json TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS latest_update TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS history_json TEXT;

-- 7. Employee Daily Updates Table
CREATE TABLE IF NOT EXISTS employee_daily_updates (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL REFERENCES users(id),
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    task_id VARCHAR(64) REFERENCES tasks(id),
    completed_work TEXT NOT NULL,
    in_progress TEXT NOT NULL,
    next_steps TEXT NOT NULL,
    blockers TEXT,
    dependencies TEXT,
    evidence_urls_json TEXT,
    status VARCHAR(32) DEFAULT 'Submitted',
    leader_comment TEXT,
    leader_id VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- 8. Team Leader Progress Reports Table
CREATE TABLE IF NOT EXISTS team_lead_progress_reports (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id),
    leader_id VARCHAR(64) NOT NULL REFERENCES users(id),
    reporting_period VARCHAR(255) NOT NULL,
    progress_percentage INT DEFAULT 0,
    milestones_completed_json TEXT,
    work_completed TEXT NOT NULL,
    tasks_remaining TEXT,
    blocked_tasks TEXT,
    risks TEXT,
    deadline_confidence VARCHAR(16) DEFAULT 'High',
    help_needed_from_admin TEXT,
    next_period_plan TEXT NOT NULL,
    evidence_urls_json TEXT,
    status VARCHAR(32) DEFAULT 'Submitted',
    admin_feedback TEXT,
    admin_id VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- 9. Project Review Submissions Table
CREATE TABLE IF NOT EXISTS project_review_submissions (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    status VARCHAR(64) DEFAULT 'Submitted for Final Review',
    current_round INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Review Rounds Table
CREATE TABLE IF NOT EXISTS review_rounds (
    id VARCHAR(64) PRIMARY KEY,
    submission_id VARCHAR(64) NOT NULL REFERENCES project_review_submissions(id),
    round_number INT NOT NULL,
    release_version VARCHAR(64) NOT NULL,
    completion_summary TEXT NOT NULL,
    setup_instructions TEXT NOT NULL,
    known_limitations TEXT,
    test_evidence TEXT NOT NULL,
    outstanding_issues TEXT,
    submitted_by VARCHAR(64) NOT NULL REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewer_id VARCHAR(64) REFERENCES users(id),
    reviewed_at TIMESTAMP,
    decision VARCHAR(32),
    comments TEXT
);

-- 11. Revision Items Table
CREATE TABLE IF NOT EXISTS revision_items (
    id VARCHAR(64) PRIMARY KEY,
    round_id VARCHAR(64) NOT NULL REFERENCES review_rounds(id),
    description TEXT NOT NULL,
    priority VARCHAR(16) DEFAULT 'P0',
    deadline VARCHAR(64),
    completed BOOLEAN DEFAULT FALSE,
    linked_task_id VARCHAR(64) REFERENCES tasks(id)
);

-- 12. Client Delivery Records Table (Separate Action from Approval)
CREATE TABLE IF NOT EXISTS client_delivery_records (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    approved_version VARCHAR(64) NOT NULL,
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient_contact VARCHAR(255) NOT NULL,
    delivery_channel VARCHAR(255) NOT NULL,
    delivery_notes TEXT NOT NULL,
    deliverables_list_json TEXT NOT NULL,
    recorded_by VARCHAR(64) NOT NULL REFERENCES users(id),
    client_acknowledged BOOLEAN DEFAULT FALSE,
    client_acknowledgment_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_reports_project ON team_lead_progress_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_updates_employee ON employee_daily_updates(employee_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_project ON client_delivery_records(project_id);
