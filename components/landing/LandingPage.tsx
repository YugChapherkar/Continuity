'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Menu,
  X,
  Search,
  Mail,
  Globe,
  ChartNoAxesCombined,
  MousePointerClick,
  Megaphone,
  Layers,
  FileText,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Shield,
  Zap,
  TrendingUp,
  Target,
  BarChart3,
  Send,
  Database,
  Lock,
  Bot,
  Users,
  Cpu,
  GitBranch,
} from 'lucide-react';

/* =========================================================================
   REUSABLE UI ATOMS & TYPOGRAPHY
   ========================================================================= */

interface PillButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'white' | 'ghost' | 'outline';
  href?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

function PillButton({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  icon,
}: PillButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 select-none text-[12px] sm:text-[13px] px-4 sm:px-5 py-2 sm:py-2.5 active:scale-[0.98] cursor-pointer';

  const variants = {
    primary:
      'bg-[#5558FF] text-white hover:bg-[#4346F0] shadow-[0_4px_16px_rgba(85,88,255,0.25)] hover:shadow-[0_6px_22px_rgba(85,88,255,0.35)]',
    white:
      'bg-white text-[#111638] hover:bg-[#F7F8FF] shadow-[0_4px_18px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_24px_rgba(255,255,255,0.3)]',
    ghost:
      'bg-transparent text-white hover:text-[#A6B9FF] hover:bg-white/5',
    outline:
      'bg-white text-[#222442] border border-[#E4E7F2] hover:bg-[#F7F8FF] hover:border-[#CCD2E3]',
  };

  const content = (
    <>
      <span>{children}</span>
      {icon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          {icon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`group ${baseClasses} ${variants[variant]} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`group ${baseClasses} ${variants[variant]} ${className}`}>
      {content}
    </button>
  );
}

/* =========================================================================
   1. NAVBAR COMPONENT
   ========================================================================= */

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="marklab-navbar-header relative z-40 max-w-[1180px] mx-auto pt-4 sm:pt-6 px-2 sm:px-4 mb-4 sm:mb-6 !bg-transparent !border-none !shadow-none w-full">
        <nav className="backdrop-blur-2xl bg-white/95 hover:bg-white border border-slate-200/90 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-[0_16px_36px_rgba(0,0,0,0.12)] transition-all text-slate-900">
          {/* Brandmark: Black logo with white background */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/deimij13f/image/upload/v1791857115/logo-c_mq0xbm.png"
              alt="Continuity"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[12px] lg:text-[13px] font-semibold text-slate-700 font-tasaorbiter">
            <a href="#performance" className="hover:text-slate-950 flex items-center gap-1 transition-colors">
              <span>Platform</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </a>
            <Link href="/handoffs" className="hover:text-slate-950 transition-colors">
              Handoffs
            </Link>
            <Link href="/reviews" className="hover:text-slate-950 transition-colors">
              Reviews
            </Link>
            <a href="#workflow" className="hover:text-slate-950 transition-colors">
              Lifecycle
            </a>
            <Link href="/assistant" className="hover:text-slate-950 transition-colors">
              RAG AI
            </Link>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Indicator Badge */}
            <div
              className="relative text-slate-600 hover:text-slate-900 cursor-pointer transition-colors p-1"
              title="Platform Services Online"
            >
              <Shield className="w-4 h-4 text-[#5558FF]" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#5558FF] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                ✓
              </span>
            </div>

            {/* Pill CTA: Open Dashboard */}
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-2.5 bg-[#111638] hover:bg-[#1A2255] text-white font-semibold text-[11px] sm:text-[12px] pl-4 pr-1.5 py-1.5 rounded-full shadow-md transition-all group cursor-pointer"
            >
              <span>Open Dashboard</span>
              <span className="w-5 h-5 rounded-full bg-white text-[#111638] flex items-center justify-center font-bold text-[10px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                ↗
              </span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Sliding Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#111638]/95 backdrop-blur-xl pt-6 px-6 flex flex-col justify-between pb-10 md:hidden animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://res.cloudinary.com/deimij13f/image/upload/v1791857114/logo-c_1_ju4lgi.png"
                alt="Continuity"
                className="h-8 w-auto object-contain"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-5 text-base font-medium text-white font-tasaorbiter">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-white/10 flex items-center justify-between"
              >
                <span>Governance Dashboard</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/handoffs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-white/10"
              >
                Shift Rotations &amp; Handoffs
              </Link>
              <Link
                href="/reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-white/10"
              >
                Deliverable Reviews
              </Link>
              <Link
                href="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-white/10"
              >
                Task Execution &amp; Deadlines
              </Link>
              <Link
                href="/convergence"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-white/10"
              >
                Cross-Team Convergence
              </Link>
              <Link
                href="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-white/10"
              >
                Gemini RAG Assistant
              </Link>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-white/10"
              >
                Architecture FAQ
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#5558FF] text-white py-3 rounded-full font-medium text-sm shadow-md"
            >
              Platform Login ↗
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-white/10 text-white py-3 rounded-full font-medium text-sm border border-white/15"
            >
              Open Governance Dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================================
   2. HERO SECTION
   ========================================================================= */

function HeroSection() {
  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#111638] text-white">
      {/* 1. Integrated Floating Pill Navbar with White BG and Black Logo */}
      <Navbar />

      {/* Vivid Atmospheric Radial Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Core Electric Blue & Soft Periwinkle Center Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[450px] bg-gradient-to-tr from-[#5558FF]/55 via-[#A6B9FF]/35 to-[#B39BFF]/25 blur-[120px] rounded-full" />
        {/* Left Side Violet Pool */}
        <div className="absolute -top-10 left-10 w-[420px] h-[340px] bg-[#5558FF]/30 blur-[110px] rounded-full" />
        {/* Right Side Periwinkle Glow */}
        <div className="absolute top-10 right-10 w-[500px] h-[400px] bg-[#A6B9FF]/25 blur-[130px] rounded-full" />
        {/* Subtle Vertical Light Rays near right edge */}
        <div className="absolute top-0 right-12 w-32 h-full bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-40 blur-lg" />
        {/* Soft Lavender Gradient Fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex-1 flex flex-col justify-center items-center my-auto py-6 sm:py-10">
        {/* Main Editorial Headline */}
        <h1
          className="text-[34px] sm:text-[44px] md:text-[52px] lg:text-[58px] leading-[1.08] font-medium tracking-tight text-white max-w-4xl mx-auto font-tasaorbiter select-none"
          style={{ color: '#ffffff' }}
        >
          Engineering that <br className="hidden sm:inline" />
          <span
            className="font-instrumentserif italic font-normal tracking-tight text-white"
            style={{ color: '#ffffff' }}
          >
            guarantees{' '}
          </span>
          <span
            className="font-tasaorbiter font-medium not-italic text-white"
            style={{ color: '#ffffff' }}
          >
            Continuity
          </span>
        </h1>

        {/* Small Centered Supporting Sentence */}
        <p
          className="mt-4 sm:mt-5 max-w-xl mx-auto text-[13px] sm:text-[15px] leading-[1.45] text-slate-300 font-normal select-none"
          style={{ color: '#CBD5E1' }}
        >
          Mission-critical enterprise platform for verifiable developer shift rotations, automated completeness scoring, and cryptographic client delivery.
        </p>

        {/* Primary and Secondary CTA with Left Hand-Drawn Curved Arrow */}
        <div className="mt-8 sm:mt-9 flex items-center justify-center gap-5 sm:gap-7 relative z-20">
          {/* Hand-drawn White Curved Arrow pointing up-right to the button */}
          <div className="hidden sm:block absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-85">
            <svg className="w-14 h-10 text-white drop-shadow-sm" viewBox="0 0 65 45" fill="none">
              <path
                d="M10 38 C 22 22, 38 16, 52 18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M42 11 L 52 18 L 45 26"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Primary CTA: White Pill Button with Black Circle Arrow */}
          <Link
            href="/dashboard"
            className="bg-white hover:bg-[#F7F8FF] text-[#111638] font-semibold pl-5 pr-2 py-2 sm:py-2.5 text-[12px] sm:text-[13px] rounded-full shadow-[0_10px_28px_rgba(255,255,255,0.22)] flex items-center gap-3 group transition-all cursor-pointer"
          >
            <span>Launch Workspace</span>
            <span className="w-6 h-6 rounded-full bg-[#111638] text-white flex items-center justify-center font-bold text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </Link>

          {/* Secondary CTA: Transparent text link: Platform Login */}
          <Link
            href="/login"
            className="text-white hover:text-[#A6B9FF] font-medium text-[12px] sm:text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Platform Login</span>
            <span className="text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </Link>
        </div>

        {/* 3D Floating Rainbow Notification Bell Artwork on Right */}
        <div className="hidden md:block absolute right-4 lg:right-16 bottom-4 lg:bottom-10 select-none pointer-events-none z-20">
          <div className="relative w-32 h-32 lg:w-40 lg:h-40 animate-pulse transition-transform duration-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marklab-bell.jpg"
              alt="Continuity 3D Bell"
              className="w-full h-full object-contain filter drop-shadow-[0_15px_35px_rgba(85,88,255,0.4)] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_90%)]"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Scroll Cue to indicate more sections below */}
      <div className="relative z-10 pb-5 pt-2 flex flex-col items-center justify-center text-slate-300/80 text-[11px] tracking-wider uppercase font-semibold gap-1 select-none pointer-events-none animate-bounce">
        <span>Scroll to Explore</span>
        <ChevronDown className="w-4 h-4 text-slate-300" />
      </div>
    </section>
  );
}

/* =========================================================================
   3. TRUSTED BY / CLIENT LOGOS STRIP
   ========================================================================= */

function ClientLogoStrip() {
  const logos = [
    { name: 'Stripe Core', symbol: '●' },
    { name: 'Datadog Ops', symbol: '◎' },
    { name: 'Vercel Infra', symbol: '▲' },
    { name: 'Linear Sync', symbol: '◆' },
    { name: 'HashiCorp', symbol: '✦' },
  ];

  return (
    <div className="w-full text-center pb-6 sm:pb-8 border-b border-[#E4E7F2]/80">
      <p className="text-[11px] sm:text-[12px] font-medium text-[#6F718A] uppercase tracking-wider select-none font-tasaorbiter">
        Trusted by mission-critical engineering pods and enterprise infrastructure teams
      </p>
      <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-8 sm:gap-14 md:gap-20 text-[#6F718A]/90">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center gap-2 hover:text-[#222442] transition-colors select-none"
          >
            <span className="text-[12px] text-[#5558FF]">{logo.symbol}</span>
            <span className="text-[13px] sm:text-[14px] font-bold tracking-tight font-tasaorbiter">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   4. PERFORMANCE & CONTINUITY PLATFORM SHOWCASE (2-Column Grid)
   ========================================================================= */

function MarketingShowcase() {
  return (
    <section id="performance" className="min-h-[100dvh] flex flex-col justify-center py-10 sm:py-14 bg-[#F7F8FF]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center">
        {/* Client Logos Strip inside Section 2 */}
        <ClientLogoStrip />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch mt-6 sm:mt-8">
          {/* Left Panel: Wider Card (~2:1 ratio) with Dashboard Floating Metric */}
          <div className="lg:col-span-8 bg-gradient-to-br from-[#EDF1FF] via-white to-[#F7F8FF] border border-[#E4E7F2] rounded-[14px] p-6 sm:p-8 flex flex-col justify-between shadow-[0_6px_24px_rgba(27,37,100,0.05)] relative overflow-hidden group hover:shadow-[0_10px_32px_rgba(27,37,100,0.08)] transition-all">
            {/* Top Floating White Metric Card */}
            <div className="flex items-start justify-between">
              <div className="bg-white border border-[#E4E7F2] rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(27,37,100,0.06)] flex items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6F718A] tracking-wider block font-tasaorbiter">
                    Handoff Completeness
                  </span>
                  <div className="text-[26px] sm:text-[28px] font-bold text-[#222442] leading-none mt-0.5 font-tasaorbiter">
                    99.4%
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#5558FF]/10 text-[#5558FF] flex items-center justify-center font-bold text-xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Decorative Blue Floating Bubble */}
              <div className="w-8 h-8 rounded-full bg-[#5558FF] text-white flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            {/* Content Body */}
            <div className="mt-8 sm:mt-10">
              <h2 className="text-[22px] sm:text-[26px] font-semibold text-slate-900 leading-[1.15] font-tasaorbiter">
                Zero Context Loss across{' '}
                <span className="font-instrumentserif italic font-normal text-[#5558FF]">
                  Developer Shift Rotations
                </span>
              </h2>
              <p className="mt-2.5 text-[12px] sm:text-[14px] text-slate-600 leading-[1.45] max-w-lg">
                Automated completeness scoring across 4 weighted dimensions, SHA-256 tamper-evident package hashes,
                and optimistic concurrency control (409 Conflict protection) to eliminate rotation blind spots.
              </p>

              {/* Bottom Actions linking to Dashboard and Login */}
              <div className="mt-6 flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="bg-[#5558FF] hover:bg-[#4346F0] text-white text-[12px] font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_4px_14px_rgba(85,88,255,0.3)] transition-all group"
                >
                  <span>Launch Dashboard</span>
                  <span className="text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    ↗
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="text-[#5558FF] hover:text-[#4346F0] font-medium text-[12px] flex items-center gap-1 transition-colors group"
                >
                  <span>Platform Login</span>
                  <span className="text-[11px] group-hover:translate-x-0.5 transition-transform">↗</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Panel: Narrower Pale Blue Card */}
          <div className="lg:col-span-4 bg-[#EDF1FF] border border-[#E4E7F2] rounded-[14px] p-6 sm:p-8 flex flex-col justify-between shadow-[0_6px_24px_rgba(27,37,100,0.05)] hover:shadow-[0_10px_32px_rgba(27,37,100,0.08)] transition-all">
            <div>
              <div className="w-8 h-8 rounded-full bg-white text-[#5558FF] flex items-center justify-center shadow-xs border border-[#E4E7F2]">
                <Target className="w-4 h-4 stroke-[2]" />
              </div>

              <h3 className="mt-6 text-[20px] sm:text-[22px] font-semibold text-slate-900 leading-[1.15] font-tasaorbiter">
                Built for{' '}
                <span className="font-instrumentserif italic font-normal text-[#5558FF]">
                  High-Velocity
                </span>{' '}
                engineering pods
              </h3>

              <p className="mt-2.5 text-[12px] sm:text-[13px] text-slate-600 leading-[1.45]">
                Fine-grained role governance for execution pods. Distribute tasks, track blockers,
                monitor 10 organizational KPI pulses, and ratify client delivery.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="mt-6 pt-5 border-t border-[#E4E7F2]/80 flex items-center justify-between text-[11px] font-semibold text-[#5558FF] hover:underline"
            >
              <span>EXPLORE GOVERNANCE SYSTEM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   5. PLATFORM DELIVERABLES & CORE CAPABILITIES
   ========================================================================= */

function ServicesSection() {
  const services = [
    {
      title: 'Shift Rotations & Handoff Scoring',
      desc: 'Automated 0–100% completeness scoring across 4 weighted dimensions, SHA-256 package hashes, and optimistic locking.',
      icon: Layers,
      iconBg: 'bg-[#5558FF]/10 text-[#5558FF]',
      href: '/handoffs',
    },
    {
      title: 'Executive Governance & 10 KPIs',
      desc: 'Live organizational pulses tracking active projects, overdue deadlines, pending reviews, and blocked tasks with zero placeholder estimates.',
      icon: BarChart3,
      iconBg: 'bg-[#B39BFF]/20 text-[#5558FF]',
      href: '/dashboard',
    },
    {
      title: 'Multi-Round Deliverable Reviews',
      desc: 'Structured approval workflows: approve releases, request structured revisions, and ratify client receipt with cryptographic audit logs.',
      icon: Shield,
      iconBg: 'bg-[#A6B9FF]/20 text-[#5558FF]',
      href: '/reviews',
    },
    {
      title: 'Gemini RAG Knowledge Assistant',
      desc: 'Grounded AI chatbot answering questions over historical shift notes, system decisions, and past handoffs using vector-grounded context.',
      icon: Bot,
      iconBg: 'bg-[#5558FF]/10 text-[#5558FF]',
      href: '/assistant',
    },
  ];

  return (
    <section id="services" className="min-h-[100dvh] flex flex-col justify-center py-12 sm:py-16 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-[28px] sm:text-[36px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
              Platform Capabilities <br />
              <span className="font-instrumentserif italic font-normal text-[#5558FF]">
                That Guarantee Delivery.
              </span>
            </h2>
          </div>

          <Link
            href="/dashboard"
            className="self-start sm:self-end bg-[#5558FF] hover:bg-[#4346F0] text-white text-[12px] font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_4px_14px_rgba(85,88,255,0.25)] transition-all group"
          >
            <span>Explore Capabilities</span>
            <span className="text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </Link>
        </div>

        {/* 4 Equal-Width Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.title}
                href={service.href}
                className="bg-[#EDF1FF] hover:bg-white border border-[#E4E7F2] rounded-[12px] p-5 sm:p-6 flex flex-col justify-between shadow-[0_4px_16px_rgba(27,37,100,0.04)] hover:shadow-[0_8px_24px_rgba(27,37,100,0.08)] hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div>
                  <div className={`w-9 h-9 rounded-xl ${service.iconBg} flex items-center justify-center mb-5`}>
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <h3 className="text-[16px] font-medium text-[#222442] leading-[1.2] font-tasaorbiter">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-[12px] text-[#6F718A] leading-[1.45]">
                    {service.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4E7F2]/60 flex items-center gap-1.5 text-[11px] font-bold text-[#5558FF] group-hover:text-[#4346F0] transition-colors">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   6. DIGITAL CONTINUITY WORKFLOW (4 Lifecycle Steps from README)
   ========================================================================= */

function GrowthWorkflow() {
  const steps = [
    {
      num: '01',
      title: 'Configure Pods & Distribute Scoped Tasks',
      desc: 'Admins appoint pod leaders, define client project scope, and set operational deadlines with 3-tier RBAC.',
    },
    {
      num: '02',
      title: 'Log Daily Shift Updates & Flag Blockers',
      desc: 'Engineers submit daily work notes, snapshot diffs, and raise blockers without context decay.',
    },
    {
      num: '03',
      title: 'Multi-Round Review & Executive Sign-off',
      desc: 'Admins review milestone deliverables, request structured changes, or ratify release approvals.',
    },
    {
      num: '04',
      title: 'Tamper-Evident SHA-256 Client Delivery',
      desc: 'Formally delivered releases with client receipt acknowledgment and immutable audit records.',
    },
  ];

  return (
    <section id="workflow" className="min-h-[100dvh] flex flex-col justify-center py-12 sm:py-16 bg-[#F7F8FF]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Visual Panel: Abstract Sculpture + Floating Pill */}
          <div className="lg:col-span-6 bg-gradient-to-tr from-[#EDF1FF] via-[#E4E7F2] to-[#EDF1FF] border border-[#E4E7F2] rounded-[14px] p-8 h-[360px] sm:h-[420px] flex flex-col items-center justify-center relative overflow-hidden shadow-[0_6px_24px_rgba(27,37,100,0.05)]">
            {/* Background Radial Glow */}
            <div className="absolute w-[280px] h-[280px] bg-[#5558FF]/20 rounded-full blur-[80px] pointer-events-none" />

            {/* Geometric Lightning-Bolt / Ribbon Sculpture in Center */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-32 sm:w-28 sm:h-36 bg-gradient-to-b from-[#B39BFF] via-[#5558FF] to-[#111638] rounded-2xl shadow-[0_20px_40px_rgba(85,88,255,0.35)] transform rotate-12 flex items-center justify-center relative border border-white/30 backdrop-blur-sm">
                <Zap className="w-12 h-12 text-white fill-white/20 stroke-[1.5]" />
              </div>

              {/* Floating Pill beneath sculpture */}
              <div className="mt-8 bg-white/95 backdrop-blur-md border border-[#E4E7F2] rounded-full px-4 py-1.5 shadow-[0_6px_20px_rgba(27,37,100,0.08)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5558FF] animate-pulse" />
                <span className="text-[11px] font-bold text-[#222442] font-tasaorbiter">
                  CONTINUITY AI ENGINE
                </span>
                <span className="text-[10px] bg-[#EDF1FF] text-[#5558FF] px-2 py-0.5 rounded-full font-mono font-semibold">
                  SHA-256 ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Right Content: 4 Step Workflow */}
          <div className="lg:col-span-6">
            <h2 className="text-[26px] sm:text-[34px] font-medium text-[#222442] leading-[1.15] font-tasaorbiter">
              Platform Delivery in{' '}
              <span className="font-instrumentserif italic font-normal text-[#5558FF]">
                quick 4
              </span>{' '}
              Simple Steps
            </h2>

            {/* Workflow Card with 4 Stacked Rows */}
            <div className="mt-6 bg-white border border-[#E4E7F2] rounded-[14px] p-5 sm:p-6 shadow-[0_6px_24px_rgba(27,37,100,0.05)] divide-y divide-[#E4E7F2]">
              {steps.map((step) => (
                <div key={step.num} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#EDF1FF] text-[#5558FF] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-tasaorbiter border border-[#E4E7F2]">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="text-[13px] sm:text-[14px] font-semibold text-[#222442] leading-snug font-tasaorbiter">
                      {step.title}
                    </h4>
                    <p className="mt-1 text-[11px] sm:text-[12px] text-[#6F718A] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="mt-6 flex items-center gap-4">
              <Link
                href="/dashboard"
                className="bg-[#5558FF] hover:bg-[#4346F0] text-white text-[12px] font-medium px-5 py-2.5 rounded-full inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(85,88,255,0.25)] transition-all group"
              >
                <span>Enter Workspace</span>
                <span className="text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  ↗
                </span>
              </Link>
              <Link
                href="/assistant"
                className="text-[#5558FF] hover:text-[#4346F0] font-medium text-[12px] flex items-center gap-1 transition-colors"
              >
                <span>Try RAG AI Assistant</span>
                <span>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   7. SELECTED SYSTEMS / PORTFOLIO GALLERY (Platform Views)
   ========================================================================= */

function PortfolioGallery() {
  const portfolio = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
      title: 'Enterprise Shift Continuity Dossier & Handoff Scoring.',
      category: 'Shift Continuity',
      href: '/handoffs',
      isWide: true,
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      title: 'Multi-Round Deliverable Signoff & Client Receipt Ledger.',
      category: 'Executive Reviews',
      href: '/reviews',
      isWide: false,
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      title: 'Grounded RAG Intelligence & Cross-Team Convergence.',
      category: 'AI RAG Engine',
      href: '/convergence',
      isWide: false,
    },
  ];

  return (
    <section id="portfolio" className="min-h-[100dvh] flex flex-col justify-center py-12 sm:py-16 bg-white border-b border-[#E4E7F2]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Centered Heading */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
            Systems in Production <br />
            <span className="font-instrumentserif italic font-normal text-[#5558FF]">
              Verified at Scale
            </span>
          </h2>
          <p className="mt-2 text-[12px] sm:text-[13px] text-[#6F718A]">
            Mission-critical platform modules engineered for verifiable engineering handoffs and client delivery.
          </p>
        </div>

        {/* 3-Column Image Gallery with First Card Approximately 1.4x Wider */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-3.5 sm:gap-4 items-start">
          {portfolio.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`${
                item.isWide ? 'md:col-span-2 lg:col-span-1' : 'md:col-span-1'
              } flex flex-col group cursor-pointer`}
            >
              <div className="relative aspect-[1.3] w-full rounded-[10px] overflow-hidden bg-[#EDF1FF] border border-[#E4E7F2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5558FF] font-tasaorbiter block">
                  {item.category}
                </span>
                <p className="mt-1 text-[12px] sm:text-[13px] font-medium text-[#222442] leading-snug group-hover:text-[#5558FF] transition-colors">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   8. CLIENT & ENGINEERING TESTIMONIALS
   ========================================================================= */

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'VP Engineering, Luma Tech',
      quote:
        'Continuity eliminated our rotation blind spots. Handoff completeness jumped from 62% to 99.4% with cryptographic verification across our 12 pods.',
      logo: 'Luma',
    },
    {
      name: 'Daniel Foster',
      role: 'Founder & CTO, Nexora Cloud',
      quote:
        'The multi-round review and client delivery ratification streamlined our enterprise release certifications from week one.',
      logo: 'Nexora',
    },
    {
      name: 'Emma Wilson',
      role: 'Head of Operations, Loopify',
      quote:
        'The Gemini RAG assistant gives incoming shift engineers instant answers to questions that used to take hours of Slack digging.',
      logo: 'Loopify',
    },
    {
      name: 'James Carter',
      role: 'Lead Architect, Brightwave Media',
      quote:
        'Optimistic locking and tamper-evident SHA-256 audit ledgers give our enterprise auditors 100% peace of mind.',
      logo: 'Brightwave',
    },
  ];

  return (
    <section id="testimonials" className="min-h-[100dvh] flex flex-col justify-center py-12 sm:py-16 bg-[#F7F8FF] border-b border-[#E4E7F2]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
            Trusted by Engineering Leaders <br />
            <span className="font-instrumentserif italic font-normal text-[#5558FF]">
              In High-Stakes Environments
            </span>
          </h2>
          <p className="mt-2 text-[12px] sm:text-[13px] text-[#6F718A]">
            Real feedback from engineering pods and enterprise teams operating with Continuity.
          </p>
        </div>

        {/* 4 Testimonial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-[#E4E7F2] rounded-[12px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(27,37,100,0.04)] hover:shadow-[0_8px_24px_rgba(27,37,100,0.08)] transition-all min-h-[190px]"
            >
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5558FF] uppercase tracking-wider font-tasaorbiter mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5558FF]" />
                  <span>{t.logo}</span>
                </div>
                <p className="text-[12px] text-[#222442] italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E4E7F2] text-[11px]">
                <div className="font-semibold text-[#222442] font-tasaorbiter">{t.name}</div>
                <div className="text-[#6F718A] text-[10px]">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   9. FREQUENTLY ASKED QUESTIONS (FAQ Accordion with Platform Answers)
   ========================================================================= */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What core problem does Continuity solve for engineering organizations?',
      a: 'Continuity eliminates knowledge fragmentation across shift rotations, developer handoffs, and client delivery milestones by providing verifiable checklists, automated completeness scoring, and tamper-evident audit trails.',
    },
    {
      q: 'How does the 3-Tier Role-Based Access Control (RBAC) work?',
      a: 'Admins govern organizational pods, appointments, and final client sign-offs. Team Leaders distribute tasks and inspect sprint updates. Employees record daily work notes and raise operational blockers.',
    },
    {
      q: 'How does the SHA-256 cryptographic audit ledger guarantee integrity?',
      a: 'Every shift handoff generates an immutable SHA-256 package hash with optimistic concurrency control (409 Conflict protection), preventing simultaneous overwrite collisions and providing permanent audit proof.',
    },
    {
      q: 'How does the Gemini RAG contextual assistant work?',
      a: 'The platform integrates Google Gen AI to ground conversational answers over historical handoffs, shift updates, and system decisions, helping incoming shifts instantly resolve context gaps.',
    },
    {
      q: 'What metrics are tracked on the Executive Governance Dashboard?',
      a: 'The dashboard calculates 10 real-time pulses: Total Employees, Active Teams, Active Projects, At-Risk Projects, Overdue Tasks, Pending Reports, Pending Reviews, Revision Requests, Approved Releases, and Delivered Releases.',
    },
    {
      q: 'How do we log in or test the live platform?',
      a: 'Navigate to the Login page (/login) and select from our pre-seeded role personas (Admin, Team Leader, or Employee) for instant one-click testing of full platform governance.',
    },
  ];

  return (
    <section id="faq" className="min-h-[100dvh] flex flex-col justify-center py-12 sm:py-16 bg-white border-b border-[#E4E7F2]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
            Frequently asked <br />
            questions
          </h2>
          <p className="mt-2 text-[12px] sm:text-[13px] text-[#6F718A]">
            Answers to common questions regarding platform governance, security, and setup.
          </p>
        </div>

        {/* Compact Centered Accordion (~650px) */}
        <div className="max-w-[650px] mx-auto space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-[#EDF1FF] rounded-[8px] overflow-hidden transition-all duration-200 border border-[#E4E7F2]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-4 select-none hover:bg-[#E4E7F2]/50 transition-colors cursor-pointer"
                >
                  <span className="text-[13px] sm:text-[14px] font-medium text-[#222442] font-tasaorbiter">
                    {faq.q}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#5558FF] shrink-0 text-xs shadow-xs border border-[#E4E7F2]">
                    {isOpen ? <Minus className="w-3 h-3 stroke-[2.5]" /> : <Plus className="w-3 h-3 stroke-[2.5]" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-[12px] sm:text-[13px] text-[#6F718A] leading-relaxed border-t border-[#E4E7F2]/60 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   10. ARCHITECTURE PLAYBOOKS & SYSTEM SPECIFICATIONS
   ========================================================================= */

function ArticlesSection() {
  const articles = [
    {
      title: 'Designing Lossless Shift Rotations with Cryptographic Ledgers',
      tag: 'SPRING BOOT 3 & SHA-256',
      readTime: '5 MIN READ',
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Optimistic Concurrency Control in High-Velocity Engineering Handoffs',
      tag: 'DATABASE CONCURRENCY',
      readTime: '4 MIN READ',
      image:
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Grounded Gemini RAG: Transforming Shift Notes into Instant Context',
      tag: 'AI RAG RETRIEVAL',
      readTime: '6 MIN READ',
      image:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section id="articles" className="min-h-[100dvh] flex flex-col justify-center py-12 sm:py-16 bg-[#F7F8FF]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-[26px] sm:text-[34px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
              Architecture Playbooks
            </h2>
            <p className="mt-1.5 text-[12px] sm:text-[13px] text-[#6F718A]">
              Engineering specifications, system design patterns, and operational frameworks.
            </p>
          </div>

          <a
            href="#articles"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5558FF] hover:text-[#4346F0] tracking-wider transition-colors group"
          >
            <span>ALL PLAYBOOKS</span>
            <span className="w-5 h-5 rounded-full bg-[#EDF1FF] text-[#5558FF] flex items-center justify-center text-[10px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform border border-[#E4E7F2]">
              ↗
            </span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {articles.map((art) => (
            <div
              key={art.title}
              className="bg-white border border-[#E4E7F2] rounded-[12px] overflow-hidden shadow-[0_4px_16px_rgba(27,37,100,0.04)] hover:shadow-[0_8px_24px_rgba(27,37,100,0.08)] transition-all group cursor-pointer"
            >
              <div className="relative aspect-[1.3] w-full overflow-hidden bg-[#EDF1FF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-[#6F718A] mb-2 font-mono">
                  <span className="text-[#5558FF]">{art.tag}</span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#222442] leading-snug group-hover:text-[#5558FF] transition-colors font-tasaorbiter">
                  {art.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   11. FINAL DRAMATIC CTA SECTION
   ========================================================================= */

function FinalCTA() {
  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-center py-16 sm:py-24 bg-[#111638] text-white overflow-hidden text-center">
      {/* Vivid Blue and Lavender Radial Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#5558FF]/50 via-[#A6B9FF]/30 to-[#B39BFF]/20 blur-[110px] rounded-full" />
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <h2
          className="text-[32px] sm:text-[44px] md:text-[50px] font-medium leading-[1.1] text-white font-tasaorbiter"
          style={{ color: '#ffffff' }}
        >
          Ready to experience{' '}
          <span
            className="font-instrumentserif italic font-normal text-white"
            style={{ color: '#ffffff' }}
          >
            real
          </span>{' '}
          <br />
          Continuity?
        </h2>

        <div className="mt-8 flex items-center justify-center gap-5 sm:gap-6">
          <Link
            href="/dashboard"
            className="bg-white hover:bg-[#F7F8FF] text-[#111638] font-semibold pl-5 pr-2 py-2 sm:py-2.5 text-[12px] sm:text-[13px] rounded-full shadow-[0_10px_28px_rgba(255,255,255,0.2)] flex items-center gap-3 group transition-all cursor-pointer"
          >
            <span>Launch Dashboard</span>
            <span className="w-6 h-6 rounded-full bg-[#111638] text-white flex items-center justify-center font-bold text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </Link>

          <Link
            href="/login"
            className="text-white hover:text-[#A6B9FF] font-medium text-[12px] sm:text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Sign In to Platform</span>
            <span className="text-[11px] group-hover:translate-x-0.5 transition-transform">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   12. FOOTER COMPONENT
   ========================================================================= */

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-white border-t border-[#E4E7F2] pt-16 sm:pt-20 pb-10 relative overflow-hidden text-[#222442]" suppressHydrationWarning>
      {/* Faint Oversized Watermark behind bottom columns */}
      <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 text-[140px] sm:text-[200px] md:text-[250px] lg:text-[280px] font-extrabold text-[#F4F5FB] select-none pointer-events-none tracking-tight font-tasaorbiter z-0 opacity-80 whitespace-nowrap">
        Continuity
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-14 pb-16">
          {/* Column 1: Brand & Contact */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://res.cloudinary.com/deimij13f/image/upload/v1791857115/logo-c_mq0xbm.png"
                alt="Continuity"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-[14px] text-[#6F718A] leading-relaxed max-w-sm">
              Enterprise Project Continuity, Shift Governance &amp; Verifiable Client Delivery Platform.
            </p>
            <div className="pt-3">
              <a
                href="mailto:continuity@enterprise.platform"
                className="text-[14px] text-[#5558FF] hover:underline font-medium font-mono"
              >
                continuity@enterprise.platform
              </a>
            </div>
          </div>

          {/* Column 2: Platform Menu */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#111638] font-tasaorbiter">
              Platform
            </div>
            <ul className="space-y-3 text-[14px] text-[#6F718A]">
              <li>
                <Link href="/dashboard" className="hover:text-[#5558FF] transition-colors">
                  Governance Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#5558FF] transition-colors">
                  Platform Login
                </Link>
              </li>
              <li>
                <Link href="/handoffs" className="hover:text-[#5558FF] transition-colors">
                  Shift Handoffs
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-[#5558FF] transition-colors">
                  Deliverable Reviews
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-[#5558FF] transition-colors">
                  Gemini RAG Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Workspaces & Pods */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#111638] font-tasaorbiter">
              Workspaces &amp; Pods
            </div>
            <ul className="space-y-3 text-[14px] text-[#6F718A]">
              <li>
                <Link href="/tasks" className="hover:text-[#5558FF] transition-colors">
                  Task Execution &amp; Deadlines
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-[#5558FF] transition-colors">
                  Client Project Scopes
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-[#5558FF] transition-colors">
                  Team Pods &amp; Leaders
                </Link>
              </li>
              <li>
                <Link href="/convergence" className="hover:text-[#5558FF] transition-colors">
                  Cross-Team Convergence
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#5558FF] transition-colors">
                  Architecture FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#111638] font-tasaorbiter">
              Newsletter for updates
            </div>
            <p className="text-[14px] text-[#6F718A] leading-relaxed">
              Receive our bi-weekly breakdown of platform updates, engineering playbooks, and release notes.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-3 pt-1" suppressHydrationWarning>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suppressHydrationWarning
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                className="flex-1 min-w-0 bg-[#F4F5F9] border border-[#E4E7F2] rounded-full px-5 py-3 text-[13px] text-[#222442] placeholder:text-[#9DA0B6] focus:outline-none focus:border-[#5558FF] focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="w-11 h-11 rounded-full bg-[#5558FF] hover:bg-[#4346F0] text-white flex items-center justify-center shrink-0 transition-colors shadow-sm cursor-pointer"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <span className="text-[12px] font-medium text-emerald-600 block">
                ✓ Thank you for subscribing!
              </span>
            )}
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#6F718A]">
          <div>© 2026 CONTINUITY Enterprise Platform. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-[#5558FF] hover:underline font-medium flex items-center gap-1"
            >
              <span>Continuity Governance Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <span>•</span>
            <Link
              href="/login"
              className="text-[#6F718A] hover:text-[#5558FF] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================================
   MAIN EXPORTED LANDING PAGE
   ========================================================================= */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#222442] font-sans antialiased selection:bg-[#5558FF]/20 selection:text-[#111638]">
      {/* 1. Hero Section (Occupies 100% of Screen 1) */}
      <HeroSection />

      {/* 2. Performance Marketing & Client Logos Showcase (Occupies Screen 2) */}
      <MarketingShowcase />

      {/* 5. Core Platform Deliverables & Capabilities */}
      <ServicesSection />

      {/* 6. Digital Growth & Continuity Workflow */}
      <GrowthWorkflow />

      {/* 7. Selected Work / Platform Systems Gallery */}
      <PortfolioGallery />

      {/* 8. Client Testimonials */}
      <TestimonialsSection />

      {/* 9. Frequently Asked Questions (FAQ) */}
      <FAQSection />

      {/* 10. Read Articles & Architecture Playbooks */}
      <ArticlesSection />

      {/* 11. Final Dramatic CTA */}
      <FinalCTA />

      {/* 12. Footer */}
      <Footer />
    </div>
  );
}
