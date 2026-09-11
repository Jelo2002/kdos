'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/components/RoleContext';
import StarRating from '@/components/StarRating';
import SkinAvatar from '@/components/SkinAvatar';
import { 
  ClipboardCheck, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  Tag, 
  User, 
  FileText, 
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const COMMON_TAGS = [
  'Builder',
  'Redstone',
  'PvP',
  'Good Mic',
  'Active Daily',
  'Mature',
  'Chill',
  'Content Creator',
  'Casual',
  'Rule Warning',
];

export default function InterviewPage() {
  const { staffName, setStaffName, isOwnerOrDev } = useRole();

  const [ign, setIgn] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [interviewerIgn, setInterviewerIgn] = useState(staffName || 'Staff');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Good Mic']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidate, setSubmittedCandidate] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleResetForm = () => {
    setIgn('');
    setRating(5);
    setNotes('');
    setSelectedTags(['Good Mic']);
    setSubmittedCandidate(null);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ign.trim()) {
      setErrorMsg('Please enter the candidate\'s Minecraft In-Game Name (IGN).');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save current interviewer name to context
      if (interviewerIgn.trim()) {
        setStaffName(interviewerIgn.trim());
      }

      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ign: ign.trim(),
          rating,
          notes: notes.trim(),
          interviewer_ign: interviewerIgn.trim() || 'Staff',
          tags: selectedTags,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit interview evaluation');
      }

      setSubmittedCandidate(data.candidate);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting interview evaluation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Top Banner & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <ClipboardCheck className="w-4 h-4" />
            Candidate Evaluation Form
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SMP Interview Portal
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Score the applicant from 1 to 5 stars, record your interview notes, and submit for final SMP admission review.
          </p>
        </div>

        {isOwnerOrDev && (
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
          >
            Review DBMS
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Success Modal / Card after Submission */}
      {submittedCandidate ? (
        <div className="p-8 rounded-2xl bg-gray-900/90 border border-emerald-500/40 shadow-2xl text-center animate-fadeIn space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Interview Evaluation Submitted!
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              <span className="text-emerald-400 font-bold">{submittedCandidate.ign}</span> has been added to the database with a{' '}
              <span className="text-amber-400 font-bold">{submittedCandidate.rating} Star</span> rating.
            </p>
          </div>

          {/* Candidate Card Summary */}
          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800/80 max-w-sm mx-auto flex items-center gap-4 text-left">
            <SkinAvatar ign={submittedCandidate.ign} size={52} />
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-white truncate">
                {submittedCandidate.ign}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <StarRating value={submittedCandidate.rating} readOnly size="sm" showLabel={false} />
                <span className="text-xs text-amber-400 font-bold ml-1">{submittedCandidate.rating}/5</span>
              </div>
              <div className="text-xs text-gray-500 truncate mt-1">
                Status: <span className="text-amber-400 font-medium uppercase text-[10px]">Pending Review</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Interview Next Candidate
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors border border-gray-700"
            >
              Go to Candidate Review
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* The Core Interview Form */
        <form onSubmit={handleSubmit} className="bg-gray-900/70 border border-gray-800/90 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 1. Minecraft In-Game Name (IGN) with Live Skin Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Minecraft In-Game Name (IGN) <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <SkinAvatar ign={ign || 'Steve'} size={52} />
              <div className="flex-1">
                <input
                  type="text"
                  required
                  autoFocus
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  placeholder="e.g. Dream, Grian, MumboJumbo..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-gray-600 transition-all"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Live skin head updates as you type the exact player IGN.
                </span>
              </div>
            </div>
          </div>

          {/* 2. 1 to 5 Star Rating */}
          <div className="p-5 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Interview Rating (1 to 5 Stars) <span className="text-red-400">*</span>
              </label>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Selected: {rating} / 5 Stars
              </span>
            </div>
            <StarRating
              value={rating}
              onChange={setRating}
              size="lg"
              showLabel={true}
            />
          </div>

          {/* 3. Interview Notes & Observations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                Interview Notes & Observations
              </label>
              <span className="text-[11px] text-gray-500">
                What did they say during the call?
              </span>
            </div>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Very polite and mature voice. Has 5 years of survival experience. Specializes in medieval builds and automatic sorting systems. Read all rules and has zero warnings on previous servers."
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-gray-600 transition-all"
            />
          </div>

          {/* 4. Quick Vibe Tags (One-click toggles) */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              <Tag className="w-3.5 h-3.5" />
              Quick Applicant Badges
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                const isWarning = tag.includes('Warning') || tag.includes('Toxic');
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? isWarning
                          ? 'bg-red-950 text-red-300 border border-red-500/50 shadow-sm'
                          : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-sm'
                        : 'bg-gray-950/60 text-gray-400 border border-gray-800/80 hover:border-gray-700 hover:text-gray-300'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Interviewer Name (For accountability & staff metrics) */}
          <div className="pt-2 border-t border-gray-800/60">
            <div className="flex items-center gap-3">
              <div className="w-1/2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Conducted By (Interviewer IGN)
                </label>
                <input
                  type="text"
                  value={interviewerIgn}
                  onChange={(e) => setInterviewerIgn(e.target.value)}
                  placeholder="Your Staff IGN"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl font-extrabold text-base bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting Evaluation...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Interview Evaluation</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
