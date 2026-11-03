import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import type { Canvas, FabricObject, FabricImage } from 'fabric';
import { designStudioApi, type DesignProjectDTO } from '../lib/designStudio/api.js';
import { TopToolbar } from '../features/design-studio/TopToolbar.js';
import { LeftSidebar } from '../features/design-studio/LeftSidebar.js';
import { CanvasWorkspace } from '../features/design-studio/CanvasWorkspace.js';
import { RightInspector } from '../features/design-studio/RightInspector.js';
import { ExportModal } from '../features/design-studio/ExportModal.js';
import { VersionHistoryModal } from '../features/design-studio/VersionHistoryModal.js';
import { PreviewModal } from '../features/design-studio/PreviewModal.js';
import { AIToolsModal } from '../features/design-studio/AIToolsModal.js';
import { createCanvasThumbnail, isImageObject } from '../features/design-studio/canvasUtils.js';
import type { SaveStatus } from '../features/design-studio/types.js';
import { MaintenanceModal } from '../components/common/LockedPageModal.js';
import { useMaintenance } from '../context/MaintenanceContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Loader2,
  AlertCircle,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sliders,
  Maximize2,
} from 'lucide-react';

interface StudioPageItem {
  id: string;
  name: string;
  background: string;
  data: Record<string, any>;
}

export const DesignEditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { maintenance, checkRouteLock } = useMaintenance();
  const lockStatus = checkRouteLock('/studio');
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState<DesignProjectDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null);
  const [canvasBg, setCanvasBg] = useState<string>('#ffffff');

  // Multi-page state
  const [pages, setPages] = useState<StudioPageItem[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Zoom & View
  const [zoom, setZoom] = useState<number>(0.65);

  // History & Save state
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const undoRedoRef = useRef<{ undo: () => void; redo: () => void }>({
    undo: () => {},
    redo: () => {},
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const currentRevisionRef = useRef<number>(1);
  const editVersionRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);
  const pendingSaveArgsRef = useRef<{
    documentData?: Record<string, any>;
    thumbnailDataUrl?: string;
    overridePages?: StudioPageItem[];
    overrideWidth?: number;
    overrideHeight?: number;
  } | null>(null);
  const projectRef = useRef<DesignProjectDTO | null>(null);
  const pagesRef = useRef<StudioPageItem[]>([]);
  projectRef.current = project;
  pagesRef.current = pages;

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isAIToolsOpen, setIsAIToolsOpen] = useState<boolean>(false);

  // Mobile Drawer toggles (< 1024px)
  const [isMobileLeftOpen, setIsMobileLeftOpen] = useState<boolean>(false);
  const [isMobileRightOpen, setIsMobileRightOpen] = useState<boolean>(false);

  const initPagesFromDoc = (docData: any, defaultBg: string): StudioPageItem[] => {
    if (docData && Array.isArray(docData.pages) && docData.pages.length > 0) {
      return docData.pages;
    }
    return [
      {
        id: 'page-1',
        name: 'Page 1',
        background: defaultBg || '#ffffff',
        data: docData || { version: '7.4.0', objects: [] },
      },
    ];
  };

  // Load project on mount
  useEffect(() => {
    if (!projectId) return;

    if (projectId === 'draft') {
      const searchParams = new URLSearchParams(window.location.search);
      const w = parseInt(searchParams.get('w') || '1080', 10);
      const h = parseInt(searchParams.get('h') || '1080', 10);
      const t = searchParams.get('title') || 'Untitled Design';

      const savedDraft =
        localStorage.getItem('vexoramods_draft_project') ||
        localStorage.getItem('toolnest_draft_project');
      let initialData: any = null;
      if (savedDraft) {
        try {
          initialData = JSON.parse(savedDraft);
        } catch {
          // ignore corrupted localstorage
        }
      }

      const draftProject: DesignProjectDTO = {
        _id: 'draft',
        userId: 'guest',
        title: initialData?.title || t,
        width: initialData?.width || w,
        height: initialData?.height || h,
        background: initialData?.background || '#ffffff',
        category: initialData?.category || 'custom',
        documentData: initialData?.documentData || { version: '7.4.0', objects: [] },
        currentVersion: 1,
        revision: 1,
        isStarred: false,
        isShared: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const initialPages = initPagesFromDoc(
        draftProject.documentData,
        draftProject.background || '#ffffff',
      );
      setProject(draftProject);
      setPages(initialPages);
      setActivePageIndex(0);
      setCanvasBg(initialPages[0]?.background || draftProject.background || '#ffffff');
      currentRevisionRef.current = 1;
      setLastSavedAt(new Date());
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    designStudioApi
      .getProject(projectId)
      .then((p) => {
        if (!isMounted) return;
        const initialPages = initPagesFromDoc(p.documentData, p.background || '#ffffff');
        setProject(p);
        setPages(initialPages);
        setActivePageIndex(0);
        setCanvasBg(initialPages[0]?.background || p.background || '#ffffff');
        currentRevisionRef.current = p.revision || 1;
        setLastSavedAt(new Date(p.updatedAt));
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err.message || 'Failed to load project.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Window beforeunload prompt when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved' || saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in your design.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // Handle Save (autosave or manual) with sequential queueing and stale-overwrite protection
  const performSave = useCallback(
    async (
      documentData?: Record<string, any>,
      thumbnailDataUrl?: string,
      overridePages?: StudioPageItem[],
      overrideWidth?: number,
      overrideHeight?: number,
    ) => {
      const currentProject = projectRef.current;
      if (!projectId || !currentProject) return;

      if (isSavingRef.current) {
        pendingSaveArgsRef.current = {
          documentData,
          thumbnailDataUrl,
          overridePages,
          overrideWidth,
          overrideHeight,
        };
        return;
      }

      isSavingRef.current = true;
      const saveEditVersion = editVersionRef.current;
      setSaveStatus('saving');

      try {
        const currentCanvasJson =
          documentData || (canvas ? canvas.toJSON() : currentProject.documentData);
        const sourcePages = overridePages || pagesRef.current;
        const updatedPages = sourcePages.map((pg, idx) =>
          idx === activePageIndex ? { ...pg, background: canvasBg, data: currentCanvasJson } : pg,
        );

        const doc = {
          ...currentCanvasJson,
          pages: updatedPages,
        };

        const thumb =
          thumbnailDataUrl ||
          (canvas ? createCanvasThumbnail(canvas, 0.25) : currentProject.thumbnailUrl);

        if (projectId === 'draft') {
          const updated = {
            ...currentProject,
            width: overrideWidth ?? currentProject.width,
            height: overrideHeight ?? currentProject.height,
            documentData: doc,
            thumbnailUrl: thumb,
            background: canvasBg,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem('vexoramods_draft_project', JSON.stringify(updated));
          localStorage.setItem('toolnest_draft_project', JSON.stringify(updated));
          projectRef.current = updated;
          pagesRef.current = updatedPages;
          if (overrideWidth !== undefined || overrideHeight !== undefined) {
            setProject(updated);
          }
          if (overridePages) {
            setPages(updatedPages);
          }
          if (editVersionRef.current === saveEditVersion) {
            setSaveStatus('saved');
          } else {
            setSaveStatus('unsaved');
          }
          setLastSavedAt(new Date());
          return;
        }

        const updated = await designStudioApi.updateProject(projectId, {
          title: currentProject.title,
          width: overrideWidth ?? currentProject.width,
          height: overrideHeight ?? currentProject.height,
          background: canvasBg,
          documentData: doc,
          thumbnailUrl: thumb,
          revision: currentRevisionRef.current,
        });

        currentRevisionRef.current = updated.revision;
        projectRef.current = updated;
        pagesRef.current = updatedPages;
        if (
          overrideWidth !== undefined ||
          overrideHeight !== undefined ||
          currentProject.title !== updated.title ||
          currentProject.currentVersion !== updated.currentVersion
        ) {
          setProject(updated);
        }
        if (overridePages) {
          setPages(updatedPages);
        }
        if (editVersionRef.current === saveEditVersion) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('unsaved');
        }
        setLastSavedAt(new Date());
      } catch (err: any) {
        console.error('Save failed:', err);
        setSaveStatus('error');
      } finally {
        isSavingRef.current = false;
        if (pendingSaveArgsRef.current) {
          const nextArgs = pendingSaveArgsRef.current;
          pendingSaveArgsRef.current = null;
          void performSave(
            nextArgs.documentData,
            nextArgs.thumbnailDataUrl,
            nextArgs.overridePages,
            nextArgs.overrideWidth,
            nextArgs.overrideHeight,
          );
        }
      }
    },
    [projectId, canvas, canvasBg, activePageIndex],
  );

  // Page Management Actions
  const saveCurrentPageSnapshot = (): StudioPageItem[] => {
    const basePages = pagesRef.current.length > 0 ? pagesRef.current : pages;
    if (!canvas) return basePages;
    const currentJson = canvas.toJSON();
    return basePages.map((pg, idx) =>
      idx === activePageIndex ? { ...pg, background: canvasBg, data: currentJson } : pg,
    );
  };

  const handleSelectPage = async (targetIndex: number) => {
    const basePages = pagesRef.current.length > 0 ? pagesRef.current : pages;
    if (!canvas || targetIndex === activePageIndex || !basePages[targetIndex]) return;
    const snapshot = saveCurrentPageSnapshot();
    const targetPage = snapshot[targetIndex]!;
    pagesRef.current = snapshot;
    setPages(snapshot);
    setActivePageIndex(targetIndex);
    setCanvasBg(targetPage.background || '#ffffff');
    (canvas as any).__resetHistoryOnLoad = true;
    await canvas.loadFromJSON(targetPage.data || { version: '7.4.0', objects: [] });
    canvas.backgroundColor = targetPage.background || '#ffffff';
    canvas.requestRenderAll();
  };

  const handleAddPage = async () => {
    if (!canvas) return;
    const snapshot = saveCurrentPageSnapshot();
    const newPage: StudioPageItem = {
      id: `page-${Date.now()}`,
      name: `Page ${snapshot.length + 1}`,
      background: '#ffffff',
      data: { version: '7.4.0', objects: [] },
    };
    const nextPages = [...snapshot, newPage];
    const nextIdx = nextPages.length - 1;
    pagesRef.current = nextPages;
    setPages(nextPages);
    setActivePageIndex(nextIdx);
    setCanvasBg('#ffffff');
    (canvas as any).__resetHistoryOnLoad = true;
    await canvas.loadFromJSON(newPage.data);
    canvas.backgroundColor = '#ffffff';
    canvas.requestRenderAll();
    editVersionRef.current += 1;
    performSave(newPage.data, undefined, nextPages);
  };

  const handleDuplicatePage = async () => {
    const basePages = pagesRef.current.length > 0 ? pagesRef.current : pages;
    if (!canvas || !basePages[activePageIndex]) return;
    const snapshot = saveCurrentPageSnapshot();
    const current = snapshot[activePageIndex]!;
    const clonedData = JSON.parse(JSON.stringify(current.data));
    const dupPage: StudioPageItem = {
      id: `page-${Date.now()}`,
      name: `${current.name} (Copy)`,
      background: current.background,
      data: clonedData,
    };
    const nextPages = [
      ...snapshot.slice(0, activePageIndex + 1),
      dupPage,
      ...snapshot.slice(activePageIndex + 1),
    ];
    const nextIdx = activePageIndex + 1;
    pagesRef.current = nextPages;
    setPages(nextPages);
    setActivePageIndex(nextIdx);
    (canvas as any).__resetHistoryOnLoad = true;
    await canvas.loadFromJSON(clonedData);
    canvas.requestRenderAll();
    editVersionRef.current += 1;
    performSave(clonedData, undefined, nextPages);
  };

  const handleDeletePage = async () => {
    const basePages = pagesRef.current.length > 0 ? pagesRef.current : pages;
    if (!canvas || basePages.length <= 1) return;
    const snapshot = saveCurrentPageSnapshot();
    const nextPages = snapshot.filter((_, idx) => idx !== activePageIndex);
    const nextIdx = Math.max(0, activePageIndex - 1);
    const targetPage = nextPages[nextIdx]!;
    pagesRef.current = nextPages;
    setPages(nextPages);
    setActivePageIndex(nextIdx);
    setCanvasBg(targetPage.background || '#ffffff');
    (canvas as any).__resetHistoryOnLoad = true;
    await canvas.loadFromJSON(targetPage.data || { version: '7.4.0', objects: [] });
    canvas.backgroundColor = targetPage.background || '#ffffff';
    canvas.requestRenderAll();
    editVersionRef.current += 1;
    performSave(targetPage.data, undefined, nextPages);
  };

  const handleReorderPage = (direction: -1 | 1) => {
    const basePages = pagesRef.current.length > 0 ? pagesRef.current : pages;
    const targetIdx = activePageIndex + direction;
    if (targetIdx < 0 || targetIdx >= basePages.length) return;
    const snapshot = saveCurrentPageSnapshot();
    const reordered = [...snapshot];
    const [moved] = reordered.splice(activePageIndex, 1);
    if (!moved) return;
    reordered.splice(targetIdx, 0, moved);
    pagesRef.current = reordered;
    setPages(reordered);
    setActivePageIndex(targetIdx);
    editVersionRef.current += 1;
    performSave(undefined, undefined, reordered);
  };

  const handleResizeCanvas = (newWidth: number, newHeight: number) => {
    if (!project) return;
    const w = Math.max(100, Math.min(6000, newWidth));
    const h = Math.max(100, Math.min(6000, newHeight));
    const nextProj = { ...project, width: w, height: h };
    projectRef.current = nextProj;
    setProject(nextProj);
    editVersionRef.current += 1;
    performSave(undefined, undefined, undefined, w, h);
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!project || !projectId) return;
    setProject((prev) => (prev ? { ...prev, title: newTitle } : null));
    if (projectRef.current) {
      projectRef.current = { ...projectRef.current, title: newTitle };
    }

    if (projectId === 'draft') {
      const updated = { ...project, title: newTitle };
      localStorage.setItem('vexoramods_draft_project', JSON.stringify(updated));
      localStorage.setItem('toolnest_draft_project', JSON.stringify(updated));
      setLastSavedAt(new Date());
      return;
    }

    try {
      const updated = await designStudioApi.updateProject(projectId, {
        title: newTitle,
        revision: currentRevisionRef.current,
      });
      currentRevisionRef.current = updated.revision;
      setLastSavedAt(new Date());
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleBackgroundChange = (newColor: string) => {
    setCanvasBg(newColor);
    editVersionRef.current += 1;
    setSaveStatus('unsaved');
  };

  const handleApplyTemplate = async (templateDoc: any) => {
    if (!canvas) return;
    if (confirm('Replace current canvas elements with this template?')) {
      await canvas.loadFromJSON(templateDoc);
      if (templateDoc.background) {
        setCanvasBg(templateDoc.background);
      }
      canvas.requestRenderAll();
      editVersionRef.current += 1;
      performSave(templateDoc);
    }
  };

  const handleVersionRestored = async (restoredDoc: any, newVersionNumber: number) => {
    if (!canvas) return;
    (canvas as any).__resetHistoryOnLoad = true;
    await canvas.loadFromJSON(restoredDoc);
    canvas.requestRenderAll();
    setProject((prev) => (prev ? { ...prev, currentVersion: newVersionNumber } : null));
    setSaveStatus('saved');
  };

  // Zoom handlers
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.1, 4)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.1, 0.2)), []);
  const handleZoomReset = useCallback(() => {
    const currentProject = projectRef.current;
    if (!currentProject) {
      setZoom(0.65);
      return;
    }
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const containerW = isDesktop ? window.innerWidth - 320 - 288 - 64 : window.innerWidth - 32;
    const containerH = window.innerHeight - 56 - 48 - (isDesktop ? 64 : 44);
    const scaleW = Math.max(containerW, 80) / currentProject.width;
    const scaleH = Math.max(containerH, 80) / currentProject.height;
    const fitZoom = Math.min(scaleW, scaleH, 1);
    setZoom(Math.max(Number(fitZoom.toFixed(2)), 0.15));
  }, []);

  const handleCanvasReady = useCallback(
    (c: Canvas) => {
      setCanvas(c);
      handleZoomReset();
    },
    [handleZoomReset],
  );

  const handleHistoryChange = useCallback((undoable: boolean, redoable: boolean) => {
    setCanUndo(undoable);
    setCanRedo(redoable);
    if (undoable || redoable) {
      editVersionRef.current += 1;
      setSaveStatus('unsaved');
    }
  }, []);

  const handleRegisterUndoRedo = useCallback((actions: { undo: () => void; redo: () => void }) => {
    undoRedoRef.current = actions;
  }, []);

  if (lockStatus.isLocked && !isAdmin) {
    return (
      <MaintenanceModal
        title={maintenance.title || 'Scheduled Maintenance'}
        description={
          maintenance.message ||
          'Design Studio Editor is currently undergoing scheduled maintenance. Please check back shortly.'
        }
        estimatedReturn={maintenance.estimatedReturn}
        pageTitle="Design Studio"
        accentColor="#38BDF8"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
        <span className="text-sm font-black text-black">Opening VexoraMods Studio...</span>
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-6 bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000000] space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-black text-black">Design Not Found</h2>
          <p className="text-sm font-semibold text-gray-600">
            {loadError ||
              'The requested design project could not be found or you do not have permission.'}
          </p>
          <button
            onClick={() => navigate('/studio')}
            className="w-full py-2.5 bg-[#FACC15] text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 transition-all"
          >
            Back to Studio Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF7F2] overflow-hidden select-none">
      {/* Top Toolbar */}
      <TopToolbar
        title={project.title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        onManualSave={() => performSave()}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => undoRedoRef.current.undo()}
        onRedo={() => undoRedoRef.current.redo()}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenVersions={() => setIsVersionsOpen(true)}
        onOpenAITools={() => setIsAIToolsOpen(true)}
        currentVersion={project.currentVersion}
        canvasWidth={project.width}
        canvasHeight={project.height}
        onResizeCanvas={handleResizeCanvas}
      />

      {lockStatus.isLocked && isAdmin && (
        <div className="bg-amber-300 border-b-2 border-black px-4 py-1 flex items-center justify-between text-xs font-black text-black z-30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Admin Preview: Studio is currently in Maintenance Mode for visitors.</span>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="underline hover:text-neutral-800 text-[11px] font-bold cursor-pointer"
          >
            Manage Maintenance
          </button>
        </div>
      )}

      {/* Editor Body: Left Sidebar + Center Workspace + Right Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        <LeftSidebar
          canvas={canvas}
          projectId={project._id}
          canvasBackground={canvasBg}
          onBackgroundChange={handleBackgroundChange}
          onApplyTemplate={handleApplyTemplate}
          isOpenMobile={isMobileLeftOpen}
          onCloseMobile={() => setIsMobileLeftOpen(false)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <CanvasWorkspace
            width={project.width}
            height={project.height}
            background={canvasBg}
            initialDocumentData={pages[0]?.data || project.documentData}
            onCanvasReady={handleCanvasReady}
            onSelectionChange={setActiveObject}
            onSaveNeeded={performSave}
            onHistoryChange={handleHistoryChange}
            onRegisterUndoRedo={handleRegisterUndoRedo}
            zoom={zoom}
            onZoomChange={setZoom}
          />

          {/* Bottom Workspace: Multi-Page Navigation & Page Management Bar */}
          <div className="h-12 bg-[#FAF7F2] border-t-2 border-black px-4 flex items-center justify-between gap-4 shrink-0 z-20">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-black uppercase text-neutral-600 mr-1">
                <Layers className="w-3.5 h-3.5 text-black" />
                <span>Pages ({pages.length}):</span>
              </span>

              {pages.map((pg, idx) => {
                const isActive = idx === activePageIndex;
                return (
                  <button
                    key={pg.id}
                    type="button"
                    onClick={() => handleSelectPage(idx)}
                    className={`px-3 py-1 rounded-lg border-2 border-black text-xs font-black transition-all shrink-0 ${
                      isActive
                        ? 'bg-[#FACC15] text-black shadow-[2px_2px_0px_#000000]'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    Page {idx + 1}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleAddPage}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-black bg-[#4ADE80] hover:bg-emerald-400 text-black text-xs font-black shadow-[1.5px_1.5px_0px_#000000] shrink-0"
                title="Add new page"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Page</span>
              </button>
            </div>

            {/* Active Page Actions: Reorder, Duplicate, Delete */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={activePageIndex === 0}
                onClick={() => handleReorderPage(-1)}
                aria-label="Move page earlier"
                className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-40 text-black cursor-pointer"
                title="Move page earlier"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={activePageIndex >= pages.length - 1}
                onClick={() => handleReorderPage(1)}
                aria-label="Move page later"
                className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-40 text-black cursor-pointer"
                title="Move page later"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDuplicatePage}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-black bg-white hover:bg-gray-100 text-xs font-bold text-black"
                title="Duplicate current page"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Duplicate Page</span>
              </button>
              <button
                type="button"
                disabled={pages.length <= 1}
                onClick={handleDeletePage}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-black bg-white hover:bg-red-100 disabled:opacity-40 text-xs font-bold text-red-700"
                title="Delete current page"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Page</span>
              </button>
            </div>
          </div>

          {/* Mobile Bottom Quick Action Strip (< 1024px) */}
          <div className="lg:hidden flex items-center justify-between gap-2 px-3 py-2 bg-white border-t-2 border-black shrink-0 z-20 shadow-[0px_-2px_0px_#000000]">
            <button
              type="button"
              onClick={() => {
                setIsMobileLeftOpen(true);
                setIsMobileRightOpen(false);
              }}
              className={`flex-1 py-2 px-3 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] active:translate-y-0.5 cursor-pointer ${
                isMobileLeftOpen
                  ? 'bg-black text-[#FACC15]'
                  : 'bg-[#FACC15] text-black hover:bg-[#EAB308]'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Elements</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileRightOpen(true);
                setIsMobileLeftOpen(false);
              }}
              className={`flex-1 py-2 px-3 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] active:translate-y-0.5 cursor-pointer ${
                isMobileRightOpen
                  ? 'bg-black text-[#FACC15]'
                  : activeObject
                    ? 'bg-[#38BDF8] text-black'
                    : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{activeObject ? 'Style Object' : 'Properties'}</span>
            </button>

            <button
              type="button"
              onClick={handleZoomReset}
              className="py-2 px-3 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 font-black text-xs text-black shadow-[2px_2px_0px_#000000] active:translate-y-0.5 flex items-center gap-1 cursor-pointer shrink-0"
              title="Fit canvas to screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">{Math.round(zoom * 100)}%</span>
            </button>
          </div>
        </div>

        <RightInspector
          canvas={canvas}
          activeObject={activeObject}
          canvasWidth={project.width}
          canvasHeight={project.height}
          canvasBackground={canvasBg}
          onBackgroundChange={handleBackgroundChange}
          onOpenAITools={() => setIsAIToolsOpen(true)}
          isOpenMobile={isMobileRightOpen}
          onCloseMobile={() => setIsMobileRightOpen(false)}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        canvas={canvas}
        projectName={project.title}
        canvasBackground={canvasBg}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        projectId={project._id}
        canvas={canvas}
        currentVersion={project.currentVersion}
        onVersionRestored={handleVersionRestored}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        canvas={canvas}
        projectName={project.title}
        canvasBackground={canvasBg}
      />

      {/* AI Tools Modal */}
      <AIToolsModal
        isOpen={isAIToolsOpen}
        onClose={() => setIsAIToolsOpen(false)}
        canvas={canvas}
        selectedImage={
          activeObject && isImageObject(activeObject) ? (activeObject as FabricImage) : null
        }
      />
    </div>
  );
};
