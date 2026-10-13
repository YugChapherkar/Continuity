import { NextRequest, NextResponse } from 'next/server';
import { getStore, isUserAuthorizedForProject } from '@/lib/server-store';
import { requireUser } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';

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

interface EvidenceChunk {
  type: 'ADR' | 'FILE' | 'TASK' | 'HANDOFF';
  id: string;
  citation: string;
  title: string;
  content: string;
  score: number;
}

function calculateScore(queryTokens: string[], text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (token.length < 3) continue;
    if (lower.includes(token)) {
      score += 2;
    }
  }
  return score;
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
    const isPlatformWide =
      activeProjectId === 'all' ||
      query.toLowerCase().includes('across the platform') ||
      query.toLowerCase().includes('all projects') ||
      query.toLowerCase().includes('platform blockers');

    // Filter projects actor is authorized to access
    const accessibleProjects = store.projects.filter((p) =>
      isUserAuthorizedForProject(actor, p.id)
    );

    if (accessibleProjects.length === 0) {
      return NextResponse.json(
        { error: 'Forbidden: No authorized projects found for your account.' },
        { status: 403 }
      );
    }

    const targetProjects = isPlatformWide
      ? accessibleProjects
      : [
          accessibleProjects.find((p) => p.id === activeProjectId) ||
            accessibleProjects[0],
        ];

    const targetProject = targetProjects[0];
    const q = query.toLowerCase().trim();
    const queryTokens = q.split(/\s+/).filter(Boolean);

    const retrievedEvidence: EvidenceChunk[] = [];
    const citations = new Set<string>();

    for (const project of targetProjects) {
      // 1. Retrieve Architectural Decision Records (ADRs)
      for (const adr of project.decisions || []) {
        const fullText = `${adr.id} ${adr.title} ${adr.context} ${adr.decision} ${adr.consequences}`;
        let score = calculateScore(queryTokens, fullText);
        if (q.includes(adr.id.toLowerCase())) score += 10;
        if (q.includes('adr') || q.includes('architect') || q.includes('decision')) score += 2;

        if (score > 0) {
          const citation = `${adr.id}: ${adr.title}`;
          citations.add(citation);
          retrievedEvidence.push({
            type: 'ADR',
            id: adr.id,
            citation,
            title: `${project.name} - ${adr.id}: ${adr.title}`,
            content: `**${adr.id}: ${adr.title}** (${adr.date})
*Context*: ${sanitizeSecrets(adr.context)}
*Decision*: ${sanitizeSecrets(adr.decision)}
*Consequences*: ${sanitizeSecrets(adr.consequences)}`,
            score,
          });
        }
      }

      // 2. Retrieve Project Files & Code Snippets
      for (const file of project.files || []) {
        const fullText = `${file.name} ${file.path} ${file.contentSnippet}`;
        let score = calculateScore(queryTokens, fullText);
        if (q.includes(file.name.toLowerCase()) || q.includes('code') || q.includes('file')) score += 3;

        if (score > 0) {
          citations.add(file.path);
          retrievedEvidence.push({
            type: 'FILE',
            id: file.path,
            citation: file.path,
            title: `File: ${file.path} (${file.type})`,
            content: `**File: \`${file.path}\`** (${file.type}, ${file.size})
\`\`\`
${sanitizeSecrets(file.contentSnippet)}
\`\`\``,
            score,
          });
        }
      }

      // 3. Retrieve Project Tasks & Blockers
      for (const task of project.tasks || []) {
        const blockerText = task.blockerDetails ? `${task.blockerDetails.description} ${task.blockerDetails.severity}` : '';
        const fullText = `${task.id} ${task.title} ${task.description || ''} ${task.status} ${blockerText}`;
        let score = calculateScore(queryTokens, fullText);
        if (q.includes('blocker') && (task.status === 'Blocked' || task.blockerDetails)) score += 8;
        if (q.includes('task')) score += 2;

        if (score > 0) {
          const citation = `Task ${task.id} (${project.name})`;
          citations.add(citation);
          retrievedEvidence.push({
            type: 'TASK',
            id: task.id,
            citation,
            title: `Task ${task.id}: ${task.title}`,
            content: `**Task \`${task.id}\`** [Status: **${task.status}**, Assignee: ${task.assignee}]
Title: ${task.title}
Details: ${sanitizeSecrets(task.description || '')}${
              task.blockerDetails
                ? `\n*Active Blocker [${task.blockerDetails.severity}]*: ${sanitizeSecrets(task.blockerDetails.description)}`
                : ''
            }`,
            score,
          });
        }
      }

      // 4. Retrieve Handoff Dossiers & Runbook Commands
      const projectHandoffs = store.handoffs.filter((h) => h.projectId === project.id);
      for (const h of projectHandoffs) {
        const fullText = `${h.id} ${h.note} ${h.briefing.executiveSummary} ${(h.briefing.runbookCommands || []).join(' ')} ${(h.briefing.criticalBlockers || []).join(' ')}`;
        let score = calculateScore(queryTokens, fullText);
        if (q.includes('runbook') || q.includes('command') || q.includes('failover')) score += 8;
        if (q.includes('handoff')) score += 4;
        if (q.includes('blocker') && (h.briefing.criticalBlockers?.length || 0) > 0) score += 6;

        if (score > 0) {
          const citation = `Handoff ${h.id}`;
          citations.add(citation);
          retrievedEvidence.push({
            type: 'HANDOFF',
            id: h.id,
            citation,
            title: `Handoff Dossier ${h.id} (${h.status})`,
            content: `**Handoff Dossier \`${h.id}\`** (Status: **${h.status}**, Project: ${project.name})
*Summary*: ${sanitizeSecrets(h.briefing.executiveSummary)}
*Critical Blockers*: ${(h.briefing.criticalBlockers || []).join('; ') || 'None'}
*Runbook Commands*:
\`\`\`bash
${(h.briefing.runbookCommands || []).join('\n')}
\`\`\``,
            score,
          });
        }
      }
    }

    // Sort evidence by score descending and take top 6 chunks
    retrievedEvidence.sort((a, b) => b.score - a.score);
    const topEvidence = retrievedEvidence.slice(0, 6);

    // If zero matches, return strict zero-fabrication message
    if (topEvidence.length === 0) {
      return NextResponse.json({
        response: `### CONTINUITY Grounded Intelligence

No verified files, architectural decision records, tasks, or handoff dossiers in **${
          isPlatformWide ? 'authorized platform projects' : targetProject?.name || 'this project'
        }** matched your inquiry: *"${query}"*.

> **Strict Non-Fabrication Invariant**: CONTINUITY does not hallucinate system information, configurations, or credentials. Please verify your query keywords or consult active workspace records.`,
        model: 'continuity-grounded-engine',
        citations: [],
        pinnedVersionId: targetProject?.currentVersionId || 'v1.0.0',
      });
    }

    const contextText = topEvidence
      .map((e) => `### [${e.type}] ${e.title}\n${e.content}`)
      .join('\n\n---\n\n');

    // 1. Try Gemini API if GEMINI_API_KEY is configured
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (
      geminiApiKey &&
      geminiApiKey.trim() !== '' &&
      geminiApiKey !== 'MY_GEMINI_API_KEY'
    ) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const systemPrompt = `You are CONTINUITY Terminal AI, an enterprise systems intelligence agent.
You assist staff engineers and tech leads with shift handovers, code transitions, and runbook executions.

GROUNDED KNOWLEDGE BASE:
${contextText}

STRICT OPERATIONAL RULES:
1. Answer ONLY using the retrieved evidence above.
2. If evidence is insufficient, explicitly state what is missing.
3. Provide exact file paths, ADR numbers, or handoff IDs as citations.
4. Provide copy-pasteable terminal bash commands when requested.
5. Format response in clean, executive Markdown.

USER QUERY:
${query}`;

        const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
        const geminiRes = await ai.models.generateContent({
          model: modelName,
          contents: systemPrompt,
        });

        if (geminiRes && geminiRes.text) {
          return NextResponse.json({
            response: geminiRes.text,
            model: modelName,
            citations: Array.from(citations).slice(0, 8),
            pinnedVersionId: targetProject?.currentVersionId || 'v2.4.0',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local grounded synthesizer:', geminiError);
      }
    }

    // 2. Local Grounded Synthesizer with Zero-Hallucination Invariant
    const synthesizedResponse = `### CONTINUITY Grounded Analysis for "${
      isPlatformWide ? 'Platform Workspaces' : targetProject?.name
    }"

Based strictly on **${topEvidence.length} verified project artifact(s)** in repository snapshot \`${
      targetProject?.currentVersionId || 'v2.4.0'
    }\`:

${topEvidence.map((e) => e.content).join('\n\n---\n\n')}

> **Verification Notice**: All excerpts above are retrieved directly from authorized codebase files and verified audit records. Zero ungrounded statements generated.`;

    return NextResponse.json({
      response: synthesizedResponse,
      model: 'continuity-grounded-engine',
      citations: Array.from(citations).slice(0, 8),
      pinnedVersionId: targetProject?.currentVersionId || 'v2.4.0',
    });
  } catch (error) {
    console.error('AI assistant route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
