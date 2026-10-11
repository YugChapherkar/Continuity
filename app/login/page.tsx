'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  KeyRound,
  UserPlus,
} from 'lucide-react';

export default function LoginPage() {
  const { users, currentUser, setCurrentUser, showToast } = useApp();
  const [selectedUser, setSelectedUser] = useState(currentUser);
  const [activeTab, setActiveTab] = useState<'persona' | 'credentials' | 'register'>('persona');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignInAsPersona = () => {
    setCurrentUser(selectedUser);
    showToast(`Authenticated as ${selectedUser.name} (${selectedUser.role})`, 'success');
    router.push('/');
  };

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Signed in successfully with corporate SSO credentials.`, 'success');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#050606] text-[#F5F5F2] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-xl space-y-8 relative z-10">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2563EB] text-white font-bold text-xl shadow-lg shadow-[#2563EB]/30 mb-2">
            C
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F5F2]">CONTINUITY</h1>
          <p className="text-xs text-[#A0A09D] font-mono uppercase tracking-wider">
            Enterprise Engineering Knowledge Handoff Platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0D0F10] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-[#141718] border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab('persona')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'persona'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teammate Persona</span>
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'credentials'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Corporate SSO</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Hire</span>
            </button>
          </div>

          {/* TAB 1: ONE-CLICK TEAMMATE PERSONA */}
          {activeTab === 'persona' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Select Engineering Teammate
                </label>
                <select
                  value={selectedUser.id}
                  onChange={(e) => {
                    const u = users.find((x) => x.id === e.target.value);
                    if (u) setSelectedUser(u);
                  }}
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-[#F5F5F2] focus:outline-none focus:border-[#2563EB]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role} ({u.department.split('&')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Clickable Grid of Colleagues */}
              <div className="grid grid-cols-2 gap-2.5">
                {users.map((u) => {
                  const isSelected = u.id === selectedUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-blue-950/30 border-blue-500/50 text-white'
                          : 'bg-[#141718] border-white/5 text-neutral-400 hover:border-white/15 hover:text-neutral-200'
                      }`}
                    >
                      <Avatar name={u.name} initials={u.initials} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">{u.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">{u.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sign in Button */}
              <button
                type="button"
                onClick={handleSignInAsPersona}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign in as {selectedUser.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 2: CORPORATE SSO */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Enterprise Work Email
                </label>
                <input
                  type="email"
                  placeholder="engineer@continuity.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-[#F5F5F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Hardware Token / SSO Key
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-[#F5F5F2]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/30 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Verify WebAuthn &amp; Enter Platform</span>
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER */}
          {activeTab === 'register' && (
            <div className="space-y-4 text-xs text-neutral-300">
              <p className="leading-relaxed text-[#A0A09D]">
                New team member accounts are provisioned automatically via internal Okta / SCIM directory syncing.
              </p>
              <div className="bg-[#141718] border border-white/5 rounded-xl p-4 space-y-2 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SPIRE Workload Attestation active</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>FIDO2 Passkeys enabled</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('persona')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-neutral-200 rounded-xl text-xs font-medium transition-colors"
              >
                Return to Teammate Persona Selector
              </button>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
            <span>FIDO2 / WebAuthn Enforced</span>
            <span>Zero-Knowledge Handover Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
