/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trophy, MessageSquare } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { GamesList } from './components/GamesList';
import { SignInModal } from './components/SignInModal';
import { CreateGameModal } from './components/CreateGameModal';
import { DepositModal } from './components/DepositModal';
import { CoinflipArenaModal } from './components/CoinflipArenaModal';
import { CuteBunnyAdminModal } from './components/CuteBunnyAdminModal';
import { InventoryModal } from './components/InventoryModal';
import { AmvggPetsGallery } from './components/AmvggPetsGallery';
import { LeftSidebar } from './components/LeftSidebar';
import { LeaderboardModal } from './components/LeaderboardModal';
import { InfoModals } from './components/InfoModals';
import { LiveChat } from './components/LiveChat';
import { INITIAL_GAMES } from './data/mockGames';
import { CoinSide, CoinflipGame, NavTab, User, PlayerPetItem } from './types';
import { sounds } from './utils/audio';
import {
  getCurrentSession,
  logoutAccount,
  updateUserBalance,
  removePetsFromPlayer,
  addPetsToPlayer,
  getPlayerPets,
  recordUserWager,
  syncAccountToSupabase,
  hydrateAccountFromSupabase,
  hydratePlayerPetsFromSupabase,
  fetchGamesFromSupabase,
  saveGameToSupabase,
  deleteGameFromSupabase,
} from './utils/auth';
import { supabaseConfigured } from './utils/supabase';

const STORAGE_KEY_GAMES = 'adoptluck_games_v1';

export default function App() {
  // Navigation state
  const [currentNavTab, setCurrentNavTab] = useState<NavTab>('coinflips');

  // Real authenticated Roblox user state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const session = getCurrentSession();
    return session ? session.user : null;
  });

  // Games list: loads from localStorage or clean initial games
  const [games, setGames] = useState<CoinflipGame[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GAMES);
      if (saved) {
        const parsed: CoinflipGame[] = JSON.parse(saved);
        // Only keep waiting or active games; completed games are deleted
        return parsed.filter((g) => g.status !== 'completed');
      }
    } catch {
      // fallback
    }
    return INITIAL_GAMES.filter((g) => g.status !== 'completed');
  });

  // Synchronize games to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
    } catch (err) {
      console.error('Failed to save games', err);
    }
  }, [games]);

  // Supabase is the persistent shared source; localStorage is only the offline cache.
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      if (currentUser) {
        const remoteUser = await hydrateAccountFromSupabase(currentUser.id);
        if (!cancelled && remoteUser) setCurrentUser(remoteUser);
        await hydratePlayerPetsFromSupabase(currentUser.username);
      }
      const remoteGames = await fetchGamesFromSupabase();
      if (!cancelled && supabaseConfigured) setGames(remoteGames);
    };
    void hydrate();
    const interval = window.setInterval(async () => {
      const remoteGames = await fetchGamesFromSupabase();
      if (!cancelled && supabaseConfigured) setGames(remoteGames);
    }, 4000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [currentUser?.id]);

  // Modals & Chat state
  const [isSignInOpen, setIsSignInOpen] = useState<boolean>(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState<boolean>(false);
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeArenaGame, setActiveArenaGame] = useState<CoinflipGame | null>(null);
  const [activeInfoModal, setActiveInfoModal] = useState<'tos' | 'fair' | 'stats' | 'discord' | null>(null);

  // User inventory pets state
  const [userPets, setUserPets] = useState<PlayerPetItem[]>(() => {
    const session = getCurrentSession();
    return session ? getPlayerPets(session.user.username) : [];
  });

  const refreshUserPets = () => {
    if (currentUser) {
      setUserPets(getPlayerPets(currentUser.username));
    } else {
      setUserPets([]);
    }
  };

  useEffect(() => {
    refreshUserPets();
  }, [currentUser]);

  // Sound state
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Keyboard shortcut: cute240bunny can press Alt+A to open Admin suite
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        if (currentUser && currentUser.username?.toLowerCase() === 'cute240bunny') {
          e.preventDefault();
          setIsAdminOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  // Handlers
  const handleToggleSound = () => {
    const isMuted = !sounds.toggleSound();
    setIsSoundMuted(isMuted);
  };

  const handleSignOut = () => {
    sounds.playClick();
    logoutAccount();
    setCurrentUser(null);
  };

  const handleCreateGame = (
    side: CoinSide,
    betAmount: number,
    clientSeed: string,
    betType: 'currency' | 'pets' = 'currency',
    selectedPets?: PlayerPetItem[]
  ) => {
    if (!currentUser) {
      setIsSignInOpen(true);
      return;
    }

    let updatedUser = { ...currentUser };

    if (betType === 'pets' && selectedPets && selectedPets.length > 0) {
      // Remove selected pets from creator's inventory
      removePetsFromPlayer(
        currentUser.username,
        selectedPets.map((p) => p.id)
      );
    } else {
      // Deduct user balance in Robux / Banknotes
      const newBalance = currentUser.balance - betAmount;
      updateUserBalance(currentUser.id, newBalance);
      updatedUser.balance = newBalance;
    }

    setCurrentUser(updatedUser);

    const newGame: CoinflipGame = {
      id: `game-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      creator: updatedUser,
      creatorSide: side,
      betAmount,
      betType,
      creatorPets: betType === 'pets' ? selectedPets : undefined,
      status: 'waiting',
      createdAt: Date.now(),
      serverSeedHash: Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      clientSeed,
    };

    setGames((prev) => [newGame, ...prev]);
    void saveGameToSupabase(newGame);

    // Live update real Roblox leaderboard with this wager!
    recordUserWager(
      updatedUser.username,
      updatedUser.robloxId || 135982143,
      updatedUser.avatar,
      betAmount
    );
  };

  const handleJoinGame = (game: CoinflipGame) => {
    if (!currentUser) {
      setIsSignInOpen(true);
      return;
    }

    if (currentUser.balance < game.betAmount) {
      setIsDepositOpen(true);
      return;
    }

    // Deduct bet amount in Robux / Banknotes from challenger
    const newBalance = currentUser.balance - game.betAmount;
    updateUserBalance(currentUser.id, newBalance);

    const updatedUser: User = {
      ...currentUser,
      balance: newBalance,
    };
    setCurrentUser(updatedUser);

    // Live update real Roblox leaderboard with challenger wager!
    recordUserWager(
      updatedUser.username,
      updatedUser.robloxId || 135982143,
      updatedUser.avatar,
      game.betAmount
    );

    // Update game status to active with challenger
    const updatedGame: CoinflipGame = {
      ...game,
      status: 'active',
      challenger: updatedUser,
    };

    setGames((prev) => prev.map((g) => (g.id === game.id ? updatedGame : g)));
    void saveGameToSupabase(updatedGame);

    // Open live flip arena
    setActiveArenaGame(updatedGame);
  };

  const handleWatchGame = (game: CoinflipGame) => {
    setActiveArenaGame(game);
  };

  const handleCancelGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (!game || !currentUser) return;

    if (game.betType === 'pets' && game.creatorPets && game.creatorPets.length > 0) {
      // Return pets back to creator's inventory
      addPetsToPlayer(currentUser.username, game.creatorPets);
    } else {
      // Refund bet in Robux / Banknotes
      const newBalance = currentUser.balance + game.betAmount;
      updateUserBalance(currentUser.id, newBalance);
      setCurrentUser({
        ...currentUser,
        balance: newBalance,
      });
    }

    setGames((prev) => prev.filter((g) => g.id !== gameId));
    void deleteGameFromSupabase(gameId);
  };

  // USER DIRECTIVE: "delete coinflips after they spin"
  const handleGameResolved = (gameId: string, winner: User, winningSide: CoinSide) => {
    const game = games.find((g) => g.id === gameId) || activeArenaGame;
    if (!game) return;

    const pot = game.betAmount * 2;

    if (currentUser && currentUser.id === winner.id) {
      if (game.betType === 'pets') {
        if (winner.id === game.creator.id) {
          if (game.creatorPets) {
            addPetsToPlayer(currentUser.username, game.creatorPets);
          }
          const newBalance = currentUser.balance + game.betAmount;
          updateUserBalance(currentUser.id, newBalance);
          setCurrentUser((prev) => (prev ? { ...prev, balance: newBalance } : null));
        } else {
          if (game.creatorPets) {
            addPetsToPlayer(currentUser.username, game.creatorPets);
          }
        }
      } else {
        const newBalance = currentUser.balance + pot;
        updateUserBalance(currentUser.id, newBalance);
        setCurrentUser((prev) => (prev ? { ...prev, balance: newBalance } : null));
      }
    }

    // Immediately remove coinflip from state so it is deleted after it spins!
    setGames((prev) => prev.filter((g) => g.id !== gameId));
    void deleteGameFromSupabase(gameId);
  };

  const handleDeposit = (amount: number) => {
    if (!currentUser) return;
    const newBalance = currentUser.balance + amount;
    updateUserBalance(currentUser.id, newBalance);
    setCurrentUser((prev) => (prev ? { ...prev, balance: newBalance } : null));
  };

  const handleTabChange = (tab: NavTab) => {
    sounds.playClick();
    if (tab === 'leaderboard') {
      setIsLeaderboardOpen(true);
      return;
    }
    setCurrentNavTab(tab);
  };

  const handleOpenCreateModal = () => {
    sounds.playClick();
    if (!currentUser) {
      setIsSignInOpen(true);
    } else {
      setIsCreateGameOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* AdoptLuck Header: Coinflip tab removed from top, clean Leaderboard, Pets, and Inventory */}
      <Navbar
        currentTab={currentNavTab}
        onTabChange={handleTabChange}
        user={currentUser}
        onSignInClick={() => setIsSignInOpen(true)}
        onSignOutClick={handleSignOut}
        onDepositClick={() => {
          if (!currentUser) {
            setIsSignInOpen(true);
          } else {
            setIsDepositOpen(true);
          }
        }}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        isSoundMuted={isSoundMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Outer Content Wrap with AdoptLuck Left Vertical Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 flex gap-4 md:gap-6 items-start pb-20 md:pb-6">
        {/* Left Vertical Sidebar: Coinflip, Bat Dragon Pets, Live Chat, and Info links */}
        <LeftSidebar
          currentTab={currentNavTab}
          onTabChange={handleTabChange}
          isChatOpen={isChatOpen}
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
          onOpenTOS={() => setActiveInfoModal('tos')}
          onOpenFair={() => setActiveInfoModal('fair')}
          onOpenStats={() => setActiveInfoModal('stats')}
          onOpenDiscord={() => setActiveInfoModal('discord')}
        />

        {/* Content View Area */}
        <div className="flex-1 min-w-0">
          {currentNavTab === 'amvgg-pets' ? (
            <AmvggPetsGallery
              onBackToCoinflips={() => setCurrentNavTab('coinflips')}
              currentUser={currentUser}
              onOpenInventory={() => setIsInventoryOpen(true)}
              onOpenCreateWithPets={() => setIsCreateGameOpen(true)}
              onSignInRequired={() => setIsSignInOpen(true)}
            />
          ) : (
            <main className="w-full">
              {/* Coinflips Feed Header with Create Coinflip Button */}
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                    Coinflips
                  </h1>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full font-mono">
                    {games.length}
                  </span>
                </div>

                <button
                  id="create-coinflip-btn"
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-2 bg-[#00E701] hover:bg-[#00c701] text-black font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-[0_0_15px_rgba(0,231,1,0.25)] transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Coinflip</span>
                </button>
              </div>

              {/* Coinflips Feed List */}
              <GamesList
                games={games}
                currentUser={currentUser}
                onJoinGame={handleJoinGame}
                onWatchGame={handleWatchGame}
                onCancelGame={handleCancelGame}
                onSignInRequired={() => setIsSignInOpen(true)}
                onCreateClick={handleOpenCreateModal}
              />
            </main>
          )}
        </div>
      </div>

      {/* Mobile Floating Bottom Dock for Coinflip, Pets, Leaderboard, and Live Chat */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121724]/95 border-t border-[#1a2538] backdrop-blur-md px-3 py-2 flex items-center justify-around">
        <button
          type="button"
          onClick={() => handleTabChange('coinflips')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-black uppercase tracking-wider ${
            currentNavTab === 'coinflips' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <div className="flex items-center -space-x-1">
            <span className="w-4 h-4 rounded-full bg-red-500 text-[8px] font-bold italic flex items-center justify-center text-white">H</span>
            <span className="w-4 h-4 rounded-full bg-cyan-400 text-[8px] font-bold italic flex items-center justify-center text-white">T</span>
          </div>
          <span>Coinflip</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('amvgg-pets')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-black uppercase tracking-wider ${
            currentNavTab === 'amvgg-pets' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <img
            src="https://amvgg.com/items/Bat%20Dragon.webp"
            alt="Pets"
            className="w-4 h-4 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=50';
            }}
          />
          <span>Pets</span>
        </button>

        <button
          type="button"
          onClick={() => setIsLeaderboardOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-blue-400"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Leaderboard</span>
        </button>

        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-black uppercase tracking-wider ${
            isChatOpen ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>
      </div>

      {/* Real Live Chat (No demo fake users) */}
      <LiveChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={currentUser}
        onSignInRequired={() => setIsSignInOpen(true)}
      />

      {/* Roblox Profile Authentication Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignIn={(user) => {
          setCurrentUser(user);
          setIsSignInOpen(false);
          refreshUserPets();
        }}
      />

      {/* Create Coinflip Modal */}
      {currentUser && (
        <CreateGameModal
          isOpen={isCreateGameOpen}
          onClose={() => setIsCreateGameOpen(false)}
          currentUser={currentUser}
          onCreateGame={handleCreateGame}
        />
      )}

      {/* Inventory Modal */}
      {currentUser && (
        <InventoryModal
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          currentUser={currentUser}
          onOpenCreateWithPets={() => {
            setIsCreateGameOpen(true);
          }}
          onInventoryChanged={refreshUserPets}
        />
      )}

      {/* Deposit Modal */}
      {currentUser && (
        <DepositModal
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          onDeposit={handleDeposit}
          currentBalance={currentUser.balance}
        />
      )}

      {/* Live Coinflip 3D Physics Flip Arena Modal */}
      <CoinflipArenaModal
        game={activeArenaGame}
        currentUser={currentUser}
        onClose={() => {
          if (activeArenaGame) {
            // Ensure finished game is deleted from games list
            setGames((prev) => prev.filter((g) => g.id !== activeArenaGame.id));
          }
          setActiveArenaGame(null);
        }}
        onGameResolved={handleGameResolved}
      />

      {/* AdoptLuck Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUser={currentUser}
      />

      {/* AdoptLuck TOS / FAIR / STATS / DISCORD Info Modals */}
      <InfoModals
        type={activeInfoModal}
        onClose={() => setActiveInfoModal(null)}
      />

      {/* Cute240bunny Admin Suite (Alt+A shortcut) */}
      {currentUser && currentUser.username?.toLowerCase() === 'cute240bunny' && (
        <CuteBunnyAdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          currentUsername={currentUser.username}
        />
      )}
    </div>
  );
}
