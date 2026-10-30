import React, { useState } from 'react';
import { Link } from 'react-router';
import { Search, Shield, Zap, Lock, Sparkles, X, ArrowRight, Terminal, Cpu } from 'lucide-react';
import { TOOL_CATALOG, CATEGORIES, searchTools, type ToolCategory } from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { Icon } from '../components/common/Icon.js';

const QUICK_TAGS = [
  'PDF Merge',
  'Background Remover',
  'Image Resizer',
  'JWT Studio',
  'UUID Generator',
  'Password Generator',
  'QR Code',
  'JSON Formatter',
];

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  const filteredTools = searchQuery.trim()
    ? searchTools(searchQuery)
    : selectedCategory === 'all'
      ? TOOL_CATALOG
      : TOOL_CATALOG.filter((t) => t.category === selectedCategory);

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* Hero Section */}
      <section className="text-center pt-6 sm:pt-10 pb-2 max-w-3xl mx-auto space-y-6">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-medium shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OPEN UTILITY WORKBENCH</span>
          <span className="text-neutral-400 dark:text-neutral-600">·</span>
          <span>{TOOL_CATALOG.length} TOOLS READY</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 leading-[1.12]">
          Everyday tools. One place.{' '}
          <span className="text-indigo-600 dark:text-indigo-400">Zero tracking.</span>
        </h1>

        {/* Descriptive Deck */}
        <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          High-performance, client-side utilities for images, PDFs, text, and developers. Processed
          instantly in your browser with zero file uploads or cloud storage.
        </p>

        {/* Hero Search Box */}
        <div className="relative max-w-xl mx-auto pt-1">
          <div className="relative group">
            <Search className="w-5 h-5 text-neutral-400 group-focus-within:text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, format, or task (e.g. compress, jwt, pdf)..."
              className="w-full pl-12 pr-12 py-3.5 text-sm sm:text-base bg-white dark:bg-neutral-900/90 border border-neutral-300/80 dark:border-neutral-700/80 rounded-2xl shadow-xs focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/70 dark:focus:ring-indigo-950/50 focus:outline-none transition-all text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[11px] font-mono font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700">
                /
              </kbd>
            )}
          </div>

          {/* Quick-Filter Chips */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-3 text-xs text-neutral-500">
            <span className="text-[11px] text-neutral-400 font-medium mr-1">Popular:</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-0.5 rounded-md bg-neutral-100/90 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 text-[11px] font-medium transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <section className="space-y-6">
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
              selectedCategory === 'all' && !searchQuery
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <span>All Utilities</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
              {TOOL_CATALOG.length}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const count = TOOL_CATALOG.filter((t) => t.category === cat.id).length;
            const isSelected = selectedCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <Icon name={cat.iconName} className="w-4 h-4" />
                <span>{cat.name}</span>
                <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Counter / Filter State */}
        <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
          <div className="flex items-center gap-2 font-mono">
            <span>
              {searchQuery
                ? `Search results for "${searchQuery}" (${filteredTools.length})`
                : selectedCategory === 'all'
                  ? `All utilities (${filteredTools.length})`
                  : `${CATEGORIES.find((c) => c.id === selectedCategory)?.name} (${filteredTools.length})`}
            </span>
          </div>

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
            <Terminal className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
              No matching tools found for "{searchQuery}"
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Try broader keywords like "pdf", "image", "code", "json", or click one of the suggested tags above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Show all tools
            </button>
          </div>
        )}
      </section>

      {/* Feature & Privacy Guarantees */}
      <section className="pt-8 border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Engineered for Privacy & Zero Friction
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Transparent guarantees backed by browser sandbox execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-900/40">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              Local-First Sandbox
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Your images, PDFs, text, and passwords never leave your browser. Cryptographic hashing,
              PDF stitching, and image resizing run client-side via HTML5 Canvas, Web Crypto, and Web Workers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-100 dark:border-emerald-900/40">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              Zero Tracking, Zero Ads
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              No tracking cookies, no Google Analytics pixels, no intrusive banners, and no forced logins
              for core tools. Open any utility and start immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 border border-purple-100 dark:border-purple-900/40">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              Open Source & Auditable
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Every utility is MIT licensed. Inspect source algorithms, run the suite locally, or deploy
              your own private instance with clean TypeScript and modern React.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
