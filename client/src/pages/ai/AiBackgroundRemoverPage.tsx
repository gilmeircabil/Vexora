import React, { useState } from 'react';
import { UploadCloud, Scissors, Download, ArrowLeft, RefreshCw, Pipette } from 'lucide-react';
import { Link } from 'react-router';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';

export const AiBackgroundRemoverPage: React.FC = () => {
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [customHex, setCustomHex] = useState<string>('#FFFFFF');
  const [isProcessing, setIsProcessing] = useState(false);

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
      if (bgColor === 'custom') {
        formData.append('bgColor', customHex);
      } else if (bgColor !== 'transparent') {
        formData.append('bgColor', bgColor);
      }

      const res = await aiToolsApi.removeBackground(formData);
      if (res.success && res.data?.outputUrl) {
        setResultUrl(res.data.outputUrl);
        toast('Background removed successfully!', 'success');
      } else {
        throw new Error(res.error || 'Background removal failed');
      }
    } catch (err: any) {
      toast(err.message || 'Background removal failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/ai-tools" className="inline-flex items-center gap-2 text-sm font-mono font-bold text-black hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to AI Tools
        </Link>

        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4 mb-6">
            <div>
              <div className="inline-block bg-[#22C55E]/20 text-green-900 border border-green-800 font-mono text-xs font-bold px-2 py-0.5 mb-2">
                100% FREE
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black">AI Background Remover</h1>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Automatically isolate foreground subjects and export crisp transparent PNGs or custom color backgrounds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs font-bold text-black uppercase mb-2">Upload Image</label>
                <label className="border-2 border-dashed border-black bg-[#FAF7F2] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50 transition-colors">
                  <UploadCloud className="w-8 h-8 text-black mb-2" />
                  <span className="text-xs font-bold text-black">Upload photo</span>
                  <span className="text-[11px] text-gray-500 font-mono mt-1">PNG, JPG, WebP</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-black uppercase mb-2">Background Finish</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setBgColor('transparent')}
                    className={`py-2 px-1 text-xs font-mono font-bold border-2 border-black ${
                      bgColor === 'transparent' ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000]' : 'bg-white'
                    }`}
                  >
                    Transparent
                  </button>
                  <button
                    onClick={() => setBgColor('#FFFFFF')}
                    className={`py-2 px-1 text-xs font-mono font-bold border-2 border-black ${
                      bgColor === '#FFFFFF' ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000]' : 'bg-white'
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => setBgColor('custom')}
                    className={`py-2 px-1 text-xs font-mono font-bold border-2 border-black ${
                      bgColor === 'custom' ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000]' : 'bg-white'
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
                      className="w-10 h-10 border border-black cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="flex-1 px-3 py-2 border border-black font-mono text-xs uppercase"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleProcess}
                disabled={!selectedFile || isProcessing}
                className="w-full py-3 bg-black text-white font-mono text-sm font-bold border-2 border-black hover:bg-[#FACC15] hover:text-black transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Removing Background...</span>
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
              <div className="border-2 border-black bg-gray-50 p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-gray-700 uppercase mb-2">Original</span>
                <div className="flex-1 flex items-center justify-center min-h-[260px] bg-white border border-gray-200 overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Original" className="max-h-[360px] object-contain" />
                  ) : (
                    <span className="text-xs font-mono text-gray-400">No image uploaded</span>
                  )}
                </div>
              </div>

              <div className="border-2 border-black bg-gray-50 p-4 flex flex-col justify-between">
                <span className="font-mono text-xs font-bold text-gray-700 uppercase mb-2">Background Removed</span>
                <div
                  className="flex-1 flex items-center justify-center min-h-[260px] border border-gray-200 overflow-hidden"
                  style={{
                    backgroundImage:
                      bgColor === 'transparent'
                        ? 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)'
                        : 'none',
                    backgroundSize: '20px 20px',
                    backgroundColor: bgColor === 'transparent' ? '#FFFFFF' : bgColor === 'custom' ? customHex : bgColor,
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
                    className="mt-3 w-full py-2 bg-[#FACC15] text-black font-mono text-xs font-bold border border-black flex items-center justify-center gap-2 hover:bg-yellow-400"
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
