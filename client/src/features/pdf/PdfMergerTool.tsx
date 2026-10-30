import React, { useState, useEffect } from 'react';
import { FileDropZone } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { mergePdfFiles } from '../../lib/pdf/merge.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { formatBytes } from '../../lib/format.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { ArrowUp, ArrowDown, X, FilePlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PdfMergerTool: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<ValidatedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      revokeTrackedBlobUrl(mergedUrl);
    };
  }, [mergedUrl]);

  const handleFilesSelected = (files: ValidatedFile[]) => {
    setMergedBlob(null);
    setMergedUrl(null);
    setErrorMsg(null);
    setPdfFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedBlob(null);
  };

  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= pdfFiles.length) return;
    setPdfFiles((prev) => {
      const copy = [...prev];
      const item = copy[from]!;
      copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    setMergedBlob(null);
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setErrorMsg('Please select at least two PDF documents to merge.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const buffers: ArrayBuffer[] = [];
      for (const item of pdfFiles) {
        const buf = await item.file.arrayBuffer();
        buffers.push(buf);
      }

      const res = await mergePdfFiles(buffers);
      if (!res.ok) {
        setErrorMsg(res.error);
        setIsProcessing(false);
        return;
      }

      revokeTrackedBlobUrl(mergedUrl);
      const blob = new Blob([res.value as unknown as BlobPart], { type: 'application/pdf' });
      const url = createTrackedBlobUrl(blob);
      setMergedBlob(blob);
      setMergedUrl(url);
    } catch {
      setErrorMsg('Unexpected error while merging documents.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <FileDropZone
        allowedKinds={['pdf']}
        multiple={true}
        onFilesSelected={handleFilesSelected}
        description="Drop PDF files here, or click to browse (select multiple to combine)"
      />

      {/* Selected files list */}
      {pdfFiles.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                Selected Documents ({pdfFiles.length})
              </h3>
              <p className="text-xs text-neutral-500">
                Reorder documents using the arrow buttons to change page order.
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPdfFiles([]);
                setMergedBlob(null);
              }}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {pdfFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-neutral-400 text-[11px]">{formatBytes(file.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveFile(idx, idx - 1)}
                    disabled={idx === 0}
                    aria-label={`Move ${file.name} up`}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveFile(idx, idx + 1)}
                    disabled={idx === pdfFiles.length - 1}
                    aria-label={`Move ${file.name} down`}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeFile(idx)}
                    aria-label={`Remove ${file.name}`}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600 transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleMerge} isLoading={isProcessing} disabled={pdfFiles.length < 2}>
              <FilePlus className="w-4 h-4 mr-2" />
              Merge {pdfFiles.length} PDF Documents
            </Button>
          </div>
        </Card>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Merged Success & Download Card */}
      {mergedBlob && (
        <Card className="flex items-center justify-between flex-wrap gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                PDF Documents Merged Successfully
              </h3>
              <p className="text-xs text-neutral-500">
                Combined file size: {formatBytes(mergedBlob.size)}
              </p>
            </div>
          </div>

          <DownloadButton
            file={mergedBlob}
            filename="merged-document.pdf"
            label="Download Merged PDF"
          />
        </Card>
      )}
    </div>
  );
};
