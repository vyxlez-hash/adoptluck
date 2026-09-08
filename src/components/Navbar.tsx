import React from 'react';
import { BankRoLogo } from './BankRoLogo';
import { NavTab, User } from '../types';
import { Volume2, VolumeX, LogOut, Plus, Package, Trophy } from 'lucide-react';
import { RobuxIcon } from './RobuxIcon';
import { sounds } from '../utils/audio';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  user: User | null;
  onSignInClick: () => void;
  onSignOutClick: () => void;
  onDepositClick: () => void;
  onOpenInventory?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenAdminModal?: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  user,
  onSignInClick,
  onSignOutClick,
  onDepositClick,
  onOpenInventory,
  onOpenLeaderboard,
  isSoundMuted,
  onToggleSound,
}) => {
  return (
    <header className="w-full border-b border-[#171f2e] bg-[#0c1017]/95 backdrop-blur-md sticky top-0 z-40" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: AdoptLuck Logo & Navigation */}
        <div className="flex items-center gap-6">
          <div onClick={() => onTabChange('coinflips')} className="cursor-pointer">
            <BankRoLogo size="md" />
          </div>

          <nav className="flex items-center gap-2" aria-label="Main Navigation">
            {onOpenLeaderboard && (
              <button
                id="nav-tab-leaderboard"
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenLeaderboard();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all text-slate-400 hover:text-white hover:bg-[#101622] border border-transparent"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Leaderboard</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right side: Sound toggle, Robux balance, Roblox user profile */}
        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            id="sound-toggle-btn"
            type="button"
            onClick={onToggleSound}
            aria-label={isSoundMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#131a26] transition-colors border border-transparent hover:border-slate-800 cursor-pointer"
            title={isSoundMuted ? 'Sound muted' : 'Sound active'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {/* User Value Balance Pill with Inventory Button */}
              <div 
                id="user-balance-badge"
                className="flex items-center bg-[#101622] border border-[#1d273a] hover:border-emerald-500/30 rounded-xl p-1 pl-3 shadow-inner transition-colors"
              >
                <div className="flex items-center gap-1.5 mr-2.5">
                  <RobuxIcon className="w-4 h-4 text-[#00E701]" />
                  <span className="text-sm font-black text-white tracking-wide font-mono">
                    {user.balance.toLocaleString()}
                  </span>
                </div>
                <button
                  id="navbar-inventory-btn"
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenInventory();
                  }}
                  className="bg-[#00E701] hover:bg-[#00c701] text-black px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,231,1,0.3)] active:scale-95 cursor-pointer flex items-center gap-1.5"
                  title="Open Pet Inventory"
                >
                  <Package className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Inventory</span>
                </button>
              </div>

              {/* Roblox User Profile (BloxLuck Style) */}
              <div className="flex items-center gap-2.5 pl-1.5 py-1 pr-2 rounded-xl bg-[#101622]/80 border border-[#1a2334]">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border border-slate-600/60 object-cover bg-[#090d16]"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00E701] border-2 border-[#101622]" />
                </div>

                <div className="hidden sm:flex flex-col text-left leading-tight min-w-[70px]">
                  <span className="text-xs font-bold text-white truncate max-w-[110px]">
                    {user.displayName || user.username}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[110px]">
                    @{user.username}
                  </span>
                </div>

                <span className="text-[9px] font-black text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded uppercase font-mono">
                  LVL {user.level || 1}
                </span>

                <button
                  id="navbar-sign-out-btn"
                  type="button"
                  onClick={onSignOutClick}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer ml-0.5"
                  title="Disconnect Roblox Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              id="navbar-sign-in-btn"
              type="button"
              onClick={() => {
                sounds.playClick();
                onSignInClick();
              }}
              className="flex items-center gap-2 bg-[#00E701] hover:bg-[#00c701] text-black font-black text-xs uppercase tracking-wider px-4 sm:px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(0,231,1,0.25)] transition-all active:scale-95 cursor-pointer"
            >
              Sign In with Roblox
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
