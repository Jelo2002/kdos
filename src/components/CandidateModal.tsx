'use client';

import React, { useState } from 'react';
import { Candidate, CandidateStatus } from '@/lib/types';
import SkinAvatar from './SkinAvatar';
import StarRating from './StarRating';
import { X, Check, XCircle, Clock, Trash2, Copy, CheckCheck, Save, ExternalLink } from 'lucide-react';

interface CandidateModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Candidate>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CandidateModal({
  candidate,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: CandidateModalProps) {
  if (!isOpen || !candidate) return null;

  const [rating, setRating] = useState<number>(candidate.rating);
  const [notes, setNotes] = useState<string>(candidate.notes);
  const [status, setStatus] = useState<CandidateStatus>(candidate.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(candidate.id, {
        rating,
        notes,
        status,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${candidate.ign}'s interview record?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(candidate.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const copyWhitelistCmd = () => {
    navigator.clipboard.writeText(`/whitelist add ${candidate.ign}`);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center gap-3">
            <SkinAvatar ign={candidate.ign} size={48} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {candidate.ign}
                </h2>
                <button
                  type="button"
                  onClick={copyWhitelistCmd}
                  className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center gap-1 border border-gray-700"
                  title="Copy /whitelist add command"
                >
                  {copiedCmd ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  /whitelist add
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Interviewed by <span className="text-emerald-400 font-medium">{candidate.interviewer_ign}</span> •{' '}
                {new Date(candidate.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Decision Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('accepted')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                  status === 'accepted'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : 'bg-gray-950 border border-gray-800 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400'
                }`}
              >
                <Check className="w-4 h-4" />
                ACCEPT TO SMP
              </button>

              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                  status === 'pending'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-400'
                    : 'bg-gray-950 border border-gray-800 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'
                }`}
              >
                <Clock className="w-4 h-4" />
                PENDING REVIEW
              </button>

              <button
                type="button"
                onClick={() => setStatus('rejected')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                  status === 'rejected'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                    : 'bg-gray-950 border border-gray-800 text-gray-400 hover:border-red-500/50 hover:text-red-400'
                }`}
              >
                <XCircle className="w-4 h-4" />
                REJECT
              </button>
            </div>
          </div>

          {/* Star Rating Adjuster */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Interview Evaluation Rating (1 to 5 Stars)
            </label>
            <div className="p-3.5 rounded-xl bg-gray-950/70 border border-gray-800/80">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Interview Notes & Observations
            </label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes taken during the interview..."
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-gray-600"
            />
          </div>

          {/* Tags */}
          {candidate.tags && candidate.tags.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Candidate Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {candidate.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-950/80">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/50 transition-colors border border-transparent hover:border-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
            Delete Candidate
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
