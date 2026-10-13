-- V5: Add Admin and official user credentials
-- Ensures Spring Boot DB matches Next.js SQLite & Prisma store

MERGE INTO users (id, name, email, role, avatar, initials, department, bio, location, active_projects_count, pending_handoffs_count)
KEY (id)
VALUES
('user-admin', 'Yug Chapherkar', 'admin@phx.in', 'Admin', '', 'YC', 'Platform Administration', 'Continuity Chief Administrator & Systems Lead', 'Headquarters (IST)', 5, 0),
('user-marcus', 'Marcus Vance', 'lead@phx.in', 'Team Leader', '', 'MV', 'Distributed Storage & Consensus', 'Lead systems architect and Apollo team project leader.', 'Zurich, Switzerland (CET)', 2, 0),
('user-jessica', 'Jessica Chauhan', 'employee@phx.in', 'Employee', '', 'JC', 'Platform Architecture & Core Infrastructure', 'Senior Distributed Systems Engineer.', 'San Francisco, CA (PST)', 3, 1);
