import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
} from 'lucide-react';
import { TOOL_CATALOG, CATEGORIES, searchTools, type ToolCategory } from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';

export const HomePage: React.FC = () => {
  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        document.getElementById('catalog-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredTools = searchQuery.trim()
    ? searchTools(searchQuery)
    : selectedCategory === 'all'
      ? TOOL_CATALOG
      : TOOL_CATALOG.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      {/* Hero Section */}
      <section className="pt-4 sm:pt-8 max-w-4xl mx-auto space-y-6 text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-[#FACC15] border-2 border-black font-black text-xs uppercase tracking-wider text-black shadow-[2.5px_2.5px_0px_#000000]">
          <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
          <span>VEXORAMODS · FREE & OPEN-SOURCE</span>
          <span>·</span>
          <span>ZERO SUBSCRIPTION</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.1]">
            Everything You Need. One Platform.
            <br />
            <span className="inline-block bg-[#FACC15] px-3.5 py-1 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000000] rotate-[-1deg] mt-2">
              Free for everyone.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg font-bold text-neutral-700 max-w-2xl mx-auto pt-2 leading-relaxed">
            VexoraMods is a free and open-source all-in-one online tools platform that provides useful utilities,
            AI-assisted tools, an online design editor, and a developer community.
          </p>
        </div>
      </section>

      {/* Catalog & Instant Search Section */}
      <section id="tool-catalog" className="max-w-6xl mx-auto space-y-6 pt-2">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-2">
              <span>All {TOOL_CATALOG.length} Everyday Tools</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FAF7F2] border border-black text-neutral-700">
                {filteredTools.length} tools
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
              Click any tool card below to open its full dedicated workspace.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px] sm:min-w-[340px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 stroke-[2.5]" />
            <input
              id="catalog-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (Press / to focus)..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border-2 border-black rounded-xl font-bold text-xs sm:text-sm shadow-[2.5px_2.5px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-black hover:scale-110 transition-transform cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000] cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#FACC15] -translate-y-0.5'
                : 'bg-white hover:bg-neutral-100 text-neutral-800'
            }`}
          >
            All Tools ({TOOL_CATALOG.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = TOOL_CATALOG.filter((t) => t.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000] cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white -translate-y-0.5'
                    : 'bg-white hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="p-12 text-center bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] space-y-3">
            <p className="font-black text-base text-black">
              No tools found matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-[#FACC15] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
