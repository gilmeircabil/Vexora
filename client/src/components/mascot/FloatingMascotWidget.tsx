import React, { useState } from 'react';
import { useMascot } from '../../context/MascotContext';
import { SquirrelMascot } from './SquirrelMascot';

export const FloatingMascotWidget: React.FC = () => {
  const { mood, isMinimized, setIsMinimized, triggerMood } = useMascot();
  const [customQuote, setCustomQuote] = useState<string | null>(null);

  // Safely check if we're on the dedicated full-screen Studio editor route
  let pathname = '';
  if (typeof window !== 'undefined' && window.location) {
    pathname = window.location.pathname;
  }

  const handleMascotClick = () => {
    setCustomQuote('Woohoo! Sparkle power!');
    triggerMood('celebrate', 2500);
  };

  const getSpeechText = () => {
    if (mood === 'celebrate') {
      return customQuote || 'Sparkle power! You got this!';
    }
    if (mood === 'crunch') {
      return 'Crunching code! High focus!';
    }
    return 'Hi! Ready to build something cool?';
  };

  // Do not render floating mascot on full-screen Studio Editor canvas
  if (pathname.startsWith('/studio/editor')) {
    return null;
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          aria-label="Expand mascot"
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900/90 dark:bg-slate-800/95 text-amber-100 hover:text-white border border-amber-500/40 shadow-lg hover:shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-md"
        >
          {/* Mini Acorn Icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="transform group-hover:rotate-12 transition-transform"
          >
            <path d="M12 2 Q14 5 15 7" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M6 9 C6 6 18 6 18 9 C 18 11 6 11 6 9 Z"
              fill="#92400e"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <path d="M7 11 Q12 21 17 11" fill="#b45309" stroke="#fbbf24" strokeWidth="1.5" />
          </svg>
          <span className="text-xs font-semibold tracking-wide">Mascot</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Interactive Mascot Companion"
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Speech Bubble */}
      <div
        data-testid="mascot-speech-bubble"
        aria-live="polite"
        className="relative mb-2 max-w-[80vw] sm:max-w-[210px] rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 p-3 shadow-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md text-xs font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="font-bold text-[10px] tracking-wider uppercase text-amber-600 dark:text-amber-400">
            Vexora Mascot
          </span>
          <button
            onClick={() => setIsMinimized(true)}
            aria-label="Minimize mascot"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 -mr-1 -mt-1 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        <p className="text-[11.5px] leading-snug">{getSpeechText()}</p>
        {/* Bubble arrow pointing down to squirrel */}
        <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white/95 dark:bg-slate-900/95 border-r border-b border-slate-200 dark:border-slate-800 transform rotate-45" />
      </div>

      {/* Mascot Animated Character */}
      <div className="relative group">
        <SquirrelMascot
          state={mood}
          size={110}
          onClick={handleMascotClick}
          className="drop-shadow-xl"
        />
      </div>
    </aside>
  );
};
