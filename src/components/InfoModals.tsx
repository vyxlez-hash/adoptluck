import React from 'react';
import { X, Scale, FileText, BarChart3, Gamepad2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface InfoModalProps {
  type: 'tos' | 'fair' | 'stats' | 'discord' | null;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-[#0e1420] border border-[#1b2538] rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
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

        {/* TOS MODAL */}
        {type === 'tos' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Terms of Service (TOS)</h3>
                <p className="text-xs text-slate-400">Fair usage and player guidelines</p>
              </div>
            </div>
            <div className="text-xs text-slate-300 space-y-3 bg-[#080d16] p-4 rounded-2xl border border-[#162134] leading-relaxed max-h-72 overflow-y-auto">
              <p>
                <strong>1. Acceptance of Terms:</strong> By creating or participating in coinflips, pet wagering, or accessing AdoptLuck features, you agree to abide by community safety and fair play rules.
              </p>
              <p>
                <strong>2. Virtual Asset Ownership:</strong> All pet items, Robux balance counters, and banknotes represent internal digital gaming tokens for platform use.
              </p>
              <p>
                <strong>3. Provable Fairness:</strong> Game results are governed strictly by SHA-256 cryptographic seeds. No administrator or player can alter flip outcomes once created.
              </p>
              <p>
                <strong>4. Account Verification:</strong> Accounts are verified via public Roblox profiles using secure bio-phrase authorization.
              </p>
            </div>
          </div>
        )}

        {/* PROVABLY FAIR MODAL */}
        {type === 'fair' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Provably Fair System</h3>
                <p className="text-xs text-slate-400">SHA-256 Cryptographic Verification</p>
              </div>
            </div>
            <div className="text-xs text-slate-300 space-y-3 bg-[#080d16] p-4 rounded-2xl border border-[#162134] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Server Seed Hashing:</strong> Before any flip starts, a random 256-bit server seed is hashed using SHA-256 and committed publicly.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Client Seed Input:</strong> Players provide or randomize their own client seed. Neither party can anticipate the other's seed.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Deterministic Output:</strong> <code>HMAC_SHA256(serverSeed, clientSeed) % 2</code> yields 0 (Heads) or 1 (Tails).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATS MODAL */}
        {type === 'stats' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Platform Live Statistics</h3>
                <p className="text-xs text-slate-400">Real-time gaming & volume metrics</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#080d16] border border-[#162134] p-3.5 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Flips</span>
                <span className="text-xl font-black text-white font-mono">14,289</span>
              </div>
              <div className="bg-[#080d16] border border-[#162134] p-3.5 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Volume Wagered</span>
                <span className="text-xl font-black text-[#00E701] font-mono">3,892,400 R$</span>
              </div>
              <div className="bg-[#080d16] border border-[#162134] p-3.5 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Pets Wagered</span>
                <span className="text-xl font-black text-amber-400 font-mono">1,420 Pets</span>
              </div>
              <div className="bg-[#080d16] border border-[#162134] p-3.5 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Online Players</span>
                <span className="text-xl font-black text-emerald-400 font-mono">87 Active</span>
              </div>
            </div>
          </div>
        )}

        {/* DISCORD MODAL */}
        {type === 'discord' && (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center mx-auto mb-3">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Join Our Discord Community</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
              Connect with fellow Coinflip traders, join flash giveaways, share Adopt Me pet trades, and report bugs directly to developers.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Open Discord Invite</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
