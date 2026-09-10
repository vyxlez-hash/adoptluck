import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { RobuxIcon } from './RobuxIcon';
import { sounds } from '../utils/audio';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  currentBalance: number;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
  currentBalance,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDeposit = () => {
    sounds.playCoinLand();
    onDeposit(selectedAmount);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const amounts = [100, 250, 500, 1000, 2500, 5000];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      id="deposit-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="deposit-modal-content"
        className="w-full max-w-md bg-[#0e1420] border border-[#1b2538] rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          id="close-deposit-modal-btn"
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00E701] flex items-center justify-center">
            <RobuxIcon className="w-5 h-5 text-[#00E701]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Deposit Robux
            </h3>
            <p className="text-xs text-slate-400">
              Current Balance:{' '}
              <span className="text-white font-bold font-mono">
                {currentBalance.toLocaleString()} R$
              </span>
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-[#00E701] text-[#00E701] flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-white">Deposit Successful!</h4>
            <p className="text-xs text-slate-400 mt-1">
              +{selectedAmount.toLocaleString()} Robux credited.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Choose Robux Tier
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedAmount(amt);
                    }}
                    className={`py-3 px-2 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      selectedAmount === amt
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40'
                        : 'bg-[#121927] border-[#1d273a] text-slate-300 hover:border-slate-600'
                    } border`}
                  >
                    <RobuxIcon className="w-3.5 h-3.5 text-[#00E701]" />
                    <span>+{amt.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#121927] border border-[#1d273a] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Deposited</span>
                <span className="text-lg font-black text-white font-mono flex items-center gap-1.5">
                  <RobuxIcon className="w-4 h-4 text-[#00E701]" />
                  {selectedAmount.toLocaleString()} R$
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold">
                Instant Credit
              </span>
            </div>

            <button
              id="confirm-deposit-btn"
              type="button"
              onClick={handleDeposit}
              className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#00E701] hover:bg-[#00c701] text-black shadow-[0_0_15px_rgba(0,231,1,0.25)] transition-all cursor-pointer active:scale-98"
            >
              Confirm Deposit ({selectedAmount.toLocaleString()} R$)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
