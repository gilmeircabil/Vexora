import React from 'react';
import { Link } from 'react-router';
import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { type ToolDefinition, CATEGORIES } from '../../tools/catalog.js';
import { Icon } from './Icon.js';

interface ToolHeaderProps {
  tool: ToolDefinition;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ tool }) => {
  const categoryInfo = CATEGORIES.find((c) => c.id === tool.category);
  const isServer = tool.processingLocation === 'server';

  const getCategoryColor = () => {
    switch (tool.category) {
      case 'images':
        return 'bg-[#4ADE80]';
      case 'pdf':
        return 'bg-[#FACC15]';
      case 'developer':
        return 'bg-[#A78BFA]';
      case 'text':
        return 'bg-[#38BDF8]';
      case 'utilities':
        return 'bg-[#F472B6]';
      default:
        return 'bg-white';
    }
  };

  const catColor = getCategoryColor();

  return (
    <div className="mb-8">
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs font-black text-black mb-4 flex-wrap"
      >
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        <Link to="/tools" className="hover:underline">
          Tools
        </Link>
        {categoryInfo && (
          <>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            <Link
              to={`/category/${categoryInfo.slug}`}
              className="hover:underline"
            >
              {categoryInfo.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        <span className="bg-[#FACC15] border border-black px-2 py-0.5 rounded-md font-mono">
          {tool.name}
        </span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#000000] text-black ${catColor}`}
          >
            <Icon name={tool.iconName} className="w-7 h-7 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black">
                {tool.name}
              </h1>
              {categoryInfo && (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000000]">
                  {categoryInfo.name}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base font-semibold text-neutral-700 mt-1 max-w-2xl leading-relaxed">
              {tool.tagline}
            </p>
          </div>
        </div>

        {/* Local-first or Neural Engine indicator */}
        <div className="flex items-center gap-2">
          {isServer ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F472B6] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0px_#000000]">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Neural AI Processing</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4ADE80] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0px_#000000]">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>100% In-Browser · Zero Upload</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
