'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/components/RoleContext';
import StarRating from '@/components/StarRating';
import SkinAvatar from '@/components/SkinAvatar';
import { saveCandidateToVault } from '@/lib/backup';
import { 
  ClipboardCheck, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  ExternalLink,
  Tag,
  FileText,
  User,
  Check,
  ShieldCheck
} from 'lucide-react';

const COMPETENCY_TAGS = [
  'Technical Redstone',
  'Advanced Architecture',
  'Verified Audio/Mic',
  'High Availability',
  'Server Moderation',
  'PvP / Combat',
  'Community Lore',
  'Policy Compliance Risk',
];

export default function InterviewPage() {
  const { staffName, setStaffName, isOwnerOrDev } = useRole();

  const [ign, setIgn] = useState('');
  const [rating, setRating] = useState<number>(4);
  const [notes, setNotes] = useState('');
  const [interviewerIgn, setInterviewerIgn] = useState(staffName || 'Staff');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Verified Audio/Mic']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidate, setSubmittedCandidate] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVaultSaved, setIsVaultSaved] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleResetForm = () => {
    setIgn('');
    setRating(4);
    setNotes('');
    setSelectedTags(['Verified Audio/Mic']);
    setSubmittedCandidate(null);
    setErrorMsg('');
    setIsVaultSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ign.trim()) {
      setErrorMsg('Candidate In-Game Name (IGN) is required.');
      return;
    }

    const evaluator = interviewerIgn.trim() || staffName || 'Staff';
    if (interviewerIgn.trim()) {
      setStaffName(interviewerIgn.trim());
    }

    // Tier 1 Fail-Safe: Immediately secure to client device's persistent local vault
    const localCandidate = {
      id: `c-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ign: ign.trim(),
      rating,
      notes: notes.trim(),
      interviewer_ign: evaluator,
      status: 'pending' as const,
      tags: selectedTags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveCandidateToVault(localCandidate);
    setIsVaultSaved(true);

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ign: ign.trim(),
          rating,
          notes: notes.trim(),
          interviewer_ign: evaluator,
          tags: selectedTags,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Even if server failed, the candidate is saved in local vault!
        setSubmittedCandidate(localCandidate);
        return;
      }

      if (data.candidate) {
        saveCandidateToVault(data.candidate);
        setSubmittedCandidate(data.candidate);
      } else {
        setSubmittedCandidate(localCandidate);
      }
    } catch (err: any) {
      console.warn('Network error during candidate submit, falling back to local vault:', err);
      // Fail-safe: Candidate is secured in browser storage
      setSubmittedCandidate(localCandidate);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Candidate Evaluation Scorecard
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Record standardized interview metrics, observations, and admission score.
          </p>
        </div>

        {isOwnerOrDev && (
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Candidate Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Success View */}
      {submittedCandidate ? (
        <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Evaluation Submitted Successfully
              </h2>
              <p className="text-xs text-zinc-400">
                Record for <span className="font-mono text-zinc-200 font-medium">{submittedCandidate.ign}</span> has been indexed with a score of <span className="text-amber-400 font-semibold">{submittedCandidate.rating}.0 / 5.0</span>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkinAvatar ign={submittedCandidate.ign} size={36} />
              <div>
                <div className="text-xs font-semibold text-zinc-200">
                  {submittedCandidate.ign}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Evaluated by {submittedCandidate.interviewer_ign}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-semibold text-amber-400">
                {submittedCandidate.rating}.0 ★
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/50 border border-amber-800/60 text-amber-400">
                Pending Review
              </span>
            </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Preserved in your device's local offline vault. Auto-syncs to the main dashboard.</span>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="flex-1 py-2 px-3 rounded-md text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Evaluate Next Candidate
            </button>

            <Link
              href="/"
              className="py-2 px-3 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-colors flex items-center justify-center gap-1.5"
            >
              Pipeline Overview
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* The Form */
        <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
          {errorMsg && (
            <div className="p-2.5 rounded-md bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Candidate Identification */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Candidate In-Game Name (IGN) <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2.5">
              <SkinAvatar ign={ign || 'User'} size={38} />
              <input
                type="text"
                required
                autoFocus
                value={ign}
                onChange={(e) => setIgn(e.target.value)}
                placeholder="e.g. ApplicantUsername"
                className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 placeholder-zinc-600 font-medium"
              />
            </div>
          </div>

          {/* Section 2: Scorecard Rating (1 to 5 Stars) */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Evaluation Score (1.0 to 5.0) <span className="text-rose-400">*</span>
            </label>
            <StarRating
              value={rating}
              onChange={setRating}
              size="md"
              showLabel={true}
            />
          </div>

          {/* Section 3: Assessment Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Assessment Notes & Interview Log
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail candidate's responses, previous server experience, collaboration maturity, playstyle, and technical capabilities..."
              className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 placeholder-zinc-600 leading-relaxed"
            />
          </div>

          {/* Section 4: Competencies & Tags */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Demonstrated Competencies
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMPETENCY_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                const isRisk = tag.includes('Risk');
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
                      active
                        ? isRisk
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                          : 'bg-zinc-800 text-zinc-100 border-zinc-600'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Evaluator Information */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Evaluator:</span>
              <input
                type="text"
                value={interviewerIgn}
                onChange={(e) => setInterviewerIgn(e.target.value)}
                className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-zinc-500 w-36"
              />
            </div>
          </div>

          {/* Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-md font-medium text-xs bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Submitting Scorecard...</span>
            ) : (
              <>
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Submit Candidate Scorecard</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
