import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { User } from '../types';
import { sounds } from '../utils/audio';
import {
  fetchRobloxUser,
  generateVerificationPhrase,
  verifyRobloxBio,
  completeRobloxLogin,
  ResolvedRobloxProfile,
} from '../utils/auth';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (user: User) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [robloxProfile, setRobloxProfile] = useState<ResolvedRobloxProfile | null>(null);
  const [phrase, setPhrase] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    sounds.playClick();
    setErrorMessage(null);
    setIsLoading(false);
    setIsSuccess(false);
    onClose();
  };

  const handleResolveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your Roblox username.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchRobloxUser(trimmed);
      if (res.success && res.user) {
        sounds.playClick();
        setRobloxProfile(res.user);
        setPhrase(generateVerificationPhrase());
        setCopied(false);
      } else {
        setErrorMessage(res.error || 'Roblox user not found.');
      }
    } catch {
      setErrorMessage('Failed to resolve Roblox user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPhrase = () => {
    if (!phrase) return;
    navigator.clipboard.writeText(phrase);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegeneratePhrase = () => {
    sounds.playClick();
    setPhrase(generateVerificationPhrase());
    setCopied(false);
    setErrorMessage(null);
  };

  const handleVerifyBio = async () => {
    if (!robloxProfile || !phrase) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await verifyRobloxBio(robloxProfile.id, phrase);

      if (result.verified) {
        setIsSuccess(true);
        sounds.playCoinLand();

        const authenticatedUser = completeRobloxLogin({
          robloxId: robloxProfile.id,
          username: robloxProfile.username,
          displayName: robloxProfile.displayName,
          avatar: robloxProfile.avatar,
        });

        setTimeout(() => {
          onSignIn(authenticatedUser);
          handleClose();
        }, 700);
      } else {
        setErrorMessage('Phrase not found in bio yet. Paste it into your Roblox About section and try again.');
      }
    } catch {
      setErrorMessage('Could not verify Roblox bio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      id="roblox-auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="roblox-auth-modal-content"
        className="w-full max-w-sm bg-[#0a0f1d] border border-[#1e2a44] rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          id="close-roblox-modal-btn"
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="text-lg font-black text-white">Roblox Sign In</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {robloxProfile ? 'Put phrase in your bio to verify' : 'Enter your Roblox username'}
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div
            id="roblox-auth-error-banner"
            className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {!robloxProfile ? (
          /* Step 1: Quick Username Input */
          <form onSubmit={handleResolveUser} className="space-y-3" id="roblox-username-form">
            <div className="relative">
              <input
                id="roblox-username-input"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Roblox Username"
                autoComplete="off"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-[#111728] border border-[#202c47] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FBBF24] transition-all font-medium"
              />
            </div>

            <button
              id="roblox-lookup-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#FBBF24] hover:bg-[#f59e0b] text-[#090d16] transition-all shadow active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Finding Profile...
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: ONLY Roblox Profile & Verification Phrase */
          <div className="space-y-4" id="roblox-profile-phrase-view">
            {/* 1. Roblox Profile */}
            <div className="flex items-center justify-between p-3 bg-[#111827] border border-[#1f2d48] rounded-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={robloxProfile.avatar}
                  alt={robloxProfile.username}
                  className="w-11 h-11 rounded-full border border-[#FBBF24]/40 object-cover bg-black shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">
                    {robloxProfile.displayName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate">
                    @{robloxProfile.username}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <a
                  href={`https://www.roblox.com/users/${robloxProfile.id}/profile`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="p-1.5 text-slate-400 hover:text-[#38BDF8] hover:bg-slate-800 rounded-lg transition-colors"
                  title="Open Roblox Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setRobloxProfile(null);
                    setErrorMessage(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            {/* 2. Verification Phrase */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Verification Phrase
                </span>
                <button
                  type="button"
                  onClick={handleRegeneratePhrase}
                  className="text-[10px] text-slate-400 hover:text-[#FBBF24] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  New
                </button>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-[#070b14] border border-[#FBBF24]/40 rounded-xl">
                <div className="flex-1 font-mono font-bold text-[#FBBF24] text-xs sm:text-sm tracking-wide select-all px-1 break-all">
                  {phrase}
                </div>
                <button
                  id="copy-phrase-btn"
                  type="button"
                  onClick={handleCopyPhrase}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#FBBF24] hover:bg-[#f59e0b] text-black shadow'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Verify Action Button */}
            {isSuccess ? (
              <div className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                Verified! Logging in...
              </div>
            ) : (
              <button
                id="confirm-roblox-verify-btn"
                type="button"
                disabled={isLoading}
                onClick={handleVerifyBio}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#FBBF24] hover:bg-[#f59e0b] text-[#090d16] transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Checking Bio...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    Verify Bio & Sign In
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
