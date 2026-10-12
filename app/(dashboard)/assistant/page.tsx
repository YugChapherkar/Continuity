'use client';

import React, { useState } from 'react';
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
  ExternalLink,
  Code2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: string;
}

export default function AssistantTerminalPage() {
  const { projects } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `CONTINUITY Knowledge Synthesizer initialized.
Grounded in 5 active repositories, 8 ratified Architecture Decision Records (ADRs), and 5 handoff dossiers.

How can I assist your engineering shift handover today? Select an inquiry below or type a custom query.`,
      citations: ['ADR-041', 'HO-2026-089', 'apollo-core'],
      timestamp: 'Ready',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const PROMPT_SUGGESTIONS = [
    'What are the key invariants and risks in transitioning Apollo Core v2.4.0?',
    'Explain ADR-041 trade-offs and the follower read barrier lease mechanism.',
    'List all emergency runbook commands for leader failover verification.',
    'Summarize all critical blockers currently active across the platform.',
  ];

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
        body: JSON.stringify({ query: textToSend }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response || 'No analysis returned.',
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error connecting to knowledge synthesizer. Please try again.',
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F2]">
              AI Knowledge Query Terminal
            </h1>
            <p className="text-xs text-[#A0A09D]">
              Context-anchored citations to ratified ADRs, runbook commands, and handoff invariants.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Gemini 3.8 Intelligence</span>
        </div>
      </div>

      {/* Terminal Conversation Scroll View */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl border transition-all backdrop-blur-md ${
              msg.role === 'assistant'
                ? 'bg-[#0B0D0E]/60 border-white/[0.08] text-neutral-200'
                : 'bg-blue-600/10 border-blue-500/25 text-white ml-8 sm:ml-16'
            }`}
          >
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                {msg.role === 'assistant' ? (
                  <>
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-mono">CONTINUITY SYNTHESIZER</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300">ENGINEER QUERY</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-neutral-500">{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyText(msg.content, i)}
                    className="p-1 text-neutral-500 hover:text-white rounded hover:bg-white/5 transition-colors"
                    title="Copy response"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-neutral-300">
              {msg.content}
            </div>

            {/* Citations Footer */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-neutral-500 font-mono">Grounding Citations:</span>
                {msg.citations.map((cite, cIdx) => (
                  <span
                    key={cIdx}
                    className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono"
                  >
                    {cite}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 text-xs text-neutral-400 font-mono flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
            <span>Parsing repository trees, ADR decision matrices, and handoff dossiers...</span>
          </div>
        )}
      </div>

      {/* Suggested Queries Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] text-neutral-500 shrink-0 flex items-center gap-1 font-mono">
          <Sparkles className="w-3 h-3 text-blue-400" /> Prompt:
        </span>
        {PROMPT_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-[11px] text-neutral-300 whitespace-nowrap transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="shrink-0 bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-2.5 flex items-center gap-3">
        <input
          type="text"
          placeholder="Ask anything about architecture decisions, runbook commands, or shift handover..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-[#F5F5F2] placeholder-neutral-500 focus:outline-none font-mono"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
