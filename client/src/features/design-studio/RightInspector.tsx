import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Type,
  Palette,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { filters, Shadow, Rect, FabricImage, type Canvas, type FabricObject } from 'fabric';
import { AVAILABLE_FONTS, loadFont } from '../../lib/designStudio/fontLoader.js';
import { isTextObject, isImageObject, isRectObject } from './canvasUtils.js';

interface RightInspectorProps {
  canvas: Canvas | null;
  activeObject: FabricObject | null;
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: string;
  onBackgroundChange: (color: string) => void;
  onOpenAITools: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  canvas,
  activeObject,
  canvasWidth,
  canvasHeight,
  canvasBackground,
  onBackgroundChange,
  onOpenAITools,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  // Common object state
  const [left, setLeft] = useState<number>(0);
  const [top, setTop] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(1);
  const [fill, setFill] = useState<string>('#000000');
  const [stroke, setStroke] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Text specific state
  const [textValue, setTextValue] = useState<string>('');
  const [fontFamily, setFontFamily] = useState<string>('Inter');
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontWeight, setFontWeight] = useState<string | number>('normal');
  const [fontStyle, setFontStyle] = useState<string>('normal');
  const [underline, setUnderline] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<string>('left');
  const [lineHeight, setLineHeight] = useState<number>(1.2);
  const [charSpacing, setCharSpacing] = useState<number>(0);
  const [textBackground, setTextBackground] = useState<string>('');

  // Rect specific
  const [rx, setRx] = useState<number>(0);

  // Image filters
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);

  // Drop Shadow state
  const [shadowEnabled, setShadowEnabled] = useState<boolean>(false);
  const [shadowColor, setShadowColor] = useState<string>('#000000');
  const [shadowBlur, setShadowBlur] = useState<number>(0);
  const [shadowOffsetX, setShadowOffsetX] = useState<number>(6);
  const [shadowOffsetY, setShadowOffsetY] = useState<number>(6);

  // Debounce and rAF refs for inspector property & text edits
  const propCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textFrameRef = useRef<number | null>(null);
  const filterFrameRef = useRef<number | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const scheduleObjectModified = useCallback(
    (immediate = false, delayMs = 300) => {
      if (!canvas || !activeObject) return;
      if (propCommitTimerRef.current) {
        clearTimeout(propCommitTimerRef.current);
        propCommitTimerRef.current = null;
      }
      if (immediate) {
        canvas.fire('object:modified', { target: activeObject });
      } else {
        const targetObj = activeObject;
        propCommitTimerRef.current = setTimeout(() => {
          propCommitTimerRef.current = null;
          canvas.fire('object:modified', { target: targetObj });
        }, delayMs);
      }
    },
    [canvas, activeObject],
  );

  useEffect(() => {
    return () => {
      if (propCommitTimerRef.current) clearTimeout(propCommitTimerRef.current);
      if (textFrameRef.current !== null) cancelAnimationFrame(textFrameRef.current);
      if (filterFrameRef.current !== null) cancelAnimationFrame(filterFrameRef.current);
    };
  }, []);

  const syncFromObject = useCallback((obj: FabricObject | null, syncTextContent = true) => {
    if (!obj) return;

    setLeft(Math.round(obj.left || 0));
    setTop(Math.round(obj.top || 0));
    setWidth(Math.round((obj.width || 0) * (obj.scaleX || 1)));
    setHeight(Math.round((obj.height || 0) * (obj.scaleY || 1)));
    setAngle(Math.round(obj.angle || 0));
    setOpacity(obj.opacity ?? 1);
    setFill(typeof obj.fill === 'string' ? obj.fill : '#000000');
    setStroke(typeof obj.stroke === 'string' ? obj.stroke : '#000000');
    setStrokeWidth(obj.strokeWidth || 0);
    setIsLocked(Boolean(obj.lockMovementX));

    if (isTextObject(obj)) {
      const tb = obj as any;
      if (syncTextContent && document.activeElement !== textAreaRef.current) {
        setTextValue(tb.text ?? '');
      }
      setFontFamily(tb.fontFamily || 'Inter');
      setFontSize(Math.round(tb.fontSize || 24));
      setFontWeight(tb.fontWeight || 'normal');
      setFontStyle(tb.fontStyle || 'normal');
      setUnderline(Boolean(tb.underline));
      setTextAlign(tb.textAlign || 'left');
      setLineHeight(tb.lineHeight || 1.2);
      setCharSpacing(tb.charSpacing || 0);
      setTextBackground(tb.backgroundColor || '');
    }

    if (isRectObject(obj)) {
      const r = obj as any;
      setRx(r.rx || 0);
    } else {
      setRx(0);
    }

    const sh = obj.shadow as any;
    if (sh) {
      setShadowEnabled(true);
      setShadowColor(sh.color || '#000000');
      setShadowBlur(sh.blur || 0);
      setShadowOffsetX(sh.offsetX ?? 6);
      setShadowOffsetY(sh.offsetY ?? 6);
    } else {
      setShadowEnabled(false);
    }
  }, []);

  // Sync state when active object changes or finishes transforming/editing
  useEffect(() => {
    if (!activeObject) return;
    syncFromObject(activeObject, true);

    if (!canvas) return;
    const handleModified = (e: any) => {
      if (!e?.target || e.target === activeObject) {
        syncFromObject(activeObject, true);
      }
    };
    const handleTextExited = (e: any) => {
      if (!e?.target || e.target === activeObject) {
        syncFromObject(activeObject, true);
      }
    };

    canvas.on('object:modified', handleModified);
    canvas.on('text:editing:exited', handleTextExited);
    return () => {
      canvas.off('object:modified', handleModified);
      canvas.off('text:editing:exited', handleTextExited);
    };
  }, [activeObject, canvas, syncFromObject]);

  const updateProp = (prop: string, val: any, immediateCommit = false) => {
    if (!activeObject || !canvas) return;
    activeObject.set(prop, val);
    if (
      isTextObject(activeObject) &&
      (prop === 'fontSize' ||
        prop === 'fontWeight' ||
        prop === 'fontStyle' ||
        prop === 'lineHeight' ||
        prop === 'charSpacing' ||
        prop === 'textAlign' ||
        prop === 'underline')
    ) {
      (activeObject as any).initDimensions?.();
      activeObject.setCoords();
    } else if (
      prop === 'left' ||
      prop === 'top' ||
      prop === 'scaleX' ||
      prop === 'scaleY' ||
      prop === 'angle' ||
      prop === 'strokeWidth'
    ) {
      activeObject.setCoords();
    }
    canvas.requestRenderAll();
    scheduleObjectModified(immediateCommit);
  };

  const handleTextContentChange = (nextText: string) => {
    setTextValue(nextText);
    if (!activeObject || !canvas || !isTextObject(activeObject)) return;

    if (textFrameRef.current !== null) {
      cancelAnimationFrame(textFrameRef.current);
    }
    const targetObj = activeObject as any;
    textFrameRef.current = requestAnimationFrame(() => {
      textFrameRef.current = null;
      targetObj.set('text', nextText);
      targetObj.initDimensions?.();
      targetObj.setCoords?.();
      canvas.requestRenderAll();
    });

    scheduleObjectModified(false, 400);
  };

  const handleFontFamilyChange = async (font: string) => {
    setFontFamily(font);
    await loadFont(font);
    if (!activeObject || !canvas) return;
    activeObject.set('fontFamily', font);
    (activeObject as any).initDimensions?.();
    activeObject.setCoords();
    canvas.requestRenderAll();
    scheduleObjectModified(true);
  };

  const handleDuplicate = () => {
    if (!activeObject || !canvas) return;
    activeObject.clone().then((cloned: any) => {
      cloned.set({
        left: (activeObject.left || 0) + 20,
        top: (activeObject.top || 0) + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  };

  const handleDelete = () => {
    if (!activeObject || !canvas) return;
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const handleToggleLock = () => {
    if (!activeObject || !canvas) return;
    const nextLocked = !isLocked;
    activeObject.set({
      lockMovementX: nextLocked,
      lockMovementY: nextLocked,
      lockRotation: nextLocked,
      lockScalingX: nextLocked,
      lockScalingY: nextLocked,
    });
    setIsLocked(nextLocked);
    canvas.requestRenderAll();
    scheduleObjectModified(true);
  };

  // Image Filter Applicator
  const applyImageFilters = (
    nextBrightness = brightness,
    nextContrast = contrast,
    nextSaturation = saturation,
    nextBlur = blur,
  ) => {
    if (!activeObject || !canvas || !isImageObject(activeObject)) return;
    const img = activeObject as any;

    if (filterFrameRef.current !== null) {
      cancelAnimationFrame(filterFrameRef.current);
    }

    filterFrameRef.current = requestAnimationFrame(() => {
      filterFrameRef.current = null;
      const filterList: any[] = [];

      if (nextBrightness !== 0) {
        filterList.push(new filters.Brightness({ brightness: nextBrightness }));
      }
      if (nextContrast !== 0) {
        filterList.push(new filters.Contrast({ contrast: nextContrast }));
      }
      if (nextSaturation !== 0) {
        filterList.push(new filters.Saturation({ saturation: nextSaturation }));
      }
      if (nextBlur > 0) {
        filterList.push(new filters.Blur({ blur: nextBlur }));
      }

      img.filters = filterList;
      img.applyFilters();
      canvas.requestRenderAll();
    });

    scheduleObjectModified(false, 350);
  };

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
        className={`bg-white border-l border-slate-200 flex flex-col shrink-0 select-none overflow-y-auto p-4 ${
          isOpenMobile
            ? 'fixed inset-y-0 right-0 z-50 w-80 max-w-[88vw] h-full shadow-2xl flex'
            : 'hidden lg:flex w-72 h-full z-20'
        }`}
      >
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 lg:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#7d2ae8]" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              {activeObject ? 'Element Properties' : 'Canvas Settings'}
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close Properties Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Nothing Selected: Canvas Overview */}
        {!activeObject ? (
          <div className="space-y-4">
            <div className="hidden lg:flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-[#7d2ae8]" />
              <h4 className="font-bold text-sm text-slate-800">Canvas Settings</h4>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Dimensions
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-semibold block uppercase">
                    Width
                  </span>
                  <span className="text-sm font-bold text-slate-800">{canvasWidth} px</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-semibold block uppercase">
                    Height
                  </span>
                  <span className="text-sm font-bold text-slate-800">{canvasHeight} px</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Canvas Background
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={canvasBackground.startsWith('#') ? canvasBackground : '#ffffff'}
                  onChange={(e) => onBackgroundChange(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0 bg-transparent"
                />
                <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                  {canvasBackground}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 text-xs font-medium text-slate-600 leading-relaxed">
              Tip: Click any element on the canvas to inspect its layer, colors, font styling, and
              size.
            </div>
          </div>
        ) : (
          /* Object Inspector */
          <div className="space-y-4">
            {/* Header & Quick Action Buttons */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-xs uppercase px-2.5 py-1 bg-purple-100 text-[#7d2ae8] rounded-md">
                {activeObject.type}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleToggleLock}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isLocked
                      ? 'bg-amber-100 border-amber-300 text-amber-700'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                  title={isLocked ? 'Unlock Element' : 'Lock Element'}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Duplicate (Ctrl+D)"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer"
                  title="Delete (Backspace/Delete)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ===================== TEXT PROPERTIES ===================== */}
            {isTextObject(activeObject) && (
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[#7d2ae8]" />
                  Typography
                </div>

                {/* Isolated Text Content Editor */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    TEXT CONTENT
                  </label>
                  <textarea
                    ref={textAreaRef}
                    rows={2}
                    value={textValue}
                    onChange={(e) => handleTextContentChange(e.target.value)}
                    onBlur={() => scheduleObjectModified(true)}
                    placeholder="Enter text..."
                    className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#7d2ae8] focus:ring-1 focus:ring-[#7d2ae8] resize-y select-text transition-colors"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    FONT FAMILY
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#7d2ae8]"
                  >
                    {AVAILABLE_FONTS.map((font) => (
                      <option key={font.family} value={font.family}>
                        {font.family}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size & Color */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      SIZE (PX)
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="300"
                      value={fontSize}
                      onChange={(e) => {
                        const s = Number(e.target.value) || 24;
                        setFontSize(s);
                        updateProp('fontSize', s);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#7d2ae8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      COLOR
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={fill.startsWith('#') ? fill : '#000000'}
                        onChange={(e) => {
                          setFill(e.target.value);
                          updateProp('fill', e.target.value);
                        }}
                        className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono font-semibold text-slate-700 uppercase">
                        {fill}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text Styles & Alignments */}
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const next =
                          fontWeight === 'bold' || fontWeight === '900' ? 'normal' : 'bold';
                        setFontWeight(next);
                        updateProp('fontWeight', next, true);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        fontWeight === 'bold' || fontWeight === '900'
                          ? 'bg-purple-100 border-purple-300 text-[#7d2ae8]'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const next = fontStyle === 'italic' ? 'normal' : 'italic';
                        setFontStyle(next);
                        updateProp('fontStyle', next, true);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        fontStyle === 'italic'
                          ? 'bg-purple-100 border-purple-300 text-[#7d2ae8]'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !underline;
                        setUnderline(next);
                        updateProp('underline', next, true);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        underline
                          ? 'bg-purple-100 border-purple-300 text-[#7d2ae8]'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {[
                      { id: 'left', icon: AlignLeft },
                      { id: 'center', icon: AlignCenter },
                      { id: 'right', icon: AlignRight },
                    ].map((al) => {
                      const Icon = al.icon;
                      return (
                        <button
                          key={al.id}
                          type="button"
                          onClick={() => {
                            setTextAlign(al.id);
                            updateProp('textAlign', al.id, true);
                          }}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            textAlign === al.id
                              ? 'bg-purple-100 border-purple-300 text-[#7d2ae8]'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                          }`}
                          title={al.id}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Line height & Letter spacing */}
                <div className="space-y-2.5 border-t border-slate-200/60 pt-2.5">
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>LINE HEIGHT</span>
                      <span>{lineHeight.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setLineHeight(v);
                        updateProp('lineHeight', v);
                      }}
                      className="w-full accent-[#7d2ae8] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>LETTER SPACING</span>
                      <span>{charSpacing}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="300"
                      step="10"
                      value={charSpacing}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setCharSpacing(v);
                        updateProp('charSpacing', v);
                      }}
                      className="w-full accent-[#7d2ae8] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SHAPE PROPERTIES ===================== */}
            {!isTextObject(activeObject) && !isImageObject(activeObject) && (
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#7d2ae8]" />
                  Colors &amp; Border
                </div>

                {/* Fill & Stroke */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      FILL COLOR
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={fill.startsWith('#') ? fill : '#000000'}
                        onChange={(e) => {
                          setFill(e.target.value);
                          updateProp('fill', e.target.value);
                        }}
                        className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono font-semibold text-slate-700 uppercase">
                        {fill}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      BORDER COLOR
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={stroke.startsWith('#') ? stroke : '#000000'}
                        onChange={(e) => {
                          setStroke(e.target.value);
                          updateProp('stroke', e.target.value);
                        }}
                        className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono font-semibold text-slate-700 uppercase">
                        {stroke}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stroke width */}
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                    <span>BORDER WIDTH</span>
                    <span>{strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={strokeWidth}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setStrokeWidth(v);
                      updateProp('strokeWidth', v);
                    }}
                    className="w-full accent-[#7d2ae8] cursor-pointer"
                  />
                </div>

                {/* Corner radius (for Rect) */}
                {isRectObject(activeObject) && (
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>CORNER RADIUS</span>
                      <span>{rx}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rx}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setRx(v);
                        activeObject.set({ rx: v, ry: v });
                        canvas?.requestRenderAll();
                        scheduleObjectModified(false);
                      }}
                      className="w-full accent-[#7d2ae8] cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ===================== IMAGE PROPERTIES ===================== */}
            {isImageObject(activeObject) && (
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#7d2ae8]" />
                    Image Controls
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAITools}
                    className="flex items-center gap-1 text-[11px] font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-2.5 py-1 rounded-lg shadow-xs transition-all cursor-pointer"
                    title="Enhance image with AI"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    AI Magic
                  </button>
                </div>

                {/* Flip Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !activeObject.flipX;
                      activeObject.set('flipX', next);
                      canvas?.requestRenderAll();
                      scheduleObjectModified(true);
                    }}
                    className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    Flip Horiz.
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !activeObject.flipY;
                      activeObject.set('flipY', next);
                      canvas?.requestRenderAll();
                      scheduleObjectModified(true);
                    }}
                    className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                    Flip Vert.
                  </button>
                </div>

                {/* Crop & Replace Image Controls */}
                <div className="space-y-2 border-t border-slate-200/60 pt-2.5">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">
                    Crop &amp; Replace
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const w = activeObject.width || 200;
                        const h = activeObject.height || 200;
                        const size = Math.min(w, h) * 0.85;
                        activeObject.set(
                          'clipPath',
                          new Rect({
                            width: size,
                            height: size,
                            originX: 'center',
                            originY: 'center',
                          }),
                        );
                        canvas?.requestRenderAll();
                        scheduleObjectModified(true);
                      }}
                      className="py-1 px-1.5 bg-white hover:bg-purple-50 hover:text-[#7d2ae8] border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      1:1 Crop
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const w = activeObject.width || 300;
                        const h = Math.round((w * 9) / 16);
                        activeObject.set(
                          'clipPath',
                          new Rect({
                            width: w * 0.9,
                            height: h * 0.9,
                            originX: 'center',
                            originY: 'center',
                          }),
                        );
                        canvas?.requestRenderAll();
                        scheduleObjectModified(true);
                      }}
                      className="py-1 px-1.5 bg-white hover:bg-purple-50 hover:text-[#7d2ae8] border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      16:9 Crop
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        activeObject.set('clipPath', undefined);
                        canvas?.requestRenderAll();
                        scheduleObjectModified(true);
                      }}
                      className="py-1 px-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      Reset Crop
                    </button>
                  </div>

                  <label className="block w-full py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-[#7d2ae8] border border-purple-200 rounded-lg text-center text-xs font-semibold cursor-pointer transition-colors">
                    <span>Replace Image</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file || !canvas) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          if (typeof reader.result === 'string') {
                            const newImg = await FabricImage.fromURL(reader.result);
                            newImg.set({
                              left: activeObject.left,
                              top: activeObject.top,
                              scaleX: activeObject.scaleX,
                              scaleY: activeObject.scaleY,
                              angle: activeObject.angle,
                            });
                            canvas.remove(activeObject);
                            canvas.add(newImg);
                            canvas.setActiveObject(newImg);
                            canvas.requestRenderAll();
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>

                {/* Filter Sliders */}
                <div className="space-y-2 border-t border-slate-200/60 pt-2.5">
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>BRIGHTNESS</span>
                      <span>{Math.round(brightness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="-0.5"
                      max="0.5"
                      step="0.05"
                      value={brightness}
                      onChange={(e) => {
                        const nextVal = parseFloat(e.target.value);
                        setBrightness(nextVal);
                        applyImageFilters(nextVal, contrast, saturation, blur);
                      }}
                      className="w-full accent-[#7d2ae8] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>CONTRAST</span>
                      <span>{Math.round(contrast * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="-0.5"
                      max="0.5"
                      step="0.05"
                      value={contrast}
                      onChange={(e) => {
                        const nextVal = parseFloat(e.target.value);
                        setContrast(nextVal);
                        applyImageFilters(brightness, nextVal, saturation, blur);
                      }}
                      className="w-full accent-[#7d2ae8] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ===================== POSITION & SIZE (COMMON) ===================== */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Transform &amp; Layer
              </div>

              {/* Position X, Y & Width, Height */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    X POS
                  </label>
                  <input
                    type="number"
                    value={left}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10) || 0;
                      setLeft(v);
                      updateProp('left', v);
                    }}
                    className="w-full px-2 py-1 bg-white rounded-lg border border-slate-200 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Y POS
                  </label>
                  <input
                    type="number"
                    value={top}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10) || 0;
                      setTop(v);
                      updateProp('top', v);
                    }}
                    className="w-full px-2 py-1 bg-white rounded-lg border border-slate-200 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    WIDTH
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={width}
                    onChange={(e) => {
                      const v = Math.max(10, parseInt(e.target.value, 10) || 10);
                      setWidth(v);
                      if (activeObject && activeObject.width) {
                        updateProp('scaleX', v / activeObject.width);
                      }
                    }}
                    className="w-full px-2 py-1 bg-white rounded-lg border border-slate-200 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    HEIGHT
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={height}
                    onChange={(e) => {
                      const v = Math.max(10, parseInt(e.target.value, 10) || 10);
                      setHeight(v);
                      if (activeObject && activeObject.height) {
                        updateProp('scaleY', v / activeObject.height);
                      }
                    }}
                    className="w-full px-2 py-1 bg-white rounded-lg border border-slate-200 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Shadow Settings */}
              <div className="border-t border-slate-200/60 pt-2.5 space-y-2">
                <label className="flex items-center justify-between text-[10px] font-semibold text-slate-600 cursor-pointer">
                  <span>DROP SHADOW</span>
                  <input
                    type="checkbox"
                    checked={shadowEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setShadowEnabled(enabled);
                      if (enabled) {
                        updateProp(
                          'shadow',
                          new Shadow({
                            color: shadowColor,
                            blur: shadowBlur,
                            offsetX: shadowOffsetX,
                            offsetY: shadowOffsetY,
                          }),
                          true,
                        );
                      } else {
                        updateProp('shadow', null, true);
                      }
                    }}
                    className="accent-[#7d2ae8]"
                  />
                </label>

                {shadowEnabled && (
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <div>
                      <span className="block text-slate-400 font-semibold">X Offset</span>
                      <input
                        type="number"
                        value={shadowOffsetX}
                        onChange={(e) => {
                          const x = Number(e.target.value) || 0;
                          setShadowOffsetX(x);
                          updateProp(
                            'shadow',
                            new Shadow({
                              color: shadowColor,
                              blur: shadowBlur,
                              offsetX: x,
                              offsetY: shadowOffsetY,
                            }),
                          );
                        }}
                        className="w-full px-1.5 py-0.5 border border-slate-200 rounded bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold">Y Offset</span>
                      <input
                        type="number"
                        value={shadowOffsetY}
                        onChange={(e) => {
                          const y = Number(e.target.value) || 0;
                          setShadowOffsetY(y);
                          updateProp(
                            'shadow',
                            new Shadow({
                              color: shadowColor,
                              blur: shadowBlur,
                              offsetX: shadowOffsetX,
                              offsetY: y,
                            }),
                          );
                        }}
                        className="w-full px-1.5 py-0.5 border border-slate-200 rounded bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold">Blur</span>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={shadowBlur}
                        onChange={(e) => {
                          const b = Number(e.target.value) || 0;
                          setShadowBlur(b);
                          updateProp(
                            'shadow',
                            new Shadow({
                              color: shadowColor,
                              blur: b,
                              offsetX: shadowOffsetX,
                              offsetY: shadowOffsetY,
                            }),
                          );
                        }}
                        className="w-full px-1.5 py-0.5 border border-slate-200 rounded bg-white font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Opacity */}
              <div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                  <span>OPACITY</span>
                  <span>{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setOpacity(v);
                    updateProp('opacity', v);
                  }}
                  className="w-full accent-[#7d2ae8] cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                  <span>ROTATION</span>
                  <span>{angle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setAngle(v);
                    updateProp('angle', v);
                  }}
                  className="w-full accent-[#7d2ae8] cursor-pointer"
                />
              </div>

              {/* Layer Ordering Buttons */}
              <div className="border-t border-slate-200/60 pt-2.5">
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  LAYER ORDER
                </label>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!canvas || !activeObject) return;
                      canvas.bringObjectToFront(activeObject);
                      canvas.requestRenderAll();
                      scheduleObjectModified(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                    title="Bring to Front"
                  >
                    <ChevronsUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canvas || !activeObject) return;
                      canvas.bringObjectForward(activeObject);
                      canvas.requestRenderAll();
                      scheduleObjectModified(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                    title="Bring Forward"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canvas || !activeObject) return;
                      canvas.sendObjectBackwards(activeObject);
                      canvas.requestRenderAll();
                      scheduleObjectModified(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                    title="Send Backward"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canvas || !activeObject) return;
                      canvas.sendObjectToBack(activeObject);
                      canvas.requestRenderAll();
                      scheduleObjectModified(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                    title="Send to Back"
                  >
                    <ChevronsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
