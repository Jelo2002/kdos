'use client';

import React, { useState } from 'react';
import { useRole } from './RoleContext';
import { ActiveRole } from '@/lib/types';
import SkinAvatar from './SkinAvatar';
import { 
  Shield, 
  KeyRound, 
  Crown, 
  Code2, 
  ClipboardCheck, 
  Lock, 
  ArrowRight, 
  Check, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginScreen() {
  const { login } = useRole();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'staff' | 'leadership'>('staff');
  const [selectedRole, setSelectedRole] = useState<ActiveRole>('Staff/Interviewer');
  const [ign, setIgn] = useState('');
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const handleTabChange = (tab: 'staff' | 'leadership') => {
    setActiveTab(tab);
    setErrorMsg('');
    if (tab === 'staff') {
      setSelectedRole('Staff/Interviewer');
      if (!ign) setIgn('InterviewerSam');
      setPasscode('');
    } else {
      setSelectedRole('Owner');
      if (!ign) setIgn('Kev_Owner');
      setPasscode('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const targetRole = activeTab === 'staff' ? 'Staff/Interviewer' : selectedRole;
      const res = login(targetRole, ign, passcode);

      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed');
        setIsSubmitting(false);
        return;
      }

      // Successful login - route appropriately
      if (targetRole === 'Staff/Interviewer') {
        router.push('/interview');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error');
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (role: ActiveRole, sampleIgn: string, samplePass: string) => {
    if (role === 'Staff/Interviewer') {
      setActiveTab('staff');
      setSelectedRole('Staff/Interviewer');
    } else {
      setActiveTab('leadership');
      setSelectedRole(role);
    }
    setIgn(sampleIgn);
    setPasscode(samplePass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl animate-fadeIn space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-gray-950 shadow-xl shadow-emerald-500/25 mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            KDOS <span className="text-emerald-400">SMP</span> Portal
          </h1>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Authorized Personnel Only. Please log in with your assigned staff or leadership credentials.
          </p>
        </div>

        {/* Tab Switcher (Staff vs Leadership) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-950/80 rounded-2xl border border-gray-800/80">
          <button
            type="button"
            onClick={() => handleTabChange('staff')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Interviewer / Staff
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('leadership')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'leadership'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            Owner / Dev Admin
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold animate-fadeIn flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* If Leadership: Select Owner vs Developer */}
          {activeTab === 'leadership' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Access Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('Owner');
                    if (ign === 'Avery_Dev') setIgn('Kev_Owner');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'Owner'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/50'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Owner Access
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('Developer');
                    if (ign === 'Kev_Owner') setIgn('Avery_Dev');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'Developer'
                      ? 'bg-blue-950/60 text-blue-300 border-blue-500/50 ring-1 ring-blue-500/50'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  Developer Access
                </button>
              </div>
            </div>
          )}

          {/* Minecraft IGN with Live Avatar Preview */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Your Minecraft Username (IGN)
            </label>
            <div className="flex items-center gap-2.5">
              <SkinAvatar ign={ign || 'Steve'} size={42} />
              <input
                type="text"
                required
                value={ign}
                onChange={(e) => setIgn(e.target.value)}
                placeholder="e.g. YourIGN"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-gray-600 font-medium"
              />
            </div>
          </div>

          {/* Passcode Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {activeTab === 'staff' ? 'Staff Passcode' : 'Admin Security Passcode'}
              </label>
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                Default PINs
              </button>
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={activeTab === 'staff' ? 'Enter staff passcode...' : 'Enter admin passcode...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-gray-600 font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>
              {activeTab === 'staff' ? 'Enter Interview Portal' : 'Unlock Candidate DBMS'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Credentials Helper (Click to Auto-fill) */}
        <div className="pt-2 border-t border-gray-800/60">
          <div className="text-[11px] font-semibold text-gray-400 mb-2 text-center">
            Quick Auto-Fill Demo Passcodes:
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('Owner', 'Kev_Owner', 'owner123')}
              className="px-2 py-1.5 rounded-lg bg-gray-950 hover:bg-gray-800 border border-gray-800/80 text-[10px] text-gray-300 font-mono text-center transition-colors"
              title="Auto-fill Owner credentials"
            >
              👑 <span className="font-bold text-amber-400">Owner</span>
              <div className="text-[9px] text-gray-500">owner123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('Developer', 'Avery_Dev', 'dev123')}
              className="px-2 py-1.5 rounded-lg bg-gray-950 hover:bg-gray-800 border border-gray-800/80 text-[10px] text-gray-300 font-mono text-center transition-colors"
              title="Auto-fill Developer credentials"
            >
              💻 <span className="font-bold text-blue-400">Developer</span>
              <div className="text-[9px] text-gray-500">dev123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('Staff/Interviewer', 'InterviewPro', 'staff123')}
              className="px-2 py-1.5 rounded-lg bg-gray-950 hover:bg-gray-800 border border-gray-800/80 text-[10px] text-gray-300 font-mono text-center transition-colors"
              title="Auto-fill Staff credentials"
            >
              🎙️ <span className="font-bold text-emerald-400">Staff</span>
              <div className="text-[9px] text-gray-500">staff123</div>
            </button>
          </div>
          <p className="text-[10px] text-gray-500 text-center mt-2">
            Tip: You can customize these passcodes anytime in your Vercel Environment Variables (`NEXT_PUBLIC_OWNER_PIN`, etc.).
          </p>
        </div>
      </div>
    </div>
  );
}
