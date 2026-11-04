import React, { useState, useEffect } from 'react';
import { X, History, Plus, RotateCcw, Clock, Loader2 } from 'lucide-react';
import type { Canvas } from 'fabric';
import { designStudioApi, type DesignVersionDTO } from '../../lib/designStudio/api.js';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  canvas: Canvas | null;
  currentVersion: number;
  onVersionRestored: (restoredDoc: any, newVersionNumber: number) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  projectId,
  canvas,
  currentVersion,
  onVersionRestored,
}) => {
  const [versions, setVersions] = useState<DesignVersionDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState<boolean>(false);
  const [snapshotName, setSnapshotName] = useState<string>('');
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  const [failedThumbnailIds, setFailedThumbnailIds] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadVersions();
    }
  }, [isOpen, projectId]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const res = await designStudioApi.listVersions(projectId);
      setVersions(res.versions);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to load versions', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canvas || !snapshotName.trim()) return;

    setIsCreatingSnapshot(true);
    setMessage(null);

    try {
      const canvasJson = canvas.toJSON();
      const thumb = canvas.toDataURL({ format: 'png', multiplier: 0.3 });

      const newVersion = await designStudioApi.createSnapshot(projectId, {
        versionName: snapshotName.trim(),
        documentData: canvasJson,
        thumbnailUrl: thumb,
      });

      setVersions((prev) => [newVersion, ...prev]);
      setSnapshotName('');
      setMessage({ text: `Created snapshot "${newVersion.versionName}"`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to create snapshot', type: 'error' });
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleRestore = async (version: DesignVersionDTO) => {
    if (
      !confirm(
        `Restore to "${version.versionName}" (v${version.versionNumber})? A new version snapshot will be created.`,
      )
    ) {
      return;
    }

    setRestoringVersionId(version._id);
    setMessage(null);

    try {
      const fullVersion = await designStudioApi.getVersion(projectId, version._id);
      const res = await designStudioApi.restoreVersion(projectId, version._id);

      onVersionRestored(fullVersion.documentData, res.project.currentVersion);
      setMessage({ text: `Restored to v${version.versionNumber}!`, type: 'success' });
      await loadVersions();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to restore version', type: 'error' });
    } finally {
      setRestoringVersionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-100 text-[#7d2ae8] rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Version History</h3>
              <p className="text-xs text-slate-500">
                Browse previous revisions or create a named snapshot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`my-3 p-3 rounded-xl border text-xs font-semibold shrink-0 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Snapshot Creation Form */}
        <form
          onSubmit={handleCreateSnapshot}
          className="pt-3 pb-4 border-b border-slate-100 shrink-0"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Save Named Snapshot
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Changed background, final logo layout..."
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              maxLength={100}
              className="flex-1 px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7d2ae8] focus:ring-1 focus:ring-[#7d2ae8] transition-colors"
            />
            <button
              type="submit"
              disabled={isCreatingSnapshot || !snapshotName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#7d2ae8] hover:bg-[#6c22cf] rounded-xl font-semibold text-xs text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isCreatingSnapshot ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Save Snapshot
            </button>
          </div>
        </form>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#7d2ae8]" />
              <span className="text-xs font-medium">Loading version history...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-medium text-sm">
              No previous version snapshots found.
            </div>
          ) : (
            versions.map((ver) => {
              const isCurrent = ver.versionNumber === currentVersion;
              const dateStr = new Date(ver.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div
                  key={ver._id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    isCurrent
                      ? 'bg-purple-50/70 border-purple-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {ver.thumbnailUrl && !failedThumbnailIds.has(ver._id) ? (
                      <img
                        src={ver.thumbnailUrl}
                        alt={`v${ver.versionNumber}`}
                        onError={() => {
                          setFailedThumbnailIds((prev) => {
                            const next = new Set(prev);
                            next.add(ver._id);
                            return next;
                          });
                        }}
                        className="w-12 h-12 object-contain bg-slate-50 rounded-lg border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                        <History className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-900 text-white font-semibold text-xs rounded-md">
                          v{ver.versionNumber}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 truncate">
                          {ver.versionName}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-md">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRestore(ver)}
                        disabled={restoringVersionId === ver._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-semibold text-xs text-slate-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {restoringVersionId === ver._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>* Restoring creates a new revision without deleting older versions</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
