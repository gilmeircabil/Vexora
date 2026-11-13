import React, { useState } from 'react';
import { Heart, Sparkles, MailOpen, Lock } from 'lucide-react';
import { LetterPaper } from './LetterPaper.js';
import { FloatingHearts } from './FloatingHearts.js';
import { LoveLinkAudio } from './AudioPlayer.js';
import { LETTER_TEMPLATES, type PublicLetter } from '../../services/loveLinkService.js';

interface EnvelopeExperienceProps {
  letter: PublicLetter;
  onOpen?: () => void;
}

export const EnvelopeExperience: React.FC<EnvelopeExperienceProps> = ({ letter, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const template = LETTER_TEMPLATES.find((t) => t.id === letter.template) || LETTER_TEMPLATES[0]!;

  const handleOpen = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      onOpen?.();
    }, 700);
  };

  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center p-4 sm:p-6 w-full">
      <FloatingHearts count={isOpen ? 18 : 8} />

      {/* Top Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LoveLinkAudio
          preset={letter.customization?.musicPreset || 'gentle-chimes'}
          autoStartOnInteraction={isOpen}
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
                <Heart className="w-7 h-7 fill-white stroke-rose-600" />
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
        <div className="relative z-10 w-full animate-fadeIn py-6 flex flex-col items-center">
          <div className="mb-6 text-center">
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
        </div>
      )}
    </div>
  );
};
