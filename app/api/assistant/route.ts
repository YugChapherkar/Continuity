import { NextRequest, NextResponse } from 'next/server';
import { getStore, isUserAuthorizedForProject } from '@/lib/server-store';
import { requireUser } from '@/lib/auth';

const SECRET_PATTERNS = [
  /password\s*[:=]\s*['"][^'"]+['"]/gi,
  /secret\s*[:=]\s*['"][^'"]+['"]/gi,
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  /bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi,
  /ghp_[a-zA-Z0-9]{36}/gi,
];

function sanitizeSecrets(text: string): string {
  let clean = text;
  for (const pattern of SECRET_PATTERNS) {
    clean = clean.replace(pattern, '[REDACTED_SECRET]');
  }
  return clean;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.error) return auth.error;
    const actor = auth.user;

    const { query, activeProjectId } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const store = getStore();
    const projectId = activeProjectId || 'apollo-core';
    const project = store.projects.find((p) => p.id === projectId) || store.projects[0];

    // Authorization check: ensure actor has permission to access this project's files
    if (project && !isUserAuthorizedForProject(actor, project.id)) {
      return NextResponse.json(
        {
          error: 'Forbidden: You do not have authorization to query files or decisions for this project.',
        },
        { status: 403 }
      );
    }

    const q = query.toLowerCase().trim();
    const citations: string[] = [];
    const matchedEvidence: string[] = [];

    if (project) {
      // 1. Search Architectural Decision Records (ADRs)
      for (const adr of project.decisions || []) {
        const adrText = `${adr.id} ${adr.title} ${adr.context} ${adr.decision} ${adr.consequences}`.toLowerCase();
        if (
          q.includes(adr.id.toLowerCase()) ||
          q.split(' ').some((word) => word.length > 3 && adrText.includes(word))
        ) {
          citations.push(`${adr.id}: ${adr.title}`);
          matchedEvidence.push(
            `**${adr.id}: ${adr.title}** (${adr.date})\n*Context*: ${sanitizeSecrets(adr.context)}\n*Decision*: ${sanitizeSecrets(adr.decision)}\n*Consequences*: ${sanitizeSecrets(adr.consequences)}`
          );
        }
      }

      // 2. Search Project Files & Codebase Snippets
      for (const file of project.files || []) {
        const fileText = `${file.name} ${file.path} ${file.contentSnippet}`.toLowerCase();
        if (
          q.includes(file.name.toLowerCase()) ||
          q.split(' ').some((word) => word.length > 3 && fileText.includes(word))
        ) {
          citations.push(file.path);
          matchedEvidence.push(
            `**File: \`${file.path}\`** (${file.type}, ${file.size})\n\`\`\`\n${sanitizeSecrets(file.contentSnippet)}\n\`\`\``
          );
        }
      }

      // 3. Search Project Tasks
      for (const task of project.tasks || []) {
        const taskText = `${task.id} ${task.title} ${task.description || ''} ${task.status}`.toLowerCase();
        if (
          q.includes(task.id.toLowerCase()) ||
          q.split(' ').some((word) => word.length > 3 && taskText.includes(word))
        ) {
          citations.push(`${task.id} (${task.title})`);
          matchedEvidence.push(
            `**Task \`${task.id}\`**: ${task.title} [Status: **${task.status}**, Assignee: ${task.assignee}]\n${sanitizeSecrets(task.description || '')}`
          );
        }
      }

      // 4. Search Project Handoffs
      const projectHandoffs = store.handoffs.filter((h) => h.projectId === project.id);
      for (const h of projectHandoffs) {
        const hText = `${h.id} ${h.note} ${h.briefing.executiveSummary}`.toLowerCase();
        if (
          q.includes(h.id.toLowerCase()) ||
          q.split(' ').some((word) => word.length > 3 && hText.includes(word))
        ) {
          citations.push(`Handoff Dossier ${h.id}`);
          matchedEvidence.push(
            `**Handoff Dossier \`${h.id}\`** (Status: **${h.status}**)\n*Summary*: ${sanitizeSecrets(h.briefing.executiveSummary)}\n*Runbooks*: ${h.briefing.runbookCommands.join('; ')}`
          );
        }
      }
    }

    // Grounded synthesis with zero-fabrication invariant
    if (matchedEvidence.length === 0) {
      return NextResponse.json({
        response: `### CONTINUITY Grounded Intelligence

No verified files, architectural decision records, tasks, or handoffs in **${project?.name || 'this project'}** matched your query: *"${query}"*.

> **Strict Non-Fabrication Invariant**: CONTINUITY does not hallucinate system information or credentials. Please check authorized project documentation or file paths in the Workspace Manager.`,
        model: 'continuity-grounded-engine',
        citations: [],
        pinnedVersionId: project?.currentVersionId || 'v1.0.0',
      });
    }

    const synthesizedResponse = `### CONTINUITY Grounded Analysis for "${project?.name}"

Based strictly on **${matchedEvidence.length} verified project artifact(s)** in repository snapshot \`${project?.currentVersionId || 'v2.4.0'}\`:

${matchedEvidence.join('\n\n---\n\n')}

> **Verification Notice**: All excerpts above are retrieved directly from authorized codebase files and verified audit records. Zero ungrounded statements generated.`;

    return NextResponse.json({
      response: synthesizedResponse,
      model: 'continuity-grounded-engine',
      citations: Array.from(new Set(citations)),
      pinnedVersionId: project?.currentVersionId || 'v2.4.0',
    });
  } catch (error) {
    console.error('AI assistant route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
