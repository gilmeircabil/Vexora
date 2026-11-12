import React from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { type ToolDefinition, CATEGORIES } from '../../tools/catalog.js';
import { Icon } from './Icon.js';

interface ToolHeaderProps {
  tool: ToolDefinition;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ tool }) => {
  const categoryInfo = CATEGORIES.find((c) => c.id === tool.category);

  return (
    <div className="mb-8">
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-gray-muted)] mb-4 flex-wrap"
      >
        <Link to="/" className="hover:text-[var(--theme-dirty-white)] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 stroke-[2] text-[var(--theme-gray-dim)]" />
        <Link to="/tools" className="hover:text-[var(--theme-dirty-white)] transition-colors">
          Tools
        </Link>
        {categoryInfo && (
          <>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2] text-[var(--theme-gray-dim)]" />
            <Link to={`/category/${categoryInfo.slug}`} className="hover:text-[var(--theme-dirty-white)] transition-colors">
              {categoryInfo.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 stroke-[2] text-[var(--theme-gray-dim)]" />
        <span className="bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] px-2 py-0.5 rounded-md font-mono font-medium">
          {tool.name}
        </span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] flex items-center justify-center shrink-0 shadow-sm"
          >
            <Icon name={tool.iconName} className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--theme-dirty-white)]">
                {tool.name}
              </h1>
              {categoryInfo && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)]">
                  {categoryInfo.name}
                </span>
              )}
              {tool.isExternal && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)]">
                  External Tool
                </span>
              )}
              {tool.toolType === 'ai-powered' && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)]">
                  AI-Powered
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base font-normal text-[var(--theme-gray-muted)] mt-1 max-w-2xl leading-relaxed">
              {tool.tagline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
