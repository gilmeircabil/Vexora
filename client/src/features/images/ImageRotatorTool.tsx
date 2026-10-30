import React, { useState, useEffect } from 'react';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { transformImage } from '../../lib/images/transform.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { outputFileName } from '../../lib/files/signatures.js';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, AlertCircle } from 'lucide-react';

export const ImageRotatorTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

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
    setRotation(0);
    setFlipH(false);
    setFlipV(false);

    const url = createTrackedBlobUrl(file.file);
    setSourceFile(file);
    setSourceUrl(url);
  };

  const rotateLeft = () => {
    setRotation((prev) => {
      const next = (prev - 90 + 360) % 360;
      return next as 0 | 90 | 180 | 270;
    });
  };

  const rotateRight = () => {
    setRotation((prev) => {
      const next = (prev + 90) % 360;
      return next as 0 | 90 | 180 | 270;
    });
  };

  const handleApplyTransform = async () => {
    if (!sourceFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const format = sourceFile.kind === 'jpeg' ? 'jpeg' : 'png';
      const res = await transformImage(sourceFile.file, {
        rotateDegrees: rotation,
        flipHorizontal: flipH,
        flipVertical: flipV,
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
      setErrorMsg('Failed to rotate or flip image.');
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
          description="Drop an image to rotate or mirror horizontally / vertically"
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
                  Orientation Controls
                </h3>
                <p className="text-xs text-neutral-500">
                  Current rotation: {rotation}° · Flip H: {flipH ? 'Yes' : 'No'} · Flip V:{' '}
                  {flipV ? 'Yes' : 'No'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="secondary" size="sm" onClick={rotateLeft}>
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Rotate -90°
                </Button>
                <Button variant="secondary" size="sm" onClick={rotateRight}>
                  <RotateCw className="w-4 h-4 mr-1.5" />
                  Rotate +90°
                </Button>
                <Button
                  variant={flipH ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFlipH(!flipH)}
                >
                  <FlipHorizontal className="w-4 h-4 mr-1.5" />
                  Flip Horizontal
                </Button>
                <Button
                  variant={flipV ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFlipV(!flipV)}
                >
                  <FlipVertical className="w-4 h-4 mr-1.5" />
                  Flip Vertical
                </Button>
              </div>
            </div>

            {/* Interactive Preview Canvas with CSS transforms */}
            <div className="flex items-center justify-center p-8 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 min-h-[280px] overflow-hidden">
              {sourceUrl && (
                <img
                  src={sourceUrl}
                  alt="Live transform preview"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    transition: 'transform 0.2s ease-in-out',
                  }}
                  className="max-h-64 max-w-full object-contain rounded shadow-xs"
                />
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleApplyTransform} isLoading={isProcessing}>
                Generate Transformed Image
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
                    Transformed Image Ready
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Saved with applied rotation and flip settings
                  </p>
                </div>

                <DownloadButton
                  file={outputBlob}
                  filename={outputFileName(
                    sourceFile.name,
                    `rot${rotation}`,
                    sourceFile.kind === 'jpeg' ? 'jpeg' : 'png',
                  )}
                  label="Download Transformed Image"
                />
              </div>

              <div className="flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-96 overflow-hidden">
                {outputUrl && (
                  <img
                    src={outputUrl}
                    alt="Output ready"
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
