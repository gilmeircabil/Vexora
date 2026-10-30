import React, { useState, useEffect } from 'react';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { transformImage } from '../../lib/images/transform.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { outputFileName, KIND_INFO } from '../../lib/files/signatures.js';
import { formatBytes } from '../../lib/format.js';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ImageConverterTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [targetKind, setTargetKind] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(0.92);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

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

    // Default target format opposite to source
    if (file.kind === 'png') {
      setTargetKind('jpeg');
    } else if (file.kind === 'jpeg') {
      setTargetKind('png');
    } else {
      setTargetKind('png');
    }
  };

  const handleConvert = async () => {
    if (!sourceFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await transformImage(sourceFile.file, {
        format: targetKind,
        quality: targetKind === 'png' ? undefined : quality,
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
      setErrorMsg('Failed to transcode image.');
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
          description="Drop an image (PNG, JPEG, WebP, BMP, GIF) to convert"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Convert Target Format
                </label>
                <select
                  value={targetKind}
                  onChange={(e) => setTargetKind(e.target.value as 'png' | 'jpeg' | 'webp')}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="png">PNG — Lossless, transparency support</option>
                  <option value="jpeg">JPEG — Smaller file size, universal</option>
                  <option value="webp">WebP — Modern high efficiency</option>
                </select>
              </div>

              {targetKind !== 'png' && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    <span>Quality</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
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
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleConvert} isLoading={isProcessing}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Convert to {KIND_INFO[targetKind].label}
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
                    Converted to {KIND_INFO[targetKind].label}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Output size: {formatBytes(outputBlob.size)}
                  </p>
                </div>

                <DownloadButton
                  file={outputBlob}
                  filename={outputFileName(sourceFile.name, 'converted', targetKind)}
                  label={`Download ${KIND_INFO[targetKind].label}`}
                />
              </div>

              <div className="flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-96 overflow-hidden">
                {outputUrl && (
                  <img
                    src={outputUrl}
                    alt="Converted output"
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
