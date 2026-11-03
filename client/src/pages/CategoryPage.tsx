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

  const getCategoryColor = () => {
    switch (category.id) {
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
        return 'bg-[#FACC15]';
    }
  };

  const catColor = getCategoryColor();

  return (
    <div className="space-y-10">
      {/* Category Header */}
      <div className="border-b-2 border-black pb-8 space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs font-black text-black"
        >
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          <Link to="/tools" className="hover:underline">
            Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          <span className="bg-[#FACC15] border border-black px-2 py-0.5 rounded-md font-mono">
            {category.name}
          </span>
        </nav>

        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#000000] text-black ${catColor}`}
          >
            <Icon name={category.iconName} className="w-7 h-7 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black">
                {category.name}
              </h1>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000000]">
                {tools.length} utilities
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-neutral-700 mt-1 max-w-2xl leading-relaxed">
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
      <section className="pt-12 border-t-2 border-black/10 space-y-4">
        <h2 className="text-xs font-mono font-black uppercase tracking-wider text-black">
          Other Tool Suites
        </h2>
        <div className="flex items-center gap-2.5 flex-wrap">
          {CATEGORIES.filter((c) => c.id !== category.id).map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-black hover:bg-[#FACC15] text-xs font-black text-black transition-all shadow-[2.5px_2.5px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Icon name={c.iconName} className="w-4 h-4 stroke-[2.5]" />
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
