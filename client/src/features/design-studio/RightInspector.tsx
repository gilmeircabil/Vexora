import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { filters, type Canvas, type FabricObject } from 'fabric';
import { AVAILABLE_FONTS, loadFont } from '../../lib/designStudio/fontLoader.js';

interface RightInspectorProps {
  canvas: Canvas | null;
  activeObject: FabricObject | null;
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: string;
  onBackgroundChange: (color: string) => void;
  onOpenAITools: () => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  canvas,
  activeObject,
  canvasWidth,
  canvasHeight,
  canvasBackground,
  onBackgroundChange,
  onOpenAITools,
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

  // Sync state when active object changes
  useEffect(() => {
    if (!activeObject) return;

    setLeft(Math.round(activeObject.left || 0));
    setTop(Math.round(activeObject.top || 0));
    setWidth(Math.round((activeObject.width || 0) * (activeObject.scaleX || 1)));
    setHeight(Math.round((activeObject.height || 0) * (activeObject.scaleY || 1)));
    setAngle(Math.round(activeObject.angle || 0));
    setOpacity(activeObject.opacity ?? 1);
    setFill(typeof activeObject.fill === 'string' ? activeObject.fill : '#000000');
    setStroke(typeof activeObject.stroke === 'string' ? activeObject.stroke : '#000000');
    setStrokeWidth(activeObject.strokeWidth || 0);
    setIsLocked(Boolean(activeObject.lockMovementX));

    if (activeObject.type === 'Textbox' || (activeObject as any).text !== undefined) {
      const tb = activeObject as any;
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

    if (activeObject.type === 'Rect') {
      const r = activeObject as any;
      setRx(r.rx || 0);
    }
  }, [activeObject]);

  const updateProp = (prop: string, val: any) => {
    if (!activeObject || !canvas) return;
    activeObject.set(prop, val);
    canvas.requestRenderAll();
  };

  const handleFontFamilyChange = async (font: string) => {
    setFontFamily(font);
    await loadFont(font);
    if (!activeObject || !canvas) return;
    activeObject.set('fontFamily', font);
    canvas.requestRenderAll();
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
  };

  // Image Filter Applicator
  const applyImageFilters = () => {
    if (!activeObject || !canvas || activeObject.type !== 'FabricImage') return;
    const img = activeObject as any;

    const filterList: any[] = [];

    if (brightness !== 0) {
      filterList.push(new filters.Brightness({ brightness }));
    }
    if (contrast !== 0) {
      filterList.push(new filters.Contrast({ contrast }));
    }
    if (saturation !== 0) {
      filterList.push(new filters.Saturation({ saturation }));
    }
    if (blur > 0) {
      filterList.push(new filters.Blur({ blur }));
    }

    img.filters = filterList;
    img.applyFilters();
    canvas.requestRenderAll();
  };

  return (
    <aside className="w-72 h-full bg-[#FAF7F2] border-l-2 border-black flex flex-col shrink-0 select-none overflow-y-auto p-4 z-20">
      {/* If Nothing Selected: Canvas Overview */}
      {!activeObject ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
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
            Tip: Click any element on the canvas to inspect its layer, colors, font styling, and size.
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
          {(activeObject.type === 'Textbox' || (activeObject as any).text !== undefined) && (
            <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-3">
              <div className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                Typography
              </div>

              {/* Font Family */}
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">FONT FAMILY</label>
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
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">SIZE (PX)</label>
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
                      const next = fontWeight === 'bold' || fontWeight === '900' ? 'normal' : 'bold';
                      setFontWeight(next);
                      updateProp('fontWeight', next);
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
                      updateProp('fontStyle', next);
                    }}
                    className={`p-1.5 rounded border border-black ${
                      fontStyle === 'italic' ? 'bg-black text-[#FACC15]' : 'bg-white hover:bg-gray-100'
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
                      updateProp('underline', next);
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
                          updateProp('textAlign', al.id);
                        }}
                        className={`p-1.5 rounded border border-black ${
                          textAlign === al.id ? 'bg-black text-[#FACC15]' : 'bg-white hover:bg-gray-100'
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
          {activeObject.type !== 'Textbox' &&
            activeObject.type !== 'FabricImage' &&
            (activeObject as any).text === undefined && (
              <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-3">
                <div className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Colors & Border
                </div>

                {/* Fill & Stroke */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">FILL COLOR</label>
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
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">BORDER COLOR</label>
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
                {activeObject.type === 'Rect' && (
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
                      }}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

          {/* ===================== IMAGE PROPERTIES ===================== */}
          {activeObject.type === 'FabricImage' && (
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
                  }}
                  className="py-1.5 px-2 bg-gray-50 border border-black rounded-lg text-xs font-bold text-black flex items-center justify-center gap-1 hover:bg-gray-100"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  Flip Vert.
                </button>
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
                      setBrightness(parseFloat(e.target.value));
                      applyImageFilters();
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
                      setContrast(parseFloat(e.target.value));
                      applyImageFilters();
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

            {/* Position X, Y */}
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
              <label className="text-[10px] font-bold text-gray-600 block mb-1">LAYER ORDER</label>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!canvas || !activeObject) return;
                    canvas.bringObjectToFront(activeObject);
                    canvas.requestRenderAll();
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
  );
};
