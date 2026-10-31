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
import { DESIGN_PRESETS, DESIGN_CATEGORIES, type DesignPreset } from '../lib/designStudio/presets.js';

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
        navigate(`/design-studio/editor/draft?w=${width}&h=${height}&title=${encodeURIComponent(title)}`);
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
      navigate(`/design-studio/editor/${newProj._id}`);
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
        navigate('/design-studio/editor/draft');
        return;
      }

      const project = await designStudioApi.useTemplate(templateId);
      showToast('Template opened successfully!', 'success');
      navigate(`/design-studio/editor/${project._id}`);
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
      setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, isStarred: updated.isStarred } : p)));
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
      {/* Neo-Brutalist Studio Banner */}
      <div className="bg-[#FAF7F2] rounded-3xl border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_#000000] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FACC15] rounded-xl border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000000]">
              <Sparkles className="w-4 h-4 text-black" />
              <span>Free Vector & Raster Design Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
              VexoraMods Studio
            </h1>
            <p className="text-sm sm:text-base font-semibold text-gray-700">
              Create, edit, layout, and export stunning graphics, social media posts, thumbnails, and presentations directly in your browser. 100% Free core editing.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedPreset(null);
                setCustomTitle('Untitled Design');
                setIsNewDesignModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#FACC15] hover:bg-amber-400 text-black font-black text-base rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Create New Design</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Quick Starters Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-black">Start from Canvas Presets</h2>
          <span className="text-xs font-bold text-gray-500">Popular formats</span>
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
              className="p-4 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] hover:-translate-y-1 hover:shadow-[5px_5px_0px_#000000] active:translate-y-0 text-left transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border-2 border-black flex items-center justify-center font-black text-xs text-black group-hover:bg-[#FACC15] transition-colors mb-2.5">
                {preset.aspectRatio}
              </div>
              <h3 className="font-black text-sm text-black truncate">{preset.name}</h3>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Tabs & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
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
                className={`px-4 py-2 rounded-xl border-2 border-black font-black text-xs sm:text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-black text-[#FACC15] shadow-[2.5px_2.5px_0px_#000000]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Sort, View mode */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadProjects()}
                className="pl-9 pr-3 py-1.5 bg-white rounded-xl border-2 border-black text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#FACC15] w-40 sm:w-56"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-white rounded-xl border-2 border-black text-xs font-bold text-black focus:outline-none cursor-pointer"
            >
              <option value="updatedAt_desc">Last Modified</option>
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-xl border-2 border-black p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-black text-[#FACC15]' : 'text-gray-500 hover:text-black'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-black text-[#FACC15]' : 'text-gray-500 hover:text-black'
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
              <Loader2 className="w-8 h-8 animate-spin text-black" />
              <span className="text-sm font-bold">Loading your designs...</span>
            </div>
          ) : displayedProjects.length === 0 ? (
            <div className="bg-white rounded-3xl border-3 border-black p-12 text-center shadow-[6px_6px_0px_#000000] space-y-4">
              <div className="w-16 h-16 bg-[#FEF08A] rounded-2xl border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000000]">
                <FolderOpen className="w-8 h-8 text-black" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-black">No designs found</h3>
                <p className="text-xs font-semibold text-gray-600 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No projects matched your search criteria.'
                    : activeTab === 'starred'
                      ? 'You have not starred any designs yet.'
                      : 'You have not created any designs yet. Get started by clicking Create New Design!'}
                </p>
              </div>
              <button
                onClick={() => setIsNewDesignModalOpen(true)}
                className="px-5 py-2.5 bg-[#FACC15] rounded-xl border-2 border-black font-black text-xs text-black shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
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
                    onClick={() => navigate(`/design-studio/editor/${proj._id}`)}
                    className="group bg-white rounded-2xl border-2 border-black overflow-hidden shadow-[4px_4px_0px_#000000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000000] active:translate-y-0 transition-all cursor-pointer flex flex-col"
                  >
                    {/* Thumbnail Preview Area */}
                    <div className="h-44 bg-[#F3EFE6] border-b-2 border-black relative flex items-center justify-center p-3 overflow-hidden">
                      {proj.thumbnailUrl ? (
                        <img
                          src={proj.thumbnailUrl}
                          alt={proj.title}
                          className="max-h-full max-w-full object-contain drop-shadow"
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: proj.background || '#ffffff' }}
                          className="w-28 h-28 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center font-black text-xs text-black/50"
                        >
                          {proj.width}×{proj.height}
                        </div>
                      )}

                      {/* Star Button */}
                      <button
                        onClick={(e) => handleToggleStar(proj, e)}
                        className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-white/90 hover:bg-white border border-black shadow-[1px_1px_0px_#000000] transition-colors"
                        title={proj.isStarred ? 'Unstar' : 'Star design'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            proj.isStarred ? 'fill-[#FACC15] text-[#FACC15]' : 'text-gray-400'
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
                          className="p-1.5 rounded-lg bg-white/90 hover:bg-white border border-black shadow-[1px_1px_0px_#000000] transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-black" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === proj._id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1 w-40 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_#000000] py-1.5 z-30"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setRenamingProject(proj);
                                setRenameTitle(proj.title);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs font-bold text-black hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Rename
                            </button>
                            <button
                              onClick={(e) => handleDuplicate(proj._id, e)}
                              className="w-full px-3 py-1.5 text-left text-xs font-bold text-black hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Duplicate
                            </button>
                            <button
                              onClick={(e) => handleDelete(proj._id, e)}
                              className="w-full px-3 py-1.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-black text-sm text-black truncate" title={proj.title}>
                          {proj.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mt-1">
                          <span>
                            {proj.width} × {proj.height} px
                          </span>
                          <span>•</span>
                          <span>v{proj.currentVersion}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-black/10 text-[10px] font-bold text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span className="text-black font-black flex items-center gap-0.5 group-hover:text-[#EA580C] transition-colors">
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
            <div className="bg-white rounded-2xl border-2 border-black overflow-hidden shadow-[4px_4px_0px_#000000]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-[#FAF7F2] text-[11px] font-black uppercase text-black">
                    <th className="py-3 px-4">Design Title</th>
                    <th className="py-3 px-4">Dimensions</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Last Modified</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 text-xs font-bold text-black">
                  {displayedProjects.map((proj) => (
                    <tr
                      key={proj._id}
                      onClick={() => navigate(`/design-studio/editor/${proj._id}`)}
                      className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={(e) => handleToggleStar(proj, e)}
                            className="text-gray-400 hover:text-black"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                proj.isStarred ? 'fill-[#FACC15] text-[#FACC15]' : ''
                              }`}
                            />
                          </button>
                          <span className="font-black truncate max-w-xs">{proj.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-semibold">
                        {proj.width} × {proj.height} px
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-black text-[#FACC15] rounded text-[10px] font-black">
                          v{proj.currentVersion}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-semibold">
                        {new Date(proj.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setRenamingProject(proj);
                              setRenameTitle(proj.title);
                            }}
                            className="p-1.5 rounded-lg border border-black hover:bg-gray-100"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDuplicate(proj._id, e)}
                            className="p-1.5 rounded-lg border border-black hover:bg-gray-100"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(proj._id, e)}
                            className="p-1.5 rounded-lg border border-black hover:bg-red-500 hover:text-white"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl._id}
                  className="bg-white rounded-2xl border-2 border-black overflow-hidden shadow-[4px_4px_0px_#000000] p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-[#FACC15] border border-black rounded text-[10px] font-black uppercase text-black">
                        {tpl.category}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">
                        {tpl.width}×{tpl.height}
                      </span>
                    </div>
                    <h3 className="font-black text-base text-black">{tpl.title}</h3>
                    <p className="text-xs font-semibold text-gray-600">{tpl.description}</p>
                  </div>

                  <button
                    onClick={() => handleUseTemplate(tpl._id)}
                    className="w-full py-2.5 bg-black text-[#FACC15] font-black text-xs rounded-xl border border-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#FACC15]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-3xl border-4 border-black p-6 shadow-[8px_8px_0px_#000000]">
            <h3 className="text-xl font-black text-black mb-1">Create New Design</h3>
            <p className="text-xs font-semibold text-gray-600 mb-4">
              Choose a template preset or configure custom canvas dimensions.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Design Title */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  Design Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Summer Campaign Poster"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border-2 border-black text-sm font-black text-black focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>

              {/* Presets List */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
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
                      className={`p-2.5 rounded-xl border-2 border-black text-left transition-all ${
                        selectedPreset?.id === p.id
                          ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000000]'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-xs font-black text-black truncate">{p.name}</div>
                      <div className="text-[10px] font-semibold text-gray-600">
                        {p.width}×{p.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Dimensions */}
              <div className="pt-2 border-t-2 border-black/10">
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  Custom Dimensions (Pixels)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-0.5">WIDTH</label>
                    <input
                      type="number"
                      min="50"
                      max="8000"
                      value={customWidth}
                      onChange={(e) => {
                        setSelectedPreset(null);
                        setCustomWidth(parseInt(e.target.value, 10) || 1080);
                      }}
                      className="w-full px-3 py-2 bg-white rounded-xl border-2 border-black text-sm font-bold text-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-0.5">HEIGHT</label>
                    <input
                      type="number"
                      min="50"
                      max="8000"
                      value={customHeight}
                      onChange={(e) => {
                        setSelectedPreset(null);
                        setCustomHeight(parseInt(e.target.value, 10) || 1080);
                      }}
                      className="w-full px-3 py-2 bg-white rounded-xl border-2 border-black text-sm font-bold text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Account / Cloud Sync Status Info */}
              {isAuthenticated ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-400 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cloud Sync Active — Designs are automatically saved to your account.</span>
                </div>
              ) : (
                <div className="p-2.5 bg-amber-50 border border-amber-400 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Guest Mode — Saved in your browser.</span>
                  </div>
                  <Link to="/login?redirect=/design-studio" className="underline font-black text-black hover:text-amber-800 shrink-0">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewDesignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border-2 border-black font-bold text-sm bg-white hover:bg-gray-100 text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-black font-black text-sm bg-[#FACC15] text-black shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#FAF7F2] rounded-2xl border-4 border-black p-5 shadow-[8px_8px_0px_#000000]">
            <h3 className="text-base font-black text-black mb-3">Rename Design</h3>
            <form onSubmit={handleRename} className="space-y-4">
              <input
                type="text"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                maxLength={100}
                autoFocus
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border-2 border-black text-sm font-bold text-black focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingProject(null)}
                  className="px-3.5 py-1.5 rounded-xl border-2 border-black font-bold text-xs bg-white hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl border-2 border-black font-black text-xs bg-[#FACC15] text-black shadow-[2px_2px_0px_#000000]"
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
