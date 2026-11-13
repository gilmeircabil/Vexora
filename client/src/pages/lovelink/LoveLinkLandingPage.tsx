import React from 'react';
import { Link } from 'react-router';
import { Heart, Sparkles, Send, ShieldCheck, QrCode, MailOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { FloatingHearts } from '../../components/lovelink/FloatingHearts.js';
import { LETTER_TEMPLATES } from '../../services/loveLinkService.js';

export const LoveLinkLandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-[90vh] bg-[var(--theme-canvas)] overflow-hidden">
      <FloatingHearts count={14} />

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 mb-8 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>VexoraMods LoveLink — Digital Romance Experience</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight leading-tight max-w-3xl mx-auto">
          Every message deserves a{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300">
            special moment.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-[var(--theme-gray-muted)] max-w-2xl mx-auto leading-relaxed">
          Create a personalized letter, share a little love, and surprise someone special with an interactive sealed envelope reveal.
        </p>

        {/* Envelope Visual Showcase */}
        <div className="my-10 flex justify-center">
          <div className="relative w-64 sm:w-72 h-40 sm:h-44 rounded-2xl bg-gradient-to-b from-rose-800 to-rose-950 border-2 border-rose-600/50 shadow-2xl shadow-rose-900/30 flex items-center justify-center transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border border-rose-300">
              <Heart className="w-6 h-6 fill-white stroke-rose-500 animate-pulse" />
            </div>
            <div className="absolute bottom-3 text-[11px] font-mono tracking-widest uppercase text-rose-200/80">
              Sealed with Love
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/lovelink/create"
            className="px-6 py-3.5 rounded-full text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Create Your Letter</span>
          </Link>

          <a
            href="#templates"
            className="px-6 py-3.5 rounded-full text-sm font-semibold bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] transition-all"
          >
            Explore Templates
          </a>

          {isAuthenticated && (
            <Link
              to="/lovelink/my-letters"
              className="px-6 py-3.5 rounded-full text-sm font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 border border-rose-900/50 transition-all flex items-center gap-2"
            >
              <span>My Letters</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-[var(--theme-gray-border)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <MailOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--theme-dirty-white)]">
              Interactive Envelope Reveal
            </h3>
            <p className="text-sm text-[var(--theme-gray-muted)] leading-relaxed">
              Recipients open an animated wax-sealed envelope with floating particles and soft melody, without needing an account.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--theme-dirty-white)]">
              One-Click Link & QR Code
            </h3>
            <p className="text-sm text-[var(--theme-gray-muted)] leading-relaxed">
              Publish with an unpredictable secure token and instant high-resolution QR code ready to print or message.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--theme-dirty-white)]">
              Privacy, Passwords & Timing
            </h3>
            <p className="text-sm text-[var(--theme-gray-muted)] leading-relaxed">
              Lock letters with bcrypt passwords, schedule future surprise reveals, set expiration dates, or revoke anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Templates Showcase Section */}
      <section id="templates" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-[var(--theme-gray-border)]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--theme-dirty-white)]">
            Romantic Letter Templates
          </h2>
          <p className="mt-2 text-sm text-[var(--theme-gray-muted)]">
            Choose from 8 curated themes crafted for love, friendship, milestones, and heartfelt confessions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LETTER_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] hover:border-rose-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                    {tmpl.badge}
                  </span>
                  <div className={`w-4 h-4 rounded-full ${tmpl.envelopeColor}`} />
                </div>
                <h4 className="text-sm font-bold text-[var(--theme-dirty-white)] mb-1">
                  {tmpl.name}
                </h4>
                <p className="text-xs text-[var(--theme-gray-muted)] leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <Link
                to={`/lovelink/create?template=${tmpl.id}`}
                className="mt-4 pt-3 border-t border-[var(--theme-gray-border)] text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center justify-between"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
