import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, Shield } from 'lucide-react';
import { type ToolDefinition, CATEGORIES } from '../../tools/catalog.js';
import { Icon } from './Icon.js';

interface ToolCardProps {
  tool: ToolDefinition;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const category = CATEGORIES.find((c) => c.id === tool.category);

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group flex flex-col justify-between bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 text-left"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 border border-indigo-100 dark:border-indigo-900/40">
            <Icon name={tool.iconName} className="w-5 h-5" />
          </div>
          {category && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {category.name}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {tool.name}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
          {tool.tagline}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <Shield className="w-3 h-3" />
          Browser-only
        </span>
        <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          Open tool
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};
