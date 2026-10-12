'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Layers,
  FileText,
  Users,
  CheckSquare,
  Activity,
  Bot,
  GitCommit,
  GitPullRequest,
  Lock,
  ChevronRight,
  Terminal,
  Zap,
  CornerDownRight,
  ShieldAlert,
  FolderGit2,
  PackageCheck,
  Check,
  Sun,
  Moon,
  ShoppingBag,
  Plus,
  ChevronDown,
} from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated, currentUser, logout, theme, toggleTheme } = useApp();
  const isLight = theme === 'light';
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText('./bin/ctl cluster status --verify-linearizability');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans antialiased overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-900 ${
        isLight
          ? 'bg-[#F8FAFC] text-[#0B132B]'
          : 'bg-[#070914] text-[#F3F4F6] selection:text-white selection:bg-indigo-500/40'
      }`}
    >
      {/* =========================================================================
          1. FLOATING PILL NAVBAR (Marklab Exact Screenshot Match)
         ========================================================================= */}
      <header className="fixed top-5 left-0 right-0 z-50 px-4 sm:px-6">
        <nav className="max-w-4xl mx-auto backdrop-blur-2xl bg-[#111428]/80 hover:bg-[#111428]/90 border border-white/10 rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_16px_36px_rgba(0,0,0,0.5)] transition-all">
          {/* Logo Brand: Lilac circle with plus + Marklab */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-full bg-[#E9D5FF] text-[#1E1B4B] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white font-sans-clean">
              Marklab
            </span>
          </Link>

          {/* Desktop Navigation Links: Pages v, About, Works, Pricing, Blog */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-200/90 hover:text-white transition-colors">
            <a href="#pages" className="hover:text-white flex items-center gap-1 transition-colors">
              <span>Pages</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#works" className="hover:text-white transition-colors">
              Works
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#blog" className="hover:text-white transition-colors">
              Blog
            </a>
          </div>

          {/* Right Action: Cart with 0 badge + Send Inquary button */}
          <div className="flex items-center gap-4">
            {/* Cart Icon with Notification Badge */}
            <div className="relative text-slate-200 hover:text-white cursor-pointer transition-colors" title="Cart (0 items)">
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#6366F1] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                0
              </span>
            </div>

            {/* Send Inquary Button */}
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="bg-[#2A314A]/90 hover:bg-[#353D5C] border border-white/10 text-white text-xs sm:text-sm font-semibold pl-4 pr-1.5 py-1.5 rounded-full flex items-center gap-2.5 shadow-sm transition-all group cursor-pointer"
            >
              <span>{isAuthenticated ? 'Dashboard' : 'Send Inquary'}</span>
              <span className="w-6 h-6 rounded-full bg-white text-[#0B0D17] flex items-center justify-center font-bold text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                ↗
              </span>
            </Link>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          2. HERO SECTION (Exact Screenshot Match: Marketing that moves the Needle)
         ========================================================================= */}
      <section
        className="relative min-h-[92vh] flex flex-col justify-center items-center pt-36 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden text-center"
        style={{
          background: 'radial-gradient(circle at 18% 45%, rgba(68, 51, 239, 0.9) 0%, rgba(35, 25, 140, 0.55) 40%, rgba(10, 13, 30, 0.98) 75%), radial-gradient(circle at 82% 35%, rgba(85, 45, 210, 0.45) 0%, rgba(10, 13, 30, 0.92) 70%), #0A0D1E',
        }}
      >
        {/* Atmospheric Glowing Light Meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[450px] bg-gradient-to-tr from-indigo-600/35 via-purple-600/25 to-blue-500/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-16 left-10 w-80 h-80 bg-blue-600/25 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-24 right-10 w-[420px] h-[420px] bg-purple-600/20 blur-[130px] pointer-events-none rounded-full" />

        {/* Ethereal bottom lavender-white ambient mist matching screenshot */}
        <div className="absolute bottom-0 left-0 right-0 h-64 sm:h-80 bg-gradient-to-t from-[#DDE3FD]/90 via-[#9BA3FB]/25 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 -translate-x-1/2 w-[550px] h-[280px] bg-white/70 blur-[90px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto relative z-10 text-center w-full">
          {/* Main Editorial Headline: Marketing that moves the Needle */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[110px] lg:leading-[121px] font-medium tracking-tight text-white text-center max-w-5xl mx-auto font-tasaorbiter select-none">
            Marketing that <br />
            <span className="font-instrumentserif italic font-normal tracking-tight text-white text-5xl sm:text-7xl md:text-8xl lg:text-[110px] lg:leading-[121px]">
              moves the{' '}
            </span>
            <span className="font-tasaorbiter font-medium not-italic text-white">Needle</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 sm:mt-8 max-w-xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-slate-300 font-normal text-center select-none">
            All project here is designed to deliver impact—not just impressions.
          </p>

          {/* Action Buttons with Left Curved Arrow Annotation */}
          <div className="mt-10 sm:mt-12 flex items-center justify-center gap-6 sm:gap-8 relative z-20">
            {/* Hand-drawn White Curved Arrow pointing up-right at the button */}
            <div className="hidden sm:block absolute -left-20 lg:-left-24 top-1/2 -translate-y-1/2 pointer-events-none select-none">
              <svg className="w-16 h-12 text-white/90 drop-shadow-sm" viewBox="0 0 65 45" fill="none">
                <path d="M12 36 C 20 20, 38 14, 54 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M45 11 L 54 18 L 47 25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Primary "Let's Contact" White Pill Button with Black Circle Arrow */}
            <Link
              href="/login"
              className="bg-white hover:bg-slate-100 text-[#0B0D17] font-semibold pl-6 pr-2 py-2.5 sm:py-3 text-sm sm:text-base rounded-full shadow-[0_12px_32px_rgba(255,255,255,0.25)] flex items-center gap-3.5 group transition-all cursor-pointer"
            >
              <span>Let&apos;s Contact</span>
              <span className="w-8 h-8 rounded-full bg-[#141724] text-white flex items-center justify-center font-bold text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                ↗
              </span>
            </Link>

            {/* Secondary "Book a call ↗" Link */}
            <a
              href="#continuity-showcase"
              className="text-white hover:text-indigo-200 font-medium text-sm sm:text-base flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>Book a call</span>
              <span className="text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </a>
          </div>

          {/* 3D Ambient Bell Floating on Right (Screenshot Exact Match) */}
          <div className="hidden md:block absolute right-6 lg:right-16 bottom-6 lg:bottom-12 select-none pointer-events-none animate-float z-20">
            <div className="relative w-32 h-32 lg:w-44 lg:h-44 drop-shadow-[0_25px_45px_rgba(0,0,0,0.6)]">
              <img
                src="/marklab-bell.jpg"
                alt="Marklab Notification Bell"
                className="w-full h-full object-contain rounded-3xl"
              />
            </div>
          </div>
        </div>

        {/* Fixed "Made in Webflow" Badge on Bottom Right */}
        <div className="fixed bottom-4 right-4 z-40 bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg border border-slate-200/80 hover:bg-slate-50 transition-all select-none cursor-pointer">
          <svg className="w-4 h-3 text-[#146EF5]" viewBox="0 0 16 12" fill="currentColor">
            <path d="M12.9 0L9.8 8.1 7.4 0H4.3L1.2 8.1 0 0h-.2v12h3.5L5.8 4.2 8.3 12h3.4l2.5-7.8L16 12h.2V0h-3.3z" />
          </svg>
          <span>Made in Webflow</span>
        </div>
      </section>

      {/* =========================================================================
          CONTINUITY PLATFORM EXPANSION & INTERACTIVE HANDOVER SHOWCASE
         ========================================================================= */}
      <section
        id="continuity-showcase"
        className={`py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t transition-colors duration-300 ${
          isLight
            ? 'bg-[#F8FAFC] border-slate-200/80 text-[#0B132B]'
            : 'bg-[#090C1A] border-white/10 text-white'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Transition Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono backdrop-blur-md ${
                isLight
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'bg-white/5 border border-white/10 text-indigo-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Continuity Engineering Platform &bull; Zero-Loss Shift Handovers</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Work moves forward. <br />
              <span className="font-editorial italic font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-200 dark:via-indigo-100 dark:to-purple-200">
                Knowledge stays.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Every handover should move work forward, not send teams back to square one. Continuity preserves project history, decisions, files, and pending tasks so the next person can continue without starting from scratch.
            </p>
          </div>

          {/* Handover Centerpiece Card */}
          <div
            className={`rounded-[2rem] p-4 sm:p-7 md:p-8 relative overflow-hidden backdrop-blur-xl transition-all duration-300 ${
              isLight
                ? 'bg-white/95 border border-slate-200/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] text-slate-800'
                : 'bg-[#0E1326]/90 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.6)] text-slate-200'
            }`}
          >
            {/* Top Meta Bar */}
            <div
              className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-6 text-xs font-mono ${
                isLight ? 'border-slate-200/80 text-slate-500' : 'border-white/[0.08] text-slate-400'
              }`}
            >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                    PROJECT: APOLLO-CORE
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">
                    Version Pin: <strong className={isLight ? 'text-slate-900' : 'text-white'}>v2.4.0 (Active)</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Atomic Custody Handover</span>
                </div>
              </div>

              {/* Main Handover Transfer Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
                {/* 1. SENDER CARD (Outgoing Custodian) - 5 Cols */}
                <div
                  className={`lg:col-span-5 rounded-2xl p-5 space-y-4 relative ${
                    isLight
                      ? 'bg-gradient-to-br from-[#F5F8FF] to-[#FAF5FF] border border-slate-200/90 shadow-sm'
                      : 'bg-white/[0.03] border border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        JC
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Jessica Chauhan
                        </div>
                        <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Senior Distributed Systems Engineer
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                      Outgoing Custodian
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border space-y-2 ${
                      isLight ? 'bg-white border-slate-200/80 text-slate-700' : 'bg-[#090C1A] border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      TASK-102 · Raft Split-Brain Chaos Simulation
                    </div>
                    <div className="text-xs leading-relaxed font-normal">
                      Shift rotation handover: Chaos Mesh 4-node split-brain test suite ready for staging cluster execution.
                    </div>
                  </div>

                  {/* Completed Items */}
                  <div>
                    <div
                      className={`text-[11px] font-mono uppercase tracking-wider mb-2 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Completed Work Context
                    </div>
                    <div className={`space-y-1.5 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Verified io_uring WAL flush persistence on node-04</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Automated blackbox linearizability verification test</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Compiled chaos partition manifest (yaml)</span>
                      </div>
                    </div>
                  </div>

                  {/* Readiness Badge */}
                  <div
                    className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
                      isLight ? 'border-slate-200/80 text-slate-500' : 'border-white/5 text-slate-400'
                    }`}
                  >
                    <span>Readiness Score</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      100% Ready (6/6 Checks Passed)
                    </span>
                  </div>
                </div>

                {/* 2. TRANSFER CONDUIT (Center Bridge) - 1 Col */}
                <div className="lg:col-span-1 flex lg:flex-col items-center justify-center gap-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30 text-white animate-pulse">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className={`text-[10px] font-mono uppercase tracking-widest text-center hidden lg:block ${
                      isLight ? 'text-indigo-600 font-semibold' : 'text-indigo-300'
                    }`}
                  >
                    Lossless
                  </div>
                </div>

                {/* 3. RECIPIENT CARD (Incoming Custodian) - 5 Cols */}
                <div
                  className={`lg:col-span-5 rounded-2xl p-5 space-y-4 relative ${
                    isLight
                      ? 'bg-gradient-to-br from-[#F5F8FF] to-[#FAF5FF] border border-slate-200/90 shadow-sm'
                      : 'bg-white/[0.03] border border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        MV
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Marcus Vance
                        </div>
                        <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Lead Infrastructure Architect
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                      Incoming Custodian
                    </span>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <div
                      className={`text-[11px] font-mono uppercase tracking-wider mb-2 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Immediate Next Steps
                    </div>
                    <div
                      className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                        isLight ? 'bg-white border-slate-200/80 text-slate-700' : 'bg-[#090C1A] border-white/5 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-mono">01.</span>
                        <span>Execute 4-node network partition test during off-peak window</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-mono">02.</span>
                        <span>Verify leader election failover latency under 80k rps</span>
                      </div>
                    </div>
                  </div>

                  {/* Runbook Command */}
                  <div className="space-y-1">
                    <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Runbook Execution:
                    </div>
                    <div
                      onClick={handleCopy}
                      className={`p-2.5 rounded-lg border font-mono text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isLight
                          ? 'bg-slate-100/90 border-slate-300 text-slate-800 hover:border-indigo-400'
                          : 'bg-black/60 border-white/10 text-indigo-200 hover:border-indigo-400/50'
                      }`}
                      title="Click to copy command"
                    >
                      <span className="truncate">./bin/ctl cluster status --verify</span>
                      <span className={`text-[10px] shrink-0 ml-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {copiedCmd ? 'Copied!' : 'Copy'}
                      </span>
                    </div>
                  </div>

                  {/* Acceptance Action Buttons */}
                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href="/login"
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs text-center shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Accept Handover</span>
                      <span>↗</span>
                    </Link>
                    <Link
                      href="/login"
                      className={`py-2 px-3 rounded-xl text-xs text-center border transition-colors ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          : 'bg-white/[0.05] hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      Ask Clarification
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom Invariant Banner */}
              <div
                className={`mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
                  isLight ? 'border-slate-200/80 text-slate-500' : 'border-white/[0.08] text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Core Guarantee: Handover dispatch preserves sender ownership until recipient acceptance.
                  </span>
                </div>
                <span className={isLight ? 'text-indigo-600 font-semibold' : 'text-indigo-300'}>
                  SHA-256 Chained Integrity Verified
                </span>
              </div>
            </div>
          </div>
        </section>

      {/* =========================================================================
          3. PRODUCT INTRODUCTION (Spacious Split Layout, Screenshot 2 Style)
         ========================================================================= */}
      <section
        id="product"
        className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative transition-colors duration-300 ${
          isLight ? 'bg-white' : 'bg-[#090C1A]'
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="max-w-3xl">
            <span
              className={`text-xs font-mono uppercase tracking-widest font-semibold ${
                isLight ? 'text-blue-600' : 'text-indigo-400'
              }`}
            >
              The Continuity Advantage
            </span>
            <h2
              className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mt-3 ${
                isLight ? 'text-[#0B132B]' : 'text-white'
              }`}
            >
              The context behind every project,{' '}
              <span
                className={`font-serif italic font-normal text-transparent bg-clip-text ${
                  isLight
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
                    : 'bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300'
                }`}
              >
                finally connected.
              </span>
            </h2>
            <p
              className={`mt-5 text-base sm:text-lg leading-relaxed font-normal ${
                isLight ? 'text-slate-600' : 'text-slate-300/90'
              }`}
            >
              When engineers rotate shifts, take leave, or transfer projects, critical tribal
              knowledge disappears in fragmented chat channels and undocumented commits. Continuity
              brings tasks, decisions, files, updates, and project history together to prevent
              knowledge loss.
            </p>
          </div>

          {/* Spacious Split Layout (Matching Screenshot 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Big Panel (7 Cols) */}
            <div
              className={`lg:col-span-7 rounded-[2.5rem] p-8 sm:p-10 border shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px] transition-all ${
                isLight
                  ? 'bg-gradient-to-br from-[#EEF2FC] via-[#F4F8FE] to-[#FDF8FE] border-indigo-100/90 shadow-slate-200/60 text-slate-800'
                  : 'bg-gradient-to-br from-[#10142C] via-[#141838] to-[#1C163C] border-white/10 shadow-2xl text-slate-200'
              }`}
            >
              {/* Floating Metric Badge (Screenshot 2 Match) */}
              <div
                className={`inline-flex items-center gap-3 p-3 px-4 rounded-2xl backdrop-blur-md border shadow-md w-fit ${
                  isLight ? 'bg-white/95 border-slate-200/80 text-slate-800' : 'bg-white/[0.08] border-white/10 text-white'
                }`}
              >
                <div>
                  <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Context Retention
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                      isLight ? 'text-[#0B132B]' : 'text-white'
                    }`}
                  >
                    99.8%
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  ↗
                </div>
              </div>

              {/* Editorial Headline */}
              <div className="my-8 space-y-3">
                <h3
                  className={`text-2xl sm:text-4xl font-bold tracking-tight leading-snug ${
                    isLight ? 'text-[#0B132B]' : 'text-white'
                  }`}
                >
                  Choose Continuity for{' '}
                  <span
                    className={`font-serif italic font-normal text-transparent bg-clip-text ${
                      isLight
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        : 'bg-gradient-to-r from-indigo-200 to-purple-200'
                    }`}
                  >
                    Lossless Engineering
                  </span>
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed max-w-lg ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
                  We go beyond standard issue trackers. Every task carries architectural decisions,
                  runbook commands, historical handoffs, and verification evidence so anyone can
                  pick up where you left off.
                </p>
              </div>

              {/* Action Buttons */}
              <div
                className={`flex items-center gap-4 pt-4 border-t ${
                  isLight ? 'border-slate-200/80' : 'border-white/10'
                }`}
              >
                <Link
                  href="/login"
                  className={`text-xs sm:text-sm font-semibold pl-4 pr-1.5 py-1.5 rounded-full flex items-center gap-2 transition-all shadow-md group ${
                    isLight ? 'bg-[#0B132B] text-white hover:bg-slate-800' : 'bg-white text-[#0B0E1E] hover:bg-slate-100'
                  }`}
                >
                  <span>Explore Platform</span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${
                      isLight ? 'bg-white text-[#0B132B]' : 'bg-[#0B0E1E] text-white'
                    }`}
                  >
                    ↗
                  </span>
                </Link>
                <a
                  href="#features"
                  className={`text-xs sm:text-sm transition-colors ${
                    isLight ? 'text-slate-600 hover:text-blue-600' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Learn more ↗
                </a>
              </div>
            </div>

            {/* Right Big Panel (5 Cols) */}
            <div
              className={`lg:col-span-5 rounded-[2.5rem] p-8 sm:p-10 border shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px] transition-all ${
                isLight
                  ? 'bg-gradient-to-br from-[#F0EDFC] via-[#F6F4FD] to-[#FCF8FE] border-purple-100/90 shadow-slate-200/60 text-slate-800'
                  : 'bg-gradient-to-br from-[#121633] via-[#161C40] to-[#1F173D] border-white/10 shadow-2xl text-slate-200'
              }`}
            >
              <div>
                <span
                  className={`text-[11px] font-mono uppercase tracking-widest font-semibold ${
                    isLight ? 'text-purple-600' : 'text-indigo-400'
                  }`}
                >
                  Unified Source of Truth
                </span>
                <h3
                  className={`text-2xl sm:text-3xl font-bold tracking-tight mt-2 leading-snug ${
                    isLight ? 'text-[#0B132B]' : 'text-white'
                  }`}
                >
                  Become the{' '}
                  <span
                    className={`font-serif italic font-normal ${
                      isLight ? 'text-purple-600' : 'text-indigo-200'
                    }`}
                  >
                    Resilient
                  </span>{' '}
                  engineering squad
                </h3>
                <p className={`mt-4 text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
                  Eliminate single points of failure in your personnel. With Continuity, every
                  critical technical decision is indexed, signed, and instantly accessible to the
                  entire pod.
                </p>
              </div>

              {/* Connected Nodes Visual */}
              <div className="space-y-2.5 my-6">
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-white border-slate-200/80 text-slate-700' : 'bg-white/[0.04] border-white/5 text-slate-300'
                  }`}
                >
                  <span className="font-medium">Architecture Decisions (ADRs)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-semibold">
                    Indexed &amp; Cited
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-white border-slate-200/80 text-slate-700' : 'bg-white/[0.04] border-white/5 text-slate-300'
                  }`}
                >
                  <span className="font-medium">Daily Work Journal Updates</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">
                    Active
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-white border-slate-200/80 text-slate-700' : 'bg-white/[0.04] border-white/5 text-slate-300'
                  }`}
                >
                  <span className="font-medium">Pinned Version Snapshots</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono text-[11px] font-semibold">
                    SHA-256 Sealed
                  </span>
                </div>
              </div>

              <div
                className={`text-[11px] font-mono pt-2 border-t ${
                  isLight ? 'border-slate-200/80 text-slate-500' : 'border-white/10 text-slate-400'
                }`}
              >
                100% Verifiable · Cryptographic Chained Audit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURES SECTION (Four Elegant Cards, Screenshot 3 Match)
         ========================================================================= */}
      <section
        id="features"
        className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative transition-colors duration-300 ${
          isLight ? 'bg-[#F8FAFC]' : 'bg-[#070914]'
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-14">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <span
              className={`text-xs font-mono uppercase tracking-widest font-semibold ${
                isLight ? 'text-blue-600' : 'text-indigo-400'
              }`}
            >
              Core Capabilities
            </span>
            <h2
              className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mt-3 ${
                isLight ? 'text-[#0B132B]' : 'text-white'
              }`}
            >
              Smart{' '}
              <span
                className={`font-serif italic font-normal text-transparent bg-clip-text ${
                  isLight
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
                    : 'bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300'
                }`}
              >
                Handover Architecture
              </span>{' '}
              Built for Velocity.
            </h2>
            <p className={`mt-4 text-base sm:text-lg leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
              Four purpose-built systems engineered to safeguard momentum across rotations and milestone deliveries.
            </p>
          </div>

          {/* 4 Elegant Cards Row (Matching Screenshot 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Smart Handovers */}
            <div
              className={`rounded-[2rem] p-7 border shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between min-h-[340px] ${
                isLight
                  ? 'bg-gradient-to-b from-[#F5F8FF] to-[#FFFFFF] border-slate-200/90 hover:border-blue-400 hover:shadow-blue-500/10 text-slate-800'
                  : 'bg-gradient-to-b from-[#10142C] to-[#0D1022] border-white/10 hover:border-indigo-500/40 hover:shadow-indigo-500/20 text-slate-200'
              }`}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 mb-6 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <div
                    className={`w-full h-full rounded-2xl flex items-center justify-center ${
                      isLight ? 'bg-white' : 'bg-[#0E1326]'
                    }`}
                  >
                    <CheckSquare className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>

                <h3
                  className={`text-xl font-bold transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-cyan-300'
                  }`}
                >
                  Smart Handovers
                </h3>
                <p className={`text-xs sm:text-sm mt-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
                  Transfer work with context, blockers, setup instructions, and next steps before signing off. Live
                  6-point readiness checker ensures nothing is missed.
                </p>
              </div>

              <div
                className={`pt-4 border-t text-[11px] font-mono flex items-center gap-1.5 font-semibold ${
                  isLight ? 'border-slate-200/80 text-cyan-600' : 'border-white/5 text-cyan-400'
                }`}
              >
                <span>0–100% Readiness Scoring</span>
              </div>
            </div>

            {/* Card 2: AI Project Assistant */}
            <div
              className={`rounded-[2rem] p-7 border shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between min-h-[340px] ${
                isLight
                  ? 'bg-gradient-to-b from-[#FAF5FF] to-[#FFFFFF] border-slate-200/90 hover:border-purple-400 hover:shadow-purple-500/10 text-slate-800'
                  : 'bg-gradient-to-b from-[#10142C] to-[#0D1022] border-white/10 hover:border-purple-500/40 hover:shadow-purple-500/20 text-slate-200'
              }`}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 p-0.5 shadow-lg shadow-purple-500/25 mb-6 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <div
                    className={`w-full h-full rounded-2xl flex items-center justify-center ${
                      isLight ? 'bg-white' : 'bg-[#0E1326]'
                    }`}
                  >
                    <Bot className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>

                <h3
                  className={`text-xl font-bold transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-purple-600' : 'text-white group-hover:text-purple-300'
                  }`}
                >
                  AI Project Assistant
                </h3>
                <p className={`text-xs sm:text-sm mt-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
                  Ask questions about project history, ADRs, runbooks, and available files. Grounded in authorized
                  files, cites verified sources, and never fabricates.
                </p>
              </div>

              <div
                className={`pt-4 border-t text-[11px] font-mono flex items-center gap-1.5 font-semibold ${
                  isLight ? 'border-slate-200/80 text-purple-600' : 'border-white/5 text-purple-400'
                }`}
              >
                <span>Zero Hallucination Grounded</span>
              </div>
            </div>

            {/* Card 3: Version History */}
            <div
              className={`rounded-[2rem] p-7 border shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between min-h-[340px] ${
                isLight
                  ? 'bg-gradient-to-b from-[#FFFDF5] to-[#FFFFFF] border-slate-200/90 hover:border-amber-400 hover:shadow-amber-500/10 text-slate-800'
                  : 'bg-gradient-to-b from-[#10142C] to-[#0D1022] border-white/10 hover:border-amber-500/40 hover:shadow-amber-500/20 text-slate-200'
              }`}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/25 mb-6 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <div
                    className={`w-full h-full rounded-2xl flex items-center justify-center ${
                      isLight ? 'bg-white' : 'bg-[#0E1326]'
                    }`}
                  >
                    <GitCommit className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>

                <h3
                  className={`text-xl font-bold transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-amber-600' : 'text-white group-hover:text-amber-300'
                  }`}
                >
                  Version History
                </h3>
                <p className={`text-xs sm:text-sm mt-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
                  Preserve project snapshots and track changes. Pin stable releases, inspect changelog deltas, and
                  maintain an uninterrupted line of progression.
                </p>
              </div>

              <div
                className={`pt-4 border-t text-[11px] font-mono flex items-center gap-1.5 font-semibold ${
                  isLight ? 'border-slate-200/80 text-amber-600' : 'border-white/5 text-amber-400'
                }`}
              >
                <span>Immutable Version Snapshots</span>
              </div>
            </div>

            {/* Card 4: Ownership Timeline */}
            <div
              className={`rounded-[2rem] p-7 border shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between min-h-[340px] ${
                isLight
                  ? 'bg-gradient-to-b from-[#F5FFF9] to-[#FFFFFF] border-slate-200/90 hover:border-emerald-400 hover:shadow-emerald-500/10 text-slate-800'
                  : 'bg-gradient-to-b from-[#10142C] to-[#0D1022] border-white/10 hover:border-emerald-500/40 hover:shadow-emerald-500/20 text-slate-200'
              }`}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/25 mb-6 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <div
                    className={`w-full h-full rounded-2xl flex items-center justify-center ${
                      isLight ? 'bg-white' : 'bg-[#0E1326]'
                    }`}
                  >
                    <Clock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <h3
                  className={`text-xl font-bold transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-emerald-600' : 'text-white group-hover:text-emerald-300'
                  }`}
                >
                  Ownership Timeline
                </h3>
                <p className={`text-xs sm:text-sm mt-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
                  Track responsibility and handover history. Timestamped custody trail records previous owners,
                  acceptance signatures, and transfer methods.
                </p>
              </div>

              <div
                className={`pt-4 border-t text-[11px] font-mono flex items-center gap-1.5 font-semibold ${
                  isLight ? 'border-slate-200/80 text-emerald-600' : 'border-white/5 text-emerald-400'
                }`}
              >
                <span>SHA-256 Audit Chained</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. HOW IT WORKS (Split Layout with 3D Glyph, Screenshot 4 Match)
         ========================================================================= */}
      <section
        id="how-it-works"
        className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
          isLight ? 'bg-white' : 'bg-[#090C1A]'
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="max-w-3xl">
            <span
              className={`text-xs font-mono uppercase tracking-widest font-semibold ${
                isLight ? 'text-blue-600' : 'text-indigo-400'
              }`}
            >
              The 3-Step Lifecycle
            </span>
            <h2
              className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mt-3 ${
                isLight ? 'text-[#0B132B]' : 'text-white'
              }`}
            >
              Keep projects moving in{' '}
              <span
                className={`font-serif italic font-normal text-transparent bg-clip-text ${
                  isLight
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
                    : 'bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300'
                }`}
              >
                three simple
              </span>{' '}
              steps.
            </h2>
          </div>

          {/* Split Layout (Screenshot 4 Match) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 3D Prism Artwork Panel (5 Cols) */}
            <div
              className={`lg:col-span-5 rounded-[2.5rem] p-8 sm:p-10 border shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px] transition-all ${
                isLight
                  ? 'bg-gradient-to-br from-[#E2ECFE] via-[#EAE5FC] to-[#F6EDFC] border-blue-200/70 shadow-indigo-100/60'
                  : 'bg-gradient-to-br from-[#121634] via-[#161B42] to-[#251740] border-white/10 shadow-2xl'
              }`}
            >
              {/* Background Glow */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[70px] pointer-events-none rounded-full ${
                  isLight ? 'bg-indigo-300/35' : 'bg-indigo-500/20'
                }`}
              />

              {/* 3D Stylized Lightning Bolt Prism Artwork (Matching Screenshot 4) */}
              <div className="flex-1 flex items-center justify-center py-6 relative z-10">
                <div className="w-36 h-48 sm:w-44 sm:h-56 relative animate-float">
                  <div
                    className={`absolute inset-0 blur-2xl rounded-3xl ${
                      isLight ? 'bg-gradient-to-tr from-pink-400 to-purple-500 opacity-30' : 'bg-gradient-to-tr from-pink-500 to-purple-600 opacity-40'
                    }`}
                  />
                  <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-xl">
                    <defs>
                      <linearGradient id="prismLight1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFA4E8" />
                        <stop offset="50%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                      <linearGradient id="prismLight2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#6366F1" />
                      </linearGradient>
                    </defs>
                    <polygon points="55,5 20,70 50,70 40,135 85,60 55,60" fill="url(#prismLight1)" />
                    <polygon points="55,5 50,70 40,135 55,85" fill="url(#prismLight2)" opacity="0.75" />
                  </svg>
                </div>
              </div>

              {/* Floating Badge (Screenshot 4 Match: '4.9 Rated agency' vibe) */}
              <div
                className={`relative z-10 p-3 px-5 rounded-2xl backdrop-blur-md border flex items-center justify-between w-fit shadow-md ${
                  isLight ? 'bg-white/95 border-slate-200/90 text-slate-800' : 'bg-white/[0.08] border-white/10 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                  <span className="text-xs font-semibold">
                    100%{' '}
                    <span
                      className={`font-serif italic font-normal ${
                        isLight ? 'text-indigo-700' : 'text-indigo-200'
                      }`}
                    >
                      Lossless Standard
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Stacked Step Cards (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Step 1: Work */}
              <div
                className={`rounded-[2rem] p-6 sm:p-7 border transition-all duration-300 flex items-start gap-5 group shadow-sm ${
                  isLight
                    ? 'bg-white hover:bg-slate-50/90 border-slate-200/90 text-slate-800'
                    : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/10 text-slate-200'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-md shrink-0 group-hover:scale-105 transition-transform">
                  01
                </div>
                <div className="space-y-1.5 flex-1">
                  <div
                    className={`text-lg sm:text-xl font-bold flex items-center justify-between ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    <span>Work</span>
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase font-semibold">
                      Execution
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm leading-relaxed font-normal ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Employees manage tasks, track deadlines, update statuses, and document daily progress, blockers,
                    and next steps directly in their personal workbench.
                  </p>
                </div>
              </div>

              {/* Step 2: Handover */}
              <div
                className={`rounded-[2rem] p-6 sm:p-7 border transition-all duration-300 flex items-start gap-5 group shadow-sm ${
                  isLight
                    ? 'bg-white hover:bg-slate-50/90 border-slate-200/90 text-slate-800'
                    : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/10 text-slate-200'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-md shrink-0 group-hover:scale-105 transition-transform">
                  02
                </div>
                <div className="space-y-1.5 flex-1">
                  <div
                    className={`text-lg sm:text-xl font-bold flex items-center justify-between ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    <span>Handover</span>
                    <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase font-semibold">
                      Synthesis
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm leading-relaxed font-normal ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Continuity organizes project context, files, decisions, and pending work. The smart readiness
                    checker evaluates completeness before dispatch.
                  </p>
                </div>
              </div>

              {/* Step 3: Continue */}
              <div
                className={`rounded-[2rem] p-6 sm:p-7 border transition-all duration-300 flex items-start gap-5 group shadow-sm ${
                  isLight
                    ? 'bg-white hover:bg-slate-50/90 border-slate-200/90 text-slate-800'
                    : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/10 text-slate-200'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-md shrink-0 group-hover:scale-105 transition-transform">
                  03
                </div>
                <div className="space-y-1.5 flex-1">
                  <div
                    className={`text-lg sm:text-xl font-bold flex items-center justify-between ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    <span>Continue</span>
                    <span className="text-xs font-mono text-pink-600 dark:text-pink-400 uppercase font-semibold">
                      Seamless
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm leading-relaxed font-normal ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    The next employee reviews the handover, asks questions, accepts responsibility, and continues.
                    Ownership transfers atomically upon acceptance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. TEAM COLLABORATION (Three Distinct Roles)
         ========================================================================= */}
      <section
        id="collaboration"
        className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative transition-colors duration-300 ${
          isLight ? 'bg-[#F8FAFC]' : 'bg-[#070914]'
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center max-w-3xl mx-auto">
            <span
              className={`text-xs font-mono uppercase tracking-widest font-semibold ${
                isLight ? 'text-blue-600' : 'text-indigo-400'
              }`}
            >
              Role-Based Governance
            </span>
            <h2
              className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mt-3 ${
                isLight ? 'text-[#0B132B]' : 'text-white'
              }`}
            >
              One workspace.{' '}
              <span
                className={`font-serif italic font-normal text-transparent bg-clip-text ${
                  isLight
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
                    : 'bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300'
                }`}
              >
                Clear responsibility.
              </span>
            </h2>
            <p className={`mt-4 text-base sm:text-lg leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
              Enforce strict accountability across all three tiers of your engineering organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Role 1: Admins */}
            <div
              className={`rounded-[2.2rem] p-8 border shadow-xl space-y-5 flex flex-col justify-between transition-all ${
                isLight
                  ? 'bg-white border-slate-200/90 shadow-slate-200/50 text-slate-800'
                  : 'bg-gradient-to-b from-[#11152E] to-[#0D1022] border-white/10 text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                    Executive Tier
                  </span>
                  <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className={`text-2xl font-bold mt-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Admins
                </h3>
                <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
                  Manage engineering teams, appoint pod leaders, assign projects, monitor 10 real-time KPI pulses,
                  review milestone deliverables, and ratify final client delivery.
                </p>
              </div>

              <div
                className={`space-y-2 pt-4 border-t text-xs ${
                  isLight ? 'border-slate-200/80 text-slate-700' : 'border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Team pod &amp; leader appointments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Multi-round deliverable review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Client release sign-off</span>
                </div>
              </div>
            </div>

            {/* Role 2: Team Leaders */}
            <div
              className={`rounded-[2.2rem] p-8 border shadow-xl space-y-5 flex flex-col justify-between transition-all ${
                isLight
                  ? 'bg-white border-slate-200/90 shadow-slate-200/50 text-slate-800'
                  : 'bg-gradient-to-b from-[#11152E] to-[#0D1022] border-white/10 text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                    Execution Tier
                  </span>
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className={`text-2xl font-bold mt-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Team Leaders
                </h3>
                <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
                  Coordinate pod execution, distribute tasks, clear employee blockers, review daily work updates,
                  and submit consolidated sprint progress reports to Admins.
                </p>
              </div>

              <div
                className={`space-y-2 pt-4 border-t text-xs ${
                  isLight ? 'border-slate-200/80 text-slate-700' : 'border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Task assignment &amp; deadlines</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Blocker acknowledgement &amp; clearing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Weekly progress reports</span>
                </div>
              </div>
            </div>

            {/* Role 3: Employees */}
            <div
              className={`rounded-[2.2rem] p-8 border shadow-xl space-y-5 flex flex-col justify-between transition-all ${
                isLight
                  ? 'bg-white border-slate-200/90 shadow-slate-200/50 text-slate-800'
                  : 'bg-gradient-to-b from-[#11152E] to-[#0D1022] border-white/10 text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                    Engineering Tier
                  </span>
                  <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className={`text-2xl font-bold mt-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Employees
                </h3>
                <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300/90'}`}>
                  Manage assigned tasks, log daily progress journals, raise operational blockers, and send verifiable
                  task handovers with full context and instructions.
                </p>
              </div>

              <div
                className={`space-y-2 pt-4 border-t text-xs ${
                  isLight ? 'border-slate-200/80 text-slate-700' : 'border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Daily work journal logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Context-rich task handovers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Incoming handover review &amp; accept</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FINAL CALL TO ACTION (CTA)
         ========================================================================= */}
      <section
        className={`py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 ${
          isLight ? 'bg-white' : 'bg-[#090C1A]'
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div
            className={`rounded-[2.8rem] p-10 sm:p-16 md:p-20 text-center relative overflow-hidden shadow-2xl ${
              isLight
                ? 'bg-gradient-to-br from-[#0B132B] via-[#121A3B] to-[#1F184A] text-white shadow-[0_25px_60px_rgba(15,23,42,0.25)] border border-slate-700/50'
                : 'bg-gradient-to-br from-[#121838] via-[#1A1F4A] to-[#251542] text-white shadow-[0_30px_90px_rgba(0,0,0,0.8)] border border-white/15'
            }`}
          >
            {/* Atmospheric Glowing Light Mesh */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-indigo-500/25 via-purple-500/20 to-pink-500/20 blur-[90px] pointer-events-none rounded-full" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <span className="inline-block text-xs font-mono uppercase tracking-widest text-indigo-300 font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/15">
                Continuity Standard
              </span>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Never let a project{' '}
                <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200">
                  start from zero
                </span>{' '}
                again.
              </h2>

              <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
                Keep knowledge connected, simplify handovers, and help every teammate move forward.
              </p>

              <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="bg-white text-[#0B0E1E] text-base font-semibold pl-6 pr-2.5 py-3 rounded-full flex items-center gap-3 hover:bg-slate-100 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_15px_30px_rgba(255,255,255,0.2)] group"
                >
                  <span>Get Started</span>
                  <span className="w-8 h-8 rounded-full bg-[#0B0E1E] text-white flex items-center justify-center text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    ↗
                  </span>
                </Link>

                <Link
                  href={isAuthenticated ? '/dashboard' : '/login'}
                  className="px-6 py-3 rounded-full text-base font-medium text-white/90 hover:text-white border border-white/20 hover:border-white/40 bg-white/[0.06] transition-all"
                >
                  {isAuthenticated ? 'Open Dashboard ↗' : 'Log In to Workspace'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
         ========================================================================= */}
      <footer
        className={`py-12 border-t px-4 sm:px-6 lg:px-8 text-xs transition-colors duration-300 ${
          isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#060810] border-white/[0.08] text-slate-400'
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              C
            </div>
            <span className={`font-bold text-sm ${isLight ? 'text-[#0B132B]' : 'text-white'}`}>
              Continuity Platform
            </span>
          </div>

          <div
            className={`flex items-center gap-6 font-medium ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <a href="#product" className={`transition-colors ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}>
              Product
            </a>
            <a href="#features" className={`transition-colors ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}>
              Features
            </a>
            <a href="#how-it-works" className={`transition-colors ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}>
              How It Works
            </a>
            <Link href="/login" className={`transition-colors ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}>
              Login
            </Link>
          </div>

          <div className="font-mono text-slate-400">
            © {new Date().getFullYear()} Continuity. Lossless Project Continuity.
          </div>
        </div>
      </footer>
    </div>
  );
}
