import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  Search,
  UserCheck,
  ExternalLink,
  PackagePlus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { RobuxIcon } from './RobuxIcon';
import { PetValue, PlayerPetItem } from '../types';
import { sounds } from '../utils/audio';
import {
  getPetValues,
  addPetValue,
  deletePetValue,
  getPlayerPets,
  addPetToPlayer,
  removePetFromPlayer,
  getStoredAccounts,
} from '../utils/auth';

interface CuteBunnyAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername?: string;
}

const PRESET_PET_IMAGES = [
  {
    name: 'Shadow Dragon',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    defaultVal: 50000,
    rarity: 'Legendary' as const,
  },
  {
    name: 'Bat Dragon',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
    defaultVal: 42000,
    rarity: 'Legendary' as const,
  },
  {
    name: 'Frost Dragon',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    defaultVal: 32000,
    rarity: 'Legendary' as const,
  },
  {
    name: 'Giraffe',
    url: 'https://images.unsplash.com/photo-1538099130811-745e64318258?w=200&auto=format&fit=crop&q=80',
    defaultVal: 25000,
    rarity: 'Legendary' as const,
  },
  {
    name: 'Crow',
    url: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=200&auto=format&fit=crop&q=80',
    defaultVal: 15000,
    rarity: 'Ultra-Rare' as const,
  },
  {
    name: 'Evil Unicorn',
    url: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=200&auto=format&fit=crop&q=80',
    defaultVal: 18000,
    rarity: 'Legendary' as const,
  },
];

export const CuteBunnyAdminModal: React.FC<CuteBunnyAdminModalProps> = ({
  isOpen,
  onClose,
  currentUsername,
}) => {
  const [activeTab, setActiveTab] = useState<'values' | 'player-pets'>('values');

  // Pet Values state
  const [petValues, setPetValues] = useState<PetValue[]>([]);
  const [petName, setPetName] = useState('');
  const [petImageUrl, setPetImageUrl] = useState('');
  const [petValueRobux, setPetValueRobux] = useState<number>(1000);
  const [petRarity, setPetRarity] = useState<PetValue['rarity']>('Legendary');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Player Pet Management state ("add remove pet from smb")
  const [targetPlayer, setTargetPlayer] = useState(currentUsername || 'cute240bunny');
  const [targetPlayerPets, setTargetPlayerPets] = useState<PlayerPetItem[]>([]);
  const [selectedPetToAddId, setSelectedPetToAddId] = useState<string>('');
  const [playerActionNotice, setPlayerActionNotice] = useState<string | null>(null);

  // Load pet values and player pets
  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, targetPlayer]);

  const refreshData = () => {
    const list = getPetValues();
    setPetValues(list);
    if (list.length > 0 && !selectedPetToAddId) {
      setSelectedPetToAddId(list[0].id);
    }
    if (targetPlayer.trim()) {
      setTargetPlayerPets(getPlayerPets(targetPlayer.trim()));
    }
  };

  if (!isOpen) return null;

  // Add new pet value to catalog
  const handleAddPetValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) return;

    sounds.playCoinLand();
    const created = addPetValue({
      name: petName.trim(),
      imageUrl:
        petImageUrl.trim() ||
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
      valueInRobux: Math.max(1, petValueRobux),
      rarity: petRarity,
    });

    setPetName('');
    setPetImageUrl('');
    setPetValueRobux(1000);
    setFormSuccess(`Added "${created.name}" valued at ${created.valueInRobux.toLocaleString()} R$!`);
    setTimeout(() => setFormSuccess(null), 3000);
    refreshData();
  };

  const handleDeletePetValue = (id: string, name: string) => {
    sounds.playClick();
    deletePetValue(id);
    refreshData();
    setFormSuccess(`Removed "${name}" from values database.`);
    setTimeout(() => setFormSuccess(null), 2500);
  };

  const handleSelectPreset = (preset: typeof PRESET_PET_IMAGES[0]) => {
    sounds.playClick();
    setPetName(preset.name);
    setPetImageUrl(preset.url);
    setPetValueRobux(preset.defaultVal);
    setPetRarity(preset.rarity);
  };

  // Add pet to player
  const handleAddPetToPlayer = () => {
    if (!targetPlayer.trim() || !selectedPetToAddId) return;
    const pet = petValues.find((p) => p.id === selectedPetToAddId);
    if (!pet) return;

    sounds.playCoinLand();
    addPetToPlayer(targetPlayer.trim(), pet);
    refreshData();
    setPlayerActionNotice(`Successfully gave "${pet.name}" to @${targetPlayer.trim()}!`);
    setTimeout(() => setPlayerActionNotice(null), 3000);
  };

  // Remove pet from player
  const handleRemovePetFromPlayer = (itemInstanceId: string, petName: string) => {
    sounds.playClick();
    removePetFromPlayer(targetPlayer.trim(), itemInstanceId);
    refreshData();
    setPlayerActionNotice(`Removed "${petName}" from @${targetPlayer.trim()}'s inventory.`);
    setTimeout(() => setPlayerActionNotice(null), 3000);
  };

  const accounts = getStoredAccounts();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
      id="cute240bunny-admin-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="cute240bunny-admin-modal-content"
        className="w-full max-w-4xl max-h-[90vh] bg-[#090d16] border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          id="close-cute-admin-modal-btn"
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Administrator Cute240bunny badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b253b] pb-4 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-[#FBBF24] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                cute240bunny Admin Suite
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Full Pet & Values Authority
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Values & Player Pet Management
            </h2>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center gap-1 bg-[#121929] border border-[#1d2b45] p-1 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('values');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'values'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RobuxIcon className="w-3.5 h-3.5 text-emerald-400" />
              Pet Values
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('player-pets');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'player-pets'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PackagePlus className="w-3.5 h-3.5" />
              Manage Player Pets
            </button>
          </div>
        </div>

        {/* Tab 1: Pet Values Database */}
        {activeTab === 'values' && (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 relative z-10 custom-scrollbar">
            {formSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Add Pet Value Form */}
            <div className="bg-[#0e1524] border border-[#1f2d48] rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FBBF24]" />
                Add New Pet Value
              </h3>

              {/* Quick Preset Buttons */}
              <div className="mb-4">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PET_IMAGES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-[#162035] hover:bg-[#202f4f] text-[11px] font-medium text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      {p.name} ({p.defaultVal.toLocaleString()} R$)
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddPetValue} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pet Name
                    </label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="e.g. Shadow Dragon"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-[#223150] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Value in Robux (R$)</span>
                      <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                        <RobuxIcon className="w-3 h-3 text-emerald-400" />
                        {petValueRobux.toLocaleString()} R$
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={petValueRobux}
                        onChange={(e) => setPetValueRobux(parseInt(e.target.value) || 0)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-[#223150] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono font-bold"
                      />
                      <RobuxIcon className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={petImageUrl}
                      onChange={(e) => setPetImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-[#223150] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Rarity / Tier
                    </label>
                    <select
                      value={petRarity}
                      onChange={(e) => setPetRarity(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#090d16] border border-[#223150] text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Ultra-Rare">Ultra-Rare</option>
                      <option value="Legendary">Legendary</option>
                      <option value="Godly">Godly</option>
                      <option value="Exclusive">Exclusive</option>
                    </select>
                  </div>
                </div>

                {/* Preview & Submit */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    {petImageUrl ? (
                      <img
                        src={petImageUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 bg-black"
                        onError={(e) => {
                          (e.target as any).src =
                            'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#141d2f] border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                        No Pic
                      </div>
                    )}
                    <span className="text-xs text-slate-400">
                      Live image preview
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#FBBF24] hover:bg-[#f59e0b] text-[#090d16] transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    Save Pet Value
                  </button>
                </div>
              </form>
            </div>

            {/* Current Pet Values List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Existing Pet Values Catalog ({petValues.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {petValues.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-[#0e1422] border border-[#1b253b] hover:border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 bg-black shrink-0"
                        onError={(e) => {
                          (e.target as any).src =
                            'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">
                          {pet.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold font-mono">
                          <RobuxIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{pet.valueInRobux.toLocaleString()} R$</span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded font-medium">
                          {pet.rarity || 'Pet'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePetValue(pet.id, pet.name)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                      title="Delete Pet Value"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manage Player Pets ("add remove pet from smb") */}
        {activeTab === 'player-pets' && (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 relative z-10 custom-scrollbar">
            {playerActionNotice && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{playerActionNotice}</span>
              </div>
            )}

            {/* Select target player */}
            <div className="bg-[#0e1524] border border-[#1f2d48] rounded-2xl p-4 sm:p-5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Player (Somebody)
              </label>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={targetPlayer}
                    onChange={(e) => setTargetPlayer(e.target.value)}
                    placeholder="Enter Roblox username..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-[#223150] text-white text-sm focus:outline-none focus:border-amber-400 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                {accounts.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                    <span className="text-[11px] text-slate-500 shrink-0">Recent:</span>
                    {accounts.slice(0, 3).map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setTargetPlayer(acc.username)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors shrink-0 ${
                          targetPlayer.toLowerCase() === acc.username.toLowerCase()
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-[#141d30] text-slate-300 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        @{acc.username}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Pet to this Player */}
            <div className="bg-[#0e1524] border border-[#1f2d48] rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FBBF24]" />
                Give Pet to @{targetPlayer || '...'}
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={selectedPetToAddId}
                  onChange={(e) => setSelectedPetToAddId(e.target.value)}
                  className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-[#223150] text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                >
                  {petValues.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} — {pet.valueInRobux.toLocaleString()} R$ ({pet.rarity})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddPetToPlayer}
                  disabled={!targetPlayer.trim() || !selectedPetToAddId}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <PackagePlus className="w-4 h-4" />
                  Add Pet to Player
                </button>
              </div>
            </div>

            {/* Player's Current Pet Inventory */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  @{targetPlayer || 'Player'}'s Pet Inventory ({targetPlayerPets.length})
                </h3>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <RobuxIcon className="w-3.5 h-3.5 text-emerald-400" />
                  Total Value:{' '}
                  {targetPlayerPets
                    .reduce((sum, item) => sum + item.valueInRobux, 0)
                    .toLocaleString()}{' '}
                  R$
                </span>
              </div>

              {targetPlayerPets.length === 0 ? (
                <div className="text-center py-8 px-4 bg-[#0a0f1d] border border-dashed border-slate-800 rounded-2xl">
                  <span className="text-slate-500 text-xs block mb-1">
                    No pets currently assigned to @{targetPlayer}.
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Use the form above to add pets to their profile.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {targetPlayerPets.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#0e1422] border border-[#1b253b] hover:border-amber-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 bg-black shrink-0"
                          onError={(e) => {
                            (e.target as any).src =
                              'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white text-sm truncate">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold font-mono">
                            <RobuxIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{item.valueInRobux.toLocaleString()} R$</span>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                            {item.rarity || 'Pet'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePetFromPlayer(item.id, item.name)}
                        className="px-2.5 py-1.5 rounded-xl text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1"
                        title="Remove Pet from Player"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
