import React from 'react';
import { Card } from '../components/common/Card.js';
import { ShieldCheck, Heart, Terminal, Cpu, Lock } from 'lucide-react';
import { TOOL_CATALOG } from '../tools/catalog.js';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          About Vexora - ToolNest
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Everyday tools. One place. No cost. A free, open-source utility platform built with
          privacy and respect for your device.
        </p>
      </div>

      <div className="space-y-6 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              The Mission
            </h2>
          </div>
          <p>
            The modern web is inundated with utility websites that charge monthly subscriptions for
            trivial PDF operations, flood users with intrusive banner ads, require account creation
            for simple conversions, or upload sensitive documents to unverified cloud servers.
          </p>
          <p>
            <strong>Vexora - ToolNest was built to challenge that paradigm.</strong> We provide{' '}
            {TOOL_CATALOG.length} indispensable utilities for images, PDFs, text manipulation, web
            development, and daily calculations completely free, open source, and offline-capable.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Our Core Principles
            </h2>
          </div>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <strong>Completely Free:</strong> No hidden paywalls, subscription tiers, or credits.
            </li>
            <li>
              <strong>Zero Tracking:</strong> No behavioral tracking analytics, third-party cookies,
              or ad networks.
            </li>
            <li>
              <strong>No Accounts Required:</strong> Open a tool, complete your work, and leave
              without registering.
            </li>
            <li>
              <strong>Local-First Architecture:</strong> All processing executes in your browser's
              memory.
            </li>
            <li>
              <strong>Open Source:</strong> MIT licensed and completely auditable on GitHub.
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Honest Disclosure on Future Capabilities
            </h2>
          </div>
          <p>
            Today, all {TOOL_CATALOG.length} published tools in Vexora - ToolNest execute
            client-side. Advanced neural features are managed with an atomic credit system.
          </p>
          <p>
            If and when server-assisted tools are introduced, they will always be clearly labeled
            upfront, require explicit user consent before uploading any byte, and provide full
            instructions for self-hosting.
          </p>
        </Card>
      </div>
    </div>
  );
};
