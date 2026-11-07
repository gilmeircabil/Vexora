import React, { useState } from 'react';
import { RefreshCw, Copy, Check, Monitor, Tablet, Smartphone, Sparkles } from 'lucide-react';

type PlaygroundComponentType = 'button' | 'card' | 'input' | 'badge' | 'nav';

export const Playground: React.FC = () => {
  const [componentType, setComponentType] = useState<PlaygroundComponentType>('button');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  // Playground state parameters
  const [text, setText] = useState('Explore Component');
  const [color, setColor] = useState('#FACC15'); // Yellow
  const [textColor, setTextColor] = useState('#000000');
  const [radius, setRadius] = useState<number>(12); // px
  const [borderWidth, setBorderWidth] = useState<number>(2); // px
  const [shadowOffset, setShadowOffset] = useState<number>(3); // px
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [cardBg, setCardBg] = useState('#FFFFFF');
  const [validationState, setValidationState] = useState<'normal' | 'success' | 'error'>('normal');

  // Reset to defaults
  const handleReset = () => {
    setText('Explore Component');
    setColor('#FACC15');
    setTextColor('#000000');
    setRadius(12);
    setBorderWidth(2);
    setShadowOffset(3);
    setSize('md');
    setCardBg('#FFFFFF');
    setValidationState('normal');
  };

  // Generate dynamic React code snippet
  const generateReactCode = (): string => {
    if (componentType === 'button') {
      const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm';
      return `<button
  style={{
    backgroundColor: '${color}',
    color: '${textColor}',
    borderRadius: '${radius}px',
    border: '${borderWidth}px solid #000000',
    boxShadow: '${shadowOffset}px ${shadowOffset}px 0px #000000',
  }}
  className="${pad} font-black transition-all hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
>
  ${text}
</button>`;
    }

    if (componentType === 'card') {
      return `<div
  style={{
    backgroundColor: '${cardBg}',
    borderRadius: '${radius}px',
    border: '${borderWidth}px solid #000000',
    boxShadow: '${shadowOffset}px ${shadowOffset}px 0px #000000',
    padding: '${size === 'sm' ? '16px' : size === 'lg' ? '32px' : '24px'}',
  }}
  className="max-w-sm space-y-3"
>
  <h3 className="font-black text-lg text-black">${text}</h3>
  <p className="text-xs text-neutral-600">Customized live in the VexoraMods UI Playground.</p>
  <button style={{ backgroundColor: '${color}', color: '${textColor}', borderRadius: '${radius / 2}px' }} className="px-3.5 py-1.5 border border-black font-black text-xs">
    Action
  </button>
</div>`;
    }

    if (componentType === 'input') {
      return `<div className="w-full max-w-sm space-y-1.5">
  <label className="block text-xs font-black text-black">Input Label</label>
  <input
    type="text"
    defaultValue="${text}"
    style={{
      borderRadius: '${radius}px',
      border: '${borderWidth}px solid ${validationState === 'success' ? '#10B981' : validationState === 'error' ? '#EF4444' : '#000000'}',
      boxShadow: '${shadowOffset}px ${shadowOffset}px 0px #000000',
    }}
    className="w-full px-3.5 py-2.5 bg-white text-xs font-bold outline-none"
  />
</div>`;
    }

    if (componentType === 'badge') {
      return `<span
  style={{
    backgroundColor: '${color}',
    color: '${textColor}',
    borderRadius: '${radius}px',
    border: '${borderWidth}px solid #000000',
    boxShadow: '${shadowOffset}px ${shadowOffset}px 0px #000000',
  }}
  className="inline-block px-3 py-1 font-black text-xs uppercase"
>
  ${text}
</span>`;
    }

    // nav
    return `<nav
  style={{
    backgroundColor: '${cardBg}',
    borderRadius: '${radius}px',
    border: '${borderWidth}px solid #000000',
    boxShadow: '${shadowOffset}px ${shadowOffset}px 0px #000000',
  }}
  className="w-full px-5 py-3 flex items-center justify-between"
>
  <span className="font-black text-sm">${text}</span>
  <div className="flex gap-2">
    <span style={{ backgroundColor: '${color}', borderRadius: '${radius / 2}px' }} className="px-3 py-1 border border-black text-xs font-bold">Link</span>
  </div>
</nav>`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateReactCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Playground Header */}
      <div className="bg-[#FAF7F2] p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FACC15] border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Playground</span>
          </div>
          <h2 className="text-2xl font-black text-black">Component Sandbox</h2>
          <p className="text-xs text-neutral-600 mt-1 max-w-lg">
            Experiment with colors, padding, border radiuses, and shadows in real-time. Instantly copy the resulting production React & CSS code.
          </p>
        </div>

        {/* Component Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
          {(['button', 'card', 'input', 'badge', 'nav'] as PlaygroundComponentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setComponentType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black capitalize transition-all cursor-pointer ${
                componentType === type
                  ? 'bg-[#FACC15] text-black border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column (Left) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] space-y-4">
          <div className="flex justify-between items-center border-b-2 border-black pb-3">
            <h3 className="font-black text-sm text-black uppercase tracking-wide">Design Controls</h3>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-black rounded-lg border border-black hover:bg-neutral-100 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Text Content */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-black">Label / Title Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 rounded-xl border-2 border-black text-xs font-bold outline-none"
            />
          </div>

          {/* Color Presets */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-black">Accent Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {['#FACC15', '#38BDF8', '#4ADE80', '#F472B6', '#A78BFA', '#000000', '#FFFFFF'].map((hex) => (
                <button
                  key={hex}
                  onClick={() => setColor(hex)}
                  style={{ backgroundColor: hex }}
                  className={`w-7 h-7 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000] transition cursor-pointer ${
                    color === hex ? 'scale-110 ring-2 ring-black' : ''
                  }`}
                  aria-label={`Color ${hex}`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg border-2 border-black cursor-pointer"
                title="Custom Color"
              />
            </div>
          </div>

          {/* Text Color for contrast */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-black">Text Color</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTextColor('#000000')}
                className={`px-3 py-1 rounded-lg border-2 border-black text-xs font-black cursor-pointer ${
                  textColor === '#000000' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                Black (#000000)
              </button>
              <button
                onClick={() => setTextColor('#FFFFFF')}
                className={`px-3 py-1 rounded-lg border-2 border-black text-xs font-black cursor-pointer ${
                  textColor === '#FFFFFF' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                White (#FFFFFF)
              </button>
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-black">
              <span>Border Radius</span>
              <span className="font-mono">{radius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={32}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Border Width */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-black">
              <span>Border Width</span>
              <span className="font-mono">{borderWidth}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={6}
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Hard Shadow Offset */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-black">
              <span>Shadow Offset (Neo Brutalist)</span>
              <span className="font-mono">{shadowOffset}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={shadowOffset}
              onChange={(e) => setShadowOffset(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Size */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-black">Padding & Sizing</label>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase transition cursor-pointer ${
                    size === s ? 'bg-[#FACC15]' : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input specific validation toggle */}
          {componentType === 'input' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-black">Validation State</label>
              <div className="flex gap-2">
                {(['normal', 'success', 'error'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setValidationState(st)}
                    className={`flex-1 py-1.5 rounded-lg border-2 border-black text-xs font-black capitalize transition cursor-pointer ${
                      validationState === st ? 'bg-[#38BDF8]' : 'bg-white hover:bg-neutral-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Preview & Code Column (Right) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Viewport bar */}
          <div className="bg-white p-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] flex justify-between items-center">
            <span className="text-xs font-black text-neutral-500 uppercase tracking-wide">Live Preview Canvas</span>
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 border border-black rounded-xl">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-lg border border-transparent transition cursor-pointer ${
                  viewport === 'desktop' ? 'bg-white border-black shadow-sm text-black' : 'text-neutral-500'
                }`}
                title="Desktop (100%)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-lg border border-transparent transition cursor-pointer ${
                  viewport === 'tablet' ? 'bg-white border-black shadow-sm text-black' : 'text-neutral-500'
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-lg border border-transparent transition cursor-pointer ${
                  viewport === 'mobile' ? 'bg-white border-black shadow-sm text-black' : 'text-neutral-500'
                }`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rendered Preview Box */}
          <div className="bg-[#FAF7F2] p-8 md:p-12 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] min-h-[260px] flex items-center justify-center overflow-x-auto">
            <div
              className={`transition-all duration-200 ${
                viewport === 'tablet' ? 'w-[420px]' : viewport === 'mobile' ? 'w-[280px]' : 'w-full max-w-md'
              } flex items-center justify-center`}
            >
              {componentType === 'button' && (
                <button
                  style={{
                    backgroundColor: color,
                    color: textColor,
                    borderRadius: `${radius}px`,
                    border: `${borderWidth}px solid #000000`,
                    boxShadow: `${shadowOffset}px ${shadowOffset}px 0px #000000`,
                  }}
                  className={`${
                    size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
                  } font-black transition-all hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer`}
                >
                  {text}
                </button>
              )}

              {componentType === 'card' && (
                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: `${radius}px`,
                    border: `${borderWidth}px solid #000000`,
                    boxShadow: `${shadowOffset}px ${shadowOffset}px 0px #000000`,
                    padding: size === 'sm' ? '16px' : size === 'lg' ? '32px' : '24px',
                  }}
                  className="w-full space-y-3"
                >
                  <h3 className="font-black text-base text-black">{text}</h3>
                  <p className="text-xs text-neutral-600">Customized live in the VexoraMods UI Playground.</p>
                  <button
                    style={{
                      backgroundColor: color,
                      color: textColor,
                      borderRadius: `${radius / 2}px`,
                    }}
                    className="px-3.5 py-1.5 border border-black font-black text-xs cursor-pointer"
                  >
                    Action
                  </button>
                </div>
              )}

              {componentType === 'input' && (
                <div className="w-full space-y-1.5">
                  <label className="block text-xs font-black text-black">Input Field</label>
                  <input
                    type="text"
                    defaultValue={text}
                    style={{
                      borderRadius: `${radius}px`,
                      border: `${borderWidth}px solid ${
                        validationState === 'success' ? '#10B981' : validationState === 'error' ? '#EF4444' : '#000000'
                      }`,
                      boxShadow: `${shadowOffset}px ${shadowOffset}px 0px #000000`,
                    }}
                    className="w-full px-3.5 py-2.5 bg-white text-xs font-bold outline-none"
                  />
                  {validationState === 'success' && (
                    <p className="text-[10px] text-emerald-600 font-bold">✓ Field input looks great!</p>
                  )}
                  {validationState === 'error' && (
                    <p className="text-[10px] text-rose-600 font-bold">✕ Invalid input value provided.</p>
                  )}
                </div>
              )}

              {componentType === 'badge' && (
                <span
                  style={{
                    backgroundColor: color,
                    color: textColor,
                    borderRadius: `${radius}px`,
                    border: `${borderWidth}px solid #000000`,
                    boxShadow: `${shadowOffset}px ${shadowOffset}px 0px #000000`,
                  }}
                  className="inline-block px-3 py-1 font-black text-xs uppercase"
                >
                  {text}
                </span>
              )}

              {componentType === 'nav' && (
                <nav
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: `${radius}px`,
                    border: `${borderWidth}px solid #000000`,
                    boxShadow: `${shadowOffset}px ${shadowOffset}px 0px #000000`,
                  }}
                  className="w-full px-4 py-2.5 flex items-center justify-between"
                >
                  <span className="font-black text-xs">{text}</span>
                  <div className="flex gap-2">
                    <span
                      style={{ backgroundColor: color, borderRadius: `${radius / 2}px` }}
                      className="px-2.5 py-1 border border-black text-[10px] font-black cursor-pointer"
                    >
                      Action
                    </span>
                  </div>
                </nav>
              )}
            </div>
          </div>

          {/* Generated Code Block */}
          <div className="bg-neutral-900 text-neutral-100 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden text-xs">
            <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
              <span className="font-mono text-[11px] text-yellow-400 font-bold">Generated React Code</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 text-black font-black text-xs rounded-lg transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-[11px] text-neutral-200">
              <code>{generateReactCode()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
