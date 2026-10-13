const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function sync() {
  const data = JSON.parse(fs.readFileSync('storage/continuity_store.json', 'utf8'));
  console.log(`Starting sync of ${data.users.length} users to Prisma SQLite database...`);
  
  for (const u of data.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        systemRole: u.systemRole || (u.isAdmin ? 'Admin' : 'Employee'),
        employeeId: u.employeeId || u.id,
        department: u.department || 'Engineering',
        isAdmin: u.isAdmin || false,
        initials: u.initials || 'EM',
        teamId: u.teamId || null,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        systemRole: u.systemRole || (u.isAdmin ? 'Admin' : 'Employee'),
        employeeId: u.employeeId || u.id,
        department: u.department || 'Engineering',
        isAdmin: u.isAdmin || false,
        initials: u.initials || 'EM',
        teamId: u.teamId || null,
      },
    });
  }

  // Sync teams
  if (data.teams) {
    for (const t of data.teams) {
      await prisma.team.upsert({
        where: { id: t.id },
        update: {
          name: t.name,
          department: t.department,
          leaderId: t.leaderId,
          leaderName: t.leaderName || '',
          status: t.status || 'Active',
          description: t.description || '',
        },
        create: {
          id: t.id,
          name: t.name,
          department: t.department,
          leaderId: t.leaderId,
          leaderName: t.leaderName || '',
          status: t.status || 'Active',
          description: t.description || '',
        },
      });
    }
  }

  const userCount = await prisma.user.count();
  const teamCount = await prisma.team.count();
  console.log(`Synchronization complete! Users: ${userCount}, Teams: ${teamCount}`);
  await prisma.$disconnect();
}

sync().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
