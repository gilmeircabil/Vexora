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
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-mono font-bold text-black hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Tools
        </Link>

        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black">AI Image Enhancer</h1>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Upscale images 2x or 4x with sharp edges, artifact reduction, and enhanced details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings & Upload */}
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs font-bold text-black uppercase mb-2">
                  Upload Image
                </label>
                <label className="border-2 border-dashed border-black bg-[#FAF7F2] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50 transition-colors">
                  <UploadCloud className="w-8 h-8 text-black mb-2" />
                  <span className="text-xs font-bold text-black">Click or drag image here</span>
                  <span className="text-[11px] text-gray-500 font-mono mt-1">
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
                <label className="block font-mono text-xs font-bold text-black uppercase mb-2">
                  Upscale Factor
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[2, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`py-2 font-mono text-xs font-bold border-2 border-black ${
                        scale === s ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000]' : 'bg-white'
                      }`}
                    >
                      {s}x Resolution
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-black uppercase mb-2">
                  Enhancement Mode
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {(['enhance', 'denoise', 'restore_faces', 'sharpen'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`p-2 border border-black font-bold capitalize text-left ${
                        mode === m
                          ? 'bg-black text-white'
                          : 'bg-gray-50 text-black hover:bg-gray-100'
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
                className="w-full py-3 bg-black text-white font-mono text-sm font-bold border-2 border-black hover:bg-[#FACC15] hover:text-black transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <div className="border-2 border-black bg-gray-50 p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-gray-700 uppercase mb-2">
                  Original Image
                </span>
                <div className="flex-1 flex items-center justify-center min-h-[260px] bg-white border border-gray-200 overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Original" className="max-h-[360px] object-contain" />
                  ) : (
                    <span className="text-xs font-mono text-gray-400">No image selected</span>
                  )}
                </div>
              </div>

              <div className="border-2 border-black bg-gray-50 p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-gray-700 uppercase mb-2">
                  Enhanced Output
                </span>
                <div className="flex-1 flex items-center justify-center min-h-[260px] bg-white border border-gray-200 overflow-hidden">
                  {resultUrl ? (
                    <img src={resultUrl} alt="Enhanced" className="max-h-[360px] object-contain" />
                  ) : (
                    <span className="text-xs font-mono text-gray-400">Result will appear here</span>
                  )}
                </div>
                {resultUrl && (
                  <a
                    href={resultUrl}
                    download="enhanced-image.png"
                    className="mt-3 w-full py-2 bg-[#FACC15] text-black font-mono text-xs font-bold border border-black flex items-center justify-center gap-2 hover:bg-yellow-400"
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
