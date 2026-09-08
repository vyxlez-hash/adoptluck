import React from 'react';
import { CoinflipGame, User } from '../types';
import { CoinVisual } from './CoinVisual';
import { Trophy, Play, Eye, Trash2, Bot } from 'lucide-react';
import { RobuxIcon } from './RobuxIcon';
import { sounds } from '../utils/audio';

interface GameCardProps {
  game: CoinflipGame;
  currentUser: User | null;
  onJoin: (game: CoinflipGame) => void;
  onWatch: (game: CoinflipGame) => void;
  onCancel: (gameId: string) => void;
  onCallBot: (game: CoinflipGame) => void;
  onSignInRequired: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  currentUser,
  onJoin,
  onWatch,
  onCancel,
  onCallBot,
  onSignInRequired,
}) => {
  const isCreator = currentUser?.id === game.creator.id;
  const isCreatorHeads = game.creatorSide === 'heads';

  const handleAction = () => {
    sounds.playClick();
    if (game.status === 'waiting') {
      if (!currentUser) {
        onSignInRequired();
        return;
      }
      if (isCreator) {
        onCancel(game.id);
        return;
      }
      onJoin(game);
    } else {
      onWatch(game);
    }
  };

  const handleCallBot = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    onCallBot(game);
  };

  return (
    <div
      id={`coinflip-game-card-${game.id}`}
      className={`relative overflow-hidden rounded-2xl px-4 py-3 sm:px-5 sm:py-4 transition-all duration-200 shadow-md flex items-center justify-between gap-3 sm:gap-4 border ${
        game.status === 'active'
          ? 'bg-[#0f172a] border-emerald-500/50 shadow-[0_0_20px_rgba(0,231,1,0.15)]'
          : 'bg-[#101622] border-[#1a2436] hover:border-emerald-500/30'
      }`}
    >
      {/* Left: Avatar + Side Badge + Creator Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <img
            src={game.creator.avatar}
            alt={game.creator.username}
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover border-2 border-[#243248] bg-[#090d16] shadow-sm"
          />
          {/* Glowing Head / Tail Coin Badge */}
          <div className="absolute -bottom-1 -right-1 shrink-0 shadow-md">
            <CoinVisual side={game.creatorSide} size="xs" showGlow={false} />
          </div>
        </div>

        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[160px]">
              {game.creator.username}
            </span>
            {isCreator && (
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-black font-mono">
                YOU
              </span>
            )}
          </div>
          <span
            className={`text-xs font-bold capitalize ${
              isCreatorHeads ? 'text-sky-400' : 'text-rose-400'
            }`}
          >
            {game.creatorSide}
          </span>
        </div>
      </div>

      {/* Middle: Value Being Coinflipped */}
      <div className="flex items-center gap-1.5 font-mono shrink-0 px-2">
        <RobuxIcon className="w-5 h-5 text-[#00E701]" />
        <span className="text-base sm:text-lg font-black text-[#00E701]">
          {game.betAmount.toLocaleString()}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {game.status === 'waiting' ? (
          <>
            {isCreator ? (
              <>
                <button
                  id={`call-bot-btn-${game.id}`}
                  type="button"
                  onClick={handleCallBot}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#182133] hover:bg-[#202c44] text-slate-200 border border-slate-700/60 transition-all active:scale-95 cursor-pointer"
                  title="Spawn bot challenger to flip immediately"
                >
                  <Bot className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline">Call Bot</span>
                </button>
                <button
                  id={`cancel-game-${game.id}`}
                  type="button"
                  onClick={handleAction}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer active:scale-95"
                  title="Cancel coinflip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </>
            ) : (
              <button
                id={`join-game-${game.id}`}
                type="button"
                onClick={handleAction}
                className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-[#00E701] hover:bg-[#00c701] text-black shadow-[0_0_15px_rgba(0,231,1,0.25)] transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Join</span>
              </button>
            )}
          </>
        ) : game.status === 'active' ? (
          <button
            id={`watch-game-${game.id}`}
            type="button"
            onClick={handleAction}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/50 transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Watch</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {game.winner && (
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-xl">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[80px] sm:max-w-[120px]">{game.winner.username}</span>
              </div>
            )}
            <button
              id={`view-completed-game-${game.id}`}
              type="button"
              onClick={handleAction}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Inspect Coinflip Result"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
