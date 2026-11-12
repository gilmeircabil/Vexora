import React, { useState } from 'react';
import {
  UploadCloud,
  ScanText,
  Copy,
  Check,
  ArrowLeft,
  RefreshCw,
  Download,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';

export const AiOcrPage: React.FC = () => {
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [metaInfo, setMetaInfo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedText('');
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      toast('Please upload a document or image.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await aiToolsApi.runOcr(formData);
      const text =
        res.data?.outputText ||
        res.data?.data?.outputText ||
        res.data?.outputJson?.text ||
        res.data?.data?.outputJson?.text;
      const meta = res.data?.outputJson || res.data?.data?.outputJson;

      if (res.success && text) {
        setExtractedText(text);
        setMetaInfo(meta);
        toast('Text extracted successfully!', 'success');
      } else {
        throw new Error(res.error || 'OCR processing failed');
      }
    } catch (err: any) {
      toast(err.message || 'OCR processing failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    toast('Text copied to clipboard!', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_ocr_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-mono font-bold text-[var(--theme-dirty-white)] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Tools
        </Link>

        <div className="border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-gray-border)] pb-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)]">
                AI Document & Image OCR
              </h1>
              <p className="text-sm text-[var(--theme-gray-muted)] mt-1 font-medium">
                Accurately extract text, tables, and paragraphs from scanned PDFs, receipts, and
                images.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase mb-2">
                  Upload Document or Image
                </label>
                <label className="border-2 border-dashed border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--theme-surface)] transition-colors">
                  <UploadCloud className="w-8 h-8 text-[var(--theme-dirty-white)] mb-2" />
                  <span className="text-xs font-bold text-[var(--theme-dirty-white)]">
                    {selectedFile ? selectedFile.name : 'Choose PDF, PNG, or JPG'}
                  </span>
                  <span className="text-[11px] text-[var(--theme-gray-muted)] font-mono mt-1">Up to 30MB</span>
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={handleExtract}
                disabled={!selectedFile || isProcessing}
                className="w-full py-3 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-mono text-sm font-bold border border-[var(--theme-gray-border)] rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Text...</span>
                  </>
                ) : (
                  <>
                    <ScanText className="w-4 h-4" />
                    <span>Extract Text (Free)</span>
                  </>
                )}
              </button>

              {metaInfo && (
                <div className="bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl p-3 font-mono text-xs space-y-1 text-[var(--theme-dirty-white)]">
                  <div className="font-bold text-[var(--theme-dirty-white)] border-b border-[var(--theme-gray-border)] pb-1">
                    Extraction Details
                  </div>
                  {metaInfo.engine && <div>Engine: {metaInfo.engine}</div>}
                  {metaInfo.confidence && (
                    <div>Confidence: {(metaInfo.confidence * 100).toFixed(0)}%</div>
                  )}
                  {metaInfo.page_count && <div>Pages: {metaInfo.page_count}</div>}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between font-mono text-xs font-bold">
                <span className="uppercase text-[var(--theme-dirty-white)]">Extracted Content</span>
                {extractedText && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-2.5 py-1 bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={downloadTxt}
                      className="px-2.5 py-1 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .TXT</span>
                    </button>
                  </div>
                )}
              </div>

              <textarea
                value={extractedText}
                readOnly
                placeholder="Extracted OCR text will appear here with full line formatting..."
                rows={16}
                className="w-full p-4 border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] font-mono text-xs text-[var(--theme-dirty-white)] rounded-xl leading-relaxed shadow-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
