import React from 'react';
import { Link } from 'react-router';
import { ShieldCheck, Lock, Cpu, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../tools/catalog.js';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Mission & Identity */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
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
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                Vexora <span className="text-neutral-400 font-normal">-</span> ToolNest
              </span>
            </Link>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Everyday tools. One place. No cost. Completely free, open-source, and private.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% In-Browser Processing</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
              Tool Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/category/${c.slug}`}
                    className="text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Architecture & Privacy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
              Guarantees & Values
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-500 dark:text-neutral-400">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Zero Server File Uploads</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>Local Web Crypto & Canvas</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>No Ads or Registrations</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Documentation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
              Documentation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/about"
                  className="text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  About the Project
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy & Architecture
                </Link>
              </li>
              <li>
                <Link
                  to="/licenses"
                  className="text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Open Source Licenses
                </Link>
              </li>
              <li>
                <Link
                  to="/contributing"
                  className="text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Contributing & Adding Tools
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} Vexora - ToolNest. MIT Licensed Open Source Project.</p>
          <p className="text-center sm:text-right">
            Browser-based local execution. Sensitive files never leave your device.
          </p>
        </div>
      </div>
    </footer>
  );
};
