import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export function parseSongEmbed(url?: string): {
  type: 'spotify' | 'youtube' | 'audio' | 'none';
  embedUrl?: string;
  audioUrl?: string;
} {
  if (!url?.trim()) return { type: 'none' };
  const raw = url.trim();

  const spotifyMatch = raw.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    return {
      type: 'spotify',
      embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator`,
    };
  }

  const ytMatch = raw.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/,
  );
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`,
    };
  }

  return { type: 'audio', audioUrl: raw };
}

const MELODY_PRESETS: Record<
  string,
  { freqs: number[]; wave: OscillatorType; intervalMs: number; releaseSec: number; peakGain: number }
> = {
  'gentle-chimes': {
    freqs: [261.63, 329.63, 392.0, 440.0, 493.88, 523.25, 659.25, 783.99],
    wave: 'sine',
    intervalMs: 600,
    releaseSec: 1.2,
    peakGain: 0.08,
  },
  'musicbox-lullaby': {
    freqs: [523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25],
    wave: 'sine',
    intervalMs: 460,
    releaseSec: 0.9,
    peakGain: 0.06,
  },
  'romantic-piano': {
    freqs: [220.0, 261.63, 329.63, 349.23, 293.66, 392.0, 329.63, 261.63],
    wave: 'triangle',
    intervalMs: 720,
    releaseSec: 1.6,
    peakGain: 0.09,
  },
  'dreamy-harp': {
    freqs: [293.66, 369.99, 440.0, 554.37, 587.33, 739.99, 880.0, 587.33],
    wave: 'sine',
    intervalMs: 380,
    releaseSec: 1.4,
    peakGain: 0.07,
  },
};

export const LoveLinkAudio: React.FC<{
  preset?: string;
  customMusicUrl?: string;
  customMusicTitle?: string;
  autoStartOnInteraction?: boolean;
}> = ({
  preset = 'gentle-chimes',
  customMusicUrl,
  customMusicTitle,
  autoStartOnInteraction = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  const parsedCustom = parseSongEmbed(customMusicUrl);
  const isCustomAudio = preset === 'custom' && parsedCustom.type === 'audio' && parsedCustom.audioUrl;
  const isCustomEmbed =
    preset === 'custom' && (parsedCustom.type === 'spotify' || parsedCustom.type === 'youtube');

  const stopMusic = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const playMusic = () => {
    if (preset === 'none' || isCustomEmbed) return;

    if (isCustomAudio && parsedCustom.audioUrl) {
      try {
        if (!htmlAudioRef.current) {
          htmlAudioRef.current = new Audio(parsedCustom.audioUrl);
          htmlAudioRef.current.loop = true;
        } else if (htmlAudioRef.current.src !== parsedCustom.audioUrl) {
          htmlAudioRef.current.src = parsedCustom.audioUrl;
        }
        htmlAudioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      } catch {
        // Ignore audio playback errors
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const melody = MELODY_PRESETS[preset] || MELODY_PRESETS['gentle-chimes']!;
      let step = 0;

      const playNote = () => {
        if (!ctx || ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = melody.wave;
        const noteIdx =
          ((step % melody.freqs.length) + (Math.floor(step / 3) % 3)) % melody.freqs.length;
        const targetFreq = melody.freqs[noteIdx] ?? 261.63;
        osc.frequency.setValueAtTime(targetFreq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(melody.peakGain, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + melody.releaseSec);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + melody.releaseSec + 0.1);
        step++;
      };

      playNote();
      timerRef.current = window.setInterval(playNote, melody.intervalMs);
      setIsPlaying(true);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    stopMusic();
    if (autoStartOnInteraction && preset !== 'none' && !isCustomEmbed) {
      playMusic();
    }
    return () => stopMusic();
  }, [autoStartOnInteraction, preset, customMusicUrl]);

  if (preset === 'none' || isCustomEmbed) return null;

  return (
    <button
      type="button"
      onClick={() => (isPlaying ? stopMusic() : playMusic())}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all cursor-pointer backdrop-blur-xs"
      title={isPlaying ? 'Mute ambient melody' : 'Play romantic melody'}
    >
      <Music className="w-3.5 h-3.5 text-rose-400" />
      <span className="max-w-[140px] truncate">
        {isPlaying ? customMusicTitle || 'Music On' : customMusicTitle || 'Play Music'}
      </span>
      {isPlaying ? (
        <Volume2 className="w-3.5 h-3.5" />
      ) : (
        <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
      )}
    </button>
  );
};
