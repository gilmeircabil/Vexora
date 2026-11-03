import React from 'react';
import { X, Download } from 'lucide-react';
import type { Canvas } from 'fabric';
import { exportCanvas } from '../../lib/designStudio/exportCanvas.js';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: Canvas | null;
  projectName: string;
  canvasBackground: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  canvas,
  projectName,
  canvasBackground,
}) => {
  if (!isOpen || !canvas) return null;

  const previewDataUrl = canvas.toDataURL({ format: 'png', multiplier: 1.5 });

  const handleDownload = () => {
    exportCanvas(canvas, canvasBackground, {
      format: 'png',
      multiplier: 2,
      fileName: projectName.replace(/\s+/g, '_') || 'design_preview',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">{projectName}</h3>
            <p className="text-xs text-slate-500">Design Preview</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7d2ae8] hover:bg-[#6c22cf] font-semibold text-xs text-white shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-slate-100/70 rounded-xl min-h-0 mt-3">
          <img
            src={previewDataUrl}
            alt="Preview"
            className="max-w-full max-h-[70vh] object-contain rounded-md border border-slate-200 shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};
