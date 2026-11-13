import React from 'react';
import { Link } from 'react-router';
import {
  ShieldCheck,
  HardDrive,
  EyeOff,
  Lock,
  Bot,
  Compass,
  Database,
  Scale,
  FileCode,
} from 'lucide-react';
import { TOOL_CATALOG } from '../tools/catalog.js';

const PRIVACY_SECTIONS = [
  {
    num: '01',
    icon: HardDrive,
    title: 'Client-Side Web Tools (RAM-Only Execution)',
    badge: `${TOOL_CATALOG.length}+ Utilities`,
    points: [
      'Standard PDF, Image, Text, Developer, and Calculator tools run 100% locally inside your browser tab.',
      'Files dropped into tools are parsed directly in device RAM via HTML5 Canvas, WebAssembly, pdf-lib, and File/Blob APIs.',
      'Generated outputs use temporary object URLs that are revoked immediately after download.',
      'Zero file bytes, document contents, or filenames are uploaded to VexoraMods servers.',
    ],
  },
  {
    num: '02',
    icon: Bot,
    title: 'Vexora AI Chat & Neural Utilities',
    badge: '12-Day Rolling Window',
    points: [
      'Guest users can draft prompts in Vexora AI Chat locally without creating an account.',
      'Signed-in users get automatic cloud session persistence with a strict 12-day rolling retention window.',
      'AI image utilities (Background Remover, Object Remover, Photo Restoration, OCR) process payloads ephemerally to return your result and do not build training datasets from your files.',
      'You can permanently delete any individual AI conversation or clear your entire history in one click.',
    ],
  },
  {
    num: '03',
    icon: Database,
    title: 'Studio, Study Space & LoveLink Storage',
    badge: 'User-Controlled Sync',
    points: [
      'Canvas Studio saves your multi-page vector JSON models and layer history to your account so you can resume editing from any device.',
      'Student Study Space stores your flashcards, study tasks, notes, quizzes, GPA records, and timetables with full one-click JSON export and "DELETE ALL" purge controls.',
      'LoveLink digital letters are accessible only via their unique share token and optional recipient passcode.',
    ],
  },
  {
    num: '04',
    icon: Compass,
    title: 'Vexora Discover & Geolocation Privacy',
    badge: 'Explicit Opt-In Only',
    points: [
      'Vexora Discover never reads your location automatically on page load.',
      'Browser GPS coordinates (navigator.geolocation) are requested only when you explicitly click "Use My Location" to query nearby OpenStreetMap / Overpass places.',
      'Location coordinates are used solely for your active search request and are never stored in user profiles or sold to third parties.',
    ],
  },
  {
    num: '05',
    icon: EyeOff,
    title: 'Zero Ad-Tech, Telemetry, or Fingerprinting',
    badge: 'No Tracking Cookies',
    points: [
      'VexoraMods does not embed Google Analytics, Meta Pixels, behavioral trackers, or third-party advertising networks.',
      'Cryptographic tools (Password & UUID Generators) use window.crypto.getRandomValues() and never log generated secrets.',
      'Authentication endpoints use Cloudflare Turnstile strictly for non-invasive bot and brute-force protection.',
    ],
  },
  {
    num: '06',
    icon: Lock,
    title: 'Account Security & Your Right to Erase',
    badge: 'Full Data Ownership',
    points: [
      'Account passwords are salted and hashed with bcrypt; plaintext passwords are never stored or logged.',
      'Session authentication uses short-lived tokens paired with HTTP-only refresh cookies.',
      'You can export your Studio designs (PNG/SVG/PDF/JSON), export or purge all Study Space records, or delete your account at any time.',
    ],
  },
] as const;

export const PrivacyPage: React.FC = () => {
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
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--theme-yellow)] text-[var(--theme-canvas)] shadow-xs"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Verified Local-First Privacy Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--theme-dirty-white)]">
            Privacy Policy &amp; Data Architecture
          </h1>
          <p className="text-xs sm:text-sm text-[var(--theme-gray-muted)] leading-relaxed">
            How VexoraMods handles your files across our {TOOL_CATALOG.length}+ browser utilities,
            AI Chat, Vector Design Studio, UI Library, Student Study Space, Vexora Discover, and
            LoveLink—with zero ad trackers and complete transparency.
          </p>
        </div>

        {/* Quick Privacy Guarantees Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--theme-gray-border)]">
          {[
            { value: '0 Bytes', label: 'Uploaded in Standard Web Tools' },
            { value: '0 Trackers', label: 'No Ad Pixels or Analytics' },
            { value: '12 Days', label: 'AI Chat Cloud Retention' },
            { value: '100%', label: 'Exportable & Purgeable Data' },
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

      {/* 6-Card Privacy Breakdown Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRIVACY_SECTIONS.map((sec) => {
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
                        Section {sec.num}
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
            Looking for platform usage rules or open-source attributions?
          </h3>
          <p className="text-xs text-[var(--theme-gray-muted)]">
            Review our Terms of Use and full MIT open-source dependency licenses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/terms"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] text-xs font-bold text-[var(--theme-dirty-white)] transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-[var(--theme-yellow)]" />
            <span>Terms of Use</span>
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
