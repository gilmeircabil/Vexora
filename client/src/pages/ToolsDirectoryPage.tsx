import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Wrench, Sparkles, Star, Search, Info, X } from 'lucide-react';
import {
  TOOL_CATALOG,
  UNIFIED_CATEGORIES,
  type UnifiedToolCategory,
  searchTools,
  getUnifiedCategory,
  isAiPoweredTool,
} from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { useFavorites } from '../context/FavoritesContext.js';
import { aiToolsApi } from '../services/aiToolsApi.js';

export const ToolsDirectoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { favoriteIds, favoritesCount } = useFavorites();

  const initialCategory = useMemo<UnifiedToolCategory | 'All' | 'Favorites'>(() => {
    const catParam = searchParams.get('category');
    if (catParam === 'Favorites') return 'Favorites';
    if (catParam && UNIFIED_CATEGORIES.includes(catParam as UnifiedToolCategory)) {
      return catParam as UnifiedToolCategory;
    }
    return 'All';
  }, [searchParams]);

  const initialType = useMemo<'all' | 'standard' | 'ai-powered'>(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'ai' || typeParam === 'ai-powered') return 'ai-powered';
    if (typeParam === 'standard') return 'standard';
    return 'all';
  }, [searchParams]);

  const [toolsQuery, setToolsQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    UnifiedToolCategory | 'All' | 'Favorites'
  >(initialCategory);
  const [selectedType, setSelectedType] = useState<'all' | 'standard' | 'ai-powered'>(initialType);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  const [aiStatus, setAiStatus] = useState<{
    checked: boolean;
    online: boolean;
    readyTools: Record<string, boolean>;
  }>({
    checked: false,
    online: true,
    readyTools: {},
  });

  useEffect(() => {
    let active = true;
    aiToolsApi
      .getModelStatus()
      .then((res) => {
        if (!active) return;
        if (res?.success && res.data) {
          setAiStatus({
            checked: true,
            online: res.data.service?.nodeBackend === 'online',
            readyTools: res.data.readyTools || {},
          });
        } else {
          setAiStatus({ checked: true, online: false, readyTools: {} });
        }
      })
      .catch(() => {
        if (active) {
          setAiStatus({ checked: true, online: false, readyTools: {} });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredTools = useMemo(() => {
    const byQuery = searchTools(toolsQuery);
    const filtered = byQuery.filter((tool) => {
      if (selectedCategory === 'Favorites') {
        if (!favoriteIds.includes(tool.id)) return false;
      } else if (selectedCategory !== 'All') {
        if (getUnifiedCategory(tool) !== selectedCategory) return false;
      }

      const isAi = isAiPoweredTool(tool);
      return (
        selectedType === 'all' ||
        (selectedType === 'ai-powered' && isAi) ||
        (selectedType === 'standard' && !isAi)
      );
    });

    return [...filtered].sort((a, b) => {
      const aFav = favoriteIds.includes(a.id);
      const bFav = favoriteIds.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      if (aFav && bFav) {
        return favoriteIds.indexOf(a.id) - favoriteIds.indexOf(b.id);
      }
      return 0;
    });
  }, [toolsQuery, selectedCategory, selectedType, favoriteIds]);

  const totalAiTools = useMemo(() => TOOL_CATALOG.filter((t) => isAiPoweredTool(t)).length, []);
  const totalStandardTools = TOOL_CATALOG.length - totalAiTools;

  return (
    <div className="space-y-8 pb-12">
      <section id="tools-directory" className="pt-2 sm:pt-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--theme-gray-muted)]">
              <Wrench className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
              <span>All Client-Side Tools</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--theme-dirty-white)]">
              Browse All {TOOL_CATALOG.length} Tools
            </h1>
            <p className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)] mt-1">
              Instant browser utilities, AI-powered tools, and design suite - all free and open
              source.
            </p>
          </div>

          {aiStatus.checked && !aiStatus.online && (
            <div className="py-3 px-4 rounded-xl bg-amber-950/40 border border-amber-800/80 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-amber-200">AI Provider Configuration Notice</p>
                <p className="font-medium text-amber-300/90">
                  The Node/Sharp AI vision service is currently unreachable. All {totalStandardTools}{' '}
                  Standard Tools continue to work 100% offline in your browser. To enable AI-powered
                  tools ({totalAiTools} tools), ensure the VexoraMods backend server is running.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pb-4 space-y-4">
          {/* Search Input */}
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-[var(--theme-gray-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
            <input
              type="text"
              value={toolsQuery}
              onChange={(e) => setToolsQuery(e.target.value)}
              aria-label="Search tools by name, description, or keyword"
              placeholder={`Search all ${TOOL_CATALOG.length} tools by name, description, or keyword...`}
              className="w-full pl-11 pr-10 py-3 text-sm bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-xl focus:outline-none focus:border-[var(--theme-dirty-white)] focus:ring-1 focus:ring-[var(--theme-dirty-white)] text-[var(--theme-dirty-white)] font-medium placeholder:text-[var(--theme-gray-dim)] shadow-sm"
            />
            {toolsQuery && (
              <button
                type="button"
                onClick={() => setToolsQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>

          {/* Tool Type Filter Buttons */}
          <div className="inline-flex items-center bg-[var(--theme-surface)] p-1 rounded-xl border border-[var(--theme-gray-border)] self-start shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'all'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                  : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              All ({TOOL_CATALOG.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('standard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'standard'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                  : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              Standard ({totalStandardTools})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('ai-powered')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'ai-powered'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                  : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>AI-Powered ({totalAiTools})</span>
            </button>
          </div>

          {/* Category Filter Tabs including Favorites */}
          <div id="categories" className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory('Favorites')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCategory === 'Favorites'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-xs'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)] hover:border-[var(--theme-gray-subtle)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  favoritesCount > 0
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-[var(--theme-gray-muted)]'
                }`}
              />
              <span>Favorites</span>
              <span className="text-[10px] font-mono opacity-80">({favoritesCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCategory === 'All'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-xs'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)] hover:border-[var(--theme-gray-subtle)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              <span>All</span>
              <span className="ml-1.5 text-[10px] font-mono opacity-80">
                ({TOOL_CATALOG.length})
              </span>
            </button>

            {UNIFIED_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const count = TOOL_CATALOG.filter((t) => getUnifiedCategory(t) === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    active
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-xs'
                      : 'bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)] hover:border-[var(--theme-gray-subtle)] hover:text-[var(--theme-dirty-white)]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="ml-1.5 text-[10px] font-mono opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const isToolAiReady =
                aiStatus.online &&
                (aiStatus.readyTools[tool.id] !== undefined ? aiStatus.readyTools[tool.id] : true);
              return <ToolCard key={tool.id} tool={tool} aiAvailable={isToolAiReady} />;
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-3">
            <p className="text-lg font-bold text-[var(--theme-dirty-white)]">
              {toolsQuery ? `No tools matched "${toolsQuery}"` : 'No tools found'}
            </p>
            <p className="text-xs font-normal text-[var(--theme-gray-muted)] max-w-md mx-auto">
              {toolsQuery
                ? 'Try searching for keywords like "resize", "ocr", "background", "pdf", "json", or clear your filters.'
                : 'Try selecting a different category or clearing your filters.'}
            </p>
            {(toolsQuery || selectedCategory !== 'All' || selectedType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setToolsQuery('');
                  setSelectedCategory('All');
                  setSelectedType('all');
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-xs font-bold uppercase text-[var(--theme-canvas)] shadow-xs cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
