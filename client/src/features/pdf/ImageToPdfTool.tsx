import React, { useState } from 'react';
import { FileDropZone } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { convertImagesToPdf, type ImageToPdfOptions } from '../../lib/pdf/imageToPdf.js';
import { transformImage } from '../../lib/images/transform.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { formatBytes } from '../../lib/format.js';
import { ArrowUp, ArrowDown, X, FileImage, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ImageToPdfTool: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<ValidatedFile[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleFilesSelected = (files: ValidatedFile[]) => {
    setSelectedImages((prev) => [...prev, ...files]);
    setPdfBlob(null);
    setErrorMsg(null);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPdfBlob(null);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= selectedImages.length) return;
    setSelectedImages((prev) => {
      const copy = [...prev];
      const item = copy[from]!;
      copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    setPdfBlob(null);
  };

  const handleConvert = async () => {
    if (selectedImages.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const items: Array<{ bytes: Uint8Array; kind: string }> = [];

      for (const item of selectedImages) {
        if (item.kind === 'jpeg' || item.kind === 'png') {
          const buffer = await item.file.arrayBuffer();
          items.push({ bytes: new Uint8Array(buffer), kind: item.kind });
        } else {
          // If WebP, BMP, GIF, transcode to PNG in browser canvas first
          const trans = await transformImage(item.file, { format: 'png' });
          if (trans.ok) {
            const buf = await trans.value.blob.arrayBuffer();
            items.push({ bytes: new Uint8Array(buf), kind: 'png' });
          } else {
            setErrorMsg(`Failed to convert image ${item.file.name}`);
            setIsProcessing(false);
            return;
          }
        }
      }

      const res = await convertImagesToPdf(items, { pageSize, orientation });
      if (!res.ok) {
        setErrorMsg(res.error);
        setIsProcessing(false);
        return;
      }

      const blob = new Blob([res.value as unknown as BlobPart], { type: 'application/pdf' });
      setPdfBlob(blob);
    } catch {
      setErrorMsg('Unexpected error while generating PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileDropZone
        allowedKinds={['png', 'jpeg', 'webp', 'bmp', 'gif']}
        multiple={true}
        onFilesSelected={handleFilesSelected}
        description="Drop images here to convert into a multi-page PDF"
      />

      {selectedImages.length > 0 && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                Selected Images ({selectedImages.length})
              </h3>
              <p className="text-xs text-neutral-500">
                Each image will become a page in the generated PDF in the order shown.
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedImages([]);
                setPdfBlob(null);
              }}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {selectedImages.map((file, idx) => (
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
                    onClick={() => moveImage(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveImage(idx, idx + 1)}
                    disabled={idx === selectedImages.length - 1}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeImage(idx)}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Page settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as 'fit' | 'a4' | 'letter')}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
              >
                <option value="fit">Fit exactly to image dimensions</option>
                <option value="a4">Standard A4 page</option>
                <option value="letter">Standard US Letter page</option>
              </select>
            </div>

            {pageSize !== 'fit' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleConvert} isLoading={isProcessing}>
              <FileImage className="w-4 h-4 mr-2" />
              Generate PDF from {selectedImages.length} Image(s)
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

      {pdfBlob && (
        <Card className="flex items-center justify-between flex-wrap gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                PDF Created Successfully
              </h3>
              <p className="text-xs text-neutral-500">
                Size: {formatBytes(pdfBlob.size)} · {selectedImages.length} pages
              </p>
            </div>
          </div>

          <DownloadButton file={pdfBlob} filename="images-converted.pdf" label="Download PDF" />
        </Card>
      )}
    </div>
  );
};
