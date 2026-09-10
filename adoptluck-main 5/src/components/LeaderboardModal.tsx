import React, { useState, useEffect, useCallback } from 'react';
import { X, Trophy, ExternalLink, RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { RobuxIcon } from './RobuxIcon';
import { sounds } from '../utils/audio';
import { getRealLeaderboard, LeaderboardUser } from '../utils/auth';
import { User } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(Date.now());

  const refreshLeaderboard = useCallback(() => {
    setIsRefreshing(true);
    const data = getRealLeaderboard(currentUser?.username);
    setUsers(data);
    setLastRefreshedAt(Date.now());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 300);
  }, [currentUser?.username]);

  // Constantly refresh leaderboard in real-time (every 2.5 seconds or when opened)
  useEffect(() => {
    if (!isOpen) return;
    refreshLeaderboard();

    const interval = setInterval(() => {
      const data = getRealLeaderboard(currentUser?.username);
      setUsers(data);
      setLastRefreshedAt(Date.now());
    }, 2500);

    const onStorageChange = () => {
      refreshLeaderboard();
    };

    window.addEventListener('storage', onStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorageChange);
    };
  }, [isOpen, refreshLeaderboard, currentUser?.username]);

  if (!isOpen) return null;

  const top1 = users[0];
  const top2 = users[1];
  const top3 = users[2];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      id="leaderboard-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="leaderboard-modal-content"
        className="w-full max-w-xl bg-[#0e1420] border border-[#1b2538] rounded-3xl p-5 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          id="close-leaderboard-btn"
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Leaderboard
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verified real Roblox users ranked by live total wagered value.
              </p>
            </div>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              refreshLeaderboard();
            }}
            title="Refresh leaderboard"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors border border-slate-700/50 flex items-center gap-1.5 text-xs font-bold"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Top 3 Podium Cards (Real Roblox Profiles) */}
        {users.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 text-center">
            {/* Rank 2 */}
            {top2 && (
              <div className="bg-[#121927] border border-[#1d293f] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center">
                <div className="relative mb-1.5">
                  <img
                    src={top2.avatar}
                    alt={top2.robloxUsername}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-400 bg-[#090d16]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${top2.robloxId}&size=150x150&format=Png&isCircular=false`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-700 border border-slate-400 text-[10px] font-black font-mono text-white flex items-center justify-center">
                    2
                  </span>
                </div>
                <a
                  href={`https://www.roblox.com/users/${top2.robloxId}/profile`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-slate-200 hover:text-emerald-400 truncate max-w-full flex items-center gap-1 group"
                  title={`View Roblox profile for ${top2.robloxUsername}`}
                >
                  <span className="truncate">{top2.robloxUsername}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 flex-shrink-0" />
                </a>
                <div className="flex items-center gap-1 text-xs font-mono text-[#00E701] mt-1 font-black">
                  <RobuxIcon className="w-3.5 h-3.5 text-[#00E701]" />
                  <span>{top2.wagered.toLocaleString()}</span>
                </div>
                {top2.badge && (
                  <span className="text-[9px] text-slate-400 font-mono font-bold mt-0.5">
                    {top2.badge}
                  </span>
                )}
              </div>
            )}

            {/* Rank 1 */}
            {top1 && (
              <div className="bg-gradient-to-b from-amber-500/20 to-[#121927] border border-amber-500/50 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center shadow-[0_0_20px_rgba(245,158,11,0.2)] -mt-2">
                <div className="relative mb-1.5">
                  <img
                    src={top1.avatar}
                    alt={top1.robloxUsername}
                    className="w-13 h-13 rounded-full object-cover border-2 border-amber-400 bg-[#090d16] shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${top1.robloxId}&size=150x150&format=Png&isCircular=false`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border border-amber-300 text-[10px] font-black font-mono text-black flex items-center justify-center">
                    1
                  </span>
                </div>
                <a
                  href={`https://www.roblox.com/users/${top1.robloxId}/profile`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-black text-amber-300 hover:text-amber-200 truncate max-w-full flex items-center gap-1 group"
                  title={`View Roblox profile for ${top1.robloxUsername}`}
                >
                  <span className="truncate">{top1.robloxUsername}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80 group-hover:opacity-100 flex-shrink-0" />
                </a>
                <div className="flex items-center gap-1 text-xs font-mono text-[#00E701] mt-1 font-black">
                  <RobuxIcon className="w-3.5 h-3.5 text-[#00E701]" />
                  <span>{top1.wagered.toLocaleString()}</span>
                </div>
                <span className="text-[9px] text-amber-400 font-black tracking-wider uppercase font-mono mt-0.5">
                  Top Wagerer
                </span>
              </div>
            )}

            {/* Rank 3 */}
            {top3 && (
              <div className="bg-[#121927] border border-[#1d293f] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center">
                <div className="relative mb-1.5">
                  <img
                    src={top3.avatar}
                    alt={top3.robloxUsername}
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-700 bg-[#090d16]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${top3.robloxId}&size=150x150&format=Png&isCircular=false`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-800 border border-amber-600 text-[10px] font-black font-mono text-white flex items-center justify-center">
                    3
                  </span>
                </div>
                <a
                  href={`https://www.roblox.com/users/${top3.robloxId}/profile`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-slate-200 hover:text-emerald-400 truncate max-w-full flex items-center gap-1 group"
                  title={`View Roblox profile for ${top3.robloxUsername}`}
                >
                  <span className="truncate">{top3.robloxUsername}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 flex-shrink-0" />
                </a>
                <div className="flex items-center gap-1 text-xs font-mono text-[#00E701] mt-1 font-black">
                  <RobuxIcon className="w-3.5 h-3.5 text-[#00E701]" />
                  <span>{top3.wagered.toLocaleString()}</span>
                </div>
                {top3.badge && (
                  <span className="text-[9px] text-slate-400 font-mono font-bold mt-0.5">
                    {top3.badge}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Full Ranked List (Real Roblox users & profiles) */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#172033] bg-[#090d16] border border-[#172033] rounded-2xl">
          {users.length > 0 ? (
            users.map((player) => (
              <div
                key={`${player.robloxUsername}-${player.rank}`}
                className={`flex items-center justify-between p-3 sm:px-4 hover:bg-[#101726] transition-colors ${
                  player.isCurrentUser ? 'bg-emerald-500/10 border-l-2 border-emerald-400' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center font-mono font-bold text-xs ${
                      player.rank === 1
                        ? 'text-amber-400 font-black'
                        : player.rank === 2
                        ? 'text-slate-300'
                        : player.rank === 3
                        ? 'text-amber-600'
                        : 'text-slate-400'
                    }`}
                  >
                    #{player.rank}
                  </span>

                  <img
                    src={player.avatar}
                    alt={player.robloxUsername}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-[#121927]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${player.robloxId}&size=150x150&format=Png&isCircular=false`;
                    }}
                  />

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        {player.robloxUsername}
                        {player.isCurrentUser && (
                          <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-1 rounded">
                            YOU
                          </span>
                        )}
                      </span>
                      {player.badge && (
                        <span className="text-[9px] font-mono font-black bg-slate-800 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                          {player.badge}
                        </span>
                      )}
                    </div>

                    <a
                      href={`https://www.roblox.com/users/${player.robloxId}/profile`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors group mt-0.5"
                      title={`Open real Roblox profile for ${player.robloxUsername}`}
                    >
                      <span>Roblox Profile ({player.robloxId})</span>
                      <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 font-mono font-black text-sm text-[#00E701]">
                    <RobuxIcon className="w-3.5 h-3.5 text-[#00E701]" />
                    <span>{player.wagered.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    Total Wagered
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No active wagers yet</p>
              <p className="text-xs text-slate-500 mt-1">Create or join a coinflip to take the #1 spot!</p>
            </div>
          )}
        </div>

        {/* Live sync footer status */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            100% Real Roblox Profiles & Headshots
          </span>
          <span>
            Auto-refreshing live
          </span>
        </div>
      </div>
    </div>
  );
};
