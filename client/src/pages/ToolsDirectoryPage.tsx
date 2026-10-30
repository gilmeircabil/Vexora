import React, { useState } from 'react';
import { Search, X, Cpu } from 'lucide-react';
import { TOOL_CATALOG, CATEGORIES, searchTools } from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { Icon } from '../components/common/Icon.js';

export const ToolsDirectoryPage: React.FC = () => {
  const [query, setQuery] = useState('');

  const isFiltering = query.trim().length > 0;
  const filteredTools = searchTools(query);

  return (
    <div className="space-y-12">
      <div className="border-b border-neutral-200/90 dark:border-neutral-800 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-medium">
          <Cpu className="w-3.5 h-3.5" />
          <span>FULL SUITE DIRECTORY</span>
          <span className="text-neutral-400">·</span>
          <span>{TOOL_CATALOG.length} UTILITIES</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          Tools Directory
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          Browse the complete catalog of all {TOOL_CATALOG.length} browser-based tools available on
          Vexora - ToolNest. Every utility runs locally in your browser with zero file uploads.
        </p>

        <div className="relative max-w-md pt-1">
          <div className="relative group">
            <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search all ${TOOL_CATALOG.length} utilities...`}
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300/80 dark:border-neutral-700/80 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 shadow-2xs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isFiltering ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Search Results ({filteredTools.length})
            </h2>
            <button
              onClick={() => setQuery('')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear filter
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
          {filteredTools.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No tools matched "{query}"
              </p>
              <p className="text-xs text-neutral-400">
                Try searching for keywords like "resize", "pdf", "crypto", or "json".
              </p>
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-16">
          {CATEGORIES.map((cat) => {
            const categoryTools = TOOL_CATALOG.filter((t) => t.category === cat.id);
            return (
              <section key={cat.id} id={cat.slug} className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                      <Icon name={cat.iconName} className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <span>{cat.name}</span>
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                          {categoryTools.length}
                        </span>
                      </h2>
                      <p className="text-xs text-neutral-500">{cat.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
