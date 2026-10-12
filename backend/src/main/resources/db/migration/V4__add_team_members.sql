-- V4: Add requested team members Yash Lokhande, Jessicaa Chauhab, and Shruti Patil

UPDATE users SET name = 'Jessicaa Chauhab' WHERE id = 'user-jessica';

MERGE INTO users (id, name, email, role, avatar, initials, department, bio, location, active_projects_count, pending_handoffs_count)
KEY (id)
VALUES
('user-yash', 'Yash Lokhande', 'yash.lokhande@continuity.internal', 'Principal Systems Architect', '', 'YL', 'Distributed Systems & Consensus Core', 'Author of Apollo Raft consensus engine and WAL persistence tier. Rotating to APAC & EMEA shift.', 'Mumbai, IN (IST)', 3, 1),
('user-shruti', 'Shruti Patil', 'shruti.patil@continuity.internal', 'Lead Site Reliability & Continuity Engineer', '', 'SP', 'Cloud & Edge Reliability Infrastructure', 'Specialist in zero-loss shift rotations, kernel observability guardrails, and automated failover orchestration.', 'Pune, IN (IST)', 2, 1);
