'use client';

import React, { useState, useEffect } from 'react';
import { StaffMember, StaffRole, StaffStatus } from '@/lib/types';
import SkinAvatar from './SkinAvatar';
import { X, Trash2, KeyRound, RotateCcw, Check } from 'lucide-react';

interface StaffModalProps {
  staffMember: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<StaffMember>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function StaffModal({
  staffMember,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: StaffModalProps) {
  if (!isOpen) return null;

  const isEditing = !!staffMember;

  const [ign, setIgn] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [role, setRole] = useState<StaffRole>('Interviewer');
  const [department, setDepartment] = useState('Recruitment & Interviews');
  const [status, setStatus] = useState<StaffStatus>('Active');
  const [pinOverride, setPinOverride] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [loaReason, setLoaReason] = useState('');
  const [loaReturnDate, setLoaReturnDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [pinStatusMsg, setPinStatusMsg] = useState('');

  useEffect(() => {
    if (staffMember) {
      setIgn(staffMember.ign);
      setDiscordTag(staffMember.discord_tag || '');
      setRole(staffMember.role);
      setDepartment(staffMember.department);
      setStatus(staffMember.status);
      setHasPin(!!staffMember.pin);
      setPinOverride('');
      setPinStatusMsg('');
      setLoaReason(staffMember.loa_reason || '');
      setLoaReturnDate(staffMember.loa_return_date ? staffMember.loa_return_date.substring(0, 10) : '');
    } else {
      setIgn('');
      setDiscordTag('');
      setRole('Interviewer');
      setDepartment('Recruitment & Interviews');
      setStatus('Active');
      setHasPin(false);
      setPinOverride('');
      setPinStatusMsg('');
      setLoaReason('');
      setLoaReturnDate('');
    }
  }, [staffMember, isOpen]);

  const handleResetPin = async () => {
    if (!staffMember) return;
    setIsResettingPin(true);
    setPinStatusMsg('');
    try {
      const res = await fetch('/api/auth/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: staffMember.id }),
      });
      const data = await res.json();
      if (data.success) {
        setHasPin(false);
        setPinStatusMsg('PIN successfully reset. User will assign a new PIN on next login.');
      } else {
        setPinStatusMsg('Failed to reset PIN.');
      }
    } catch (e) {
      setPinStatusMsg('Error resetting PIN.');
    } finally {
      setIsResettingPin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ign.trim()) return;

    setIsSaving(true);
    try {
      const updates: Partial<StaffMember> = {
        ign: ign.trim(),
        discord_tag: discordTag.trim(),
        role,
        department,
        status,
        loa_reason: status === 'Active' ? null : loaReason,
        loa_return_date: status === 'Active' ? null : (loaReturnDate || null),
      };

      if (pinOverride.trim()) {
        updates.pin = pinOverride.trim();
      }

      await onSave(updates);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!staffMember || !onDelete) return;
    if (!confirm(`Remove ${staffMember.ign} from the active staff roster?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(staffMember.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <SkinAvatar ign={ign || 'User'} size={32} />
            <div>
              <h2 className="font-semibold text-sm text-zinc-100">
                {isEditing ? `Edit Team Member (${staffMember.ign})` : 'New Staff Member'}
              </h2>
              <p className="text-[11px] text-zinc-500">
                Workforce profile, PIN security & availability
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto max-h-[75vh]">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Account Identifier (IGN) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              placeholder="Minecraft username"
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Discord Handle <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={discordTag}
              onChange={(e) => setDiscordTag(e.target.value)}
              placeholder="e.g. username#0000 or username"
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                Role Title
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="Interviewer">Interviewer</option>
                <option value="Moderator">Moderator</option>
                <option value="Builder">Builder</option>
                <option value="Developer">Developer</option>
                <option value="Admin">Admin</option>
                <option value="Owner">Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="Recruitment & Interviews">Recruitment & Interviews</option>
                <option value="Server Moderation">Server Moderation</option>
                <option value="Development & Tech">Development & Tech</option>
                <option value="Building & World Design">Building & World Design</option>
                <option value="Community & Events">Community & Events</option>
                <option value="Management & Leadership">Management & Leadership</option>
              </select>
            </div>
          </div>

          {/* Security PIN Administration */}
          <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[11px] uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-zinc-400" />
                Security PIN Management
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {hasPin ? 'PIN Active' : 'No PIN Assigned'}
              </span>
            </div>

            {pinStatusMsg && (
              <p className="text-[10px] text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-800/40">
                {pinStatusMsg}
              </p>
            )}

            {isEditing && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-zinc-500">
                  Resetting requires the staff member to assign a new PIN.
                </p>
                <button
                  type="button"
                  onClick={handleResetPin}
                  disabled={isResettingPin}
                  className="px-2 py-1 rounded text-[10px] font-medium bg-zinc-850 hover:bg-zinc-800 text-amber-300 border border-zinc-750 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  {isResettingPin ? 'Resetting...' : 'Reset PIN'}
                </button>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-zinc-500 mb-0.5">
                {isEditing ? 'Directly Override PIN (Optional)' : 'Assign Initial PIN (Optional)'}
              </label>
              <input
                type="password"
                value={pinOverride}
                onChange={(e) => setPinOverride(e.target.value)}
                placeholder="Leave blank to let user assign their own PIN"
                className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Availability Status
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(['Active', 'LOA', 'Hiatus', 'Inactive'] as StaffStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    status === s
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {(status === 'LOA' || status === 'Hiatus') && (
            <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800 space-y-2 animate-fade-in">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-0.5">Return Date</label>
                <input
                  type="date"
                  value={loaReturnDate}
                  onChange={(e) => setLoaReturnDate(e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 mb-0.5">Absence Documentation</label>
                <textarea
                  rows={2}
                  value={loaReason}
                  onChange={(e) => setLoaReason(e.target.value)}
                  placeholder="Reason for leave of absence..."
                  className="w-full px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-600"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-sm"
              >
                {isSaving ? 'Saving...' : isEditing ? 'Save Member' : 'Add Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
