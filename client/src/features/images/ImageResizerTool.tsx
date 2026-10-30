import React, { useState, useEffect } from 'react';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { transformImage } from '../../lib/images/transform.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { outputFileName } from '../../lib/files/signatures.js';
import { Lock, Unlock, AlertCircle, RefreshCw } from 'lucide-react';

export const ImageResizerTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [finalDimensions, setFinalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    return () => {
      revokeTrackedBlobUrl(sourceUrl);
      revokeTrackedBlobUrl(outputUrl);
    };
  }, [sourceUrl, outputUrl]);

  const handleFileSelected = (files: ValidatedFile[]) => {
    const file = files[0];
    if (!file) return;

    revokeTrackedBlobUrl(sourceUrl);
    revokeTrackedBlobUrl(outputUrl);
    setOutputBlob(null);
    setOutputUrl(null);
    setErrorMsg(null);

    const url = createTrackedBlobUrl(file.file);
    setSourceFile(file);
    setSourceUrl(url);

    // Read natural dimensions
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setOrigDimensions({ width: w, height: h });
      setTargetWidth(w);
      setTargetHeight(h);
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspectRatio && origDimensions.width > 0) {
      const ratio = origDimensions.height / origDimensions.width;
      setTargetHeight(Math.max(1, Math.round(val * ratio)));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspectRatio && origDimensions.height > 0) {
      const ratio = origDimensions.width / origDimensions.height;
      setTargetWidth(Math.max(1, Math.round(val * ratio)));
    }
  };

  const applyScalePercentage = (pct: number) => {
    if (origDimensions.width <= 0) return;
    const factor = pct / 100;
    const w = Math.max(1, Math.round(origDimensions.width * factor));
    const h = Math.max(1, Math.round(origDimensions.height * factor));
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleResize = async () => {
    if (!sourceFile) return;

    if (targetWidth <= 0 || targetHeight <= 0) {
      setErrorMsg('Dimensions must be positive integers.');
      return;
    }

    if (targetWidth > 16000 || targetHeight > 16000) {
      setErrorMsg('Dimensions cannot exceed 16,000 pixels.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const format = sourceFile.kind === 'jpeg' ? 'jpeg' : 'png';
      const res = await transformImage(sourceFile.file, {
        resizeWidth: targetWidth,
        resizeHeight: targetHeight,
        format,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
        setIsProcessing(false);
        return;
      }

      revokeTrackedBlobUrl(outputUrl);
      const newUrl = createTrackedBlobUrl(res.value.blob);
      setOutputBlob(res.value.blob);
      setOutputUrl(newUrl);
      setFinalDimensions({ width: res.value.width, height: res.value.height });
    } catch {
      setErrorMsg('Unexpected error while resizing image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!sourceFile ? (
        <FileDropZone
          allowedKinds={['png', 'jpeg', 'webp', 'bmp', 'gif']}
          onFilesSelected={handleFileSelected}
          description="Drop an image to resize by width, height, or percentage"
        />
      ) : (
        <div className="space-y-6">
          <FileInfoCard
            file={sourceFile}
            onRemove={() => {
              setSourceFile(null);
              setOutputBlob(null);
            }}
          />

          <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Resize Options
                </h3>
                <p className="text-xs text-neutral-500">
                  Original dimensions: {origDimensions.width} × {origDimensions.height} px
                </p>
              </div>

              {/* Quick scale preset buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-neutral-500 mr-1">Presets:</span>
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => applyScalePercentage(pct)}
                    className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Width (pixels)
                </label>
                <input
                  type="number"
                  min="1"
                  max="16000"
                  value={targetWidth || ''}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Height (pixels)
                </label>
                <input
                  type="number"
                  min="1"
                  max="16000"
                  value={targetHeight || ''}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    lockAspectRatio
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                  }`}
                >
                  {lockAspectRatio ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                  <span>Lock Ratio</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleResize} isLoading={isProcessing}>
                Resize Image
              </Button>
            </div>
          </Card>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {outputBlob && (
            <Card className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Resized Output
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Final dimensions: {finalDimensions.width} × {finalDimensions.height} px
                  </p>
                </div>

                <DownloadButton
                  file={outputBlob}
                  filename={outputFileName(
                    sourceFile.name,
                    `resized-${finalDimensions.width}x${finalDimensions.height}`,
                    sourceFile.kind === 'jpeg' ? 'jpeg' : 'png',
                  )}
                  label="Download Resized Image"
                />
              </div>

              <div className="flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-96 overflow-hidden">
                {outputUrl && (
                  <img
                    src={outputUrl}
                    alt="Resized output"
                    className="max-h-80 max-w-full object-contain rounded shadow-xs"
                  />
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
