import React, { useState } from 'react';
import { UploadCloud, Scissors, Download, ArrowLeft, RefreshCw, Pipette } from 'lucide-react';
import { Link } from 'react-router';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';
import { removeImageBackground } from '../../lib/ai/backgroundRemovalHelper.js';

export const AiBackgroundRemoverPage: React.FC = () => {
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [customHex, setCustomHex] = useState<string>('#FFFFFF');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      toast('Please upload an image first.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      setProgressStatus('Initializing AI cutout...');

      const effectiveBgColor = bgColor === 'custom' ? customHex : bgColor;

      // 1. In-browser neural segmentation (Zero server dependencies)
      try {
        const result = await removeImageBackground(selectedFile, {
          bgColor: effectiveBgColor,
          onProgress: (status) => setProgressStatus(status),
        });
        setResultUrl(result.url);
        toast('Background removed cleanly!', 'success');
        return;
      } catch (clientErr) {
        console.warn('In-browser background removal failed, falling back to server:', clientErr);
      }

      // 2. Server fallback if needed
      setProgressStatus('Processing via server fallback...');
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (bgColor === 'custom') {
        formData.append('bgColor', customHex);
      } else if (bgColor !== 'transparent') {
        formData.append('bgColor', bgColor);
      }

      const res = await aiToolsApi.removeBackground(formData);
      const outputUrl = res.data?.outputUrl || res.data?.data?.outputUrl;
      if (res.success && outputUrl) {
        setResultUrl(outputUrl);
        toast('Background removed successfully!', 'success');
      } else {
        throw new Error(res.error || 'Background removal failed');
      }
    } catch (err: any) {
      toast(err.message || 'Background removal failed.', 'error');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
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
                AI Background Remover
              </h1>
              <p className="text-sm text-[var(--theme-gray-muted)] mt-1 font-medium">
                Automatically isolate foreground subjects and export crisp transparent PNGs or
                custom color backgrounds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase mb-2">
                  Upload Image
                </label>
                <label className="border-2 border-dashed border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--theme-surface)] transition-colors">
                  <UploadCloud className="w-8 h-8 text-[var(--theme-dirty-white)] mb-2" />
                  <span className="text-xs font-bold text-[var(--theme-dirty-white)]">Upload photo</span>
                  <span className="text-[11px] text-[var(--theme-gray-muted)] font-mono mt-1">PNG, JPG, WebP</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase mb-2">
                  Background Finish
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setBgColor('transparent')}
                    className={`py-2 px-1 text-xs font-mono font-bold rounded-lg border border-[var(--theme-gray-border)] transition ${
                      bgColor === 'transparent'
                        ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                        : 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface)]'
                    }`}
                  >
                    Transparent
                  </button>
                  <button
                    onClick={() => setBgColor('#FFFFFF')}
                    className={`py-2 px-1 text-xs font-mono font-bold rounded-lg border border-[var(--theme-gray-border)] transition ${
                      bgColor === '#FFFFFF'
                        ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                        : 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface)]'
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => setBgColor('custom')}
                    className={`py-2 px-1 text-xs font-mono font-bold rounded-lg border border-[var(--theme-gray-border)] transition ${
                      bgColor === 'custom'
                        ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                        : 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface)]'
                    }`}
                  >
                    Custom Hex
                  </button>
                </div>
                {bgColor === 'custom' && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="color"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="w-10 h-10 border border-[var(--theme-gray-border)] rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] rounded-md font-mono text-xs uppercase"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleProcess}
                disabled={!selectedFile || isProcessing}
                className="w-full py-3 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-mono text-sm font-bold rounded-xl border border-[var(--theme-gray-border)] transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{progressStatus || 'Removing Background...'}</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>Remove Background (Free)</span>
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-800 bg-gray-50 p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-gray-700 uppercase mb-2">
                  Original
                </span>
                <div className="flex-1 flex items-center justify-center min-h-[260px] bg-white border border-gray-200 overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Original" className="max-h-[360px] object-contain" />
                  ) : (
                    <span className="text-xs font-mono text-gray-400">No image uploaded</span>
                  )}
                </div>
              </div>

              <div className="border border-slate-800 bg-gray-50 p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-gray-700 uppercase mb-2">
                  Background Removed
                </span>
                <div
                  className="flex-1 flex items-center justify-center min-h-[260px] border border-gray-200 overflow-hidden"
                  style={{
                    backgroundImage:
                      bgColor === 'transparent'
                        ? 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)'
                        : 'none',
                    backgroundSize: '20px 20px',
                    backgroundColor:
                      bgColor === 'transparent'
                        ? '#FFFFFF'
                        : bgColor === 'custom'
                          ? customHex
                          : bgColor,
                  }}
                >
                  {resultUrl ? (
                    <img src={resultUrl} alt="Output" className="max-h-[360px] object-contain" />
                  ) : (
                    <span className="text-xs font-mono text-gray-400">Transparent output</span>
                  )}
                </div>
                {resultUrl && (
                  <a
                    href={resultUrl}
                    download="background-removed.png"
                    className="mt-3 w-full py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-mono text-xs font-bold rounded-xl border border-[var(--theme-gray-border)] flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                  >
                    <Download className="w-4 h-4" /> Download Transparent PNG
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
