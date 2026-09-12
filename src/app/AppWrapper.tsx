'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import LoginScreen from '@/components/LoginScreen';
import { useRole } from '@/components/RoleContext';
import { Shield } from 'lucide-react';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingAuth } = useRole();

  // Loading state while checking localStorage session
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 space-y-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 animate-pulse">
          <Shield className="w-4 h-4" />
        </div>
        <p className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
          Initializing Session...
        </p>
      </div>
    );
  }

  // Not authenticated: Render Corporate SSO Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-zinc-950 text-zinc-100">
        <header className="py-3 border-b border-zinc-900 text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            KDOS Operations • Enterprise Authentication
          </span>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <LoginScreen />
        </main>

        <footer className="py-3 border-t border-zinc-900 text-center text-[11px] text-zinc-600">
          KDOS Operations System • Production SMP
        </footer>
      </div>
    );
  }

  // Authenticated: Render full application with Navbar and tools
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <footer className="border-t border-zinc-900 py-3.5 text-center text-xs text-zinc-500">
        KDOS Operations System • Candidate Management & Workforce Capacity
      </footer>
    </div>
  );
}
