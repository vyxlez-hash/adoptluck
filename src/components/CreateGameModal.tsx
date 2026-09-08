import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Search, Package } from 'lucide-react';
import { CoinSide, User, PlayerPetItem } from '../types';
import { CoinVisual } from './CoinVisual';
import { RobuxIcon } from './RobuxIcon';
import { sounds } from '../utils/audio';
import { getPlayerPets, claimStarterPets } from '../utils/auth';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreateGame: (
    side: CoinSide,
    betAmount: number,
    clientSeed: string,
    betType: 'currency' | 'pets',
    selectedPets?: PlayerPetItem[]
  ) => void;
}

export const CreateGameModal: React.FC<CreateGameModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateGame,
}) => {
  const [selectedSide, setSelectedSide] = useState<CoinSide>('heads');
  const [inventoryPets, setInventoryPets] = useState<PlayerPetItem[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<Set<string>>(new Set());
  const [petSearch, setPetSearch] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load user's pets when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      const pets = getPlayerPets(currentUser.username);
      setInventoryPets(pets);
      // Default to selecting the first pet if available
      if (pets.length > 0 && selectedPetIds.size === 0) {
        setSelectedPetIds(new Set([pets[0].id]));
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Selected pets list & total value
  const selectedPetsList = inventoryPets.filter((p) => selectedPetIds.has(p.id));
  const totalPetsValue = selectedPetsList.reduce((sum, p) => sum + p.valueInRobux, 0);

  const togglePetSelection = (petId: string) => {
    sounds.playClick();
    setError(null);
    setSelectedPetIds((prev) => {
      const next = new Set(prev);
      if (next.has(petId)) {
        next.delete(petId);
      } else {
        next.add(petId);
      }
      return next;
    });
  };

  const handleSelectAllPets = () => {
    sounds.playClick();
    const allIds = filteredPets.map((p) => p.id);
    setSelectedPetIds(new Set(allIds));
    setError(null);
  };

  const handleClearSelectedPets = () => {
    sounds.playClick();
    setSelectedPetIds(new Set());
  };

  const handleClaimStarterPets = () => {
    sounds.playCoinLand();
    const updated = claimStarterPets(currentUser.username);
    setInventoryPets(updated);
    if (updated.length > 0) {
      setSelectedPetIds(new Set([updated[0].id]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPetsList.length === 0) {
      setError('Please select at least 1 pet from your inventory to wager.');
      return;
    }

    sounds.playCoinToss();
    const autoSeed = `seed_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    onCreateGame(selectedSide, totalPetsValue, autoSeed, 'pets', selectedPetsList);
    onClose();
  };

  const filteredPets = inventoryPets.filter(
    (p) =>
      p.name.toLowerCase().includes(petSearch.toLowerCase()) ||
      (p.rarity && p.rarity.toLowerCase().includes(petSearch.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      id="create-game-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="create-game-modal-content"
        className="w-full max-w-lg bg-[#0e1420] border border-[#1b2538] rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="close-create-game-modal-btn"
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 text-left">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Create Coinflip
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select your coin side and choose pets from your inventory to flip.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Pick Coin Side: only HEADS and TAILS */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Your Side
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Heads (Blue) */}
              <button
                type="button"
                id="select-heads-btn"
                onClick={() => {
                  sounds.playClick();
                  setSelectedSide('heads');
                }}
                className={`py-3.5 px-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  selectedSide === 'heads'
                    ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)] ring-2 ring-sky-400/40'
                    : 'bg-[#121927] border-[#1d273a] text-slate-400 hover:border-slate-700'
                }`}
              >
                <CoinVisual side="heads" size="md" />
                <span className="font-black text-sm tracking-wide text-sky-300">HEADS (BLUE)</span>
              </button>

              {/* Tails (Red) */}
              <button
                type="button"
                id="select-tails-btn"
                onClick={() => {
                  sounds.playClick();
                  setSelectedSide('tails');
                }}
                className={`py-3.5 px-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  selectedSide === 'tails'
                    ? 'bg-red-500/15 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-2 ring-red-500/40'
                    : 'bg-[#121927] border-[#1d273a] text-slate-400 hover:border-slate-700'
                }`}
              >
                <CoinVisual side="tails" size="md" />
                <span className="font-black text-sm tracking-wide text-rose-300">TAILS (RED)</span>
              </button>
            </div>
          </div>

          {/* 2. CHOOSE PETS FROM INVENTORY */}
          <div className="space-y-3 bg-[#0a0f19] p-3.5 rounded-2xl border border-[#1b273d]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white">Your Inventory</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded font-bold">
                  {inventoryPets.length} Pets
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllPets}
                  className="text-[11px] font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Select All
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={handleClearSelectedPets}
                  className="text-[11px] font-medium text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Search filter if many pets */}
            {inventoryPets.length > 3 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search pets by name or rarity..."
                  value={petSearch}
                  onChange={(e) => setPetSearch(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-[#121927] border border-[#1e2a40] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}

            {/* Inventory Pets Grid using exact images from Values tab */}
            {filteredPets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredPets.map((pet) => {
                  const isSelected = selectedPetIds.has(pet.id);
                  return (
                    <div
                      key={pet.id}
                      onClick={() => togglePetSelection(pet.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer relative flex flex-col items-center text-center select-none ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/30 shadow-[0_0_10px_rgba(0,231,1,0.2)]'
                          : 'bg-[#121928] border-[#1e2a40] hover:border-slate-600'
                      }`}
                    >
                      {/* Checkmark indicator */}
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#00E701] text-black flex items-center justify-center text-[10px] font-black z-10">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}

                      <div className="w-10 h-10 rounded-lg bg-[#090d16] border border-[#1b2539] p-0.5 mb-1 flex items-center justify-center">
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const fallbackId = pet.petId?.replace(/\D/g, '') || '1';
                            (e.target as HTMLImageElement).src = `https://adoptmevalues.gg/api/adoptme/item-image/${fallbackId}`;
                          }}
                        />
                      </div>
                      <div className="w-full">
                        <div className="text-[11px] font-bold text-white truncate max-w-full leading-tight">
                          {pet.name}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-[#00E701] font-black mt-0.5">
                          <RobuxIcon className="w-2.5 h-2.5 text-[#00E701]" />
                          <span>{pet.valueInRobux.toLocaleString()}</span>
                        </div>
                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">
                          {pet.rarity || 'Pet'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-[#121927] rounded-xl border border-dashed border-slate-800 p-4">
                <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-semibold">
                  {inventoryPets.length === 0
                    ? 'Your pet inventory is empty'
                    : 'No pets match your search'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Claim starter pets to begin flipping!
                </p>
                <button
                  type="button"
                  onClick={handleClaimStarterPets}
                  className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Claim Free Starter Pets Pack
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-center font-medium">
              {error}
            </p>
          )}

          {/* Submit Action Button */}
          <button
            id="submit-create-game-btn"
            type="submit"
            disabled={selectedPetsList.length === 0}
            className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#00E701] hover:bg-[#00c701] disabled:opacity-50 disabled:cursor-not-allowed text-black shadow-[0_0_20px_rgba(0,231,1,0.3)] transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Create Coinflip</span>
          </button>
        </form>
      </div>
    </div>
  );
};
