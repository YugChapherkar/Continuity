'use client';

import React, { useState } from 'react';
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
      <header className="marklab-navbar-header relative z-40 max-w-[1180px] mx-auto pt-4 sm:pt-6 px-2 sm:px-4 mb-8 sm:mb-12 !bg-transparent !border-none !shadow-none">
        <nav className="backdrop-blur-2xl bg-[#111638]/85 hover:bg-[#111638]/95 border border-white/10 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-[0_16px_36px_rgba(17,22,56,0.45)] transition-all">
          {/* Brandmark: Lilac circle with plus + Marklab */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-full bg-[#E9D5FF] text-[#1E1B4B] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-[15px] sm:text-base tracking-tight text-white font-tasaorbiter" style={{ color: '#ffffff' }}>
              Marklab
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[12px] lg:text-[13px] font-medium text-slate-200/90 font-tasaorbiter">
            <a href="#performance" className="hover:text-white flex items-center gap-1 transition-colors">
              <span>Pages</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </a>
            <a href="#performance" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#services" className="hover:text-white transition-colors">
              Work
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#articles" className="hover:text-white transition-colors">
              Blog
            </a>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart Icon with Notification Badge */}
            <div
              className="relative text-slate-200 hover:text-white cursor-pointer transition-colors p-1"
              title="Cart (0 items)"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#5558FF] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                0
              </span>
            </div>

            {/* Pill CTA */}
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 bg-white hover:bg-[#F7F8FF] text-[#111638] font-semibold text-[11px] sm:text-[12px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-[0_4px_16px_rgba(255,255,255,0.18)] transition-all group"
            >
              <span>Book a Strategy</span>
              <span className="w-5 h-5 rounded-full bg-[#111638] text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                ↗
              </span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Sliding Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#111638]/95 backdrop-blur-xl pt-24 px-6 flex flex-col justify-between pb-10 md:hidden animate-in fade-in duration-200">
          <div className="flex flex-col gap-5 text-base font-medium text-white font-tasaorbiter">
            <a
              href="#performance"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 flex items-center justify-between"
            >
              <span>Pages</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#performance"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              About Marklab
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              Services & Capabilities
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              Growth Workflow
            </a>
            <a
              href="#portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              Selected Work
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              FAQ
            </a>
            <a
              href="#articles"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10"
            >
              Blog & Insights
            </a>
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#5558FF] text-white py-3 rounded-full font-medium text-sm shadow-md"
            >
              Book a Strategy Call ↗
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-white/10 text-white py-3 rounded-full font-medium text-sm border border-white/15"
            >
              Open Workspace Platform
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
    <section className="relative w-full pt-4 sm:pt-6 pb-20 sm:pb-24 overflow-hidden bg-[#111638] text-white">
      {/* 1. Integrated Floating Pill Navbar */}
      <Navbar />

      {/* Vivid Atmospheric Radial Gradients matching reference screenshot */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Core Electric Blue & Soft Periwinkle Center Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[450px] bg-gradient-to-tr from-[#5558FF]/55 via-[#A6B9FF]/35 to-[#B39BFF]/25 blur-[120px] rounded-full" />
        {/* Left Side Violet Pool */}
        <div className="absolute -top-10 left-10 w-[420px] h-[340px] bg-[#5558FF]/30 blur-[110px] rounded-full" />
        {/* Right Side Periwinkle Glow */}
        <div className="absolute top-10 right-10 w-[500px] h-[400px] bg-[#A6B9FF]/25 blur-[130px] rounded-full" />
        {/* Subtle Vertical Light Rays near right edge */}
        <div className="absolute top-0 right-12 w-32 h-full bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-40 blur-lg" />
        {/* Soft Lavender Gradient Fade to White Page Background at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Main Editorial Headline */}
        <h1
          className="text-[34px] sm:text-[44px] md:text-[52px] lg:text-[58px] leading-[1.08] font-medium tracking-tight text-white max-w-4xl mx-auto font-tasaorbiter select-none"
          style={{ color: '#ffffff' }}
        >
          Marketing that <br className="hidden sm:inline" />
          <span
            className="font-instrumentserif italic font-normal tracking-tight text-white"
            style={{ color: '#ffffff' }}
          >
            moves the{' '}
          </span>
          <span
            className="font-tasaorbiter font-medium not-italic text-white"
            style={{ color: '#ffffff' }}
          >
            Needle
          </span>
        </h1>

        {/* Small Centered Supporting Sentence */}
        <p
          className="mt-4 sm:mt-5 max-w-lg mx-auto text-[13px] sm:text-[15px] leading-[1.45] text-slate-300 font-normal select-none"
          style={{ color: '#CBD5E1' }}
        >
          All project here is designed to deliver impact—not just impressions.
        </p>

        {/* Primary and Secondary CTA with Left Hand-Drawn Curved Arrow */}
        <div className="mt-8 sm:mt-9 flex items-center justify-center gap-5 sm:gap-7 relative z-20">
          {/* Hand-drawn White Curved Arrow pointing up-right to the button */}
          <div className="hidden sm:block absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-85">
            <svg className="w-12 h-10 text-white drop-shadow-sm" viewBox="0 0 65 45" fill="none">
              <path
                d="M12 36 C 20 20, 38 14, 54 18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M45 11 L 54 18 L 47 25"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Primary CTA: White Pill Button with Black Circle Arrow */}
          <Link
            href="/login"
            className="bg-white hover:bg-[#F7F8FF] text-[#111638] font-semibold pl-5 pr-2 py-2 sm:py-2.5 text-[12px] sm:text-[13px] rounded-full shadow-[0_10px_28px_rgba(255,255,255,0.22)] flex items-center gap-3 group transition-all cursor-pointer"
          >
            <span>Let&apos;s Get Started</span>
            <span className="w-6 h-6 rounded-full bg-[#111638] text-white flex items-center justify-center font-bold text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </Link>

          {/* Secondary CTA: Transparent text link */}
          <a
            href="#performance"
            className="text-white hover:text-[#A6B9FF] font-medium text-[12px] sm:text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Book a call</span>
            <span className="text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </a>
        </div>

        {/* 3D Floating Notification Bell Artwork on Right */}
        <div className="hidden md:block absolute right-4 lg:right-12 bottom-2 lg:bottom-6 select-none pointer-events-none z-20">
          <div className="relative w-28 h-28 lg:w-36 lg:h-36 drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marklab-bell.jpg"
              alt="Marklab 3D Bell"
              className="w-full h-full object-contain rounded-3xl"
            />
          </div>
        </div>
      </div>

      {/* Made in Webflow Badge */}
      <div className="fixed bottom-3 right-3 z-40 bg-white text-slate-800 text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md border border-[#E4E7F2] hover:bg-slate-50 transition-all select-none cursor-pointer">
        <svg className="w-3.5 h-2.5 text-[#146EF5]" viewBox="0 0 16 12" fill="currentColor">
          <path d="M12.9 0L9.8 8.1 7.4 0H4.3L1.2 8.1 0 0h-.2v12h3.5L5.8 4.2 8.3 12h3.4l2.5-7.8L16 12h.2V0h-3.3z" />
        </svg>
        <span>Made in Webflow</span>
      </div>
    </section>
  );
}

/* =========================================================================
   3. TRUSTED BY / CLIENT LOGOS STRIP
   ========================================================================= */

function ClientLogoStrip() {
  const logos = [
    { name: 'Logopoint', symbol: '●' },
    { name: 'Loopify', symbol: '◎' },
    { name: 'Luma', symbol: '✦' },
    { name: 'Nexora', symbol: '◆' },
    { name: 'Brightwave', symbol: '▲' },
  ];

  return (
    <section className="bg-white py-7 sm:py-9 border-b border-[#E4E7F2]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[11px] sm:text-[12px] font-medium text-[#6F718A] uppercase tracking-wider select-none font-tasaorbiter">
          Trusted by ambitious brands and growing teams
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
    </section>
  );
}

/* =========================================================================
   4. PERFORMANCE MARKETING SHOWCASE (2-Column Grid)
   ========================================================================= */

function MarketingShowcase() {
  return (
    <section id="performance" className="py-12 sm:py-16 bg-[#F7F8FF]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
          {/* Left Panel: Wider Card (~2:1 ratio) with Dashboard Floating Metric */}
          <div className="lg:col-span-8 bg-gradient-to-br from-[#EDF1FF] via-white to-[#F7F8FF] border border-[#E4E7F2] rounded-[14px] p-6 sm:p-8 flex flex-col justify-between shadow-[0_6px_24px_rgba(27,37,100,0.05)] relative overflow-hidden group hover:shadow-[0_10px_32px_rgba(27,37,100,0.08)] transition-all">
            {/* Top Floating White Metric Card */}
            <div className="flex items-start justify-between">
              <div className="bg-white border border-[#E4E7F2] rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(27,37,100,0.06)] flex items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6F718A] tracking-wider block font-tasaorbiter">
                    Revenue Growth
                  </span>
                  <div className="text-[26px] sm:text-[28px] font-bold text-[#222442] leading-none mt-0.5 font-tasaorbiter">
                    99%
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#5558FF]/10 text-[#5558FF] flex items-center justify-center font-bold text-xs">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Decorative Blue Floating Bubble */}
              <div className="w-8 h-8 rounded-full bg-[#5558FF] text-white flex items-center justify-center shadow-md">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            {/* Content Body */}
            <div className="mt-8 sm:mt-10">
              <h2 className="text-[22px] sm:text-[26px] font-medium text-[#222442] leading-[1.15] font-tasaorbiter">
                Choose Sailment Agency for{' '}
                <span className="font-instrumentserif italic font-normal text-[#5558FF]">
                  Digital Growth
                </span>
              </h2>
              <p className="mt-2.5 text-[12px] sm:text-[14px] text-[#6F718A] leading-[1.45] max-w-lg">
                We provide strategic performance marketing to scale customer acquisition, boost ROI,
                and convert traffic into long-term revenue.
              </p>

              {/* Bottom Actions */}
              <div className="mt-6 flex items-center gap-4">
                <Link
                  href="/login"
                  className="bg-[#5558FF] hover:bg-[#4346F0] text-white text-[12px] font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_4px_14px_rgba(85,88,255,0.3)] transition-all group"
                >
                  <span>Get Started</span>
                  <span className="text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    ↗
                  </span>
                </Link>
                <a
                  href="#workflow"
                  className="text-[#5558FF] hover:text-[#4346F0] font-medium text-[12px] flex items-center gap-1 transition-colors group"
                >
                  <span>Book a call</span>
                  <span className="text-[11px] group-hover:translate-x-0.5 transition-transform">↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Panel: Narrower Pale Blue Card */}
          <div className="lg:col-span-4 bg-[#EDF1FF] border border-[#E4E7F2] rounded-[14px] p-6 sm:p-8 flex flex-col justify-between shadow-[0_6px_24px_rgba(27,37,100,0.05)] hover:shadow-[0_10px_32px_rgba(27,37,100,0.08)] transition-all">
            <div>
              <div className="w-8 h-8 rounded-full bg-white text-[#5558FF] flex items-center justify-center shadow-xs border border-[#E4E7F2]">
                <Target className="w-4 h-4 stroke-[2]" />
              </div>

              <h3 className="mt-6 text-[20px] sm:text-[22px] font-medium text-[#222442] leading-[1.15] font-tasaorbiter">
                Become the{' '}
                <span className="font-instrumentserif italic font-normal text-[#5558FF]">
                  B2B Marketing
                </span>{' '}
                squad
              </h3>

              <p className="mt-2.5 text-[12px] sm:text-[13px] text-[#6F718A] leading-[1.45]">
                Build a predictable acquisition pipeline with targeted multichannel campaigns
                engineered specifically for enterprise pipeline velocity.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E4E7F2]/80 flex items-center justify-between text-[11px] font-semibold text-[#5558FF]">
              <span>FULL-FUNNEL AUDIT INCLUDED</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   5. SMART SERVICE / SERVICE CARDS
   ========================================================================= */

function ServicesSection() {
  const services = [
    {
      title: 'Search Engine Optimization',
      desc: 'Improve search visibility and organic traffic through deep technical audits and semantic authority.',
      icon: Search,
      iconBg: 'bg-[#5558FF]/10 text-[#5558FF]',
    },
    {
      title: 'Pay-Per-Click Advertising',
      desc: 'Run targeted campaigns with measurable returns across Google, Meta, and LinkedIn networks.',
      icon: MousePointerClick,
      iconBg: 'bg-[#B39BFF]/20 text-[#5558FF]',
    },
    {
      title: 'Social Media Marketing',
      desc: 'Grow audience engagement, brand authority, and community-driven conversions across channels.',
      icon: Megaphone,
      iconBg: 'bg-[#A6B9FF]/20 text-[#5558FF]',
    },
    {
      title: 'Content Marketing',
      desc: 'Create valuable editorial content that attracts high-intent buyers and builds industry leadership.',
      icon: FileText,
      iconBg: 'bg-[#5558FF]/10 text-[#5558FF]',
    },
  ];

  return (
    <section id="services" className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-[28px] sm:text-[36px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
              Smart Service <br />
              <span className="font-instrumentserif italic font-normal text-[#5558FF]">
                That Real Impact.
              </span>
            </h2>
          </div>

          <Link
            href="/login"
            className="self-start sm:self-end bg-[#5558FF] hover:bg-[#4346F0] text-white text-[12px] font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_4px_14px_rgba(85,88,255,0.25)] transition-all group"
          >
            <span>Let&apos;s Collaborate</span>
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
              <div
                key={service.title}
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
                  <span>Explore Service</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   6. DIGITAL GROWTH FEATURE & WORKFLOW
   ========================================================================= */

function GrowthWorkflow() {
  const steps = [
    {
      num: '01',
      title: 'Start Your Digital Journey With Confidence',
      desc: 'Align business objectives, audit existing funnels, and benchmark conversion KPIs.',
    },
    {
      num: '02',
      title: 'Connect For A Strategy Call That Sets Direction',
      desc: 'Map target personas, establish attribution models, and pinpoint high-leverage growth channels.',
    },
    {
      num: '03',
      title: 'Receive A Tailored Plan Built For Your Success',
      desc: 'Get a full omnichannel marketing architecture with concrete timelines and projected pipeline metrics.',
    },
    {
      num: '04',
      title: 'Launch, Measure, And Optimize For Growth',
      desc: 'Deploy agile multivariate campaigns, track performance telemetry, and continuously optimize CPA.',
    },
  ];

  return (
    <section id="workflow" className="py-12 sm:py-16 bg-[#F7F8FF]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
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
                  AI Email Engine
                </span>
                <span className="text-[10px] bg-[#EDF1FF] text-[#5558FF] px-2 py-0.5 rounded-full font-mono font-semibold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Right Content: 4 Step Workflow */}
          <div className="lg:col-span-6">
            <h2 className="text-[26px] sm:text-[34px] font-medium text-[#222442] leading-[1.15] font-tasaorbiter">
              Digital Growth in{' '}
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
            <div className="mt-6">
              <Link
                href="/login"
                className="bg-[#5558FF] hover:bg-[#4346F0] text-white text-[12px] font-medium px-5 py-2.5 rounded-full inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(85,88,255,0.25)] transition-all group"
              >
                <span>Start Journey</span>
                <span className="text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  ↗
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   7. SELECTED WORK / PORTFOLIO GALLERY
   ========================================================================= */

function PortfolioGallery() {
  const portfolio = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
      title: 'Nurture leads with personalized email marketing automation.',
      category: 'Email Automation',
      isWide: true,
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      title: 'Generate demand through targeted LinkedIn ad campaigns.',
      category: 'Paid Acquisition',
      isWide: false,
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      title: 'Capture leads with high-converting website experiences.',
      category: 'Conversion Optimization',
      isWide: false,
    },
  ];

  return (
    <section id="portfolio" className="py-12 sm:py-16 bg-white border-b border-[#E4E7F2]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Heading */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-[28px] sm:text-[36px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
            We have{' '}
            <span className="font-instrumentserif italic font-normal text-[#5558FF]">
              build
            </span>
          </h2>
          <p className="mt-2 text-[12px] sm:text-[13px] text-[#6F718A]">
            Selected case studies demonstrating commercial impact across digital brands.
          </p>
        </div>

        {/* 3-Column Image Gallery with First Card Approximately 1.4x Wider */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-3.5 sm:gap-4 items-start">
          {portfolio.map((item) => (
            <div
              key={item.id}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   8. CLIENT TESTIMONIALS
   ========================================================================= */

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'VP Marketing, Luma Technologies',
      quote:
        'Marklab transformed our acquisition funnel within 60 days. Our organic inbound pipeline increased by 140% while slashing cost-per-acquisition.',
      logo: 'Luma',
    },
    {
      name: 'Daniel Foster',
      role: 'Founder, Nexora Health',
      quote:
        'Their targeted PPC and editorial content strategy delivered predictable high-intent enterprise demos from week one.',
      logo: 'Nexora',
    },
    {
      name: 'Emma Wilson',
      role: 'Head of Growth, Loopify',
      quote:
        'The data-first approach and lightning-fast optimization gave our product launch the velocity and visibility it needed.',
      logo: 'Loopify',
    },
    {
      name: 'James Carter',
      role: 'CMO, Brightwave Media',
      quote:
        'An indispensable growth partner. They do not just run ads—they architect full-funnel digital dominance with flawless execution.',
      logo: 'Brightwave',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#F7F8FF]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-[26px] sm:text-[34px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
            Client take some{' '}
            <span className="font-instrumentserif italic font-normal text-[#5558FF]">
              lovely words
            </span>
          </h2>
          <p className="mt-2 text-[12px] sm:text-[13px] text-[#6F718A]">
            Real feedback from brands we&apos;ve helped
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-[#EDF1FF] border border-[#E4E7F2] rounded-[12px] p-5 sm:p-6 flex flex-col justify-between shadow-[0_4px_16px_rgba(27,37,100,0.03)] hover:shadow-[0_8px_24px_rgba(27,37,100,0.06)] transition-all"
            >
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6F718A] uppercase tracking-wider mb-3">
                  <span className="text-[#5558FF]">●</span>
                  <span>{t.logo}</span>
                </div>
                <p className="text-[12px] text-[#222442] leading-[1.45] italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#E4E7F2]/80">
                <div className="text-[12px] font-bold text-[#222442] font-tasaorbiter">{t.name}</div>
                <div className="text-[10px] text-[#6F718A]">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   9. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)
   ========================================================================= */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What makes Marklab different from other digital marketing agencies?',
      a: 'We combine performance growth engineering with bespoke editorial creative. Instead of vanity metrics, every campaign is tied to revenue linearizability, unit economics, and pipeline acceleration.',
    },
    {
      q: 'Which industries do you specialize in?',
      a: 'We specialize in high-growth B2B SaaS, enterprise technology platforms, fintech, and modern digital commerce brands seeking predictable, profitable market expansion.',
    },
    {
      q: 'How can we get started with your team?',
      a: 'Book an introductory strategy call. We perform a zero-commitment growth and funnel audit, identifying immediate friction points and high-leverage acquisition opportunities.',
    },
    {
      q: 'Does your service include marketing analytics?',
      a: 'Yes. Every engagement includes end-to-end multi-touch attribution modeling, live telemetry dashboards, cohort analysis, and automated weekly performance briefs.',
    },
    {
      q: 'Do you offer customized marketing plans?',
      a: 'All our plans are custom engineered. We tailor channel allocation, creative production, and bidding strategies to match your specific sales cycle and customer lifetime value.',
    },
    {
      q: 'What services does Marklab offer?',
      a: 'Our core capabilities encompass technical SEO, paid search & social acquisition (PPC), automated email lifecycle marketing, conversion rate optimization (CRO), and strategic brand positioning.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-[26px] sm:text-[34px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
            Frequently asked <br />
            questions
          </h2>
        </div>

        {/* Accordion Container (~650px wide) */}
        <div className="max-w-[650px] mx-auto space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-[#EDF1FF] border border-[#E4E7F2] rounded-[8px] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-[12px] sm:text-[13px] font-medium text-[#222442] font-tasaorbiter">
                    {faq.q}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white text-[#5558FF] flex items-center justify-center shrink-0 border border-[#E4E7F2] text-xs">
                    {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 pt-1 text-[12px] text-[#6F718A] leading-relaxed border-t border-[#E4E7F2]/60 animate-in fade-in duration-200">
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
   10. READ ARTICLES / BLOG SECTION
   ========================================================================= */

function ArticlesSection() {
  const articles = [
    {
      title: 'How to get more leads from Google ads',
      tag: 'PAID ACQUISITION',
      readTime: '5 MIN READ',
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Easy ways to improve your email open rates',
      tag: 'RETENTION',
      readTime: '4 MIN READ',
      image:
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Simple tips to boost your website traffic',
      tag: 'ORGANIC GROWTH',
      readTime: '6 MIN READ',
      image:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section id="articles" className="py-12 sm:py-16 bg-[#F7F8FF]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-[26px] sm:text-[34px] font-medium text-[#222442] leading-[1.1] font-tasaorbiter">
              Read article
            </h2>
            <p className="mt-1.5 text-[12px] sm:text-[13px] text-[#6F718A]">
              Insights, playbooks, and tactical frameworks from our growth strategists.
            </p>
          </div>

          <a
            href="#articles"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5558FF] hover:text-[#4346F0] tracking-wider transition-colors group"
          >
            <span>ALL ARTICLES</span>
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
    <section className="relative w-full py-16 sm:py-24 bg-[#111638] text-white overflow-hidden text-center">
      {/* Vivid Blue and Lavender Radial Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#5558FF]/50 via-[#A6B9FF]/30 to-[#B39BFF]/20 blur-[110px] rounded-full" />
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2
          className="text-[32px] sm:text-[44px] md:text-[50px] font-medium leading-[1.1] text-white font-tasaorbiter"
          style={{ color: '#ffffff' }}
        >
          Ready to{' '}
          <span
            className="font-instrumentserif italic font-normal text-white"
            style={{ color: '#ffffff' }}
          >
            see
          </span>{' '}
          <br />
          <span
            className="font-instrumentserif italic font-normal text-white"
            style={{ color: '#ffffff' }}
          >
            real
          </span>{' '}
          Results
        </h2>

        <div className="mt-8 flex items-center justify-center gap-5 sm:gap-6">
          <Link
            href="/login"
            className="bg-white hover:bg-[#F7F8FF] text-[#111638] font-semibold pl-5 pr-2 py-2 sm:py-2.5 text-[12px] sm:text-[13px] rounded-full shadow-[0_10px_28px_rgba(255,255,255,0.2)] flex items-center gap-3 group transition-all cursor-pointer"
          >
            <span>Let&apos;s Get Started</span>
            <span className="w-6 h-6 rounded-full bg-[#111638] text-white flex items-center justify-center font-bold text-[11px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </Link>

          <a
            href="#faq"
            className="text-white hover:text-[#A6B9FF] font-medium text-[12px] sm:text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Book a call</span>
            <span className="text-[11px] group-hover:translate-x-0.5 transition-transform">↗</span>
          </a>
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
    <footer className="bg-white border-t border-[#E4E7F2] pt-12 sm:pt-16 pb-8 relative overflow-hidden text-[#222442]">
      {/* Faint Oversized Watermark behind bottom strip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[120px] sm:text-[180px] font-extrabold text-[#F7F8FF] select-none pointer-events-none tracking-tight font-tasaorbiter z-0 opacity-80">
        Marklab
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-12">
          {/* Column 1: Brand & Contact */}
          <div className="lg:col-span-4 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-full bg-[#E9D5FF] text-[#1E1B4B] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#222442] font-tasaorbiter">
                Marklab
              </span>
            </Link>
            <p className="text-[12px] text-[#6F718A] leading-relaxed max-w-xs">
              Premium digital marketing and growth agency architecting full-funnel customer acquisition.
            </p>
            <div className="pt-2 text-[12px] text-[#5558FF] font-medium font-mono">
              hello@marklab.agency
            </div>
          </div>

          {/* Column 2: Menu */}
          <div className="lg:col-span-2 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#222442] font-tasaorbiter">
              Menu
            </div>
            <ul className="space-y-1.5 text-[12px] text-[#6F718A]">
              <li>
                <a href="#" className="hover:text-[#5558FF] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#performance" className="hover:text-[#5558FF] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-[#5558FF] transition-colors">
                  Work
                </a>
              </li>
              <li>
                <a href="#articles" className="hover:text-[#5558FF] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-[#5558FF] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="lg:col-span-2 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#222442] font-tasaorbiter">
              Quick Links
            </div>
            <ul className="space-y-1.5 text-[12px] text-[#6F718A]">
              <li>
                <a href="#services" className="hover:text-[#5558FF] transition-colors">
                  SEO
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#5558FF] transition-colors">
                  PPC Advertising
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#5558FF] transition-colors">
                  Social Media
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#5558FF] transition-colors">
                  Web Design
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#5558FF] transition-colors">
                  Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#222442] font-tasaorbiter">
              Newsletter for updates
            </div>
            <p className="text-[12px] text-[#6F718A]">
              Receive our bi-weekly breakdown of conversion funnels, paid media, and growth tactics.
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 bg-[#F7F8FF] border border-[#E4E7F2] rounded-full px-4 py-2 text-[12px] text-[#222442] placeholder-[#6F718A] focus:outline-none focus:border-[#5558FF] transition-colors"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-[#5558FF] hover:bg-[#4346F0] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95"
                title="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <span className="text-[11px] font-medium text-emerald-600">
                ✓ Thank you for subscribing!
              </span>
            )}
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 border-t border-[#E4E7F2] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6F718A]">
          <div>© 2026 Marklab Agency. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-[#5558FF] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Continuity Workspace Platform</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span>•</span>
            <span>Design &amp; Development by Marklab Studio</span>
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
      {/* 1 & 2. Hero Section with Integrated Floating Pill Navbar */}
      <HeroSection />

      {/* 3. Trusted By / Client Logos Strip */}
      <ClientLogoStrip />

      {/* 4. Performance Marketing Showcase */}
      <MarketingShowcase />

      {/* 5. Smart Service / Service Cards */}
      <ServicesSection />

      {/* 6. Digital Growth Feature & Workflow */}
      <GrowthWorkflow />

      {/* 7. Selected Work / Portfolio Gallery */}
      <PortfolioGallery />

      {/* 8. Client Testimonials */}
      <TestimonialsSection />

      {/* 9. Frequently Asked Questions (FAQ) */}
      <FAQSection />

      {/* 10. Read Articles */}
      <ArticlesSection />

      {/* 11. Final Dramatic CTA */}
      <FinalCTA />

      {/* 12. Footer */}
      <Footer />
    </div>
  );
}
