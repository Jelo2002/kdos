'use client';

import React from 'react';
import { DepartmentHealth } from '@/lib/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

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
      className={`p-3.5 rounded-lg border transition-all cursor-pointer text-left ${
        isSelected
          ? 'bg-zinc-900 border-zinc-500 shadow-sm'
          : 'bg-zinc-900/40 border-zinc-800/90 hover:bg-zinc-900/80 hover:border-zinc-700'
      }`}
    >
      {/* Title & Status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-xs text-zinc-100 line-clamp-1">
          {name}
        </h3>

        {is_lacking ? (
          <span className="text-[10px] font-medium font-mono px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-400">
            Deficit: -{deficiency_count}
          </span>
        ) : (
          <span className="text-[10px] font-medium font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
            Adequate
          </span>
        )}
      </div>

      {/* Headcount metrics */}
      <div className="flex items-baseline justify-between my-2">
        <div className="text-lg font-semibold font-mono text-zinc-100">
          {active_staff}{' '}
          <span className="text-xs font-normal text-zinc-500">/ {min_required_staff} FTE</span>
        </div>
        <div className="text-[11px] font-mono text-zinc-400">
          {percentActive}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden mb-2.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            is_lacking ? 'bg-rose-500' : percentActive === 100 ? 'bg-zinc-400' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentActive}%` }}
        />
      </div>

      {/* Breakdown footer */}
      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800/60">
        <span>Active: <strong className="text-zinc-300 font-mono">{active_staff}</strong></span>
        <span>LOA: <strong className="text-amber-400 font-mono">{loa_staff}</strong></span>
        <span>Hiatus: <strong className="text-zinc-400 font-mono">{hiatus_staff}</strong></span>
      </div>
    </div>
  );
}
