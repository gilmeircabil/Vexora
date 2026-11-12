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
    <header className="h-14 bg-[#18191b] border-b border-white/10 flex items-center justify-between px-3 sm:px-4 gap-2 shrink-0 z-30 select-none text-white">
      {/* Left: Back button + VexoraMods Studio Logo + File Menu + Title + Save status */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        <Link
          to="/studio"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Back to Design Studio Dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        {/* VexoraMods Studio Logo Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/30 text-purple-200 font-semibold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>VexoraMods Studio</span>
        </div>

        {/* File Menu Dropdown */}
        <div className="relative" ref={fileMenuRef}>
          <button
            type="button"
            onClick={() => setIsFileMenuOpen((v) => !v)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="File Menu"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>File</span>
          </button>

          {isFileMenuOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setIsFileMenuOpen(false);
                  onManualSave();
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <span>Save Project</span>
                <span className="text-[10px] font-mono text-slate-400">Ctrl+S</span>
              </button>
              {onResizeCanvas && (
                <button
                  type="button"
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    setIsResizeOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span>Resize Canvas...</span>
                  <span className="text-[10px] font-mono text-slate-400">
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
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Version History (v{currentVersion})
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFileMenuOpen(false);
                  onOpenExport();
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Export PNG / JPG / PDF
              </button>
              <div className="my-1 border-t border-slate-100" />
              <Link
                to="/studio"
                className="block px-3.5 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
              >
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
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Resize Canvas Dimensions"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Resize</span>
            </button>

            {isResizeOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Resize Canvas (px)
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={6000}
                      value={resizeW}
                      onChange={(e) => setResizeW(Number(e.target.value) || 1080)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={6000}
                      value={resizeH}
                      onChange={(e) => setResizeH(Number(e.target.value) || 1080)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsResizeOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResizeCanvas(resizeW, resizeH);
                      setIsResizeOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#7d2ae8] hover:bg-[#6c22cf] text-white rounded-lg shadow-sm transition-colors cursor-pointer"
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
            className="w-full px-2.5 py-1 text-sm font-semibold text-white placeholder-slate-400 bg-transparent hover:bg-white/10 focus:bg-white focus:text-slate-900 border border-transparent focus:border-purple-500 rounded-lg transition-colors truncate focus:outline-none"
            title="Click to rename design"
          />
        </div>

        {/* Save Status Badge */}
        <div className="hidden md:flex items-center">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full"
              title={formattedTime ? `Last saved at ${formattedTime}` : 'All changes saved'}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Saved {formattedTime && <span className="opacity-70">({formattedTime})</span>}
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <button
              onClick={onManualSave}
              className="flex items-center gap-1 text-[11px] font-medium text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
              title="Click to save now (Ctrl+S)"
            >
              <Save className="w-3 h-3" />
              Unsaved changes
            </button>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              Save error
            </span>
          )}
        </div>
      </div>

      {/* Center: Undo / Redo & Zoom Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-3.5 bg-white/15 my-auto" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5 border border-white/5">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomReset}
            className="px-2 py-0.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title="Fit to Screen"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] font-bold text-xs shadow-xs transition-all cursor-pointer"
          title="Enhance image with AI (Free & Built-in)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden md:inline">AI Magic</span>
        </button>

        {/* Preview Button */}
        <button
          onClick={onOpenPreview}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          title="Preview Design"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden lg:inline">Preview</span>
        </button>

        {/* Version History Button */}
        <button
          onClick={onOpenVersions}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          title="View Version History"
        >
          <History className="w-4 h-4" />
          <span className="hidden lg:inline">History</span>
          <span className="px-1.5 py-0.5 bg-white/15 text-slate-200 text-[10px] font-semibold rounded">
            v{currentVersion}
          </span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#7d2ae8] hover:bg-[#6c22cf] active:bg-[#5b1bb0] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer"
          title="Export design as PNG, JPG, or PDF"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
