import React, { useState, useEffect } from 'react';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { formatBytes, sizeChangePercent } from '../../lib/format.js';
import { transformImage } from '../../lib/images/transform.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { outputFileName } from '../../lib/files/signatures.js';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const ImageCompressorTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [quality, setQuality] = useState<number>(0.8);
  const [targetFormat, setTargetFormat] = useState<'jpeg' | 'webp' | 'png'>('jpeg');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);

  // Clean up object URLs on unmount
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

    // Default target format matching source if lossy, or WebP/JPEG for PNG
    if (file.kind === 'png') {
      setTargetFormat('webp'); // PNG re-encoded to WebP usually compresses dramatically
    } else {
      setTargetFormat('jpeg');
    }
  };

  const handleCompress = async () => {
    if (!sourceFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await transformImage(sourceFile.file, {
        format: targetFormat,
        quality: targetFormat === 'png' ? undefined : quality,
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
      setOutputSize(res.value.blob.size);
    } catch (e) {
      setErrorMsg('Unexpected error during image compression.');
    } finally {
      setIsProcessing(false);
    }
  };

  const changePct =
    sourceFile && outputBlob ? sizeChangePercent(sourceFile.size, outputSize) : null;
  const isReduced = changePct !== null && changePct < 0;

  return (
    <div className="space-y-6">
      {!sourceFile ? (
        <FileDropZone
          allowedKinds={['png', 'jpeg', 'webp', 'bmp']}
          onFilesSelected={handleFileSelected}
          description="Drop a PNG, JPEG, WebP, or BMP image to compress"
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

          {/* Controls */}
          <Card className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Output Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as 'jpeg' | 'webp' | 'png')}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="jpeg">JPEG (Universal lossy compression)</option>
                <option value="webp">WebP (High efficiency, modern)</option>
                <option value="png">PNG (Lossless)</option>
              </select>
              <p className="text-[11px] text-neutral-500 mt-1">
                {targetFormat === 'png'
                  ? 'PNG is lossless and quality settings do not apply.'
                  : 'WebP and JPEG allow adjustable quality reduction.'}
              </p>
            </div>

            {targetFormat !== 'png' && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  <span>Compression Quality</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                  <span>Smaller file (10%)</span>
                  <span>Balanced (80%)</span>
                  <span>Maximum quality (100%)</span>
                </div>
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={handleCompress} isLoading={isProcessing}>
                {outputBlob ? 'Re-compress with New Settings' : 'Compress Image'}
              </Button>
            </div>
          </Card>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Section */}
          {outputBlob && (
            <Card className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Compression Result
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {isReduced
                        ? `Reduced by ${Math.abs(changePct!).toFixed(1)}%`
                        : 'Output size is slightly larger or equal'}
                    </p>
                  </div>
                </div>

                <DownloadButton
                  file={outputBlob}
                  filename={outputFileName(sourceFile.name, 'compressed', targetFormat)}
                  label="Download Compressed Image"
                />
              </div>

              {/* Size metrics comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-xs text-neutral-500">Original Size</span>
                  <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {formatBytes(sourceFile.size)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-xs text-neutral-500">Compressed Size</span>
                  <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {formatBytes(outputSize)}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    isReduced
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300'
                  }`}
                >
                  <span className="text-xs opacity-80">Size Change</span>
                  <p className="text-lg font-bold mt-0.5">
                    {changePct !== null
                      ? `${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>

              {!isReduced && (
                <div className="p-3 text-xs rounded-lg bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900">
                  Note: The output is larger than or equal to the original. This is common when
                  re-compressing already highly optimized images or converting compressed JPEGs to
                  PNG. Try lowering the quality slider or choosing WebP.
                </div>
              )}

              {/* Visual preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Output Preview
                </span>
                <div className="flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-96 overflow-hidden">
                  {outputUrl && (
                    <img
                      src={outputUrl}
                      alt="Compressed preview"
                      className="max-h-80 max-w-full object-contain rounded shadow-xs"
                    />
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
