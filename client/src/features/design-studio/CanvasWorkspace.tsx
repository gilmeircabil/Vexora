import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, ActiveSelection, type FabricObject } from 'fabric';
import { setupSnapping, createCanvasThumbnail, isTextObject } from './canvasUtils.js';
import { preloadCoreFonts } from '../../lib/designStudio/fontLoader.js';

interface CanvasWorkspaceProps {
  width: number;
  height: number;
  background: string;
  initialDocumentData?: Record<string, any>;
  onCanvasReady: (canvas: Canvas) => void;
  onSelectionChange: (obj: FabricObject | null) => void;
  onSaveNeeded: (canvasJson: any, thumbnailDataUrl: string) => void;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onRegisterUndoRedo?: (actions: { undo: () => void; redo: () => void }) => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  width,
  height,
  background,
  initialDocumentData,
  onCanvasReady,
  onSelectionChange,
  onSaveNeeded,
  onHistoryChange,
  zoom,
  onZoomChange,
  onRegisterUndoRedo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  // Latest callback refs to prevent effect re-executions and stale closures
  const onCanvasReadyRef = useRef(onCanvasReady);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onSaveNeededRef = useRef(onSaveNeeded);
  const onHistoryChangeRef = useRef(onHistoryChange);
  const onZoomChangeRef = useRef(onZoomChange);

  useEffect(() => {
    onCanvasReadyRef.current = onCanvasReady;
  }, [onCanvasReady]);
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);
  useEffect(() => {
    onSaveNeededRef.current = onSaveNeeded;
  }, [onSaveNeeded]);
  useEffect(() => {
    onHistoryChangeRef.current = onHistoryChange;
  }, [onHistoryChange]);
  useEffect(() => {
    onZoomChangeRef.current = onZoomChange;
  }, [onZoomChange]);

  // Undo / Redo history stack
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoRef = useRef<boolean>(false);
  const isInternalLoadRef = useRef<boolean>(false);
  const clipboardRef = useRef<FabricObject | null>(null);

  // Debounced timers
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textEditTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevBackgroundRef = useRef<string>(background);

  // Panning state
  const isPanningRef = useRef<boolean>(false);
  const isSpacePressedRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      const currentCanvas = fabricRef.current;
      if (!currentCanvas || (currentCanvas as any).destroyed) return;
      const json = currentCanvas.toJSON();
      const thumb = createCanvasThumbnail(currentCanvas, 0.25);
      onSaveNeededRef.current(json, thumb);
    }, 1500);
  }, []);

  // Push state to undo/redo history and trigger debounced autosave
  const recordCanvasState = useCallback(() => {
    if (isUndoRedoRef.current || isInternalLoadRef.current || !fabricRef.current) return;
    const canvas = fabricRef.current;
    if ((canvas as any).destroyed) return;

    try {
      const jsonStr = JSON.stringify(canvas.toJSON());
      const currentIndex = historyIndexRef.current;

      // Avoid recording duplicate consecutive history snapshots
      if (currentIndex >= 0 && historyRef.current[currentIndex] === jsonStr) {
        return;
      }

      // Truncate future states if we branched from previous undo
      const newHistory = historyRef.current.slice(0, currentIndex + 1);
      newHistory.push(jsonStr);

      // Keep max 30 history states
      if (newHistory.length > 30) {
        newHistory.shift();
      }

      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;

      onHistoryChangeRef.current(historyIndexRef.current > 0, false);
      scheduleAutosave();
    } catch (err) {
      console.warn('Could not record canvas history:', err);
    }
  }, [scheduleAutosave]);

  // Undo operation
  const handleUndo = useCallback(async () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    // Flush any uncommitted in-progress text edit before undoing
    if (textEditTimerRef.current) {
      clearTimeout(textEditTimerRef.current);
      textEditTimerRef.current = null;
      recordCanvasState();
    }

    if (historyIndexRef.current <= 0) return;

    isUndoRedoRef.current = true;
    try {
      const activeObj = canvas.getActiveObject() as any;
      if (activeObj?.isEditing && typeof activeObj.exitEditing === 'function') {
        activeObj.exitEditing();
      }

      historyIndexRef.current -= 1;
      const previousState = historyRef.current[historyIndexRef.current];

      if (previousState) {
        const parsed = JSON.parse(previousState);
        await canvas.loadFromJSON(parsed);
        if (parsed.background) {
          canvas.backgroundColor = parsed.background;
        }
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        onSelectionChangeRef.current(null);
      }

      onHistoryChangeRef.current(
        historyIndexRef.current > 0,
        historyIndexRef.current < historyRef.current.length - 1,
      );
      scheduleAutosave();
    } finally {
      isUndoRedoRef.current = false;
    }
  }, [recordCanvasState, scheduleAutosave]);

  // Redo operation
  const handleRedo = useCallback(async () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    if (textEditTimerRef.current) {
      clearTimeout(textEditTimerRef.current);
      textEditTimerRef.current = null;
    }

    if (historyIndexRef.current >= historyRef.current.length - 1) return;

    isUndoRedoRef.current = true;
    try {
      const activeObj = canvas.getActiveObject() as any;
      if (activeObj?.isEditing && typeof activeObj.exitEditing === 'function') {
        activeObj.exitEditing();
      }

      historyIndexRef.current += 1;
      const nextState = historyRef.current[historyIndexRef.current];

      if (nextState) {
        const parsed = JSON.parse(nextState);
        await canvas.loadFromJSON(parsed);
        if (parsed.background) {
          canvas.backgroundColor = parsed.background;
        }
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        onSelectionChangeRef.current(null);
      }

      onHistoryChangeRef.current(
        historyIndexRef.current > 0,
        historyIndexRef.current < historyRef.current.length - 1,
      );
      scheduleAutosave();
    } finally {
      isUndoRedoRef.current = false;
    }
  }, [scheduleAutosave]);

  useEffect(() => {
    if (onRegisterUndoRedo) {
      onRegisterUndoRedo({ undo: handleUndo, redo: handleRedo });
    }
  }, [onRegisterUndoRedo, handleUndo, handleRedo]);

  useEffect(() => {
    if (fabricRef.current && !(fabricRef.current as any).destroyed) {
      fabricRef.current.setDimensions({ width, height });
      fabricRef.current.calcOffset();
      fabricRef.current.requestRenderAll();
    }
  }, [width, height]);

  // Keep canvas offset calibrated on zoom and window resize
  useEffect(() => {
    if (fabricRef.current && !(fabricRef.current as any).destroyed) {
      fabricRef.current.calcOffset();
    }
  }, [zoom]);

  useEffect(() => {
    const handleResize = () => {
      if (fabricRef.current && !(fabricRef.current as any).destroyed) {
        fabricRef.current.calcOffset();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Fabric Canvas once
  useEffect(() => {
    if (!canvasRef.current) return;
    let isDisposed = false;
    preloadCoreFonts();

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: background || '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      stopContextMenu: true,
    });

    const configureTextObjects = () => {
      const wrapperEl = (canvas as any).wrapperEl as HTMLElement | undefined;
      for (const obj of canvas.getObjects()) {
        if (isTextObject(obj)) {
          (obj as any).splitByGrapheme = false;
          if (wrapperEl) {
            (obj as any).hiddenTextareaContainer = wrapperEl;
          }
        }
      }
    };

    // Guard loadFromJSON so intermediate object:removed/object:added events never pollute history
    const origLoadFromJSON = canvas.loadFromJSON.bind(canvas);
    canvas.loadFromJSON = (async (json: any, reviver?: any, options?: any) => {
      const wasInitialLoad = historyRef.current.length === 0;
      const shouldResetHistory = Boolean((canvas as any).__resetHistoryOnLoad);
      (canvas as any).__resetHistoryOnLoad = false;
      isInternalLoadRef.current = true;
      (canvas as any).__isLoadingJson = true;
      try {
        const result = await origLoadFromJSON(json, reviver, options);
        if (!isDisposed && !(canvas as any).destroyed) {
          configureTextObjects();
        }
        return result;
      } finally {
        isInternalLoadRef.current = false;
        (canvas as any).__isLoadingJson = false;
        if (!isDisposed && !(canvas as any).destroyed) {
          canvas.fire('studio:json-loaded' as any);
          if (!wasInitialLoad && !isUndoRedoRef.current) {
            queueMicrotask(() => {
              if (isDisposed || (canvas as any).destroyed) return;
              const snap = JSON.stringify(canvas.toJSON());
              prevBackgroundRef.current = String(canvas.backgroundColor || '#ffffff');
              if (shouldResetHistory) {
                historyRef.current = [snap];
                historyIndexRef.current = 0;
                onHistoryChangeRef.current(false, false);
              } else {
                const curIdx = historyIndexRef.current;
                if (historyRef.current[curIdx] !== snap) {
                  const nextHist = historyRef.current.slice(0, curIdx + 1);
                  nextHist.push(snap);
                  if (nextHist.length > 30) nextHist.shift();
                  historyRef.current = nextHist;
                  historyIndexRef.current = nextHist.length - 1;
                  onHistoryChangeRef.current(historyIndexRef.current > 0, false);
                }
              }
            });
          }
        }
      }
    }) as typeof canvas.loadFromJSON;

    fabricRef.current = canvas;
    setupSnapping(canvas);

    // Event listeners
    const handleSelection = () => {
      if (isDisposed || isInternalLoadRef.current) return;
      onSelectionChangeRef.current(canvas.getActiveObject() || null);
    };

    const handleSelectionCleared = () => {
      if (isDisposed || isInternalLoadRef.current) return;
      onSelectionChangeRef.current(null);
    };

    const handleModification = () => {
      if (isDisposed || isInternalLoadRef.current || isUndoRedoRef.current) return;
      recordCanvasState();
    };

    const handleObjectAdded = (e: any) => {
      if (isDisposed) return;
      const target = e?.target;
      if (target && isTextObject(target)) {
        const wrapperEl = (canvas as any).wrapperEl as HTMLElement | undefined;
        if (wrapperEl) {
          target.hiddenTextareaContainer = wrapperEl;
        }
      }
      if (isInternalLoadRef.current || isUndoRedoRef.current) return;
      recordCanvasState();
    };

    const handleTextEditingEntered = (e: any) => {
      const target = e?.target;
      const wrapperEl = (canvas as any).wrapperEl as HTMLElement | undefined;
      if (target && wrapperEl) {
        target.hiddenTextareaContainer = wrapperEl;
      }
    };

    const handleTextChanged = () => {
      if (isDisposed || isInternalLoadRef.current || isUndoRedoRef.current) return;
      if (textEditTimerRef.current) clearTimeout(textEditTimerRef.current);
      textEditTimerRef.current = setTimeout(() => {
        textEditTimerRef.current = null;
        recordCanvasState();
      }, 500);
    };

    const handleTextEditingExited = () => {
      if (isDisposed || isInternalLoadRef.current || isUndoRedoRef.current) return;
      if (textEditTimerRef.current) {
        clearTimeout(textEditTimerRef.current);
        textEditTimerRef.current = null;
      }
      recordCanvasState();
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('object:modified', handleModification);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleModification);
    canvas.on('text:editing:entered', handleTextEditingEntered);
    canvas.on('text:changed', handleTextChanged);
    canvas.on('text:editing:exited', handleTextEditingExited);

    // Load initial JSON document data if present
    const initData = async () => {
      if (
        initialDocumentData &&
        initialDocumentData.objects &&
        initialDocumentData.objects.length > 0
      ) {
        try {
          await canvas.loadFromJSON(initialDocumentData);
          if (isDisposed || (canvas as any).destroyed) return;
          canvas.backgroundColor = background || initialDocumentData.background || '#ffffff';
          canvas.requestRenderAll();
        } catch (err) {
          console.error('Error loading initial canvas JSON:', err);
        }
      }

      if (isDisposed || (canvas as any).destroyed) return;

      // Record baseline initial state
      const initialJson = JSON.stringify(canvas.toJSON());
      historyRef.current = [initialJson];
      historyIndexRef.current = 0;
      onHistoryChangeRef.current(false, false);
      onCanvasReadyRef.current(canvas);
    };

    initData();

    return () => {
      isDisposed = true;
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      if (textEditTimerRef.current) clearTimeout(textEditTimerRef.current);
      if (bgRecordTimerRef.current) clearTimeout(bgRecordTimerRef.current);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Sync background updates only when background value actually changes
  useEffect(() => {
    if (prevBackgroundRef.current === background) return;
    prevBackgroundRef.current = background;

    if (fabricRef.current && !(fabricRef.current as any).destroyed) {
      fabricRef.current.backgroundColor = background || '#ffffff';
      fabricRef.current.requestRenderAll();
      if (!isInternalLoadRef.current && !isUndoRedoRef.current) {
        if (bgRecordTimerRef.current) clearTimeout(bgRecordTimerRef.current);
        bgRecordTimerRef.current = setTimeout(() => {
          bgRecordTimerRef.current = null;
          recordCanvasState();
        }, 250);
      }
    }
  }, [background, recordCanvasState]);

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isFabricTextarea = activeEl?.getAttribute?.('data-fabric') === 'textarea';
      const isUiInput =
        !isFabricTextarea &&
        (activeEl?.tagName === 'INPUT' ||
          activeEl?.tagName === 'TEXTAREA' ||
          activeEl?.tagName === 'SELECT' ||
          activeEl?.isContentEditable);

      // Check if user is actively editing a canvas Textbox
      const canvas = fabricRef.current;
      const activeObj = canvas?.getActiveObject();
      const isEditingText = Boolean(activeObj && (activeObj as any).isEditing) || isFabricTextarea;

      if (e.code === 'Space' && !isUiInput && !isEditingText) {
        if (!isSpacePressedRef.current) {
          isSpacePressedRef.current = true;
          setIsSpacePressed(true);
        }
      }

      // Manual Save: Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (canvas && !(canvas as any).destroyed) {
          if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
          const json = canvas.toJSON();
          const thumb = createCanvasThumbnail(canvas, 0.25);
          onSaveNeededRef.current(json, thumb);
        }
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !isUiInput) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      ) {
        if (!isUiInput) {
          e.preventDefault();
          handleRedo();
          return;
        }
      }

      // Copy: Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !isUiInput && !isEditingText) {
        if (activeObj) {
          e.preventDefault();
          activeObj.clone().then((cloned: any) => {
            clipboardRef.current = cloned;
          });
        }
      }

      // Paste: Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && !isUiInput && !isEditingText) {
        if (clipboardRef.current && canvas) {
          e.preventDefault();
          clipboardRef.current.clone().then((clonedObj: any) => {
            clonedObj.set({
              left: (clonedObj.left || 0) + 20,
              top: (clonedObj.top || 0) + 20,
              evented: true,
            });
            canvas.add(clonedObj);
            canvas.setActiveObject(clonedObj);
            canvas.requestRenderAll();
          });
        }
      }

      // Duplicate: Ctrl+D / Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && !isUiInput && !isEditingText) {
        if (activeObj && canvas) {
          e.preventDefault();
          activeObj.clone().then((clonedObj: any) => {
            clonedObj.set({
              left: (activeObj.left || 0) + 25,
              top: (activeObj.top || 0) + 25,
              evented: true,
            });
            canvas.add(clonedObj);
            canvas.setActiveObject(clonedObj);
            canvas.requestRenderAll();
          });
        }
      }

      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isUiInput && !isEditingText) {
        if (activeObj && canvas) {
          e.preventDefault();
          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length > 0) {
            canvas.discardActiveObject();
            isInternalLoadRef.current = true;
            try {
              canvas.remove(...activeObjects);
            } finally {
              isInternalLoadRef.current = false;
            }
            canvas.requestRenderAll();
            recordCanvasState();
          }
        }
      }

      // Select All: Ctrl+A / Cmd+A
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !isUiInput && !isEditingText) {
        if (canvas) {
          e.preventDefault();
          canvas.discardActiveObject();
          const allObjects = canvas.getObjects();
          if (allObjects.length === 1) {
            canvas.setActiveObject(allObjects[0] as FabricObject);
            canvas.requestRenderAll();
          } else if (allObjects.length > 1) {
            const sel = new ActiveSelection(allObjects, { canvas });
            canvas.setActiveObject(sel);
            canvas.requestRenderAll();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSpacePressedRef.current) {
        isSpacePressedRef.current = false;
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleUndo, handleRedo, recordCanvasState]);

  // Pan and Mouse Wheel Zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY;
      const zoomFactor = delta > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 5);
      onZoomChangeRef.current(newZoom);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressedRef.current || e.button === 1) {
      isPanningRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanningRef.current || !containerRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    containerRef.current.scrollLeft -= dx;
    containerRef.current.scrollTop -= dy;
  };

  const handleMouseUp = () => {
    isPanningRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`flex-1 h-full bg-[#E5E0D8] overflow-auto touch-pan-x touch-pan-y flex items-center justify-center p-3 sm:p-8 relative select-none ${
        isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Canvas Frame with Zoom scale (no CSS transition so pointer offsets stay 100% synced) */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
        className="relative bg-white shadow-[8px_8px_0px_#000000] sm:shadow-[12px_12px_0px_#000000] border-2 sm:border-4 border-black rounded-sm"
      >
        <canvas ref={canvasRef} style={{ touchAction: 'none' }} />
      </div>

      {/* Floating Canvas Dimensions Tag */}
      <div className="absolute bottom-3 left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-black text-[#FACC15] font-black text-[10px] sm:text-xs rounded-lg shadow-[2px_2px_0px_#000000] border border-black z-10">
        {width} × {height} px
      </div>
    </div>
  );
};
