import React from 'react';
import { useParams, Link, Navigate } from 'react-router';
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
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-500">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <span>/</span>
          <Link to="/tools" className="hover:text-indigo-600">
            Tools
          </Link>
          <span>/</span>
          <span className="text-neutral-800 dark:text-neutral-200 font-medium">
            {category.name}
          </span>
        </nav>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60">
            <Icon name={category.iconName} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              {category.name}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Category Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Other Categories Links */}
      <section className="pt-12 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Other Tool Categories
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.filter((c) => c.id !== category.id).map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Icon name={c.iconName} className="w-4 h-4 text-indigo-500" />
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
