import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import {
  parseHexColor,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  getContrastRatio,
  type RgbColor,
  type HslColor,
} from '../../lib/calc/colors.js';
import { AlertCircle } from 'lucide-react';

export const ColorConverterTool: React.FC = () => {
  const [hexInput, setHexInput] = useState('#4F46E5');
  const [rgb, setRgb] = useState<RgbColor>({ r: 79, g: 70, b: 229, a: 1 });
  const [hsl, setHsl] = useState<HslColor>(rgbToHsl({ r: 79, g: 70, b: 229, a: 1 }));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    setErrorMsg(null);
    const parsed = parseHexColor(val);
    if (parsed.ok) {
      setRgb(parsed.value);
      setHsl(rgbToHsl(parsed.value));
    } else {
      setErrorMsg(parsed.error);
    }
  };

  const handleRgbChange = (r: number, g: number, b: number) => {
    const newRgb: RgbColor = {
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b)),
      a: 1,
    };
    setRgb(newRgb);
    setHexInput(rgbToHex(newRgb));
    setHsl(rgbToHsl(newRgb));
    setErrorMsg(null);
  };

  const handleHslChange = (h: number, s: number, l: number) => {
    const newHsl: HslColor = {
      h: Math.max(0, Math.min(360, h)),
      s: Math.max(0, Math.min(100, s)),
      l: Math.max(0, Math.min(100, l)),
      a: 1,
    };
    const newRgb = hslToRgb(newHsl);
    setHsl(newHsl);
    setRgb(newRgb);
    setHexInput(rgbToHex(newRgb));
    setErrorMsg(null);
  };

  const contrastWhite = getContrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const contrastBlack = getContrastRatio(rgb, { r: 0, g: 0, b: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Color Swatch & Contrast */}
        <Card className="space-y-4">
          <div
            className="w-full h-36 rounded-xl shadow-inner border border-neutral-200 dark:border-neutral-800 transition-colors"
            style={{ backgroundColor: rgbToHex(rgb) }}
          />

          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">
              WCAG Contrast Ratio
            </span>
            <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <span className="text-neutral-600 dark:text-neutral-400">Against White</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {contrastWhite}:1 {contrastWhite >= 4.5 ? '✓ (AA)' : '✗'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <span className="text-neutral-600 dark:text-neutral-400">Against Black</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {contrastBlack}:1 {contrastBlack >= 4.5 ? '✓ (AA)' : '✗'}
              </span>
            </div>
          </div>
        </Card>

        {/* Sliders and Numerical Fields */}
        <div className="md:col-span-2 space-y-4">
          {/* HEX Input */}
          <Card className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              HEX Code
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                className="flex-1 px-3 py-1.5 font-mono text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
              />
              <CopyButton value={hexInput} label="Copy HEX" size="sm" />
            </div>
          </Card>

          {/* RGB Inputs */}
          <Card className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                RGB Values
              </span>
              <CopyButton value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} label="Copy RGB" size="sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-neutral-500">R: {rgb.r}</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRgbChange(parseInt(e.target.value, 10), rgb.g, rgb.b)}
                  className="w-full accent-rose-600"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500">G: {rgb.g}</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRgbChange(rgb.r, parseInt(e.target.value, 10), rgb.b)}
                  className="w-full accent-emerald-600"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500">B: {rgb.b}</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRgbChange(rgb.r, rgb.g, parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </Card>

          {/* HSL Inputs */}
          <Card className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                HSL Values
              </span>
              <CopyButton
                value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                label="Copy HSL"
                size="sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-neutral-500">Hue: {hsl.h}°</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hsl.h}
                  onChange={(e) => handleHslChange(parseInt(e.target.value, 10), hsl.s, hsl.l)}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500">Sat: {hsl.s}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.s}
                  onChange={(e) => handleHslChange(hsl.h, parseInt(e.target.value, 10), hsl.l)}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500">Light: {hsl.l}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={(e) => handleHslChange(hsl.h, hsl.s, parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
