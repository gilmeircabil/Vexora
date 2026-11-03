import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import {
  ChevronLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Eye,
  Download,
  Sparkles,
  History,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  Maximize2,
} from 'lucide-react';
import type { SaveStatus } from './types.js';

interface TopToolbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  onManualSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onOpenPreview: () => void;
  onOpenExport: () => void;
  onOpenVersions: () => void;
  onOpenAITools: () => void;
  currentVersion: number;
  canvasWidth?: number;
  canvasHeight?: number;
  onResizeCanvas?: (newWidth: number, newHeight: number) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  title,
  onTitleChange,
  saveStatus,
  lastSavedAt,
  onManualSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onOpenPreview,
  onOpenExport,
  onOpenVersions,
  onOpenAITools,
  currentVersion,
  canvasWidth = 1080,
  canvasHeight = 1080,
  onResizeCanvas,
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isResizeOpen, setIsResizeOpen] = useState(false);
  const [resizeW, setResizeW] = useState(canvasWidth);
  const [resizeH, setResizeH] = useState(canvasHeight);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  useEffect(() => {
    setResizeW(canvasWidth);
    setResizeH(canvasHeight);
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setIsFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleTitleBlur = () => {
    if (localTitle.trim() && localTitle !== title) {
      onTitleChange(localTitle.trim());
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const formattedTime = lastSavedAt
    ? lastSavedAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <header className="h-14 bg-[#FAF7F2] border-b-2 border-black flex items-center justify-between px-2.5 sm:px-5 gap-1.5 sm:gap-3 shrink-0 z-30 select-none">
      {/* Left: Back button + VexoraMods Studio Logo + File Menu + Title + Save status */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <Link
          to="/studio"
          className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-gray-100 shadow-[1.5px_1.5px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all text-black"
          title="Back to Design Studio Dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        {/* VexoraMods Studio Logo Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FACC15] border-2 border-black font-black text-xs text-black shadow-[1.5px_1.5px_0px_#000000]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VexoraMods Studio</span>
        </div>

        {/* File Menu Dropdown */}
        <div className="relative" ref={fileMenuRef}>
          <button
            type="button"
            onClick={() => setIsFileMenuOpen((v) => !v)}
            className="px-2.5 py-1 rounded-xl border-2 border-black bg-white hover:bg-gray-100 text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] flex items-center gap-1"
            title="File Menu"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>File</span>
          </button>

          {isFileMenuOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-white border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000000] py-1.5 z-50 text-xs font-bold text-black">
              <button
                type="button"
                onClick={() => {
                  setIsFileMenuOpen(false);
                  onManualSave();
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-[#FAF7F2] flex items-center justify-between"
              >
                <span>Save Project</span>
                <span className="text-[10px] font-mono text-neutral-500">Ctrl+S</span>
              </button>
              {onResizeCanvas && (
                <button
                  type="button"
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    setIsResizeOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-[#FAF7F2] flex items-center justify-between"
                >
                  <span>Resize Canvas...</span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {canvasWidth}×{canvasHeight}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsFileMenuOpen(false);
                  onOpenVersions();
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-[#FAF7F2]"
              >
                Version History (v{currentVersion})
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFileMenuOpen(false);
                  onOpenExport();
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-[#FAF7F2]"
              >
                Export PNG / JPG / PDF
              </button>
              <div className="my-1 border-t border-black/10" />
              <Link to="/studio" className="block px-3.5 py-2 hover:bg-[#FAF7F2] text-neutral-700">
                Exit to Studio Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Resize Button */}
        {onResizeCanvas && (
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setIsResizeOpen((v) => !v)}
              className="px-2.5 py-1 rounded-xl border-2 border-black bg-white hover:bg-gray-100 text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000000] flex items-center gap-1"
              title="Resize Canvas Dimensions"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Resize</span>
            </button>

            {isResizeOpen && (
              <div className="absolute left-0 mt-2 w-60 bg-white border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000000] p-3.5 z-50 space-y-3">
                <div className="text-xs font-black uppercase text-black">Resize Canvas (px)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block">Width</label>
                    <input
                      type="number"
                      min={100}
                      max={6000}
                      value={resizeW}
                      onChange={(e) => setResizeW(Number(e.target.value) || 1080)}
                      className="w-full px-2 py-1 text-xs font-bold border-2 border-black rounded-lg bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block">Height</label>
                    <input
                      type="number"
                      min={100}
                      max={6000}
                      value={resizeH}
                      onChange={(e) => setResizeH(Number(e.target.value) || 1080)}
                      className="w-full px-2 py-1 text-xs font-bold border-2 border-black rounded-lg bg-[#FAF7F2]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsResizeOpen(false)}
                    className="px-2.5 py-1 text-xs font-bold border border-black rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResizeCanvas(resizeW, resizeH);
                      setIsResizeOpen(false);
                    }}
                    className="px-3 py-1 text-xs font-black bg-[#FACC15] border border-black rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Project Title Input */}
        <div className="relative group max-w-[140px] sm:max-w-[220px] md:max-w-[280px]">
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled Design"
            className="w-full px-2.5 py-1 text-sm font-black text-black bg-transparent border-2 border-transparent hover:border-black/30 focus:border-black rounded-lg focus:bg-white transition-colors truncate"
            title="Click to rename design"
          />
        </div>

        {/* Save Status Badge */}
        <div className="hidden md:flex items-center">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-400 px-2.5 py-0.5 rounded-full animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-400 px-2 py-0.5 rounded-full"
              title={formattedTime ? `Last saved at ${formattedTime}` : 'All changes saved'}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Saved {formattedTime && <span className="opacity-75">({formattedTime})</span>}
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <button
              onClick={onManualSave}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 border border-amber-500 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
              title="Click to save now (Ctrl+S)"
            >
              <Save className="w-3 h-3" />
              Unsaved changes
            </button>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 border border-red-400 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3 text-red-600" />
              Save error
            </span>
          )}
        </div>
      </div>

      {/* Center: Undo / Redo & Zoom Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center bg-white rounded-xl border-2 border-black p-0.5 shadow-[1.5px_1.5px_0px_#000000]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 rounded-lg hover:bg-gray-100 text-black disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-black/20 my-auto" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 rounded-lg hover:bg-gray-100 text-black disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden sm:flex items-center bg-white rounded-xl border-2 border-black p-0.5 shadow-[1.5px_1.5px_0px_#000000]">
          <button
            onClick={onZoomOut}
            className="p-1 rounded-lg hover:bg-gray-100 text-black transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomReset}
            className="px-1.5 py-0.5 text-xs font-black text-black hover:bg-gray-100 rounded-md transition-colors"
            title="Fit to Screen"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1 rounded-lg hover:bg-gray-100 text-black transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Actions (AI Tools, Preview, Version History, Share/Export) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* AI Magic Tools */}
        <button
          onClick={onOpenAITools}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border-2 border-black bg-[#EA580C] text-white font-black text-xs shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          title="Enhance image with AI (Free & Built-in)"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
          <span className="hidden md:inline">AI Magic</span>
        </button>

        {/* Preview Button */}
        <button
          onClick={onOpenPreview}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border-2 border-black bg-white hover:bg-gray-100 font-black text-xs text-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center gap-1.5"
          title="Preview Design"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden lg:inline">Preview</span>
        </button>

        {/* Version History Button */}
        <button
          onClick={onOpenVersions}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border-2 border-black bg-white hover:bg-gray-100 font-black text-xs text-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center gap-1.5"
          title="View Version History"
        >
          <History className="w-4 h-4" />
          <span className="hidden lg:inline">History</span>
          <span className="px-1.5 py-0.2 bg-black text-[#FACC15] text-[10px] font-black rounded">
            v{currentVersion}
          </span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl border-2 border-black bg-[#FACC15] text-black font-black text-xs sm:text-sm shadow-[2.5px_2.5px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          title="Export design as PNG, JPG, or PDF"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
