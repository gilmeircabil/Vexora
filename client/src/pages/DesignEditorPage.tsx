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
import type { SaveStatus } from '../features/design-studio/types.js';
import { Loader2, AlertCircle } from 'lucide-react';

export const DesignEditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<DesignProjectDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null);
  const [canvasBg, setCanvasBg] = useState<string>('#ffffff');

  // Zoom & View
  const [zoom, setZoom] = useState<number>(0.65);

  // History & Save state
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const currentRevisionRef = useRef<number>(1);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isAIToolsOpen, setIsAIToolsOpen] = useState<boolean>(false);

  // Load project on mount
  useEffect(() => {
    if (!projectId) return;

    // Support Guest / Local Draft Mode without requiring authentication
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

      setProject(draftProject);
      setCanvasBg(draftProject.background || '#ffffff');
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
        setProject(p);
        setCanvasBg(p.background || '#ffffff');
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

  // Handle Save (autosave or manual)
  const performSave = useCallback(
    async (documentData?: Record<string, any>, thumbnailDataUrl?: string) => {
      if (!projectId || !project) return;

      setSaveStatus('saving');

      try {
        const doc = documentData || (canvas ? canvas.toJSON() : project.documentData);
        const thumb =
          thumbnailDataUrl ||
          (canvas ? canvas.toDataURL({ format: 'png', multiplier: 0.25 }) : project.thumbnailUrl);

        if (projectId === 'draft') {
          const updated = {
            ...project,
            documentData: doc,
            thumbnailUrl: thumb,
            background: canvasBg,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem('vexoramods_draft_project', JSON.stringify(updated));
          localStorage.setItem('toolnest_draft_project', JSON.stringify(updated));
          setProject(updated);
          setSaveStatus('saved');
          setLastSavedAt(new Date());
          return;
        }

        const updated = await designStudioApi.updateProject(projectId, {
          title: project.title,
          background: canvasBg,
          documentData: doc,
          thumbnailUrl: thumb,
          revision: currentRevisionRef.current,
        });

        currentRevisionRef.current = updated.revision;
        setProject(updated);
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      } catch (err: any) {
        console.error('Save failed:', err);
        setSaveStatus('error');
      }
    },
    [projectId, project, canvas, canvasBg],
  );

  const handleTitleChange = async (newTitle: string) => {
    if (!project || !projectId) return;
    setProject((prev) => (prev ? { ...prev, title: newTitle } : null));

    if (projectId === 'draft') {
      const updated = { ...project, title: newTitle };
      localStorage.setItem('vexoramods_draft_project', JSON.stringify(updated));
      localStorage.setItem('toolnest_draft_project', JSON.stringify(updated));
      setLastSavedAt(new Date());
      return;
    }

    try {
      await designStudioApi.updateProject(projectId, {
        title: newTitle,
        revision: currentRevisionRef.current,
      });
      setLastSavedAt(new Date());
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleBackgroundChange = (newColor: string) => {
    setCanvasBg(newColor);
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
      performSave(templateDoc);
    }
  };

  const handleVersionRestored = async (restoredDoc: any, newVersionNumber: number) => {
    if (!canvas) return;
    await canvas.loadFromJSON(restoredDoc);
    canvas.requestRenderAll();
    setProject((prev) => (prev ? { ...prev, currentVersion: newVersionNumber } : null));
    setSaveStatus('saved');
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.2));
  const handleZoomReset = () => {
    if (!project) {
      setZoom(0.65);
      return;
    }
    // Calculate fit-to-screen zoom
    const containerW = window.innerWidth - 320 - 288 - 64;
    const containerH = window.innerHeight - 56 - 64;
    const scaleW = containerW / project.width;
    const scaleH = containerH / project.height;
    const fitZoom = Math.min(scaleW, scaleH, 1);
    setZoom(Math.max(Number(fitZoom.toFixed(2)), 0.2));
  };

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
            {loadError || 'The requested design project could not be found or you do not have permission.'}
          </p>
          <button
            onClick={() => navigate('/design-studio')}
            className="w-full py-2.5 bg-[#FACC15] text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 transition-all"
          >
            Back to Dashboard
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
        onUndo={() => {}}
        onRedo={() => {}}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenVersions={() => setIsVersionsOpen(true)}
        onOpenAITools={() => setIsAIToolsOpen(true)}
        currentVersion={project.currentVersion}
      />

      {/* Editor Body: Left Sidebar + Canvas + Right Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        <LeftSidebar
          canvas={canvas}
          projectId={project._id}
          canvasBackground={canvasBg}
          onBackgroundChange={handleBackgroundChange}
          onApplyTemplate={handleApplyTemplate}
        />

        <CanvasWorkspace
          width={project.width}
          height={project.height}
          background={canvasBg}
          initialDocumentData={project.documentData}
          onCanvasReady={(c) => {
            setCanvas(c);
            handleZoomReset();
          }}
          onSelectionChange={setActiveObject}
          onSaveNeeded={(doc, thumb) => performSave(doc, thumb)}
          onHistoryChange={(undoable, redoable) => {
            setCanUndo(undoable);
            setCanRedo(redoable);
            setSaveStatus('unsaved');
          }}
          zoom={zoom}
          onZoomChange={setZoom}
        />

        <RightInspector
          canvas={canvas}
          activeObject={activeObject}
          canvasWidth={project.width}
          canvasHeight={project.height}
          canvasBackground={canvasBg}
          onBackgroundChange={handleBackgroundChange}
          onOpenAITools={() => setIsAIToolsOpen(true)}
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
          activeObject && activeObject.type === 'FabricImage'
            ? (activeObject as FabricImage)
            : null
        }
      />
    </div>
  );
};
