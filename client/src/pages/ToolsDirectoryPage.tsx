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
      <div className="border-b-2 border-black pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#FACC15] border-2 border-black text-black text-xs font-mono font-black shadow-[2px_2px_0px_#000000]">
          <Cpu className="w-3.5 h-3.5" />
          <span>FULL DIRECTORY</span>
          <span>·</span>
          <span>{TOOL_CATALOG.length} UTILITIES</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black">
          Tools Directory
        </h1>
        <p className="text-sm sm:text-base font-semibold text-neutral-700 max-w-2xl leading-relaxed">
          Browse the complete catalog of all {TOOL_CATALOG.length} browser-based tools available on
          VexoraMods. Every utility runs locally in your browser with zero file uploads.
        </p>

        <div className="relative max-w-md pt-2">
          <div className="relative group">
            <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none stroke-[2.5]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search all ${TOOL_CATALOG.length} utilities...`}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border-2 border-black rounded-xl focus:outline-none shadow-[3px_3px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] transition-all text-black font-bold placeholder:text-neutral-500 placeholder:font-normal"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:scale-110 p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isFiltering ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black text-neutral-700">
            <h2 className="text-base font-black text-black">
              Search Results ({filteredTools.length})
            </h2>
            <button
              onClick={() => setQuery('')}
              className="text-black underline underline-offset-2"
            >
              Clear filter
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
          {filteredTools.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-black shadow-[5px_5px_0px_#000000] space-y-2">
              <p className="text-base font-black text-black">
                No tools matched "{query}"
              </p>
              <p className="text-xs font-semibold text-neutral-600">
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
                    <div className="p-3 rounded-2xl bg-[#FACC15] border-2 border-black shadow-[3px_3px_0px_#000000] text-black">
                      <Icon name={cat.iconName} className="w-6 h-6 stroke-[2.3]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-black flex items-center gap-2">
                        <span>{cat.name}</span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg border border-black bg-white">
                          {categoryTools.length}
                        </span>
                      </h2>
                      <p className="text-xs font-semibold text-neutral-600">{cat.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
