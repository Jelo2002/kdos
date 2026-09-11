'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 1 to 5
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: { text: '1 Star - Do Not Accept', color: 'text-red-400', desc: 'Unsuitable, toxic attitude, or severe rule issues' },
  2: { text: '2 Stars - Below Average', color: 'text-orange-400', desc: 'Hesitant, questionable answers, or poor microphone' },
  3: { text: '3 Stars - Average / Needs Review', color: 'text-yellow-400', desc: 'Acceptable but borderline, requires second opinion' },
  4: { text: '4 Stars - Good Candidate', color: 'text-emerald-400', desc: 'Polite, active player, positive addition to SMP' },
  5: { text: '5 Stars - Exceptional / Must Accept', color: 'text-emerald-300 font-bold', desc: 'Top-tier applicant, mature, great builder/redstoner' },
};

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = true,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeVal = hoverRating !== null ? hoverRating : value;

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeVal;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(null)}
              className={`p-1 rounded transition-transform duration-150 ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-125 focus:outline-none focus:ring-2 focus:ring-emerald-500/50'
              }`}
              title={`${star} Star${star > 1 ? 's' : ''}`}
              aria-label={`${star} Star`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              />
            </button>
          );
        })}
        {readOnly && (
          <span className="ml-1.5 text-xs font-semibold text-amber-300/90 font-mono">
            {value}/5
          </span>
        )}
      </div>

      {showLabel && activeVal > 0 && RATING_LABELS[activeVal] && (
        <div className="text-xs transition-opacity duration-200 animate-fadeIn">
          <span className={`font-semibold ${RATING_LABELS[activeVal].color}`}>
            {RATING_LABELS[activeVal].text}
          </span>
          {!readOnly && (
            <p className="text-gray-400 text-[11px] mt-0.5">
              {RATING_LABELS[activeVal].desc}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
