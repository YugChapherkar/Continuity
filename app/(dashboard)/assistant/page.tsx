'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Terminal,
  Send,
  Sparkles,
  Copy,
  Check,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Key,
  Database,
  Layers,
  ChevronDown,
  Trash2,
  Cpu,
  BookOpen,
  Info,
  X,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  model?: string;
  timestamp: string;
}

interface KnowledgeStatus {
  projectId: string;
  versionId: string;
  status: string;
  fileCount: number;
  lastIndexedAt: string | null;
  errorMessage?: string | null;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', badge: 'Live Google GenAI', icon: Sparkles },
  { id: 'continuity-rag-engine', name: 'Continuity Grounded RAG', badge: 'Deterministic Proof', icon: ShieldCheck },
];

export default function AssistantTerminalPage() {
  const { projects } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('apollo-core');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
  );
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [knowledgeStatus, setKnowledgeStatus] = useState<KnowledgeStatus | null>(null);
  const [isReindexing, setIsReindexing] = useState<boolean>(false);
  const [reindexMessage, setReindexMessage] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### CONTINUITY Grounded Intelligence Terminal
Initialized for **Apollo Core Distributed Consensus** (\`v2.4.0\`).

Anchored in ratified **Architecture Decision Records (ADR-041, ADR-039)**, Linux kernel **\`io_uring\`** WAL persistence, active handoff **HO-2026-089**, and real-time task deadlines.

Select a prompt suggestion below or enter any operational inquiry to begin.`,
      citations: ['ADR-041', 'HO-2026-089', 'src/consensus/raft_state.rs'],
      model: 'continuity-rag-engine',
      timestamp: 'Ready',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Load API key from sessionStorage
  useEffect(() => {
    const savedKey = sessionStorage.getItem('continuity_gemini_key');
    if (savedKey) {
      setGeminiApiKey(savedKey);
    }
  }, []);

  // Fetch knowledge index status whenever project changes
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/assistant?projectId=${selectedProjectId}&versionId=v2.4.0`);
        if (res.ok) {
          const data = await res.json();
          setKnowledgeStatus(data);
        }
      } catch (err) {
        console.error('Failed to load knowledge status', err);
      }
    };
    fetchStatus();
  }, [selectedProjectId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const saveApiKey = (key: string) => {
    setGeminiApiKey(key);
    sessionStorage.setItem('continuity_gemini_key', key);
    setShowKeyModal(false);
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    setReindexMessage(null);
    try {
      const res = await fetch(`/api/assistant?projectId=${selectedProjectId}&versionId=v2.4.0&import=true`);
      if (res.ok) {
        const data = await res.json();
        setKnowledgeStatus(data);
        setReindexMessage(`Successfully re-indexed ${data.fileCount} source files!`);
        setTimeout(() => setReindexMessage(null), 4000);
      }
    } catch {
      setReindexMessage('Failed to trigger re-index');
      setTimeout(() => setReindexMessage(null), 3000);
    } finally {
      setIsReindexing(false);
    }
  };

  const getSuggestions = () => {
    switch (selectedProjectId) {
      case 'sentinel-gateway':
        return [
          'Explain Envoy WASM token auth filter in wasm_auth.cc',
          'How does eBPF sockops bypass host TCP/IP stack?',
          'Show gateway graceful drain commands',
          'What are the active tasks and blockers for Sentinel?',
        ];
      case 'chronos-ledger':
        return [
          'How does Chronos verify SHA-256 Merkle chain integrity?',
          'Explain Zero-Knowledge Proof handoff attestation',
          'Show audit ledger verification command',
        ];
      case 'krypton-auth':
        return [
          'Explain SPIFFE/SPIRE workload credential rotation',
          'Show mTLS root certificate rotation command',
        ];
      default:
        return [
          'Explain ADR-041 trade-offs and follower speculative read barriers',
          'List emergency runbook commands for leader failover verification',
          'Who are the assigned shift rotation custodians (Jessica, Yash, Shruti)?',
          'What are the active critical blockers and staging host limits?',
          'Explain io_uring WAL flush optimizations in journal_uring.rs',
        ];
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          activeProjectId: selectedProjectId,
          model: selectedModel,
          apiKey: geminiApiKey,
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response || 'No analysis returned.',
        citations: data.citations || [],
        model: data.model || selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '### Error Connecting to Knowledge Synthesizer\nPlease verify backend connectivity on port 8080 and try again.',
          model: 'error',
          timestamp: 'Error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedCitation(citation);
    setTimeout(() => setCopiedCitation(null), 1500);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `### Terminal Reset\nKnowledge synthesizer reset for **${projects.find((p) => p.id === selectedProjectId)?.name || selectedProjectId}**. Ready for inquiries.`,
        citations: ['ADR-041', 'apollo-core'],
        model: 'continuity-rag-engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Header & Controls Toolbar */}
      <div className="bg-[#121517]/90 dark:bg-[#121517]/90 bg-white/90 backdrop-blur-md border border-neutral-200 dark:border-white/10 rounded-2xl p-4 shrink-0 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Description */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-[#F5F5F2]">
                  Gemini AI RAG Knowledge Terminal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                  v2.5 RAG Controller
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-[#A0A09D]">
                Context-grounded synthesis across codebase ASTs, ratified ADRs, runbooks, and shift handoffs.
              </p>
            </div>
          </div>

          {/* Action Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Project Selector */}
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-[#181C1E] border border-neutral-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
              <Database className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-neutral-900 dark:text-[#F5F5F2] focus:outline-none font-mono text-xs cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#121517]">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-[#181C1E] border border-neutral-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-neutral-900 dark:text-[#F5F5F2] focus:outline-none font-mono text-xs cursor-pointer"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-[#121517]">
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Gemini Key Config Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                geminiApiKey
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                  : 'bg-neutral-100 dark:bg-[#181C1E] hover:bg-neutral-200 dark:hover:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300'
              }`}
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{geminiApiKey ? 'API Key Active' : 'Set Gemini Key'}</span>
            </button>

            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors border border-neutral-200 dark:border-white/10"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Sub-bar */}
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Index: <strong className="text-emerald-600 dark:text-emerald-400">{knowledgeStatus?.status || 'READY'}</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>{knowledgeStatus?.fileCount ?? 6} Indexed Files</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              <span>Version: <strong className="text-neutral-700 dark:text-neutral-200">{knowledgeStatus?.versionId || 'v2.4.0'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {reindexMessage && (
              <span className="text-emerald-500 text-[11px] animate-fade-in font-sans">
                {reindexMessage}
              </span>
            )}
            <button
              onClick={handleReindex}
              disabled={isReindexing}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isReindexing ? 'animate-spin' : ''}`} />
              <span>{isReindexing ? 'Indexing AST & ADRs...' : 'Re-index Knowledge'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Conversation Scroll View */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl border transition-all backdrop-blur-md ${
              msg.role === 'assistant'
                ? 'bg-white/80 dark:bg-[#0B0D0E]/70 border-neutral-200 dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 shadow-sm'
                : 'bg-blue-50 dark:bg-blue-600/15 border-blue-200 dark:border-blue-500/25 text-neutral-900 dark:text-white ml-8 sm:ml-16 shadow-sm'
            }`}
          >
            {/* Header info */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                {msg.role === 'assistant' ? (
                  <>
                    <Bot className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span className="text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                      CONTINUITY SYNTHESIZER
                    </span>
                    {msg.model && (
                      <span className="px-2 py-0.5 text-[10px] rounded-md font-mono bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400">
                        {msg.model}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-neutral-700 dark:text-neutral-300">ENGINEER QUERY</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyText(msg.content, i)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                    title="Copy response"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Markdown Body */}
            <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-neutral-800 dark:text-neutral-300 break-words">
              {msg.content}
            </div>

            {/* Citations Footer */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-white/[0.06] flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-neutral-500 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Grounding Citations:
                </span>
                {msg.citations.map((cite, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => copyCitation(cite)}
                    className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 font-mono transition-colors flex items-center gap-1"
                    title="Click to copy citation anchor"
                  >
                    <span>{cite}</span>
                    {copiedCitation === cite ? (
                      <Check className="w-2.5 h-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 opacity-60" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="bg-white/80 dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-neutral-200 dark:border-white/[0.08] rounded-2xl p-5 text-xs text-neutral-600 dark:text-neutral-400 font-mono flex items-center gap-3 shadow-sm animate-pulse">
            <RefreshCw className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-spin" />
            <span>Parsing repository ASTs, ADR decision matrices, and handoff invariants via RAG...</span>
          </div>
        )}
      </div>

      {/* Suggested Queries Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 shrink-0 flex items-center gap-1 font-mono">
          <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" /> Prompts:
        </span>
        {getSuggestions().map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="px-3 py-1.5 bg-white/70 dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.08] border border-neutral-200 dark:border-white/[0.08] rounded-xl text-[11px] text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition-colors shadow-2xs"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="shrink-0 bg-white/90 dark:bg-[#0B0D0E]/80 backdrop-blur-md border border-neutral-200 dark:border-white/[0.08] rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
        <input
          type="text"
          placeholder="Ask anything about architecture decisions, runbook commands, or shift handover..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-neutral-900 dark:text-[#F5F5F2] placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none font-mono"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#141718] border border-neutral-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                  Google Gemini API Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong>CONTINUITY</strong> includes a built-in deterministic RAG knowledge synthesis engine. If you want to connect directly to Google Gemini via the official <code>google-genai</code> Java SDK, enter your Gemini API key below:
            </p>

            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">
                GEMINI_API_KEY
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#1C2022] border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-[10px] text-neutral-400">
                Key is saved in browser session storage and forwarded to the backend RAG controller.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setGeminiApiKey('');
                  sessionStorage.removeItem('continuity_gemini_key');
                  setShowKeyModal(false);
                }}
                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                Clear Key
              </button>
              <button
                onClick={() => saveApiKey(geminiApiKey)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
