import React from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { CATEGORIES, getToolsByCategory } from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { Icon } from '../components/common/Icon.js';

export const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!category) {
    return <Navigate to="/404" replace />;
  }

  const tools = getToolsByCategory(category.id);

  return (
    <div className="space-y-10">
      {/* Category Header */}
      <div className="border-b border-[var(--theme-gray-border)] pb-8 space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400"
        >
          <Link to="/" className="hover:text-white hover:underline">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
          <Link to="/tools" className="hover:text-white hover:underline">
            Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
          <span className="bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] px-2 py-0.5 rounded-md font-mono text-[var(--theme-dirty-white)]">
            {category.name}
          </span>
        </nav>

        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] flex items-center justify-center shrink-0 shadow-sm"
          >
            <Icon name={category.iconName} className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
                {category.name}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 shadow-xs">
                {tools.length} utilities
              </span>
            </div>
            <p className="text-sm sm:text-base font-normal text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Category Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Other Categories Links */}
      <section className="pt-12 border-t border-[var(--theme-gray-border)] space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Other Tool Suites
        </h2>
        <div className="flex items-center gap-2.5 flex-wrap">
          {CATEGORIES.filter((c) => c.id !== category.id).map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] hover:bg-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-xs hover:-translate-y-0.5"
            >
              <Icon name={c.iconName} className="w-4 h-4 text-[var(--theme-dirty-white)] stroke-[2.2]" />
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
