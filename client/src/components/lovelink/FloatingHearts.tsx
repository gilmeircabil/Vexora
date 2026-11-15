import React, { useMemo } from 'react';
import type { ParticleEffectId } from '../../services/loveLinkService.js';

const EFFECT_CONFIG: Record<
  Exclude<ParticleEffectId, 'none'>,
  {
    symbols: string[];
    color: string;
    glowColor: string;
    secondaryGlow: string;
  }
> = {
  petals: {
    symbols: ['🌸', '🌺', '🌷', '💮', '🌹'],
    color: 'text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.55)]',
    glowColor: 'rgba(244, 63, 94, 0.16)',
    secondaryGlow: 'rgba(236, 72, 153, 0.14)',
  },
  hearts: {
    symbols: ['💗', '🌸', '💖', '♥', '💕'],
    color: 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.55)]',
    glowColor: 'rgba(225, 29, 72, 0.16)',
    secondaryGlow: 'rgba(244, 114, 182, 0.13)',
  },
  butterflies: {
    symbols: ['🦋', '🌸', '✨', '💮', '🌷'],
    color: 'text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.55)]',
    glowColor: 'rgba(192, 38, 211, 0.15)',
    secondaryGlow: 'rgba(244, 63, 94, 0.13)',
  },
  fireflies: {
    symbols: ['✨', '✧', '💫', '⋆', '🌸'],
    color: 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.75)]',
    glowColor: 'rgba(245, 158, 11, 0.14)',
    secondaryGlow: 'rgba(244, 63, 94, 0.12)',
  },
  stars: {
    symbols: ['✦', '★', '🌙', '✨', '✧'],
    color: 'text-amber-200 drop-shadow-[0_0_8px_rgba(253,230,138,0.65)]',
    glowColor: 'rgba(139, 92, 246, 0.16)',
    secondaryGlow: 'rgba(244, 63, 94, 0.12)',
  },
  sparkles: {
    symbols: ['✨', '✧', '💖', '🌸', '⋆'],
    color: 'text-rose-300 drop-shadow-[0_0_8px_rgba(253,164,175,0.6)]',
    glowColor: 'rgba(244, 63, 94, 0.15)',
    secondaryGlow: 'rgba(168, 85, 247, 0.13)',
  },
};

export const FloatingHearts: React.FC<{ count?: number; effect?: ParticleEffectId }> = ({
  count = 24,
  effect = 'petals',
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const durationSec = 7 + (i % 6) * 1.4;
      const delaySec = -((i * 1.3) % durationSec);
      const swayPx = (i % 2 === 0 ? 1 : -1) * (25 + (i % 4) * 15);
      return {
        id: i,
        left: `${((i * (100 / count) + (i * 7) % 9) % 98).toFixed(1)}%`,
        delay: `${delaySec.toFixed(1)}s`,
        duration: `${durationSec.toFixed(1)}s`,
        size: `${14 + (i % 4) * 5}px`,
        opacity: 0.35 + (i % 4) * 0.15,
        sway: `${swayPx}px`,
      };
    });
  }, [count]);

  if (effect === 'none') return null;
  const cfg = EFFECT_CONFIG[effect] || EFFECT_CONFIG.petals;

  return (
    <div
      data-particle-effect={effect}
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      <style>{`
        @keyframes lovelinkFallPetal {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          12% {
            opacity: var(--particle-opacity, 0.65);
          }
          50% {
            transform: translate3d(var(--particle-sway, 35px), 50vh, 0) rotate(180deg) scale(1.08);
          }
          88% {
            opacity: var(--particle-opacity, 0.65);
          }
          100% {
            transform: translate3d(calc(var(--particle-sway, 35px) * -0.6), 110vh, 0) rotate(360deg) scale(0.9);
            opacity: 0;
          }
        }
        @keyframes lovelinkAuroraPulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.85; }
          50% { transform: scale(1.12) translate(15px, -15px); opacity: 1; }
        }
      `}</style>

      {/* Ambient Romantic Aurora Backdrop Glows */}
      <div
        data-ambient-aurora="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 18% 25%, ${cfg.glowColor} 0%, transparent 45%),
            radial-gradient(circle at 82% 30%, ${cfg.secondaryGlow} 0%, transparent 45%),
            radial-gradient(circle at 50% 80%, ${cfg.glowColor} 0%, transparent 50%)
          `,
          animation: 'lovelinkAuroraPulse 8s ease-in-out infinite',
        }}
      />

      {/* Falling Flowers / Petals / Romantic Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={`lovelink-falling-particle absolute select-none ${cfg.color}`}
          style={
            {
              left: p.left,
              top: '-4%',
              fontSize: p.size,
              '--particle-opacity': p.opacity,
              '--particle-sway': p.sway,
              animation: `lovelinkFallPetal ${p.duration} ease-in-out ${p.delay} infinite`,
            } as React.CSSProperties
          }
        >
          {cfg.symbols[p.id % cfg.symbols.length]}
        </span>
      ))}
    </div>
  );
};
