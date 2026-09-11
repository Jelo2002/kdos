'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from './RoleContext';
import { 
  Shield, 
  Users, 
  ClipboardCheck, 
  UserCheck, 
  ChevronDown, 
  Menu, 
  X, 
  Terminal, 
  Crown, 
  Code2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { ActiveRole } from '@/lib/types';

interface NavbarProps {
  onOpenWhitelist?: () => void;
}

export default function Navbar({ onOpenWhitelist }: NavbarProps) {
  const pathname = usePathname();
  const { role, setRole, isOwnerOrDev } = useRole();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rolesList: { role: ActiveRole; label: string; icon: any; color: string }[] = [
    { role: 'Owner', label: 'Owner (Full Access)', icon: Crown, color: 'text-amber-400' },
    { role: 'Developer', label: 'Developer (Full Access)', icon: Code2, color: 'text-blue-400' },
    { role: 'Staff/Interviewer', label: 'Staff / Interviewer', icon: ClipboardCheck, color: 'text-emerald-400' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-gray-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  KDOS <span className="text-emerald-400">SMP</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  DBMS & Staff
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isOwnerOrDev ? (
              <>
                <Link
                  href="/"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/'
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Candidate DBMS
                </Link>

                <Link
                  href="/staff-management"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/staff-management'
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Staff Supervision
                </Link>

                <Link
                  href="/interview"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/interview'
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Interview Portal
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/interview"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/interview'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 hover:bg-emerald-900/60'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Conduct Interview
                </Link>

                <Link
                  href="/staff"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/staff'
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Staff Portal
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Area & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Whitelist quick button for Owners/Devs */}
            {isOwnerOrDev && onOpenWhitelist && (
              <button
                type="button"
                onClick={onOpenWhitelist}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-gray-800 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition-colors shadow-sm"
              >
                <Terminal className="w-3.5 h-3.5" />
                Whitelist Tool
              </button>
            )}

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900/90 border border-gray-800 hover:border-gray-700 text-gray-200 transition-all focus:outline-none"
              >
                <span className="text-gray-400 font-normal">Role:</span>
                <span className="flex items-center gap-1.5 font-bold text-white">
                  {role === 'Owner' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                  {role === 'Developer' && <Code2 className="w-3.5 h-3.5 text-blue-400" />}
                  {role === 'Staff/Interviewer' && <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  {role}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl py-2 z-50 animate-fadeIn"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    Switch Perspective
                  </div>
                  {rolesList.map((item) => {
                    const Icon = item.icon;
                    const isActive = role === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => {
                          setRole(item.role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                          isActive
                            ? 'bg-emerald-950/60 text-emerald-400 font-semibold'
                            : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                  <div className="mt-1 pt-1.5 border-t border-gray-800 px-3 text-[10px] text-gray-500">
                    Role determines visible dashboard tabs and administrative controls.
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-800 bg-gray-950 px-4 pt-2 pb-4 space-y-1">
          {isOwnerOrDev ? (
            <>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/' ? 'bg-emerald-950 text-emerald-400' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                Candidate DBMS
              </Link>
              <Link
                href="/staff-management"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/staff-management' ? 'bg-emerald-950 text-emerald-400' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                Staff Supervision
              </Link>
              <Link
                href="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/interview' ? 'bg-emerald-950 text-emerald-400' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                Interview Evaluation
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-semibold bg-emerald-600 text-white"
              >
                Conduct Interview
              </Link>
              <Link
                href="/staff"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/staff' ? 'bg-emerald-950 text-emerald-400' : 'text-gray-300 hover:bg-gray-900'
                }`}
              >
                Staff Portal
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
