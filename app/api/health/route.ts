import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'UP',
    service: 'Continuity Enterprise Governance Platform',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    features: {
      rbac: true,
      auditLogging: true,
      clientDelivery: true,
      teamLeaderReports: true,
      employeeUpdates: true,
    },
  });
}
