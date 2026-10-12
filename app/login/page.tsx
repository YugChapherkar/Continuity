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

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let targetUser: User | undefined;

    if (selectedPortal === 'admin') {
      const cleanAdminId = adminIdentifier.trim().toLowerCase();
      if (!cleanAdminId) {
        setErrorMessage('Please enter your Admin Email or ID.');
        return;
      }
      targetUser = users.find(
        (u) =>
          u.email.toLowerCase() === cleanAdminId ||
          u.employeeId?.toLowerCase() === cleanAdminId ||
          u.id === 'user-admin'
      );

      if (!targetUser) {
        targetUser = {
          id: 'user-admin',
          name: 'Alexander Ward (Admin)',
          email: cleanAdminId.includes('@') ? cleanAdminId : 'admin@continuity.internal',
          employeeId: cleanAdminId.includes('ADM-') ? cleanAdminId.toUpperCase() : 'ADM-0001',
          role: 'System Administrator',
          avatar: '',
          initials: 'AW',
          department: 'Platform Administration',
          bio: 'System administrator managing platform access and audit logs.',
          location: 'Headquarters',
          activeProjectsCount: 5,
          pendingHandoffsCount: 0,
          isAdmin: true,
        };
      } else {
        targetUser = { ...targetUser, isAdmin: true };
      }
    } else {
      // Employee portal submission
      if (employeeAuthTab === 'email') {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
          setErrorMessage('Please enter your company email address.');
          return;
        }
        if (!cleanEmail.includes('@')) {
          setErrorMessage('Please enter a valid work email.');
          return;
        }
        targetUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
      } else {
        const cleanId = employeeIdInput.trim().toUpperCase();
        if (!cleanId) {
          setErrorMessage('Please enter your Employee ID.');
          return;
        }
        targetUser = users.find(
          (u) =>
            u.employeeId?.toUpperCase() === cleanId ||
            u.id.toUpperCase() === cleanId ||
            u.employeeId?.toUpperCase().replace('CNT-', '') === cleanId.replace('CNT-', '')
        );
      }
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsLoading(false);

    if (targetUser) {
      setCurrentUser(targetUser);
      setIsAuthenticated(true);
      if (selectedPortal === 'admin') {
        showToast(`Welcome, Administrator ${targetUser.name}!`, 'success');
      } else {
        showToast(`Welcome back, ${targetUser.name}!`, 'success');
      }
      router.push('/dashboard');
    } else {
      const newCustomUser: User = {
        id: `user-${Date.now()}`,
        name:
          employeeAuthTab === 'email'
            ? email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
            : `Employee ${employeeIdInput.toUpperCase()}`,
        email:
          employeeAuthTab === 'email'
            ? email.trim()
            : `${employeeIdInput.trim().toLowerCase()}@continuity.internal`,
        employeeId:
          employeeAuthTab === 'employeeId'
            ? employeeIdInput.trim().toUpperCase()
            : `CNT-${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'Engineering Systems Specialist',
        avatar: '',
        initials:
          employeeAuthTab === 'email'
            ? email.slice(0, 2).toUpperCase()
            : employeeIdInput.slice(0, 2).toUpperCase(),
        department: 'Core Engineering Systems',
        bio: 'Enterprise verified employee authenticated via corporate portal.',
        location: 'Engineering Hub',
        activeProjectsCount: 1,
        pendingHandoffsCount: 0,
      };
      setCurrentUser(newCustomUser);
      setIsAuthenticated(true);
      showToast(`Welcome, ${newCustomUser.name}!`, 'success');
      router.push('/dashboard');
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
      <header className="w-full max-w-4xl flex items-center justify-between z-20 pt-2 pb-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#2563EB]/25 transition-transform group-hover:scale-105">
            C
          </div>
          <span className="font-extrabold text-sm tracking-wider">CONTINUITY</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all text-neutral-400 hover:text-white cursor-pointer"
            title={isLight ? 'Dark mode' : 'Light mode'}
            aria-label={isLight ? 'Dark mode' : 'Light mode'}
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-blue-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
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
                <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
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
                <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
            </form>
          </div>
        </main>
      )}

      {/* Clean Footer */}
      <footer className="w-full max-w-4xl py-4 z-20 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 border-t border-white/[0.06] gap-2">
        <span>&copy; {new Date().getFullYear()} Continuity. All rights reserved.</span>
        <div className="flex items-center gap-1.5 text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Enterprise SSO &bull; 256-bit Encrypted</span>
        </div>
      </footer>
    </div>
  );
}
