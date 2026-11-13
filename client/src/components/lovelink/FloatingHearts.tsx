import React, { useMemo } from 'react';

export const FloatingHearts: React.FC<{ count?: number }> = ({ count = 12 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${(i * (100 / count) + Math.random() * 5).toFixed(1)}%`,
      delay: `${(Math.random() * 4).toFixed(1)}s`,
      duration: `${(5 + Math.random() * 5).toFixed(1)}s`,
      size: `${12 + (i % 3) * 6}px`,
      opacity: 0.2 + (i % 4) * 0.15,
    }));
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
      <style>{`
        @keyframes floatHeart {
          0% { transform: translateY(105vh) scale(0.8) rotate(0deg); opacity: 0; }
          15% { opacity: var(--heart-opacity, 0.4); }
          50% { transform: translateY(50vh) scale(1.1) rotate(15deg); }
          85% { opacity: var(--heart-opacity, 0.4); }
          100% { transform: translateY(-10vh) scale(0.9) rotate(-15deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .floating-heart { display: none !important; }
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.id}
          className="floating-heart absolute select-none text-rose-400"
          style={
            {
              left: p.left,
              bottom: '-20px',
              fontSize: p.size,
              '--heart-opacity': p.opacity,
              animation: `floatHeart ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            } as React.CSSProperties
          }
        >
          {p.id % 2 === 0 ? '♥' : '♡'}
        </span>
      ))}
    </div>
  );
};
