-- =========================================================================
-- V3: Task Deadlines, Handoff Completeness Score, and Live Notifications
-- =========================================================================

-- 1. Add deadline to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline VARCHAR(64);

-- 2. Add completeness score to handoffs
ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS completeness_score INT DEFAULT 100;

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_id VARCHAR(64) NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL, -- 'handoff' | 'task' | 'audit' | 'mention'
    read BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp VARCHAR(64) NOT NULL,
    link VARCHAR(512)
);

-- 4. Update seed tasks with deadlines (including overdue demonstration task)
UPDATE tasks SET deadline = '2026-10-10' WHERE id = 'task-1'; -- OVERDUE!
UPDATE tasks SET deadline = '2026-10-15' WHERE id = 'task-2';
UPDATE tasks SET deadline = '2026-10-18' WHERE id = 'task-3';
UPDATE tasks SET deadline = '2026-10-22' WHERE id = 'task-4';

-- 5. Seed initial operational alerts and notifications
INSERT INTO notifications (id, recipient_id, title, message, type, read, timestamp, link)
VALUES
    ('notif-1', 'user-jessica', 'Critical Task Overdue', 'Task [task-1] Raft Snapshot Compaction exceeded deadline on 2026-10-10.', 'task', false, '10 Oct 2026, 18:30 UTC', '/projects/apollo-core'),
    ('notif-2', 'user-jessica', 'Handoff Awaiting Sign-off', 'Handoff package HO-2026-089 for Apollo Core is awaiting your acceptance.', 'handoff', false, '11 Oct 2026, 09:15 UTC', '/handoffs/HO-2026-089'),
    ('notif-3', 'user-marcus', 'Handoff Accepted', 'Marcus Chen ratified and accepted primary ownership of Apollo Core v2.4.0.', 'handoff', true, '09 Oct 2026, 14:00 UTC', '/handoffs/HO-2026-089'),
    ('notif-4', 'user-marcus', 'Task Deadline Approaching', 'Task [task-2] Chaos Engineering simulation due in 3 days.', 'task', false, '11 Oct 2026, 11:45 UTC', '/projects/apollo-core');
