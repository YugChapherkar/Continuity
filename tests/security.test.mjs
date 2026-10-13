import test from 'node:test';
import assert from 'node:assert/strict';
import { SignJWT } from 'jose';
import { NextRequest } from 'next/server';

// Ensure JWT_SECRET is set for the test environment
const TEST_JWT_SECRET = 'continuity-enterprise-secret-key-2026-secure-hmac-sha256';
process.env.JWT_SECRET = TEST_JWT_SECRET;

// Dynamic imports to ensure env vars are applied
const { middleware } = await import('../middleware.ts');
const { requireUser, signJwtToken } = await import('../lib/auth.ts');
const { POST: postUser } = await import('../app/api/users/route.ts');
const { POST: postProject } = await import('../app/api/projects/route.ts');

const OLD_DEFAULT_SECRET = 'continuity-enterprise-jwt-super-secret-key-change-in-production-2026';

test('Security Verification Suite', async (t) => {
  await t.test('1. No cookie / no authorization header returns 401 on protected API route', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'GET',
    });

    const res = await middleware(req);
    assert.strictEqual(res.status, 401, 'Middleware must return 401 when no auth cookie or header is present');
    
    const body = await res.json();
    assert.match(body.error, /Unauthorized/i, 'Response error must state Unauthorized');
  });

  await t.test('2. A forged x-user-id header changes nothing (still returns 401)', async () => {
    // Attacker tries to impersonate admin using raw header
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'GET',
      headers: {
        'x-user-id': 'user-admin',
      },
    });

    // Test middleware gate
    const mwRes = await middleware(req);
    assert.strictEqual(mwRes.status, 401, 'Middleware must reject request even if forged x-user-id is supplied');

    // Test requireUser directly with forged header
    const directReq = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'GET',
      headers: {
        'x-user-id': 'user-admin',
      },
    });
    const authResult = await requireUser(directReq);
    assert.ok(authResult.error, 'requireUser must reject unauthenticated request with forged x-user-id');
    assert.strictEqual(authResult.error.status, 401, 'requireUser must return 401');
  });

  await t.test('3. A path with dot extension like /api/tasks/x.y still requires auth (returns 401)', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks/x.y', {
      method: 'GET',
    });

    const res = await middleware(req);
    assert.strictEqual(res.status, 401, 'Middleware must require JWT on paths with dots under /api/ and return 401');
  });

  await t.test('4. A forged JWT signed with the old default secret is rejected (returns 401)', async () => {
    // Generate forged token signed with old default secret
    const forgedSecretKey = new TextEncoder().encode(OLD_DEFAULT_SECRET);
    const forgedToken = await new SignJWT({
      sub: 'user-admin',
      email: 'admin@phx.in',
      name: 'Yug Chapherkar',
      role: 'System Administrator',
      systemRole: 'Admin',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(forgedSecretKey);

    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${forgedToken}`,
      },
    });

    const res = await middleware(req);
    assert.strictEqual(res.status, 401, 'Forged JWT signed with old secret must be rejected with 401');
  });

  await t.test('5. Employee calling admin routes returns 403 Forbidden', async () => {
    // Create valid JWT token for regular Employee (Jessica Chauhan)
    const employeeUser = {
      id: 'user-jessica',
      email: 'employee@phx.in',
      name: 'Jessica Chauhan',
      role: 'Senior Distributed Systems Engineer',
      systemRole: 'Employee',
      employeeId: 'CNT-1001',
      department: 'Core Infrastructure',
      teamId: 'team-storage',
    };

    const validEmployeeToken = await signJwtToken(employeeUser);

    // Employee attempts to create new user (admin route POST /api/users)
    const employeeUserReq = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${validEmployeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Attacker Account',
        email: 'attacker@phx.in',
        role: 'Hacker',
      }),
    });

    // Pass through middleware to get injected verified headers
    const mwRes = await middleware(employeeUserReq);
    assert.strictEqual(mwRes.status, 200, 'Middleware permits valid authenticated user to proceed to route handler');

    // Route handler executes with verified Employee identity
    const handlerRes = await postUser(employeeUserReq);
    assert.strictEqual(handlerRes.status, 403, 'Admin route POST /api/users must return 403 when called by Employee');
    
    const handlerBody = await handlerRes.json();
    assert.match(handlerBody.error, /Forbidden/i, 'Error message must state Forbidden for Employee');

    // Employee attempts to create project (admin route POST /api/projects)
    const employeeProjectReq = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${validEmployeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Unauthorized Project',
      }),
    });

    const projectHandlerRes = await postProject(employeeProjectReq);
    assert.strictEqual(projectHandlerRes.status, 403, 'Admin route POST /api/projects must return 403 when called by Employee');
  });
});
