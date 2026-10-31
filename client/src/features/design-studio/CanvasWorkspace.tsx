import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, Point, type FabricObject } from 'fabric';
import { setupSnapping } from './canvasUtils.js';
import { preloadCoreFonts } from '../../lib/designStudio/fontLoader.js';
import type { SaveStatus } from './types.js';

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
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  // Undo / Redo history stack
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoRef = useRef<boolean>(false);
  const clipboardRef = useRef<FabricObject | null>(null);

  // Debounced autosave timer
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Panning state
  const isPanningRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  // Push state to undo/redo history and trigger debounced autosave
  const recordCanvasState = useCallback(() => {
    if (isUndoRedoRef.current || !fabricRef.current) return;
    const canvas = fabricRef.current;

    try {
      const jsonStr = JSON.stringify(canvas.toJSON());
      const currentIndex = historyIndexRef.current;

      // Truncate future states if we branched from previous undo
      const newHistory = historyRef.current.slice(0, currentIndex + 1);
      newHistory.push(jsonStr);

      // Keep max 30 history states
      if (newHistory.length > 30) {
        newHistory.shift();
      }

      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;

      onHistoryChange(historyIndexRef.current > 0, false);

      // Trigger debounced autosave
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        if (!fabricRef.current) return;
        const json = fabricRef.current.toJSON();
        const thumb = fabricRef.current.toDataURL({ format: 'png', multiplier: 0.25 });
        onSaveNeeded(json, thumb);
      }, 1500);
    } catch (err) {
      console.warn('Could not record canvas history:', err);
    }
  }, [onHistoryChange, onSaveNeeded]);

  // Undo operation
  const handleUndo = useCallback(async () => {
    if (historyIndexRef.current <= 0 || !fabricRef.current) return;
    const canvas = fabricRef.current;

    isUndoRedoRef.current = true;
    historyIndexRef.current -= 1;
    const previousState = historyRef.current[historyIndexRef.current];

    if (previousState) {
      await canvas.loadFromJSON(JSON.parse(previousState));
      canvas.requestRenderAll();
    }

    onHistoryChange(
      historyIndexRef.current > 0,
      historyIndexRef.current < historyRef.current.length - 1,
    );
    isUndoRedoRef.current = false;
  }, [onHistoryChange]);

  // Redo operation
  const handleRedo = useCallback(async () => {
    if (historyIndexRef.current >= historyRef.current.length - 1 || !fabricRef.current) return;
    const canvas = fabricRef.current;

    isUndoRedoRef.current = true;
    historyIndexRef.current += 1;
    const nextState = historyRef.current[historyIndexRef.current];

    if (nextState) {
      await canvas.loadFromJSON(JSON.parse(nextState));
      canvas.requestRenderAll();
    }

    onHistoryChange(
      historyIndexRef.current > 0,
      historyIndexRef.current < historyRef.current.length - 1,
    );
    isUndoRedoRef.current = false;
  }, [onHistoryChange]);

  // Initialize Fabric Canvas once
  useEffect(() => {
    if (!canvasRef.current) return;
    preloadCoreFonts();

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: background || '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      stopContextMenu: true,
    });

    fabricRef.current = canvas;
    setupSnapping(canvas);

    // Load initial JSON document data if present
    const initData = async () => {
      if (initialDocumentData && initialDocumentData.objects && initialDocumentData.objects.length > 0) {
        try {
          await canvas.loadFromJSON(initialDocumentData);
          canvas.requestRenderAll();
        } catch (err) {
          console.error('Error loading initial canvas JSON:', err);
        }
      }

      // Record baseline initial state
      const initialJson = JSON.stringify(canvas.toJSON());
      historyRef.current = [initialJson];
      historyIndexRef.current = 0;
      onHistoryChange(false, false);
      onCanvasReady(canvas);
    };

    initData();

    // Event listeners
    const handleSelection = () => {
      onSelectionChange(canvas.getActiveObject() || null);
    };

    const handleModification = () => {
      recordCanvasState();
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => onSelectionChange(null));
    canvas.on('object:modified', handleModification);
    canvas.on('object:added', handleModification);
    canvas.on('object:removed', handleModification);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Sync background updates
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.backgroundColor = background || '#ffffff';
      fabricRef.current.requestRenderAll();
      recordCanvasState();
    }
  }, [background, recordCanvasState]);

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      // Check if user is actively editing a canvas Textbox
      const canvas = fabricRef.current;
      const activeObj = canvas?.getActiveObject();
      const isEditingText = activeObj && (activeObj as any).isEditing;

      if (e.code === 'Space' && !isInput && !isEditingText) {
        setIsSpacePressed(true);
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !isInput) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      ) {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }

      // Copy: Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !isInput && !isEditingText) {
        if (activeObj) {
          e.preventDefault();
          activeObj.clone().then((cloned: any) => {
            clipboardRef.current = cloned;
          });
        }
      }

      // Paste: Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && !isInput && !isEditingText) {
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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && !isInput && !isEditingText) {
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
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && !isEditingText) {
        if (activeObj && canvas) {
          e.preventDefault();
          canvas.remove(activeObj);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      }

      // Select All: Ctrl+A / Cmd+A
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !isInput && !isEditingText) {
        if (canvas) {
          e.preventDefault();
          canvas.discardActiveObject();
          const allObjects = canvas.getObjects();
          if (allObjects.length > 0) {
            // Select first object as active or group
            canvas.setActiveObject(allObjects[0] as FabricObject);
            canvas.requestRenderAll();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleUndo, handleRedo]);

  // Pan and Mouse Wheel Zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY;
      const zoomFactor = delta > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 5);
      onZoomChange(newZoom);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed || e.button === 1) {
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
      className={`flex-1 h-full bg-[#E5E0D8] overflow-auto flex items-center justify-center p-8 relative select-none ${
        isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Canvas Frame with Zoom scale */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.05s ease-out',
        }}
        className="relative bg-white shadow-[12px_12px_0px_#000000] border-4 border-black rounded-sm"
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Floating Canvas Dimensions Tag */}
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-black text-[#FACC15] font-black text-xs rounded-lg shadow-[2px_2px_0px_#000000] border border-black z-10">
        {width} × {height} px
      </div>
    </div>
  );
};
