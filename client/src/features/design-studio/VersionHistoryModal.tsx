import React, { useState, useEffect } from 'react';
import { X, History, Plus, RotateCcw, Clock, Check, Loader2, AlertCircle } from 'lucide-react';
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
  const [previewVersion, setPreviewVersion] = useState<DesignVersionDTO | null>(null);
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
    if (!confirm(`Restore to "${version.versionName}" (v${version.versionNumber})? A new version snapshot will be created.`)) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-2xl border-4 border-black p-6 shadow-[8px_8px_0px_#000000] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FACC15] rounded-xl border-2 border-black">
              <History className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Version History</h3>
              <p className="text-xs font-semibold text-gray-600">
                Browse previous revisions or create a named snapshot
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

        {/* Feedback Alert */}
        {message && (
          <div
            className={`my-3 p-3 rounded-xl border-2 text-xs font-bold shrink-0 ${
              message.type === 'success'
                ? 'bg-green-100 border-green-600 text-green-800'
                : 'bg-red-100 border-red-500 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Snapshot Creation Form */}
        <form onSubmit={handleCreateSnapshot} className="pt-3 pb-4 border-b-2 border-black/10 shrink-0">
          <label className="block text-xs font-black uppercase text-black mb-1.5">
            Save Named Snapshot
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Changed background, final logo layout..."
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              maxLength={100}
              className="flex-1 px-3 py-2 bg-white rounded-xl border-2 border-black text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
            <button
              type="submit"
              disabled={isCreatingSnapshot || !snapshotName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FACC15] rounded-xl border-2 border-black font-black text-xs text-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
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
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-black" />
              <span className="text-xs font-bold">Loading version history...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-semibold text-sm">
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
                  className={`p-3.5 rounded-xl border-2 border-black flex items-center justify-between gap-4 transition-all ${
                    isCurrent ? 'bg-amber-50/80 border-amber-500' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {ver.thumbnailUrl ? (
                      <img
                        src={ver.thumbnailUrl}
                        alt={`v${ver.versionNumber}`}
                        className="w-12 h-12 object-contain bg-gray-100 rounded-lg border border-black shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg border border-black flex items-center justify-center shrink-0">
                        <History className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-black text-[#FACC15] font-black text-xs rounded-md">
                          v{ver.versionNumber}
                        </span>
                        <h4 className="font-black text-sm text-black truncate">{ver.versionName}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-green-100 border border-green-500 text-green-800 text-[10px] font-black rounded-md">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-semibold">
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-gray-100 font-black text-xs text-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
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
        <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs text-gray-600 font-semibold shrink-0">
          <span>* Restoring creates a new revision without deleting older versions</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border-2 border-black font-bold text-sm bg-white hover:bg-gray-100 text-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
