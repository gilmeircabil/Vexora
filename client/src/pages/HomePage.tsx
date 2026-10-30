import React, { useState } from 'react';
import { Link } from 'react-router';
import { Search, Shield, Zap, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { TOOL_CATALOG, CATEGORIES, searchTools, type ToolCategory } from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { Icon } from '../components/common/Icon.js';

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  const filteredTools = searchQuery.trim()
    ? searchTools(searchQuery)
    : selectedCategory === 'all'
      ? TOOL_CATALOG
      : TOOL_CATALOG.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center pt-8 pb-4 max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{TOOL_CATALOG.length} Free & Open-Source Browser Utilities</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          Everyday tools. One place.{' '}
          <span className="text-indigo-600 dark:text-indigo-400">No cost.</span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Compress photos, merge PDFs, format code, and compute everyday values. All processed
          directly inside your browser without server uploads.
        </p>

        {/* Hero Search Box */}
        <div className="relative max-w-xl mx-auto pt-2">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tool name, purpose, or format (e.g. compress, json, pdf)..."
            className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/60 focus:outline-none transition-all text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </div>
      </section>

      {/* Category Navigation Pills */}
      <section className="space-y-4">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
            }`}
          >
            All Utilities ({TOOL_CATALOG.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = TOOL_CATALOG.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <Icon name={cat.iconName} className="w-4 h-4" />
                <span>{cat.name}</span>
                <span className="text-[11px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8">
            <p className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
              No matching tools found for "{searchQuery}"
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Try searching for general keywords like "pdf", "image", "code", or "convert".
            </p>
          </div>
        )}
      </section>

      {/* Feature & Privacy Guarantees */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
            Local-First Architecture
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Your images, PDFs, text, and passwords never leave your browser. Processing runs in Web
            Workers, HTML5 Canvas, and Web Crypto.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
            No Tracking, No Accounts
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            No cookies, no behavioral tracking pixels, and no mandatory login gates. Built for
            immediate utility without friction.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
            Open Source & Free
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Transparently licensed under the MIT License. Audit the codebase, inspect algorithms, or
            run it locally anytime.
          </p>
        </div>
      </section>
    </div>
  );
};
