import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Heart, Lock, KeyRound, Sparkles, Clock, Calendar, AlertCircle } from 'lucide-react';
import { EnvelopeExperience } from '../../components/lovelink/EnvelopeExperience.js';
import { FloatingHearts } from '../../components/lovelink/FloatingHearts.js';
import { loveLinkApi, type PublicLetter } from '../../services/loveLinkService.js';

export const LoveLinkRecipientPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [letter, setLetter] = useState<PublicLetter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Password Unlock State
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!token) return;
    loveLinkApi
      .getPublicLetter(token)
      .then((data) => {
        setLetter(data);
      })
      .catch((err: any) => {
        if (err.message === 'EXPIRED') {
          setErrorStatus('EXPIRED');
        } else {
          setErrorStatus('NOT_FOUND');
        }
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !passwordInput.trim()) return;

    setIsVerifying(true);
    setPasswordError(null);
    try {
      const unlocked = await loveLinkApi.verifyPassword(token, passwordInput.trim());
      setLetter(unlocked);
    } catch (err: any) {
      setPasswordError(err.message || 'Incorrect password. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEnvelopeOpen = () => {
    if (token) {
      loveLinkApi.recordOpen(token);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-canvas)] flex flex-col items-center justify-center p-4">
        <Heart className="w-10 h-10 text-rose-500 animate-pulse mb-3" />
        <p className="text-xs font-mono text-[var(--theme-gray-muted)] uppercase tracking-wider">
          Retrieving your love note...
        </p>
      </div>
    );
  }

  if (errorStatus === 'EXPIRED') {
    return (
      <div className="min-h-screen bg-[var(--theme-canvas)] flex flex-col items-center justify-center p-4 text-center">
        <Clock className="w-12 h-12 text-amber-400 mb-3" />
        <h2 className="text-2xl font-bold text-[var(--theme-dirty-white)] mb-2">Letter Has Expired</h2>
        <p className="text-sm text-[var(--theme-gray-muted)] max-w-sm mb-6">
          This digital letter reached its expiration date and is no longer available to read.
        </p>
        <Link
          to="/lovelink"
          className="px-5 py-2 rounded-full text-xs font-bold bg-rose-500 text-white"
        >
          Explore LoveLink
        </Link>
      </div>
    );
  }

  if (errorStatus === 'NOT_FOUND' || !letter) {
    return (
      <div className="min-h-screen bg-[var(--theme-canvas)] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
        <h2 className="text-2xl font-bold text-[var(--theme-dirty-white)] mb-2">Letter Unavailable</h2>
        <p className="text-sm text-[var(--theme-gray-muted)] max-w-sm mb-6">
          This letter may have been revoked by the sender or the link is invalid.
        </p>
        <Link
          to="/lovelink"
          className="px-5 py-2 rounded-full text-xs font-bold bg-rose-500 text-white"
        >
          Explore LoveLink
        </Link>
      </div>
    );
  }

  // Scheduled Reveal Guard
  if (letter.isScheduled && letter.scheduledRevealAt) {
    const revealDate = new Date(letter.scheduledRevealAt);
    return (
      <div className="min-h-screen bg-[var(--theme-canvas)] flex flex-col items-center justify-center p-4 text-center relative">
        <FloatingHearts count={8} />
        <div className="relative z-10 max-w-md p-8 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--theme-dirty-white)]">
            A Surprise Awaits, {letter.recipientName}!
          </h2>
          <p className="text-sm text-[var(--theme-gray-muted)] leading-relaxed">
            Someone has prepared a heartfelt message for you, but it is scheduled to be revealed on:
          </p>
          <div className="p-3 rounded-2xl bg-[var(--theme-canvas)] border border-purple-500/30 font-mono text-sm text-purple-300 font-bold">
            {revealDate.toLocaleString(undefined, {
              dateStyle: 'full',
              timeStyle: 'short',
            })}
          </div>
          <p className="text-xs text-[var(--theme-gray-muted)]">
            Check back when the countdown arrives!
          </p>
        </div>
      </div>
    );
  }

  // Password Unlock Guard
  if (letter.isLocked && letter.isPasswordProtected) {
    return (
      <div className="min-h-screen bg-[var(--theme-canvas)] flex flex-col items-center justify-center p-4 text-center relative">
        <FloatingHearts count={8} />
        <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] shadow-2xl space-y-5">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[var(--theme-dirty-white)]">
              Secret Letter for {letter.recipientName}
            </h2>
            <p className="text-xs text-[var(--theme-gray-muted)] mt-1">
              This message is password-protected. Enter the secret code to unlock.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                Enter Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-[var(--theme-gray-muted)]" />
                <input
                  type="password"
                  placeholder="Secret code..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-xs text-rose-400 font-medium">{passwordError}</p>
            )}

            <button
              type="submit"
              disabled={isVerifying || !passwordInput.trim()}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? 'Unlocking...' : 'Unlock Letter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Envelope Experience (Interactive Opening + Reading)
  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] flex flex-col justify-between">
      <main className="flex-1 flex items-center justify-center">
        <EnvelopeExperience letter={letter} onOpen={handleEnvelopeOpen} />
      </main>

      {/* Powered by Vexora LoveLink footer */}
      <footer className="py-6 text-center text-xs text-[var(--theme-gray-muted)] border-t border-[var(--theme-gray-border)]/50">
        <div className="flex items-center justify-center gap-1.5">
          <span>Sent with</span>
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" />
          <span>via</span>
          <Link to="/lovelink" className="font-bold text-rose-400 hover:underline">
            LoveLink on VexoraMods
          </Link>
        </div>
      </footer>
    </div>
  );
};
