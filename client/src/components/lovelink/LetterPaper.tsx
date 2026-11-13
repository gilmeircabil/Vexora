import React from 'react';
import { Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { LETTER_TEMPLATES, type LetterCustomization } from '../../services/loveLinkService.js';

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

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto p-6 sm:p-10 md:p-12 rounded-3xl border shadow-2xl transition-all ${currentTemplate.paperStyle}`}
      style={{
        backgroundImage:
          'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255,240,245,0.3) 0%, transparent 20%)',
      }}
    >
      {/* Decorative header ribbon/corner */}
      <div className="flex items-center justify-between pb-6 border-b border-black/10">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span className="text-xs uppercase tracking-widest font-mono opacity-60">LoveLink Note</span>
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

      {/* Salutation */}
      <div className="mt-8 mb-4">
        <h3 className={`text-xl sm:text-2xl font-bold tracking-tight text-rose-950 ${fontStyle}`}>
          Dearest {recipientName || 'Someone Special'},
        </h3>
      </div>

      {/* Title */}
      {title && (
        <h4 className={`text-lg sm:text-xl font-semibold mb-6 text-rose-900/90 italic ${alignClass}`}>
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
        <div className="my-8 pt-4 border-t border-black/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold mb-3 opacity-70">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Cherished Memories</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {attachments.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white/80 hover:scale-[1.02] transition-transform"
              >
                <img
                  src={url}
                  alt={`Memory ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sign-off & Signature */}
      <div className={`mt-10 pt-6 border-t border-black/10 flex flex-col ${alignment === 'left' ? 'items-start' : alignment === 'right' ? 'items-end' : 'items-center'}`}>
        <p className="text-sm italic opacity-70 mb-1">With all my love,</p>
        <p className={`text-lg sm:text-xl font-bold text-rose-950 ${fontStyle}`}>
          {isAnonymous ? 'Your Secret Admirer' : senderName || 'Yours Forever'}
        </p>
      </div>

      {/* Subtle bottom wax seal symbol */}
      <div className="mt-6 flex justify-center">
        <div className="w-9 h-9 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-md border border-rose-400">
          <Sparkles className="w-4 h-4 fill-white" />
        </div>
      </div>
    </div>
  );
};
