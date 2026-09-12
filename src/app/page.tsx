'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRole } from '@/components/RoleContext';
import { Candidate, CandidateStatus, SystemStats } from '@/lib/types';
import SkinAvatar from '@/components/SkinAvatar';
import CandidateModal from '@/components/CandidateModal';
import BackupModal from '@/components/BackupModal';
import { syncLocalVaultWithRemote, getLocalVault } from '@/lib/backup';
import { 
  Users, 
  Search, 
  Download, 
  Plus, 
  Check, 
  X, 
  Clock, 
  ArrowUpDown, 
  Star,
  FileSpreadsheet,
  ChevronRight,
  Filter,
  ShieldCheck,
  Upload
} from 'lucide-react';

export default function CandidateDashboard() {
  const { role, isOwnerOrDev, staffName } = useRole();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [localVaultCount, setLocalVaultCount] = useState(0);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'rating_desc' | 'rating_asc'>('newest');

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Direct Synchronous Stats Calculation: Mathematically guaranteed to match candidate records
  const stats = useMemo(() => {
    const total = candidates.length;
    const accepted = candidates.filter((c) => c.status === 'accepted').length;
    const pending = candidates.filter((c) => c.status === 'pending').length;
    const rejected = candidates.filter((c) => c.status === 'rejected').length;
    const totalScore = candidates.reduce((sum, c) => sum + (Number(c.rating) || 0), 0);
    const avgRating = total > 0 ? Number((totalScore / total).toFixed(1)) : 0;
    return { total, accepted, pending, rejected, avgRating };
  }, [candidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/candidates');
      const data = await res.json();
      const serverList = data.success && Array.isArray(data.candidates) ? data.candidates : [];

      // Reconcile with local browser vault
      const { merged, hasNewLocalRecords } = syncLocalVaultWithRemote(serverList);
      setCandidates(merged);
      setLocalVaultCount(merged.length);

      // If local device has candidate scorecards that the server is missing, push background sync
      if (hasNewLocalRecords) {
        fetch('/api/candidates/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidates: merged }),
        }).catch((e) => console.warn('Background candidate sync failed:', e));
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      // Offline fallback: load from local vault
      const local = getLocalVault();
      if (local.length > 0) {
        setCandidates(local);
        setLocalVaultCount(local.length);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleQuickStatusChange = async (id: string, newStatus: CandidateStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );

      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');
    } catch (err) {
      console.error('Error updating status:', err);
      fetchCandidates();
    }
  };

  const handleUpdateCandidate = async (id: string, updates: Partial<Candidate>) => {
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchCandidates();
      }
    } catch (err) {
      console.error('Failed to update candidate:', err);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCandidates();
      }
    } catch (err) {
      console.error('Failed to delete candidate:', err);
    }
  };

  const handleExportCsv = () => {
    if (candidates.length === 0) return;

    const headers = ['IGN', 'Rating', 'Status', 'Interviewer', 'Notes', 'Tags', 'Date'];
    const rows = candidates.map((c) => [
      `"${c.ign}"`,
      c.rating,
      `"${c.status}"`,
      `"${c.interviewer_ign}"`,
      `"${c.notes.replace(/"/g, '""')}"`,
      `"${(c.tags || []).join(', ')}"`,
      `"${new Date(c.created_at).toISOString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kdos_candidates_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (ratingFilter === '5' && c.rating !== 5) return false;
        if (ratingFilter === '4+' && c.rating < 4) return false;
        if (ratingFilter === '3+' && c.rating < 3) return false;
        if (ratingFilter === '1-2' && c.rating > 2) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchIgn = c.ign.toLowerCase().includes(q);
          const matchNotes = c.notes?.toLowerCase().includes(q);
          const matchInterviewer = c.interviewer_ign?.toLowerCase().includes(q);
          if (!matchIgn && !matchNotes && !matchInterviewer) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortOrder === 'rating_desc') {
          return b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortOrder === 'rating_asc') {
          return a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [candidates, statusFilter, ratingFilter, searchQuery, sortOrder]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Candidate Pipeline & Admissions
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Standardized applicant evaluation records, interview scoring, and server admissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {localVaultCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vault: <strong className="text-zinc-200 font-mono">{localVaultCount}</strong></span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 transition-colors flex items-center gap-1.5"
            title="Export full JSON backup, restore candidates, or bulk-import from text"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Backup & Restore</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={candidates.length === 0}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/interview"
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scorecard</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Total Evaluated</span>
          <div className="text-xl font-semibold text-zinc-100 mt-1 font-mono">{stats.total}</div>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Admitted
          </div>
          <div className="text-xl font-semibold text-emerald-400 mt-1 font-mono">{stats.accepted}</div>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Pending
          </div>
          <div className="text-xl font-semibold text-amber-400 mt-1 font-mono">{stats.pending}</div>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            Disqualified
          </div>
          <div className="text-xl font-semibold text-zinc-400 mt-1 font-mono">{stats.rejected}</div>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Mean Score</span>
          <div className="text-xl font-semibold text-zinc-200 mt-1 font-mono">
            {stats.avgRating} <span className="text-xs font-normal text-zinc-500">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Filter and Query Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 p-2 bg-zinc-900/40 border border-zinc-800 rounded-lg text-xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates by IGN, assessment keywords, or evaluator..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800/80 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder-zinc-600"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800/80 rounded-md">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'accepted', label: 'Admitted' },
              { id: 'rejected', label: 'Disqualified' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === st.id
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800/80 rounded-md">
            {[
              { id: 'all', label: 'All' },
              { id: '5', label: '5.0' },
              { id: '4+', label: '4.0+' },
              { id: '3+', label: '3.0+' },
            ].map((rt) => (
              <button
                key={rt.id}
                type="button"
                onClick={() => setRatingFilter(rt.id)}
                className={`px-2 py-1 rounded text-xs font-medium font-mono transition-colors ${
                  ratingFilter === rt.id
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e: any) => setSortOrder(e.target.value)}
            className="px-2 py-1 rounded-md bg-zinc-950 border border-zinc-800/80 text-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating_desc">Highest Score</option>
            <option value="rating_asc">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                <th className="py-2.5 px-4">Candidate</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Assessment Log</th>
                <th className="py-2.5 px-3">Evaluator</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-4 text-right">Admissions Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Loading pipeline records...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No candidate records match your active query.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => {
                  const isAccepted = candidate.status === 'accepted';
                  const isPending = candidate.status === 'pending';
                  const isRejected = candidate.status === 'rejected';

                  return (
                    <tr
                      key={candidate.id}
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setIsCandidateModalOpen(true);
                      }}
                      className="hover:bg-zinc-900/70 transition-colors cursor-pointer group"
                    >
                      {/* Candidate Column */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <SkinAvatar ign={candidate.ign} size={28} />
                          <div>
                            <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">
                              {candidate.ign}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 font-mono font-medium">
                          <span className={candidate.rating >= 4 ? 'text-amber-300' : 'text-zinc-400'}>
                            {candidate.rating}.0
                          </span>
                          <span className="text-zinc-600 text-[10px]">★</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            isAccepted
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : isPending
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              isAccepted ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-zinc-500'
                            }`}
                          />
                          {isAccepted ? 'Admitted' : isPending ? 'Pending' : 'Disqualified'}
                        </span>
                      </td>

                      {/* Assessment Log */}
                      <td className="py-2.5 px-3 max-w-xs">
                        <p className="text-zinc-400 truncate text-[11px]">
                          {candidate.notes || '—'}
                        </p>
                      </td>

                      {/* Evaluator */}
                      <td className="py-2.5 px-3 text-zinc-400 text-[11px] font-mono">
                        {candidate.interviewer_ign}
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3 text-zinc-500 text-[11px] whitespace-nowrap">
                        {new Date(candidate.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleQuickStatusChange(candidate.id, 'accepted', e)}
                            title="Admit to SMP"
                            className={`p-1 rounded transition-colors ${
                              isAccepted
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                                : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleQuickStatusChange(candidate.id, 'pending', e)}
                            title="Mark Pending"
                            className={`p-1 rounded transition-colors ${
                              isPending
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                                : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleQuickStatusChange(candidate.id, 'rejected', e)}
                            title="Disqualify Candidate"
                            className={`p-1 rounded transition-colors ${
                              isRejected
                                ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                                : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-1" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Modal */}
      <CandidateModal
        candidate={selectedCandidate}
        isOpen={isCandidateModalOpen}
        onClose={() => {
          setIsCandidateModalOpen(false);
          setSelectedCandidate(null);
        }}
        onUpdate={handleUpdateCandidate}
        onDelete={handleDeleteCandidate}
      />

      {/* Backup, Restore & Bulk Import Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        candidates={candidates}
        onImportComplete={(imported) => {
          fetchCandidates();
        }}
        currentStaffName={staffName}
      />
    </div>
  );
}
