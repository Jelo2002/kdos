'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCheck, Download, Terminal, FileCode2 } from 'lucide-react';
import SkinAvatar from './SkinAvatar';

interface WhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhitelistModal({ isOpen, onClose }: WhitelistModalProps) {
  const [ignList, setIgnList] = useState<string[]>([]);
  const [commands, setCommands] = useState<string[]>([]);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'commands' | 'json'>('commands');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/whitelist')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIgnList(data.ignList || []);
            setCommands(data.commands || []);
            setJsonData(data.json || []);
          }
        })
        .catch((err) => console.error('Failed to load whitelist:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy =
      activeTab === 'commands'
        ? commands.join('\n')
        : JSON.stringify(jsonData, null, 2);

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whitelist.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                SMP Whitelist Exporter
              </h2>
              <p className="text-xs text-gray-400">
                Direct export for all {ignList.length} accepted SMP candidates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-800 bg-gray-950/40 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('commands')}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'commands'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Console Commands (/whitelist add)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'json'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            whitelist.json Format
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Generating whitelist from database...
            </div>
          ) : ignList.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No candidates have been marked as <span className="text-emerald-400 font-bold">Accepted</span> yet.
              <p className="text-xs text-gray-500 mt-1">
                Go to the Candidate DBMS and accept applicants to include them on the whitelist.
              </p>
            </div>
          ) : (
            <>
              {/* Heads Preview Row */}
              <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800/80">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Accepted Players ({ignList.length})
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {ignList.map((ign) => (
                    <div
                      key={ign}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-200 font-mono"
                    >
                      <SkinAvatar ign={ign} size={20} />
                      <span>{ign}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Box */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/80 border-b border-gray-800 text-[11px] text-gray-400 font-mono">
                  <span>{activeTab === 'commands' ? 'server_commands.txt' : 'whitelist.json'}</span>
                  <span>{commands.length} entries</span>
                </div>
                <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-60">
                  {activeTab === 'commands'
                    ? commands.join('\n')
                    : JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'json' && ignList.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download whitelist.json
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              disabled={ignList.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/30 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 text-white" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy {activeTab === 'commands' ? 'Commands' : 'JSON'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
