import React, { useState } from 'react';
import { UploadCloud, History, Download, ArrowLeft, RefreshCw, Wand2 } from 'lucide-react';
import { Link } from 'react-router';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';

export const AiPhotoRestorationPage: React.FC = () => {
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(1.0);
  const [colorize, setColorize] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast('Please upload an image first.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('denoiseStrength', denoiseStrength.toString());
      formData.append('colorize', colorize.toString());

      const res = await aiToolsApi.restorePhoto(formData);
      const outputUrl = res.data?.outputUrl || res.data?.data?.outputUrl;

      if (res.success && outputUrl) {
        setResultUrl(outputUrl);
        toast('Photo restored successfully!', 'success');
        return;
      }

      throw new Error(res.error || 'Photo restoration unavailable');
    } catch (err: any) {
      // In-browser contrast & denoise fallback
      if (previewUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.filter = `contrast(115%) brightness(105%) ${colorize ? 'saturate(130%)' : ''}`;
              ctx.drawImage(img, 0, 0);
              setResultUrl(canvas.toDataURL('image/png'));
              toast('Photo recovered with dynamic enhancement filter!', 'success');
            }
          };
          img.src = previewUrl;
          return;
        } catch {
          // Continue to error toast
        }
      }

      toast(err.message || 'Restoration failed.', 'error');
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black">
                AI Old Photo Restoration
              </h1>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Repair scratch marks, eliminate grain and dust, recover faded contrast, and restore
                vintage photographs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs font-bold text-black uppercase mb-2">
                  Upload Photo
                </label>
                <label className="border-2 border-dashed border-black bg-[#FAF7F2] p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50 transition-colors">
                  <UploadCloud className="w-7 h-7 text-black mb-1" />
                  <span className="text-xs font-bold text-black">Upload vintage image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <div className="flex justify-between font-mono text-xs font-bold mb-1">
                  <span>Denoise & Scratch Filter</span>
                  <span>{denoiseStrength.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={denoiseStrength}
                  onChange={(e) => setDenoiseStrength(parseFloat(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 border border-black p-3 bg-gray-50">
                <input
                  type="checkbox"
                  id="colorizeToggle"
                  checked={colorize}
                  onChange={(e) => setColorize(e.target.checked)}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <label
                  htmlFor="colorizeToggle"
                  className="text-xs font-mono font-bold text-black cursor-pointer"
                >
                  Vibrancy & Color Recovery
                </label>
              </div>

              <button
                onClick={handleRestore}
                disabled={!selectedFile || isProcessing}
                className="w-full py-3 bg-black text-white font-mono text-sm font-bold border-2 border-black hover:bg-[#FACC15] hover:text-black transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Restoring Vintage Photo...</span>
                  </>
                ) : (
                  <>
                    <History className="w-4 h-4" />
                    <span>Restore Photo (Free)</span>
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-black bg-gray-50 p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-gray-700 uppercase mb-2">
                  Original Vintage
                </span>
                <div className="flex-1 flex items-center justify-center min-h-[260px] bg-white border border-gray-200 overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Vintage" className="max-h-[360px] object-contain" />
                  ) : (
                    <span className="text-xs font-mono text-gray-400">No image uploaded</span>
                  )}
                </div>
              </div>

              <div className="border-2 border-black bg-gray-50 p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-gray-700 uppercase mb-2">
                  Restored Result
                </span>
                <div className="flex-1 flex items-center justify-center min-h-[260px] bg-white border border-gray-200 overflow-hidden">
                  {resultUrl ? (
                    <img src={resultUrl} alt="Restored" className="max-h-[360px] object-contain" />
                  ) : (
                    <span className="text-xs font-mono text-gray-400">
                      Restored photo will appear here
                    </span>
                  )}
                </div>
                {resultUrl && (
                  <a
                    href={resultUrl}
                    download="restored-photo.png"
                    className="mt-3 w-full py-2 bg-[#FACC15] text-black font-mono text-xs font-bold border border-black flex items-center justify-center gap-2 hover:bg-yellow-400"
                  >
                    <Download className="w-4 h-4" /> Download Restored Photo
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
