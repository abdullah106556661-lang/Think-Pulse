import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export const ThinkPulseLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  animated = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 20, text: 'text-base', badge: 'text-[9px] px-1 py-0.5' },
    md: { box: 'w-9 h-9', icon: 26, text: 'text-xl', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { box: 'w-12 h-12', icon: 34, text: 'text-2xl', badge: 'text-xs px-2 py-0.5' },
    xl: { box: 'w-16 h-16', icon: 46, text: 'text-3xl', badge: 'text-xs px-2.5 py-1' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom Thinking Silhouette with Neural Insight Core */}
      <div
        className={`relative ${currentSize.box} rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-600/30 border border-cyan-500/40 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/10 group`}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm pointer-events-none group-hover:bg-cyan-400/20 transition-all duration-300" />

        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
        >
          {/* Subtle Contemplation Aura Rings */}
          <circle cx="27" cy="18" r="8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          <circle cx="27" cy="18" r="13" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.25" />

          {/* Stylized Human Thinking Profile Silhouette */}
          <path
            d="M13 39C13 36 15 34 18 33C21 32 23 31 23 28V26.5C21 25.5 19 23.5 18 20C17 19.8 15.5 19 15.5 17C15.5 15.2 16.8 14.5 17.5 14.5C17.5 11 19.5 7 26 7C32.5 7 35.5 11.5 35.5 17C35.5 22.5 32 26 29 27.5V30C29 32.5 32 34 35 35C38 36 40 37.5 40 41"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-cyan-300"
          />

          {/* Contemplative Thought Synapse Core (Active Thinking Node in Forehead) */}
          <circle
            cx="27"
            cy="18"
            r="3.5"
            fill="url(#thoughtCoreGrad)"
            className={animated ? 'animate-ping opacity-75' : ''}
          />
          <circle cx="27" cy="18" r="2.5" fill="#38bdf8" />
          
          {/* Synaptic Thought Rays - Signifying deep cognitive processing */}
          <path
            d="M27 12V9M33 14L35.5 12M33 22L36 23.5M21 14L18.5 12"
            stroke="#67e8f9"
            strokeWidth="1.75"
            strokeLinecap="round"
          />

          {/* Chin contemplation support line */}
          <path
            d="M21 25C22.5 25.5 24 25.5 25.5 25.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />

          <defs>
            <linearGradient id="thoughtCoreGrad" x1="24" y1="15" x2="30" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Dynamic Thinking Pulse Indicator */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-white font-heading ${currentSize.text}`}>
            Think<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">Pulse</span>
          </span>
          <span
            className={`font-mono font-bold uppercase rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 ${currentSize.badge}`}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );
};
