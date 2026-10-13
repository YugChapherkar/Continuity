/**
 * Continuity Database Seed Script
 * Populates the system with core users, teams, and initial platform state.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const USERS = [
  {
    id: 'user-admin',
    name: 'Yug Chapherkar',
    email: 'admin@phx.in',
    employeeId: 'ADM-0001',
    role: 'System Administrator & Executive Sponsor',
    systemRole: 'Admin',
    passwordHash: '$2b$10$1v3Zr4dJRalS1.f6Mnctg.GIMgNBaVZA8qu6oDcj8bfCSK79wK9rK', // 12345678
    department: 'Platform Administration & Executive Leadership',
    isAdmin: true,
    initials: 'YC',
  },
  {
    id: 'user-marcus',
    name: 'Marcus Vance',
    email: 'lead@phx.in',
    employeeId: 'TL-1001',
    role: 'Project Lead & Staff Systems Architect',
    systemRole: 'Team Leader',
    passwordHash: '$2b$10$Z0HDAbgQ2H3zdvqRTy3eLeJIPKWWwWfyMMv1kn/ShRzrFG0BgV4S6', // 12345678
    department: 'Distributed Storage & Consensus',
    isAdmin: false,
    initials: 'MV',
    teamId: 'team-storage',
  },
  {
    id: 'user-jessica',
    name: 'Jessica Chauhan',
    email: 'employee@phx.in',
    employeeId: 'CNT-1001',
    role: 'Senior Distributed Systems Engineer',
    systemRole: 'Employee',
    passwordHash: '$2b$10$MOzWoEU6fBgGG1PdD/zUYO4SKeNm0obrUDaol2yczZrtRevwmWgZC', // 12345678
    department: 'Platform Architecture & Core Infrastructure',
    isAdmin: false,
    initials: 'JC',
    teamId: 'team-storage',
  },
];

const TEAMS = [
  {
    id: 'team-storage',
    name: 'Consensus & Distributed Storage Pod',
    description: 'Distributed systems engineers responsible for Raft state machine replication and WAL persistence.',
    department: 'Core Infrastructure',
    leaderId: 'user-marcus',
    leaderName: 'Marcus Vance',
    status: 'Active',
  },
];

async function seed() {
  console.log('[Seed] Seeding Continuity database...');

  for (const team of TEAMS) {
    await prisma.team.upsert({
      where: { id: team.id },
      update: team,
      create: team,
    });
    console.log(`[Seed] Seeded team: ${team.name}`);
  }

  for (const user of USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
    console.log(`[Seed] Seeded user: ${user.name} (${user.email})`);
  }

  console.log('[Seed] Database seeding completed successfully.');
}

seed()
  .catch((err) => {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
