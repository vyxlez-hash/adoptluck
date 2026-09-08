import React from 'react';
import {
  MessageSquare,
  Gamepad2,
  Scale,
  BarChart3,
  FileText,
} from 'lucide-react';
import { NavTab } from '../types';
import { sounds } from '../utils/audio';

interface LeftSidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onOpenTOS: () => void;
  onOpenFair: () => void;
  onOpenStats: () => void;
  onOpenDiscord: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentTab,
  onTabChange,
  isChatOpen,
  onToggleChat,
  onOpenTOS,
  onOpenFair,
  onOpenStats,
  onOpenDiscord,
}) => {
  return (
    <aside
      id="adoptluck-sidebar"
      className="hidden md:flex flex-col items-center justify-between w-24 bg-[#121724] border border-[#1b2538] rounded-[28px] py-6 px-2 shadow-2xl sticky top-22 h-[calc(100vh-6.5rem)] flex-shrink-0 select-none z-30 transition-all"
    >
      {/* Top Main Navigation Items */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* COINFLIP BUTTON (Dual H/T Chips) */}
        <button
          id="sidebar-btn-coinflip"
          type="button"
          onClick={() => {
            sounds.playClick();
            onTabChange('coinflips');
          }}
          className={`flex flex-col items-center justify-center gap-1.5 w-full py-2.5 px-1 rounded-2xl transition-all cursor-pointer group ${
            currentTab === 'coinflips'
              ? 'bg-[#192133] shadow-[0_0_15px_rgba(0,231,1,0.15)] ring-1 ring-emerald-500/40'
              : 'hover:bg-[#161f30]'
          }`}
          title="Coinflip"
        >
          {/* Dual Heads & Tails Chips (Blue Heads, Red Tails) */}
          <div className="relative flex items-center justify-center w-11 h-9 group-hover:scale-105 transition-transform">
            {/* Heads (Blue chip with H) */}
            <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-800 border-2 border-sky-300 shadow-[0_2px_8px_rgba(56,189,248,0.5)] flex items-center justify-center text-[11px] font-black italic text-white -mr-2 z-10">
              H
            </div>
            {/* Tails (Red chip with T) */}
            <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-red-800 border-2 border-rose-300 shadow-[0_2px_8px_rgba(239,68,68,0.5)] flex items-center justify-center text-[11px] font-black italic text-white z-20">
              T
            </div>
          </div>
          <span
            className={`text-[10px] font-black tracking-wider uppercase leading-none transition-colors ${
              currentTab === 'coinflips' ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            Coinflip
          </span>
        </button>

        {/* PETS BUTTON (Bat Dragon icon from amvgg) */}
        <button
          id="sidebar-btn-amvgg"
          type="button"
          onClick={() => {
            sounds.playClick();
            onTabChange('amvgg-pets');
          }}
          className={`flex flex-col items-center justify-center gap-1.5 w-full py-2.5 px-1 rounded-2xl transition-all cursor-pointer group ${
            currentTab === 'amvgg-pets'
              ? 'bg-[#192133] shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40'
              : 'hover:bg-[#161f30]'
          }`}
          title="Adopt Me Pets Directory"
        >
          <div className="w-10 h-10 rounded-xl bg-[#172033] border border-[#23314d] flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="https://amvgg.com/items/Bat%20Dragon.webp"
              alt="Bat Dragon"
              className="w-full h-full object-contain filter drop-shadow group-hover:scale-110 transition-transform"
              onError={(e) => {
                // Fallback to high quality pet image if offline
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100';
              }}
            />
          </div>
          <span
            className={`text-[10px] font-black tracking-wider uppercase leading-none transition-colors ${
              currentTab === 'amvgg-pets' ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            Pets
          </span>
        </button>

        {/* CHAT LIVE BUTTON */}
        <button
          id="sidebar-btn-live-chat"
          type="button"
          onClick={() => {
            sounds.playClick();
            onToggleChat();
          }}
          className={`flex flex-col items-center justify-center gap-1.5 w-full py-2.5 px-1 rounded-2xl transition-all cursor-pointer group relative ${
            isChatOpen
              ? 'bg-[#192133] shadow-[0_0_15px_rgba(0,231,1,0.2)] ring-1 ring-emerald-500/40 text-emerald-400'
              : 'hover:bg-[#161f30] text-slate-400'
          }`}
          title="Toggle Live Chat"
        >
          <div className="w-10 h-10 rounded-xl bg-[#172033] border border-[#23314d] flex items-center justify-center relative shadow-sm group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00E701] ring-2 ring-[#172033] animate-pulse" />
          </div>
          <span
            className={`text-[10px] font-black tracking-wider uppercase leading-none transition-colors ${
              isChatOpen ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            Chat Live
          </span>
        </button>
      </div>

      {/* Flexible Center Spacer */}
      <div className="flex-1 min-h-[40px]" />

      {/* Bottom Section: TOS, FAIR, STATS, Discord (FAQ removed per request) */}
      <div className="flex flex-col items-center gap-3 w-full border-t border-[#1b263b] pt-4">
        {/* TOS Button */}
        <button
          id="sidebar-btn-tos"
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenTOS();
          }}
          className="text-[11px] font-black tracking-wider uppercase text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          TOS
        </button>

        {/* FAIR Button */}
        <button
          id="sidebar-btn-fair"
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenFair();
          }}
          className="text-[11px] font-black tracking-wider uppercase text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          FAIR
        </button>

        {/* STATS Button */}
        <button
          id="sidebar-btn-stats"
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenStats();
          }}
          className="text-[11px] font-black tracking-wider uppercase text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          STATS
        </button>

        {/* Discord Community Button */}
        <button
          id="sidebar-btn-discord"
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenDiscord();
          }}
          className="p-2 rounded-xl text-slate-400 hover:text-[#5865F2] hover:bg-[#182133] transition-all cursor-pointer group mt-1"
          title="Join Discord Community"
        >
          <Gamepad2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </aside>
  );
};
