import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export const LoveLinkAudio: React.FC<{
  preset?: string;
  autoStartOnInteraction?: boolean;
}> = ({ preset = 'gentle-chimes', autoStartOnInteraction = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopMusic = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const playMusic = () => {
    if (preset === 'none') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Romantic music box notes (pentatonic romantic scale: C, E, G, A, B, C5, E5)
      const freqs = [261.63, 329.63, 392.0, 440.0, 493.88, 523.25, 659.25, 783.99];
      let step = 0;

      const playNote = () => {
        if (!ctx || ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Music box bell tone
        osc.type = 'sine';
        const noteIdx = ((step % freqs.length) + (Math.floor(step / 3) % 3)) % freqs.length;
        const targetFreq = freqs[noteIdx] ?? 261.63;
        osc.frequency.setValueAtTime(targetFreq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.3);
        step++;
      };

      playNote();
      timerRef.current = window.setInterval(playNote, 600);
      setIsPlaying(true);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    if (autoStartOnInteraction && preset !== 'none') {
      playMusic();
    }
    return () => stopMusic();
  }, [autoStartOnInteraction, preset]);

  if (preset === 'none') return null;

  return (
    <button
      onClick={() => (isPlaying ? stopMusic() : playMusic())}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all cursor-pointer backdrop-blur-xs"
      title={isPlaying ? 'Mute ambient melody' : 'Play romantic melody'}
    >
      <Music className="w-3.5 h-3.5 text-rose-400" />
      <span>{isPlaying ? 'Music On' : 'Play Music'}</span>
      {isPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-400" />}
    </button>
  );
};
