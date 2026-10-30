import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Upload,
  Sparkles,
  Zap,
  Download,
  AlertCircle,
  Loader2,
  Sliders,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useCredits } from '../../context/CreditContext.js';
import { useToast } from '../../context/ToastContext.js';

export const AiImageEnhancerTool: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { balance, refreshBalance } = useCredits();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'enhance' | 'denoise' | 'restore_faces' | 'sharpen'>('enhance');
  const [scale, setScale] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableCredits = balance?.totalAvailable ?? user?.credits?.totalAvailable ?? 0;
  const toolCost = 1;
  const isOutOfCredits = isAuthenticated && availableCredits < toolCost;

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
    if (!isAuthenticated) {
      showToast('Please sign in to use the AI Image Enhancer.', 'info');
      navigate('/login?redirect=/tools/ai-image-enhancer');
      return;
    }

    if (isOutOfCredits) {
      showToast(
        'Insufficient credits. Please upgrade your plan or wait for the daily reset.',
        'error',
      );
      return;
    }

    if (!file) {
      showToast('Please select an image first.', 'error');
      return;
    }

    setIsProcessing(true);
    setProgressStage('Reserving credit & validating payload...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mode', mode);
      formData.append('scale', scale.toString());
      formData.append('toolId', 'ai-image-enhancer');

      const idempotencyKey = `enh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      setProgressStage('Executing AI enhancement model...');

      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.data?.outputUrl) {
        setResultUrl(data.data.outputUrl);
        showToast('Image enhanced successfully! 1 credit consumed.', 'success');
        await refreshBalance();
      } else {
        if (res.status === 402) {
          showToast(data.error || 'Insufficient credits. Upgrade to continue.', 'error');
        } else {
          showToast(data.error || 'Enhancement failed. Your credit has been refunded.', 'error');
        }
      }
    } catch {
      showToast(
        'Network error during image processing. Any reserved credit has been released.',
        'error',
      );
    } finally {
      setIsProcessing(false);
      setProgressStage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Credit & Auth Notice Banner */}
      {!isAuthenticated ? (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                Sign in to get 3 Free AI Generation Credits Daily
              </span>
              <p className="text-neutral-600 dark:text-neutral-400">
                Enhance, denoise, and restore photos with zero subscriptions required.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/login?redirect=/tools/ai-image-enhancer"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              Sign In
            </Link>
            <Link
              to="/register?redirect=/tools/ai-image-enhancer"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white shadow-xs"
            >
              Register Free
            </Link>
          </div>
        </div>
      ) : isOutOfCredits ? (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                You've used all your AI credits for today
              </span>
              <p className="text-neutral-600 dark:text-neutral-400">
                Upgrade your plan for instant monthly credits or wait for the 00:00 UTC daily reset.
              </p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shrink-0 flex items-center gap-1"
          >
            <span>Upgrade Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-3 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-neutral-600 dark:text-neutral-400">Available Credits:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {availableCredits}
            </span>
          </div>
          <div className="text-neutral-500">
            Operation Cost:{' '}
            <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
              {toolCost} Credit
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-indigo-500 rounded-2xl p-12 text-center cursor-pointer bg-neutral-50/50 dark:bg-neutral-850/50 transition-colors"
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
              <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Click to upload an image, or drag and drop
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Supports JPEG, PNG, and WebP (up to 15MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Preview */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-neutral-500">Original Image</span>
                  <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 aspect-video flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Original input"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Enhanced Result */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Enhanced Result
                    </span>
                    {resultUrl && (
                      <a
                        href={resultUrl}
                        download={`enhanced_${file?.name || 'image.png'}`}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                  <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 aspect-video flex items-center justify-center relative">
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt="Enhanced output"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : isProcessing ? (
                      <div className="text-center p-4">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                          {progressStage || 'Processing...'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 text-center p-4">
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
                  className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  Choose another image
                </button>
                {file && (
                  <span className="text-xs text-neutral-400">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Options & Action Controls (1 col) */}
        <div className="space-y-4 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs h-fit">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>Enhancement Options</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Processing Mode
              </label>
              <div className="space-y-1.5">
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
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      mode === opt.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={opt.id}
                      checked={mode === opt.id}
                      onChange={() => setMode(opt.id as any)}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-neutral-500">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Super-Resolution Scale
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { scale: 2, label: '2x Upscale' },
                  { scale: 4, label: '4x Ultra-HD' },
                ].map((s) => (
                  <button
                    key={s.scale}
                    type="button"
                    onClick={() => setScale(s.scale)}
                    className={`py-2 px-3 rounded-xl font-semibold border text-center transition-all ${
                      scale === s.scale
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={handleEnhance}
              disabled={!file || isProcessing || isOutOfCredits}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                !file || isOutOfCredits
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enhance Image (1 Credit)</span>
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
