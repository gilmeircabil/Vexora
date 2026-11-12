import React, { useState } from 'react';
import {
  UploadCloud,
  Sparkles,
  Download,
  ArrowLeft,
  RefreshCw,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';

export const AiImageEnhancerPage: React.FC = () => {
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(2);
  const [mode, setMode] = useState<'enhance' | 'denoise' | 'restore_faces' | 'sharpen'>('enhance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

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
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('scale', scale.toString());
      formData.append('mode', mode);

      const res = await aiToolsApi.enhanceImage(formData);
      const outputUrl = res.data?.outputUrl || res.data?.data?.outputUrl;
      if (res.success && outputUrl) {
        setResultUrl(outputUrl);
        toast('Image enhancement successful!', 'success');
      } else {
        throw new Error(res.error || 'Enhancement failed');
      }
    } catch (err: any) {
      toast(err.message || 'Image enhancement failed.', 'error');
    } finally {
      setIsProcessing(false);
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)]">AI Image Enhancer</h1>
              <p className="text-sm text-[var(--theme-gray-muted)] mt-1 font-medium">
                Upscale images 2x or 4x with sharp edges, artifact reduction, and enhanced details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings & Upload */}
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase mb-2">
                  Upload Image
                </label>
                <label className="border-2 border-dashed border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--theme-surface)] transition-colors">
                  <UploadCloud className="w-8 h-8 text-[var(--theme-dirty-white)] mb-2" />
                  <span className="text-xs font-bold text-[var(--theme-dirty-white)]">Click or drag image here</span>
                  <span className="text-[11px] text-[var(--theme-gray-muted)] font-mono mt-1">
                    JPG, PNG, WebP (Max 15MB)
                  </span>
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
                  Upscale Factor
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[2, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`py-2 font-mono text-xs font-bold rounded-lg border border-[var(--theme-gray-border)] transition ${
                        scale === s ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs' : 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface)]'
                      }`}
                    >
                      {s}x Resolution
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase mb-2">
                  Enhancement Mode
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {(['enhance', 'denoise', 'restore_faces', 'sharpen'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`p-2 rounded-lg border border-[var(--theme-gray-border)] font-bold capitalize text-left transition ${
                        mode === m
                          ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                          : 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface)]'
                      }`}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleProcess}
                disabled={!selectedFile || isProcessing}
                className="w-full py-3 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-mono text-sm font-bold rounded-xl border border-[var(--theme-gray-border)] transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Upscaling Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Enhance (Free)</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview & Result */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] rounded-2xl p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-[var(--theme-gray-muted)] uppercase mb-2">
                  Original Image
                </span>
                <div className="flex-1 flex items-center justify-center min-h-[260px] bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-xl overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Original" className="max-h-[360px] object-contain" />
                  ) : (
                    <span className="text-xs font-mono text-[var(--theme-gray-muted)]">No image selected</span>
                  )}
                </div>
              </div>

              <div className="border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] rounded-2xl p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-[var(--theme-gray-muted)] uppercase mb-2">
                  Enhanced Output
                </span>
                <div className="flex-1 flex items-center justify-center min-h-[260px] bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-xl overflow-hidden">
                  {resultUrl ? (
                    <img src={resultUrl} alt="Enhanced" className="max-h-[360px] object-contain" />
                  ) : (
                    <span className="text-xs font-mono text-[var(--theme-gray-muted)]">Result will appear here</span>
                  )}
                </div>
                {resultUrl && (
                  <a
                    href={resultUrl}
                    download="enhanced-image.png"
                    className="mt-3 w-full py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-mono text-xs font-bold rounded-xl border border-[var(--theme-gray-border)] flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                  >
                    <Download className="w-4 h-4" /> Download Enhanced PNG
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
