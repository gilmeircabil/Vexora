import React, { useState, useEffect } from 'react';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { formatBytes } from '../../lib/format.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { KIND_INFO } from '../../lib/files/signatures.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { Shield, Eye, Info } from 'lucide-react';

interface MetadataInfo {
  filename: string;
  fileSize: number;
  detectedFormat: string;
  mimeType: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  lastModified?: string;
}

export const ImageMetadataTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataInfo | null>(null);

  useEffect(() => {
    return () => {
      revokeTrackedBlobUrl(sourceUrl);
    };
  }, [sourceUrl]);

  const handleFileSelected = (files: ValidatedFile[]) => {
    const file = files[0];
    if (!file) return;

    revokeTrackedBlobUrl(sourceUrl);
    const url = createTrackedBlobUrl(file.file);
    setSourceFile(file);
    setSourceUrl(url);

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      const ratio = divisor > 0 ? `${w / divisor}:${h / divisor}` : '—';

      setMetadata({
        filename: file.file.name,
        fileSize: file.file.size,
        detectedFormat: KIND_INFO[file.kind].label,
        mimeType: KIND_INFO[file.kind].mime,
        width: w,
        height: h,
        aspectRatio: ratio,
        lastModified: file.file.lastModified
          ? new Date(file.file.lastModified).toLocaleString()
          : 'Unknown',
      });
    };
    img.src = url;
  };

  return (
    <div className="space-y-6">
      {!sourceFile ? (
        <FileDropZone
          allowedKinds={['png', 'jpeg', 'webp', 'bmp', 'gif', 'avif']}
          onFilesSelected={handleFileSelected}
          description="Drop an image to inspect its client-side header and format metadata"
        />
      ) : (
        <div className="space-y-6">
          <FileInfoCard
            file={sourceFile}
            onRemove={() => {
              setSourceFile(null);
              setMetadata(null);
            }}
          />

          {metadata && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Metadata Details */}
              <Card className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Inspected Metadata
                  </h3>
                </div>

                <dl className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-neutral-500">File Name</dt>
                    <dd className="font-mono text-neutral-900 dark:text-neutral-100 font-medium truncate max-w-xs">
                      {metadata.filename}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-neutral-500">Detected Format</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                      {metadata.detectedFormat}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-neutral-500">MIME Type</dt>
                    <dd className="font-mono text-neutral-900 dark:text-neutral-100">
                      {metadata.mimeType}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-neutral-500">File Size</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                      {formatBytes(metadata.fileSize)} ({metadata.fileSize.toLocaleString()} bytes)
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-neutral-500">Dimensions</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                      {metadata.width} × {metadata.height} px
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-neutral-500">Aspect Ratio</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                      {metadata.aspectRatio}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-neutral-500">Last Modified</dt>
                    <dd className="text-neutral-900 dark:text-neutral-100">
                      {metadata.lastModified}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 text-[11px] text-neutral-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Privacy Safeguard</span>
                  </div>
                  <p>
                    Image headers are inspected directly on your device. We do not extract or
                    display sensitive GPS coordinates.
                  </p>
                </div>
              </Card>

              {/* Preview */}
              <Card className="flex flex-col items-center justify-center p-6 bg-neutral-100 dark:bg-neutral-950">
                {sourceUrl && (
                  <img
                    src={sourceUrl}
                    alt="Inspected file"
                    className="max-h-80 max-w-full object-contain rounded shadow-xs"
                  />
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
