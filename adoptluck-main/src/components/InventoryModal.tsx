import React, { useState, useEffect, useMemo } from 'react';
import { X, Package, Plus, Coins, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { User, PlayerPetItem } from '../types';
import { RobuxIcon } from './RobuxIcon';
import { sounds } from '../utils/audio';
import { getPlayerPets, removePetFromPlayer } from '../utils/auth';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenCreateWithPets: () => void;
  onInventoryChanged?: () => void;
}

type SortOption = 'value-desc' | 'value-asc' | 'name-asc';

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenCreateWithPets,
  onInventoryChanged,
}) => {
  const [pets, setPets] = useState<PlayerPetItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('value-desc');

  useEffect(() => {
    if (isOpen && currentUser) {
      setPets(getPlayerPets(currentUser.username));
    }
  }, [isOpen, currentUser]);

  const totalValue = useMemo(() => {
    return pets.reduce((sum, p) => sum + p.valueInRobux, 0);
  }, [pets]);

  const filteredPets = useMemo(() => {
    return pets
      .filter((pet) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return pet.name.toLowerCase().includes(q) || (pet.rarity && pet.rarity.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        if (sortOption === 'value-desc') {
          return b.valueInRobux - a.valueInRobux;
        }
        if (sortOption === 'value-asc') {
          return a.valueInRobux - b.valueInRobux;
        }
        if (sortOption === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [pets, searchQuery, sortOption]);

  if (!isOpen || !currentUser) return null;



  const handleRemove = (petId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    removePetFromPlayer(currentUser.username, petId);
    setPets((prev) => prev.filter((p) => p.id !== petId));
    if (onInventoryChanged) onInventoryChanged();
  };

  const handleStartCoinflip = () => {
    sounds.playClick();
    onClose();
    onOpenCreateWithPets();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      id="inventory-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="inventory-modal-content"
        className="w-full max-w-4xl bg-[#0e1420] border border-[#1b2538] rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#00E701] flex items-center justify-center shadow-inner">
              <Package className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  My Pet Inventory
                </h3>
                <span className="text-xs font-mono font-bold bg-[#141e30] border border-slate-700/60 text-emerald-400 px-2.5 py-0.5 rounded-full">
                  {pets.length} Pets
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                Total Inventory Value:
                <span className="inline-flex items-center gap-1 font-mono font-black text-[#00E701]">
                  <RobuxIcon className="w-3.5 h-3.5 text-[#00E701]" />
                  {totalValue.toLocaleString()} Robux / R$
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartCoinflip}
              className="px-3.5 py-2 bg-[#00E701] hover:bg-[#00c701] text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,231,1,0.3)] active:scale-95"
            >
              <Coins className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Flip Pets</span>
            </button>
          </div>
        </div>

        {/* Search and Sort Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#182337]">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your pets by name..."
              className="w-full pl-9 pr-8 py-2 bg-[#090d16] border border-[#1a253a] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#090d16] border border-[#1a253a] px-3 py-2 rounded-xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="value-desc" className="bg-[#0e1420] text-white">Value: High to Low</option>
                <option value="value-asc" className="bg-[#0e1420] text-white">Value: Low to High</option>
                <option value="name-asc" className="bg-[#0e1420] text-white">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* PETS GRID: Exact same visual styling as Values Tab (AmvggPetsGallery) */}
        <div className="flex-1 overflow-y-auto pr-1" id="inventory-pets-container">
          {filteredPets.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredPets.map((pet) => {
                const numericId = pet.petId?.replace(/\D/g, '') || '1';
                const imageSrc = pet.imageUrl || `/api/amvgg/image/${numericId}`;
                const fallbackUrl = `https://adoptmevalues.gg/api/adoptme/item-image/${numericId}`;

                return (
                  <div
                    key={pet.id}
                    id={`inventory-pet-${pet.id}`}
                    className="bg-[#0d131d] border border-[#192439] hover:border-emerald-500/40 rounded-2xl p-3 flex flex-col justify-between transition-all group hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] relative"
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(pet.id, e)}
                      className="absolute top-2 right-2 z-10 p-1.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg bg-[#0d1422]/90 border border-slate-700/50"
                      title="Remove from inventory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Pet Image: Exact same container and drop-shadow as Values Tab */}
                    <div className="relative w-full aspect-square bg-[#080c14] rounded-xl border border-[#162032] flex items-center justify-center p-2.5 mb-2.5 overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={pet.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackUrl;
                        }}
                        className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] group-hover:scale-108 transition-transform duration-300"
                      />
                    </div>

                    {/* Pet Name & Market Value */}
                    <div className="w-full">
                      <h3
                        className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-400 transition-colors truncate mb-1"
                        title={pet.name}
                      >
                        {pet.name}
                      </h3>

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-white font-mono">
                          <RobuxIcon className="w-3.5 h-3.5 text-[#00E701] flex-shrink-0" />
                          <span className="text-[#00E701] font-bold">
                            {pet.valueInRobux.toLocaleString()}
                          </span>
                        </div>
                        {pet.rarity && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-[#141d2c] border border-slate-700/50 px-1.5 py-0.5 rounded truncate">
                            {pet.rarity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">
                {searchQuery ? 'No pets match your search' : 'No pets in your inventory'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try searching with a different pet name or clear your search query.'
                  : 'No pets have been assigned to this account yet. Ask an administrator to add pets.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="mt-4 pt-3 border-t border-[#182337] flex items-center justify-between text-xs text-slate-500">
          <span>Real Adopt Me Pet Values synchronized live</span>
          <span className="font-mono text-slate-400">
            Showing {filteredPets.length} of {pets.length} pets
          </span>
        </div>
      </div>
    </div>
  );
};
