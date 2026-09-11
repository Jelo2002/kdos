'use client';

import React, { useState } from 'react';

interface SkinAvatarProps {
  ign: string;
  size?: number;
  className?: string;
}

export default function SkinAvatar({ ign, size = 48, className = '' }: SkinAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Clean the IGN
  const cleanIgn = ign?.trim() || 'Steve';
  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(cleanIgn)}/${size}`;

  if (hasError || !cleanIgn) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-emerald-950/80 border border-emerald-500/30 rounded-lg flex items-center justify-center font-mono font-bold text-emerald-400 select-none shadow-sm ${className}`}
      >
        {cleanIgn ? cleanIgn.substring(0, 2).toUpperCase() : 'MC'}
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative overflow-hidden rounded-lg border border-gray-700/60 bg-gray-900 shadow-sm transition-all duration-200 hover:scale-105 hover:border-emerald-500/50 flex-shrink-0 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl}
        alt={`${cleanIgn}'s Minecraft Head`}
        width={size}
        height={size}
        className="w-full h-full object-contain image-pixelated"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
}
