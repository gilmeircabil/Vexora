import React from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Cpu, Sparkles } from 'lucide-react';
import { type ToolDefinition, CATEGORIES } from '../../tools/catalog.js';
import { Icon } from './Icon.js';

interface ToolCardProps {
  tool: ToolDefinition;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const category = CATEGORIES.find((c) => c.id === tool.category);
  const isServer = tool.processingLocation === 'server';

  // Category palette inspired by the neo-brutalist reference image
  const getCategoryStyles = () => {
    if (tool.slug === 'smart-image-studio') {
      return {
        tabBg: 'bg-[#FACC15]',
        iconBg: 'bg-[#FACC15]',
        label: '★ Flagship Studio',
      };
    }

    switch (tool.category) {
      case 'images':
        return {
          tabBg: 'bg-[#4ADE80]', // Bright Lime
          iconBg: 'bg-[#4ADE80]',
          label: 'Images',
        };
      case 'pdf':
        return {
          tabBg: 'bg-[#FACC15]', // Bright Sunshine Yellow
          iconBg: 'bg-[#FACC15]',
          label: 'PDF Suite',
        };
      case 'developer':
        return {
          tabBg: 'bg-[#A78BFA]', // Electric Purple
          iconBg: 'bg-[#A78BFA]',
          label: 'Dev Tools',
        };
      case 'text':
        return {
          tabBg: 'bg-[#38BDF8]', // Vivid Sky Blue
          iconBg: 'bg-[#38BDF8]',
          label: 'Text Tools',
        };
      case 'utilities':
        return {
          tabBg: 'bg-[#F472B6]', // Punchy Coral Pink
          iconBg: 'bg-[#F472B6]',
          label: 'Utilities',
        };
      default:
        return {
          tabBg: 'bg-[#E5E7EB]',
          iconBg: 'bg-[#E5E7EB]',
          label: category?.name || 'General',
        };
    }
  };

  const style = getCategoryStyles();

  return (
    <div className="relative pt-4 group">
      {/* Protruding Folder Tab (Reference Image Signature) */}
      <div
        className={`absolute top-0 left-4 h-6 px-3 rounded-t-xl border-2 border-b-0 border-black font-black text-[11px] uppercase tracking-wider text-black flex items-center justify-center z-10 ${style.tabBg}`}
      >
        <span>{style.label}</span>
      </div>

      {/* Main Folder Card Body */}
      <Link
        to={`/tools/${tool.slug}`}
        className="block bg-white border-2 border-black rounded-2xl rounded-tl-sm p-5 shadow-[4px_4px_0px_#000000] group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[6px_6px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000000] transition-all duration-150 text-left relative overflow-hidden"
      >
        {/* Top Row: Square Icon Box & Status Chip */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0 text-black ${style.iconBg}`}
          >
            <Icon name={tool.iconName} className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isServer ? (
              <span className="inline-flex items-center gap-1 bg-[#F472B6] border-2 border-black text-black px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000]">
                <Sparkles className="w-3 h-3 stroke-[2.5]" />
                <span>AI</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-[#4ADE80] border-2 border-black text-black px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000]">
                <span>LOCAL</span>
              </span>
            )}
          </div>
        </div>

        {/* Title and Tagline */}
        <h3 className="font-black text-base text-black group-hover:underline decoration-2 underline-offset-2 line-clamp-1">
          {tool.name}
        </h3>
        <p className="text-xs font-semibold text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
          {tool.tagline}
        </p>

        {/* Footer info: Engine badge and arrow */}
        <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-neutral-700 bg-neutral-100 border border-black/40 px-2 py-0.5 rounded-md">
            <Cpu className="w-3 h-3 text-neutral-600" />
            {isServer ? 'Neural Service' : 'Client Browser'}
          </span>

          <span className="w-7 h-7 rounded-lg border-2 border-black bg-[#FACC15] group-hover:bg-[#EAB308] flex items-center justify-center text-black shadow-[2px_2px_0px_#000000] transition-colors">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </span>
        </div>
      </Link>
    </div>
  );
};
