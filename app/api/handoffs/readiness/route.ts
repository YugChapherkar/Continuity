import { NextRequest, NextResponse } from 'next/server';
import { computeHandoverReadiness } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      executiveSummary = '',
      completedItems = [],
      nextSteps = [],
      criticalBlockers = [],
      runbookCommands = [],
      setupInstructions = '',
      files = [],
      note = '',
    } = body;

    const readiness = computeHandoverReadiness({
      executiveSummary,
      completedItems,
      nextSteps,
      criticalBlockers,
      runbookCommands,
      setupInstructions,
      files,
      note,
    });

    return NextResponse.json(readiness);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
