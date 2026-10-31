import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  ChevronLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Download,
  Sparkles,
  History,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
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
}) => {
  const [localTitle, setLocalTitle] = useState(title);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

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
    ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <header className="h-14 bg-[#FAF7F2] border-b-2 border-black flex items-center justify-between px-3 sm:px-5 gap-3 shrink-0 z-30 select-none">
      {/* Left: Back button + Title + Save indicator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Link
          to="/design-studio"
          className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-gray-100 shadow-[1.5px_1.5px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all text-black"
          title="Back to Design Studio Dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        {/* Project Title Input */}
        <div className="relative group max-w-[140px] sm:max-w-[240px] md:max-w-[320px]">
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

      {/* Right: Actions (Preview, AI Tools, Version History, Export) */}
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
