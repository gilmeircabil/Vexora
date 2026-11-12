import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Star,
  Clock,
  MoreVertical,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  SlidersHorizontal,
  LayoutTemplate,
  Sparkles,
  ArrowUpDown,
  Loader2,
  FolderOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  designStudioApi,
  type DesignProjectDTO,
  type DesignTemplateDTO,
} from '../lib/designStudio/api.js';
import {
  DESIGN_PRESETS,
  DESIGN_CATEGORIES,
  type DesignPreset,
} from '../lib/designStudio/presets.js';

export const DesignStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'starred' | 'templates'>('all');

  // Projects & Templates data
  const [projects, setProjects] = useState<DesignProjectDTO[]>([]);
  const [templates, setTemplates] = useState<DesignTemplateDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Action Menus
  const [isNewDesignModalOpen, setIsNewDesignModalOpen] = useState<boolean>(false);
  const [failedThumbnailIds, setFailedThumbnailIds] = useState<Set<string>>(() => new Set());
  const [selectedPreset, setSelectedPreset] = useState<DesignPreset | null>(null);
  const [customWidth, setCustomWidth] = useState<number>(1080);
  const [customHeight, setCustomHeight] = useState<number>(1080);
  const [customTitle, setCustomTitle] = useState<string>('Untitled Design');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Rename modal
  const [renamingProject, setRenamingProject] = useState<DesignProjectDTO | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>('');

  // Active dropdown menu for project card
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
    loadTemplates();
  }, [sortBy, selectedCategory, activeTab]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await designStudioApi.listProjects({
        search: searchQuery,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        starred: activeTab === 'starred' ? true : undefined,
        sort: sortBy,
      });
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const tpls = await designStudioApi.listTemplates({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      setTemplates(tpls);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      let width = customWidth;
      let height = customHeight;
      let title = customTitle.trim() || 'Untitled Design';
      let category = 'custom';

      if (selectedPreset) {
        width = selectedPreset.width;
        height = selectedPreset.height;
        category = selectedPreset.category;
        if (!customTitle || customTitle === 'Untitled Design') {
          title = `${selectedPreset.name} Design`;
        }
      }

      // If user is not signed in, open the design studio in Guest Mode with local storage
      if (!isAuthenticated) {
        localStorage.removeItem('vexoramods_draft_project');
        localStorage.removeItem('toolnest_draft_project');
        setIsNewDesignModalOpen(false);
        showToast('Opening VexoraMods Studio in Guest Mode. Sign in anytime to sync.', 'info');
        navigate(`/studio/editor/draft?w=${width}&h=${height}&title=${encodeURIComponent(title)}`);
        return;
      }

      const newProj = await designStudioApi.createProject({
        title,
        width,
        height,
        category,
      });

      setIsNewDesignModalOpen(false);
      showToast('Created new design!', 'success');
      navigate(`/studio/editor/${newProj._id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create project', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      if (!isAuthenticated) {
        const tpl = templates.find((t) => t._id === templateId);
        if (tpl) {
          const draftDoc = {
            _id: 'draft',
            title: `${tpl.title} (Draft)`,
            width: tpl.width,
            height: tpl.height,
            background: tpl.documentData.background || '#ffffff',
            documentData: tpl.documentData,
          };
          localStorage.setItem('vexoramods_draft_project', JSON.stringify(draftDoc));
        }
        showToast('Opening template in Guest Mode. Sign in to save to your account.', 'info');
        navigate('/studio/editor/draft');
        return;
      }

      const project = await designStudioApi.useTemplate(templateId);
      showToast('Template opened successfully!', 'success');
      navigate(`/studio/editor/${project._id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to open template', 'error');
    }
  };

  const handleToggleStar = async (project: DesignProjectDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await designStudioApi.updateProject(project._id, {
        isStarred: !project.isStarred,
      });
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? { ...p, isStarred: updated.isStarred } : p)),
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update star', 'error');
    }
  };

  const handleDuplicate = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      const dup = await designStudioApi.duplicateProject(projectId);
      setProjects((prev) => [dup, ...prev]);
      showToast(`Duplicated "${dup.title}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate design', 'error');
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (!confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      return;
    }

    try {
      await designStudioApi.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      showToast('Design deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete design', 'error');
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingProject || !renameTitle.trim()) return;

    try {
      const updated = await designStudioApi.updateProject(renamingProject._id, {
        title: renameTitle.trim(),
      });
      setProjects((prev) =>
        prev.map((p) => (p._id === renamingProject._id ? { ...p, title: updated.title } : p)),
      );
      setRenamingProject(null);
      showToast('Design renamed', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to rename design', 'error');
    }
  };

  const displayedProjects =
    activeTab === 'recent'
      ? projects.slice(0, 8)
      : activeTab === 'starred'
        ? projects.filter((p) => p.isStarred)
        : projects;

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Open Editorial Studio Header */}
      <div className="border-b border-[var(--theme-gray-border)] pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--theme-dirty-white)]">
              VexoraMods Studio
            </h1>
            <p className="text-sm sm:text-base font-normal text-[var(--theme-gray-muted)] leading-relaxed">
              Create, edit, layout, and export stunning graphics, social media posts, thumbnails,
              and presentations directly in your browser. 100% Free core editing.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedPreset(null);
                setCustomTitle('Untitled Design');
                setIsNewDesignModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-bold text-sm rounded-xl border border-[var(--theme-dirty-white)] shadow-xs transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Design</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Quick Starters Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-gray-muted)]">
            Start from Canvas Presets
          </h2>
          <span className="text-xs font-medium text-[var(--theme-gray-muted)]">Popular formats</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {DESIGN_PRESETS.slice(0, 5).map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPreset(preset);
                setCustomWidth(preset.width);
                setCustomHeight(preset.height);
                setCustomTitle(`${preset.name} Design`);
                setIsNewDesignModalOpen(true);
              }}
              className="p-4 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] hover:border-[var(--theme-gray-subtle)] rounded-2xl text-left transition-all cursor-pointer group shadow-xs hover:-translate-y-0.5"
            >
              <div className="text-[11px] font-mono font-bold text-[var(--theme-gray-muted)] mb-1">
                {preset.aspectRatio}
              </div>
              <h3 className="font-bold text-sm text-[var(--theme-dirty-white)] truncate group-hover:underline">
                {preset.name}
              </h3>
              <p className="text-[11px] font-normal text-[var(--theme-gray-muted)] mt-0.5 truncate">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Editing History Strip */}
      {projects.length > 0 && (
        <div className="p-5 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-dirty-white)] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
              <span>Recent Editing History</span>
            </h2>
            <span className="text-[11px] font-medium text-[var(--theme-gray-muted)]">
              Jump back into your latest sessions
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {projects.slice(0, 4).map((recentProj) => (
              <div
                key={`recent-${recentProj._id}`}
                onClick={() => navigate(`/studio/editor/${recentProj._id}`)}
                className="p-3.5 bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] hover:border-[var(--theme-gray-subtle)] rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--theme-dirty-white)] truncate group-hover:underline">
                    {recentProj.title}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--theme-gray-muted)] mt-0.5">
                    v{recentProj.currentVersion} • {recentProj.width}×{recentProj.height}
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-[var(--theme-dirty-white)] group-hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] rounded-lg shrink-0 transition-colors">
                  Resume
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Tabs & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-gray-border)] pb-4">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'My Designs' },
              { id: 'recent', label: 'Recent' },
              { id: 'starred', label: 'Starred' },
              { id: 'templates', label: 'Templates' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl border border-[var(--theme-gray-border)] font-bold text-xs sm:text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                    : 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-gray-border)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Sort, View mode */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-gray-muted)]" />
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadProjects()}
                className="pl-9 pr-3 py-1.5 bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] text-xs font-medium text-[var(--theme-dirty-white)] focus:outline-none focus:border-[var(--theme-dirty-white)] w-40 sm:w-56"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] text-xs font-medium text-[var(--theme-dirty-white)] focus:outline-none cursor-pointer"
            >
              <option value="updatedAt_desc">Last Modified</option>
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]' : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]' : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ===================== TAB CONTENT: MY DESIGNS / RECENT / STARRED ===================== */}
        {activeTab !== 'templates' ? (
          isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-slate-100" />
              <span className="text-sm font-bold">Loading your designs...</span>
            </div>
          ) : displayedProjects.length === 0 ? (
            <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 bg-[var(--theme-surface-raised)] rounded-2xl border border-[var(--theme-gray-border)] flex items-center justify-center mx-auto shadow-xs">
                <FolderOpen className="w-8 h-8 text-[var(--theme-dirty-white)]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[var(--theme-dirty-white)]">No designs found</h3>
                <p className="text-xs font-normal text-[var(--theme-gray-muted)] max-w-sm mx-auto">
                  {searchQuery
                    ? 'No projects matched your search criteria.'
                    : activeTab === 'starred'
                      ? 'You have not starred any designs yet.'
                      : 'You have not created any designs yet. Get started by clicking Create New Design!'}
                </p>
              </div>
              <button
                onClick={() => setIsNewDesignModalOpen(true)}
                className="px-5 py-2.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] rounded-xl font-bold text-xs shadow-xs hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Create Design
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedProjects.map((proj) => {
                const dateStr = new Date(proj.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={proj._id}
                    onClick={() => navigate(`/studio/editor/${proj._id}`)}
                    className="group bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs hover:border-[var(--theme-gray-subtle)] hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col"
                  >
                    {/* Thumbnail Preview Area */}
                    <div className="h-44 bg-[var(--theme-canvas)] border-b border-[var(--theme-gray-border)] relative flex items-center justify-center p-3 overflow-hidden">
                      {proj.thumbnailUrl && !failedThumbnailIds.has(proj._id) ? (
                        <img
                          src={proj.thumbnailUrl}
                          alt={proj.title}
                          onError={() => {
                            setFailedThumbnailIds((prev) => {
                              const next = new Set(prev);
                              next.add(proj._id);
                              return next;
                            });
                          }}
                          className="max-h-full max-w-full object-contain drop-shadow"
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: proj.background || '#18181b' }}
                          className="w-28 h-28 rounded-lg border border-[var(--theme-gray-border)] shadow-xs flex items-center justify-center font-mono text-xs text-[var(--theme-gray-muted)]"
                        >
                          {proj.width}×{proj.height}
                        </div>
                      )}

                      {/* Star Button */}
                      <button
                        onClick={(e) => handleToggleStar(proj, e)}
                        className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-[var(--theme-surface)]/90 hover:bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs transition-colors"
                        title={proj.isStarred ? 'Unstar' : 'Star design'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            proj.isStarred ? 'fill-[var(--theme-dirty-white)] text-[var(--theme-dirty-white)]' : 'text-[var(--theme-gray-dim)]'
                          }`}
                        />
                      </button>

                      {/* Menu trigger */}
                      <div className="absolute top-2.5 right-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === proj._id ? null : proj._id);
                          }}
                          className="p-1.5 rounded-lg bg-[var(--theme-surface)]/90 hover:bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === proj._id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1 w-40 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] shadow-md py-1.5 z-30 divide-y divide-[var(--theme-gray-border)]/50"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setRenamingProject(proj);
                                setRenameTitle(proj.title);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs font-medium text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)] flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Rename
                            </button>
                            <button
                              onClick={(e) => handleDuplicate(proj._id, e)}
                              className="w-full px-3 py-1.5 text-left text-xs font-medium text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)] flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Duplicate
                            </button>
                            <button
                              onClick={(e) => handleDelete(proj._id, e)}
                              className="w-full px-3 py-1.5 text-left text-xs font-medium text-red-400 hover:bg-[var(--theme-surface-raised)] flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-bold text-sm text-[var(--theme-dirty-white)] truncate group-hover:underline" title={proj.title}>
                          {proj.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--theme-gray-muted)] mt-1">
                          <span>
                            {proj.width} × {proj.height} px
                          </span>
                          <span>•</span>
                          <span>v{proj.currentVersion}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--theme-gray-border)] text-[10px] font-medium text-[var(--theme-gray-muted)]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span className="text-[var(--theme-dirty-white)] font-bold flex items-center gap-0.5 group-hover:underline transition-colors">
                          Open Editor →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[11px] font-bold uppercase text-[var(--theme-gray-muted)]">
                    <th className="py-3 px-4">Design Title</th>
                    <th className="py-3 px-4">Dimensions</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Last Modified</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-gray-border)] text-xs font-medium text-[var(--theme-dirty-white)]">
                  {displayedProjects.map((proj) => (
                    <tr
                      key={proj._id}
                      onClick={() => navigate(`/studio/editor/${proj._id}`)}
                      className="hover:bg-[var(--theme-surface-raised)] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={(e) => handleToggleStar(proj, e)}
                            className="text-[var(--theme-gray-dim)] hover:text-[var(--theme-dirty-white)]"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                proj.isStarred ? 'fill-[var(--theme-dirty-white)] text-[var(--theme-dirty-white)]' : ''
                              }`}
                            />
                          </button>
                          <span className="font-bold truncate max-w-xs">{proj.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--theme-gray-muted)] font-mono">
                        {proj.width} × {proj.height} px
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] rounded text-[10px] font-bold font-mono">
                          v{proj.currentVersion}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--theme-gray-muted)] font-mono">
                        {new Date(proj.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setRenamingProject(proj);
                              setRenameTitle(proj.title);
                            }}
                            className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)]"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDuplicate(proj._id, e)}
                            className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)]"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(proj._id, e)}
                            className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] hover:bg-rose-950/40 text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ===================== TAB CONTENT: TEMPLATES ===================== */
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {DESIGN_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] shadow-xs'
                      : 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-gray-border)]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl._id}
                  className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] rounded text-[10px] font-bold uppercase">
                        {tpl.category}
                      </span>
                      <span className="text-[10px] font-medium text-[var(--theme-gray-muted)]">
                        {tpl.width}×{tpl.height}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[var(--theme-dirty-white)]">{tpl.title}</h3>
                    <p className="text-xs font-normal text-[var(--theme-gray-muted)]">{tpl.description}</p>
                  </div>

                  <button
                    onClick={() => handleUseTemplate(tpl._id)}
                    className="w-full py-2.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-bold text-xs rounded-xl shadow-xs hover:bg-[var(--theme-dirty-white-muted)] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[var(--theme-canvas)]" />
                    Use This Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================== CREATE NEW DESIGN MODAL ===================== */}
      {isNewDesignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 shadow-xl text-[var(--theme-dirty-white)]">
            <h3 className="text-xl font-bold text-[var(--theme-dirty-white)] mb-1">Create New Design</h3>
            <p className="text-xs font-normal text-[var(--theme-gray-muted)] mb-4">
              Choose a template preset or configure custom canvas dimensions.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Design Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[var(--theme-dirty-white)] mb-1.5">
                  Design Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Summer Campaign Poster"
                  className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] text-sm font-medium text-[var(--theme-dirty-white)] placeholder:text-[var(--theme-gray-muted)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
                />
              </div>

              {/* Presets List */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[var(--theme-dirty-white)] mb-1.5">
                  Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {DESIGN_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(p);
                        setCustomWidth(p.width);
                        setCustomHeight(p.height);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPreset?.id === p.id
                          ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-xs'
                          : 'bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)]'
                      }`}
                    >
                      <div className={`text-xs font-bold truncate ${selectedPreset?.id === p.id ? 'text-[var(--theme-canvas)]' : 'text-[var(--theme-dirty-white)]'}`}>
                        {p.name}
                      </div>
                      <div className={`text-[10px] font-medium ${selectedPreset?.id === p.id ? 'text-[var(--theme-canvas)]/70' : 'text-[var(--theme-gray-muted)]'}`}>
                        {p.width}×{p.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Dimensions */}
              <div className="pt-2 border-t border-[var(--theme-gray-border)]">
                <label className="block text-xs font-bold uppercase tracking-wide text-[var(--theme-dirty-white)] mb-1.5">
                  Custom Dimensions (Pixels)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-[var(--theme-gray-muted)] block mb-0.5">
                      WIDTH
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="8000"
                      value={customWidth}
                      onChange={(e) => {
                        setSelectedPreset(null);
                        setCustomWidth(parseInt(e.target.value, 10) || 1080);
                      }}
                      className="w-full px-3 py-2 bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] text-sm font-semibold text-[var(--theme-dirty-white)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[var(--theme-gray-muted)] block mb-0.5">
                      HEIGHT
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="8000"
                      value={customHeight}
                      onChange={(e) => {
                        setSelectedPreset(null);
                        setCustomHeight(parseInt(e.target.value, 10) || 1080);
                      }}
                      className="w-full px-3 py-2 bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] text-sm font-semibold text-[var(--theme-dirty-white)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
                    />
                  </div>
                </div>
              </div>

              {/* Account / Cloud Sync Status Info */}
              {isAuthenticated ? (
                <div className="p-2.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium text-[var(--theme-dirty-white)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--theme-dirty-white)] shrink-0" />
                  <span>Cloud Sync Active — Designs are automatically saved to your account.</span>
                </div>
              ) : (
                <div className="p-2.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium text-[var(--theme-dirty-white)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[var(--theme-gray-muted)] shrink-0" />
                    <span>Guest Mode — Saved in your browser.</span>
                  </div>
                  <Link
                    to="/login?redirect=/studio"
                    className="underline font-bold text-[var(--theme-dirty-white)] hover:text-[var(--theme-dirty-white-muted)] shrink-0"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-[var(--theme-gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewDesignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--theme-gray-border)] font-bold text-sm bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[var(--theme-gray-border)] font-bold text-sm bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Canvas'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== RENAME MODAL ===================== */}
      {renamingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] p-5 shadow-xl text-[var(--theme-dirty-white)]">
            <h3 className="text-base font-bold text-[var(--theme-dirty-white)] mb-3">Rename Design</h3>
            <form onSubmit={handleRename} className="space-y-4">
              <input
                type="text"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                maxLength={100}
                autoFocus
                className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] text-sm font-semibold text-[var(--theme-dirty-white)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingProject(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-[var(--theme-gray-border)] font-bold text-xs bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl border border-[var(--theme-gray-border)] font-bold text-xs bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] shadow-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
