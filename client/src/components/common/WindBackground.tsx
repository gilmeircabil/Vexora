import React from 'react';

interface GustConfig {
  id: number;
  top: number;
  width: number;
  height: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
}

const GUSTS: readonly GustConfig[] = [
  { id: 1, top: 8, width: 320, height: 2.5, duration: 7.5, delay: 0, opacity: 0.65, drift: 8 },
  { id: 2, top: 16, width: 220, height: 2, duration: 6, delay: 2.2, opacity: 0.55, drift: -6 },
  { id: 3, top: 25, width: 420, height: 3, duration: 9, delay: 4.1, opacity: 0.7, drift: 12 },
  { id: 4, top: 34, width: 260, height: 2, duration: 6.8, delay: 1, opacity: 0.55, drift: -8 },
  { id: 5, top: 44, width: 360, height: 2.5, duration: 8.2, delay: 3.4, opacity: 0.65, drift: 10 },
  { id: 6, top: 54, width: 460, height: 3, duration: 10, delay: 5.2, opacity: 0.75, drift: -10 },
  { id: 7, top: 63, width: 240, height: 2, duration: 6.5, delay: 1.8, opacity: 0.55, drift: 7 },
  { id: 8, top: 73, width: 380, height: 2.5, duration: 8.5, delay: 3.8, opacity: 0.65, drift: -9 },
  { id: 9, top: 82, width: 280, height: 2, duration: 7, delay: 0.5, opacity: 0.55, drift: 6 },
  { id: 10, top: 91, width: 400, height: 3, duration: 9.5, delay: 2.8, opacity: 0.7, drift: 11 },
  { id: 11, top: 96, width: 250, height: 2, duration: 6.2, delay: 4.8, opacity: 0.5, drift: -5 },
];

export const WindBackground: React.FC = () => (
  <div
    data-testid="wind-background"
    aria-hidden="true"
    className="wind-background fixed inset-0 pointer-events-none overflow-hidden z-0"
  >
    {GUSTS.map((g) => (
      <span
        key={g.id}
        className="wind-gust absolute rounded-full"
        style={
          {
            top: `${g.top}%`,
            left: 0,
            width: `${g.width}px`,
            height: `${g.height}px`,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(244, 244, 240, 0.25) 20%, rgba(244, 244, 240, 0.85) 75%, rgba(255, 255, 255, 0.95) 90%, transparent 100%)',
            boxShadow: '0 0 10px rgba(244, 244, 240, 0.45)',
            '--gust-duration': `${g.duration}s`,
            '--gust-delay': `${g.delay}s`,
            '--gust-opacity': g.opacity,
            '--gust-drift': `${g.drift}px`,
          } as React.CSSProperties
        }
      />
    ))}
  </div>
);
