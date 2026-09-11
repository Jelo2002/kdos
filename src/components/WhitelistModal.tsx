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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-zinc-400" />
            <div>
              <h2 className="font-semibold text-sm text-zinc-100">
                Server Whitelist Synchronization
              </h2>
              <p className="text-[11px] text-zinc-500">
                Sync {ignList.length} admitted candidate{ignList.length !== 1 ? 's' : ''} to production server
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-5 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('commands')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'commands'
                ? 'border-zinc-200 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Console Commands (/whitelist add)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-zinc-200 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            whitelist.json Format
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-96 space-y-3.5">
          {loading ? (
            <div className="py-12 text-center text-zinc-500">
              Querying admissions database...
            </div>
          ) : ignList.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              No candidates have been marked as Admitted.
            </div>
          ) : (
            <>
              {/* Heads Row */}
              <div className="p-2.5 rounded-md bg-zinc-950 border border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Admitted Cohort ({ignList.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {ignList.map((ign) => (
                    <div
                      key={ign}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                    >
                      <SkinAvatar ign={ign} size={18} />
                      <span>{ign}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Box */}
              <div className="rounded-md border border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between px-3 py-1 bg-zinc-900/60 border-b border-zinc-800 text-[10px] text-zinc-500">
                  <span>{activeTab === 'commands' ? 'batch_commands.txt' : 'whitelist.json'}</span>
                  <span>{commands.length} records</span>
                </div>
                <pre className="p-3 text-zinc-300 overflow-x-auto max-h-52 text-[11px] leading-relaxed">
                  {activeTab === 'commands'
                    ? commands.join('\n')
                    : JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'json' && ignList.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadJson}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              disabled={ignList.length === 0}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
