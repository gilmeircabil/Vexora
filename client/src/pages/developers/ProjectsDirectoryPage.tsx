import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, FolderGit2, ArrowRight, X, Plus } from 'lucide-react';
import { developerApi } from '../../services/developerApi.js';
import { useAuth } from '../../context/AuthContext.js';

const PROJECT_CATEGORIES = [
  { id: '', label: 'All Projects' },
  { id: 'web', label: 'Web Apps' },
  { id: 'mobile', label: 'Mobile Apps' },
  { id: 'desktop', label: 'Desktop' },
  { id: 'ai-ml', label: 'AI & ML' },
  { id: 'ui-ux', label: 'UI/UX Design' },
  { id: 'backend', label: 'Backend' },
  { id: 'api-integration', label: 'APIs & Services' },
  { id: 'open-source', label: 'Open Source' },
];

export const ProjectsDirectoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [searchQuery, selectedCategory, currentPage]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const res = await developerApi.searchProjects({
        q: searchQuery,
        category: selectedCategory || undefined,
        page: currentPage,
        limit: 12,
      });

      if (res.success && res.data) {
        setProjects(res.data.projects || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Strip */}
        <div className="border-b border-[var(--theme-gray-border)] pb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] font-mono text-xs font-black shadow-sm mb-2 rounded-lg">
                <FolderGit2 className="w-3.5 h-3.5 text-slate-100" />
                <span>COMMUNITY PROJECT SHOWCASE</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
                Explore Community Projects
              </h1>
              <p className="text-sm sm:text-base font-bold text-slate-300 max-w-2xl mt-2 leading-relaxed">
                Discover applications, developer tools, machine learning experiments, and
                open-source software built by VexoraMods creators.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/developers"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-mono text-xs font-black shadow-sm"
              >
                &larr; Developers Directory
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/developers/projects/manage"
                  className="px-4 py-2.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Publish Project</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black shadow-sm"
                >
                  Sign In to Publish
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search projects by title, description, or tech stack..."
                className="w-full pl-10 pr-9 py-2.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl font-medium text-xs sm:text-sm text-[var(--theme-dirty-white)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-100 hover:scale-110"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Pill Strip */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-black/10">
            {PROJECT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 font-mono text-xs font-black transition-all ${
                    active
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border-black text-slate-100 shadow-sm -translate-y-0.5'
                      : 'bg-slate-900/60 border-black/20 hover:border-black text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-400">
              Showing {projects.length} of {totalCount} published community projects
            </span>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border border-[var(--theme-gray-border)] border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs font-bold">Loading community projects...</span>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-sm hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="h-48 bg-slate-900/60 border-b border-[var(--theme-gray-border)] relative overflow-hidden flex items-center justify-center">
                      {proj.coverImage ? (
                        <img
                          src={proj.coverImage}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-4xl font-mono font-black text-slate-100/20">{'</>'}</div>
                      )}
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white border border-black text-[10px] font-mono font-black uppercase">
                        {proj.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <Link to={`/developers/projects/${proj.slug}`}>
                        <h3 className="font-black text-base text-slate-100 group-hover:underline">
                          {proj.title}
                        </h3>
                      </Link>
                      <p className="text-xs font-semibold text-slate-400 line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-3">
                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1">
                      {(proj.technologies || []).slice(0, 4).map((tech: string) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900/60 border border-black rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Developer Info & Action */}
                    <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                      {proj.profileId ? (
                        <Link
                          to={`/developers/profile/${proj.profileId.username}`}
                          className="flex items-center gap-2 group/author"
                        >
                          <div className="w-6 h-6 rounded-md bg-slate-900/60 border border-black overflow-hidden flex items-center justify-center text-[10px] font-bold">
                            {proj.profileId.profileImage ? (
                              <img
                                src={proj.profileId.profileImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{proj.profileId.displayName?.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-neutral-800 group-hover/author:underline truncate max-w-[120px]">
                            {proj.profileId.displayName}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-xs font-mono text-slate-400">Developer</span>
                      )}

                      <Link
                        to={`/developers/projects/${proj.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-mono font-black text-slate-100 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl shadow-sm space-y-4">
              <p className="font-black text-base text-slate-100">
                No projects found matching your query.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-xl font-mono text-xs font-black disabled:opacity-50"
              >
                &larr; Prev
              </button>
              <span className="font-mono text-xs font-bold px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-xl font-mono text-xs font-black disabled:opacity-50"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
