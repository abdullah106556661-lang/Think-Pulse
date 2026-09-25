import React from 'react';
import { ThinkPulseLogo } from './ThinkPulseLogo';
import { Sparkles, Cpu, Layers } from 'lucide-react';

interface GenerationIndicatorProps {
  status?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GenerationIndicator: React.FC<GenerationIndicatorProps> = ({
  status = 'Generating...',
  subtext,
  size = 'md',
  className = '',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div
      className={`inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-xl shadow-cyan-950/20 backdrop-blur-md transition-all ${
        isLg ? 'p-6 gap-5' : ''
      } ${className}`}
    >
      {/* Platform Branded Logo as Neural Generator Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <ThinkPulseLogo size={isSm ? 'sm' : isLg ? 'lg' : 'md'} showText={false} animated={true} />
        {/* Subtle spinning neural halo */}
        <div className="absolute -inset-1 rounded-2xl border border-cyan-400/40 border-t-transparent animate-spin pointer-events-none" />
      </div>

      {/* Status Details */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-semibold tracking-tight text-white ${isSm ? 'text-xs' : isLg ? 'text-base' : 'text-sm'}`}>
            {status}
          </span>
          <span className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
        {subtext && (
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 max-w-xs truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
