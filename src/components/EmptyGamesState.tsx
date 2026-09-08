import React from 'react';
import { Zap, Plus, ArrowRight } from 'lucide-react';
import { FilterTab, User } from '../types';
import { sounds } from '../utils/audio';

interface EmptyGamesStateProps {
  filter: FilterTab;
  user: User | null;
  onSignInClick: () => void;
  onCreateClick: () => void;
}

export const EmptyGamesState: React.FC<EmptyGamesStateProps> = ({
  filter,
  user,
  onSignInClick,
  onCreateClick,
}) => {
  const getMessage = () => {
    switch (filter) {
      case 'waiting':
        return {
          title: 'No waiting games right now',
          desc: user
            ? 'Be the first! Create a coinflip and wait for a challenger.'
            : 'Sign in to create a coinflip and start playing.',
        };
      case 'active':
        return {
          title: 'No active flips in progress',
          desc: 'When two players start a flip, live action will appear here.',
        };
      case 'completed':
        return {
          title: 'No completed games yet',
          desc: 'Completed coinflips and provably fair hashes will be listed here.',
        };
      case 'all':
      default:
        return {
          title: 'No coinflip games found',
          desc: user
            ? 'Create a coinflip to challenge other players!'
            : 'Sign in with your Roblox account to create a coinflip.',
        };
    }
  };

  const { title, desc } = getMessage();

  return (
    <div
      id="empty-games-container"
      className="w-full bg-[#101622] border border-[#1a2335] rounded-3xl p-12 sm:p-20 flex flex-col items-center justify-center text-center min-h-[380px] shadow-sm relative overflow-hidden"
    >
      <div 
        id="empty-state-icon"
        className="w-16 h-16 rounded-2xl bg-[#141d2c] border border-[#202c42] flex items-center justify-center text-emerald-400 mb-5 shadow-inner"
      >
        <Zap className="w-8 h-8 stroke-[2]" />
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-slate-400 mt-2 max-w-md">
        {desc}
      </p>

      <div className="mt-6 flex items-center gap-3">
        {user ? (
          <button
            id="empty-state-create-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onCreateClick();
            }}
            className="flex items-center gap-2 bg-[#00E701] hover:bg-[#00c701] text-black font-black uppercase text-xs tracking-wider px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,231,1,0.25)] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Coinflip
          </button>
        ) : (
          <button
            id="empty-state-signin-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onSignInClick();
            }}
            className="flex items-center gap-2 bg-[#00E701] hover:bg-[#00c701] text-black font-black uppercase text-xs tracking-wider px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,231,1,0.25)] active:scale-95 cursor-pointer"
          >
            Sign In with Roblox
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
};
