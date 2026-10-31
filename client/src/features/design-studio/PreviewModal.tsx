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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-4xl max-h-[90vh] bg-[#FAF7F2] rounded-2xl border-4 border-black p-5 shadow-[10px_10px_0px_#000000] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black shrink-0">
          <div>
            <h3 className="text-base font-black text-black">{projectName}</h3>
            <p className="text-xs font-semibold text-gray-600">Design Preview</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-[#FACC15] font-black text-xs text-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-pattern min-h-0">
          <img
            src={previewDataUrl}
            alt="Preview"
            className="max-w-full max-h-[70vh] object-contain rounded-lg border-2 border-black shadow-[4px_4px_0px_#000000]"
          />
        </div>
      </div>
    </div>
  );
};
