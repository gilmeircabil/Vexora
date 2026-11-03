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
  Plus,
  FolderOpen,
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
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-[#FAF7F2] border-r-2 border-black flex flex-col shrink-0 select-none ${
          isOpenMobile
            ? 'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] h-full shadow-[6px_0px_0px_#000000] flex'
            : 'hidden lg:flex w-80 h-full z-20'
        }`}
      >
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between p-3 border-b-2 border-black bg-[#FACC15] lg:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Shapes className="w-4 h-4 text-black" />
            <span className="font-black text-xs uppercase tracking-wider text-black">
              Studio Elements
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[1.5px_1.5px_0px_#000000]"
            aria-label="Close Elements Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Navigation Tabs */}
        <div className="grid grid-cols-7 border-b-2 border-black bg-white shrink-0">
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
                className={`py-3 flex flex-col items-center justify-center gap-1 border-r border-black/15 last:border-r-0 transition-colors ${
                  isActive
                    ? 'bg-[#FACC15] text-black font-black'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* ===================== ELEMENTS TAB ===================== */}
          {activeTab === 'elements' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase text-black mb-2">Basic Shapes</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => canvas && addRectangle(canvas, { rx: 0, ry: 0 })}
                    className="p-3 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <Square className="w-6 h-6 text-black fill-[#FACC15]" />
                    <span className="text-[10px] font-black text-black">Rectangle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => canvas && addRectangle(canvas, { rx: 16, ry: 16 })}
                    className="p-3 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md border-2 border-black bg-[#38BDF8]" />
                    <span className="text-[10px] font-black text-black">Rounded</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => canvas && addCircle(canvas)}
                    className="p-3 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <CircleIcon className="w-6 h-6 text-black fill-[#EC4899]" />
                    <span className="text-[10px] font-black text-black">Circle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => canvas && addTriangle(canvas)}
                    className="p-3 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <TriangleIcon className="w-6 h-6 text-black fill-[#10B981]" />
                    <span className="text-[10px] font-black text-black">Triangle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => canvas && addStar(canvas)}
                    className="p-3 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <StarIcon className="w-6 h-6 text-black fill-[#FBBF24]" />
                    <span className="text-[10px] font-black text-black">Star</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => canvas && addHexagon(canvas)}
                    className="p-3 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <Hexagon className="w-6 h-6 text-black fill-[#A855F7]" />
                    <span className="text-[10px] font-black text-black">Polygon</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase text-black mb-2">Decorative & Lines</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => canvas && addLine(canvas)}
                    className="p-3 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <Minus className="w-6 h-6 text-black stroke-[3]" />
                    <span className="text-[10px] font-black text-black">Line</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => canvas && addHeart(canvas)}
                    className="p-3 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <HeartIcon className="w-6 h-6 text-black fill-[#F43F5E]" />
                    <span className="text-[10px] font-black text-black">Heart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => canvas && addSpeechBubble(canvas)}
                    className="p-3 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-1.5 shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-6 h-6 text-black fill-[#FACC15]" />
                    <span className="text-[10px] font-black text-black">Bubble</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TEXT TAB ===================== */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-black mb-1">Click to Add Text</h4>

              <button
                type="button"
                onClick={() => canvas && addText(canvas, 'heading')}
                className="w-full p-4 rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 text-left transition-all cursor-pointer"
              >
                <div className="text-2xl font-black text-black leading-tight">Add a Heading</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">
                  Extra bold, large size
                </div>
              </button>

              <button
                type="button"
                onClick={() => canvas && addText(canvas, 'subheading')}
                className="w-full p-3.5 rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 text-left transition-all cursor-pointer"
              >
                <div className="text-lg font-bold text-black leading-tight">Add a Subheading</div>
                <div className="text-xs text-gray-500 font-semibold mt-0.5">Medium emphasis</div>
              </button>

              <button
                type="button"
                onClick={() => canvas && addText(canvas, 'body')}
                className="w-full p-3 rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 text-left transition-all cursor-pointer"
              >
                <div className="text-sm font-medium text-black">Add a little bit of body text</div>
                <div className="text-xs text-gray-500 font-semibold mt-0.5">Paragraph details</div>
              </button>

              <div className="pt-2 border-t-2 border-black/10">
                <h5 className="text-xs font-black uppercase text-black mb-2">
                  Styled Text Presets
                </h5>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      canvas &&
                      addText(canvas, 'heading', 'SALE 50% OFF', {
                        fill: '#EF4444',
                        fontFamily: 'Montserrat',
                        fontWeight: '900',
                        stroke: '#000000',
                        strokeWidth: 2,
                      })
                    }
                    className="w-full py-2.5 px-3 bg-[#FACC15] border-2 border-black rounded-xl font-black text-center text-sm shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 transition-all"
                  >
                    SALE 50% OFF
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      canvas &&
                      addText(canvas, 'heading', 'SPECIAL EVENT', {
                        fill: '#FFFFFF',
                        backgroundColor: '#000000',
                        fontFamily: 'Montserrat',
                        fontWeight: '900',
                        fontSize: 36,
                      })
                    }
                    className="w-full py-2.5 px-3 bg-black text-[#FACC15] border-2 border-black rounded-xl font-black text-center text-sm shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 transition-all"
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
                <h4 className="text-xs font-black uppercase text-black">Your Images</h4>
                <span className="text-xs font-bold text-gray-500">{assets.length} items</span>
              </div>

              {uploadError && (
                <div className="p-2.5 bg-red-100 border-2 border-red-500 rounded-xl text-xs font-bold text-red-800">
                  {uploadError}
                </div>
              )}

              {/* Drop / Upload Zone */}
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-black rounded-2xl bg-white hover:bg-gray-50 cursor-pointer shadow-[2px_2px_0px_#000000] transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1.5 text-black">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-bold">Uploading & Optimizing...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Upload className="w-6 h-6 text-black" />
                    <span className="text-xs font-black text-black">Upload Image</span>
                    <span className="text-[10px] text-gray-500 font-semibold">
                      PNG, JPG, or WebP up to 15MB
                    </span>
                  </div>
                )}
              </label>

              {/* Assets Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                {assets.map((asset) => (
                  <div
                    key={asset._id}
                    className="group relative rounded-xl border-2 border-black bg-white overflow-hidden shadow-[2px_2px_0px_#000000] hover:shadow-[3px_3px_0px_#000000] transition-all"
                  >
                    <img
                      src={asset.thumbnailUrl || asset.url}
                      alt={asset.originalName}
                      onClick={() => canvas && addImageFromUrl(canvas, asset.url)}
                      className="w-full h-24 object-contain bg-gray-100 cursor-pointer group-hover:scale-105 transition-transform"
                      title="Click to place on canvas"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAsset(asset._id);
                      }}
                      className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-500 hover:text-white rounded-lg border border-black text-black opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TEMPLATES TAB ===================== */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-black mb-1">Explore Templates</h4>

              {/* Category pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 text-xs font-bold scrollbar-none">
                {DESIGN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      designStudioApi.listTemplates({ category: cat.id }).then(setTemplates);
                    }}
                    className={`px-2.5 py-1 rounded-lg border border-black shrink-0 transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-black text-[#FACC15]'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {isLoadingTemplates ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                  <span className="text-xs font-bold text-gray-500">Loading templates...</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-xs font-bold text-gray-500">
                  No templates found in this category.
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((tpl) => (
                    <div
                      key={tpl._id}
                      className="p-3 bg-white rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000000] space-y-2 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-black text-xs text-black truncate">{tpl.title}</h5>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 rounded border border-black/20 text-gray-700">
                          {tpl.width}×{tpl.height}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2 font-medium">
                        {tpl.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => onApplyTemplate(tpl.documentData)}
                        className="w-full py-1.5 bg-[#FACC15] border-2 border-black rounded-lg font-black text-xs text-black shadow-[1.5px_1.5px_0px_#000000] hover:bg-amber-400 transition-colors"
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
              <h4 className="text-xs font-black uppercase text-black mb-1">Canvas Background</h4>

              {/* Custom Color Input */}
              <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-3">
                <input
                  type="color"
                  value={canvasBackground.startsWith('#') ? canvasBackground : '#ffffff'}
                  onChange={(e) => onBackgroundChange(e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-black cursor-pointer p-0 bg-transparent"
                />
                <div>
                  <div className="text-xs font-black text-black">Custom Hex</div>
                  <input
                    type="text"
                    value={canvasBackground}
                    onChange={(e) => onBackgroundChange(e.target.value)}
                    className="text-xs font-mono font-bold text-gray-700 uppercase bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Color Palette Swatches */}
              <div>
                <h5 className="text-xs font-black uppercase text-black mb-2">Palette Swatches</h5>
                <div className="grid grid-cols-4 gap-2">
                  {paletteColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onBackgroundChange(color)}
                      style={{ backgroundColor: color }}
                      className={`h-11 rounded-xl border-2 border-black transition-transform hover:scale-105 ${
                        canvasBackground.toLowerCase() === color.toLowerCase()
                          ? 'ring-2 ring-black ring-offset-2'
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
                <h4 className="text-xs font-black uppercase text-black">Canvas Layers</h4>
                <span className="text-xs font-bold text-gray-500">
                  {canvasObjects.length} items
                </span>
              </div>

              {canvasObjects.length === 0 ? (
                <div className="text-center py-8 text-xs font-bold text-gray-500">
                  No objects on the canvas yet.
                </div>
              ) : (
                <div className="space-y-2">
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
                        className={`p-2.5 rounded-xl border-2 border-black flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000000]'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-black text-black capitalize truncate">
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
                            className="p-1 hover:bg-black/10 rounded"
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
                            className="p-1 hover:bg-black/10 rounded"
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
                            className="p-1 hover:bg-black/10 rounded"
                            title={isLocked ? 'Unlock' : 'Lock'}
                          >
                            {isLocked ? (
                              <Lock className="w-3.5 h-3.5" />
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
                            className="p-1 hover:bg-red-500 hover:text-white rounded"
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
                <h4 className="text-xs font-black uppercase text-black">My Projects</h4>
                <Link
                  to="/studio"
                  className="text-[11px] font-black underline text-black hover:text-neutral-700"
                >
                  All Projects
                </Link>
              </div>

              {isLoadingProjects ? (
                <div className="py-8 text-center text-xs font-bold text-gray-500">
                  Loading your saved projects...
                </div>
              ) : userProjects.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-gray-500 space-y-2">
                  <p>No saved projects found.</p>
                  <Link
                    to="/studio"
                    className="inline-block px-3 py-1.5 rounded-lg bg-[#FACC15] border border-black text-black font-black"
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
                      className={`block p-3 rounded-xl border-2 border-black transition-all ${
                        proj._id === projectId
                          ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000000]'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-black text-xs text-black truncate">{proj.title}</div>
                      <div className="text-[10px] font-semibold text-gray-600 mt-0.5">
                        {proj.width}×{proj.height} px • v{proj.currentVersion}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
