import React from 'react';

interface RobuxIconProps {
  className?: string;
  size?: number;
}

export const RobuxIcon: React.FC<RobuxIconProps> = ({ className = 'w-4 h-4', size }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Robux"
    >
      {/* Authentic tilted Roblox Robux polygon currency symbol */}
      <path d="M5.6 2.8L21.2 7L18.4 21.2L2.8 17L5.6 2.8ZM10.4 9.2L9.2 14.8L14.8 16.3L16 10.7L10.4 9.2Z" />
    </svg>
  );
};
