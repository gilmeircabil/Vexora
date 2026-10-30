import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Import worker URL via Vite
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { FileDropZone, FileInfoCard } from '../../components/common/FileDropZone.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, Eye } from 'lucide-react';

// Configure pdfjs worker once
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const PdfPreviewTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<ValidatedFile | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const handleFileSelected = async (files: ValidatedFile[]) => {
    const file = files[0];
    if (!file) return;

    setErrorMsg(null);
    setSourceFile(file);
    setIsLoading(true);

    try {
      const buffer = await file.file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: buffer,
        isEvalSupported: false,
      });

      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
    } catch (e) {
      setErrorMsg('Failed to render PDF. Document may be encrypted or unsupported.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentPage = async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (e: any) {
      if (e?.name !== 'RenderingCancelledException') {
        // Normal cancellation when switching pages rapidly
      }
    }
  };

  useEffect(() => {
    renderCurrentPage();
  }, [pdfDoc, currentPage, scale]);

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const zoomIn = () => setScale((prev) => Math.min(2.5, prev + 0.2));
  const zoomOut = () => setScale((prev) => Math.max(0.6, prev - 0.2));

  return (
    <div className="space-y-6">
      {!sourceFile ? (
        <FileDropZone
          allowedKinds={['pdf']}
          onFilesSelected={handleFileSelected}
          description="Drop a PDF document to preview and inspect pages locally"
        />
      ) : (
        <div className="space-y-6">
          <FileInfoCard
            file={sourceFile}
            onRemove={() => {
              setSourceFile(null);
              setPdfDoc(null);
              setTotalPages(0);
            }}
          />

          {/* Navigation & Zoom Bar */}
          <Card className="flex items-center justify-between flex-wrap gap-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={prevPage}
                disabled={currentPage <= 1 || isLoading}
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 px-2 font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={nextPage}
                disabled={currentPage >= totalPages || isLoading}
                aria-label="Next Page"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={zoomOut} aria-label="Zoom out">
                <ZoomOut className="w-4 h-4 mr-1" />
                Zoom Out
              </Button>
              <span className="text-xs text-neutral-500 font-mono">{Math.round(scale * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={zoomIn} aria-label="Zoom in">
                <ZoomIn className="w-4 h-4 mr-1" />
                Zoom In
              </Button>
            </div>
          </Card>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Canvas Render Area */}
          <div className="flex justify-center p-6 bg-neutral-100 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-auto min-h-[480px]">
            <canvas ref={canvasRef} className="shadow-lg rounded bg-white max-w-full" />
          </div>
        </div>
      )}
    </div>
  );
};
