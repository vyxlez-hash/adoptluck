import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowLeft,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';
import { AmvggPet, User } from '../types';
import rawPetsData from '../data/amvggPets.json';
import { RobuxIcon } from './RobuxIcon';
import { sounds } from '../utils/audio';

const petsData = rawPetsData as AmvggPet[];

interface AmvggPetsGalleryProps {
  onBackToCoinflips: () => void;
  currentUser?: User | null;
  onOpenInventory?: () => void;
  onOpenCreateWithPets?: () => void;
  onSignInRequired?: () => void;
}

type SortOption = 'value-desc' | 'value-asc' | 'name-asc';

export const AmvggPetsGallery: React.FC<AmvggPetsGalleryProps> = ({
  onBackToCoinflips,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('value-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter and sort items strictly by pet name and value
  const filteredPets = useMemo(() => {
    return petsData
      .filter((pet) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return pet.name.toLowerCase().includes(q);
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
  }, [searchQuery, sortOption]);

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 lg:px-6" id="amvgg-pets-directory">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#182234]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              id="amvgg-back-btn"
              type="button"
              onClick={() => {
                sounds.playClick();
                onBackToCoinflips();
              }}
              className="p-1.5 rounded-xl bg-[#101725] hover:bg-[#162135] text-slate-300 hover:text-white border border-[#1b263b] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Coinflips</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            Adopt Me Pets
            <span className="text-sm font-mono font-bold bg-[#141d2d] text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
              {petsData.length} Pets
            </span>
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1420] border border-[#182337] rounded-2xl p-3 sm:p-4 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="amvgg-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pets by name (e.g. Bat Dragon, Shadow Dragon, Turtle)..."
              className="w-full bg-[#080d14] border border-[#1b273d] focus:border-emerald-500/60 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Sort and View mode */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#080d14] border border-[#1b273d] rounded-xl px-3 py-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="amvgg-sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
              >
                <option value="value-desc" className="bg-[#0e1420]">Value: High to Low</option>
                <option value="value-asc" className="bg-[#0e1420]">Value: Low to High</option>
                <option value="name-asc" className="bg-[#0e1420]">Name: A to Z</option>
              </select>
            </div>

            {/* View Mode toggle */}
            <div className="flex items-center bg-[#080d14] border border-[#1b273d] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
        <span>
          Showing <strong className="text-white">{filteredPets.length}</strong> of{' '}
          <strong className="text-white">{petsData.length}</strong> pets
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            Clear search filter
          </button>
        )}
      </div>

      {/* GRID VIEW: Strictly Pet Image, Name, and Value */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4" id="amvgg-grid-view">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              id={`pet-card-${pet.itemId}`}
              className="bg-[#0d131d] border border-[#192439] hover:border-emerald-500/40 rounded-2xl p-3 flex flex-col justify-between transition-all group hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
            >
              {/* Pet Image */}
              <div className="relative w-full aspect-square bg-[#080c14] rounded-xl border border-[#162032] flex items-center justify-center p-2 mb-2.5 overflow-hidden">
                <img
                  src={pet.localImageUrl}
                  alt={pet.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = pet.amvggImageUrl;
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] group-hover:scale-108 transition-transform duration-300"
                />
              </div>

              {/* Pet Name & Market Value Only */}
              <div className="w-full">
                <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-400 transition-colors truncate mb-1" title={pet.name}>
                  {pet.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs font-black text-white font-mono">
                  <RobuxIcon className="w-3.5 h-3.5 text-[#00E701] flex-shrink-0" />
                  <span className="text-[#00E701] font-bold">{pet.valueInRobux.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW: Strictly Pet Image, Name, and Value */}
      {viewMode === 'table' && (
        <div className="bg-[#0e1420] border border-[#182337] rounded-2xl overflow-hidden shadow-xl" id="amvgg-table-view">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0e17] border-b border-[#182337] text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Pet</th>
                  <th className="py-3 px-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151f32] text-xs">
                {filteredPets.map((pet) => (
                  <tr
                    key={pet.id}
                    className="hover:bg-[#121927] transition-colors"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={pet.localImageUrl}
                          alt={pet.name}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = pet.amvggImageUrl;
                          }}
                          className="w-10 h-10 object-contain rounded-lg bg-[#080c14] border border-[#182337] p-1 flex-shrink-0"
                        />
                        <span className="font-bold text-white text-sm">
                          {pet.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 font-mono font-black text-white">
                        <RobuxIcon className="w-3.5 h-3.5 text-[#00E701]" />
                        <span className="text-[#00E701] text-sm">{pet.valueInRobux.toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
