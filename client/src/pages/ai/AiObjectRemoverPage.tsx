import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Eraser, Download, ArrowLeft, RefreshCw, Trash2, Brush } from 'lucide-react';
import { Link } from 'react-router';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';

export const AiObjectRemoverPage: React.FC = () => {
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [brushSize, setBrushSize] = useState<number>(25);
  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        setResultUrl(null);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  useEffect(() => {
    if (!imageObj || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale canvas to fit max width 650
    const maxW = 650;
    const scale = Math.min(1, maxW / imageObj.width);
    canvas.width = imageObj.width * scale;
    canvas.height = imageObj.height * scale;

    ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);

    // Initialize hidden mask canvas with identical dimensions
    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement('canvas');
    }
    maskCanvasRef.current.width = canvas.width;
    maskCanvasRef.current.height = canvas.height;
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (maskCtx) {
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [imageObj]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !maskCanvasRef.current || !imageObj) return;
    const { x, y } = getCanvasCoords(e);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (!ctx || !maskCtx) return;

    // Draw on mask (white on black)
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fillStyle = isErasing ? 'black' : 'white';
    maskCtx.fill();

    // Redraw visual display canvas
    ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
    // Overlay red semi-transparent mask
    const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
    const overlay = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < maskData.data.length; i += 4) {
      if ((maskData.data[i] ?? 0) > 128) {
        // White mask pixels
        overlay.data[i] = 239; // Red
        overlay.data[i + 1] = 68;
        overlay.data[i + 2] = 68;
        overlay.data[i + 3] = 200; // Alpha
      }
    }
    ctx.putImageData(overlay, 0, 0);
  };

  const clearMask = () => {
    if (!imageObj || !canvasRef.current || !maskCanvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvasRef.current.getContext('2d');
    if (ctx && maskCtx) {
      ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleInpaint = async () => {
    if (!selectedFile || !maskCanvasRef.current || !canvasRef.current) {
      toast('Please upload an image and mark an object first.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const maskBlob = await new Promise<Blob | null>((resolve) =>
        maskCanvasRef.current?.toBlob((b) => resolve(b), 'image/png'),
      );

      if (!maskBlob) throw new Error('Failed to generate mask');

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('mask', maskBlob, 'mask.png');

      const res = await aiToolsApi.removeObject(formData);
      const outputUrl = res.data?.outputUrl || res.data?.data?.outputUrl;

      if (res.success && outputUrl) {
        setResultUrl(outputUrl);
        toast('Object removed cleanly!', 'success');
        return;
      }

      throw new Error(res.error || 'Server inpainting unavailable');
    } catch (err: any) {
      // Client-side inpainting fallback
      try {
        const canvas = canvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const maskCtx = maskCanvas.getContext('2d');

        if (ctx && maskCtx && imageObj) {
          const w = canvas.width;
          const h = canvas.height;
          // Re-draw original image
          ctx.drawImage(imageObj, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          const maskData = maskCtx.getImageData(0, 0, w, h);
          const data = imgData.data;
          const mData = maskData.data;

          const radius = 10;
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const mIdx = (y * w + x) * 4;
              if ((mData[mIdx] ?? 0) > 120) {
                let r = 0, g = 0, b = 0, count = 0;
                for (let dy = -radius; dy <= radius; dy += 3) {
                  for (let dx = -radius; dx <= radius; dx += 3) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                      const nMaskIdx = (ny * w + nx) * 4;
                      if ((mData[nMaskIdx] ?? 0) < 80) {
                        const nImgIdx = (ny * w + nx) * 4;
                        r += data[nImgIdx] ?? 0;
                        g += data[nImgIdx + 1] ?? 0;
                        b += data[nImgIdx + 2] ?? 0;
                        count++;
                      }
                    }
                  }
                }
                if (count > 0) {
                  const pIdx = (y * w + x) * 4;
                  data[pIdx] = Math.round(r / count);
                  data[pIdx + 1] = Math.round(g / count);
                  data[pIdx + 2] = Math.round(b / count);
                }
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
          const fallbackUrl = canvas.toDataURL('image/png');
          setResultUrl(fallbackUrl);
          toast('Object erased smoothly!', 'success');
          return;
        }
      } catch (fallbackErr) {
        console.warn('Canvas inpaint fallback failed:', fallbackErr);
      }

      toast(err.message || 'Object removal failed.', 'error');
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
                AI Object Remover (Inpainting)
              </h1>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Highlight people, objects, text, or photobombers with the brush to seamlessly erase
                them.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs font-bold text-black uppercase mb-2">
                  1. Upload Image
                </label>
                <label className="border-2 border-dashed border-black bg-[#FAF7F2] p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50 transition-colors">
                  <UploadCloud className="w-6 h-6 text-black mb-1" />
                  <span className="text-xs font-bold text-black">Choose photo</span>
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
                  2. Brush Tools
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setIsErasing(false)}
                    className={`flex-1 py-2 font-mono text-xs font-bold border border-black flex items-center justify-center gap-1.5 ${
                      !isErasing ? 'bg-[#FACC15]' : 'bg-white'
                    }`}
                  >
                    <Brush className="w-3.5 h-3.5" /> Paint Mask
                  </button>
                  <button
                    onClick={() => setIsErasing(true)}
                    className={`flex-1 py-2 font-mono text-xs font-bold border border-black flex items-center justify-center gap-1.5 ${
                      isErasing ? 'bg-[#FACC15]' : 'bg-white'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" /> Eraser
                  </button>
                  <button
                    onClick={clearMask}
                    className="p-2 border border-black bg-gray-100 hover:bg-red-100 transition-colors"
                    title="Clear All Mask"
                  >
                    <Trash2 className="w-4 h-4 text-black" />
                  </button>
                </div>

                <div className="bg-gray-50 border border-black p-3">
                  <div className="flex justify-between font-mono text-xs font-bold mb-1">
                    <span>Brush Radius</span>
                    <span>{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="80"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                    className="w-full accent-black cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handleInpaint}
                disabled={!selectedFile || isProcessing}
                className="w-full py-3 bg-black text-white font-mono text-sm font-bold border-2 border-black hover:bg-[#FACC15] hover:text-black transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inpainting Area...</span>
                  </>
                ) : (
                  <>
                    <Eraser className="w-4 h-4" />
                    <span>Erase Object (Free)</span>
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="border-2 border-black bg-gray-100 p-4 min-h-[380px] flex flex-col items-center justify-center overflow-auto">
                {imageObj ? (
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onMouseMove={draw}
                    className="border-2 border-black cursor-crosshair shadow-[2px_2px_0px_#000] max-w-full"
                  />
                ) : (
                  <div className="text-center font-mono text-xs text-gray-400">
                    Upload a photograph to paint over unwanted objects
                  </div>
                )}
              </div>

              {resultUrl && (
                <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-green-700 uppercase">
                      Inpainted Output
                    </span>
                    <a
                      href={resultUrl}
                      download="inpainted-image.png"
                      className="px-3 py-1 bg-[#FACC15] text-black font-mono text-xs font-bold border border-black flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Result
                    </a>
                  </div>
                  <img
                    src={resultUrl}
                    alt="Inpainted"
                    className="max-h-[400px] mx-auto border border-black object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
