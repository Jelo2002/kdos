'use client';

import React, { useState, useEffect } from 'react';
import { StaffMember, StaffRole, StaffStatus } from '@/lib/types';
import SkinAvatar from './SkinAvatar';
import { X, Save, UserPlus, Shield, Trash2, Calendar, FileText } from 'lucide-react';
import { DEPARTMENTS_CONFIG } from '@/lib/db';

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
  const [loaReason, setLoaReason] = useState('');
  const [loaReturnDate, setLoaReturnDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (staffMember) {
      setIgn(staffMember.ign);
      setDiscordTag(staffMember.discord_tag || '');
      setRole(staffMember.role);
      setDepartment(staffMember.department);
      setStatus(staffMember.status);
      setLoaReason(staffMember.loa_reason || '');
      setLoaReturnDate(staffMember.loa_return_date ? staffMember.loa_return_date.substring(0, 10) : '');
    } else {
      setIgn('');
      setDiscordTag('');
      setRole('Interviewer');
      setDepartment('Recruitment & Interviews');
      setStatus('Active');
      setLoaReason('');
      setLoaReturnDate('');
    }
  }, [staffMember, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ign.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        ign: ign.trim(),
        discord_tag: discordTag.trim(),
        role,
        department,
        status,
        loa_reason: status === 'Active' ? null : loaReason,
        loa_return_date: status === 'Active' ? null : (loaReturnDate || null),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!staffMember || !onDelete) return;
    if (!confirm(`Are you sure you want to remove ${staffMember.ign} from the staff roster?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(staffMember.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center gap-3">
            <SkinAvatar ign={ign || 'Steve'} size={40} />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEditing ? `Edit Staff Member (${staffMember.ign})` : 'Add New Staff Member'}
              </h2>
              <p className="text-xs text-gray-400">
                Staff Roster & Leave of Absence (LOA) Tracker
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Minecraft IGN */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Minecraft In-Game Name (IGN) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              placeholder="e.g. BlockDoctor"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-gray-600"
            />
          </div>

          {/* Discord Tag */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Discord Handle / Tag
            </label>
            <input
              type="text"
              value={discordTag}
              onChange={(e) => setDiscordTag(e.target.value)}
              placeholder="e.g. blockdoc#0001 or @blockdoc"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-gray-600"
            />
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Staff Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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

          {/* Status (Active, LOA, Hiatus, Inactive) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Staff Availability Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'Active', label: 'Active', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
                { id: 'LOA', label: 'LOA', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
                { id: 'Hiatus', label: 'Hiatus', color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' },
                { id: 'Inactive', label: 'Inactive', color: 'text-gray-400 border-gray-700 bg-gray-900' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id as StaffStatus)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    status === s.id
                      ? `${s.color} ring-2 ring-emerald-500 shadow-md`
                      : 'border-gray-800 text-gray-500 hover:text-gray-300 bg-gray-950'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional LOA / Hiatus Details */}
          {(status === 'LOA' || status === 'Hiatus') && (
            <div className="p-3.5 rounded-xl bg-gray-950/80 border border-amber-500/30 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Calendar className="w-3.5 h-3.5" />
                {status === 'LOA' ? 'Leave of Absence Details' : 'Hiatus Details'}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  value={loaReturnDate}
                  onChange={(e) => setLoaReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                  Reason / Notes
                </label>
                <textarea
                  rows={2}
                  value={loaReason}
                  onChange={(e) => setLoaReason(e.target.value)}
                  placeholder="e.g. College midterm exams, traveling, temporary PC hardware issue..."
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-gray-600"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : isEditing ? 'Save Staff' : 'Add Staff Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
