import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Heart,
  Sparkles,
  MessageCircle,
  Mail,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';
import { loveLinkApi, type LoveLetter } from '../../services/loveLinkService.js';
import { FloatingHearts } from '../../components/lovelink/FloatingHearts.js';

export const LoveLinkSharePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [letter, setLetter] = useState<LoveLetter | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!id) return;
    loveLinkApi
      .getUserLetters()
      .then(({ letters }) => {
        const found = letters.find((l) => l._id === id);
        if (found) {
          setLetter(found);
          const origin = window.location.origin;
          const fullUrl = `${origin}/lovelink/open/${found.publicToken}`;
          QRCode.toDataURL(fullUrl, {
            width: 320,
            margin: 2,
            color: {
              dark: '#9f1239', // Rose 800
              light: '#ffffff',
            },
          })
            .then(setQrDataUrl)
            .catch(() => {});
        } else {
          showToast('Letter not found', 'error');
        }
      })
      .catch(() => showToast('Failed to load letter details', 'error'))
      .finally(() => setIsLoading(false));
  }, [id, showToast]);

  const publicUrl = letter?.publicToken
    ? `${window.location.origin}/lovelink/open/${letter.publicToken}`
    : '';

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setIsCopied(true);
      showToast('Public link copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      showToast('Could not copy link to clipboard', 'error');
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `LoveLink-${letter?.recipientName || 'letter'}-QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR code downloaded!', 'success');
  };

  const handleNativeShare = async () => {
    if (navigator.share && publicUrl) {
      try {
        await navigator.share({
          title: `A LoveLink for ${letter?.recipientName || 'You'}`,
          text: `You have a personalized sealed love letter waiting for you on LoveLink!`,
          url: publicUrl,
        });
      } catch {
        // Share cancelled or dismissed
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-sm font-mono text-[var(--theme-gray-muted)]">
        Loading share details...
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-[var(--theme-dirty-white)] mb-2">Letter Not Found</h2>
        <Link to="/lovelink" className="text-sm font-semibold text-rose-400 hover:underline">
          Return to LoveLink
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-[90vh] bg-[var(--theme-canvas)] py-12 px-4 sm:px-6">
      <FloatingHearts count={16} />

      <div className="relative z-10 max-w-2xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/lovelink/my-letters"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-gray-muted)] hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Letters</span>
          </Link>
        </div>

        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-rose-500/20 text-rose-400 mb-1 animate-bounce">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight">
            Your Letter is Ready!
          </h1>
          <p className="text-sm sm:text-base text-[var(--theme-gray-muted)] max-w-md mx-auto">
            A unique digital experience has been created for{' '}
            <strong className="text-rose-400">{letter.recipientName}</strong>. Share the link or QR
            code below.
          </p>
        </div>

        {/* QR Code Presentation Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-white border-4 border-rose-300 shadow-md">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${letter.recipientName}`}
                  className="w-52 h-52 sm:w-60 sm:h-60 rounded-lg object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center font-mono text-xs text-zinc-400">
                  Generating QR...
                </div>
              )}
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] font-mono outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownloadQr}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>Download QR</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Share Via Device</span>
              </button>
            )}

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I wrote a letter for you on LoveLink: ${publicUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`mailto:?subject=${encodeURIComponent(`A special message for you`)}&body=${encodeURIComponent(`Open your personalized letter here: ${publicUrl}`)}`}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email</span>
            </a>
          </div>

          {/* Preview Recipient Experience CTA */}
          <div className="pt-4 border-t border-[var(--theme-gray-border)]">
            <Link
              to={`/lovelink/open/${letter.publicToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline"
            >
              <span>Preview Recipient Experience (Opening Envelope)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
