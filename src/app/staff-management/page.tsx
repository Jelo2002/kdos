'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StaffMember, DepartmentHealth, StaffStatus } from '@/lib/types';
import SkinAvatar from '@/components/SkinAvatar';
import DepartmentCard from '@/components/DepartmentCard';
import StaffModal from '@/components/StaffModal';
import { 
  Shield, 
  UserPlus, 
  AlertTriangle, 
  Search, 
  Calendar, 
  Clock, 
  Moon, 
  CheckCircle2, 
  Filter, 
  Edit3, 
  Users,
  ChevronRight,
  Sparkles
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
        // Update existing
        await fetch(`/api/staff/${editingStaffMember.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        // Create new
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

  // Quick Status change
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

  // Lacking departments count
  const lackingDepartments = useMemo(() => {
    return departments.filter((d) => d.is_lacking);
  }, [departments]);

  // Filtered staff list
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
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            Staff Roster & Department Supervision
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Staff Management System
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitor active staff, track Hiatus & Leave of Absence (LOA), and supervise understaffed departments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingStaffMember(null);
            setIsStaffModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Understaffed / Lacking Alert Banner */}
      {lackingDepartments.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-900/60 text-red-400 border border-red-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-200">
                Staffing Alert: {lackingDepartments.length} Department{lackingDepartments.length > 1 ? 's are' : ' is'} Lacking Active Staff!
              </h3>
              <p className="text-xs text-red-300/80 mt-0.5">
                {lackingDepartments.map((d) => `${d.name} (need +${d.deficiency_count})`).join(', ')}.
                Consider hiring or reviewing members currently on LOA/Hiatus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Department Health Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Department Health & Staffing Levels
            </h2>
            <span className="text-xs text-gray-500">
              (Click a card to filter staff roster)
            </span>
          </div>

          {selectedDepartment !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedDepartment('all')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Reset to All Departments
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
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

      {/* Staff Roster Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Staff Roster & Leave Tracking
            </h2>
            <p className="text-xs text-gray-400">
              Showing {filteredStaff.length} of {staff.length} staff members
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff IGN or Discord..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-gray-950 border border-gray-800 p-0.5 rounded-xl">
              {['all', 'Active', 'LOA', 'Hiatus'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All Status' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">
              Loading staff roster...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              No staff members found matching this filter.
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60">
              {filteredStaff.map((member) => {
                const isActive = member.status === 'Active';
                const isLoa = member.status === 'LOA';
                const isHiatus = member.status === 'Hiatus';

                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      setEditingStaffMember(member);
                      setIsStaffModalOpen(true);
                    }}
                    className="px-6 py-4 hover:bg-gray-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Left: Avatar & Identity */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <SkinAvatar ign={member.ign} size={44} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                            {member.ign}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-950 text-gray-300 border border-gray-800">
                            {member.role}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{member.discord_tag || 'No Discord'}</span>
                          <span>•</span>
                          <span className="text-emerald-400/90 font-medium">{member.department}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: LOA / Hiatus Info */}
                    <div className="sm:max-w-xs flex-1">
                      {isLoa ? (
                        <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 space-y-0.5">
                          <div className="flex items-center gap-1 font-bold">
                            <Clock className="w-3 h-3 text-amber-400" />
                            On LOA {member.loa_return_date ? `until ${new Date(member.loa_return_date).toLocaleDateString()}` : ''}
                          </div>
                          {member.loa_reason && (
                            <p className="text-[11px] text-amber-200/70 truncate">
                              &quot;{member.loa_reason}&quot;
                            </p>
                          )}
                        </div>
                      ) : isHiatus ? (
                        <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 space-y-0.5">
                          <div className="flex items-center gap-1 font-bold">
                            <Moon className="w-3 h-3 text-blue-400" />
                            On Hiatus {member.loa_return_date ? `until ${new Date(member.loa_return_date).toLocaleDateString()}` : ''}
                          </div>
                          {member.loa_reason && (
                            <p className="text-[11px] text-blue-200/70 truncate">
                              &quot;{member.loa_reason}&quot;
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-400/80 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Actively on duty
                        </span>
                      )}
                    </div>

                    {/* Right: Status Toggle & Edit Action */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => handleQuickStatus(member.id, 'Active', e)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-emerald-400'
                        }`}
                      >
                        Active
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleQuickStatus(member.id, 'LOA', e)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isLoa
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-amber-400'
                        }`}
                      >
                        LOA
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleQuickStatus(member.id, 'Hiatus', e)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isHiatus
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-blue-400'
                        }`}
                      >
                        Hiatus
                      </button>

                      <div className="p-1.5 text-gray-500 group-hover:text-emerald-400 transition-colors ml-1">
                        <Edit3 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
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
