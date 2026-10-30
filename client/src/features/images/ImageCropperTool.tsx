import React, { useState, useEffect, useRef } from 'react';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { transformImage, type CropRect } from '../../lib/images/transform.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { outputFileName } from '../../lib/files/signatures.js';
import { AlertCircle, Crop as CropIcon } from 'lucide-react';

export const ImageCropperTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Crop coordinates in original image space
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState<'free' | '1:1' | '4:3' | '16:9'>('free');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setOrigDimensions({ width: w, height: h });

      // Default crop: central 80%
      const cropW = Math.round(w * 0.8);
      const cropH = Math.round(h * 0.8);
      setCrop({
        x: Math.round((w - cropW) / 2),
        y: Math.round((h - cropH) / 2),
        width: cropW,
        height: cropH,
      });
    };
    img.src = url;
  };

  const setPresetRatio = (ratio: 'free' | '1:1' | '4:3' | '16:9') => {
    setAspectRatio(ratio);
    if (origDimensions.width <= 0) return;

    const w = origDimensions.width;
    const h = origDimensions.height;

    let targetW = crop.width;
    let targetH = crop.height;

    if (ratio === '1:1') {
      const size = Math.min(w, h, Math.max(crop.width, crop.height));
      targetW = size;
      targetH = size;
    } else if (ratio === '4:3') {
      targetH = Math.round((targetW * 3) / 4);
    } else if (ratio === '16:9') {
      targetH = Math.round((targetW * 9) / 16);
    }

    // Clamp within bounds
    if (targetH > h) {
      targetH = h;
      if (ratio === '4:3') targetW = Math.round((h * 4) / 3);
      if (ratio === '16:9') targetW = Math.round((h * 16) / 9);
      if (ratio === '1:1') targetW = h;
    }

    setCrop((prev) => ({
      ...prev,
      width: Math.min(w, targetW),
      height: Math.min(h, targetH),
      x: Math.max(0, Math.min(w - targetW, prev.x)),
      y: Math.max(0, Math.min(h - targetH, prev.y)),
    }));
  };

  const handleApplyCrop = async () => {
    if (!sourceFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const format = sourceFile.kind === 'jpeg' ? 'jpeg' : 'png';
      const res = await transformImage(sourceFile.file, {
        crop,
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
    } catch {
      setErrorMsg('Failed to crop image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!sourceFile ? (
        <FileDropZone
          allowedKinds={['png', 'jpeg', 'webp', 'bmp']}
          onFilesSelected={handleFileSelected}
          description="Drop an image to crop by bounds or standard aspect ratios"
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
            <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Crop Settings
                </h3>
                <p className="text-xs text-neutral-500">
                  Image size: {origDimensions.width} × {origDimensions.height} px
                </p>
              </div>

              {/* Aspect Ratio buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-neutral-500 mr-1">Aspect Ratio:</span>
                {(['free', '1:1', '4:3', '16:9'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setPresetRatio(ratio)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    {ratio === 'free' ? 'Freeform' : ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Numerical Crop Controls for fine accessibility */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Start X (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, origDimensions.width - 1)}
                  value={crop.x}
                  onChange={(e) =>
                    setCrop((prev) => ({
                      ...prev,
                      x: Math.max(
                        0,
                        Math.min(
                          origDimensions.width - prev.width,
                          parseInt(e.target.value, 10) || 0,
                        ),
                      ),
                    }))
                  }
                  className="w-full px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Start Y (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, origDimensions.height - 1)}
                  value={crop.y}
                  onChange={(e) =>
                    setCrop((prev) => ({
                      ...prev,
                      y: Math.max(
                        0,
                        Math.min(
                          origDimensions.height - prev.height,
                          parseInt(e.target.value, 10) || 0,
                        ),
                      ),
                    }))
                  }
                  className="w-full px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max={origDimensions.width}
                  value={crop.width}
                  onChange={(e) => {
                    const w = Math.max(
                      1,
                      Math.min(origDimensions.width - crop.x, parseInt(e.target.value, 10) || 1),
                    );
                    setCrop((prev) => ({ ...prev, width: w }));
                  }}
                  className="w-full px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max={origDimensions.height}
                  value={crop.height}
                  onChange={(e) => {
                    const h = Math.max(
                      1,
                      Math.min(origDimensions.height - crop.y, parseInt(e.target.value, 10) || 1),
                    );
                    setCrop((prev) => ({ ...prev, height: h }));
                  }}
                  className="w-full px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleApplyCrop} isLoading={isProcessing}>
                <CropIcon className="w-4 h-4 mr-2" />
                Apply Crop
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
                    Cropped Output
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Cropped area: {crop.width} × {crop.height} px
                  </p>
                </div>

                <DownloadButton
                  file={outputBlob}
                  filename={outputFileName(
                    sourceFile.name,
                    `cropped-${crop.width}x${crop.height}`,
                    sourceFile.kind === 'jpeg' ? 'jpeg' : 'png',
                  )}
                  label="Download Cropped Image"
                />
              </div>

              <div className="flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-96 overflow-hidden">
                {outputUrl && (
                  <img
                    src={outputUrl}
                    alt="Cropped output"
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
