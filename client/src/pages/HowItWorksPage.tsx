import React from 'react';
import { Link } from 'react-router';
import {
  Wrench,
  Cpu,
  Download,
  Sparkles,
  LayoutGrid,
  GraduationCap,
  Bot,
  Compass,
  Heart,
  ShieldCheck,
  WifiOff,
  Lock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { TOOL_CATALOG } from '../tools/catalog.js';

const STEPS = [
  {
    num: '01',
    icon: Wrench,
    title: 'Choose a Tool or Workspace',
    desc: `Browse ${TOOL_CATALOG.length}+ browser utilities, open the Vector Design Studio, launch Study Space, or explore 100+ UI components immediately—no mandatory account or credit card required.`,
  },
  {
    num: '02',
    icon: Cpu,
    title: 'Compute Locally on Your Device',
    desc: 'Standard utilities execute inside an isolated browser sandbox powered by WebAssembly, HTML5 Canvas, and WebGPU. Your sensitive PDFs, images, and code stay in local hardware memory.',
  },
  {
    num: '03',
    icon: Download,
    title: 'Export, Save, or Share Instantly',
    desc: 'Download high-resolution assets, merged PDFs, or production-ready React/HTML snippets with zero watermarks. Sign in optionally to sync AI chat sessions, study decks, or LoveLink letters.',
  },
] as const;

const WORKSPACES = [
  {
    title: 'Client-Side Web & AI Tools',
    badge: `${TOOL_CATALOG.length}+ Utilities`,
    icon: Wrench,
    to: '/tools',
    cta: 'Browse Tools',
    howItWorks:
      'Select any image, PDF, developer, text, or calculator tool. Files are parsed directly via FileReader and WebAssembly in your tab—zero server queuing and instant output.',
  },
  {
    title: 'Vexora AI Chat',
    badge: 'Conversational AI',
    icon: Bot,
    to: '/ai-chat',
    cta: 'Open AI Chat',
    howItWorks:
      'Chat with multi-model AI assistants for coding, writing, and brainstorming. Guest drafts work immediately, while signed-in accounts get 12-day cloud session persistence.',
  },
  {
    title: 'Vector Design Studio',
    badge: 'Multi-Page Canvas',
    icon: Sparkles,
    to: '/studio',
    cta: 'Launch Studio',
    howItWorks:
      'Create multi-page vector layouts, custom SVGs, typography, and layer hierarchies on an interactive canvas with version history and one-click PNG/SVG/PDF export.',
  },
  {
    title: 'UI Component Library',
    badge: '100+ Components',
    icon: LayoutGrid,
    to: '/ui-library',
    cta: 'Explore UI Library',
    howItWorks:
      'Inspect live previews across desktop, tablet, and mobile viewports, customize props in the interactive sandbox, and copy clean React or HTML/CSS code.',
  },
  {
    title: 'Study Space & Learning Hub',
    badge: 'Student Workspace',
    icon: GraduationCap,
    to: '/study',
    cta: 'Enter Study Space',
    howItWorks:
      'Access the dedicated Student Workspace for Leitner flashcards, document-to-quiz generation, weighted GPA calculations, Pomodoro focus timers, and community tutorials.',
  },
  {
    title: 'Discover, Community & LoveLink',
    badge: 'Open Ecosystem',
    icon: Compass,
    to: '/discover',
    cta: 'Explore Discover',
    howItWorks:
      'Find nearby study and creative spots via OpenStreetMap on Discover, back the open-source roadmap on Community, or send interactive digital envelopes with LoveLink.',
  },
] as const;

const FAQS = [
  {
    q: 'Do my files ever get uploaded to a remote server?',
    a: 'For all standard browser tools (PDF merging/splitting, image compression/conversion, developer formatters, and calculators), 100% of processing happens locally inside your browser memory. Neural AI tools use either local WebAssembly models or our dedicated AI inference endpoint without storing your media.',
  },
  {
    q: 'Do I need to create an account to use VexoraMods?',
    a: 'No. Every tool in the catalog, the UI Library, and Vexora Discover works without signing in. An account is only needed if you want to sync AI Chat history across devices, save cloud Studio projects, publish Learning Hub posts, or manage LoveLink letters.',
  },
  {
    q: 'How is VexoraMods completely free with zero paywalls?',
    a: 'Because our local-first architecture offloads heavy computation to your own device hardware via WebAssembly and Canvas, our cloud infrastructure footprint stays minimal and is sustained by open-source contributors and voluntary community supporters.',
  },
  {
    q: 'Can I use the tools offline?',
    a: 'Yes. Once loaded, standard client-side tools and Study Space utilities continue to operate even if your internet connection drops.',
  },
] as const;

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO BANNER */}
      <section className="pt-2 sm:pt-4">
        <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-8 sm:p-12 shadow-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--theme-dirty-white)]">
            <Cpu className="w-3.5 h-3.5 text-[var(--theme-yellow)]" />
            <span>Platform Architecture &amp; Guide</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--theme-dirty-white)] leading-tight">
              How VexoraMods Works
            </h1>
            <p className="text-sm sm:text-base text-[var(--theme-gray-muted)] leading-relaxed">
              Most online utility sites upload your private files to remote cloud queues and lock basic exports behind monthly subscriptions. VexoraMods flips the model: we run a high-speed, local-first engine directly inside your browser—100% free and open source.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-[var(--theme-canvas)] font-bold text-xs sm:text-sm rounded-full shadow-sm transition-all"
            >
              <span>Explore All {TOOL_CATALOG.length}+ Tools</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] font-bold text-xs sm:text-sm rounded-full transition-all"
            >
              <Sparkles className="w-4 h-4 text-[var(--theme-yellow)]" />
              <span>Open Design Studio</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 3-STEP WORKFLOW PIPELINE */}
      <section className="space-y-6" aria-labelledby="workflow-steps-heading">
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--theme-gray-muted)] font-semibold">
            3-Step Execution Pipeline
          </span>
          <h2
            id="workflow-steps-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight"
          >
            From input to instant output in seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[var(--theme-yellow)]">
                    <step.icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)]">
                    STEP {step.num}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--theme-dirty-white)]">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--theme-gray-muted)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WORKSPACE & ECOSYSTEM BREAKDOWN */}
      <section className="space-y-6" aria-labelledby="workspaces-breakdown-heading">
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--theme-gray-muted)] font-semibold">
            Unified Platform Suites
          </span>
          <h2
            id="workspaces-breakdown-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight"
          >
            How every workspace operates under the hood
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKSPACES.map((ws) => (
            <div
              key={ws.title}
              className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[var(--theme-dirty-white)]">
                    <ws.icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-gray-muted)]">
                    {ws.badge}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--theme-dirty-white)]">
                  {ws.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--theme-gray-muted)] leading-relaxed">
                  {ws.howItWorks}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--theme-gray-border)]">
                <Link
                  to={ws.to}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--theme-yellow)] hover:underline"
                >
                  <span>{ws.cta}</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ARCHITECTURE COMPARISON */}
      <section className="space-y-6" aria-labelledby="comparison-heading">
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--theme-gray-muted)] font-semibold">
            Why Local-First Matters
          </span>
          <h2
            id="comparison-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight"
          >
            Traditional Cloud Utilities vs. VexoraMods Engine
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>Traditional Online Tool Sites</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--theme-gray-muted)]">
              <li>• Uploads your private PDFs and photos to remote third-party servers</li>
              <li>• Limits you to 2–3 free tasks per day before hitting a paywall</li>
              <li>• Adds watermarks or forces account registration to download results</li>
              <li>• Slow upload/download queues on large files</li>
            </ul>
          </div>

          <div className="bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-subtle)] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-[var(--theme-yellow)] font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>VexoraMods Local-First Platform</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--theme-dirty-white)]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--theme-yellow)] shrink-0" />
                <span>Files stay inside your device memory—zero cloud uploads for standard tools</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--theme-yellow)] shrink-0" />
                <span>100% free forever with zero subscriptions, credit walls, or watermarks</span>
              </li>
              <li className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-[var(--theme-yellow)] shrink-0" />
                <span>Instant zero-latency execution that works offline after loading</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[var(--theme-yellow)] shrink-0" />
                <span>Open-source transparency backed by community tutorials and support</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="space-y-6" aria-labelledby="faq-heading">
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--theme-gray-muted)] font-semibold">
            Common Questions
          </span>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight"
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl p-6 space-y-2.5"
            >
              <h3 className="text-sm sm:text-base font-bold text-[var(--theme-dirty-white)]">
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--theme-gray-muted)] leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
