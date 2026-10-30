import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { TOOL_CATALOG, CATEGORIES, searchTools } from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { Icon } from '../components/common/Icon.js';

export const ToolsDirectoryPage: React.FC = () => {
  const [query, setQuery] = useState('');

  const isFiltering = query.trim().length > 0;
  const filteredTools = searchTools(query);

  return (
    <div className="space-y-12">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          Tools Directory
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Browse the complete catalog of all 30 browser-based tools available on ToolNest. Every
          utility runs locally with zero uploads.
        </p>

        <div className="relative max-w-md pt-2">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 30 utilities..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {isFiltering ? (
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Search Results ({filteredTools.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
          {filteredTools.length === 0 && (
            <p className="text-sm text-neutral-500 py-8 text-center">No tools matched "{query}".</p>
          )}
        </section>
      ) : (
        <div className="space-y-16">
          {CATEGORIES.map((cat) => {
            const categoryTools = TOOL_CATALOG.filter((t) => t.category === cat.id);
            return (
              <section key={cat.id} id={cat.slug} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <Icon name={cat.iconName} className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-neutral-500">{cat.description}</p>
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
