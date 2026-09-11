'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StaffMember, DepartmentHealth, StaffStatus } from '@/lib/types';
import SkinAvatar from '@/components/SkinAvatar';
import DepartmentCard from '@/components/DepartmentCard';
import StaffModal from '@/components/StaffModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Calendar, 
  Clock, 
  AlertCircle,
  Edit2,
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<DepartmentHealth[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const [staffRes, deptRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/staff/departments'),
      ]);

      const staffData = await staffRes.json();
      const deptData = await deptRes.json();

      if (staffData.success && Array.isArray(staffData.staff)) {
        setStaff(staffData.staff);
      }
      if (deptData.success && Array.isArray(deptData.departments)) {
        setDepartments(deptData.departments);
      }
    } catch (err) {
      console.error('Failed to load staff management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleSaveStaff = async (data: Partial<StaffMember>) => {
    try {
      if (editingStaffMember) {
        await fetch(`/api/staff/${editingStaffMember.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      fetchStaffData();
    } catch (err) {
      console.error('Failed to save staff:', err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      fetchStaffData();
    } catch (err) {
      console.error('Failed to delete staff:', err);
    }
  };

  const handleQuickStatus = async (id: string, newStatus: StaffStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );

      await fetch(`/api/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      fetchStaffData();
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchStaffData();
    }
  };

  const lackingDepartments = useMemo(() => {
    return departments.filter((d) => d.is_lacking);
  }, [departments]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      if (selectedDepartment !== 'all') {
        const matchesDept =
          s.department.toLowerCase() === selectedDepartment.toLowerCase() ||
          s.department.toLowerCase().includes(selectedDepartment.toLowerCase());
        if (!matchesDept) return false;
      }

      if (statusFilter !== 'all' && s.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchIgn = s.ign.toLowerCase().includes(q);
        const matchDiscord = s.discord_tag?.toLowerCase().includes(q);
        const matchRole = s.role.toLowerCase().includes(q);
        if (!matchIgn && !matchDiscord && !matchRole) return false;
      }

      return true;
    });
  }, [staff, selectedDepartment, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Workforce Capacity & Staff Roster
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor department staffing quotas, track Leaves of Absence (LOA), and maintain coverage.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingStaffMember(null);
            setIsStaffModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Capacity Deficit Warning Callout */}
      {lackingDepartments.length > 0 && (
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <div>
              <span className="font-semibold text-zinc-200">
                Staffing Deficit Detected ({lackingDepartments.length} Department{lackingDepartments.length > 1 ? 's' : ''}):
              </span>{' '}
              <span className="text-zinc-400">
                {lackingDepartments.map((d) => `${d.name} (-${d.deficiency_count})`).join(', ')}.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            Action Recommended
          </span>
        </div>
      )}

      {/* Department Capacity Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-wider text-zinc-400 text-[11px]">
            Department Headcount Capacity
          </span>
          {selectedDepartment !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedDepartment('all')}
              className="text-zinc-400 hover:text-zinc-200 text-xs"
            >
              Clear Department Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              isSelected={selectedDepartment.toLowerCase() === dept.name.toLowerCase()}
              onSelect={() => {
                if (selectedDepartment.toLowerCase() === dept.name.toLowerCase()) {
                  setSelectedDepartment('all');
                } else {
                  setSelectedDepartment(dept.name);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Roster Controls */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 p-2 bg-zinc-900/40 border border-zinc-800 rounded-lg text-xs">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by IGN, Discord, or role..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800/80 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder-zinc-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800/80 rounded-md">
              {['all', 'Active', 'LOA', 'Hiatus'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {st === 'all' ? 'All Statuses' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                  <th className="py-2.5 px-4">Member</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Availability Status</th>
                  <th className="py-2.5 px-3">Leave Schedule / Reason</th>
                  <th className="py-2.5 px-4 text-right">Duty Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      Loading workforce roster...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      No staff members match the active filters.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => {
                    const isActive = member.status === 'Active';
                    const isLoa = member.status === 'LOA';
                    const isHiatus = member.status === 'Hiatus';

                    return (
                      <tr
                        key={member.id}
                        onClick={() => {
                          setEditingStaffMember(member);
                          setIsStaffModalOpen(true);
                        }}
                        className="hover:bg-zinc-900/70 transition-colors cursor-pointer group"
                      >
                        {/* Member */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <SkinAvatar ign={member.ign} size={28} />
                            <div>
                              <div className="font-semibold text-zinc-200 group-hover:text-white">
                                {member.ign}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">
                                {member.discord_tag || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Title */}
                        <td className="py-2.5 px-3 text-zinc-300">
                          {member.role}
                        </td>

                        {/* Department */}
                        <td className="py-2.5 px-3 text-zinc-400">
                          {member.department}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              isActive
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                                : isLoa
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${
                                isActive ? 'bg-emerald-400' : isLoa ? 'bg-amber-400' : 'bg-zinc-400'
                              }`}
                            />
                            {member.status}
                          </span>
                        </td>

                        {/* Leave Schedule / Reason */}
                        <td className="py-2.5 px-3 max-w-xs text-zinc-400 text-[11px]">
                          {isLoa || isHiatus ? (
                            <div>
                              <span className="text-zinc-300 font-mono">
                                {member.loa_return_date ? `Until ${new Date(member.loa_return_date).toLocaleDateString()}` : 'Indefinite'}
                              </span>
                              {member.loa_reason && (
                                <p className="text-zinc-500 truncate text-[10px]">
                                  {member.loa_reason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleQuickStatus(member.id, 'Active', e)}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                isActive
                                  ? 'bg-zinc-800 text-zinc-200'
                                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                              }`}
                            >
                              Active
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleQuickStatus(member.id, 'LOA', e)}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                isLoa
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'text-zinc-500 hover:text-amber-300 hover:bg-zinc-800'
                              }`}
                            >
                              LOA
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleQuickStatus(member.id, 'Hiatus', e)}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                isHiatus
                                  ? 'bg-zinc-800 text-zinc-200'
                                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                              }`}
                            >
                              Hiatus
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingStaffMember(member);
                                setIsStaffModalOpen(true);
                              }}
                              className="p-1 text-zinc-500 hover:text-zinc-200 ml-1"
                              title="Edit team member"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
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
      </div>

      {/* Staff Modal */}
      <StaffModal
        staffMember={editingStaffMember}
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaffMember(null);
        }}
        onSave={handleSaveStaff}
        onDelete={handleDeleteStaff}
      />
    </div>
  );
}
