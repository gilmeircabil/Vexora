import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
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
        className="flex items-center gap-2 text-xs text-neutral-500 mb-4"
      >
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/tools" className="hover:text-indigo-600 transition-colors">
          Tools
        </Link>
        {categoryInfo && (
          <>
            <span>/</span>
            <Link
              to={`/category/${categoryInfo.slug}`}
              className="hover:text-indigo-600 transition-colors"
            >
              {categoryInfo.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate">
          {tool.name}
        </span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
            <Icon name={tool.iconName} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {tool.name}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
              {tool.tagline}
            </p>
          </div>
        </div>

        {/* Local-first privacy indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200/60 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Local processing · No upload</span>
        </div>
      </div>
    </div>
  );
};
