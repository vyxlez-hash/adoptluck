import React from 'react';
import { Users, Zap, Filter, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  onlinePlayersCount: string | number;
  waitingGamesCount: number;
  activeFlipsCount: number;
  totalPotAmount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  onlinePlayersCount,
  waitingGamesCount,
  activeFlipsCount,
  totalPotAmount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-overview-grid">
      {/* 1. Online Players */}
      <div 
        id="stat-card-online-players"
        className="bg-[#0e1422]/90 border border-[#1b253b] rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:border-slate-700/80 hover:bg-[#111827]"
      >
        <div className="w-12 h-12 rounded-full bg-[#102420] text-[#10B981] flex items-center justify-center shrink-0 border border-emerald-500/20">
          <Users className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-normal text-[#94A3B8]">Online Players</span>
          <span className="text-2xl font-bold text-[#10B981] leading-tight mt-0.5">
            {onlinePlayersCount}
          </span>
        </div>
      </div>

      {/* 2. Waiting Games */}
      <div 
        id="stat-card-waiting-games"
        className="bg-[#0e1422]/90 border border-[#1b253b] rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:border-slate-700/80 hover:bg-[#111827]"
      >
        <div className="w-12 h-12 rounded-full bg-[#272111] text-[#FBBF24] flex items-center justify-center shrink-0 border border-amber-500/20">
          <Zap className="w-5 h-5 fill-[#FBBF24]/20" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-normal text-[#94A3B8]">Waiting Games</span>
          <span className="text-2xl font-bold text-[#FBBF24] leading-tight mt-0.5">
            {waitingGamesCount}
          </span>
        </div>
      </div>

      {/* 3. Active Flips */}
      <div 
        id="stat-card-active-flips"
        className="bg-[#0e1422]/90 border border-[#1b253b] rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:border-slate-700/80 hover:bg-[#111827]"
      >
        <div className="w-12 h-12 rounded-full bg-[#111f2e] text-[#38BDF8] flex items-center justify-center shrink-0 border border-sky-500/20">
          <Filter className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-normal text-[#94A3B8]">Active Flips</span>
          <span className="text-2xl font-bold text-[#38BDF8] leading-tight mt-0.5">
            {activeFlipsCount}
          </span>
        </div>
      </div>

      {/* 4. Total Pot */}
      <div 
        id="stat-card-total-pot"
        className="bg-[#0e1422]/90 border border-[#1b253b] rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:border-slate-700/80 hover:bg-[#111827]"
      >
        <div className="w-12 h-12 rounded-full bg-[#22162e] text-[#C084FC] flex items-center justify-center shrink-0 border border-purple-500/20">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-normal text-[#94A3B8]">Total Pot</span>
          <span className="text-2xl font-bold text-[#C084FC] leading-tight mt-0.5">
            {totalPotAmount}
          </span>
        </div>
      </div>
    </div>
  );
};
