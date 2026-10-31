import React from 'react';
import { Link } from 'react-router';
import { Lock, Cpu, Sparkles, Terminal } from 'lucide-react';
import { CATEGORIES } from '../../tools/catalog.js';
import { BrandLogo } from '../common/BrandLogo.js';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t-2 border-black bg-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Mission & Identity */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="inline-block group" aria-label="VexoraMods Home">
              <BrandLogo size="md" />
            </Link>
            <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
              Everything You Need. One Platform. Free. High-performance browser utilities, creative design studio, and developer community.
            </p>
            <div className="pt-1 inline-flex items-center gap-2 text-xs font-black text-black bg-[#4ADE80] border-2 border-black px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_#000000]">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span>100% Free · Zero Subscriptions</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3.5">
              Workspaces
            </h4>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <Link to="/tools" className="text-neutral-700 hover:text-black hover:underline transition-colors">
                  All Online Tools
                </Link>
              </li>
              <li>
                <Link to="/ai-tools" className="text-neutral-700 hover:text-black hover:underline transition-colors">
                  AI Tools Suite
                </Link>
              </li>
              <li>
                <Link to="/design-studio" className="text-neutral-700 hover:text-black hover:underline transition-colors">
                  VexoraMods Studio
                </Link>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/category/${c.slug}`}
                    className="text-neutral-700 hover:text-black hover:underline transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Architecture & Privacy */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3.5">
              Guarantees & Values
            </h4>
            <ul className="space-y-2.5 text-xs font-bold text-neutral-800">
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                <span>Zero Cloud Storage of Files</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                <span>In-Browser Client Execution</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                <span>Zero Tracking Pixels & No Ads</span>
              </li>
              <li className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                <span>MIT Licensed Open Source</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Community */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3.5">
              Community & Platform
            </h4>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <Link
                  to="/developers"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Developer Hub
                </Link>
              </li>
              <li>
                <Link
                  to="/developers/projects"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Project Showcases
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Support VexoraMods ❤️
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Supporter Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  About VexoraMods
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Privacy Architecture
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-neutral-600">
          <p className="font-mono">
            © {new Date().getFullYear()} VexoraMods · Free & Open Source
          </p>
          <p className="text-center sm:text-right">
            Browser-based local execution. Sensitive files never leave your device.
          </p>
        </div>
      </div>
    </footer>
  );
};
