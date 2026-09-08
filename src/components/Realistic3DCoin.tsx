import React, { useEffect, useState } from 'react';
import { CoinSide } from '../types';

interface Realistic3DCoinProps {
  isFlipping: boolean;
  outcome: CoinSide | null;
  flipVisualSide?: CoinSide;
  size?: 'md' | 'lg' | 'xl';
  onFlipComplete?: () => void;
}

export const Realistic3DCoin: React.FC<Realistic3DCoinProps> = ({
  isFlipping,
  outcome,
  size = 'xl',
  onFlipComplete,
}) => {
  const [rotationY, setRotationY] = useState<number>(0);
  const [isAirborne, setIsAirborne] = useState<boolean>(false);
  const [hasLanded, setHasLanded] = useState<boolean>(false);

  // Trigger physics animation when isFlipping turns true
  useEffect(() => {
    if (isFlipping && outcome) {
      setIsAirborne(true);
      setHasLanded(false);

      // BloxLuck style fast spins: 10 full spins = 3600deg
      // Blue Heads lands on 0 (3600deg), Red Tails lands on 180 (3780deg)
      const baseSpins = 3600;
      const targetDeg = outcome === 'heads' ? baseSpins : baseSpins + 180;
      setRotationY(targetDeg);

      const landTimer = setTimeout(() => {
        setIsAirborne(false);
        setHasLanded(true);
        if (onFlipComplete) onFlipComplete();
      }, 2400);

      return () => clearTimeout(landTimer);
    } else if (!isFlipping && outcome) {
      setRotationY(outcome === 'heads' ? 0 : 180);
      setIsAirborne(false);
      setHasLanded(true);
    } else if (!isFlipping && !outcome) {
      setRotationY(0);
      setIsAirborne(false);
      setHasLanded(false);
    }
  }, [isFlipping, outcome]);

  // Dimensions based on size
  const dimPx = size === 'xl' ? 148 : size === 'lg' ? 116 : 88;
  const edgeThickness = 12; // 3D depth in px

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      style={{
        width: dimPx,
        height: dimPx + 60, // extra vertical height for toss
        perspective: '1200px',
      }}
    >
      {/* Dynamic 3D Coin Object */}
      <div
        className="relative"
        style={{
          width: dimPx,
          height: dimPx,
          transformStyle: 'preserve-3d',
          transform: isAirborne
            ? `translateY(-95px) rotateY(${rotationY}deg) rotateX(14deg)`
            : hasLanded
            ? `translateY(0px) rotateY(${rotationY}deg) rotateX(0deg)`
            : `translateY(0px) rotateY(${rotationY}deg)`,
          transition: isAirborne
            ? 'transform 2400ms cubic-bezier(0.18, 0.89, 0.32, 1.02)'
            : 'transform 300ms ease-out',
        }}
      >
        {/* ================= FRONT FACE: HEADS (ELECTRIC BLUE 'H') ================= */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: `translateZ(${edgeThickness / 2}px)`,
            background: 'radial-gradient(circle at 40% 35%, #38BDF8 0%, #0284C7 35%, #0369A1 70%, #082F49 100%)',
            border: '4px solid #38BDF8',
            boxShadow: '0 0 25px rgba(56,189,248,0.7), inset 0 0 16px rgba(3,105,161,0.9), inset 0 2px 4px rgba(255,255,255,0.8)',
          }}
        >
          {/* Inner Highlight Ring */}
          <div className="absolute inset-2 rounded-full border border-sky-200/50 pointer-events-none" />

          {/* Bold Italic Center "H" */}
          <span
            className="relative z-10 text-white font-black italic select-none font-sans"
            style={{
              fontSize: size === 'xl' ? '76px' : size === 'lg' ? '58px' : '44px',
              lineHeight: 1,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 10px rgba(255,255,255,0.5))',
              transform: 'skewX(-4deg)',
            }}
          >
            H
          </span>

          {/* Dynamic Specular Sheen Arc */}
          <div
            className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-50 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%)',
            }}
          />
        </div>

        {/* ================= BACK FACE: TAILS (VIBRANT RED 'T') ================= */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: `rotateY(180deg) translateZ(${edgeThickness / 2}px)`,
            background: 'radial-gradient(circle at 40% 35%, #F87171 0%, #EF4444 35%, #DC2626 70%, #450A0A 100%)',
            border: '4px solid #F87171',
            boxShadow: '0 0 25px rgba(239,68,68,0.7), inset 0 0 16px rgba(185,28,28,0.9), inset 0 2px 4px rgba(255,255,255,0.8)',
          }}
        >
          {/* Inner Highlight Ring */}
          <div className="absolute inset-2 rounded-full border border-red-200/50 pointer-events-none" />

          {/* Bold Italic Center "T" */}
          <span
            className="relative z-10 text-white font-black italic select-none font-sans"
            style={{
              fontSize: size === 'xl' ? '76px' : size === 'lg' ? '58px' : '44px',
              lineHeight: 1,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 10px rgba(255,255,255,0.5))',
              transform: 'skewX(-4deg)',
            }}
          >
            T
          </span>

          {/* Dynamic Specular Sheen Arc */}
          <div
            className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-50 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%)',
            }}
          />
        </div>

        {/* ================= 3D PHYSICAL COIN RIM / THICKNESS ================= */}
        {Array.from({ length: 14 }).map((_, i) => {
          const zOffset = (i / 13) * edgeThickness - edgeThickness / 2;
          return (
            <div
              key={i}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: `translateZ(${zOffset}px)`,
                border: '1.5px solid #1e293b',
                boxShadow: '0 0 1px rgba(0,0,0,0.4)',
                background: 'transparent',
              }}
            />
          );
        })}
      </div>

      {/* Dynamic Ground Shadow */}
      <div
        className="absolute bottom-2 rounded-full pointer-events-none transition-all duration-700"
        style={{
          width: isAirborne ? dimPx * 0.45 : dimPx * 0.85,
          height: isAirborne ? 8 : 16,
          backgroundColor: isAirborne ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.6)',
          filter: isAirborne ? 'blur(10px)' : 'blur(4px)',
          transform: isAirborne ? 'translateY(12px) scale(0.6)' : 'translateY(0) scale(1)',
          transition: isAirborne
            ? 'all 2400ms cubic-bezier(0.18, 0.89, 0.32, 1.02)'
            : 'all 300ms ease-out',
        }}
      />
    </div>
  );
};
