import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, ShieldCheck, Sparkles, Cpu } from 'lucide-react';
import { type ToolDefinition, CATEGORIES } from '../../tools/catalog.js';
import { Icon } from './Icon.js';

interface ToolCardProps {
  tool: ToolDefinition;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const category = CATEGORIES.find((c) => c.id === tool.category);
  const isServer = tool.processingLocation === 'server';

  // Determine technical engine badge
  const getEngineBadge = () => {
    if (isServer) return { label: 'Neural AI', icon: Sparkles, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60' };
    if (tool.category === 'pdf') return { label: 'PDF.js Engine', icon: Cpu, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60' };
    if (tool.category === 'developer') return { label: 'Web Crypto / AST', icon: Cpu, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800/60' };
    if (tool.category === 'images') return { label: 'Canvas2D / WASM', icon: Cpu, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60' };
    return { label: 'Client Engine', icon: Cpu, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60' };
  };

  const engine = getEngineBadge();

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group flex flex-col justify-between bg-white dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl p-5 hover:border-indigo-400/80 dark:hover:border-indigo-500/80 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 text-left relative overflow-hidden"
    >
      <div>
        {/* Header row: Icon, Category pill, and Engine badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-100/80 dark:group-hover:bg-indigo-900/60 transition-all duration-200 border border-indigo-100/80 dark:border-indigo-900/40 shrink-0">
            <Icon name={tool.iconName} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${engine.color}`}
            >
              <engine.icon className="w-3 h-3" />
              {engine.label}
            </span>
            {category && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60">
                {category.name}
              </span>
            )}
          </div>
        </div>

        {/* Tool Name and Tagline */}
        <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {tool.name}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
          {tool.tagline}
        </p>
      </div>

      {/* Footer bar: Privacy badge & Open action */}
      <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
        {isServer ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Neural Process</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% In-Browser</span>
          </span>
        )}

        <span className="inline-flex items-center gap-1 font-medium text-xs text-neutral-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all">
          Open tool
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};
