import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Copy,
  Trash2,
  Lock,
  Unlock,
  RotateCw,
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
  Square,
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
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-[#FAF7F2] border-l-2 border-black flex flex-col shrink-0 select-none overflow-y-auto p-4 ${
          isOpenMobile
            ? 'fixed inset-y-0 right-0 z-50 w-80 max-w-[88vw] h-full shadow-[-6px_0px_0px_#000000] flex'
            : 'hidden lg:flex w-72 h-full z-20'
        }`}
      >
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black lg:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-black" />
            <span className="font-black text-xs uppercase tracking-wider text-black">
              {activeObject ? 'Element Properties' : 'Canvas Settings'}
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[1.5px_1.5px_0px_#000000]"
            aria-label="Close Properties Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Nothing Selected: Canvas Overview */}
        {!activeObject ? (
          <div className="space-y-4">
            <div className="hidden lg:flex items-center gap-2 pb-3 border-b-2 border-black">
              <Sliders className="w-4 h-4 text-black" />
              <h4 className="font-black text-sm text-black">Canvas Settings</h4>
            </div>

            <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="text-xs font-black uppercase text-black">Dimensions</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="p-2 bg-gray-50 rounded-lg border border-black/20">
                  <span className="text-gray-500 text-[10px] block">WIDTH</span>
                  <span className="text-sm font-black">{canvasWidth} px</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg border border-black/20">
                  <span className="text-gray-500 text-[10px] block">HEIGHT</span>
                  <span className="text-sm font-black">{canvasHeight} px</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="text-xs font-black uppercase text-black">Canvas Background</div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={canvasBackground.startsWith('#') ? canvasBackground : '#ffffff'}
                  onChange={(e) => onBackgroundChange(e.target.value)}
                  className="w-9 h-9 rounded-lg border-2 border-black cursor-pointer p-0 bg-transparent"
                />
                <span className="text-xs font-mono font-bold uppercase">{canvasBackground}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-300 text-xs font-semibold text-amber-900">
              Tip: Click any element on the canvas to inspect its layer, colors, font styling, and
              size.
            </div>
          </div>
        ) : (
          /* Object Inspector */
          <div className="space-y-4">
            {/* Header & Quick Action Buttons */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <span className="font-black text-xs uppercase px-2 py-0.5 bg-[#FACC15] border border-black rounded-md text-black">
                {activeObject.type}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleToggleLock}
                  className={`p-1.5 rounded-lg border border-black transition-colors ${
                    isLocked ? 'bg-black text-[#FACC15]' : 'bg-white hover:bg-gray-100 text-black'
                  }`}
                  title={isLocked ? 'Unlock Element' : 'Lock Element'}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="p-1.5 rounded-lg border border-black bg-white hover:bg-gray-100 text-black transition-colors"
                  title="Duplicate (Ctrl+D)"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg border border-black bg-white hover:bg-red-500 hover:text-white text-black transition-colors"
                  title="Delete (Backspace/Delete)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ===================== TEXT PROPERTIES ===================== */}
            {isTextObject(activeObject) && (
              <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-3">
                <div className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  Typography
                </div>

                {/* Isolated Text Content Editor */}
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">
                    TEXT CONTENT
                  </label>
                  <textarea
                    ref={textAreaRef}
                    rows={2}
                    value={textValue}
                    onChange={(e) => handleTextContentChange(e.target.value)}
                    onBlur={() => scheduleObjectModified(true)}
                    placeholder="Enter text..."
                    className="w-full px-2.5 py-1.5 bg-[#FAF7F2] rounded-lg border-2 border-black text-xs font-bold text-black focus:outline-none resize-y select-text"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">
                    FONT FAMILY
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF7F2] rounded-lg border-2 border-black text-xs font-bold text-black focus:outline-none"
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
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">
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
                      className="w-full px-2 py-1 bg-[#FAF7F2] rounded-lg border-2 border-black text-xs font-bold text-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">COLOR</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={fill.startsWith('#') ? fill : '#000000'}
                        onChange={(e) => {
                          setFill(e.target.value);
                          updateProp('fill', e.target.value);
                        }}
                        className="w-7 h-7 rounded border border-black cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono font-bold uppercase">{fill}</span>
                    </div>
                  </div>
                </div>

                {/* Text Styles & Alignments */}
                <div className="flex items-center justify-between border-t border-black/10 pt-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const next =
                          fontWeight === 'bold' || fontWeight === '900' ? 'normal' : 'bold';
                        setFontWeight(next);
                        updateProp('fontWeight', next, true);
                      }}
                      className={`p-1.5 rounded border border-black ${
                        fontWeight === 'bold' || fontWeight === '900'
                          ? 'bg-black text-[#FACC15]'
                          : 'bg-white hover:bg-gray-100'
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
                      className={`p-1.5 rounded border border-black ${
                        fontStyle === 'italic'
                          ? 'bg-black text-[#FACC15]'
                          : 'bg-white hover:bg-gray-100'
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
                      className={`p-1.5 rounded border border-black ${
                        underline ? 'bg-black text-[#FACC15]' : 'bg-white hover:bg-gray-100'
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
                          className={`p-1.5 rounded border border-black ${
                            textAlign === al.id
                              ? 'bg-black text-[#FACC15]'
                              : 'bg-white hover:bg-gray-100'
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
                <div className="space-y-2 border-t border-black/10 pt-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
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
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
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
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SHAPE PROPERTIES ===================== */}
            {!isTextObject(activeObject) && !isImageObject(activeObject) && (
              <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-3">
                <div className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Colors & Border
                </div>

                {/* Fill & Stroke */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">
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
                        className="w-7 h-7 rounded border border-black cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono font-bold uppercase">{fill}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">
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
                        className="w-7 h-7 rounded border border-black cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono font-bold uppercase">{stroke}</span>
                    </div>
                  </div>
                </div>

                {/* Stroke width */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
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
                    className="w-full accent-black cursor-pointer"
                  />
                </div>

                {/* Corner radius (for Rect) */}
                {isRectObject(activeObject) && (
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
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
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ===================== IMAGE PROPERTIES ===================== */}
            {isImageObject(activeObject) && (
              <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image Controls
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAITools}
                    className="flex items-center gap-1 text-[11px] font-black text-white bg-[#EA580C] px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_#000000] hover:-translate-y-0.5 transition-all cursor-pointer"
                    title="Enhance image with AI"
                  >
                    <Sparkles className="w-3 h-3 text-[#FACC15]" />
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
                    className="py-1.5 px-2 bg-gray-50 border border-black rounded-lg text-xs font-bold text-black flex items-center justify-center gap-1 hover:bg-gray-100"
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
                    className="py-1.5 px-2 bg-gray-50 border border-black rounded-lg text-xs font-bold text-black flex items-center justify-center gap-1 hover:bg-gray-100"
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                    Flip Vert.
                  </button>
                </div>

                {/* Crop & Replace Image Controls */}
                <div className="space-y-2 border-t border-black/10 pt-2">
                  <div className="text-[10px] font-bold text-gray-600 uppercase">
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
                      className="py-1 px-1.5 bg-[#FAF7F2] hover:bg-[#FACC15] border border-black rounded text-[10px] font-black text-black"
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
                      className="py-1 px-1.5 bg-[#FAF7F2] hover:bg-[#FACC15] border border-black rounded text-[10px] font-black text-black"
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
                      className="py-1 px-1.5 bg-white hover:bg-gray-100 border border-black rounded text-[10px] font-bold text-black"
                    >
                      Reset Crop
                    </button>
                  </div>

                  <label className="block w-full py-1.5 px-2 bg-[#FACC15] hover:bg-amber-400 border border-black rounded-lg text-center text-xs font-black text-black cursor-pointer">
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
                <div className="space-y-2 border-t border-black/10 pt-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
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
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
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
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ===================== POSITION & SIZE (COMMON) ===================== */}
            <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-3">
              <div className="text-xs font-black uppercase text-black">Transform & Layer</div>

              {/* Position X, Y & Width, Height */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-0.5">X POS</label>
                  <input
                    type="number"
                    value={left}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10) || 0;
                      setLeft(v);
                      updateProp('left', v);
                    }}
                    className="w-full px-2 py-1 bg-[#FAF7F2] rounded-lg border-2 border-black font-bold text-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Y POS</label>
                  <input
                    type="number"
                    value={top}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10) || 0;
                      setTop(v);
                      updateProp('top', v);
                    }}
                    className="w-full px-2 py-1 bg-[#FAF7F2] rounded-lg border-2 border-black font-bold text-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-0.5">WIDTH</label>
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
                    className="w-full px-2 py-1 bg-[#FAF7F2] rounded-lg border-2 border-black font-bold text-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-0.5">HEIGHT</label>
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
                    className="w-full px-2 py-1 bg-[#FAF7F2] rounded-lg border-2 border-black font-bold text-black"
                  />
                </div>
              </div>

              {/* Shadow Settings */}
              <div className="border-t border-black/10 pt-2 space-y-2">
                <label className="flex items-center justify-between text-[10px] font-bold text-gray-600 cursor-pointer">
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
                    className="accent-black"
                  />
                </label>

                {shadowEnabled && (
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <div>
                      <span className="block text-gray-500">X Offset</span>
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
                        className="w-full px-1.5 py-0.5 border border-black rounded bg-[#FAF7F2] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-gray-500">Y Offset</span>
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
                        className="w-full px-1.5 py-0.5 border border-black rounded bg-[#FAF7F2] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-gray-500">Blur</span>
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
                        className="w-full px-1.5 py-0.5 border border-black rounded bg-[#FAF7F2] font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Opacity */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
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
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
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
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              {/* Layer Ordering Buttons */}
              <div className="border-t border-black/10 pt-2">
                <label className="text-[10px] font-bold text-gray-600 block mb-1">
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
                    className="p-1.5 rounded border border-black bg-white hover:bg-gray-100 flex items-center justify-center text-black"
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
                    className="p-1.5 rounded border border-black bg-white hover:bg-gray-100 flex items-center justify-center text-black"
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
                    className="p-1.5 rounded border border-black bg-white hover:bg-gray-100 flex items-center justify-center text-black"
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
                    className="p-1.5 rounded border border-black bg-white hover:bg-gray-100 flex items-center justify-center text-black"
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
