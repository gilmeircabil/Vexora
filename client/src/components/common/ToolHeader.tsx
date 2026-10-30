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

  return (
    <div className="mb-8">
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4 flex-wrap"
      >
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link to="/tools" className="hover:text-indigo-600 transition-colors">
          Tools
        </Link>
        {categoryInfo && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link
              to={`/category/${categoryInfo.slug}`}
              className="hover:text-indigo-600 transition-colors"
            >
              {categoryInfo.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-800 font-medium truncate">
          {tool.name}
        </span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
            <Icon name={tool.iconName} className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-800">
                {tool.name}
              </h1>
              {categoryInfo && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/80">
                  {categoryInfo.name}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-neutral-600 mt-1 max-w-2xl leading-relaxed">
              {tool.tagline}
            </p>
          </div>
        </div>

        {/* Local-first or Neural Engine indicator */}
        <div className="flex items-center gap-2">
          {isServer ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-mono font-medium border border-purple-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Neural AI Processing</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-mono font-medium border border-emerald-200/80 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Client-Side · Zero Upload</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
