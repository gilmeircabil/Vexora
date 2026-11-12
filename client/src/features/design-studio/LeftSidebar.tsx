import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutTemplate,
  Shapes,
  Type,
  Upload,
  Palette,
  Layers,
  Square,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Star as StarIcon,
  Hexagon,
  Minus,
  Heart as HeartIcon,
  MessageSquare,
  Trash2,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Loader2,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import type { Canvas, FabricObject } from 'fabric';
import {
  addRectangle,
  addCircle,
  addTriangle,
  addStar,
  addHexagon,
  addLine,
  addHeart,
  addSpeechBubble,
  addText,
  addImageFromUrl,
  isTextObject,
} from './canvasUtils.js';
import {
  designStudioApi,
  type DesignTemplateDTO,
  type DesignAssetDTO,
  type DesignProjectDTO,
} from '../../lib/designStudio/api.js';
import { DESIGN_CATEGORIES } from '../../lib/designStudio/presets.js';

interface LeftSidebarProps {
  canvas: Canvas | null;
  projectId?: string;
  canvasBackground: string;
  onBackgroundChange: (color: string) => void;
  onApplyTemplate: (templateDoc: any) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  canvas,
  projectId,
  canvasBackground,
  onBackgroundChange,
  onApplyTemplate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<
    'templates' | 'elements' | 'text' | 'uploads' | 'projects' | 'backgrounds' | 'layers'
  >('elements');

  const handleItemAdd = (action: () => void) => {
    action();
    if (onCloseMobile && typeof window !== 'undefined' && window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  // Templates state
  const [templates, setTemplates] = useState<DesignTemplateDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);

  // User Projects state
  const [userProjects, setUserProjects] = useState<DesignProjectDTO[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);

  // Uploads state
  const [assets, setAssets] = useState<DesignAssetDTO[]>([]);
  const [failedAssetIds, setFailedAssetIds] = useState<Set<string>>(() => new Set());
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Layers state
  const [canvasObjects, setCanvasObjects] = useState<FabricObject[]>([]);
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null);

  // Synchronize canvas objects for layers tab
  const syncLayers = () => {
    if (!canvas || (canvas as any).__isLoadingJson) return;
    const objs = canvas.getObjects().slice().reverse(); // Top layer first
    setCanvasObjects(objs);
    setActiveObject(canvas.getActiveObject() || null);
  };

  useEffect(() => {
    if (!canvas) return;
    syncLayers();

    const onSelection = () => {
      if ((canvas as any).__isLoadingJson) return;
      setActiveObject(canvas.getActiveObject() || null);
    };
    const onModified = () => syncLayers();

    canvas.on('selection:created', onSelection);
    canvas.on('selection:updated', onSelection);
    canvas.on('selection:cleared', onSelection);
    canvas.on('object:added', onModified);
    canvas.on('object:removed', onModified);
    canvas.on('object:modified', onModified);
    canvas.on('text:editing:exited', onModified);
    canvas.on('studio:json-loaded' as any, onModified);

    return () => {
      canvas.off('selection:created', onSelection);
      canvas.off('selection:updated', onSelection);
      canvas.off('selection:cleared', onSelection);
      canvas.off('object:added', onModified);
      canvas.off('object:removed', onModified);
      canvas.off('object:modified', onModified);
      canvas.off('text:editing:exited', onModified);
      canvas.off('studio:json-loaded' as any, onModified);
    };
  }, [canvas]);

  // Load templates on demand
  useEffect(() => {
    if (activeTab === 'templates' && templates.length === 0) {
      loadTemplates();
    }
  }, [activeTab]);

  // Load user assets on demand
  useEffect(() => {
    if (activeTab === 'uploads' && assets.length === 0) {
      loadAssets();
    }
    if (activeTab === 'projects' && userProjects.length === 0) {
      setIsLoadingProjects(true);
      designStudioApi
        .listProjects({ sort: 'updatedAt_desc' })
        .then(setUserProjects)
        .catch(() => {})
        .finally(() => setIsLoadingProjects(false));
    }
  }, [activeTab]);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const list = await designStudioApi.listTemplates({ category: selectedCategory });
      setTemplates(list);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const loadAssets = async () => {
    try {
      const list = await designStudioApi.listAssets(projectId);
      setAssets(list);
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      setUploadError('Please select a valid PNG, JPEG, or WebP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File exceeds maximum size of 15MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const asset = await designStudioApi.uploadAsset(file, projectId);
      setAssets((prev) => [asset, ...prev]);

      // Automatically add newly uploaded asset to canvas
      if (canvas && asset.url) {
        await addImageFromUrl(canvas, asset.url);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await designStudioApi.deleteAsset(assetId);
      setAssets((prev) => prev.filter((a) => a._id !== assetId));
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  const paletteColors = [
    '#ffffff',
    '#FAF7F2',
    '#000000',
    '#FACC15',
    '#38BDF8',
    '#A855F7',
    '#10B981',
    '#F43F5E',
    '#EA580C',
    '#64748B',
    '#FEF08A',
    '#BAE6FD',
    '#DDD6FE',
    '#BBF7D0',
    '#FECDD3',
    '#FED7AA',
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-white border-r border-slate-200 flex flex-row shrink-0 select-none ${
          isOpenMobile
            ? 'fixed inset-y-0 left-0 z-50 w-[370px] max-w-[92vw] h-full shadow-2xl flex'
            : 'hidden lg:flex h-full z-20'
        }`}
      >
        {/* Canva-style Left Icon Rail (68px wide) */}
        <div className="w-[68px] bg-[#18191b] border-r border-white/10 flex flex-col items-center py-2 gap-1 shrink-0 overflow-y-auto scrollbar-none text-slate-300">
          {[
            { id: 'templates', label: 'Design', icon: LayoutTemplate },
            { id: 'elements', label: 'Elements', icon: Shapes },
            { id: 'text', label: 'Text', icon: Type },
            { id: 'uploads', label: 'Uploads', icon: Upload },
            { id: 'projects', label: 'Projects', icon: FolderOpen },
            { id: 'backgrounds', label: 'Colors', icon: Palette },
            { id: 'layers', label: 'Layers', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-[58px] py-2.5 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={tab.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#a855f7]' : ''}`} />
                <span className="text-[10px] leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Flyout Panel (300px wide) */}
        <div className="w-[300px] flex-1 flex flex-col h-full bg-white overflow-hidden">
          {/* Mobile Header Bar */}
          <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-900 text-white lg:hidden shrink-0">
            <div className="flex items-center gap-2">
              <Shapes className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Studio Elements
              </span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Elements Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Header Title */}
          <div className="px-4 py-3 border-b border-slate-100 hidden lg:flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 capitalize">
              {activeTab === 'backgrounds' ? 'Canvas Colors' : activeTab}
            </h3>
          </div>

          {/* Tab Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ===================== ELEMENTS TAB ===================== */}
            {activeTab === 'elements' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                    Basic Shapes
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleItemAdd(() => canvas && addRectangle(canvas, { rx: 0, ry: 0 }))
                      }
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
                    >
                      <Square className="w-6 h-6 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-700">Rectangle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleItemAdd(() => canvas && addRectangle(canvas, { rx: 16, ry: 16 }))
                      }
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-md bg-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-700">Rounded</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleItemAdd(() => canvas && addCircle(canvas))}
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
                    >
                      <CircleIcon className="w-6 h-6 text-pink-500 fill-pink-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-700">Circle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleItemAdd(() => canvas && addTriangle(canvas))}
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
                    >
                      <TriangleIcon className="w-6 h-6 text-emerald-500 fill-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-700">Triangle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleItemAdd(() => canvas && addStar(canvas))}
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
                    >
                      <StarIcon className="w-6 h-6 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-700">Star</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleItemAdd(() => canvas && addHexagon(canvas))}
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
                    >
                      <Hexagon className="w-6 h-6 text-purple-500 fill-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-700">Polygon</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                    Decorative & Lines
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleItemAdd(() => canvas && addLine(canvas))}
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
                    >
                      <Minus className="w-6 h-6 text-slate-700 stroke-[2.5] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-700">Line</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleItemAdd(() => canvas && addHeart(canvas))}
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
                    >
                      <HeartIcon className="w-6 h-6 text-rose-500 fill-rose-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-700">Heart</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleItemAdd(() => canvas && addSpeechBubble(canvas))}
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-1.5 shadow-xs transition-all cursor-pointer group"
                    >
                      <MessageSquare className="w-6 h-6 text-amber-500 fill-amber-300 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-700">Bubble</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TEXT TAB ===================== */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Click to Add Text
                </h4>

                <button
                  type="button"
                  onClick={() => handleItemAdd(() => canvas && addText(canvas, 'heading'))}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-purple-400 shadow-xs hover:shadow text-left transition-all cursor-pointer group"
                >
                  <div className="text-2xl font-black text-slate-900 leading-tight group-hover:text-purple-700 transition-colors">
                    Add a Heading
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Extra bold, large title
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemAdd(() => canvas && addText(canvas, 'subheading'))}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-purple-400 shadow-xs hover:shadow text-left transition-all cursor-pointer group"
                >
                  <div className="text-lg font-bold text-slate-800 leading-tight group-hover:text-purple-700 transition-colors">
                    Add a Subheading
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Medium emphasis</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemAdd(() => canvas && addText(canvas, 'body'))}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-purple-400 shadow-xs hover:shadow text-left transition-all cursor-pointer group"
                >
                  <div className="text-sm font-medium text-slate-700 group-hover:text-purple-700 transition-colors">
                    Add a little bit of body text
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Paragraph details</div>
                </button>

                <div className="pt-3 border-t border-slate-100">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Styled Text Presets
                  </h5>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleItemAdd(
                          () =>
                            canvas &&
                            addText(canvas, 'heading', 'SALE 50% OFF', {
                              fill: '#EF4444',
                              fontFamily: 'Montserrat',
                              fontWeight: '900',
                              stroke: '#000000',
                              strokeWidth: 2,
                            }),
                        )
                      }
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-900 rounded-xl font-black text-center text-sm shadow-xs transition-all cursor-pointer"
                    >
                      SALE 50% OFF
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleItemAdd(
                          () =>
                            canvas &&
                            addText(canvas, 'heading', 'SPECIAL EVENT', {
                              fill: '#FFFFFF',
                              backgroundColor: '#000000',
                              fontFamily: 'Montserrat',
                              fontWeight: '900',
                              fontSize: 36,
                            }),
                        )
                      }
                      className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl font-black text-center text-sm shadow-xs transition-all cursor-pointer"
                    >
                      SPECIAL EVENT
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== UPLOADS TAB ===================== */}
            {activeTab === 'uploads' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Your Images
                  </h4>
                  <span className="text-xs font-medium text-slate-400">{assets.length} items</span>
                </div>

                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                    {uploadError}
                  </div>
                )}

                {/* Drop / Upload Zone */}
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-[#7d2ae8] rounded-2xl bg-slate-50 hover:bg-purple-50/20 cursor-pointer shadow-xs transition-colors">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-700">
                      <Loader2 className="w-6 h-6 animate-spin text-[#7d2ae8]" />
                      <span className="text-xs font-medium">Uploading & Optimizing...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="p-2.5 bg-purple-100 text-[#7d2ae8] rounded-full">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Upload Image</span>
                      <span className="text-[10px] text-slate-400">
                        PNG, JPG, or WebP up to 15MB
                      </span>
                    </div>
                  )}
                </label>

                {/* Assets Grid */}
                <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                  {assets.map((asset) => {
                    const isFailed = failedAssetIds.has(asset._id);
                    const assetSrc = asset.thumbnailUrl || asset.url;

                    return (
                      <div
                        key={asset._id}
                        className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-purple-300 transition-all"
                      >
                        {isFailed ? (
                          <div
                            className="w-full h-24 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center select-none"
                            title="Asset could not be loaded"
                          >
                            <ImageIcon className="w-6 h-6 mb-1 text-slate-400" />
                            <span className="text-[10px] font-medium text-slate-500 truncate max-w-full">
                              {asset.originalName || 'Unavailable'}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={assetSrc}
                            alt={asset.originalName}
                            onError={() => {
                              setFailedAssetIds((prev) => {
                                const next = new Set(prev);
                                next.add(asset._id);
                                return next;
                              });
                            }}
                            onClick={() =>
                              handleItemAdd(async () => {
                                try {
                                  if (canvas) await addImageFromUrl(canvas, asset.url);
                                } catch (err) {
                                  console.warn('Failed to place asset onto canvas:', err);
                                }
                              })
                            }
                            className="w-full h-24 object-contain bg-slate-50 cursor-pointer group-hover:scale-105 transition-transform"
                            title="Click to place on canvas"
                          />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAsset(asset._id);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-500 hover:text-white rounded-lg shadow-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===================== TEMPLATES TAB ===================== */}
            {activeTab === 'templates' && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Explore Templates
                </h4>

                {/* Category pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 text-xs font-medium scrollbar-none">
                  {DESIGN_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        designStudioApi.listTemplates({ category: cat.id }).then(setTemplates);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#18191b] text-white border-[#18191b]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {isLoadingTemplates ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#7d2ae8]" />
                    <span className="text-xs font-medium text-slate-400">Loading templates...</span>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-xs font-medium text-slate-400">
                    No templates found in this category.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map((tpl) => (
                      <div
                        key={tpl._id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-slate-800 truncate">{tpl.title}</h5>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                            {tpl.width}×{tpl.height}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                        <button
                          type="button"
                          onClick={() => onApplyTemplate(tpl.documentData)}
                          className="w-full py-1.5 bg-[#7d2ae8] hover:bg-[#6c22cf] text-white rounded-lg font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Load into Canvas
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================== BACKGROUNDS TAB ===================== */}
            {activeTab === 'backgrounds' && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Canvas Background
                </h4>

                {/* Custom Color Input */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <input
                    type="color"
                    value={canvasBackground.startsWith('#') ? canvasBackground : '#ffffff'}
                    onChange={(e) => onBackgroundChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0 bg-transparent"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Custom Hex</div>
                    <input
                      type="text"
                      value={canvasBackground}
                      onChange={(e) => onBackgroundChange(e.target.value)}
                      className="text-xs font-mono font-medium text-slate-600 uppercase bg-transparent outline-none focus:text-purple-600"
                    />
                  </div>
                </div>

                {/* Color Palette Swatches */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Palette Swatches
                  </h5>
                  <div className="grid grid-cols-4 gap-2">
                    {paletteColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => onBackgroundChange(color)}
                        style={{ backgroundColor: color }}
                        className={`h-10 rounded-xl border border-slate-200/80 shadow-xs transition-all hover:scale-105 cursor-pointer ${
                          canvasBackground.toLowerCase() === color.toLowerCase()
                            ? 'ring-2 ring-[#7d2ae8] ring-offset-2'
                            : ''
                        }`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== LAYERS TAB ===================== */}
            {activeTab === 'layers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Canvas Layers
                  </h4>
                  <span className="text-xs font-medium text-slate-400">
                    {canvasObjects.length} items
                  </span>
                </div>

                {canvasObjects.length === 0 ? (
                  <div className="text-center py-8 text-xs font-medium text-slate-400">
                    No objects on the canvas yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {canvasObjects.map((obj, idx) => {
                      const isSelected = activeObject === obj;
                      const type = obj.type || 'Object';
                      const isLocked = Boolean(obj.lockMovementX);

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (canvas) {
                              canvas.setActiveObject(obj);
                              canvas.requestRenderAll();
                              setActiveObject(obj);
                            }
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-purple-50 border-purple-200 text-purple-900 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-semibold capitalize truncate">
                              {isTextObject(obj)
                                ? `"${(obj as any).text?.slice(0, 16) || 'Text'}..."`
                                : type}
                            </span>
                          </div>

                          {/* Layer controls */}
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (!canvas) return;
                                canvas.bringObjectForward(obj);
                                canvas.requestRenderAll();
                                canvas.fire('object:modified', { target: obj });
                                syncLayers();
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
                              title="Bring Forward"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!canvas) return;
                                canvas.sendObjectBackwards(obj);
                                canvas.requestRenderAll();
                                canvas.fire('object:modified', { target: obj });
                                syncLayers();
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
                              title="Send Backward"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                obj.set({
                                  lockMovementX: !isLocked,
                                  lockMovementY: !isLocked,
                                  lockRotation: !isLocked,
                                  lockScalingX: !isLocked,
                                  lockScalingY: !isLocked,
                                });
                                canvas?.requestRenderAll();
                                canvas?.fire('object:modified', { target: obj });
                                syncLayers();
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
                              title={isLocked ? 'Unlock' : 'Lock'}
                            >
                              {isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-amber-500" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!canvas) return;
                                canvas.remove(obj);
                                canvas.requestRenderAll();
                                syncLayers();
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ===================== PROJECTS TAB ===================== */}
            {activeTab === 'projects' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    My Projects
                  </h4>
                  <Link
                    to="/studio"
                    className="text-[11px] font-semibold text-[#7d2ae8] hover:underline"
                  >
                    All Projects
                  </Link>
                </div>

                {isLoadingProjects ? (
                  <div className="py-8 text-center text-xs font-medium text-slate-400">
                    Loading your saved projects...
                  </div>
                ) : userProjects.length === 0 ? (
                  <div className="py-8 text-center text-xs font-medium text-slate-400 space-y-2">
                    <p>No saved projects found.</p>
                    <Link
                      to="/studio"
                      className="inline-block px-3 py-1.5 rounded-lg bg-[#7d2ae8] text-white font-medium text-xs shadow-xs"
                    >
                      Open Studio Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userProjects.map((proj) => (
                      <Link
                        key={proj._id}
                        to={`/studio/editor/${proj._id}`}
                        className={`block p-3 rounded-xl border transition-all ${
                          proj._id === projectId
                            ? 'bg-purple-50 border-purple-200 text-purple-900 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="font-bold text-xs truncate">{proj.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {proj.width}×{proj.height} px • v{proj.currentVersion}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
