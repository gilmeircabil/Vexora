import React from 'react';
import { Card } from '../components/common/Card.js';
import { ShieldCheck, Heart, Terminal, Cpu, Lock } from 'lucide-react';
import { TOOL_CATALOG } from '../tools/catalog.js';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-black">About VexoraMods</h1>
        <p className="text-base font-semibold text-neutral-700 leading-relaxed">
          Everything You Need. One Platform. Free. A free, open-source platform offering online
          tools, AI-assisted utilities, creative editing, and a developer discovery community.
        </p>
      </div>

      <div className="space-y-6 text-sm text-neutral-800 leading-relaxed">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-black">The Mission</h2>
          </div>
          <p>
            The modern web is inundated with utility websites that charge monthly subscriptions for
            trivial PDF operations, flood users with intrusive banner ads, require account creation
            for simple conversions, or upload sensitive documents to unverified cloud servers.
          </p>
          <p>
            <strong>VexoraMods was built to challenge that paradigm.</strong> We provide{' '}
            {TOOL_CATALOG.length} indispensable utilities for images, PDFs, text manipulation, web
            development, creative design, and daily workflows completely free, open source, and
            offline-capable.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-black">Our Core Principles</h2>
          </div>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <strong>Completely Free:</strong> No paywalls, subscription tiers, or credit
              deductions.
            </li>
            <li>
              <strong>Zero Tracking:</strong> No behavioral tracking analytics, third-party cookies,
              or ad networks.
            </li>
            <li>
              <strong>No Accounts Required:</strong> Open any standard tool, complete your work, and
              leave without registering.
            </li>
            <li>
              <strong>Local-First Architecture:</strong> All processing executes in your browser's
              memory without remote file uploads.
            </li>
            <li>
              <strong>Open Source & Community Driven:</strong> Free for developers, students,
              creators, and businesses with optional voluntary support.
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-black">
              Honest Disclosure on AI & Creative Capabilities
            </h2>
          </div>
          <p>
            All standard tools in VexoraMods execute entirely client-side. AI tools are powered by
            optional local or self-hosted neural models with zero credit requirements.
          </p>
          <p>
            All normal tools will always remain 100% free with no mandatory payments, subscriptions,
            or credit systems.
          </p>
        </Card>
      </div>
    </div>
  );
};
