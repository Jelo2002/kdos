'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import WhitelistModal from '@/components/WhitelistModal';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [whitelistModalOpen, setWhitelistModalOpen] = useState(false);

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
