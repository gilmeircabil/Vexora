import React from 'react';
import { Link } from 'react-router';
import { ShieldCheck, Lock, Cpu, Sparkles, Terminal } from 'lucide-react';
import { CATEGORIES } from '../../tools/catalog.js';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-neutral-200/90 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Mission & Identity */}
          <div className="md:col-span-1 space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="font-bold text-base text-neutral-900 dark:text-neutral-100 tracking-tight">
                Vexora <span className="text-neutral-400 font-normal">-</span> Tool
                <span className="text-indigo-600 dark:text-indigo-400">Nest</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Everyday tools. One place. No cost. High-speed, local-first browser utilities designed for
              privacy, security, and developer ergonomics.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>33 Engines Active · Zero Server Uploads</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3.5">
              Tool Suites
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/category/${c.slug}`}
                    className="text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Architecture & Privacy */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3.5">
              Guarantees & Values
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-500 dark:text-neutral-400">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Zero Cloud Storage of Files</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Client Web Crypto & Web Workers</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Zero Tracking Pixels & No Ads</span>
              </li>
              <li className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>MIT Licensed Open Source</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Documentation */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3.5">
              Documentation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/about"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  About the Platform
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Architecture
                </Link>
              </li>
              <li>
                <Link
                  to="/licenses"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Open Source Licenses
                </Link>
              </li>
              <li>
                <Link
                  to="/contributing"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Contributing & Adding Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  AI Generation & Plans
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p className="font-mono">
            © {new Date().getFullYear()} Vexora - ToolNest · MIT License
          </p>
          <p className="text-center sm:text-right">
            Browser-based local execution. Sensitive files never leave your device.
          </p>
        </div>
      </div>
    </footer>
  );
};
