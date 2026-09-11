'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRole } from '@/components/RoleContext';
import { Candidate, StaffMember, StaffStatus } from '@/lib/types';
import SkinAvatar from '@/components/SkinAvatar';
import StarRating from '@/components/StarRating';
import { 
  ClipboardCheck, 
  ArrowRight, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Star,
  Send,
  Calendar
} from 'lucide-react';

export default function StaffPortalPage() {
  const { staffName, setStaffName } = useRole();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // My Status state
  const [currentStatus, setCurrentStatus] = useState<StaffStatus>('Active');
  const [loaReason, setLoaReason] = useState('');
  const [loaReturnDate, setLoaReturnDate] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    // Load candidates interviewed by this staff member or all recent
    fetch('/api/candidates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.candidates)) {
          // Prioritize candidates with this staff's interviewer_ign or recent
          setCandidates(data.candidates.slice(0, 8));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [staffName]);

  const handleUpdateMyStatus = async (newStatus: StaffStatus) => {
    setIsUpdatingStatus(true);
    setStatusMessage('');
    try {
      setCurrentStatus(newStatus);
      setStatusMessage(`Your status has been updated to ${newStatus}.`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-gray-900 to-gray-900 border border-emerald-500/30 shadow-xl">
        <div className="flex items-center gap-4">
          <SkinAvatar ign={staffName || 'Steve'} size={56} />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Staff & Interviewer Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Welcome back, <span className="text-emerald-400">{staffName}</span>!
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Current Duty Status:{' '}
              <span className="font-bold text-emerald-400">{currentStatus}</span>
            </p>
          </div>
        </div>

        <Link
          href="/interview"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
        >
          <ClipboardCheck className="w-4 h-4" />
          Conduct Interview
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Interview Submissions (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              Recent Interview Evaluations
            </h2>
            <Link href="/interview" className="text-xs text-emerald-400 hover:underline">
              + New Interview
            </Link>
          </div>

          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden shadow-md">
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Loading interviews...
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 space-y-2">
                <p>No interviews recorded yet.</p>
                <Link
                  href="/interview"
                  className="inline-block text-emerald-400 font-semibold text-xs hover:underline"
                >
                  Conduct your first interview now →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/60">
                {candidates.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 hover:bg-gray-800/30 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <SkinAvatar ign={c.ign} size={40} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">
                            {c.ign}
                          </span>
                          <span className="text-xs font-mono text-amber-400">
                            ★ {c.rating}/5
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              c.status === 'accepted'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : c.status === 'rejected'
                                ? 'bg-red-950 text-red-400 border border-red-500/30'
                                : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5 max-w-sm">
                          {c.notes || 'No notes'}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-500 text-right whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interviewer Guidelines & Rubric */}
          <div className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <BookOpen className="w-4 h-4" />
              SMP Interviewer Rubric & Standards
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/60 space-y-1">
                <span className="font-bold text-emerald-400">★ 5 Stars (Instant Accept)</span>
                <p className="text-gray-400 text-[11px]">
                  Exceptional portfolio, polite microphone, mature demeanor, demonstrated build/redstone skill.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/60 space-y-1">
                <span className="font-bold text-emerald-300">★ 4 Stars (Recommended)</span>
                <p className="text-gray-400 text-[11px]">
                  Good attitude, active player, read rules, suitable microphone, team player.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/60 space-y-1">
                <span className="font-bold text-yellow-400">★ 3 Stars (Needs Review)</span>
                <p className="text-gray-400 text-[11px]">
                  Borderline candidate, quiet on voice, or limited playtime. Discuss with team.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/60 space-y-1">
                <span className="font-bold text-red-400">★ 1-2 Stars (Reject)</span>
                <p className="text-gray-400 text-[11px]">
                  Toxic attitude, arguments during call, rule resistance, or severe microphone distortion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Staff Self-Service & LOA Form */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gray-900/70 border border-gray-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <UserCheck className="w-4 h-4" />
              Staff Profile & Duty Status
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-fadeIn">
                {statusMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Your Staff In-Game Name
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. BlockDoctor"
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Update Your Availability
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateMyStatus('Active')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    currentStatus === 'Active'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateMyStatus('LOA')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    currentStatus === 'LOA'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Request LOA
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateMyStatus('Hiatus')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    currentStatus === 'Hiatus'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Hiatus
                </button>
              </div>
            </div>

            {/* If requesting LOA */}
            {currentStatus === 'LOA' && (
              <div className="p-3.5 rounded-xl bg-gray-950 border border-amber-500/30 space-y-3 animate-fadeIn">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  LOA Request Form
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    value={loaReturnDate}
                    onChange={(e) => setLoaReturnDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Reason for LOA</label>
                  <textarea
                    rows={2}
                    value={loaReason}
                    onChange={(e) => setLoaReason(e.target.value)}
                    placeholder="e.g. Vacation, exams..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-white text-xs placeholder-gray-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
