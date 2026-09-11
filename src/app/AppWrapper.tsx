'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import WhitelistModal from '@/components/WhitelistModal';
import LoginScreen from '@/components/LoginScreen';
import { useRole } from '@/components/RoleContext';
import { Shield } from 'lucide-react';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingAuth } = useRole();
  const [whitelistModalOpen, setWhitelistModalOpen] = useState(false);

  // Loading state while checking localStorage session
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-gray-400 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse shadow-lg shadow-emerald-600/20">
          <Shield className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">
          Authenticating KDOS SMP Session...
        </p>
      </div>
    );
  }

  // Not authenticated: Render Login Gatekeeper
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#090d16]">
        <header className="py-4 border-b border-gray-900 bg-gray-950/60 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            KDOS SMP • Security Gateway
          </span>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <LoginScreen />
        </main>

        <footer className="py-4 border-t border-gray-900 bg-gray-950/60 text-center text-xs text-gray-500">
          KDOS SMP Management System • Next.js & Vercel
        </footer>
      </div>
    );
  }

  // Authenticated: Render full application with Navbar and tools
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenWhitelist={() => setWhitelistModalOpen(true)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="border-t border-gray-900 bg-gray-950/60 py-4 text-center text-xs text-gray-500">
        KDOS SMP Management System • Next.js & Vercel • Staff & Candidate Database
      </footer>

      {/* Global Whitelist Modal */}
      <WhitelistModal
        isOpen={whitelistModalOpen}
        onClose={() => setWhitelistModalOpen(false)}
      />
    </div>
  );
}
