import React, { useState, useEffect, useRef } from 'react';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { removeImageBackground } from '../../lib/images/backgroundRemover.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { outputFileName } from '../../lib/files/signatures.js';
import { parseHexColor, rgbToHex } from '../../lib/calc/colors.js';
import { Pipette, Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const BackgroundRemoverTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [targetHex, setTargetHex] = useState<string>('#FFFFFF');
  const [targetRgb, setTargetRgb] = useState<{ r: number; g: number; b: number }>({
    r: 255,
    g: 255,
    b: 255,
  });
  const [tolerance, setTolerance] = useState<number>(25);
  const [feathering, setFeathering] = useState<number>(10);
  const [contiguous, setContiguous] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

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
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
    };
    img.src = url;
  };

  const handleColorPreset = (hex: string) => {
    setTargetHex(hex);
    const parsed = parseHexColor(hex);
    if (parsed.ok) {
      setTargetRgb({ r: parsed.value.r, g: parsed.value.g, b: parsed.value.b });
    }
  };

  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res?.sRGBHex) {
          handleColorPreset(res.sRGBHex);
        }
      } catch {
        // User cancelled
      }
    }
  };

  const handleRemove = async () => {
    if (!sourceFile || !imgRef.current) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await removeImageBackground(imgRef.current, {
        targetColor: targetRgb,
        tolerance,
        feathering,
        contiguous,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
        setIsProcessing(false);
        return;
      }

      revokeTrackedBlobUrl(outputUrl);
      const url = createTrackedBlobUrl(res.value.blob);
      setOutputBlob(res.value.blob);
      setOutputUrl(url);
    } catch {
      setErrorMsg('Failed to remove background.');
    } finally {
      setIsProcessing(false);
    }
  };

  const hasNativeEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  return (
    <div className="space-y-6">
      {!sourceFile ? (
        <FileDropZone
          allowedKinds={['png', 'jpeg', 'webp', 'bmp']}
          onFilesSelected={handleFileSelected}
          description="Drop an image to remove solid, studio, or keyed backgrounds"
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

          {/* Settings Card */}
          <Card className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                  Background Color Keying Options
                </h3>
                <p className="text-xs text-neutral-500">
                  Select the background color to turn transparent.
                </p>
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-neutral-500 mr-1">Presets:</span>
                {[
                  { name: 'White', hex: '#FFFFFF' },
                  { name: 'Black', hex: '#000000' },
                  { name: 'Green', hex: '#00FF00' },
                  { name: 'Blue', hex: '#0000FF' },
                ].map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleColorPreset(p.hex)}
                    className="px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:border-indigo-500 text-xs font-medium"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
              {/* Target Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Target Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={targetHex}
                    onChange={(e) => handleColorPreset(e.target.value)}
                    className="w-10 h-9 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={targetHex}
                    onChange={(e) => handleColorPreset(e.target.value)}
                    className="w-24 px-2.5 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                  />
                  {hasNativeEyeDropper && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleEyedropper}
                      title="Sample color from screen"
                    >
                      <Pipette className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Tolerance */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <span>Color Tolerance</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {tolerance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={tolerance}
                  onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Feathering / Smoothness */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <span>Edge Feathering</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {feathering}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={feathering}
                  onChange={(e) => setFeathering(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-4 border-t border-neutral-100 dark:border-neutral-800">
              <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contiguous}
                  onChange={(e) => setContiguous(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span>
                  <strong>Contiguous Flood-Fill (Recommended):</strong> Erase only connected outer
                  background, preserving matching colors inside the subject.
                </span>
              </label>

              <Button onClick={handleRemove} isLoading={isProcessing}>
                <Sparkles className="w-4 h-4 mr-2" />
                Remove Background
              </Button>
            </div>
          </Card>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Output Card */}
          {outputBlob && (
            <Card className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Transparent PNG Output Ready
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Background removed locally using HTML5 canvas.
                    </p>
                  </div>
                </div>

                <DownloadButton
                  file={outputBlob}
                  filename={outputFileName(sourceFile.name, 'nobg', 'png')}
                  label="Download Transparent PNG"
                />
              </div>

              {/* Checkerboard visual preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Cutout Preview (Checkerboard indicates transparency)
                </span>
                <div
                  className="flex items-center justify-center p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-96 overflow-hidden"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                >
                  {outputUrl && (
                    <img
                      src={outputUrl}
                      alt="Cutout output with transparent background"
                      className="max-h-80 max-w-full object-contain rounded drop-shadow-md"
                    />
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Educational notice */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-500 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-700 dark:text-neutral-300">
                How this tool works
              </p>
              <p className="mt-0.5 leading-relaxed">
                This tool removes solid, uniform, or chroma-keyed studio backgrounds (e.g. white
                product photos, green screens) directly in your browser using color distance
                thresholding and edge feathering. For complex multi-subject photographic
                backgrounds, self-hosted AI semantic segmentation models (such as rembg/BiRefNet)
                are planned for a subsequent release.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
