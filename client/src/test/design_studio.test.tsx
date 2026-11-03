import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router';
import { Canvas, Rect, Textbox, FabricImage, ActiveSelection, cache } from 'fabric';
import { DESIGN_PRESETS, DESIGN_CATEGORIES } from '../lib/designStudio/presets.js';
import { AVAILABLE_FONTS, loadFont } from '../lib/designStudio/fontLoader.js';
import { exportCanvas } from '../lib/designStudio/exportCanvas.js';
import { designStudioApi } from '../lib/designStudio/api.js';
import { TopToolbar } from '../features/design-studio/TopToolbar.js';
import { CanvasWorkspace } from '../features/design-studio/CanvasWorkspace.js';
import { RightInspector } from '../features/design-studio/RightInspector.js';
import { LeftSidebar } from '../features/design-studio/LeftSidebar.js';
import { DesignEditorPage } from '../pages/DesignEditorPage.js';
import {
  addRectangle,
  addCircle,
  addText,
  setupSnapping,
  createCanvasThumbnail,
  isTextObject,
  isImageObject,
  isRectObject,
} from '../features/design-studio/canvasUtils.js';

vi.mock('../context/AuthContext.js', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Provide a complete 2D context mock for JSDOM so real Fabric v7 Canvas instances run cleanly
function setupCanvas2DMock() {
  const createCtx = (canvasEl: HTMLCanvasElement) => {
    const ctx: any = {
      canvas: canvasEl,
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '16px sans-serif',
      textBaseline: 'alphabetic',
      textAlign: 'left',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      shadowColor: 'rgba(0,0,0,0)',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      imageSmoothingEnabled: true,
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clip: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn((text: string) => ({
        width: (text || '').length * 8,
        actualBoundingBoxAscent: 10,
        actualBoundingBoxDescent: 3,
        fontBoundingBoxAscent: 12,
        fontBoundingBoxDescent: 4,
      })),
      drawImage: vi.fn(),
      createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
      putImageData: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createPattern: vi.fn(() => ({})),
      setLineDash: vi.fn(),
      getLineDash: vi.fn(() => []),
    };
    return ctx;
  };

  const contextMap = new WeakMap<HTMLCanvasElement, any>();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
    this: HTMLCanvasElement,
    contextId: string,
  ) {
    if (contextId === '2d') {
      let existing = contextMap.get(this);
      if (!existing) {
        existing = createCtx(this);
        contextMap.set(this, existing);
      }
      return existing;
    }
    return null as any;
  });

  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  );
}

describe('Design Studio Client Architecture & Performance Regression Suite', () => {
  beforeEach(() => {
    setupCanvas2DMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Presets and Categories Configuration', () => {
    it('should include all required categories', () => {
      const categoryIds = DESIGN_CATEGORIES.map((c) => c.id);
      expect(categoryIds).toContain('all');
      expect(categoryIds).toContain('social-media');
      expect(categoryIds).toContain('youtube');
      expect(categoryIds).toContain('presentations');
      expect(categoryIds).toContain('marketing');
      expect(categoryIds).toContain('business');
      expect(categoryIds).toContain('events');
      expect(categoryIds).toContain('custom');
    });

    it('should provide popular social media and print presets with correct dimensions', () => {
      const igPost = DESIGN_PRESETS.find((p) => p.id === 'instagram-post');
      expect(igPost).toBeDefined();
      expect(igPost?.width).toBe(1080);
      expect(igPost?.height).toBe(1080);
      expect(igPost?.aspectRatio).toBe('1:1');

      const ytThumb = DESIGN_PRESETS.find((p) => p.id === 'youtube-thumbnail');
      expect(ytThumb).toBeDefined();
      expect(ytThumb?.width).toBe(1280);
      expect(ytThumb?.height).toBe(720);

      const story = DESIGN_PRESETS.find((p) => p.id === 'instagram-story');
      expect(story).toBeDefined();
      expect(story?.width).toBe(1080);
      expect(story?.height).toBe(1920);

      const slide = DESIGN_PRESETS.find((p) => p.id === 'presentation-slide');
      expect(slide).toBeDefined();
      expect(slide?.width).toBe(1920);
      expect(slide?.height).toBe(1080);
    });
  });

  describe('Font Loader Catalog & Cache Invalidation', () => {
    it('should offer key typography font families', () => {
      const families = AVAILABLE_FONTS.map((f) => f.family);
      expect(families).toContain('Inter');
      expect(families).toContain('Montserrat');
      expect(families).toContain('Roboto');
      expect(families).toContain('Playfair Display');
      expect(families).toContain('Oswald');
      expect(families).toContain('Lobster');
      expect(families).toContain('Courier Prime');
    });

    it('should deduplicate concurrent font loads and clear Fabric font cache on load', async () => {
      const clearCacheSpy = vi.spyOn(cache, 'clearFontCache');
      const p1 = loadFont('Lobster');
      const p2 = loadFont('Lobster');
      const links = document.querySelectorAll('link[id="google-font-lobster"]');
      expect(links.length).toBe(1);

      // Simulate stylesheet onload
      const linkEl = links[0] as HTMLLinkElement;
      linkEl.onload?.(new Event('load'));
      await Promise.all([p1, p2]);
      expect(clearCacheSpy).toHaveBeenCalledWith('Lobster');
    });
  });

  describe('TopToolbar Component', () => {
    it('should render project title, save status, and trigger callbacks on interaction', () => {
      const onTitleChange = vi.fn();
      const onManualSave = vi.fn();
      const onUndo = vi.fn();
      const onRedo = vi.fn();
      const onZoomIn = vi.fn();
      const onZoomOut = vi.fn();
      const onZoomReset = vi.fn();
      const onOpenPreview = vi.fn();
      const onOpenExport = vi.fn();
      const onOpenVersions = vi.fn();
      const onOpenAITools = vi.fn();

      render(
        <BrowserRouter>
          <TopToolbar
            title="My Test Banner"
            onTitleChange={onTitleChange}
            saveStatus="saved"
            lastSavedAt={new Date('2026-10-30T10:00:00Z')}
            onManualSave={onManualSave}
            canUndo={true}
            canRedo={false}
            onUndo={onUndo}
            onRedo={onRedo}
            zoom={1}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onZoomReset={onZoomReset}
            onOpenPreview={onOpenPreview}
            onOpenExport={onOpenExport}
            onOpenVersions={onOpenVersions}
            onOpenAITools={onOpenAITools}
            currentVersion={3}
          />
        </BrowserRouter>,
      );

      const titleInput = screen.getByPlaceholderText('Untitled Design') as HTMLInputElement;
      expect(titleInput.value).toBe('My Test Banner');

      fireEvent.change(titleInput, { target: { value: 'Renamed Banner' } });
      fireEvent.blur(titleInput);
      expect(onTitleChange).toHaveBeenCalledWith('Renamed Banner');

      fireEvent.click(screen.getByText('Export'));
      expect(onOpenExport).toHaveBeenCalled();

      fireEvent.click(screen.getByTitle('Enhance image with AI (Free & Built-in)'));
      expect(onOpenAITools).toHaveBeenCalled();

      fireEvent.click(screen.getByTitle('Undo (Ctrl+Z)'));
      expect(onUndo).toHaveBeenCalled();

      expect(screen.getByText('v3')).toBeDefined();
    });
  });

  describe('Regression 1, 2 & 3: Single Drag, Multi-Object Drag, Resize/Rotate & Center Snapping', () => {
    it('drags single and multiple objects smoothly without per-frame serialization or center-snap jumps', async () => {
      vi.useFakeTimers();
      let readyCanvas: Canvas | null = null;
      const onSaveNeeded = vi.fn();
      const onHistoryChange = vi.fn();
      const onSelectionChange = vi.fn();

      render(
        <CanvasWorkspace
          width={1000}
          height={800}
          background="#ffffff"
          onCanvasReady={(c) => {
            readyCanvas = c;
          }}
          onSelectionChange={onSelectionChange}
          onSaveNeeded={onSaveNeeded}
          onHistoryChange={onHistoryChange}
          zoom={1}
          onZoomChange={vi.fn()}
        />,
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });
      expect(readyCanvas).not.toBeNull();
      const canvas = readyCanvas!;

      const rect1 = addRectangle(canvas, { left: 100, top: 100, width: 200, height: 100 });
      const rect2 = addCircle(canvas, { left: 300, top: 200, radius: 50 });

      // Clear initial add calls
      onSaveNeeded.mockClear();
      onHistoryChange.mockClear();
      const toJsonSpy = vi.spyOn(canvas, 'toJSON');

      // 1. Simulate 30 rapid pointer movements (dragging rect1 across the canvas and near center)
      for (let i = 0; i < 30; i++) {
        rect1.set({ left: 100 + i * 10, top: 100 + i * 8 });
        canvas.fire('object:moving', { target: rect1 } as any);
      }

      // During transient drag frames, zero history serializations or autosaves should run
      expect(toJsonSpy).not.toHaveBeenCalled();
      expect(onHistoryChange).not.toHaveBeenCalled();
      expect(onSaveNeeded).not.toHaveBeenCalled();

      // Test center snapping accuracy: place rect1 (200x100) within 8px of canvas center (500, 400)
      // Center of rect1 with top-left origin is (left + 100, top + 50).
      // Setting left=396 (center X = 496, within 8px of 500) and top=354 (center Y = 404, within 8px of 400):
      rect1.set({ left: 396, top: 354 });
      rect1.setCoords();
      canvas.fire('object:moving', { target: rect1 } as any);

      const snappedCenter = rect1.getCenterPoint();
      expect(Math.round(snappedCenter.x)).toBe(500);
      expect(Math.round(snappedCenter.y)).toBe(400);
      // With originX='left', originY='top' and strokeWidth=2 (total 202x102), left is 399 and top is 349 (no half-width jump!)
      expect(Math.round(rect1.left)).toBe(399);
      expect(Math.round(rect1.top)).toBe(349);

      // Commit drag end
      canvas.fire('object:modified', { target: rect1 } as any);
      expect(toJsonSpy).toHaveBeenCalledTimes(1);
      expect(onHistoryChange).toHaveBeenCalledTimes(1);
      expect(onHistoryChange).toHaveBeenLastCalledWith(true, false);

      // 2. Multi-object selection (ActiveSelection) drag
      toJsonSpy.mockClear();
      const multiSel = new ActiveSelection([rect1, rect2], { canvas });
      canvas.setActiveObject(multiSel);
      for (let i = 0; i < 10; i++) {
        multiSel.set({ left: (multiSel.left || 0) + 5, top: (multiSel.top || 0) + 5 });
        canvas.fire('object:moving', { target: multiSel } as any);
      }
      expect(toJsonSpy).not.toHaveBeenCalled();
      canvas.fire('object:modified', { target: multiSel } as any);
      expect(toJsonSpy).toHaveBeenCalledTimes(1);

      // 3. Resize and rotate object
      canvas.setActiveObject(rect1);
      rect1.set({ scaleX: 1.5, scaleY: 1.2, angle: 45 });
      rect1.setCoords();
      canvas.fire('object:modified', { target: rect1 } as any);
      expect(rect1.scaleX).toBe(1.5);
      expect(rect1.angle).toBe(45);

      // Autosave fires only once after 1500ms debounce
      expect(onSaveNeeded).not.toHaveBeenCalled();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1600);
      });
      expect(onSaveNeeded).toHaveBeenCalledTimes(1);
    });
  });

  describe('Regression 4, 5 & 12: Zoom, Pan, and Browser Window Resize Stability', () => {
    it('maintains stable canvas instance across zoom, pan, and window resize without remounting or re-serializing', async () => {
      vi.useFakeTimers();
      let readyCanvas: Canvas | null = null;
      const onSaveNeeded = vi.fn();
      const onHistoryChange = vi.fn();
      const onZoomChange = vi.fn();

      const { rerender } = render(
        <CanvasWorkspace
          width={1080}
          height={1080}
          background="#ffffff"
          onCanvasReady={(c) => {
            readyCanvas = c;
          }}
          onSelectionChange={vi.fn()}
          onSaveNeeded={onSaveNeeded}
          onHistoryChange={onHistoryChange}
          zoom={0.65}
          onZoomChange={onZoomChange}
        />,
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });
      const canvas = readyCanvas!;
      const calcOffsetSpy = vi.spyOn(canvas, 'calcOffset');
      const toJsonSpy = vi.spyOn(canvas, 'toJSON');
      onHistoryChange.mockClear();

      // 4. Zoom change re-render
      rerender(
        <CanvasWorkspace
          width={1080}
          height={1080}
          background="#ffffff"
          onCanvasReady={(c) => {
            readyCanvas = c;
          }}
          onSelectionChange={vi.fn()}
          onSaveNeeded={onSaveNeeded}
          onHistoryChange={onHistoryChange}
          zoom={1.25}
          onZoomChange={onZoomChange}
        />,
      );

      // Canvas instance must remain identical and recalibrate offsets without serializing history
      expect(readyCanvas).toBe(canvas);
      expect(calcOffsetSpy).toHaveBeenCalled();
      expect(toJsonSpy).not.toHaveBeenCalled();
      expect(onHistoryChange).not.toHaveBeenCalled();

      // 12. Window resize recalibrates canvas offset
      calcOffsetSpy.mockClear();
      fireEvent(window, new Event('resize'));
      expect(calcOffsetSpy).toHaveBeenCalled();

      // 5. Spacebar panning toggle
      fireEvent.keyDown(window, { code: 'Space' });
      fireEvent.keyUp(window, { code: 'Space' });
      expect(toJsonSpy).not.toHaveBeenCalled();
    });
  });

  describe('Regression 6, 7, 8 & 9: Continuous Typing, Multiline Text, Typography, and Undo/Redo', () => {
    it('handles rapid continuous typing and multiline text without per-keystroke serialization and supports accurate undo/redo', async () => {
      vi.useFakeTimers();
      let readyCanvas: Canvas | null = null;
      let undoRedoActions = { undo: () => {}, redo: () => {} };
      const onSaveNeeded = vi.fn();
      const onHistoryChange = vi.fn();

      render(
        <CanvasWorkspace
          width={1080}
          height={1080}
          background="#ffffff"
          onCanvasReady={(c) => {
            readyCanvas = c;
          }}
          onSelectionChange={vi.fn()}
          onSaveNeeded={onSaveNeeded}
          onHistoryChange={onHistoryChange}
          onRegisterUndoRedo={(actions) => {
            undoRedoActions = actions;
          }}
          zoom={1}
          onZoomChange={vi.fn()}
        />,
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });
      const canvas = readyCanvas!;

      // Add a text object
      const textObj = addText(canvas, 'heading', 'Initial');
      expect(isTextObject(textObj)).toBe(true);
      expect(textObj.splitByGrapheme).toBe(false);
      expect((textObj as any).hiddenTextareaContainer).toBe((canvas as any).wrapperEl);

      const toJsonSpy = vi.spyOn(canvas, 'toJSON');
      onHistoryChange.mockClear();
      onSaveNeeded.mockClear();

      // 6 & 7. Simulate entering text editing and typing 25 rapid characters including multiline
      canvas.fire('text:editing:entered', { target: textObj } as any);
      const typedFrames = 'Hello World!\nSecond Line\nThird Line';
      for (let i = 1; i <= typedFrames.length; i++) {
        textObj.set('text', typedFrames.slice(0, i));
        canvas.fire('text:changed', { target: textObj } as any);
      }

      // Zero full-document serializations during active keystrokes!
      expect(toJsonSpy).not.toHaveBeenCalled();
      expect(onSaveNeeded).not.toHaveBeenCalled();

      // Advance 500ms for debounced text commit
      await act(async () => {
        await vi.advanceTimersByTimeAsync(550);
      });
      expect(toJsonSpy).toHaveBeenCalledTimes(1);

      // Exiting editing when no further changes occurred should deduplicate and not push a duplicate state
      canvas.fire('text:editing:exited', { target: textObj } as any);
      expect(onHistoryChange).toHaveBeenLastCalledWith(true, false);

      // 9. Undo and Redo text changes
      await act(async () => {
        await undoRedoActions.undo();
      });
      const textAfterUndo = canvas.getObjects().find((o) => isTextObject(o)) as Textbox;
      expect(textAfterUndo.text).toBe('Initial');
      // Verify canRedo is true (not wiped out by a re-render effect!)
      expect(onHistoryChange).toHaveBeenLastCalledWith(true, true);

      await act(async () => {
        await undoRedoActions.redo();
      });
      const textAfterRedo = canvas.getObjects().find((o) => isTextObject(o)) as Textbox;
      expect(textAfterRedo.text).toBe(typedFrames);
      expect(onHistoryChange).toHaveBeenLastCalledWith(true, false);
    });

    it('updates text content, font, size, and alignment from RightInspector without recreating the Textbox', async () => {
      vi.useFakeTimers();
      const canvasEl = document.createElement('canvas');
      const canvas = new Canvas(canvasEl, { width: 800, height: 600 });
      const textObj = addText(canvas, 'heading', 'Original Heading');
      const modifiedSpy = vi.fn();
      canvas.on('object:modified', modifiedSpy);

      render(
        <RightInspector
          canvas={canvas}
          activeObject={textObj}
          canvasWidth={800}
          canvasHeight={600}
          canvasBackground="#ffffff"
          onBackgroundChange={vi.fn()}
          onOpenAITools={vi.fn()}
        />,
      );

      // Verify Typography section renders even with Fabric v7 lowercase type ('textbox')
      const textarea = screen.getByPlaceholderText('Enter text...') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Original Heading');

      // Type multiline text in inspector
      fireEvent.change(textarea, { target: { value: 'Updated Line 1\nUpdated Line 2' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      // Same Textbox instance is mutated in-place, not recreated
      expect(canvas.getObjects().length).toBe(1);
      expect(canvas.getObjects()[0]).toBe(textObj);
      expect(textObj.text).toBe('Updated Line 1\nUpdated Line 2');

      // Change alignment and bold
      fireEvent.click(screen.getByTitle('center'));
      expect(textObj.textAlign).toBe('center');
      expect(modifiedSpy).toHaveBeenCalled();

      canvas.dispose();
    });
  });

  describe('Regression 10: Add, Inspect, and Remove Images & Layers Sync', () => {
    it('identifies FabricImage and Rect in Fabric v7 and syncs layers cleanly', () => {
      const canvasEl = document.createElement('canvas');
      const canvas = new Canvas(canvasEl, { width: 800, height: 600 });
      const rect = addRectangle(canvas);
      const imgEl = document.createElement('img');
      imgEl.width = 200;
      imgEl.height = 200;
      const fabricImg = new FabricImage(imgEl, { left: 50, top: 50 });
      canvas.add(fabricImg);

      expect(isRectObject(rect)).toBe(true);
      expect(isImageObject(fabricImg)).toBe(true);

      const { unmount } = render(
        <RightInspector
          canvas={canvas}
          activeObject={fabricImg}
          canvasWidth={800}
          canvasHeight={600}
          canvasBackground="#ffffff"
          onBackgroundChange={vi.fn()}
          onOpenAITools={vi.fn()}
        />,
      );

      // Verify Image Controls section renders for FabricImage
      expect(screen.getByText('Image Controls')).toBeDefined();
      expect(screen.getByText('Flip Horiz.')).toBeDefined();
      fireEvent.click(screen.getByText('Flip Horiz.'));
      expect(fabricImg.flipX).toBe(true);

      unmount();

      // Verify LeftSidebar Layers tab lists both objects and removes image cleanly
      render(
        <BrowserRouter>
          <LeftSidebar
            canvas={canvas}
            canvasBackground="#ffffff"
            onBackgroundChange={vi.fn()}
            onApplyTemplate={vi.fn()}
          />
        </BrowserRouter>,
      );

      fireEvent.click(screen.getByTitle('Layers'));
      expect(screen.getByText('2 items')).toBeDefined();

      // Remove image
      act(() => {
        canvas.remove(fabricImg);
      });
      expect(canvas.getObjects().length).toBe(1);
      canvas.dispose();
    });
  });

  describe('Regression 11, 13 & 14: Thumbnail Cache Safety, Save Queue Race Protection, Page Switching & Export', () => {
    it('generates canvas thumbnails via offscreen canvas without mutating viewportTransform or object caches', () => {
      const canvasEl = document.createElement('canvas');
      const canvas = new Canvas(canvasEl, { width: 1080, height: 1080 });
      addRectangle(canvas);
      const originalVpt = [...canvas.viewportTransform];
      const toCanvasElSpy = vi.spyOn(canvas, 'toCanvasElement');

      const thumb = createCanvasThumbnail(canvas, 0.25);
      expect(thumb).toContain('data:image/png;base64');
      expect(toCanvasElSpy).not.toHaveBeenCalled();
      expect(canvas.viewportTransform).toEqual(originalVpt);
      canvas.dispose();
    });

    it('queues concurrent saves sequentially and prevents older save responses from overwriting newer edits', async () => {
      let resolveFirstSave!: (val: any) => void;
      const firstSavePromise = new Promise((res) => {
        resolveFirstSave = res;
      });

      vi.spyOn(designStudioApi, 'getProject').mockResolvedValue({
        _id: 'proj-123',
        userId: 'user-1',
        title: 'Perf Test Project',
        width: 1080,
        height: 1080,
        background: '#ffffff',
        category: 'social-media',
        documentData: { version: '7.4.0', objects: [] },
        currentVersion: 1,
        revision: 5,
        isStarred: false,
        isShared: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const updateSpy = vi
        .spyOn(designStudioApi, 'updateProject')
        .mockImplementationOnce(() => firstSavePromise as any)
        .mockImplementationOnce(async (_id, payload) => ({
          _id: 'proj-123',
          userId: 'user-1',
          title: payload.title || 'Perf Test Project',
          width: 1080,
          height: 1080,
          background: payload.background || '#ffffff',
          category: 'social-media',
          documentData: payload.documentData || { version: '7.4.0', objects: [] },
          currentVersion: 1,
          revision: (payload.revision || 5) + 1,
          isStarred: false,
          isShared: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

      render(
        <MemoryRouter initialEntries={['/studio/editor/proj-123']}>
          <Routes>
            <Route path="/studio/editor/:projectId" element={<DesignEditorPage />} />
          </Routes>
        </MemoryRouter>,
      );

      // Wait for project to load
      await screen.findByDisplayValue('Perf Test Project');

      // Trigger first manual save via File Menu -> Save Project (stays in-flight)
      fireEvent.click(screen.getByTitle('File Menu'));
      fireEvent.click(screen.getByText('Save Project'));
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy.mock.calls[0]?.[1]?.revision).toBe(5);

      // Trigger a second manual save while the first is still in-flight
      fireEvent.click(screen.getByTitle('File Menu'));
      fireEvent.click(screen.getByText('Save Project'));
      // Should be queued, not fired concurrently with stale revision 5
      expect(updateSpy).toHaveBeenCalledTimes(1);

      // Resolve first save -> returns revision 6, and automatically flushes queued save with revision 6
      await act(async () => {
        resolveFirstSave({
          _id: 'proj-123',
          userId: 'user-1',
          title: 'Perf Test Project',
          width: 1080,
          height: 1080,
          background: '#ffffff',
          category: 'social-media',
          documentData: { version: '7.4.0', objects: [] },
          currentVersion: 1,
          revision: 6,
          isStarred: false,
          isShared: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(updateSpy.mock.calls[1]?.[1]?.revision).toBe(6);

      // 11. Test adding a page and switching between pages cleanly
      updateSpy.mockResolvedValue({
        _id: 'proj-123',
        userId: 'user-1',
        title: 'Perf Test Project',
        width: 1080,
        height: 1080,
        background: '#ffffff',
        category: 'social-media',
        documentData: { version: '7.4.0', objects: [] },
        currentVersion: 1,
        revision: 8,
        isStarred: false,
        isShared: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await act(async () => {
        fireEvent.click(screen.getByTitle('Add new page'));
      });
      expect(screen.getByText('Page 2')).toBeDefined();

      await act(async () => {
        fireEvent.click(screen.getByText('Page 1'));
      });
      expect(screen.getByText('Pages (2):')).toBeDefined();
    });

    it('exports canvas to PNG and JPEG while preserving active selection', async () => {
      const canvasEl = document.createElement('canvas');
      const canvas = new Canvas(canvasEl, { width: 800, height: 600 });
      const rect = addRectangle(canvas);
      canvas.setActiveObject(rect);

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        blob: async () => new Blob(['mock'], { type: 'image/png' }),
        arrayBuffer: async () => new ArrayBuffer(8),
      } as any);

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      await exportCanvas(canvas, '#ffffff', {
        format: 'png',
        quality: 1,
        multiplier: 1,
        fileName: 'test-export',
      });

      await exportCanvas(canvas, '#ffffff', {
        format: 'jpeg',
        quality: 0.9,
        multiplier: 2,
        fileName: 'test-export',
      });

      expect(clickSpy).toHaveBeenCalledTimes(2);
      expect(canvas.getActiveObject()).toBe(rect);
      canvas.dispose();
    });

    it('supports mobile responsiveness with slide-over drawers for LeftSidebar and RightInspector', async () => {
      const onCloseLeft = vi.fn();
      const onCloseRight = vi.fn();

      // Test LeftSidebar mobile drawer
      const { rerender } = render(
        <MemoryRouter>
          <LeftSidebar
            canvas={null}
            canvasBackground="#ffffff"
            onBackgroundChange={vi.fn()}
            onApplyTemplate={vi.fn()}
            isOpenMobile={true}
            onCloseMobile={onCloseLeft}
          />
        </MemoryRouter>,
      );

      expect(screen.getByText('Studio Elements')).toBeDefined();
      const closeLeftBtn = screen.getByLabelText('Close Elements Panel');
      fireEvent.click(closeLeftBtn);
      expect(onCloseLeft).toHaveBeenCalledTimes(1);

      // Test RightInspector mobile drawer
      rerender(
        <MemoryRouter>
          <RightInspector
            canvas={null}
            activeObject={null}
            canvasWidth={1080}
            canvasHeight={1080}
            canvasBackground="#ffffff"
            onBackgroundChange={vi.fn()}
            onOpenAITools={vi.fn()}
            isOpenMobile={true}
            onCloseMobile={onCloseRight}
          />
        </MemoryRouter>,
      );

      expect(screen.getAllByText('Canvas Settings').length).toBeGreaterThan(0);
      const closeRightBtn = screen.getByLabelText('Close Properties Panel');
      fireEvent.click(closeRightBtn);
      expect(onCloseRight).toHaveBeenCalledTimes(1);
    });

    it('renders DesignEditorPage with mobile quick action controls', async () => {
      vi.spyOn(designStudioApi, 'getProject').mockResolvedValue({
        _id: 'proj-mobile',
        userId: 'user-1',
        title: 'Mobile Studio Test',
        width: 1080,
        height: 1080,
        currentVersion: 1,
        revision: 1,
        category: 'custom',
        isStarred: false,
        isShared: false,
        background: '#ffffff',
        documentData: { version: '7.4.0', objects: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      render(
        <MemoryRouter initialEntries={['/studio/editor/proj-mobile']}>
          <Routes>
            <Route path="/studio/editor/:projectId" element={<DesignEditorPage />} />
          </Routes>
        </MemoryRouter>,
      );

      // Wait for project to load
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      // Mobile Quick Action Bar elements exist in DOM
      expect(screen.getByRole('button', { name: /\+ Elements/i })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Properties' })).toBeDefined();

      // Clicking "+ Elements" toggles mobile drawer
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /\+ Elements/i }));
      });
      expect(screen.getByText('Studio Elements')).toBeDefined();
    });
  });
});
