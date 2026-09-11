'use client';

import React from 'react';
import { DepartmentHealth } from '@/lib/types';
import { Users, AlertTriangle, CheckCircle2, Clock, Moon } from 'lucide-react';

interface DepartmentCardProps {
  department: DepartmentHealth;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function DepartmentCard({
  department,
  isSelected = false,
  onSelect,
}: DepartmentCardProps) {
  const { name, min_required_staff, total_staff, active_staff, loa_staff, hiatus_staff, is_lacking, deficiency_count } = department;

  const percentActive = Math.min(100, Math.round((active_staff / Math.max(1, min_required_staff)) * 100));

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden ${
        isSelected
          ? 'bg-gray-900/95 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
          : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900'
      }`}
    >
      {/* Top Bar with Lacking Badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <h3 className="font-bold text-sm text-white tracking-tight line-clamp-1">
          {name}
        </h3>

        {is_lacking ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/90 text-red-400 border border-red-500/40 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            LACKING ({deficiency_count})
          </span>
        ) : active_staff === min_required_staff ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-500/30">
            ADEQUATE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            OPTIMAL
          </span>
        )}
      </div>

      {/* Staff Counts Breakdown */}
      <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/60 text-center">
        <div>
          <div className="text-[10px] font-medium text-gray-400 uppercase flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Active
          </div>
          <div className={`text-base font-extrabold mt-0.5 ${is_lacking ? 'text-red-400' : 'text-emerald-400'}`}>
            {active_staff} <span className="text-xs font-normal text-gray-500">/ {min_required_staff}</span>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-medium text-gray-400 uppercase flex items-center justify-center gap-1">
            <Clock className="w-2.5 h-2.5 text-amber-400" />
            LOA
          </div>
          <div className="text-base font-bold text-amber-300 mt-0.5">
            {loa_staff}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-medium text-gray-400 uppercase flex items-center justify-center gap-1">
            <Moon className="w-2.5 h-2.5 text-blue-400" />
            Hiatus
          </div>
          <div className="text-base font-bold text-blue-300 mt-0.5">
            {hiatus_staff}
          </div>
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-gray-400">
          <span>Active Staffing</span>
          <span className="font-semibold text-gray-300">{percentActive}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              is_lacking ? 'bg-red-500' : active_staff === min_required_staff ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentActive}%` }}
          />
        </div>
      </div>

      {is_lacking && (
        <p className="mt-2 text-[11px] text-red-400/90 font-medium">
          Requires at least {deficiency_count} more active staff member{deficiency_count > 1 ? 's' : ''} to meet requirement.
        </p>
      )}
    </div>
  );
}
