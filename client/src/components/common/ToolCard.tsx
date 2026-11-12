import React from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Sparkles, Star } from 'lucide-react';
import {
  type ToolDefinition,
  getToolRoute,
  getUnifiedCategory,
  isAiPoweredTool,
} from '../../tools/catalog.js';
import { Icon } from './Icon.js';
import { useFavorites } from '../../context/FavoritesContext.js';

interface ToolCardProps {
  tool: ToolDefinition;
  aiAvailable?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(tool.id);
  const unifiedCategory = getUnifiedCategory(tool);
  const isAi = isAiPoweredTool(tool);
  const route = getToolRoute(tool);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(tool.id);
  };

  const isFlagship = tool.slug === 'smart-image-studio';
  const categoryLabel = isFlagship ? 'Flagship Studio' : (unifiedCategory || 'Utility');

  return (
    <Link
      to={route}
      className="group flex flex-col justify-between bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[var(--theme-gray-subtle)] hover:-translate-y-0.5 active:scale-[0.99] transition-all text-left relative overflow-hidden"
    >
      <div>
        {/* Top Header: Category pill & AI badge (Soft Black, Dirty White, Gray System) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full border font-bold text-[10px] uppercase tracking-wider ${
              isFlagship
                ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)]'
                : 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)]'
            }`}
          >
            {categoryLabel}
          </span>

          <div className="flex items-center gap-1.5">
            {tool.isExternal && (
              <span className="inline-flex items-center gap-1 bg-[var(--theme-canvas)] text-[var(--theme-gray-muted)] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[var(--theme-gray-border)]">
                External Tool
              </span>
            )}
            {isAi && (
              <span className="inline-flex items-center gap-1 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 stroke-[2.2]" />
                <span>AI</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label={
                isFav ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`
              }
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                isFav
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-700 shadow-xs hover:scale-110 active:scale-95'
                  : 'bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:border-[var(--theme-gray-subtle)] hover:bg-[var(--theme-surface)] hover:scale-110 active:scale-95'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 stroke-[2.2] transition-colors ${
                  isFav ? 'fill-amber-400 text-amber-400' : 'fill-transparent'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tool Icon + Title & Tagline */}
        <div className="flex items-start gap-3.5 mb-2">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs transition-colors ${
              isFlagship
                ? 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)]'
                : 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] group-hover:bg-[var(--theme-surface)] group-hover:border-[var(--theme-gray-subtle)]'
            }`}
          >
            <Icon name={tool.iconName} className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-[var(--theme-dirty-white)] group-hover:text-white transition-colors truncate">
              {tool.name}
            </h3>
            <p className="text-xs font-normal text-[var(--theme-gray-muted)] line-clamp-2 mt-0.5 leading-relaxed">
              {tool.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Open Tool Action with Circular Arrow */}
      <div className="mt-4 pt-3 border-t border-[var(--theme-gray-border)] flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-gray-muted)] group-hover:text-[var(--theme-dirty-white)] transition-colors">
          {tool.isExternal ? 'View External Tool' : 'Open Tool'}
        </span>
        <span className="w-8 h-8 rounded-full bg-[var(--theme-dirty-white)] group-hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] flex items-center justify-center font-bold text-xs transition-transform group-hover:rotate-45 shadow-xs">
          ↗
        </span>
      </div>
    </Link>
  );
};
