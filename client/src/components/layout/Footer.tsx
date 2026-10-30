import React from 'react';
import { Link } from 'react-router';
import { Lock, Cpu, Sparkles, Terminal } from 'lucide-react';
import { CATEGORIES } from '../../tools/catalog.js';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t-2 border-black bg-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Mission & Identity */}
          <div className="md:col-span-1 space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center text-black">
                <svg
                  className="w-4 h-4 stroke-[2.5]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="font-black text-lg text-black tracking-tight">
                VexoraTool
              </span>
            </Link>
            <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
              Everyday tools. One place. No cost. High-speed, local-first browser utilities designed for
              privacy, security, and developer ergonomics.
            </p>
            <div className="pt-1 inline-flex items-center gap-2 text-xs font-black text-black bg-[#4ADE80] border-2 border-black px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_#000000]">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span>33 Engines Active · Zero Server Uploads</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3.5">
              Tool Suites
            </h4>
            <ul className="space-y-2 text-xs font-bold">
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
                <span>Client Web Crypto & Web Workers</span>
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

          {/* Col 4: Platform & Documentation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3.5">
              Documentation
            </h4>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <Link
                  to="/about"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  About the Platform
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
              <li>
                <Link
                  to="/licenses"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Open Source Licenses
                </Link>
              </li>
              <li>
                <Link
                  to="/contributing"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Contributing & Adding Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  AI Generation & Plans
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-neutral-600">
          <p className="font-mono">
            © {new Date().getFullYear()} VexoraTool · MIT License
          </p>
          <p className="text-center sm:text-right">
            Browser-based local execution. Sensitive files never leave your device.
          </p>
        </div>
      </div>
    </footer>
  );
};
