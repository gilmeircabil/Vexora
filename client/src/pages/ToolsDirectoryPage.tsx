import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Search, X, Sparkles, Info, Star } from 'lucide-react';
import {
  TOOL_CATALOG,
  UNIFIED_CATEGORIES,
  type UnifiedToolCategory,
  searchTools,
  getUnifiedCategory,
  isAiPoweredTool,
} from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { aiToolsApi } from '../services/aiToolsApi.js';
import { useFavorites } from '../context/FavoritesContext.js';

export const ToolsDirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'ai' ? 'ai-powered' : 'all';
  const rawCat = searchParams.get('category');
  const initialCategory: UnifiedToolCategory | 'All' | 'Favorites' =
    rawCat === 'Favorites'
      ? 'Favorites'
      : UNIFIED_CATEGORIES.includes(rawCat as any)
        ? (rawCat as UnifiedToolCategory)
        : 'All';

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<
    UnifiedToolCategory | 'All' | 'Favorites'
  >(initialCategory);
  const [selectedType, setSelectedType] = useState<'all' | 'standard' | 'ai-powered'>(initialType);
  const [aiStatus, setAiStatus] = useState<{
    checked: boolean;
    online: boolean;
    readyTools: Record<string, boolean>;
  }>({
    checked: false,
    online: true,
    readyTools: {},
  });

  const { favoriteIds, favoritesCount } = useFavorites();

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

  const handleTypeChange = (type: 'all' | 'standard' | 'ai-powered') => {
    setSelectedType(type);
    const next = new URLSearchParams(searchParams);
    if (type === 'ai-powered') {
      next.set('type', 'ai');
    } else {
      next.delete('type');
    }
    setSearchParams(next, { replace: true });
  };

  const handleCategoryChange = (cat: UnifiedToolCategory | 'All' | 'Favorites') => {
    setSelectedCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat !== 'All') {
      next.set('category', cat);
    } else {
      next.delete('category');
    }
    setSearchParams(next, { replace: true });
  };

  // Tools listing with favorites placed first
  const filteredTools = useMemo(() => {
    const byQuery = searchTools(query);
    const filtered = byQuery.filter((tool) => {
      if (selectedCategory === 'Favorites') {
        if (!favoriteIds.includes(tool.id)) return false;
      } else if (selectedCategory !== 'All') {
        if (getUnifiedCategory(tool) !== selectedCategory) return false;
      }

      const isAi = isAiPoweredTool(tool);
      const typeMatch =
        selectedType === 'all' ||
        (selectedType === 'ai-powered' && isAi) ||
        (selectedType === 'standard' && !isAi);
      return typeMatch;
    });

    // Place favorite tools first in the listing
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
  }, [query, selectedCategory, selectedType, favoriteIds]);

  const totalAiTools = useMemo(() => TOOL_CATALOG.filter((t) => isAiPoweredTool(t)).length, []);
  const totalStandardTools = TOOL_CATALOG.length - totalAiTools;

  return (
    <div className="space-y-8">
      {/* Editorial Header & Controls */}
      <div className="border-b-2 border-black pb-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black">
            All Tools Directory
          </h1>
          <p className="text-sm sm:text-base font-semibold text-neutral-700 max-w-3xl leading-relaxed">
            Explore all {TOOL_CATALOG.length} standard browser utilities and AI-powered tools in one
            unified workspace.
          </p>
        </div>

        {/* AI Configuration Notice when AI backend is unreachable */}
        {aiStatus.checked && !aiStatus.online && (
          <div className="py-3 px-4 rounded-xl bg-amber-50 border border-black flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-black text-black">AI Provider Configuration Notice</p>
              <p className="font-semibold text-neutral-700">
                The Node/Sharp AI vision service is currently unreachable. All {totalStandardTools}{' '}
                Standard Tools continue to work 100% offline in your browser. To enable AI-powered
                tools ({totalAiTools} tools), ensure the VexoraMods backend server is running.
              </p>
            </div>
          </div>
        )}

        {/* Search + Tool Type Switcher */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tools by name, description, or keyword"
              placeholder={`Search all ${TOOL_CATALOG.length} tools by name, description, or keyword...`}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border-2 border-black rounded-xl focus:outline-none text-black font-bold placeholder:text-neutral-500 placeholder:font-semibold"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:scale-110 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Tool Type Filter Buttons */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl border-2 border-black self-start">
            <button
              type="button"
              onClick={() => handleTypeChange('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedType === 'all'
                  ? 'bg-[#FACC15] text-black border border-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              All ({TOOL_CATALOG.length})
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('standard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedType === 'standard'
                  ? 'bg-[#4ADE80] text-black border border-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Standard ({totalStandardTools})
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('ai-powered')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedType === 'ai-powered'
                  ? 'bg-[#F472B6] text-black border border-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>AI-Powered ({totalAiTools})</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs including Favorites */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Favorites Filter Pill */}
          <button
            type="button"
            onClick={() => handleCategoryChange('Favorites')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 border-black ${
              selectedCategory === 'Favorites'
                ? 'bg-[#FFD21A] text-black shadow-[2px_2px_0px_#000000]'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                favoritesCount > 0 ? 'fill-black text-black' : 'text-neutral-500'
              }`}
            />
            <span>Favorites</span>
            <span className="text-[10px] font-mono opacity-80">({favoritesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 border-black ${
              selectedCategory === 'All'
                ? 'bg-black text-[#FACC15]'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <span>All</span>
            <span className="ml-1.5 text-[10px] font-mono opacity-80">({TOOL_CATALOG.length})</span>
          </button>

          {UNIFIED_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            const count = TOOL_CATALOG.filter((t) => getUnifiedCategory(t) === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 border-black ${
                  active ? 'bg-black text-[#FACC15]' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <span>{cat}</span>
                <span className="ml-1.5 text-[10px] font-mono opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified Tools View with Favorites Placed First */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-black">
              {selectedCategory === 'Favorites'
                ? 'Your Favorite Tools'
                : selectedCategory === 'All'
                  ? 'All Tools'
                  : `${selectedCategory} Tools`}
            </h2>
            <span className="px-2.5 py-0.5 rounded-lg bg-white border-2 border-black text-xs font-mono font-black shadow-[2px_2px_0px_#000000]">
              {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
            </span>
          </div>

          {(query || selectedCategory !== 'All' || selectedType !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                handleCategoryChange('All');
                handleTypeChange('all');
              }}
              className="text-xs font-black text-black underline underline-offset-4 hover:text-neutral-700 cursor-pointer"
            >
              Reset all filters
            </button>
          )}
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
        ) : selectedCategory === 'Favorites' && favoritesCount === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border-2 border-black shadow-[5px_5px_0px_#000000] space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FFD21A] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
              <Star className="w-6 h-6 fill-black text-black" />
            </div>
            <p className="text-lg font-black text-black">Your favorite tools will appear here.</p>
            <p className="text-xs font-semibold text-neutral-600 max-w-md mx-auto">
              Tap the star on any tool to save it for quick access.
            </p>
            <button
              type="button"
              onClick={() => handleCategoryChange('All')}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FACC15] border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#000000] cursor-pointer"
            >
              Explore All Tools
            </button>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border-2 border-black shadow-[5px_5px_0px_#000000] space-y-3">
            <p className="text-lg font-black text-black">
              {query ? `No tools matched "${query}"` : 'No tools found'}
            </p>
            <p className="text-xs font-semibold text-neutral-600 max-w-md mx-auto">
              {query
                ? 'Try searching for keywords like "resize", "ocr", "background", "pdf", "json", or reset your filters.'
                : 'Try selecting a different category or resetting your filters.'}
            </p>
            {(query || selectedCategory !== 'All' || selectedType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  handleCategoryChange('All');
                  handleTypeChange('all');
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FACC15] border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#000000] cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
