'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRole } from '@/components/RoleContext';
import { Candidate, CandidateStatus, SystemStats } from '@/lib/types';
import SkinAvatar from '@/components/SkinAvatar';
import StarRating from '@/components/StarRating';
import CandidateModal from '@/components/CandidateModal';
import WhitelistModal from '@/components/WhitelistModal';
import { 
  Users, 
  Check, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Terminal, 
  ClipboardCheck, 
  Star, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

export default function CandidateDashboard() {
  const { role, isOwnerOrDev } = useRole();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<SystemStats['candidates']>({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'rating_desc' | 'rating_asc'>('newest');

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/candidates');
      const data = await res.json();
      if (data.success && Array.isArray(data.candidates)) {
        setCandidates(data.candidates);
      }

      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats?.candidates) {
        setStats(statsData.stats.candidates);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Quick Inline Status Update
  const handleQuickStatusChange = async (id: string, newStatus: CandidateStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );

      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Refresh stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats.candidates);
      }
    } catch (err) {
      console.error('Error changing status:', err);
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

  // CSV Export handler
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
    link.setAttribute('download', `kdos_smp_candidates_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and Sort Candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        // Status filter
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;

        // Rating filter
        if (ratingFilter === '5' && c.rating !== 5) return false;
        if (ratingFilter === '4+' && c.rating < 4) return false;
        if (ratingFilter === '3+' && c.rating < 3) return false;
        if (ratingFilter === '1-2' && c.rating > 2) return false;

        // Search query
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
        // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [candidates, statusFilter, ratingFilter, searchQuery, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            SMP Application Database
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Candidate Management & Admissions
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Filter by 1–5 star ratings, inspect interview remarks, and accept verified players into the SMP.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={candidates.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setIsWhitelistModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            Whitelist Generator ({stats.accepted})
          </button>

          <Link
            href="/interview"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/60 transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            New Interview
          </Link>
        </div>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total */}
        <div className="p-4 rounded-xl bg-gray-900/70 border border-gray-800">
          <div className="text-xs font-semibold text-gray-400 uppercase">Total Interviewed</div>
          <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
        </div>

        {/* Accepted */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 shadow-sm">
          <div className="text-xs font-semibold text-emerald-400 uppercase flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Accepted SMP
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{stats.accepted}</div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40">
          <div className="text-xs font-semibold text-amber-400 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">{stats.pending}</div>
        </div>

        {/* Rejected */}
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40">
          <div className="text-xs font-semibold text-red-400 uppercase flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </div>
          <div className="text-2xl font-black text-red-300 mt-1">{stats.rejected}</div>
        </div>

        {/* Avg Star Rating */}
        <div className="p-4 rounded-xl bg-gray-900/70 border border-gray-800 col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold text-amber-400 uppercase flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" /> Avg Rating
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {stats.avgRating} <span className="text-xs font-normal text-gray-500">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by IGN, notes, or interviewer..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-600"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'pending', label: 'Pending' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'rejected', label: 'Rejected' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Star Rating Filters */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Stars' },
              { id: '5', label: '5 ★' },
              { id: '4+', label: '4+ ★' },
              { id: '3+', label: '3+ ★' },
              { id: '1-2', label: '1-2 ★' },
            ].map((rt) => (
              <button
                key={rt.id}
                type="button"
                onClick={() => setRatingFilter(rt.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  ratingFilter === rt.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>

          {/* Sort Order */}
          <div className="w-full md:w-auto">
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_desc">Highest Rated (5★ first)</option>
              <option value="rating_asc">Lowest Rated (1★ first)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate List / Table */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-gray-800/80 bg-gray-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Interviewed Candidates
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-800 text-gray-300">
              {filteredCandidates.length}
            </span>
          </div>

          <span className="text-xs text-gray-500">
            Click any candidate row to view full notes and edit details
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Loading candidate database...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-500">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-300">No candidates match your current filter.</p>
            <p className="text-xs text-gray-500">
              Try adjusting your search keywords, star rating, or conduct a new interview.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/60">
            {filteredCandidates.map((candidate) => {
              const isAccepted = candidate.status === 'accepted';
              const isPending = candidate.status === 'pending';
              const isRejected = candidate.status === 'rejected';

              return (
                <div
                  key={candidate.id}
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setIsCandidateModalOpen(true);
                  }}
                  className="px-6 py-4 hover:bg-gray-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left: Avatar & Candidate Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <SkinAvatar ign={candidate.ign} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                          {candidate.ign}
                        </span>

                        {/* Star Rating Pill */}
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-950 border border-gray-800">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-300">
                            {candidate.rating}/5
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            isAccepted
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                              : isPending
                              ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                              : 'bg-red-950 text-red-400 border-red-500/40'
                          }`}
                        >
                          {candidate.status}
                        </span>
                      </div>

                      {/* Notes Excerpt */}
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {candidate.notes || 'No notes provided during the interview.'}
                      </p>

                      {/* Tags & Interviewer Info */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-500">
                        <span>By {candidate.interviewer_ign}</span>
                        <span>•</span>
                        <span>{new Date(candidate.created_at).toLocaleDateString()}</span>
                        {candidate.tags && candidate.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-950 text-gray-400 border border-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons (Accept, Reject, Pending) */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => handleQuickStatusChange(candidate.id, 'accepted', e)}
                      title="Accept to SMP Whitelist"
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isAccepted
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-gray-950 border border-gray-800 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-950/30'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleQuickStatusChange(candidate.id, 'pending', e)}
                      title="Mark as Pending Review"
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isPending
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-950 border border-gray-800 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleQuickStatusChange(candidate.id, 'rejected', e)}
                      title="Reject Candidate"
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isRejected
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'bg-gray-950 border border-gray-800 text-gray-400 hover:border-red-500/50 hover:text-red-400 hover:bg-red-950/30'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>

                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Details & Edit Modal */}
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

      {/* Whitelist Exporter Modal */}
      <WhitelistModal
        isOpen={isWhitelistModalOpen}
        onClose={() => setIsWhitelistModalOpen(false)}
      />
    </div>
  );
}
