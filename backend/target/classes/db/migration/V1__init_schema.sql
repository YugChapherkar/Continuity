-- V1__init_schema.sql
-- Base schema for CONTINUITY Platform

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    avatar VARCHAR(512),
    initials VARCHAR(16) NOT NULL,
    department VARCHAR(255) NOT NULL,
    bio TEXT,
    location VARCHAR(255),
    active_projects_count INT DEFAULT 0,
    pending_handoffs_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(64) NOT NULL,
    current_version_id VARCHAR(64),
    owner_id VARCHAR(64) REFERENCES users(id),
    team VARCHAR(255),
    repository_url VARCHAR(512),
    architecture_summary TEXT,
    quickstart_guide TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_versions (
    id VARCHAR(64) NOT NULL,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    hash VARCHAR(64) NOT NULL,
    parent_version_id VARCHAR(64),
    timestamp VARCHAR(64) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar VARCHAR(512),
    commit_message TEXT NOT NULL,
    changed_files_count INT DEFAULT 0,
    snapshot_path VARCHAR(1024),
    indexing_status VARCHAR(64) DEFAULT 'PENDING',
    PRIMARY KEY (project_id, id)
);

CREATE TABLE IF NOT EXISTS version_file_metadata (
    id VARCHAR(64) PRIMARY KEY,
    version_id VARCHAR(64) NOT NULL,
    project_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(1024) NOT NULL,
    size_bytes BIGINT DEFAULT 0,
    file_type VARCHAR(64) NOT NULL,
    content_snippet TEXT,
    file_hash VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(64) NOT NULL,
    priority VARCHAR(16) NOT NULL,
    assignee VARCHAR(255) NOT NULL,
    description TEXT,
    created_at VARCHAR(64) NOT NULL,
    blockers TEXT
);

CREATE TABLE IF NOT EXISTS architecture_decisions (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    title VARCHAR(255) NOT NULL,
    date VARCHAR(64) NOT NULL,
    context TEXT,
    decision TEXT,
    consequences TEXT,
    status VARCHAR(64) DEFAULT 'Accepted'
);

CREATE TABLE IF NOT EXISTS handoffs (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    project_name VARCHAR(255) NOT NULL,
    sender_id VARCHAR(64) NOT NULL REFERENCES users(id),
    recipient_id VARCHAR(64) NOT NULL REFERENCES users(id),
    pinned_version_id VARCHAR(64) NOT NULL,
    pinned_version_hash VARCHAR(64) NOT NULL,
    status VARCHAR(64) NOT NULL,
    created_at VARCHAR(64) NOT NULL,
    accepted_at VARCHAR(64),
    note TEXT,
    executive_summary TEXT,
    completed_items_json TEXT,
    next_steps_json TEXT,
    critical_blockers_json TEXT,
    runbook_commands_json TEXT,
    architectural_decisions_json TEXT,
    key_files_json TEXT
);

CREATE TABLE IF NOT EXISTS handoff_audit_trail (
    id VARCHAR(64) PRIMARY KEY,
    handoff_id VARCHAR(64) NOT NULL REFERENCES handoffs(id),
    action VARCHAR(64) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    timestamp VARCHAR(64) NOT NULL,
    detail TEXT,
    hash VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS activity_log (
    id VARCHAR(64) PRIMARY KEY,
    timestamp VARCHAR(64) NOT NULL,
    hash VARCHAR(64) NOT NULL,
    prev_hash VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    project_id VARCHAR(64),
    project_name VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    verifiable BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS knowledge_index (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id),
    version_id VARCHAR(64),
    file_search_store_id VARCHAR(255),
    status VARCHAR(64) NOT NULL,
    file_count INT DEFAULT 0,
    last_indexed_at VARCHAR(64),
    error_message TEXT
);
