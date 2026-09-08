import React from 'react';
import { FilterTab } from '../types';
import { Plus } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GamesFilterTabsProps {
  currentFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  counts: {
    all: number;
    waiting: number;
    active: number;
    completed: number;
  };
  onCreateClick: () => void;
}

export const GamesFilterTabs: React.FC<GamesFilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  onCreateClick,
}) => {
  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All Games', count: counts.all },
    { key: 'waiting', label: 'Waiting', count: counts.waiting },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-6" id="games-header-section">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Active Games
        </h1>
        <p className="text-sm sm:text-base text-[#94A3B8] mt-1">
          Join a coinflip or create your own
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap" role="tablist">
          {tabs.map((tab) => {
            const isSelected = currentFilter === tab.key;
            return (
              <button
                key={tab.key}
                id={`filter-tab-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  sounds.playClick();
                  onFilterChange(tab.key);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                  isSelected
                    ? tab.key === 'waiting'
                      ? 'bg-[#141b2b] text-[#FBBF24] border-[#FBBF24]/40 shadow-sm'
                      : 'bg-[#141b2b] text-white border-slate-600 shadow-sm'
                    : 'bg-[#0e1422] text-[#94A3B8] border-[#1b253b] hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    isSelected && tab.key === 'waiting'
                      ? 'text-[#FBBF24] bg-[#FBBF24]/10'
                      : isSelected
                      ? 'text-white bg-slate-700'
                      : 'text-slate-400 bg-[#161f33]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Create button */}
        <div className="flex items-center gap-2 ml-auto sm:ml-2">
          <button
            id="create-game-trigger-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onCreateClick();
            }}
            className="flex items-center gap-1.5 bg-[#FBBF24] hover:bg-[#f59e0b] text-[#0a0e17] font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Coinflip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
