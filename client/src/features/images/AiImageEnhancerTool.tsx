import React, { useState, useRef } from 'react';
import { Link } from 'react-router';
import {
  Upload,
  Sparkles,
  Download,
  AlertCircle,
  Loader2,
  Sliders,
  Check,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const AiImageEnhancerTool: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'enhance' | 'denoise' | 'restore_faces' | 'sharpen'>('enhance');
  const [scale, setScale] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WebP).', 'error');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      showToast('Image file size must be less than 15MB.', 'error');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResultUrl(null);
  };

  const handleEnhance = async () => {
    if (!file) {
      showToast('Please select an image first.', 'error');
      return;
    }

    setIsProcessing(true);
    setProgressStage('Validating payload & preparing image...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mode', mode);
      formData.append('scale', scale.toString());
      formData.append('toolId', 'ai-image-enhancer');

      const idempotencyKey = `enh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      setProgressStage('Executing AI enhancement model...');

      const headers: Record<string, string> = {
        'Idempotency-Key': idempotencyKey,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.data?.outputUrl) {
        setResultUrl(data.data.outputUrl);
        showToast('Image enhanced successfully!', 'success');
      } else {
        showToast(data.error || 'Enhancement failed. Please try again.', 'error');
      }
    } catch {
      showToast('Network error during image processing.', 'error');
    } finally {
      setIsProcessing(false);
      setProgressStage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Open-Source Free Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#22C55E]/15 border border-[var(--theme-gray-border)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E] text-white border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-slate-100 text-sm block">100% Free AI Image Enhancer</span>
            <p className="text-xs font-bold text-slate-300">
              Upscale, denoise, and sharpen images using Real-ESRGAN & Sharp. No external setup or
              AI models required.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-black hover:bg-neutral-50 rounded-3xl p-12 sm:p-16 text-center cursor-pointer bg-white shadow-sm transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] text-slate-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Upload className="w-7 h-7 stroke-[2.5]" />
              </div>
              <p className="text-base font-black text-slate-100">
                Click to upload an image, or drag and drop
              </p>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Supports JPEG, PNG, and WebP (up to 15MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-100 uppercase tracking-wider block">
                    Original Image
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-[var(--theme-gray-border)] bg-neutral-100 shadow-sm aspect-video flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Original input"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Enhanced Result */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
                      Enhanced Result
                    </span>
                    {resultUrl && (
                      <a
                        href={resultUrl}
                        download={`enhanced_${file?.name || 'image.png'}`}
                        className="text-xs font-black text-slate-100 bg-[#4ADE80] border border-black px-2 py-0.5 rounded shadow-sm hover:bg-[#3ec470] flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 stroke-[2.5]" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-[var(--theme-gray-border)] bg-neutral-100 shadow-sm aspect-video flex items-center justify-center relative">
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt="Enhanced output"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : isProcessing ? (
                      <div className="text-center p-4">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-100 stroke-[2.5] mx-auto mb-2" />
                        <p className="text-xs font-black text-slate-100">
                          {progressStage || 'Processing...'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-400 text-center p-4">
                        Select options and click "Enhance Image"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setResultUrl(null);
                  }}
                  className="text-xs font-black text-slate-100 underline hover:text-slate-300 cursor-pointer"
                >
                  Choose another image
                </button>
                {file && (
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Options & Action Controls (1 col) */}
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-[var(--theme-gray-border)] shadow-sm h-fit">
          <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-100 stroke-[2.5]" />
            <span>Enhancement Options</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-black text-slate-100 text-xs uppercase tracking-wider mb-2">
                Processing Mode
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'enhance',
                    label: 'Balanced Enhancement',
                    desc: 'Sharpening & adaptive contrast',
                  },
                  { id: 'denoise', label: 'Denoise & Clean', desc: 'Noise reduction & smoothing' },
                  {
                    id: 'restore_faces',
                    label: 'Face Restoration',
                    desc: 'Facial clarity & detail',
                  },
                  { id: 'sharpen', label: 'High-Pass Sharpen', desc: 'Edge definition & texture' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border border-[var(--theme-gray-border)] cursor-pointer transition-all ${
                      mode === opt.id
                        ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)]/25 shadow-sm'
                        : 'bg-white hover:bg-neutral-50 shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={opt.id}
                      checked={mode === opt.id}
                      onChange={() => setMode(opt.id as any)}
                      className="mt-0.5 accent-black"
                    />
                    <div>
                      <span className="font-black text-slate-100 block">{opt.label}</span>
                      <span className="text-[11px] font-bold text-slate-400">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-100 text-xs uppercase tracking-wider mb-2">
                Super-Resolution Scale
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { scale: 2, label: '2x Upscale' },
                  { scale: 4, label: '4x Ultra-HD' },
                ].map((s) => (
                  <button
                    key={s.scale}
                    type="button"
                    onClick={() => setScale(s.scale)}
                    className={`py-2.5 px-3 rounded-xl font-black border border-[var(--theme-gray-border)] text-center transition-all cursor-pointer ${
                      scale === s.scale
                        ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] shadow-sm'
                        : 'bg-white text-slate-100 hover:bg-neutral-100 shadow-sm'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--theme-gray-border)]">
            <button
              onClick={handleEnhance}
              disabled={!file || isProcessing}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border border-[var(--theme-gray-border)] transition-all ${
                !file
                  ? 'bg-neutral-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] shadow-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-sm cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Enhance Image (Free)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiImageEnhancerTool;
