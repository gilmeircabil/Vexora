import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Edit, Trash2, Eye, X, Save, Layers, ArrowLeft, Heart, MessageSquare } from 'lucide-react';
import { developerApi } from '../../services/developerApi.js';
import { useToast } from '../../context/ToastContext.js';

export const ManageProjectsPage: React.FC = () => {
  const { toast } = useToast();

  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal (Create or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('web');
  const [coverImage, setCoverImage] = useState('');
  const [technologiesStr, setTechnologiesStr] = useState('');
  const [role, setRole] = useState('Creator');
  const [contributions, setContributions] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  useEffect(() => {
    loadMyProjects();
  }, []);

  const loadMyProjects = async () => {
    try {
      setIsLoading(true);
      const res = await developerApi.getMyProjects();
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('web');
    setCoverImage('');
    setTechnologiesStr('');
    setRole('Creator');
    setContributions('');
    setLiveDemoUrl('');
    setRepositoryUrl('');
    setStatus('published');
    setIsModalOpen(true);
  };

  const openEditModal = (proj: any) => {
    setEditingId(proj._id);
    setTitle(proj.title || '');
    setDescription(proj.description || '');
    setCategory(proj.category || 'web');
    setCoverImage(proj.coverImage || '');
    setTechnologiesStr((proj.technologies || []).join(', '));
    setRole(proj.role || 'Creator');
    setContributions(proj.contributions || '');
    setLiveDemoUrl(proj.liveDemoUrl || '');
    setRepositoryUrl(proj.repositoryUrl || '');
    setStatus(proj.status || 'published');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        coverImage: coverImage.trim(),
        technologies: technologiesStr,
        role: role.trim(),
        contributions: contributions.trim(),
        liveDemoUrl: liveDemoUrl.trim(),
        repositoryUrl: repositoryUrl.trim(),
        status,
      };

      if (editingId) {
        const res = await developerApi.updateProject(editingId, payload);
        if (res.success) {
          toast('Project updated successfully!', 'success');
          setIsModalOpen(false);
          loadMyProjects();
        } else {
          throw new Error(res.error || 'Failed to update project');
        }
      } else {
        const res = await developerApi.createProject(payload);
        if (res.success) {
          toast('Project published to developer hub!', 'success');
          setIsModalOpen(false);
          loadMyProjects();
        } else {
          throw new Error(res.error || 'Failed to create project');
        }
      }
    } catch (err: any) {
      toast(err.message || 'Error saving project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await developerApi.deleteProject(id);
      if (res.success) {
        toast('Project deleted.', 'success');
        loadMyProjects();
      } else {
        throw new Error(res.error || 'Failed to delete');
      }
    } catch (err: any) {
      toast(err.message || 'Delete error', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-4">
          <Link
            to="/developers"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-100 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Developer Hub</span>
          </Link>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[var(--theme-yellow)] text-[var(--theme-canvas)] hover:bg-[var(--theme-yellow-hover)] border border-[var(--theme-yellow)] rounded-xl font-mono text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Publish New Project</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Manage My Projects
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
            Publish web applications, mobile apps, tools, and open-source packages to your developer
            portfolio.
          </p>
        </div>

        {/* Project List */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border border-[var(--theme-gray-border)] border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs font-bold">Loading your projects...</span>
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-slate-900/60 border border-[var(--theme-gray-border)] overflow-hidden flex items-center justify-center font-black text-sm shrink-0">
                    {proj.coverImage ? (
                      <img src={proj.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{'</>'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-slate-100 truncate">{proj.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          proj.status === 'published'
                            ? 'bg-green-100 border-green-800 text-green-900'
                            : 'bg-neutral-100 border-neutral-400 text-slate-400'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium line-clamp-1 mt-0.5">
                      {proj.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 mt-1.5 flex-wrap">
                      <span className="capitalize font-bold bg-slate-900/60 border border-black/30 px-1.5 py-0.5 rounded text-[10px]">
                        {proj.category}
                      </span>
                      <span className="font-semibold flex items-center gap-1 bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] px-1.5 py-0.5 rounded text-[10px]">
                        <Eye className="w-3 h-3 text-[var(--theme-gray-muted)]" />
                        <span>{proj.viewCount || 0} views</span>
                      </span>
                      <span className="font-semibold flex items-center gap-1 bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] px-1.5 py-0.5 rounded text-[10px]">
                        <Heart className="w-3 h-3 text-[var(--theme-gray-muted)]" />
                        <span>{proj.reactionCount || 0} reactions</span>
                      </span>
                      <span className="font-semibold flex items-center gap-1 bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] px-1.5 py-0.5 rounded text-[10px]">
                        <MessageSquare className="w-3 h-3 text-[var(--theme-gray-muted)]" />
                        <span>{proj.commentCount || 0} comments</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    to={`/developers/projects/${proj.slug}`}
                    className="p-2 bg-slate-900/60 hover:bg-neutral-200 border border-[var(--theme-gray-border)] rounded-xl text-slate-100"
                    title="View Public Page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => openEditModal(proj)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-slate-100"
                    title="Edit Project"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(proj._id, proj.title)}
                    className="p-2 bg-red-50 hover:bg-red-100 border border-[var(--theme-gray-border)] rounded-xl text-red-600"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl shadow-sm space-y-4">
            <Layers className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-black text-slate-100">No projects created yet</h3>
            <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">
              Showcase your applications, designs, and tools to recruiters and potential clients.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black shadow-sm cursor-pointer"
            >
              + Publish Your First Project
            </button>
          </div>
        )}

        {/* Modal Dialog for Project Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-sm space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-3">
                <h3 className="font-black text-lg text-slate-100">
                  {editingId ? 'Edit Project' : 'Publish New Project'}
                </h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Modern E-Commerce Platform"
                    className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase font-mono mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold"
                    >
                      <option value="web">Web Development</option>
                      <option value="mobile">Mobile Development</option>
                      <option value="desktop">Desktop Applications</option>
                      <option value="ai-ml">AI & Machine Learning</option>
                      <option value="ui-ux">UI/UX Design</option>
                      <option value="backend">Backend Development</option>
                      <option value="api-integration">APIs & Integrations</option>
                      <option value="open-source">Open Source</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase font-mono mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold"
                    >
                      <option value="published">Published (Visible in Directory)</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/screenshot.png"
                    className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">
                    Project Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed explanation of what this application does, problem solved, architecture..."
                    className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">
                    Technologies Used (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={technologiesStr}
                    onChange={(e) => setTechnologiesStr(e.target.value)}
                    placeholder="React, Next.js, TypeScript, Tailwind CSS, PostgreSQL"
                    className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-mono font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase font-mono mb-1">
                      Your Role
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Lead Full-Stack Developer"
                      className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase font-mono mb-1">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={liveDemoUrl}
                      onChange={(e) => setLiveDemoUrl(e.target.value)}
                      placeholder="https://myproject.com"
                      className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">
                    GitHub / Source Repository URL
                  </label>
                  <input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">
                    Key Contributions & Architecture
                  </label>
                  <textarea
                    rows={2}
                    value={contributions}
                    onChange={(e) => setContributions(e.target.value)}
                    placeholder="Specific modules you built (e.g. auth microservice, real-time sync, state store)..."
                    className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[var(--theme-yellow)] text-[var(--theme-canvas)] hover:bg-[var(--theme-yellow-hover)] border border-[var(--theme-yellow)] rounded-xl font-mono text-xs font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Saving Project...'
                        : editingId
                          ? 'Update Project'
                          : 'Publish Project'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
