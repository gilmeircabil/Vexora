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

  const getCategoryTheme = () => {
    if (tool.slug === 'smart-image-studio') {
      return {
        badgeBg: 'bg-[#FACC15]',
        iconBg: 'bg-[#FACC15]',
        label: '★ Flagship Studio',
      };
    }

    switch (unifiedCategory) {
      case 'Image':
        return { badgeBg: 'bg-[#4ADE80]', iconBg: 'bg-[#4ADE80]', label: 'Image' };
      case 'PDF':
        return { badgeBg: 'bg-[#FACC15]', iconBg: 'bg-[#FACC15]', label: 'PDF' };
      case 'Developer':
        return { badgeBg: 'bg-[#A78BFA]', iconBg: 'bg-[#A78BFA]', label: 'Developer' };
      case 'Text':
        return { badgeBg: 'bg-[#38BDF8]', iconBg: 'bg-[#38BDF8]', label: 'Text' };
      case 'Productivity':
        return { badgeBg: 'bg-[#F472B6]', iconBg: 'bg-[#F472B6]', label: 'Productivity' };
      case 'Media':
        return { badgeBg: 'bg-[#FB923C]', iconBg: 'bg-[#FB923C]', label: 'Media' };
      case 'Design':
        return { badgeBg: 'bg-[#FACC15]', iconBg: 'bg-[#FACC15]', label: 'Design' };
      default:
        return {
          badgeBg: 'bg-neutral-100',
          iconBg: 'bg-neutral-100',
          label: unifiedCategory || 'Other',
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <Link
      to={route}
      className="group flex flex-col justify-between bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] transition-all text-left relative"
    >
      <div>
        {/* Top Header: Category pill & AI badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-lg border border-black font-black text-[10px] uppercase tracking-wider text-black ${theme.badgeBg}`}
          >
            {theme.label}
          </span>

          <div className="flex items-center gap-1.5">
            {tool.isExternal && (
              <span className="inline-flex items-center gap-1 bg-[#38BDF8] border border-black text-black px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                External Tool
              </span>
            )}
            {isAi && (
              <span className="inline-flex items-center gap-1 bg-[#F472B6] border border-black text-black px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 stroke-[2.5]" />
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
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                isFav
                  ? 'bg-[#FFD21A] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000] hover:scale-110 active:scale-95'
                  : 'bg-white border border-black/20 text-neutral-400 hover:text-black hover:border-black hover:bg-neutral-100 hover:scale-110 active:scale-95'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 stroke-[2.2] transition-colors ${
                  isFav ? 'fill-black text-black' : 'fill-transparent'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tool Icon + Title & Tagline */}
        <div className="flex items-start gap-3.5 mb-2">
          <div
            className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 text-black shadow-[1.5px_1.5px_0px_#000000] ${theme.iconBg}`}
          >
            <Icon name={tool.iconName} className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-black text-base text-black group-hover:underline decoration-2 underline-offset-2 truncate">
              {tool.name}
            </h3>
            <p className="text-xs font-semibold text-neutral-600 line-clamp-2 mt-0.5 leading-relaxed">
              {tool.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Open Tool Action */}
      <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-800 group-hover:text-black group-hover:underline">
          {tool.isExternal ? 'View External Tool' : 'Open Tool'}
        </span>
        <ArrowUpRight className="w-4 h-4 text-black stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </Link>
  );
};
