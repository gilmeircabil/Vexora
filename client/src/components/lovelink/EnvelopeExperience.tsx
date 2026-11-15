import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  MailOpen,
  Lock,
  Crown,
  Star,
  RotateCcw,
  Printer,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { LetterPaper } from './LetterPaper.js';
import { FloatingHearts } from './FloatingHearts.js';
import { LoveLinkAudio } from './AudioPlayer.js';
import {
  LETTER_TEMPLATES,
  REACTION_OPTIONS,
  loveLinkApi,
  type ParticleEffectId,
  type PublicLetter,
  type WaxSealId,
} from '../../services/loveLinkService.js';

interface EnvelopeExperienceProps {
  letter: PublicLetter;
  onOpen?: () => void;
}

const SEAL_ICONS: Record<WaxSealId, React.ComponentType<{ className?: string }>> = {
  heart: Heart,
  crown: Crown,
  star: Star,
  sparkle: Sparkles,
  lock: Lock,
};

export const EnvelopeExperience: React.FC<EnvelopeExperienceProps> = ({ letter, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [activeEffect, setActiveEffect] = useState<ParticleEffectId | undefined>(undefined);

  // Recipient Reaction & Reply state
  const [selectedReaction, setSelectedReaction] = useState<string>(
    letter.recipientReaction || '',
  );
  const [replyText, setReplyText] = useState<string>(letter.recipientReply || '');
  const [isSendingReaction, setIsSendingReaction] = useState(false);
  const [reactionSent, setReactionSent] = useState(Boolean(letter.recipientReaction || letter.recipientReply));

  const template = LETTER_TEMPLATES.find((t) => t.id === letter.template) || LETTER_TEMPLATES[0]!;
  const waxSeal: WaxSealId = letter.customization?.waxSeal || 'heart';
  const SealIcon = SEAL_ICONS[waxSeal] || Heart;

  const handleOpen = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      onOpen?.();
    }, 700);
  };

  const handleReplay = () => {
    setIsOpen(false);
    setIsOpening(false);
  };

  const handleSendReaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letter.publicToken || (!selectedReaction && !replyText.trim())) return;
    setIsSendingReaction(true);
    try {
      await loveLinkApi.submitReaction(letter.publicToken, {
        reaction: selectedReaction || undefined,
        reply: replyText.trim() || undefined,
      });
      setReactionSent(true);
    } catch {
      // Ignore error in preview or offline mode
    } finally {
      setIsSendingReaction(false);
    }
  };

  const effectiveParticle: ParticleEffectId =
    activeEffect ?? letter.customization?.particleEffect ?? 'petals';

  const cycleAtmosphere = () => {
    const order: ParticleEffectId[] = ['petals', 'hearts', 'butterflies', 'fireflies', 'stars', 'sparkles'];
    const idx = order.indexOf(effectiveParticle);
    setActiveEffect(order[(idx + 1) % order.length]);
  };

  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
      <FloatingHearts
        count={isOpen ? 28 : 16}
        effect={effectiveParticle}
      />

      {/* Top Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center justify-end gap-2">
        {isOpen && (
          <>
            <button
              type="button"
              onClick={cycleAtmosphere}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] transition-all cursor-pointer"
              title="Change falling flowers & background effect"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Atmosphere</span>
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] transition-all cursor-pointer"
              title="Seal envelope and replay opening animation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Seal &amp; Replay</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] transition-all cursor-pointer"
              title="Print or save letter as PDF keepsake"
            >
              <Printer className="w-3.5 h-3.5 text-rose-400" />
              <span>Save Keepsake</span>
            </button>
          </>
        )}
        <LoveLinkAudio
          preset={letter.customization?.musicPreset || 'gentle-chimes'}
          customMusicUrl={letter.customization?.customMusicUrl}
          customMusicTitle={letter.customization?.customMusicTitle}
          autoStartOnInteraction={isOpening || isOpen}
        />
      </div>

      {!isOpen ? (
        /* Sealed Envelope Screen */
        <div className="relative z-10 w-full max-w-md mx-auto text-center flex flex-col items-center">
          <div className="mb-6 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Special Delivery for You</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight">
              A Letter for {letter.recipientName}
            </h1>
            <p className="text-sm text-[var(--theme-gray-muted)]">
              Someone created a personalized love note just for you.
            </p>
          </div>

          {/* Envelope Graphic */}
          <div
            onClick={handleOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpen()}
            className={`group relative w-72 sm:w-80 h-48 sm:h-52 rounded-2xl shadow-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 active:scale-95 ${template.envelopeColor} border-2 flex items-center justify-center overflow-hidden`}
            aria-label="Click to open letter"
          >
            {/* Envelope Flap Accent */}
            <div
              className={`absolute top-0 left-0 right-0 h-24 border-b-2 border-black/20 bg-white/10 transition-transform origin-top duration-700 ${
                isOpening ? '-scale-y-100 opacity-80' : ''
              }`}
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />

            {/* Wax Seal Centerpiece */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-rose-400 transform transition-transform duration-300 group-hover:scale-110 ${
                  isOpening ? 'scale-125 rotate-45' : ''
                }`}
              >
                <SealIcon className="w-7 h-7 fill-white stroke-rose-600" />
              </div>
              <span className="mt-2 text-xs font-bold uppercase tracking-wider text-white drop-shadow-md">
                For {letter.recipientName}
              </span>
            </div>
          </div>

          {/* Open Button */}
          <button
            onClick={handleOpen}
            className="mt-8 px-6 py-3 rounded-full text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <MailOpen className="w-4 h-4" />
            <span>Open Your Letter</span>
          </button>
        </div>
      ) : (
        /* Revealed Letter Content */
        <div className="relative z-10 w-full animate-fadeIn py-10 flex flex-col items-center space-y-8">
          <div className="text-center">
            <span className="text-xs uppercase font-mono tracking-widest text-rose-400">
              Personalized Love Message
            </span>
          </div>

          <LetterPaper
            recipientName={letter.recipientName}
            senderName={letter.senderName}
            isAnonymous={letter.isAnonymous}
            title={letter.title}
            message={letter.message || ''}
            template={letter.template}
            customization={letter.customization}
            attachments={letter.attachments}
            createdAt={letter.createdAt}
          />

          {/* Two-Way Recipient Reaction & Sweet Reply Card */}
          {letter.publicToken && letter.publicToken !== 'studio-preview' && (
            <form
              onSubmit={handleSendReaction}
              className="w-full max-w-xl p-5 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] shadow-xl space-y-4 text-center"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--theme-dirty-white)]">
                  Send a Reaction to {letter.isAnonymous ? 'Your Secret Admirer' : letter.senderName || 'the Sender'}
                </h4>
                <p className="text-xs text-[var(--theme-gray-muted)]">
                  Let them know how this letter made you feel
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {REACTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedReaction(opt.id);
                      setReactionSent(false);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedReaction === opt.id
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-105'
                        : 'bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] hover:border-rose-500/50'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  maxLength={500}
                  placeholder="Write a sweet note back (optional)..."
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    setReactionSent(false);
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSendingReaction || (!selectedReaction && !replyText.trim())}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {reactionSent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Response Sent</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingReaction ? 'Sending...' : 'Send Response'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
