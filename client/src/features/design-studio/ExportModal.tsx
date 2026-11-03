import React, { useState } from 'react';
import { X, Download, FileImage, FileText, Check, Loader2 } from 'lucide-react';
import type { Canvas } from 'fabric';
import { exportCanvas } from '../../lib/designStudio/exportCanvas.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: Canvas | null;
  projectName: string;
  canvasBackground: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvas,
  projectName,
  canvasBackground,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'pdf' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(0.95);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [transparent, setTransparent] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!canvas) return;
    setIsExporting(true);
    setError(null);

    try {
      const cleanFileName =
        projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'vexoramods-design';
      await exportCanvas(canvas, canvasBackground, {
        format,
        quality,
        multiplier,
        transparent: (format === 'png' || format === 'webp') && transparent,
        fileName: cleanFileName,
      });
      onClose();
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(err.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-100 text-[#7d2ae8] rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Design</h3>
              <p className="text-xs text-slate-500">Download your design in high resolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="py-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  format === 'png'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs ring-1 ring-[#7d2ae8]'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileImage
                    className={`w-4 h-4 ${format === 'png' ? 'text-[#7d2ae8]' : 'text-slate-500'}`}
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-800">PNG</div>
                    <div className="text-[10px] text-slate-500">High quality, transparency</div>
                  </div>
                </div>
                {format === 'png' && <Check className="w-4 h-4 text-[#7d2ae8]" />}
              </button>

              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  format === 'jpeg'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs ring-1 ring-[#7d2ae8]'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileImage
                    className={`w-4 h-4 ${format === 'jpeg' ? 'text-[#7d2ae8]' : 'text-slate-500'}`}
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-800">JPG</div>
                    <div className="text-[10px] text-slate-500">Smaller file size</div>
                  </div>
                </div>
                {format === 'jpeg' && <Check className="w-4 h-4 text-[#7d2ae8]" />}
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  format === 'pdf'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs ring-1 ring-[#7d2ae8]'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText
                    className={`w-4 h-4 ${format === 'pdf' ? 'text-[#7d2ae8]' : 'text-slate-500'}`}
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-800">PDF Document</div>
                    <div className="text-[10px] text-slate-500">Best for printing</div>
                  </div>
                </div>
                {format === 'pdf' && <Check className="w-4 h-4 text-[#7d2ae8]" />}
              </button>

              <button
                type="button"
                onClick={() => setFormat('webp')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  format === 'webp'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs ring-1 ring-[#7d2ae8]'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileImage
                    className={`w-4 h-4 ${format === 'webp' ? 'text-[#7d2ae8]' : 'text-slate-500'}`}
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-800">WebP</div>
                    <div className="text-[10px] text-slate-500">Modern web format</div>
                  </div>
                </div>
                {format === 'webp' && <Check className="w-4 h-4 text-[#7d2ae8]" />}
              </button>
            </div>
          </div>

          {/* Multiplier / Scale */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Resolution Scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMultiplier(m)}
                  className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    multiplier === m
                      ? 'bg-[#7d2ae8] text-white border-[#7d2ae8] shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m}x {m === 1 ? '(1x)' : m === 2 ? '(High 2x)' : '(Ultra 3x)'}
                </button>
              ))}
            </div>
          </div>

          {/* JPG Quality Slider */}
          {format === 'jpeg' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Image Quality
                </label>
                <span className="text-xs font-semibold text-slate-700">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-[#7d2ae8] cursor-pointer"
              />
            </div>
          )}

          {/* Transparency checkbox */}
          {(format === 'png' || format === 'webp') && (
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 text-[#7d2ae8] accent-[#7d2ae8] rounded border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">Transparent background</span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm bg-[#7d2ae8] hover:bg-[#6c22cf] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
