import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, Shield, Sparkles, Smile, Flame } from 'lucide-react';
import { User } from '../types';
import { sounds } from '../utils/audio';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: number;
  badge?: string;
  isAdmin?: boolean;
}

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSignInRequired: () => void;
}

const STORAGE_KEY = 'adoptluck_live_chat_v1';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'sys-welcome',
    userId: 'system',
    username: 'AdoptLuck System',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
    text: 'Welcome to the AdoptLuck Live Chat! Chat with real players, call coinflip battles, and trade safely.',
    timestamp: Date.now() - 3600000,
    badge: 'SYSTEM',
    isAdmin: true,
  },
];

export const LiveChat: React.FC<LiveChatProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInRequired,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      onSignInRequired();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) return;

    sounds.playClick();

    const isCuteBunny = currentUser.username.toLowerCase() === 'cute240bunny';

    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      text: trimmed,
      timestamp: Date.now(),
      badge: isCuteBunny ? 'ADMIN' : (currentUser.level && currentUser.level >= 10 ? 'VIP' : 'PRO'),
      isAdmin: isCuteBunny,
    };

    const updated = [...messages, newMessage].slice(-100); // keep last 100 real messages
    setMessages(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div
      id="adoptluck-live-chat"
      className="fixed bottom-0 right-0 z-50 w-full sm:w-96 h-[560px] max-h-[90vh] bg-[#0c121e] border border-[#1b2538] rounded-t-3xl sm:rounded-3xl sm:bottom-4 sm:right-4 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
    >
      {/* Header */}
      <div className="p-3.5 bg-[#101726] border-b border-[#1b2538] flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00E701] ring-2 ring-[#101726] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wide uppercase">
                Live Chat
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#00E701]/15 text-[#00E701] border border-[#00E701]/30 px-1.5 py-0.2 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Real player messages only</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#080d17] scrollbar-thin">
        {messages.map((msg) => {
          const isMe = currentUser && currentUser.id === msg.userId;
          const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isMe ? 'flex-row-reverse text-right' : 'text-left'
              }`}
            >
              <img
                src={msg.avatar}
                alt={msg.username}
                className="w-8 h-8 rounded-full border border-slate-700/70 object-cover bg-[#101726] shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                }}
              />

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[78%]`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-slate-300">
                    {msg.username}
                  </span>
                  {msg.badge && (
                    <span
                      className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded uppercase ${
                        msg.isAdmin
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {msg.badge}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-400 font-mono">
                    {timeStr}
                  </span>
                </div>

                <div
                  className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words font-medium ${
                    isMe
                      ? 'bg-[#00E701] text-black font-semibold rounded-tr-none'
                      : msg.isAdmin
                      ? 'bg-amber-950/40 border border-amber-500/30 text-amber-100 rounded-tl-none'
                      : 'bg-[#121927] border border-[#1b263b] text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#0d1422] border-t border-[#1a253a]">
        {currentUser ? (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send message to live players..."
              maxLength={140}
              className="flex-1 bg-[#080d16] border border-[#1b253b] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-[#00E701] hover:bg-[#00c701] disabled:opacity-40 disabled:hover:bg-[#00E701] text-black font-black transition-all cursor-pointer shadow-md shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-2 p-1">
            <span className="text-xs text-slate-400">
              Sign in with Roblox to chat live
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onSignInRequired();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#00E701] hover:bg-[#00c701] text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
