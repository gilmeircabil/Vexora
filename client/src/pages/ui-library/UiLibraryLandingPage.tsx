import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Search,
  Star,
  Sparkles,
  LayoutGrid,
  Laptop,
  LayoutDashboard,
  Palette,
  Sliders,
  Heart,
  ChevronRight,
  ArrowRight,
  Layers,
  Check,
  Compass,
} from 'lucide-react';
import {
  ALL_COMPONENTS,
  WEBSITE_LAYOUTS,
  DASHBOARD_LAYOUTS,
  DESIGN_STYLES,
  UIComponentCategory,
  UILibrarySection,
  UIComponentItem,
} from '../../features/ui-library/data/index.js';
import { ComponentPreviewRenderer } from '../../features/ui-library/previews/ComponentPreviewRenderer.js';
import { useUiLibraryFavorites } from '../../features/ui-library/context/UiLibraryFavoritesContext.js';
import { Playground } from '../../features/ui-library/components/Playground.js';

export const UiLibraryLandingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isFavorite, toggleFavorite, favoriteIds } = useUiLibraryFavorites();

  // Active section from query param or default
  const activeSection = (searchParams.get('section') as UILibrarySection) || 'components';
  const activeCategory = (searchParams.get('category') as UIComponentCategory | 'all') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'all' | 'popular' | 'recent' | 'alphabetical' | 'beginner'>('all');

  const setSection = (sec: UILibrarySection) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('section', sec);
      return next;
    });
  };

  const setCategory = (cat: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cat === 'all') next.delete('category');
      else next.set('category', cat);
      return next;
    });
  };

  // Filter components
  const filteredComponents = useMemo(() => {
    let list = ALL_COMPONENTS;

    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter((item) => item.category === activeCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.purpose.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sorting
    if (sortBy === 'popular') {
      list = [...list].filter((item) => item.popular);
    } else if (sortBy === 'alphabetical') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'recent') {
      list = [...list].sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''));
    } else if (sortBy === 'beginner') {
      list = list.filter((item) => item.difficulty === 'beginner');
    }

    return list;
  }, [activeCategory, searchQuery, sortBy]);

  // Filter website layouts
  const filteredWebsiteLayouts = useMemo(() => {
    if (!searchQuery.trim()) return WEBSITE_LAYOUTS;
    const q = searchQuery.toLowerCase().trim();
    return WEBSITE_LAYOUTS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.useCase.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  // Filter dashboard layouts
  const filteredDashboardLayouts = useMemo(() => {
    if (!searchQuery.trim()) return DASHBOARD_LAYOUTS;
    const q = searchQuery.toLowerCase().trim();
    return DASHBOARD_LAYOUTS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.useCase.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  // Filter design styles
  const filteredDesignStyles = useMemo(() => {
    if (!searchQuery.trim()) return DESIGN_STYLES;
    const q = searchQuery.toLowerCase().trim();
    return DESIGN_STYLES.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.characteristics.some((c) => c.toLowerCase().includes(q)) ||
        item.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  // Favorites collection
  const favoritedItems = useMemo(() => {
    const list: Array<{ item: any; type: 'component' | 'website-layout' | 'dashboard-layout' | 'design-style' }> = [];
    ALL_COMPONENTS.forEach((c) => {
      if (favoriteIds.includes(c.id)) list.push({ item: c, type: 'component' });
    });
    WEBSITE_LAYOUTS.forEach((w) => {
      if (favoriteIds.includes(w.id)) list.push({ item: w, type: 'website-layout' });
    });
    DASHBOARD_LAYOUTS.forEach((d) => {
      if (favoriteIds.includes(d.id)) list.push({ item: d, type: 'dashboard-layout' });
    });
    DESIGN_STYLES.forEach((s) => {
      if (favoriteIds.includes(s.id)) list.push({ item: s, type: 'design-style' });
    });
    return list;
  }, [favoriteIds]);

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] pb-24">
      {/* Hero Banner */}
      <section className="border-b border-[var(--theme-gray-border)] bg-[var(--theme-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold shadow-xs">
                <LayoutGrid className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
                <span>UI COMPONENT LIBRARY & DESIGN LEARNING CENTER</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--theme-dirty-white)] tracking-tight leading-tight">
                Discover, Study & Preview Modern Web Design
              </h1>
              <p className="text-xs sm:text-sm text-[var(--theme-gray-muted)] leading-relaxed font-normal">
                A visual learning catalog with 100+ production components, 12 complete website layouts, 11 full dashboards, and 14 design styles. Includes responsive previews, beginner-friendly explanations, interactive playgrounds, and copyable React & CSS code.
              </p>
            </div>

            {/* Quick Stats Pill Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full md:w-auto shrink-0 font-bold">
              <div className="p-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl shadow-xs text-center min-w-[120px]">
                <p className="text-xl sm:text-2xl text-[var(--theme-dirty-white)]">102</p>
                <p className="text-[10px] text-[var(--theme-gray-muted)] uppercase tracking-wide">Components</p>
              </div>
              <div className="p-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl shadow-xs text-center min-w-[120px]">
                <p className="text-xl sm:text-2xl text-[var(--theme-dirty-white)]">12</p>
                <p className="text-[10px] text-[var(--theme-gray-muted)] uppercase tracking-wide">Web Layouts</p>
              </div>
              <div className="p-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl shadow-xs text-center min-w-[120px]">
                <p className="text-xl sm:text-2xl text-[var(--theme-dirty-white)]">11</p>
                <p className="text-[10px] text-[var(--theme-gray-muted)] uppercase tracking-wide">Dashboards</p>
              </div>
              <div className="p-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl shadow-xs text-center min-w-[120px]">
                <p className="text-xl sm:text-2xl text-[var(--theme-dirty-white)]">14</p>
                <p className="text-[10px] text-[var(--theme-gray-muted)] uppercase tracking-wide">Design Styles</p>
              </div>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-gray-muted)]" />
            <input
              type="text"
              placeholder="Search components, layouts, design styles, keywords (e.g. Navbar, Glassmorphism, Bento, Dashboard)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] placeholder:[var(--theme-gray-muted)] text-xs sm:text-sm font-medium rounded-2xl border border-[var(--theme-gray-border)] shadow-xs focus:border-[var(--theme-dirty-white)] outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-bold bg-[var(--theme-surface)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] rounded-lg border border-[var(--theme-gray-border)] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Section Navigation Bar */}
      <div className="sticky top-16 z-30 bg-[var(--theme-canvas)]/95 backdrop-blur-md border-b border-[var(--theme-gray-border)] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'components', label: '1. Components', icon: LayoutGrid, count: ALL_COMPONENTS.length },
            { id: 'website-layouts', label: '2. Website Layouts', icon: Laptop, count: WEBSITE_LAYOUTS.length },
            { id: 'dashboard-layouts', label: '3. Dashboard Layouts', icon: LayoutDashboard, count: DASHBOARD_LAYOUTS.length },
            { id: 'design-styles', label: '4. Design Styles', icon: Palette, count: DESIGN_STYLES.length },
            { id: 'playground', label: '5. Interactive Playground', icon: Sliders },
            { id: 'favorites', label: '6. My Favorites', icon: Heart, count: favoriteIds.length },
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSection(sec.id as UILibrarySection)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border-[var(--theme-dirty-white)] shadow-xs'
                    : 'bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] shadow-xs hover:bg-[var(--theme-surface-raised)] hover:text-[var(--theme-dirty-white)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{sec.label}</span>
                {sec.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono border ${
                    isActive ? 'bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] border-transparent' : 'bg-[var(--theme-surface-raised)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)]'
                  }`}>
                    {sec.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* SECTION 1: COMPONENTS */}
        {activeSection === 'components' && (
          <div className="space-y-6">
            {/* Category Filter Pills & Sort Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--theme-surface)] p-4 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'navigation', label: 'A. Navigation (14)' },
                  { id: 'buttons', label: 'B. Buttons (12)' },
                  { id: 'cards', label: 'C. Cards (12)' },
                  { id: 'forms', label: 'D. Forms (17)' },
                  { id: 'data-display', label: 'E. Data Display (19)' },
                  { id: 'feedback', label: 'F. Feedback (13)' },
                  { id: 'advanced', label: 'G. Advanced (15)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      activeCategory === cat.id
                        ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-xs'
                        : 'bg-[var(--theme-surface-raised)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] hover:border-[var(--theme-gray-subtle)] hover:text-[var(--theme-dirty-white)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <span className="text-xs font-bold text-[var(--theme-gray-muted)]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="all">All Items</option>
                  <option value="popular">Popular Highlights</option>
                  <option value="beginner">Beginner Friendly</option>
                  <option value="alphabetical">A–Z Alphabetical</option>
                  <option value="recent">Recently Added</option>
                </select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex justify-between items-center text-xs font-bold text-[var(--theme-gray-muted)] px-1">
              <span>Showing <strong>{filteredComponents.length}</strong> components</span>
              {activeCategory !== 'all' && (
                <button onClick={() => setCategory('all')} className="text-[var(--theme-dirty-white)] hover:underline">
                  Show all categories
                </button>
              )}
            </div>

            {/* Component Cards Grid */}
            {filteredComponents.length === 0 ? (
              <div className="p-12 text-center bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] rounded-3xl shadow-sm space-y-3">
                <Search className="w-8 h-8 text-[var(--theme-dirty-white)] mx-auto" />
                <h3 className="font-black text-base text-[var(--theme-dirty-white)]">No matching components found</h3>
                <p className="text-xs text-[var(--theme-gray-muted)]">Try adjusting your keyword query or resetting active category filters.</p>
                <button
                  onClick={() => { setSearchQuery(''); setCategory('all'); setSortBy('all'); }}
                  className="px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComponents.map((comp) => {
                  const favorited = isFavorite(comp.id);
                  return (
                    <div
                      key={comp.id}
                      className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Live Visual Preview Frame */}
                      <div className="h-48 bg-[var(--theme-surface-raised)] border-b border-[var(--theme-gray-border)] p-4 flex items-center justify-center relative overflow-hidden transition">
                        <ComponentPreviewRenderer itemId={comp.id} itemType="component" />

                        {/* Favorite Star Button */}
                        <button
                          onClick={() => toggleFavorite(comp.id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-[var(--theme-surface)]/90 backdrop-blur border border-[var(--theme-gray-border)] shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer"
                          aria-label="Toggle favorite"
                        >
                          <Star className={`w-4 h-4 ${favorited ? 'fill-[#F472B6] text-[#F472B6]' : 'text-[var(--theme-gray-muted)]'}`} />
                        </button>

                        {/* Category Chip */}
                        <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] text-[10px] font-black rounded-md border border-[var(--theme-gray-border)] uppercase">
                          {comp.category}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-black text-base text-[var(--theme-dirty-white)] group-hover:text-[var(--theme-dirty-white-muted)] transition">
                              {comp.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded border border-[var(--theme-gray-border)] ${
                              comp.difficulty === 'beginner' ? 'bg-[var(--theme-surface-raised)] text-emerald-400' : comp.difficulty === 'intermediate' ? 'bg-[var(--theme-surface-raised)] text-amber-400' : 'bg-[var(--theme-surface-raised)] text-rose-400'
                            }`}>
                              {comp.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--theme-gray-muted)] leading-relaxed line-clamp-2">
                            {comp.description}
                          </p>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-[var(--theme-gray-border)] flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[var(--theme-gray-muted)] font-bold">
                            {comp.variations.length} {comp.variations.length === 1 ? 'variation' : 'variations'}
                          </span>
                          <Link
                            to={`/ui-library/component/${comp.id}`}
                            className="flex items-center gap-1 text-xs font-bold text-[var(--theme-dirty-white)] group-hover:translate-x-1 transition"
                          >
                            <span>Inspect & Learn</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: WEBSITE LAYOUTS */}
        {activeSection === 'website-layouts' && (
          <div className="space-y-6">
            <div className="bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-[var(--theme-dirty-white)]">Complete Website Layouts (12)</h3>
                <p className="text-xs text-[var(--theme-gray-muted)]">Full landing pages, SaaS storefronts, portfolios, documentation, and blogs.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredWebsiteLayouts.map((layout) => {
                const favorited = isFavorite(layout.id);
                return (
                  <div
                    key={layout.id}
                    className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-4 bg-[var(--theme-surface-raised)] border-b border-[var(--theme-gray-border)] relative">
                      <ComponentPreviewRenderer itemId={layout.id} itemType="website-layout" />
                      <button
                        onClick={() => toggleFavorite(layout.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-sm flex items-center justify-center cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${favorited ? 'fill-[#F472B6] text-[#F472B6]' : 'text-[var(--theme-gray-muted)]'}`} />
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-black text-base text-[var(--theme-dirty-white)]">{layout.name}</h4>
                        <p className="text-xs text-[var(--theme-gray-muted)] mt-1 leading-relaxed">{layout.description}</p>
                      </div>

                      <div className="p-3 bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] text-xs space-y-1">
                        <p className="font-black text-[var(--theme-dirty-white)]">Primary Use Case:</p>
                        <p className="text-[var(--theme-gray-muted)]">{layout.useCase}</p>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Link
                          to={`/ui-library/layout/${layout.id}`}
                          className="px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm transition"
                        >
                          View Full Layout & Code →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: DASHBOARD LAYOUTS */}
        {activeSection === 'dashboard-layouts' && (
          <div className="space-y-6">
            <div className="bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-black text-base text-[var(--theme-dirty-white)]">Full Dashboard Layouts (11)</h3>
                <p className="text-xs text-[var(--theme-gray-muted)]">Complete multi-widget dashboards: Admin, Analytics, Finance, CRM, Kanban & Mobile.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDashboardLayouts.map((dash) => {
                const favorited = isFavorite(dash.id);
                return (
                  <div
                    key={dash.id}
                    className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-4 bg-[var(--theme-surface-raised)] border-b border-[var(--theme-gray-border)] relative">
                      <ComponentPreviewRenderer itemId={dash.id} itemType="dashboard-layout" />
                      <button
                        onClick={() => toggleFavorite(dash.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-sm flex items-center justify-center cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${favorited ? 'fill-[#F472B6] text-[#F472B6]' : 'text-[var(--theme-gray-muted)]'}`} />
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-base text-[var(--theme-dirty-white)]">{dash.name}</h4>
                          <span className="text-[10px] font-mono font-bold bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] px-2 py-0.5 border border-[var(--theme-gray-border)] rounded">
                            {dash.layoutType}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--theme-gray-muted)] mt-1 leading-relaxed">{dash.description}</p>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Link
                          to={`/ui-library/layout/${dash.id}`}
                          className="px-4 py-2 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm transition"
                        >
                          View Full Dashboard & Code →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 4: DESIGN STYLES */}
        {activeSection === 'design-styles' && (
          <div className="space-y-6">
            <div className="bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-black text-base text-[var(--theme-dirty-white)]">Design Styles Catalog (14)</h3>
                <p className="text-xs text-[var(--theme-gray-muted)]">Visual styles: Glassmorphism, Neumorphism, Bento Grid, Brutalism, Editorial, Retro & Aurora.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDesignStyles.map((style) => {
                const favorited = isFavorite(style.id);
                return (
                  <div
                    key={style.id}
                    className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-4 bg-[var(--theme-surface-raised)] border-b border-[var(--theme-gray-border)] relative">
                      <ComponentPreviewRenderer itemId={style.id} itemType="design-style" />
                      <button
                        onClick={() => toggleFavorite(style.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${favorited ? 'fill-[#F472B6] text-[#F472B6]' : 'text-[var(--theme-gray-muted)]'}`} />
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-bold text-base text-[var(--theme-dirty-white)]">{style.name}</h4>
                        <p className="text-xs text-[var(--theme-gray-muted)] mt-1 leading-relaxed">{style.description}</p>
                      </div>

                      {/* Color Palette Preview */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--theme-gray-muted)] font-bold uppercase">Palette:</span>
                        <div className="flex gap-1.5">
                          {style.colorPalette.map((col, idx) => (
                            <span
                              key={idx}
                              style={{ backgroundColor: col }}
                              className="w-5 h-5 rounded-md border border-[var(--theme-gray-border)] shadow-xs inline-block"
                              title={col}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Link
                          to={`/ui-library/style/${style.id}`}
                          className="px-4 py-2 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] font-bold text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-xs transition"
                        >
                          Explore Style & Code →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 5: PLAYGROUND */}
        {activeSection === 'playground' && <Playground />}

        {/* SECTION 6: MY FAVORITES */}
        {activeSection === 'favorites' && (
          <div className="space-y-6">
            <div className="bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-[var(--theme-dirty-white)]">My Saved Favorites ({favoritedItems.length})</h3>
                <p className="text-xs text-[var(--theme-gray-muted)]">Your personal saved collection of components, layouts, and styles.</p>
              </div>
            </div>

            {favoritedItems.length === 0 ? (
              <div className="p-12 text-center bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] rounded-3xl shadow-xs space-y-3">
                <Star className="w-8 h-8 text-[var(--theme-dirty-white)] mx-auto" />
                <h4 className="font-bold text-base text-[var(--theme-dirty-white)]">No favorites saved yet</h4>
                <p className="text-xs text-[var(--theme-gray-muted)] max-w-sm mx-auto">
                  Click the star icon on any component, layout, or design style to pin it here for quick reference.
                </p>
                <button
                  onClick={() => setSection('components')}
                  className="px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-bold text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-xs"
                >
                  Browse Component Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritedItems.map(({ item, type }) => (
                  <div
                    key={item.id}
                    className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-4 bg-[var(--theme-surface-raised)] border-b border-[var(--theme-gray-border)] relative">
                      <ComponentPreviewRenderer itemId={item.id} itemType={type} />
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        <Star className="w-4 h-4 fill-[var(--theme-dirty-white)] text-[var(--theme-dirty-white)]" />
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[var(--theme-gray-muted)]">{type}</span>
                        <h4 className="font-bold text-base text-[var(--theme-dirty-white)]">{item.name}</h4>
                        <p className="text-xs text-[var(--theme-gray-muted)] mt-1 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Link
                          to={type === 'component' ? `/ui-library/component/${item.id}` : type === 'design-style' ? `/ui-library/style/${item.id}` : `/ui-library/layout/${item.id}`}
                          className="px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-bold text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-xs"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
