import React, { useState } from 'react';
import { Search, Shield, Zap, Lock, X, Terminal, ArrowRight } from 'lucide-react';
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

  const getCategoryColor = (catId: ToolCategory) => {
    switch (catId) {
      case 'images':
        return 'hover:bg-[#4ADE80] data-[active=true]:bg-[#4ADE80]';
      case 'pdf':
        return 'hover:bg-[#FACC15] data-[active=true]:bg-[#FACC15]';
      case 'developer':
        return 'hover:bg-[#A78BFA] data-[active=true]:bg-[#A78BFA]';
      case 'text':
        return 'hover:bg-[#38BDF8] data-[active=true]:bg-[#38BDF8]';
      case 'utilities':
        return 'hover:bg-[#F472B6] data-[active=true]:bg-[#F472B6]';
    }
  };

  return (
    <div className="space-y-12 sm:space-y-14">
      {/* Hero Section — Neo-Brutalist Layout */}
      <section className="pt-4 sm:pt-8 pb-2 max-w-4xl mx-auto space-y-6">
        {/* Eyebrow Stamp */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-[#FACC15] border-2 border-black font-black text-xs uppercase tracking-wider text-black shadow-[2.5px_2.5px_0px_#000000]">
          <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
          <span>NEO UTILITY WORKBENCH</span>
          <span>·</span>
          <span>{TOOL_CATALOG.length} TOOLS READY</span>
        </div>

        {/* Main Headline (Matching the Reference Image Scale) */}
        <div className="space-y-1 text-left sm:text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black leading-[1.05]">
            Everyday tools.
            <br />
            <span className="inline-block bg-[#FACC15] px-3 py-0.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000000] rotate-[-1deg] mt-1">
              One place.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg font-bold text-neutral-700 max-w-2xl mx-auto pt-4 leading-relaxed">
            High-performance, client-side utilities for images, PDFs, text, and developers. Processed
            instantly in your browser with zero file uploads or cloud storage.
          </p>
        </div>

        {/* Neo-Brutalist Search Deck (Matching the Reference Image Search + Action Button) */}
        <div className="pt-2 max-w-2xl mx-auto">
          <div className="flex items-stretch gap-2.5 sm:gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000000] flex items-center px-4 py-3 group focus-within:shadow-[6px_6px_0px_#000000] transition-all">
              <span className="font-mono font-black text-lg text-black mr-2.5">#</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name, format, or task..."
                className="w-full text-sm sm:text-base bg-transparent border-none text-black font-bold placeholder:text-neutral-400 placeholder:font-normal focus:outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-black hover:scale-110 transition-transform"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-bold text-black bg-neutral-100 rounded-lg border border-black/30">
                  /
                </kbd>
              )}
            </div>

            {/* Signature Accent Action Button (Matching the Yellow '+' in the Reference) */}
            <button
              onClick={() => {
                const el = document.getElementById('tool-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-2xl px-5 sm:px-6 flex items-center justify-center font-black text-black shadow-[4px_4px_0px_#000000] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[5px_5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] transition-all shrink-0"
              title="Explore all tools"
            >
              <Search className="w-5 h-5 stroke-[2.8]" />
            </button>
          </div>

          {/* Quick-Filter Tags */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-3 text-xs">
            <span className="text-[11px] font-black uppercase text-neutral-500 font-mono">Popular:</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FACC15] text-black text-xs font-black transition-all border-2 border-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Bar & Grid Header */}
      <section id="tool-grid" className="space-y-6 pt-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-black flex items-center gap-2">
            <span>Tool Collections</span>
            <span className="text-xs font-mono font-bold bg-[#FACC15] border border-black px-2 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_#000]">
              {filteredTools.length}
            </span>
          </h2>

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-black uppercase tracking-wider text-black underline underline-offset-2 hover:text-neutral-700"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Category Filter Pills (Tactile Neo-Brutalist Buttons) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            data-active={selectedCategory === 'all' && !searchQuery}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black border-2 border-black transition-all shrink-0 shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 ${
              selectedCategory === 'all' && !searchQuery
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <span>All Tools</span>
            <span
              className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md border border-black ${
                selectedCategory === 'all' && !searchQuery ? 'bg-white text-black' : 'bg-neutral-100 text-black'
              }`}
            >
              {TOOL_CATALOG.length}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const count = TOOL_CATALOG.filter((t) => t.category === cat.id).length;
            const isSelected = selectedCategory === cat.id && !searchQuery;
            const colorClass = getCategoryColor(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                data-active={isSelected}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black border-2 border-black transition-all shrink-0 whitespace-nowrap shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 ${colorClass} ${
                  isSelected ? 'shadow-[4px_4px_0px_#000000] text-black font-black' : 'bg-white text-black'
                }`}
              >
                <Icon name={cat.iconName} className="w-4 h-4 stroke-[2.5]" />
                <span>{cat.name}</span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md border border-black bg-white text-black">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tools Folder Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-black p-8 space-y-4 shadow-[6px_6px_0px_#000000]">
            <Terminal className="w-12 h-12 text-black mx-auto stroke-[2.5]" />
            <h3 className="text-lg font-black text-black">
              No tools matched "{searchQuery}"
            </h3>
            <p className="text-xs font-semibold text-neutral-600 max-w-md mx-auto">
              Try searching with broader terms or click a category tab above.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black border-2 border-black shadow-[3px_3px_0px_#000000] transition-all hover:-translate-y-0.5"
            >
              Show all tools
            </button>
          </div>
        )}
      </section>

      {/* Feature & Privacy Guarantees (Neo-Brutalist Stamped Cards) */}
      <section className="pt-10 border-t-2 border-black/10">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <h2 className="text-2xl font-black text-black">
            Guaranteed Privacy & Zero Bullsh*t
          </h2>
          <p className="text-xs font-bold text-neutral-600">
            Backed by in-browser sandbox execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border-2 border-black space-y-3 shadow-[5px_5px_0px_#000000]">
            <div className="w-12 h-12 rounded-xl bg-[#4ADE80] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-black text-base">
              Local-First Sandbox
            </h3>
            <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
              Your images, PDFs, text, and passwords never leave your browser. Cryptographic hashing,
              PDF stitching, and image resizing run client-side.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border-2 border-black space-y-3 shadow-[5px_5px_0px_#000000]">
            <div className="w-12 h-12 rounded-xl bg-[#FACC15] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
              <Shield className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-black text-base">
              Zero Tracking, Zero Ads
            </h3>
            <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
              No tracking cookies, no Google Analytics pixels, no intrusive banners, and no forced logins
              for core tools. Open any utility and start immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border-2 border-black space-y-3 shadow-[5px_5px_0px_#000000]">
            <div className="w-12 h-12 rounded-xl bg-[#A78BFA] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-black text-base">
              Open Source & Auditable
            </h3>
            <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
              Every utility is MIT licensed. Inspect source algorithms, run the suite locally, or deploy
              your own private instance with clean TypeScript.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
