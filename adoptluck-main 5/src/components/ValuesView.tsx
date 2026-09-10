import React from 'react';
import { ShieldCheck, Scale, Award, ArrowLeft, CheckCircle2, Lock, Cpu } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ValuesViewProps {
  onBackToGames: () => void;
}

export const ValuesView: React.FC<ValuesViewProps> = ({ onBackToGames }) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6" id="bankro-values-view">
      {/* Back button */}
      <button
        id="values-back-btn"
        type="button"
        onClick={() => {
          sounds.playClick();
          onBackToGames();
        }}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-white mb-6 px-3 py-1.5 rounded-lg bg-[#0e1422] border border-[#1c263c] hover:border-slate-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Active Games
      </button>

      {/* Hero Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#FBBF24] text-xs font-semibold mb-3">
          <Scale className="w-3.5 h-3.5" />
          BankRo Transparency & System Values
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Values & Fair Play System
        </h1>
        <p className="text-sm sm:text-base text-[#94A3B8] mt-2 max-w-2xl">
          Learn how BankRo computes coinflip outcomes, guarantees provable fairness, and establishes token parity across all active games.
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1 */}
        <div className="bg-[#0e1422]/90 border border-[#1c263c] rounded-2xl p-6 flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[#FBBF24] flex items-center justify-center mb-4 border border-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Provably Fair SHA-256
          </h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Every game generates a cryptographically hashed Server Seed before the challenger joins. The outcome cannot be manipulated by either player or the platform.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0e1422]/90 border border-[#1c263c] rounded-2xl p-6 flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Exact 50/50 Probability
          </h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            All coinflips utilize pure binary modulo mathematics. Heads (0) and Tails (1) have an exact 50.00% statistical probability with zero house bias.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0e1422]/90 border border-[#1c263c] rounded-2xl p-6 flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            P2P Escrow Guarantee
          </h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Both players lock equivalent RO token stakes into escrow before the flip begins. The entire pot is immediately credited to the winning player upon resolution.
          </p>
        </div>
      </div>

      {/* Provably Fair Code / Math Explanation Card */}
      <div className="bg-[#0c121e] border border-[#1c263c] rounded-3xl p-6 sm:p-8 mb-10">
        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#FBBF24]" />
          Provably Fair Verification Formula
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8] mb-4 leading-relaxed">
          Players can independently verify any completed coinflip using standard open-source hashing tools:
        </p>

        <div className="bg-[#080b12] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
          <div className="text-slate-500">// 1. Generate Combined String</div>
          <div className="text-amber-400 font-semibold">combined = server_seed + &quot;:&quot; + client_seed + &quot;:&quot; + nonce</div>
          <div className="text-slate-500">// 2. Compute SHA-512 Hash</div>
          <div className="text-sky-300">hash = crypto.createHash(&apos;sha512&apos;).update(combined).digest(&apos;hex&apos;)</div>
          <div className="text-slate-500">// 3. Take first 8 characters and compute modulo 2</div>
          <div className="text-emerald-400 font-semibold">outcome = parseInt(hash.substring(0, 8), 16) % 2 === 0 ? &apos;heads&apos; : &apos;tails&apos;</div>
        </div>
      </div>

      {/* Token Tier Values Table */}
      <div className="bg-[#0e1422]/90 border border-[#1c263c] rounded-3xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-4">
          Tier Values & High Roller Perks
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3">Tier Level</th>
                <th className="pb-3">Bankroll Requirement</th>
                <th className="pb-3">Max Coinflip Pot</th>
                <th className="pb-3">Platform Fee</th>
                <th className="pb-3">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 font-semibold text-white">Rookie</td>
                <td className="py-3">0 - 500 RO</td>
                <td className="py-3">1,000 RO</td>
                <td className="py-3 text-emerald-400">0.0%</td>
                <td className="py-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs">Bronze</span></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Standard Banker</td>
                <td className="py-3">500 - 2,500 RO</td>
                <td className="py-3">5,000 RO</td>
                <td className="py-3 text-emerald-400">1.0%</td>
                <td className="py-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 text-xs">Silver</span></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Gold High Roller</td>
                <td className="py-3">2,500 - 10,000 RO</td>
                <td className="py-3">25,000 RO</td>
                <td className="py-3 text-emerald-400">1.5%</td>
                <td className="py-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold">Gold 👑</span></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Diamond Whale</td>
                <td className="py-3">10,000+ RO</td>
                <td className="py-3">Unlimited</td>
                <td className="py-3 text-emerald-400">1.0% (VIP)</td>
                <td className="py-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-xs font-bold">Diamond 💎</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
