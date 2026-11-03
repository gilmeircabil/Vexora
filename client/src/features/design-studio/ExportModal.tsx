import React, { useState } from 'react';
import { X, Download, FileImage, FileText, Check, Loader2 } from 'lucide-react';
import type { Canvas } from 'fabric';
import { exportCanvas, type ExportOptions } from '../../lib/designStudio/exportCanvas.js';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl border-4 border-black p-6 shadow-[8px_8px_0px_#000000]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FACC15] rounded-xl border-2 border-black">
              <Download className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Export Design</h3>
              <p className="text-xs font-semibold text-gray-600">
                Download your design in high resolution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Options */}
        <div className="py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-2">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`p-3 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all ${
                  format === 'png'
                    ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000000]'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-black" />
                  <div>
                    <div className="font-black text-sm text-black">PNG</div>
                    <div className="text-[10px] text-gray-600 font-semibold">
                      High quality, transparency
                    </div>
                  </div>
                </div>
                {format === 'png' && <Check className="w-4 h-4 text-black" />}
              </button>

              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`p-3 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all ${
                  format === 'jpeg'
                    ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000000]'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-black" />
                  <div>
                    <div className="font-black text-sm text-black">JPG</div>
                    <div className="text-[10px] text-gray-600 font-semibold">Smaller file size</div>
                  </div>
                </div>
                {format === 'jpeg' && <Check className="w-4 h-4 text-black" />}
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all ${
                  format === 'pdf'
                    ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000000]'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-black" />
                  <div>
                    <div className="font-black text-sm text-black">PDF Document</div>
                    <div className="text-[10px] text-gray-600 font-semibold">Best for printing</div>
                  </div>
                </div>
                {format === 'pdf' && <Check className="w-4 h-4 text-black" />}
              </button>

              <button
                type="button"
                onClick={() => setFormat('webp')}
                className={`p-3 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all ${
                  format === 'webp'
                    ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000000]'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-black" />
                  <div>
                    <div className="font-black text-sm text-black">WebP</div>
                    <div className="text-[10px] text-gray-600 font-semibold">Modern web format</div>
                  </div>
                </div>
                {format === 'webp' && <Check className="w-4 h-4 text-black" />}
              </button>
            </div>
          </div>

          {/* Multiplier / Scale */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1.5">
              Resolution Scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMultiplier(m)}
                  className={`py-2 rounded-xl border-2 border-black font-black text-xs transition-all ${
                    multiplier === m
                      ? 'bg-black text-[#FACC15] shadow-[2px_2px_0px_#000000]'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {m}x {m === 1 ? '(Standard)' : m === 2 ? '(High-Res 2x)' : '(Ultra 3x)'}
                </button>
              ))}
            </div>
          </div>

          {/* JPG Quality Slider */}
          {format === 'jpeg' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase text-black">Image Quality</label>
                <span className="text-xs font-bold text-gray-700">
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
                className="w-full accent-[#000000] cursor-pointer"
              />
            </div>
          )}

          {/* Transparency checkbox */}
          {(format === 'png' || format === 'webp') && (
            <label className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-black bg-white cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 text-black accent-black rounded border-2 border-black cursor-pointer"
              />
              <span className="text-xs font-bold text-black">Transparent background</span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border-2 border-black font-bold text-sm bg-white hover:bg-gray-100 text-black transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border-2 border-black font-black text-sm bg-[#FACC15] text-black shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50"
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
