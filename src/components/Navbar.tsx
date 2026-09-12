'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from './RoleContext';
import SkinAvatar from './SkinAvatar';
import { 
  Users, 
  ClipboardCheck, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { ActiveRole } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const { role, setRole, isOwnerOrDev, user, staffName, logout } = useRole();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user?.ign || staffName || 'StaffMember';

  const rolesList: { role: ActiveRole; label: string }[] = [
    { role: 'Owner', label: 'Owner View' },
    { role: 'Developer', label: 'Developer View' },
    { role: 'Admin', label: 'Admin View' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand & Workspace */}
          <div className="flex items-center gap-6">
            <Link href={isOwnerOrDev ? "/" : "/interview"} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-zinc-100 text-zinc-950 flex items-center justify-center font-black text-xs tracking-tighter">
                KD
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100 tracking-tight">
                  KDOS <span className="text-zinc-400 font-normal">Ops</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {role}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-xs">
              {isOwnerOrDev ? (
                <>
                  <Link
                    href="/"
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      pathname === '/'
                        ? 'text-zinc-100 bg-zinc-900 border border-zinc-800'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Candidate Pipeline
                  </Link>

                  <Link
                    href="/staff-management"
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      pathname === '/staff-management'
                        ? 'text-zinc-100 bg-zinc-900 border border-zinc-800'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Workforce & Capacity
                  </Link>

                  <Link
                    href="/interview"
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      pathname === '/interview'
                        ? 'text-zinc-100 bg-zinc-900 border border-zinc-800'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Interview Scorecard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/interview"
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      pathname === '/interview'
                        ? 'text-zinc-100 bg-zinc-900 border border-zinc-800'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Conduct Interview
                  </Link>

                  <Link
                    href="/staff"
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      pathname === '/staff'
                        ? 'text-zinc-100 bg-zinc-900 border border-zinc-800'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Evaluator Workspace
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Area */}
          <div className="flex items-center gap-2.5">

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs">
              <SkinAvatar ign={displayName} size={26} />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-zinc-200 leading-none">
                  {displayName}
                </div>
              </div>

              {/* Owner/Dev switch */}
              {isOwnerOrDev && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
                    title="Switch role view"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {roleDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-40 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl py-1 z-50 text-xs"
                      onMouseLeave={() => setRoleDropdownOpen(false)}
                    >
                      {rolesList.map((item) => (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => {
                            setRole(item.role);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 transition-colors ${
                            role === item.role
                              ? 'bg-zinc-800 text-zinc-100 font-medium'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded transition-colors ml-1"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded text-zinc-400 hover:text-zinc-100"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-2 space-y-1 text-xs">
          {isOwnerOrDev ? (
            <>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md ${
                  pathname === '/' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400'
                }`}
              >
                Candidate Pipeline
              </Link>
              <Link
                href="/staff-management"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md ${
                  pathname === '/staff-management' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400'
                }`}
              >
                Workforce & Capacity
              </Link>
              <Link
                href="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md ${
                  pathname === '/interview' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400'
                }`}
              >
                Interview Scorecard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md bg-zinc-900 text-zinc-100 font-medium"
              >
                Conduct Interview
              </Link>
              <Link
                href="/staff"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md ${
                  pathname === '/staff' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400'
                }`}
              >
                Evaluator Workspace
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={logout}
              className="w-full py-1.5 text-xs text-rose-400 hover:bg-zinc-900 rounded"
            >
              Sign out ({displayName})
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
