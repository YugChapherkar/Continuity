'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
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
  Users,
} from 'lucide-react';

export default function LoginPage() {
  const { setCurrentUser, setIsAuthenticated, showToast, theme, toggleTheme } = useApp();
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
    <div className="min-h-screen bg-[#F8FAFC] text-black font-sans flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Top Navigation Bar: matches Landing Page clean approach */}
      <header className="marklab-navbar-header relative z-40 max-w-[1280px] mx-auto pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 w-full">
        <nav className="bg-white border border-slate-200 rounded-2xl sm:rounded-full px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between shadow-sm transition-all text-black">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/deimij13f/image/upload/v1791857115/logo-c_mq0xbm.png"
              alt="Continuity"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Right Action Group */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-neutral-800 hover:text-black transition-colors flex items-center gap-1.5"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-black transition-colors cursor-pointer"
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-black" />
              ) : (
                <Sun className="w-4 h-4 text-black" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16 w-full max-w-[1280px] mx-auto">
        {/* =========================================================================
            STAGE 1: PORTAL SELECTION (Clean Cards, zero gradients, pure black/white)
           ========================================================================= */}
        {selectedPortal === 'question' && (
          <main className="w-full max-w-2xl">
            {/* Header / Intro */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white border border-slate-200 mb-4 shadow-sm">
                <span className="text-xs font-semibold tracking-wider uppercase text-black font-tasaorbiter">
                  Enterprise Authentication
                </span>
              </div>
              <h1 className="hero-black-text text-3xl sm:text-4xl font-semibold tracking-tight text-black font-tasaorbiter">
                Sign in to Continuity
              </h1>
              <p className="mt-2 text-sm sm:text-base text-neutral-700">
                Select your designated access portal to enter your workspace.
              </p>
            </div>

            {/* Portal Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Option 1: Employee Login */}
              <div
                onClick={() => {
                  setSelectedPortal('employee');
                  setEmployeeAuthTab('email');
                  setErrorMessage(null);
                }}
                className="bg-white hover:bg-white border border-slate-200 hover:border-black rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 group cursor-pointer shadow-sm"
              >
                <div>
                  <Users className="w-6 h-6 text-black stroke-[2] mb-5 group-hover:scale-105 transition-transform" />
                  <h2 className="hero-black-text text-xl font-semibold text-black font-tasaorbiter">
                    Employee Portal
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    Access shift handoffs, submit updates, track active tasks, and consult the RAG knowledge base.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black">
                  <span>Enter as Employee</span>
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Option 2: Administrator Login */}
              <div
                onClick={() => {
                  setSelectedPortal('admin');
                  setErrorMessage(null);
                }}
                className="bg-white hover:bg-white border border-slate-200 hover:border-black rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 group cursor-pointer shadow-sm"
              >
                <div>
                  <ShieldCheck className="w-6 h-6 text-black stroke-[2] mb-5 group-hover:scale-105 transition-transform" />
                  <h2 className="hero-black-text text-xl font-semibold text-black font-tasaorbiter">
                    Administrator Portal
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    Governance dashboard, executive audit trail, pod member assignments, and deliverable reviews.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black">
                  <span>Enter as Admin</span>
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials */}
            {isDemoMode && (
              <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-600">
                    Verified Demo Credentials (1-Click Fill)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-black text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Main Admin</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black text-white font-mono font-semibold">Admin</span>
                    </div>
                    <div className="text-xs font-semibold mt-1 text-black">Yug Chapherkar</div>
                    <div className="text-[11px] text-neutral-600 font-mono truncate">admin@phx.in</div>
                    <div className="text-[10px] text-neutral-500 mt-1 font-mono">Pass: 12345678</div>
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
                    className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-black text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Project Lead</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-black font-mono font-semibold">Lead</span>
                    </div>
                    <div className="text-xs font-semibold mt-1 text-black">Marcus Vance</div>
                    <div className="text-[11px] text-neutral-600 font-mono truncate">lead@phx.in</div>
                    <div className="text-[10px] text-neutral-500 mt-1 font-mono">Pass: 12345678</div>
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
                    className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-black text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">Employee</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-black font-mono font-semibold">Staff</span>
                    </div>
                    <div className="text-xs font-semibold mt-1 text-black">Jessica Chauhan</div>
                    <div className="text-[11px] text-neutral-600 font-mono truncate">employee@phx.in</div>
                    <div className="text-[10px] text-neutral-500 mt-1 font-mono">Pass: 12345678</div>
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
          <main className="w-full max-w-md">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all text-black">
              {/* Back button */}
              <button
                onClick={() => {
                  setSelectedPortal('question');
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1.5 mb-5 cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to portal selection</span>
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-slate-200 flex items-center justify-center mx-auto mb-3 text-black">
                  <Users className="w-5 h-5 stroke-[2]" />
                </div>
                <h1 className="hero-black-text text-2xl font-bold tracking-tight text-black font-tasaorbiter">
                  Employee Login
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-neutral-600">
                  Sign in with your company credentials
                </p>
              </div>

              {/* Tab Switcher: Company Email vs Employee ID */}
              <div className="grid grid-cols-2 p-1 bg-[#F8FAFC] border border-slate-200 rounded-xl gap-1 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setEmployeeAuthTab('email');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    employeeAuthTab === 'email'
                      ? 'dark-cta-btn bg-black text-white shadow-sm'
                      : 'text-neutral-700 hover:text-black'
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
                      ? 'dark-cta-btn bg-black text-white shadow-sm'
                      : 'text-neutral-700 hover:text-black'
                  }`}
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Employee ID</span>
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
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
                        className="block text-xs font-semibold text-black mb-1.5"
                      >
                        Company Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
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
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:border-black focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="company-password-input"
                          className="block text-xs font-semibold text-black"
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => showToast('Password recovery instructions sent to your registered work email.', 'info')}
                          className="text-[11px] font-semibold text-neutral-600 hover:text-black hover:underline cursor-pointer"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
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
                          className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:border-black focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-black transition-colors cursor-pointer"
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
                        className="block text-xs font-semibold text-black mb-1.5"
                      >
                        Employee ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
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
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="employee-pin-input"
                          className="block text-xs font-semibold text-black"
                        >
                          Security PIN
                        </label>
                        <button
                          type="button"
                          onClick={() => showToast('Security PIN recovery request submitted to your administrator.', 'info')}
                          className="text-[11px] font-semibold text-neutral-600 hover:text-black hover:underline cursor-pointer"
                        >
                          Reset PIN?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          id="employee-pin-input"
                          type={showPin ? 'text' : 'password'}
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="••••••"
                          maxLength={12}
                          className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-black transition-colors cursor-pointer"
                          title={showPin ? 'Hide PIN' : 'Show PIN'}
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Remember Me */}
                <div className="flex items-center text-xs text-neutral-700 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-black focus:ring-0 accent-black cursor-pointer"
                    />
                    <span>Remember on this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  id="employee-login-submit-btn"
                  className="dark-cta-btn w-full py-3.5 px-4 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
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

                {/* Quick Autofills inside panel */}
                {isDemoMode && (
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmployeeAuthTab('email');
                        setEmail('lead@phx.in');
                        setPassword('12345678');
                        setErrorMessage(null);
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[11px] text-black font-mono text-center transition-colors cursor-pointer border border-slate-200"
                    >
                      Lead (lead@phx.in)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmployeeAuthTab('email');
                        setEmail('employee@phx.in');
                        setPassword('12345678');
                        setErrorMessage(null);
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[11px] text-black font-mono text-center transition-colors cursor-pointer border border-slate-200"
                    >
                      Employee (employee@phx.in)
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
          <main className="w-full max-w-md">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all text-black">
              {/* Back button */}
              <button
                onClick={() => {
                  setSelectedPortal('question');
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1.5 mb-5 cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to portal selection</span>
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-slate-200 flex items-center justify-center mx-auto mb-3 text-black">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <h1 className="hero-black-text text-2xl font-bold tracking-tight text-black font-tasaorbiter">
                  Administrator Login
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-neutral-600">
                  Enter governance and executive credentials
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
                <div>
                  <label
                    htmlFor="admin-identifier-input"
                    className="block text-xs font-semibold text-black mb-1.5"
                  >
                    Email or Admin ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="admin-password-input"
                      className="block text-xs font-semibold text-black"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast('Password recovery instructions sent to your registered email.', 'info')}
                      className="text-[11px] font-semibold text-neutral-600 hover:text-black hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
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
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:border-black focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-black transition-colors cursor-pointer"
                      title={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center text-xs text-neutral-700 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-black focus:ring-0 accent-black cursor-pointer"
                    />
                    <span>Remember on this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  id="admin-login-submit-btn"
                  className="dark-cta-btn w-full py-3.5 px-4 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
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

                {/* Quick Autofill */}
                {isDemoMode && (
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminIdentifier('admin@phx.in');
                        setAdminPassword('12345678');
                        setErrorMessage(null);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[11px] text-black font-mono text-center transition-colors cursor-pointer border border-slate-200"
                    >
                      Auto-fill Main Admin (admin@phx.in / 12345678)
                    </button>
                  </div>
                )}
              </form>
            </div>
          </main>
        )}
      </div>

      {/* Clean Footer Strip */}
      <footer className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-600 gap-3">
        <div>&copy; {new Date().getFullYear()} CONTINUITY Enterprise Platform. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-neutral-700 hover:text-black font-medium transition-colors">
            Privacy Policy
          </Link>
          <Link href="/" className="text-neutral-700 hover:text-black font-medium transition-colors">
            Terms of Service
          </Link>
          <Link href="/" className="text-neutral-700 hover:text-black font-medium transition-colors">
            Architecture
          </Link>
        </div>
      </footer>
    </div>
  );
}
