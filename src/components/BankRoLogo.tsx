import React from 'react';
import { Clover, Sparkles } from 'lucide-react';
import { RobuxIcon } from './RobuxIcon';

interface BankRoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BankRoLogo: React.FC<BankRoLogoProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  const textSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none cursor-pointer group" id="adoptluck-logo">
      <div className="relative">
        <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-[#12221b] to-[#0a1510] p-1.5 shadow-md border border-emerald-500/30 group-hover:border-emerald-400 flex items-center justify-center transition-all`}>
          <Clover className="w-full h-full text-[#00E701] drop-shadow-[0_0_8px_rgba(0,231,1,0.4)]" />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00E701] ring-2 ring-[#0c1017]"></span>
      </div>

      {showText && (
        <div className="flex items-center tracking-tight font-black uppercase font-sans">
          <span className={`${textSize} text-white`}>ADOPT</span>
          <span className={`${textSize} text-[#00E701]`}>LUCK</span>
        </div>
      )}
    </div>
  );
};
