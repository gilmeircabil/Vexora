import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { parsePageRange, extractPdfPages } from '../../lib/pdf/split.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { formatBytes } from '../../lib/format.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { outputFileName } from '../../lib/files/signatures.js';
import { Split, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PdfSplitterTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRangeStr, setPageRangeStr] = useState<string>('1');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [extractedBlob, setExtractedBlob] = useState<Blob | null>(null);
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null);
  const [extractedCount, setExtractedCount] = useState<number>(0);

  useEffect(() => {
    return () => {
      revokeTrackedBlobUrl(extractedUrl);
    };
  }, [extractedUrl]);

  const handleFileSelected = async (files: ValidatedFile[]) => {
    const file = files[0];
    if (!file) return;

    setErrorMsg(null);
    setExtractedBlob(null);
    setSourceFile(file);

    try {
      const buffer = await file.file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setTotalPages(count);
      setPageRangeStr(count > 1 ? `1-${Math.min(count, 3)}` : '1');
    } catch {
      setErrorMsg('Could not read PDF document. It may be encrypted or corrupt.');
    }
  };

  const handleExtract = async () => {
    if (!sourceFile || totalPages <= 0) return;

    setErrorMsg(null);

    const rangeParsed = parsePageRange(pageRangeStr, totalPages);
    if (!rangeParsed.ok) {
      setErrorMsg(rangeParsed.error);
      return;
    }

    setIsProcessing(true);

    try {
      const buffer = await sourceFile.file.arrayBuffer();
      const res = await extractPdfPages(buffer, rangeParsed.value);

      if (!res.ok) {
        setErrorMsg(res.error);
        setIsProcessing(false);
        return;
      }

      revokeTrackedBlobUrl(extractedUrl);
      const blob = new Blob([res.value as unknown as BlobPart], { type: 'application/pdf' });
      const url = createTrackedBlobUrl(blob);
      setExtractedBlob(blob);
      setExtractedUrl(url);
      setExtractedCount(rangeParsed.value.length);
    } catch {
      setErrorMsg('Unexpected error while extracting pages.');
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
          description="Drop a PDF document to extract or split pages"
        />
      ) : (
        <div className="space-y-6">
          <FileInfoCard
            file={sourceFile}
            onRemove={() => {
              setSourceFile(null);
              setExtractedBlob(null);
            }}
          />

          <Card className="space-y-4">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                Page Selection
              </h3>
              <p className="text-xs text-neutral-500">
                Document contains{' '}
                <strong className="text-neutral-700 dark:text-neutral-300">
                  {totalPages} total pages
                </strong>
                .
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Pages to Extract (e.g. "1-3, 5, 8-10")
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={pageRangeStr}
                  onChange={(e) => setPageRangeStr(e.target.value)}
                  placeholder="e.g. 1-2, 5"
                  className="flex-1 px-3 py-2 text-sm font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <Button onClick={handleExtract} isLoading={isProcessing}>
                  <Split className="w-4 h-4 mr-1.5" />
                  Extract Pages
                </Button>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">
                Comma or space separated individual page numbers and ranges are supported.
              </p>
            </div>
          </Card>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {extractedBlob && (
            <Card className="flex items-center justify-between flex-wrap gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    Extracted {extractedCount} Pages
                  </h3>
                  <p className="text-xs text-neutral-500">
                    File size: {formatBytes(extractedBlob.size)}
                  </p>
                </div>
              </div>

              <DownloadButton
                file={extractedBlob}
                filename={outputFileName(
                  sourceFile.name,
                  `pages-${pageRangeStr.replace(/[\s,]+/g, '_')}`,
                  'pdf',
                )}
                label="Download Extracted PDF"
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
