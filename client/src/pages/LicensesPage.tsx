import React from 'react';
import { Link } from 'react-router';
import {
  Shield,
  FileCode,
  CheckCircle2,
  Scale,
  ShieldCheck,
  Layers,
  Cpu,
} from 'lucide-react';

const DEPENDENCY_GROUPS = [
  {
    category: 'Core Frontend & Routing Architecture',
    icon: Layers,
    items: [
      {
        name: 'React 19 & React DOM',
        license: 'MIT',
        purpose: 'Component rendering engine and concurrent UI state management',
      },
      {
        name: 'React Router v7',
        license: 'MIT',
        purpose: 'Client-side SPA routing and navigation transitions',
      },
      {
        name: 'Tailwind CSS v4',
        license: 'MIT',
        purpose: 'Design system styling, responsive grids, and theme tokens',
      },
      {
        name: 'Lucide React',
        license: 'ISC',
        purpose: 'Accessible vector iconography across workspaces and tools',
      },
    ],
  },
  {
    category: 'Canvas Studio, PDF & Media Engines',
    icon: Cpu,
    items: [
      {
        name: 'Fabric.js v7',
        license: 'MIT',
        purpose: 'Interactive multi-page vector canvas engine powering VexoraMods Studio',
      },
      {
        name: 'pdf-lib',
        license: 'MIT',
        purpose: 'Client-side PDF merging, splitting, rotation, and certificate generation',
      },
      {
        name: 'pdfjs-dist',
        license: 'Apache-2.0',
        purpose: 'In-browser PDF page rendering and Study Space Document-to-Quiz extraction',
      },
      {
        name: 'qrcode',
        license: 'MIT',
        purpose: 'Local canvas & SVG QR code generation',
      },
    ],
  },
  {
    category: 'Developer, Text & Validation Libraries',
    icon: FileCode,
    items: [
      {
        name: 'Prettier',
        license: 'MIT',
        purpose: 'Client-side AST code formatting and CSS beautification',
      },
      {
        name: 'diff',
        license: 'BSD-3-Clause',
        purpose: 'Line-by-line text comparison and diff highlighting engine',
      },
      {
        name: 'entities',
        license: 'BSD-2-Clause',
        purpose: 'HTML entity encoding and decoding utility',
      },
      {
        name: 'Zod',
        license: 'MIT',
        purpose: 'Strict TypeScript runtime schema and payload validation',
      },
    ],
  },
  {
    category: 'Backend & Security Infrastructure',
    icon: Shield,
    items: [
      {
        name: 'Express & Mongoose',
        license: 'MIT',
        purpose: 'REST API routing and schema modeling for optional cloud workspaces',
      },
      {
        name: 'bcryptjs & jsonwebtoken',
        license: 'MIT',
        purpose: 'Salted password hashing and stateless session token verification',
      },
      {
        name: 'Helmet & express-rate-limit',
        license: 'MIT',
        purpose: 'HTTP security headers and brute-force rate limiting',
      },
      {
        name: 'Vitest & Testing Library',
        license: 'MIT',
        purpose: 'Automated unit and integration verification suite',
      },
    ],
  },
] as const;

export const LicensesPage: React.FC = () => {
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
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
          >
            Terms of Use
          </Link>
          <Link
            to="/licenses"
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--theme-yellow)] text-[var(--theme-canvas)] shadow-xs"
          >
            Licenses
          </Link>
        </nav>
      </div>

      {/* Hero Banner */}
      <section className="rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] p-8 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-yellow)] text-xs font-mono font-semibold uppercase tracking-wider">
            <FileCode className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>MIT Licensed · Open-Source Stack</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--theme-dirty-white)]">
            Open Source Licenses &amp; Attributions
          </h1>
          <p className="text-xs sm:text-sm text-[var(--theme-gray-muted)] leading-relaxed">
            VexoraMods is licensed under the permissive MIT License and built upon battle-tested
            open-source libraries for local-first PDF processing, vector graphics, and UI engineering.
          </p>
        </div>

        {/* Permissions Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--theme-gray-border)]">
          {[
            'Commercial Use',
            'Modification',
            'Distribution',
            'Private Use',
          ].map((perm) => (
            <div
              key={perm}
              className="p-3.5 rounded-2xl bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-[var(--theme-dirty-white)]">{perm}</span>
            </div>
          ))}
        </div>
      </section>

      {/* VexoraMods MIT License Text */}
      <section className="rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--theme-gray-border)]">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[var(--theme-yellow)] stroke-[2]" />
            <h2 className="text-base sm:text-lg font-bold text-[var(--theme-dirty-white)]">
              VexoraMods Platform License (MIT)
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-xs font-mono font-bold text-[var(--theme-yellow)]">
            SPDX: MIT
          </span>
        </div>

        <pre className="p-5 rounded-2xl bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white-muted)] font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {`MIT License

Copyright (c) 2026 VexoraMods Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
        </pre>
      </section>

      {/* Categorized Third-Party Dependencies Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEPENDENCY_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div
              key={group.category}
              className="rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--theme-gray-border)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[var(--theme-yellow)]">
                  <GroupIcon className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[var(--theme-dirty-white)]">
                  {group.category}
                </h2>
              </div>

              <div className="divide-y divide-[var(--theme-gray-border)] text-xs">
                {group.items.map((dep) => (
                  <div key={dep.name} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[var(--theme-dirty-white)]">{dep.name}</p>
                      <p className="text-[var(--theme-gray-muted)] leading-relaxed mt-0.5">
                        {dep.purpose}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shrink-0">
                      {dep.license}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom Cross-Links */}
      <section className="rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[var(--theme-dirty-white)]">
            Have questions about data handling or acceptable use?
          </h3>
          <p className="text-xs text-[var(--theme-gray-muted)]">
            Explore our local-first Privacy Policy and platform Terms of Use.
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
            to="/terms"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] text-xs font-bold text-[var(--theme-dirty-white)] transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-[var(--theme-yellow)]" />
            <span>Terms of Use</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
