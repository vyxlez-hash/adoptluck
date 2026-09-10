import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoinflipGame, CoinSide, User } from '../types';
import { Realistic3DCoin } from './Realistic3DCoin';
import { CoinVisual } from './CoinVisual';
import { sounds } from '../utils/audio';

interface CoinflipArenaModalProps {
  game: CoinflipGame | null;
  currentUser: User | null;
  onClose: () => void;
  onGameResolved: (gameId: string, winner: User, winningSide: CoinSide) => void;
}

export const CoinflipArenaModal: React.FC<CoinflipArenaModalProps> = ({
  game,
  currentUser,
  onClose,
  onGameResolved,
}) => {
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<CoinSide | null>(null);
  const [winnerUser, setWinnerUser] = useState<User | null>(null);
  const [hasResolved, setHasResolved] = useState<boolean>(false);

  useEffect(() => {
    if (!game) {
      setIsFlipping(false);
      setOutcome(null);
      setWinnerUser(null);
      setHasResolved(false);
      return;
    }

    // If game is already completed
    if (game.status === 'completed' && game.winningSide && game.winner) {
      setOutcome(game.winningSide);
      setWinnerUser(game.winner);
      setHasResolved(true);
      setIsFlipping(false);
      return;
    }

    // Fair 50/50 flip calculation
    const winningSide: CoinSide = Math.random() > 0.5 ? 'heads' : 'tails';
    const creatorWins = game.creatorSide === winningSide;
    const determinedWinner = creatorWins ? game.creator : (game.challenger || game.creator);

    setOutcome(winningSide);
    setIsFlipping(true);
    setHasResolved(false);
    setWinnerUser(null);
    sounds.playCoinToss();

    const timer = setTimeout(() => {
      setIsFlipping(false);
      setWinnerUser(determinedWinner);
      setHasResolved(true);
      sounds.playCoinLand();

      // Confetti celebration if user won
      if (currentUser && determinedWinner.id === currentUser.id) {
        sounds.playWinChime();
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00E701', '#38BDF8', '#F87171', '#ffffff'],
          });
        } catch {
          // ignore
        }
      }

      onGameResolved(game.id, determinedWinner, winningSide);
    }, 2400);

    return () => {
      clearTimeout(timer);
    };
  }, [game?.id]);

  if (!game) return null;

  const isCurrentUserWinner = currentUser && winnerUser && currentUser.id === winnerUser.id;
  const isCurrentUserInGame =
    currentUser && (currentUser.id === game.creator.id || currentUser.id === game.challenger?.id);
  const isCurrentUserLoser = isCurrentUserInGame && !isCurrentUserWinner;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      id="coinflip-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && hasResolved) onClose();
      }}
    >
      <div
        id="coinflip-modal-content"
        className="w-full max-w-md bg-[#121622] border border-[#1e2638] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="close-coinflip-modal-btn"
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= STATE 1: ACTIVE FLIPPING (BloxLuck Style) ================= */}
        {!hasResolved ? (
          <div className="flex flex-col items-center py-4">
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6">
              Coinflip
            </h2>

            {/* Players Avatars Faceoff */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 mb-6">
              {/* Creator */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={game.creator.avatar}
                    alt={game.creator.username}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 bg-[#090d16]"
                  />
                  <div className="absolute -bottom-1 -right-1 shadow-md">
                    <CoinVisual side={game.creatorSide} size="xs" showGlow={false} />
                  </div>
                </div>
                <span className="text-xs font-bold text-white mt-2 max-w-[100px] truncate">
                  {game.creator.username}
                </span>
              </div>

              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                VS
              </span>

              {/* Challenger */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={game.challenger?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={game.challenger?.username || 'Challenger'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 bg-[#090d16]"
                  />
                  <div className="absolute -bottom-1 -right-1 shadow-md">
                    <CoinVisual
                      side={game.creatorSide === 'heads' ? 'tails' : 'heads'}
                      size="xs"
                      showGlow={false}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-white mt-2 max-w-[100px] truncate">
                  {game.challenger?.username || 'Challenger'}
                </span>
              </div>
            </div>

            {/* Center 3D BloxLuck Spinning Coin */}
            <div className="my-2 min-h-[160px] flex items-center justify-center">
              <Realistic3DCoin isFlipping={isFlipping} outcome={outcome} size="xl" />
            </div>

            <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest animate-pulse font-mono">
              Flipping Coin...
            </p>
          </div>
        ) : (
          /* ================= STATE 2: OUTCOME SCREEN (Matching Screenshot 2) ================= */
          <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Top Emblem Checkmark Circle */}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 transition-all ${
                isCurrentUserWinner || (!isCurrentUserInGame && winnerUser)
                  ? 'bg-[#12241a] border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.25)]'
                  : 'bg-[#261313] border-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.25)]'
              }`}
            >
              {isCurrentUserWinner || (!isCurrentUserInGame && winnerUser) ? (
                <Check className="w-10 h-10 text-[#22c55e] stroke-[3]" />
              ) : (
                <X className="w-10 h-10 text-[#ef4444] stroke-[3]" />
              )}
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {isCurrentUserWinner
                ? 'Winner!'
                : isCurrentUserLoser
                ? 'Defeat!'
                : `${winnerUser?.username || 'Player'} Won!`}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 font-medium mb-8">
              {isCurrentUserWinner
                ? 'You Won This Game.'
                : isCurrentUserLoser
                ? 'You Lost This Game.'
                : 'Game Concluded.'}
            </p>

            {/* Continue Button */}
            <button
              id="coinflip-continue-btn"
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="min-w-[160px] py-3 px-8 rounded-xl font-bold text-sm text-white bg-[#5c67f2] hover:bg-[#4f59e0] active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#5c67f2]/25"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
