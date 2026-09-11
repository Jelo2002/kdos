'use client';

import React, { useState } from 'react';
import { useRole } from './RoleContext';
import { ActiveRole } from '@/lib/types';
import SkinAvatar from './SkinAvatar';
import { Shield, KeyRound, Lock, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
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
        setErrorMsg(res.error || 'Invalid credentials');
        setIsSubmitting(false);
        return;
      }

      if (targetRole === 'Staff/Interviewer') {
        router.push('/interview');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
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
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      {/* Container */}
      <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl shadow-2xl p-6 sm:p-7 backdrop-blur-md space-y-5">
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-100 mx-auto shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
            KDOS Operations
          </h1>
          <p className="text-xs text-zinc-400">
            SMP Candidate Management & Workforce System
          </p>
        </div>

        {/* Segmented Control */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-lg border border-zinc-800/80 text-xs">
          <button
            type="button"
            onClick={() => handleTabChange('staff')}
            className={`py-1.5 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Staff Evaluator
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('leadership')}
            className={`py-1.5 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'leadership'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Executive / Admin
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2.5 rounded-md bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {activeTab === 'leadership' && (
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                Access Level
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('Owner');
                    if (ign === 'Avery_Dev') setIgn('Kev_Owner');
                  }}
                  className={`py-1.5 px-2.5 rounded-md text-xs font-medium border transition-all text-center ${
                    selectedRole === 'Owner'
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Owner
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('Developer');
                    if (ign === 'Kev_Owner') setIgn('Avery_Dev');
                  }}
                  className={`py-1.5 px-2.5 rounded-md text-xs font-medium border transition-all text-center ${
                    selectedRole === 'Developer'
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Developer
                </button>
              </div>
            </div>
          )}

          {/* Minecraft IGN */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Account Identifier (IGN)
            </label>
            <div className="flex items-center gap-2">
              <SkinAvatar ign={ign || 'User'} size={34} />
              <input
                type="text"
                required
                value={ign}
                onChange={(e) => setIgn(e.target.value)}
                placeholder="e.g. StaffUsername"
                className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Passcode */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Security Passcode
            </label>
            <div className="relative">
              <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 placeholder-zinc-600 font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2 px-3 rounded-md font-medium text-xs bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <span>Authenticate Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Credentials Footer */}
        <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 space-y-1.5">
          <div className="flex items-center justify-between">
            <span>Pre-configured Credentials:</span>
          </div>
          <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickFill('Owner', 'Kev_Owner', 'owner123')}
              className="p-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-center"
            >
              owner123
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('Developer', 'Avery_Dev', 'dev123')}
              className="p-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-center"
            >
              dev123
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('Staff/Interviewer', 'InterviewPro', 'staff123')}
              className="p-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-center"
            >
              staff123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
