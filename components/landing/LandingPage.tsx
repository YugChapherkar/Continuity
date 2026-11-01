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
      <header className="marklab-navbar-header relative z-40 max-w-[1280px] mx-auto pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 w-full">
        <nav className="bg-white border border-slate-200 rounded-2xl sm:rounded-full px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between shadow-sm transition-all text-slate-900">
          {/* Brandmark */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/deimij13f/image/upload/v1791857115/logo-c_mq0xbm.png"
              alt="Continuity"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7 lg:gap-10 text-sm lg:text-[15px] font-semibold text-slate-800 font-tasaorbiter">
            <a href="#performance" className="text-slate-800 hover:text-[#5558FF] transition-colors">
              Platform
            </a>
            <Link href="/handoffs" className="text-slate-800 hover:text-[#5558FF] transition-colors">
              Handoffs
            </Link>
            <Link href="/reviews" className="text-slate-800 hover:text-[#5558FF] transition-colors">
              Reviews
            </Link>
            <a href="#workflow" className="text-slate-800 hover:text-[#5558FF] transition-colors">
              Lifecycle
            </a>
            <Link href="/assistant" className="text-slate-800 hover:text-[#5558FF] transition-colors">
              RAG AI
            </Link>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            {/* Solid CTA: Open Dashboard */}
            <Link
              href="/dashboard"
              className="dark-cta-btn hidden sm:inline-flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white font-semibold text-sm px-6 py-2.5 sm:py-3 rounded-full transition-colors cursor-pointer"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-900 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Sliding Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white text-black pt-6 px-6 flex flex-col justify-between pb-10 md:hidden animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-slate-200 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://res.cloudinary.com/deimij13f/image/upload/v1791857115/logo-c_mq0xbm.png"
                alt="Continuity"
                className="h-9 w-auto object-contain"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-black p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-lg font-medium text-black font-tasaorbiter">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3.5 border-b border-slate-200 flex items-center justify-between text-black"
              >
                <span>Governance Dashboard</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </Link>
              <Link
                href="/handoffs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3.5 border-b border-slate-200 flex items-center justify-between text-black"
              >
                <span>Shift Rotations &amp; Handoffs</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </Link>
              <Link
                href="/reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3.5 border-b border-slate-200 flex items-center justify-between text-black"
              >
                <span>Deliverable Reviews</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </Link>
              <Link
                href="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3.5 border-b border-slate-200 flex items-center justify-between text-black"
              >
                <span>Task Execution &amp; Deadlines</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </Link>
              <Link
                href="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3.5 border-b border-slate-200 flex items-center justify-between text-black"
              >
                <span>Gemini RAG Assistant</span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-black text-white py-3.5 rounded-full font-semibold text-base"
            >
              Open Governance Dashboard
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-slate-100 text-black py-3.5 rounded-full font-medium text-base border border-slate-300"
            >
              Platform Login
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
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-between bg-white text-black border-b border-slate-200">
      {/* 1. Large, Clean Header Navbar */}
      <Navbar />

      {/* 2. Main Hero Content (Light Background, Black Text, Zero Gradients, Responsive on Mobile & Desktop) */}
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-center items-center text-center py-12 sm:py-16 lg:py-20">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs sm:text-sm font-semibold tracking-wider uppercase text-black mb-6 sm:mb-8 font-tasaorbiter">
          Enterprise Continuity &amp; Shift Governance
        </div>

        {/* Main Editorial Headline */}
        <h1
          className="hero-black-text text-4xl sm:text-5xl md:text-6xl lg:text-[68px] leading-[1.06] font-medium tracking-tight text-black max-w-4xl mx-auto font-tasaorbiter"
          style={{ color: '#000000' }}
        >
          Engineering that <br className="hidden sm:inline" />
          <span
            className="font-instrumentserif italic font-normal tracking-tight text-black"
            style={{ color: '#000000' }}
          >
            guarantees{' '}
          </span>
          <span
            className="font-tasaorbiter font-medium not-italic text-black"
            style={{ color: '#000000' }}
          >
            Continuity
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p
          className="mt-5 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed text-neutral-800 font-normal"
          style={{ color: '#171717' }}
        >
          Mission-critical enterprise platform for verifiable developer shift rotations, automated completeness scoring, and cryptographic client delivery.
        </p>

        {/* Primary and Secondary CTAs (Responsive Full-Width on Mobile, Inline on Desktop) */}
        <div className="mt-8 sm:mt-10 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4">
          <Link
            href="/dashboard"
            className="dark-cta-btn bg-black hover:bg-neutral-800 text-white font-semibold px-7 py-3.5 sm:py-4 text-sm sm:text-base rounded-full inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="bg-white hover:bg-slate-100 text-black border border-slate-300 font-semibold px-7 py-3.5 sm:py-4 text-sm sm:text-base rounded-full inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Platform Login</span>
          </Link>
        </div>

        {/* Solid Architectural Key Highlights Grid */}
        <div className="mt-12 sm:mt-16 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 text-left">
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
            <div className="text-2xl sm:text-3xl font-bold text-black font-tasaorbiter">99.4%</div>
            <div className="mt-1 text-xs sm:text-sm text-neutral-700">
              Verified handoff completeness across shift rotations
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
            <div className="text-2xl sm:text-3xl font-bold text-black font-tasaorbiter">SHA-256</div>
            <div className="mt-1 text-xs sm:text-sm text-neutral-700">
              Tamper-evident package hashes &amp; audit trail
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
            <div className="text-2xl sm:text-3xl font-bold text-black font-tasaorbiter">3-Tier RBAC</div>
            <div className="mt-1 text-xs sm:text-sm text-neutral-700">
              Strict governance for Admins, Pod Leads &amp; Engineers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   3. TRUSTED BY / CLIENT LOGOS STRIP
   ========================================================================= */

function ClientLogoStrip() {
  const logos = [
    { name: 'Stripe Core' },
    { name: 'Datadog Ops' },
    { name: 'Vercel Infra' },
    { name: 'Linear Sync' },
    { name: 'HashiCorp' },
  ];

  return (
    <div className="w-full text-center pb-8 sm:pb-10 border-b border-slate-200">
      <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider select-none font-tasaorbiter">
        Trusted by mission-critical engineering pods and enterprise infrastructure teams
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-8 sm:gap-14 md:gap-20 text-black">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center gap-2 transition-colors select-none"
          >
            <span className="text-sm sm:text-base font-bold tracking-tight text-black font-tasaorbiter">
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
    <section id="performance" className="py-16 sm:py-24 bg-[#F8FAFC] text-black border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Client Logos Strip */}
        <ClientLogoStrip />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch mt-10 sm:mt-12">
          {/* Left Panel: Wider Card (~2:1 ratio) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 flex flex-col justify-between">
            {/* Top Metric Card */}
            <div className="flex items-start justify-between">
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-4">
                <div>
                  <span className="text-[11px] uppercase font-bold text-neutral-600 tracking-wider block font-tasaorbiter">
                    Handoff Completeness
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-black leading-none mt-1 font-tasaorbiter">
                    99.4%
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-black flex items-center justify-center font-bold text-xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="mt-8 sm:mt-12">
              <h2 className="hero-black-text text-2xl sm:text-3xl lg:text-4xl font-semibold text-black leading-[1.12] font-tasaorbiter">
                Zero Context Loss across{' '}
                <span className="font-instrumentserif italic font-normal text-black">
                  Developer Shift Rotations
                </span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-700 leading-relaxed max-w-xl">
                Automated completeness scoring across 4 weighted dimensions, SHA-256 tamper-evident package hashes,
                and optimistic concurrency control (409 Conflict protection) to eliminate rotation blind spots.
              </p>

              {/* Bottom Action */}
              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/dashboard"
                  className="dark-cta-btn bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Panel: Narrower Card */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] text-black flex items-center justify-center border border-slate-200">
                <Target className="w-5 h-5 stroke-[2]" />
              </div>

              <h3 className="hero-black-text mt-6 text-xl sm:text-2xl font-semibold text-black leading-[1.15] font-tasaorbiter">
                Built for{' '}
                <span className="font-instrumentserif italic font-normal text-black">
                  High-Velocity
                </span>{' '}
                engineering pods
              </h3>

              <p className="mt-3 text-sm sm:text-base text-neutral-700 leading-relaxed">
                Fine-grained role governance for execution pods. Distribute tasks, track blockers,
                monitor 10 organizational KPI pulses, and ratify client delivery.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black hover:underline"
            >
              <span>Explore Governance System</span>
              <ArrowRight className="w-4 h-4" />
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
      href: '/handoffs',
    },
    {
      title: 'Executive Governance & 10 KPIs',
      desc: 'Live organizational pulses tracking active projects, overdue deadlines, pending reviews, and blocked tasks with zero placeholder estimates.',
      icon: BarChart3,
      href: '/dashboard',
    },
    {
      title: 'Multi-Round Deliverable Reviews',
      desc: 'Structured approval workflows: approve releases, request structured revisions, and ratify client receipt with cryptographic audit logs.',
      icon: Shield,
      href: '/reviews',
    },
    {
      title: 'Gemini RAG Knowledge Assistant',
      desc: 'Grounded AI chatbot answering questions over historical shift notes, system decisions, and past handoffs using vector-grounded context.',
      icon: Bot,
      href: '/assistant',
    },
  ];

  return (
    <section id="services" className="py-16 sm:py-24 bg-white text-black border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <h2 className="hero-black-text text-3xl sm:text-4xl lg:text-[42px] font-medium text-black leading-[1.1] font-tasaorbiter">
              Platform Capabilities <br />
              <span className="font-instrumentserif italic font-normal text-black">
                That Guarantee Delivery
              </span>
            </h2>
          </div>

          <Link
            href="/dashboard"
            className="dark-cta-btn self-start sm:self-end bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors"
          >
            <span>Explore Capabilities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Equal-Width Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.title}
                href={service.href}
                className="bg-[#F8FAFC] hover:bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-black flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="hero-black-text text-lg font-semibold text-black leading-snug font-tasaorbiter">
                    {service.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-neutral-700 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
    <section id="workflow" className="py-16 sm:py-24 bg-[#F8FAFC] text-black border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          {/* Left Panel: Clean Architectural Verification Summary */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold uppercase tracking-wider text-black">
              Cryptographic Verification Pipeline
            </div>

            <h3 className="hero-black-text text-2xl sm:text-3xl font-semibold text-black leading-tight font-tasaorbiter">
              Verifiable Handoffs from Pod Execution to Client Delivery
            </h3>

            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
              Every rotation package is scored across four completeness dimensions and sealed with a SHA-256 cryptographic digest before ownership transfers.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
                <div className="text-xs font-mono uppercase text-neutral-600">Integrity Standard</div>
                <div className="mt-1 text-xl font-bold text-black font-tasaorbiter">SHA-256</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
                <div className="text-xs font-mono uppercase text-neutral-600">Concurrency Lock</div>
                <div className="mt-1 text-xl font-bold text-black font-tasaorbiter">409 Protected</div>
              </div>
            </div>
          </div>

          {/* Right Content: 4 Step Workflow */}
          <div className="lg:col-span-6">
            <h2 className="hero-black-text text-3xl sm:text-4xl font-medium text-black leading-[1.12] font-tasaorbiter">
              Platform Delivery in{' '}
              <span className="font-instrumentserif italic font-normal text-black">
                quick 4
              </span>{' '}
              Simple Steps
            </h2>

            {/* Workflow Card with 4 Stacked Rows */}
            <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 divide-y divide-slate-200">
              {steps.map((step) => (
                <div key={step.num} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-black font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono border border-slate-200">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="hero-black-text text-sm sm:text-base font-semibold text-black leading-snug font-tasaorbiter">
                      {step.title}
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/dashboard"
                className="dark-cta-btn bg-black hover:bg-neutral-800 text-white text-sm font-semibold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
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
    <section id="portfolio" className="py-16 sm:py-24 bg-white text-black border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Centered Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="hero-black-text text-3xl sm:text-4xl lg:text-[42px] font-medium text-black leading-[1.1] font-tasaorbiter">
            Systems in Production <br />
            <span className="font-instrumentserif italic font-normal text-black">
              Verified at Scale
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-700">
            Mission-critical platform modules engineered for verifiable engineering handoffs and client delivery.
          </p>
        </div>

        {/* 3-Column Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-5 sm:gap-6 items-start">
          {portfolio.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`${
                item.isWide ? 'md:col-span-2 lg:col-span-1' : 'md:col-span-1'
              } flex flex-col group cursor-pointer`}
            >
              <div className="relative aspect-[1.3] w-full rounded-2xl overflow-hidden bg-[#F8FAFC] border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 font-mono block">
                  {item.category}
                </span>
                <p className="mt-1 text-sm sm:text-base font-semibold text-black leading-snug group-hover:underline">
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
    <section id="testimonials" className="py-16 sm:py-24 bg-[#F8FAFC] text-black border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="hero-black-text text-3xl sm:text-4xl lg:text-[42px] font-medium text-black leading-[1.1] font-tasaorbiter">
            Trusted by Engineering Leaders <br />
            <span className="font-instrumentserif italic font-normal text-black">
              In High-Stakes Environments
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-700">
            Real feedback from engineering pods and enterprise teams operating with Continuity.
          </p>
        </div>

        {/* 4 Testimonial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[210px]"
            >
              <div>
                <div className="text-xs font-bold text-black uppercase tracking-wider font-mono mb-3">
                  {t.logo}
                </div>
                <p className="text-sm text-neutral-800 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 text-xs">
                <div className="font-bold text-black font-tasaorbiter">{t.name}</div>
                <div className="text-neutral-600 mt-0.5">{t.role}</div>
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
    <section id="faq" className="py-16 sm:py-24 bg-white text-black border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="hero-black-text text-3xl sm:text-4xl lg:text-[42px] font-medium text-black leading-[1.1] font-tasaorbiter">
            Frequently asked <br />
            questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-700">
            Answers to common questions regarding platform governance, security, and setup.
          </p>
        </div>

        {/* Centered Accordion */}
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-[#F8FAFC] rounded-2xl overflow-hidden transition-all duration-200 border border-slate-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 select-none hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-black font-tasaorbiter">
                    {faq.q}
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black shrink-0 text-xs border border-slate-200">
                    {isOpen ? <Minus className="w-3.5 h-3.5 stroke-[2.5]" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-2 text-sm text-neutral-700 leading-relaxed border-t border-slate-200">
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
    <section id="articles" className="py-16 sm:py-24 bg-[#F8FAFC] text-black border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-10 sm:mb-12">
          <h2 className="hero-black-text text-3xl sm:text-4xl font-medium text-black leading-[1.1] font-tasaorbiter">
            Architecture Playbooks
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-700">
            Engineering specifications, system design patterns, and operational frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {articles.map((art) => (
            <div
              key={art.title}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all group"
            >
              <div className="relative aspect-[1.3] w-full overflow-hidden bg-slate-100 border-b border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between text-xs font-bold tracking-wider text-neutral-600 mb-2.5 font-mono">
                  <span className="text-black">{art.tag}</span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="hero-black-text text-base sm:text-lg font-semibold text-black leading-snug font-tasaorbiter">
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
   11. FINAL CTA SECTION (Light Mode Background & Black Text)
   ========================================================================= */

function FinalCTA() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-white text-black border-b border-slate-200 text-center">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <h2
          className="hero-black-text text-3xl sm:text-5xl md:text-[56px] font-medium leading-[1.08] text-black font-tasaorbiter"
          style={{ color: '#000000' }}
        >
          Ready to experience{' '}
          <span
            className="font-instrumentserif italic font-normal text-black"
            style={{ color: '#000000' }}
          >
            real
          </span>{' '}
          <br />
          Continuity?
        </h2>

        <p className="mt-4 text-base sm:text-lg text-neutral-700 max-w-xl mx-auto">
          Start verifying developer shift rotations, deliverables, and cryptographic handoffs today.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 max-w-md sm:max-w-none mx-auto">
          <Link
            href="/dashboard"
            className="dark-cta-btn bg-black hover:bg-neutral-800 text-white font-semibold px-7 py-3.5 sm:py-4 text-sm sm:text-base rounded-full inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="bg-white hover:bg-slate-100 text-black border border-slate-300 font-semibold px-7 py-3.5 sm:py-4 text-sm sm:text-base rounded-full inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Sign In to Platform</span>
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
    <footer className="w-full bg-white pt-16 sm:pt-20 pb-12 relative overflow-hidden text-black" suppressHydrationWarning>
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14">
          {/* Column 1: Brand & Contact */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://res.cloudinary.com/deimij13f/image/upload/v1791857115/logo-c_mq0xbm.png"
                alt="Continuity"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-neutral-700 leading-relaxed max-w-sm">
              Enterprise Project Continuity, Shift Governance &amp; Verifiable Client Delivery Platform.
            </p>
            <div className="pt-2">
              <a
                href="mailto:continuity@enterprise.platform"
                className="text-sm text-black hover:underline font-semibold font-mono"
              >
                continuity@enterprise.platform
              </a>
            </div>
          </div>

          {/* Column 2: Platform Menu */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-black font-tasaorbiter">
              Platform
            </div>
            <ul className="space-y-3 text-sm text-neutral-700">
              <li>
                <Link href="/dashboard" className="hover:text-black transition-colors">
                  Governance Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-black transition-colors">
                  Platform Login
                </Link>
              </li>
              <li>
                <Link href="/handoffs" className="hover:text-black transition-colors">
                  Shift Handoffs
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-black transition-colors">
                  Deliverable Reviews
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-black transition-colors">
                  Gemini RAG Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Workspaces & Pods */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-black font-tasaorbiter">
              Workspaces &amp; Pods
            </div>
            <ul className="space-y-3 text-sm text-neutral-700">
              <li>
                <Link href="/tasks" className="hover:text-black transition-colors">
                  Task Execution &amp; Deadlines
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-black transition-colors">
                  Client Project Scopes
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-black transition-colors">
                  Team Pods &amp; Leaders
                </Link>
              </li>
              <li>
                <Link href="/convergence" className="hover:text-black transition-colors">
                  Cross-Team Convergence
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-black transition-colors">
                  Architecture FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-black font-tasaorbiter">
              Newsletter for updates
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Receive our bi-weekly breakdown of platform updates, engineering playbooks, and release notes.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2.5 pt-1" suppressHydrationWarning>
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
                className="flex-1 min-w-0 bg-[#F8FAFC] border border-slate-300 rounded-full px-5 py-3 text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:border-black focus:bg-white transition-all"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="dark-cta-btn w-11 h-11 rounded-full bg-black hover:bg-neutral-800 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <span className="text-xs font-semibold text-black block">
                Thank you for subscribing.
              </span>
            )}
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-neutral-600">
          <div>© 2026 CONTINUITY Enterprise Platform. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-black hover:underline font-semibold flex items-center gap-1.5"
            >
              <span>Governance Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/login"
              className="text-neutral-700 hover:text-black font-medium transition-colors"
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
    <div className="min-h-screen bg-white text-black font-sans antialiased selection:bg-black selection:text-white">
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
