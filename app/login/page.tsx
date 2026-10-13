'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { IridescentWave } from '@/components/ui/IridescentWave';
import { User } from '@/lib/types';
import {
  Mail,
  BadgeCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sun,
  Moon,
  ShieldCheck,
  ShieldAlert,
  Users,
} from 'lucide-react';

export default function LoginPage() {
  const { users, setCurrentUser, setIsAuthenticated, showToast, theme, toggleTheme } = useApp();
  const router = useRouter();
  const isLight = theme === 'light';

  // Entry Question Step: First ask Employee vs Admin, then show that panel
  const [selectedPortal, setSelectedPortal] = useState<'question' | 'employee' | 'admin'>('question');

  // Employee authentication options: Company Email vs Employee ID
  const [employeeAuthTab, setEmployeeAuthTab] = useState<'email' | 'employeeId'>('email');

  // Input States for Employee Login
  const [email, setEmail] = useState('');
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');

  // Input States for Admin Login
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Demo Mode check
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  // Quick Credentials Autofill Handler
  const handleSelectDemoCredentials = (creds: {
    identifier: string;
    pass: string;
    portal: 'admin' | 'employee';
  }) => {
    setSelectedPortal(creds.portal);
    if (creds.portal === 'admin') {
      setAdminIdentifier(creds.identifier);
      setAdminPassword(creds.pass);
    } else {
      setEmployeeAuthTab('email');
      setEmail(creds.identifier);
      setPassword(creds.pass);
    }
    setErrorMessage(null);
  };

  // Form Submission via Real JWT Authentication Endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier =
      selectedPortal === 'admin'
        ? adminIdentifier.trim()
        : employeeAuthTab === 'email'
        ? email.trim()
        : employeeIdInput.trim();

    const plainPassword =
      selectedPortal === 'admin'
        ? adminPassword
        : password || pin;

    if (!identifier) {
      setErrorMessage(selectedPortal === 'admin' ? 'Please enter your Admin Email or ID.' : 'Please enter your company email address.');
      return;
    }

    if (!plainPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password: plainPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check credentials.');
        return;
      }

      // Securely store user in client state (auth is managed via HTTP-only cookie)
      if (data.token) {
        localStorage.setItem('continuity_token', data.token);
      } else {
        localStorage.removeItem('continuity_token');
      }
      localStorage.setItem('continuity_current_user_id', data.user.id);
      setCurrentUser(data.user);
      setIsAuthenticated(true);

      showToast(`Welcome, ${data.user.name} (${data.user.systemRole || 'Employee'})!`, 'success');
      router.push('/dashboard');
    } catch {
      setErrorMessage('Unable to reach the authentication service. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden ${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#050606] text-[#F5F5F2]'
      }`}
    >
      {/* Background authentic wave */}
      <IridescentWave />

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto pt-3 sm:pt-5 px-3 sm:px-6 z-30">
        <nav
          className={`backdrop-blur-2xl rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border shadow-lg transition-all ${
            isLight
              ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-[0_12px_32px_rgba(0,0,0,0.06)]'
              : 'bg-[#101216]/90 border-white/10 text-white shadow-[0_16px_36px_rgba(0,0,0,0.4)]'
          }`}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/deimij13f/image/upload/v1791857115/logo-c_mq0xbm.png"
              alt="Continuity"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Center: System Status & Security Pill */}
          <div className="hidden md:flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auth Gateway Active
            </span>
            <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              BCrypt • 256-bit JWT
            </span>
          </div>

          {/* Right Action: Return to Website + Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                isLight
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Back to Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isLight
                  ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? (
                <Moon className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          STAGE 1: THE INITIAL QUESTION GATE (Clean & Direct)
         ========================================================================= */}
      {selectedPortal === 'question' && (
        <main className="w-full max-w-2xl relative z-10 my-auto py-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2 mb-8">
            <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Sign in to Continuity
            </h1>
            <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              Select your access portal to continue
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OPTION 1: EMPLOYEE LOGIN */}
            <div
              onClick={() => {
                setSelectedPortal('employee');
                setEmployeeAuthTab('email');
                setErrorMessage(null);
              }}
              className={`p-6 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between hover:scale-[1.02] shadow-xl ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-blue-500/10'
                  : 'bg-[#0B0D0E] border-white/10 hover:border-blue-500/60 hover:shadow-blue-500/15'
              }`}
            >
              <div className="space-y-3">
                <Users className="w-7 h-7 text-blue-500 group-hover:scale-105 transition-transform" />
                <div>
                  <h2 className={`text-lg font-bold transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'
                  }`}>
                    Employee Login
                  </h2>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    Engineering workspaces, team pods, and shift handoffs.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 group-hover:underline">
                  Continue as Employee
                </span>
                <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* OPTION 2: ADMIN LOGIN */}
            <div
              onClick={() => {
                setSelectedPortal('admin');
                setErrorMessage(null);
              }}
              className={`p-6 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between hover:scale-[1.02] shadow-xl ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-blue-500/10'
                  : 'bg-[#0B0D0E] border-white/10 hover:border-blue-500/60 hover:shadow-blue-500/15'
              }`}
            >
              <div className="space-y-3">
                <ShieldCheck className="w-7 h-7 text-blue-500 group-hover:scale-105 transition-transform" />
                <div>
                  <h2 className={`text-lg font-bold transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'
                  }`}>
                    Administrator Login
                  </h2>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    Platform settings, audit trails, and administration.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 group-hover:underline">
                  Continue as Administrator
                </span>
                <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Access Test Credentials (guarded by NEXT_PUBLIC_DEMO_MODE) */}
          {isDemoMode && (
            <div className={`mt-8 p-4 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
            }`}>
              <div className="mb-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
                  Verified Enterprise Credentials (1-Click Fill)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* ADMIN */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectDemoCredentials({
                      identifier: 'admin@phx.in',
                      pass: '12345678',
                      portal: 'admin',
                    })
                  }
                  className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-blue-500 shadow-sm'
                      : 'bg-[#121518] border-white/10 hover:border-blue-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400">1. Main Admin</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Admin</span>
                  </div>
                  <div className="text-xs font-semibold mt-1">Yug Chapherkar</div>
                  <div className="text-[11px] text-neutral-400 font-mono truncate">admin@phx.in</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">Pass: 12345678</div>
                </button>

                {/* PROJECT LEAD */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectDemoCredentials({
                      identifier: 'lead@phx.in',
                      pass: '12345678',
                      portal: 'employee',
                    })
                  }
                  className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-purple-500 shadow-sm'
                      : 'bg-[#121518] border-white/10 hover:border-purple-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400">2. Project Lead</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Lead</span>
                  </div>
                  <div className="text-xs font-semibold mt-1">Marcus Vance</div>
                  <div className="text-[11px] text-neutral-400 font-mono truncate">lead@phx.in</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">Pass: 12345678</div>
                </button>

                {/* EMPLOYEE */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectDemoCredentials({
                      identifier: 'employee@phx.in',
                      pass: '12345678',
                      portal: 'employee',
                    })
                  }
                  className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-emerald-500 shadow-sm'
                      : 'bg-[#121518] border-white/10 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">3. Employee</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Staff</span>
                  </div>
                  <div className="text-xs font-semibold mt-1">Jessica Chauhan</div>
                  <div className="text-[11px] text-neutral-400 font-mono truncate">employee@phx.in</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">Pass: 12345678</div>
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =========================================================================
          STAGE 2: EMPLOYEE LOGIN PANEL
         ========================================================================= */}
      {selectedPortal === 'employee' && (
        <main className="w-full max-w-md relative z-10 my-auto py-6 animate-in fade-in duration-200">
          <div
            className={`border rounded-2xl p-6 sm:p-7 shadow-2xl transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-slate-200/60'
                : 'bg-[#0B0D0E] border-white/10 shadow-black/80'
            }`}
          >
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedPortal('question');
                setErrorMessage(null);
              }}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-5 cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to portal selection</span>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Employee Login</h1>
            </div>

            {/* Switcher: Company Email vs Badge ID */}
            <div className="grid grid-cols-2 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl gap-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setEmployeeAuthTab('email');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  employeeAuthTab === 'email'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Company Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmployeeAuthTab('employeeId');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  employeeAuthTab === 'employeeId'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Employee ID</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
              {employeeAuthTab === 'email' && (
                <>
                  <div>
                    <label
                      htmlFor="company-email-input"
                      className="block text-xs font-medium text-neutral-300 mb-1.5"
                    >
                      Company Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="company-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="name@continuity.internal"
                        suppressHydrationWarning
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="company-password-input"
                        className="block text-xs font-medium text-neutral-300"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => showToast('Password recovery instructions sent to your registered work email.', 'info')}
                        className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="company-password-input"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        suppressHydrationWarning
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        className="w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {employeeAuthTab === 'employeeId' && (
                <>
                  <div>
                    <label
                      htmlFor="employee-id-input"
                      className="block text-xs font-medium text-neutral-300 mb-1.5"
                    >
                      Employee ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <BadgeCheck className="w-4 h-4" />
                      </div>
                      <input
                        id="employee-id-input"
                        type="text"
                        value={employeeIdInput}
                        onChange={(e) => {
                          setEmployeeIdInput(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="Employee ID"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="employee-pin-input"
                        className="block text-xs font-medium text-neutral-300"
                      >
                        Security PIN
                      </label>
                      <button
                        type="button"
                        onClick={() => showToast('Security PIN recovery request submitted to your administrator.', 'info')}
                        className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                      >
                        Reset PIN?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        id="employee-pin-input"
                        type={showPin ? 'text' : 'password'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••••"
                        maxLength={12}
                        className="w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        title={showPin ? 'Hide PIN' : 'Show PIN'}
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Remember Me */}
              <div className="flex items-center text-xs text-neutral-400 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-0"
                  />
                  <span>Remember on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                id="employee-login-submit-btn"
                className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/50 text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {/* Quick credential buttons inside Employee portal */}
              {isDemoMode && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmployeeAuthTab('email');
                      setEmail('lead@phx.in');
                      setPassword('12345678');
                      setErrorMessage(null);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-[11px] text-purple-300 font-mono text-center transition-colors cursor-pointer border border-purple-500/20"
                  >
                    ⚡ Lead (lead@phx.in)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmployeeAuthTab('email');
                      setEmail('employee@phx.in');
                      setPassword('12345678');
                      setErrorMessage(null);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] text-emerald-300 font-mono text-center transition-colors cursor-pointer border border-emerald-500/20"
                  >
                    ⚡ Employee (employee@phx.in)
                  </button>
                </div>
              )}
            </form>
          </div>
        </main>
      )}

      {/* =========================================================================
          STAGE 3: ADMINISTRATOR LOGIN PANEL
         ========================================================================= */}
      {selectedPortal === 'admin' && (
        <main className="w-full max-w-md relative z-10 my-auto py-6 animate-in fade-in duration-200">
          <div
            className={`border rounded-2xl p-6 sm:p-7 shadow-2xl transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-slate-200/60'
                : 'bg-[#0B0D0E] border-white/10 shadow-black/80'
            }`}
          >
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedPortal('question');
                setErrorMessage(null);
              }}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-5 cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to portal selection</span>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Administrator Login</h1>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
              <div>
                <label
                  htmlFor="admin-identifier-input"
                  className="block text-xs font-medium text-neutral-300 mb-1.5"
                >
                  Email or Admin ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-identifier-input"
                    type="text"
                    value={adminIdentifier}
                    onChange={(e) => {
                      setAdminIdentifier(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="admin@continuity.internal"
                    suppressHydrationWarning
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password-input"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Password recovery instructions sent to your registered email.', 'info')}
                    className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password-input"
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    suppressHydrationWarning
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    className="w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                    title={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center text-xs text-neutral-400 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-0"
                  />
                  <span>Remember on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                id="admin-login-submit-btn"
                className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/50 text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In as Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {/* Quick credential buttons inside Admin portal */}
              {isDemoMode && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminIdentifier('admin@phx.in');
                      setAdminPassword('12345678');
                      setErrorMessage(null);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-[11px] text-blue-300 font-mono text-center transition-colors cursor-pointer border border-blue-500/20"
                  >
                    ⚡ Auto-fill Main Admin (admin@phx.in / 12345678)
                  </button>
                </div>
              )}
            </form>
          </div>
        </main>
      )}

      {/* Clean Footer */}
      <footer className="w-full max-w-4xl py-4 z-20 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 border-t border-white/[0.06] gap-2">
        <span>&copy; {new Date().getFullYear()} Continuity. All rights reserved.</span>
      </footer>
    </div>
  );
}
