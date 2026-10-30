import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { rotatePdfPages } from '../../lib/pdf/rotate.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { formatBytes } from '../../lib/format.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { outputFileName } from '../../lib/files/signatures.js';
import { RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PdfRotatorTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [angle, setAngle] = useState<90 | 180 | 270>(90);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rotatedBlob, setRotatedBlob] = useState<Blob | null>(null);
  const [rotatedUrl, setRotatedUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      revokeTrackedBlobUrl(rotatedUrl);
    };
  }, [rotatedUrl]);

  const handleFileSelected = async (files: ValidatedFile[]) => {
    const file = files[0];
    if (!file) return;

    setErrorMsg(null);
    setRotatedBlob(null);
    setSourceFile(file);

    try {
      const buffer = await file.file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setTotalPages(doc.getPageCount());
    } catch {
      setErrorMsg('Could not inspect PDF. Document may be encrypted or corrupted.');
    }
  };

  const handleRotate = async () => {
    if (!sourceFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const buffer = await sourceFile.file.arrayBuffer();
      const res = await rotatePdfPages(buffer, angle);

      if (!res.ok) {
        setErrorMsg(res.error);
        setIsProcessing(false);
        return;
      }

      revokeTrackedBlobUrl(rotatedUrl);
      const blob = new Blob([res.value as unknown as BlobPart], { type: 'application/pdf' });
      const url = createTrackedBlobUrl(blob);
      setRotatedBlob(blob);
      setRotatedUrl(url);
    } catch {
      setErrorMsg('Unexpected error while rotating PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!sourceFile ? (
        <FileDropZone
          allowedKinds={['pdf']}
          onFilesSelected={handleFileSelected}
          description="Drop a PDF document to rotate pages"
        />
      ) : (
        <div className="space-y-6">
          <FileInfoCard
            file={sourceFile}
            onRemove={() => {
              setSourceFile(null);
              setRotatedBlob(null);
            }}
          />

          <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                  Rotation Angle
                </h3>
                <p className="text-xs text-neutral-500">
                  Rotates all {totalPages} pages of the document clockwise.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {([90, 180, 270] as const).map((a) => (
                  <Button
                    key={a}
                    variant={angle === a ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setAngle(a)}
                  >
                    <RotateCw className="w-3.5 h-3.5 mr-1" />+{a}°
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleRotate} isLoading={isProcessing}>
                Rotate PDF (+{angle}°)
              </Button>
            </div>
          </Card>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {rotatedBlob && (
            <Card className="flex items-center justify-between flex-wrap gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    PDF Rotated by +{angle}°
                  </h3>
                  <p className="text-xs text-neutral-500">
                    File size: {formatBytes(rotatedBlob.size)}
                  </p>
                </div>
              </div>

              <DownloadButton
                file={rotatedBlob}
                filename={outputFileName(sourceFile.name, `rotated-${angle}deg`, 'pdf')}
                label="Download Rotated PDF"
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
