import React from 'react';
import { Link } from 'react-router';
import {
  Scale,
  HeartHandshake,
  ShieldAlert,
  FileText,
  Cpu,
  Users,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { TOOL_CATALOG } from '../tools/catalog.js';

const TERMS_SECTIONS = [
  {
    num: '01',
    icon: HeartHandshake,
    title: 'Public Web Tools vs. Authenticated Workspaces',
    badge: 'Zero Paywalls',
    points: [
      `All ${TOOL_CATALOG.length}+ Web Tools (/tools) and the How It Works guide (/how-it-works) are 100% free and accessible without logging in or registering.`,
      'Creating a free VexoraMods account unlocks our 8 interactive workspaces: AI Chat, Canvas Studio, UI Library, Learning Hub, Student Study Space, Discover, Community, and LoveLink.',
      'There are no paid subscriptions, hidden tiers, or watermarked exports anywhere on the platform.',
    ],
  },
  {
    num: '02',
    icon: FileText,
    title: 'Your Intellectual Property & Content Ownership',
    badge: '100% Yours',
    points: [
      'You retain full ownership and commercial rights to every image, PDF, vector artwork, code snippet, and study deck you create or process on VexoraMods.',
      'UI components and layouts copied from the VexoraMods UI Library may be used freely in personal, academic, or commercial projects.',
      'VexoraMods claims zero ownership over your private Studio canvases, Study Space notes, or LoveLink digital letters.',
    ],
  },
  {
    num: '03',
    icon: Users,
    title: 'Learning Hub, Community & LoveLink Standards',
    badge: 'Community Rules',
    points: [
      'When publishing tutorials or guides in the Learning Hub, you grant VexoraMods a non-exclusive license to display your post to the community while retaining authorship.',
      'Public platform ratings and reviews go through moderation to keep feedback authentic and spam-free.',
      'LoveLink digital letters must not be used to send harassment, phishing links, or unlawful content.',
    ],
  },
  {
    num: '04',
    icon: Cpu,
    title: 'AI Chat & Neural Utilities Usage',
    badge: 'Assistive AI',
    points: [
      'Vexora AI Chat, AI Code Explainer, Document Summarizer, Writing Assistant, OCR, and AI image tools are provided to accelerate your workflow.',
      'AI-generated responses and code explanations may occasionally contain inaccuracies; always review critical code, academic citations, and documents before publishing.',
      'Do not use AI endpoints for automated bulk scraping or unlawful content generation.',
    ],
  },
  {
    num: '05',
    icon: ShieldAlert,
    title: 'Acceptable Use & Platform Security',
    badge: 'Fair Use',
    points: [
      'Do not attempt to bypass rate limiters, authentication checks, Cloudflare Turnstile verification, or maintenance locks.',
      'Do not upload or distribute malware, exploit payloads, or automated denial-of-service traffic.',
      'Accounts engaging in abusive behavior or security probing may be suspended by platform administrators.',
    ],
  },
  {
    num: '06',
    icon: Scale,
    title: 'MIT Open-Source Disclaimer & Liability',
    badge: 'Provided "AS IS"',
    points: [
      'VexoraMods is open-source software licensed under the MIT License and provided "AS IS" without warranty of any kind, express or implied.',
      'In no event shall the authors, maintainers, or contributors be liable for any direct or indirect damages arising from the use of the platform.',
      'Always keep local backups of critical academic, creative, or production files.',
    ],
  },
] as const;

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 text-[var(--theme-dirty-white)]">
      {/* Top Legal Switcher Bar */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <nav
          aria-label="Legal Information Navigation"
          data-testid="legal-nav-tabs"
          className="inline-flex items-center gap-1.5 p-1 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-gray-border)]"
        >
          <Link
            to="/privacy"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--theme-yellow)] text-[var(--theme-canvas)] shadow-xs"
          >
            Terms of Use
          </Link>
          <Link
            to="/licenses"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
          >
            Licenses
          </Link>
        </nav>
      </div>

      {/* Hero Banner */}
      <section className="rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] p-8 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-yellow)] text-xs font-mono font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Open Platform Governance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--theme-dirty-white)]">
            Terms of Use &amp; Platform Agreement
          </h1>
          <p className="text-xs sm:text-sm text-[var(--theme-gray-muted)] leading-relaxed">
            Clear, human-readable terms governing your access to VexoraMods&apos; free browser tools,
            AI Chat, Vector Design Studio, UI Library, Learning Hub, Student Study Space, Vexora
            Discover, Community, and LoveLink.
          </p>
        </div>

        {/* Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--theme-gray-border)]">
          {[
            { value: '100% Free', label: 'No Subscriptions or Paywalls' },
            { value: 'Open Tools', label: 'No Login Required for Web Tools' },
            { value: 'Your IP', label: 'Full Ownership of Your Exports' },
            { value: 'MIT Licensed', label: 'Open-Source Codebase' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3.5 rounded-2xl bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)]"
            >
              <div className="text-lg sm:text-xl font-black text-[var(--theme-yellow)]">
                {stat.value}
              </div>
              <div className="text-[11px] text-[var(--theme-gray-muted)] font-medium mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6-Card Terms Breakdown Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TERMS_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.num}
              className="rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[var(--theme-yellow)] shrink-0">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--theme-gray-muted)] block">
                        Article {sec.num}
                      </span>
                      <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">
                        {sec.title}
                      </h2>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[10px] font-mono font-semibold text-[var(--theme-dirty-white)] shrink-0">
                    {sec.badge}
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-[var(--theme-gray-muted)] leading-relaxed">
                  {sec.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2">
                      <span className="text-[var(--theme-yellow)] font-bold mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom Cross-Links */}
      <section className="rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[var(--theme-dirty-white)]">
            Want to inspect our data privacy practices or software licenses?
          </h3>
          <p className="text-xs text-[var(--theme-gray-muted)]">
            Read our local-first Privacy Policy or browse all open-source package attributions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/privacy"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] text-xs font-bold text-[var(--theme-dirty-white)] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--theme-yellow)]" />
            <span>Privacy Policy</span>
          </Link>
          <Link
            to="/licenses"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] text-xs font-bold text-[var(--theme-dirty-white)] transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-[var(--theme-yellow)]" />
            <span>Open Source Licenses</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
