import React from 'react';
import { CoinSide } from '../types';

interface CoinVisualProps {
  side: CoinSide;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  className?: string;
  showGlow?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
};

export const CoinVisual: React.FC<CoinVisualProps> = ({
  side,
  size = 'md',
  animated = false,
  className = '',
  showGlow = true,
}) => {
  const isHeads = side === 'heads';
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeClass} ${className} ${
        animated ? 'animate-coin-spin' : ''
      }`}
    >
      {/* Dynamic Ambient Energy Halo */}
      {showGlow && (
        <div
          className={`absolute inset-0 rounded-full blur-md pointer-events-none transition-all duration-300 ${
            isHeads
              ? 'bg-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.7)]'
              : 'bg-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.7)]'
          }`}
        />
      )}

      {isHeads ? (
        /* ================== HEADS: ELECTRIC BLUE COIN (H) ================== */
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full relative z-10 drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Blue Core Radial */}
            <radialGradient id="headsBlueCore" cx="42%" cy="36%" r="75%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="35%" stopColor="#0284C7" />
              <stop offset="70%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#082F49" />
            </radialGradient>
            {/* Specular Shine */}
            <linearGradient id="headsShine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </linearGradient>
            {/* Outer Glow Filter */}
            <filter id="headsGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38BDF8" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Deep Base Outer Backing */}
          <circle cx="100" cy="100" r="95" fill="#041E34" />

          {/* Main Radial Disk */}
          <circle cx="100" cy="100" r="92" fill="url(#headsBlueCore)" />

          {/* Glowing Neon Cyan Outer Ring */}
          <circle
            cx="100"
            cy="100"
            r="87"
            stroke="#38BDF8"
            strokeWidth="9"
            filter="url(#headsGlow)"
          />

          {/* Inner Cyan Highlight Ring */}
          <circle cx="100" cy="100" r="80" stroke="#7DD3FC" strokeWidth="2.5" opacity="0.6" />

          {/* Specular Diagonal Glass Sheen */}
          <path
            d="M 28 65 Q 100 20 172 65 Q 100 45 28 65 Z"
            fill="url(#headsShine)"
            opacity="0.65"
          />

          {/* Bold Italic Center "H" */}
          <text
            x="96"
            y="134"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="106"
            fontStyle="italic"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, Montserrat, Arial Black, sans-serif"
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(255,255,255,0.4))',
              transform: 'skewX(-4deg)',
              transformOrigin: 'center',
            }}
          >
            H
          </text>
        </svg>
      ) : (
        /* ================== TAILS: VIBRANT RED COIN (T) ================== */
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full relative z-10 drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Red Core Radial */}
            <radialGradient id="tailsRedCore" cx="42%" cy="36%" r="75%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="35%" stopColor="#EF4444" />
              <stop offset="70%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#450A0A" />
            </radialGradient>
            {/* Specular Shine */}
            <linearGradient id="tailsShine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#F87171" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
            </linearGradient>
            {/* Outer Glow Filter */}
            <filter id="tailsGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Deep Base Outer Backing */}
          <circle cx="100" cy="100" r="95" fill="#2B0505" />

          {/* Main Radial Disk */}
          <circle cx="100" cy="100" r="92" fill="url(#tailsRedCore)" />

          {/* Glowing Neon Coral/Red Outer Ring */}
          <circle
            cx="100"
            cy="100"
            r="87"
            stroke="#F87171"
            strokeWidth="9"
            filter="url(#tailsGlow)"
          />

          {/* Inner Red Highlight Ring */}
          <circle cx="100" cy="100" r="80" stroke="#FCA5A5" strokeWidth="2.5" opacity="0.6" />

          {/* Specular Diagonal Glass Sheen */}
          <path
            d="M 28 65 Q 100 20 172 65 Q 100 45 28 65 Z"
            fill="url(#tailsShine)"
            opacity="0.65"
          />

          {/* Bold Italic Center "T" */}
          <text
            x="98"
            y="134"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="106"
            fontStyle="italic"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, Montserrat, Arial Black, sans-serif"
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(255,255,255,0.4))',
              transform: 'skewX(-4deg)',
              transformOrigin: 'center',
            }}
          >
            T
          </text>
        </svg>
      )}
    </div>
  );
};
