import React from 'react';
import { Heart, Sparkles, Crown, Star, Lock, Image as ImageIcon, Music } from 'lucide-react';
import {
  LETTER_TEMPLATES,
  type LetterCustomization,
  type PaperLayoutId,
  type WaxSealId,
} from '../../services/loveLinkService.js';
import { parseSongEmbed } from './AudioPlayer.js';

interface LetterPaperProps {
  recipientName: string;
  senderName: string;
  isAnonymous?: boolean;
  title?: string;
  message: string;
  template?: string;
  customization?: LetterCustomization;
  attachments?: string[];
  createdAt?: string;
}

const SEAL_ICONS: Record<WaxSealId, React.ComponentType<{ className?: string }>> = {
  heart: Heart,
  crown: Crown,
  star: Star,
  sparkle: Sparkles,
  lock: Lock,
};

const LAYOUT_STYLES: Record<
  PaperLayoutId,
  { wrapper: string; headingText: string; subText: string; divider: string; bgStyle?: React.CSSProperties }
> = {
  classic: {
    wrapper: '',
    headingText: 'text-rose-950',
    subText: 'text-rose-900/90',
    divider: 'border-black/10',
    bgStyle: {
      backgroundImage:
        'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255,240,245,0.3) 0%, transparent 20%)',
    },
  },
  'ornate-frame': {
    wrapper: 'ring-4 ring-inset ring-rose-900/20 outline outline-1 outline-offset-[-12px] outline-rose-800/30',
    headingText: 'text-rose-950',
    subText: 'text-rose-900/90',
    divider: 'border-rose-900/20',
  },
  'polaroid-postcard': {
    wrapper: 'border-4 border-dashed border-rose-400/60 shadow-xl',
    headingText: 'text-rose-950',
    subText: 'text-rose-900/90',
    divider: 'border-rose-300/50',
  },
  'midnight-velvet': {
    wrapper: '!bg-slate-950 !text-rose-100 !border-rose-500/40 shadow-rose-950/60 ring-1 ring-rose-400/20',
    headingText: 'text-rose-200',
    subText: 'text-rose-300/90',
    divider: 'border-rose-500/20',
    bgStyle: {
      backgroundImage:
        'radial-gradient(circle at 15% 15%, rgba(244,63,94,0.12) 0%, transparent 35%), radial-gradient(circle at 85% 85%, rgba(168,85,247,0.12) 0%, transparent 35%)',
    },
  },
  'lined-notebook': {
    wrapper: 'border-l-4 border-l-rose-400',
    headingText: 'text-rose-950',
    subText: 'text-rose-900/90',
    divider: 'border-black/10',
    bgStyle: {
      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(244,63,94,0.14) 31px, rgba(244,63,94,0.14) 32px)',
    },
  },
  'royal-gold': {
    wrapper: '!bg-amber-50/95 !text-amber-950 !border-amber-400 ring-2 ring-inset ring-amber-500/40 shadow-amber-500/20',
    headingText: 'text-amber-950',
    subText: 'text-amber-900/90',
    divider: 'border-amber-500/25',
  },
};

export const LetterPaper: React.FC<LetterPaperProps> = ({
  recipientName,
  senderName,
  isAnonymous = false,
  title,
  message,
  template = 'classic',
  customization = {},
  attachments = [],
  createdAt,
}) => {
  const currentTemplate = LETTER_TEMPLATES.find((t) => t.id === template) || LETTER_TEMPLATES[0]!;
  const alignment = customization?.alignment || 'center';
  const paperLayout: PaperLayoutId = customization?.paperLayout || 'classic';
  const layoutCfg = LAYOUT_STYLES[paperLayout] || LAYOUT_STYLES.classic;
  const salutation = customization?.salutation?.trim() || 'Dearest';
  const signOff = customization?.signOff?.trim() || 'With all my love,';
  const photoStyle = customization?.photoStyle || 'grid';
  const waxSeal: WaxSealId = customization?.waxSeal || 'sparkle';
  const SealIcon = SEAL_ICONS[waxSeal] || Sparkles;

  const alignClass =
    alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';

  const fontStyle =
    customization?.font === 'script'
      ? 'italic font-serif tracking-wide'
      : customization?.font === 'handwriting'
        ? 'font-serif tracking-normal'
        : customization?.font === 'sans'
          ? 'font-sans'
          : 'font-serif';

  const songEmbed =
    customization?.musicPreset === 'custom'
      ? parseSongEmbed(customization?.customMusicUrl)
      : { type: 'none' as const };

  return (
    <div
      data-paper-layout={paperLayout}
      className={`relative w-full max-w-2xl mx-auto p-6 sm:p-10 md:p-12 rounded-3xl border shadow-2xl transition-all ${currentTemplate.paperStyle} ${layoutCfg.wrapper}`}
      style={layoutCfg.bgStyle}
    >
      {/* Decorative header ribbon/corner */}
      <div className={`flex items-center justify-between pb-6 border-b ${layoutCfg.divider}`}>
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span className="text-xs uppercase tracking-widest font-mono opacity-60">
            {paperLayout === 'polaroid-postcard' ? 'Special Air Mail Postcard' : 'LoveLink Note'}
          </span>
        </div>
        {createdAt && (
          <span className="text-xs font-mono opacity-50">
            {new Date(createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      {/* Embedded Song Player (Spotify / YouTube) */}
      {(songEmbed.type === 'spotify' || songEmbed.type === 'youtube') && songEmbed.embedUrl && (
        <div className={`my-5 p-3 rounded-2xl border ${layoutCfg.divider} bg-black/5`}>
          <div className="flex items-center gap-1.5 text-xs font-semibold mb-2 opacity-80">
            <Music className="w-3.5 h-3.5 text-rose-500" />
            <span>{customization?.customMusicTitle || 'Dedicated Song for You'}</span>
          </div>
          <iframe
            src={songEmbed.embedUrl}
            title={customization?.customMusicTitle || 'Dedicated Song'}
            className="w-full rounded-xl border-0"
            height={songEmbed.type === 'spotify' ? 80 : 180}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}

      {/* Salutation */}
      <div className="mt-8 mb-4">
        <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${layoutCfg.headingText} ${fontStyle}`}>
          {salutation} {recipientName || 'Someone Special'},
        </h3>
      </div>

      {/* Title */}
      {title && (
        <h4 className={`text-lg sm:text-xl font-semibold mb-6 ${layoutCfg.subText} italic ${alignClass}`}>
          "{title}"
        </h4>
      )}

      {/* Message Body */}
      <div
        className={`text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words opacity-90 my-6 ${fontStyle} ${alignClass}`}
      >
        {message || 'Your beautiful words will appear here...'}
      </div>

      {/* Attached Photos Gallery */}
      {attachments && attachments.length > 0 && (
        <div
          data-photo-style={photoStyle}
          className={`my-8 pt-4 border-t ${layoutCfg.divider}`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold mb-3 opacity-70">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Cherished Memories</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {attachments.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  photoStyle === 'polaroid'
                    ? `group relative block bg-white p-2 pb-6 rounded-lg shadow-lg border border-stone-200 hover:scale-105 transition-transform ${
                        idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
                      }`
                    : 'group relative block aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white/80 hover:scale-[1.02] transition-transform'
                }
              >
                <div className="aspect-square overflow-hidden rounded-md">
                  <img
                    src={url}
                    alt={`Memory ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {photoStyle === 'polaroid' && (
                  <span className="block text-center text-[10px] font-serif italic text-stone-500 mt-1.5">
                    Memory #{idx + 1}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sign-off & Signature */}
      <div
        className={`mt-10 pt-6 border-t ${layoutCfg.divider} flex flex-col ${
          alignment === 'left' ? 'items-start' : alignment === 'right' ? 'items-end' : 'items-center'
        }`}
      >
        <p className="text-sm italic opacity-70 mb-1">{signOff}</p>
        <p className={`text-lg sm:text-xl font-bold ${layoutCfg.headingText} ${fontStyle}`}>
          {isAnonymous ? 'Your Secret Admirer' : senderName || 'Yours Forever'}
        </p>
      </div>

      {/* Subtle bottom wax seal symbol */}
      <div className="mt-6 flex justify-center">
        <div className="w-9 h-9 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-md border border-rose-400">
          <SealIcon className="w-4 h-4 fill-white" />
        </div>
      </div>
    </div>
  );
};
