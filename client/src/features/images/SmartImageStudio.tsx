import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Scissors,
  Eraser,
  Wand2,
  FileText,
  Minimize2,
  Download,
  RotateCcw,
  UploadCloud,
  Check,
  Copy,
  Sliders,
  Layers,
  ArrowRight,
  Eye,
  Columns,
  Maximize2
} from 'lucide-react';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';
import { useNavigate } from 'react-router';

export type SmartOperation =
  | 'enhance'
  | 'background'
  | 'inpaint'
  | 'restore'
  | 'compress'
  | 'ocr';

interface SmartImageStudioProps {
  initialFile?: File | null;
  onSendToStudio?: (dataUrl: string) => void;
}

export const SmartImageStudio: React.FC<SmartImageStudioProps> = ({
  initialFile = null,
  onSendToStudio,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Active operation
  const [activeOp, setActiveOp] = useState<SmartOperation>('enhance');

  // Image State
  const [file, setFile] = useState<File | null>(initialFile);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; size: string; name: string } | null>(null);

  // In-progress state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  // Before/After comparison slider
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [compareMode, setCompareMode] = useState<'slider' | 'side-by-side' | 'result-only'>('slider');

  // 1. Enhance parameters
  const [scale, setScale] = useState<number>(2);
  const [enhanceMode, setEnhanceMode] = useState<'enhance' | 'sharpen' | 'restore_faces' | 'denoise'>('enhance');

  // 2. Background parameters
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [customHex, setCustomHex] = useState<string>('#FFFFFF');

  // 3. Object eraser parameters
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // 4. Restore parameters
  const [denoiseStrength, setDenoiseStrength] = useState<number>(1.0);
  const [autoColorize, setAutoColorize] = useState<boolean>(false);

  // 5. Compress & Convert parameters
  const [targetFormat, setTargetFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [targetQuality, setTargetQuality] = useState<number>(85);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);

  // 6. OCR parameters
  const [extractedText, setExtractedText] = useState<string>('');
  const [hasCopied, setHasCopied] = useState(false);

  // Handle file ingestion
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setResultUrl(null);
      setExtractedText('');
      setCompressedBlob(null);

      const img = new Image();
      img.onload = () => {
        setImageMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          name: file.name,
        });
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Setup Mask Canvas when entering Inpaint mode
  useEffect(() => {
    if (activeOp === 'inpaint' && originalUrl) {
      const img = new Image();
      img.onload = () => {
        const c = canvasRef.current;
        const mc = maskCanvasRef.current;
        if (c && mc) {
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          mc.width = img.naturalWidth;
          mc.height = img.naturalHeight;

          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
          const mctx = mc.getContext('2d');
          if (mctx) {
            mctx.fillStyle = '#000000';
            mctx.fillRect(0, 0, mc.width, mc.height);
          }
        }
      };
      img.src = originalUrl;
    }
  }, [activeOp, originalUrl]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    } else {
      toast('Please drop an image file (PNG, JPG, WebP).', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (chosen) setFile(chosen);
  };

  // Quick sample images so the user can test immediately with zero friction
  const loadSampleImage = (type: 'portrait' | 'landscape' | 'graphic') => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'portrait') {
      const grad = ctx.createLinearGradient(0, 0, 900, 600);
      grad.addColorStop(0, '#FACC15');
      grad.addColorStop(1, '#F97316');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 900, 600);

      // Face silhouette
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.arc(450, 240, 110, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.ellipse(450, 520, 200, 150, 0, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText('PORTRAIT SAMPLE FOR ENHANCE & BG REMOVAL', 450, 100);
    } else if (type === 'landscape') {
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(0, 0, 900, 350);
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(0, 350, 900, 250);

      // Sun
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(700, 150, 60, 0, Math.PI * 2);
      ctx.fill();

      // Mountains
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(100, 350);
      ctx.lineTo(300, 180);
      ctx.lineTo(500, 350);
      ctx.fill();
    } else {
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, 900, 600);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, 820, 520);

      ctx.fillStyle = '#000000';
      ctx.font = '900 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VEXORAMODS SMART STUDIO', 450, 280);

      ctx.font = '600 24px monospace';
      ctx.fillText('OCR & INPAINTING TEST SPECIMEN', 450, 340);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const sampleFile = new File([blob], `sample_${type}.png`, { type: 'image/png' });
        setFile(sampleFile);
      }
    }, 'image/png');
  };

  // --------------------------------------------------------------------------
  // Execution Dispatcher
  // --------------------------------------------------------------------------
  const executeOperation = async () => {
    if (!file) {
      toast('Upload an image to start processing.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      if (activeOp === 'enhance') {
        setProgressStatus(`Enhancing image (${scale}x super-resolution)...`);
        const fd = new FormData();
        fd.append('image', file);
        fd.append('scale', scale.toString());
        fd.append('mode', enhanceMode);
        fd.append('quality', 'high');

        const res = await aiToolsApi.enhanceImage(fd);
        if (res.success && res.data?.outputUrl) {
          setResultUrl(res.data.outputUrl);
          toast('Image enhanced successfully!', 'success');
        } else {
          throw new Error(res.error || 'Enhancement failed');
        }
      } else if (activeOp === 'background') {
        setProgressStatus('Removing background with edge refinement...');
        const fd = new FormData();
        fd.append('image', file);
        if (bgColor === 'custom') {
          fd.append('bgColor', customHex);
        } else if (bgColor !== 'transparent') {
          fd.append('bgColor', bgColor);
        }

        const res = await aiToolsApi.removeBackground(fd);
        if (res.success && res.data?.outputUrl) {
          setResultUrl(res.data.outputUrl);
          toast('Background removed cleanly!', 'success');
        } else {
          throw new Error(res.error || 'Background removal failed');
        }
      } else if (activeOp === 'inpaint') {
        setProgressStatus('Inpainting masked object...');
        const mc = maskCanvasRef.current;
        if (!mc) throw new Error('Mask canvas unavailable');

        const maskBlob = await new Promise<Blob | null>((resolve) =>
          mc.toBlob((b) => resolve(b), 'image/png'),
        );

        if (!maskBlob) throw new Error('Failed to capture mask');

        const fd = new FormData();
        fd.append('image', file);
        fd.append('mask', maskBlob, 'mask.png');

        const res = await aiToolsApi.removeObject(fd);
        if (res.success && res.data?.outputUrl) {
          setResultUrl(res.data.outputUrl);
          toast('Object erased seamlessly!', 'success');
        } else {
          throw new Error(res.error || 'Object erasure failed');
        }
      } else if (activeOp === 'restore') {
        setProgressStatus('Restoring photo details and correcting tones...');
        const fd = new FormData();
        fd.append('image', file);
        fd.append('denoiseStrength', denoiseStrength.toString());
        fd.append('colorize', autoColorize.toString());

        const res = await aiToolsApi.restorePhoto(fd);
        if (res.success && res.data?.outputUrl) {
          setResultUrl(res.data.outputUrl);
          toast('Photo restoration completed!', 'success');
        } else {
          throw new Error(res.error || 'Photo restoration failed');
        }
      } else if (activeOp === 'compress') {
        setProgressStatus('Running browser-side Lanczos compression...');
        if (!originalUrl) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = originalUrl;
        await new Promise((resolve) => (img.onload = resolve));

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        ctx.drawImage(img, 0, 0);

        const qualityFraction = targetQuality / 100;
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), targetFormat, qualityFraction),
        );

        if (blob) {
          setCompressedBlob(blob);
          const compressedUrl = URL.createObjectURL(blob);
          setResultUrl(compressedUrl);
          toast(`Compressed: ${(blob.size / 1024).toFixed(0)} KB (${Math.round((1 - blob.size / file.size) * 100)}% smaller)`, 'success');
        }
      } else if (activeOp === 'ocr') {
        setProgressStatus('Extracting document text and characters...');
        const fd = new FormData();
        fd.append('file', file);

        const res = await aiToolsApi.runOcr(fd);
        if (res.success && res.data?.outputText) {
          setExtractedText(res.data.outputText);
          toast('Text recognized and extracted!', 'success');
        } else {
          throw new Error(res.error || 'OCR character extraction failed');
        }
      }
    } catch (err: any) {
      toast(err.message || 'Operation failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  // Canvas Drawing for Object Eraser
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Draw visual feedback on display canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw white mask on mask canvas
    const mctx = maskCanvas.getContext('2d');
    if (mctx) {
      mctx.fillStyle = '#FFFFFF';
      mctx.beginPath();
      mctx.arc(x, y, brushSize, 0, Math.PI * 2);
      mctx.fill();
    }
  };

  const clearMask = () => {
    if (!originalUrl) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current;
      const mc = maskCanvasRef.current;
      if (c && mc) {
        const ctx = c.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        const mctx = mc.getContext('2d');
        if (mctx) {
          mctx.fillStyle = '#000000';
          mctx.fillRect(0, 0, mc.width, mc.height);
        }
      }
    };
    img.src = originalUrl;
  };

  // Chain result as new input
  const useResultAsInput = async () => {
    if (!resultUrl) return;
    try {
      const resp = await fetch(resultUrl);
      const blob = await resp.blob();
      const newFile = new File([blob], `processed_${Date.now()}.png`, { type: 'image/png' });
      setFile(newFile);
      setResultUrl(null);
      toast('Result loaded as new input! You can apply another operation.', 'success');
    } catch {
      toast('Failed to load result as input', 'error');
    }
  };

  // Send to VexoraMods Studio
  const handleSendToDesignStudio = () => {
    const targetUrl = resultUrl || originalUrl;
    if (!targetUrl) return;

    if (onSendToStudio) {
      onSendToStudio(targetUrl);
    } else {
      localStorage.setItem('tn_import_image', targetUrl);
      navigate('/design-studio');
    }
  };

  // Download
  const handleDownload = () => {
    const url = resultUrl || originalUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `vexoramods_${activeOp}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('Download started!', 'success');
  };

  return (
    <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000000] overflow-hidden">
      {/* Studio Header Bar */}
      <div className="border-b-2 border-black bg-[#FAF7F2] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FACC15] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-black tracking-tight">Smart Image Studio</h2>
              <span className="px-2 py-0.5 rounded-md bg-[#22C55E] text-white border border-black font-mono text-[10px] font-bold">
                100% FREE
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-600">
              Enhance, erase, remove background, restore, and compress in one integrated workspace.
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        {file && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setFile(null);
                setResultUrl(null);
                setOriginalUrl(null);
              }}
              className="px-3 py-1.5 text-xs font-mono font-bold bg-white hover:bg-neutral-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replace Image</span>
            </button>

            {resultUrl && (
              <button
                onClick={useResultAsInput}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-[#A78BFA] hover:bg-[#906cf5] text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                title="Chain another operation onto this result"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Chain as Input</span>
              </button>
            )}

            <button
              onClick={handleSendToDesignStudio}
              className="px-3 py-1.5 text-xs font-mono font-bold bg-[#FACC15] hover:bg-[#EAB308] text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Design Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {!file ? (
        /* Empty State / Ingestion Dropzone */
        <div className="p-8 sm:p-12 text-center space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-black rounded-2xl bg-[#FAF7F2] p-8 sm:p-12 max-w-2xl mx-auto space-y-4 hover:bg-[#f3ede1] transition-all cursor-pointer group"
            onClick={() => document.getElementById('smart-image-upload')?.click()}
          >
            <input
              id="smart-image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8 text-black stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">
                Drop your image here or click to browse
              </h3>
              <p className="text-xs font-semibold text-neutral-600 mt-1">
                Supports PNG, JPG, WebP, AVIF up to 30 MB. Zero accounts or subscriptions needed.
              </p>
            </div>
          </div>

          {/* Quick Sample Selector */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
              Or test instantly with a sample:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => loadSampleImage('portrait')}
                className="px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-[#FACC15] text-xs font-bold font-mono shadow-[2px_2px_0px_#000] transition-colors"
              >
                👤 Portrait (Enhance / BG)
              </button>
              <button
                onClick={() => loadSampleImage('landscape')}
                className="px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-[#FACC15] text-xs font-bold font-mono shadow-[2px_2px_0px_#000] transition-colors"
              >
                🏔️ Landscape (Super-Res)
              </button>
              <button
                onClick={() => loadSampleImage('graphic')}
                className="px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-[#FACC15] text-xs font-bold font-mono shadow-[2px_2px_0px_#000] transition-colors"
              >
                📄 Graphic / Text (OCR)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Workspace */
        <div>
          {/* Operation Navigation Tabs */}
          <div className="flex border-b-2 border-black bg-[#FAF7F2] overflow-x-auto p-2 gap-2">
            {[
              { id: 'enhance' as SmartOperation, label: 'Super-Res Enhance', icon: Sparkles, color: '#FACC15' },
              { id: 'background' as SmartOperation, label: 'Remove BG', icon: Scissors, color: '#4ADE80' },
              { id: 'inpaint' as SmartOperation, label: 'Erase Object', icon: Eraser, color: '#F472B6' },
              { id: 'restore' as SmartOperation, label: 'Photo Restore', icon: Wand2, color: '#A78BFA' },
              { id: 'compress' as SmartOperation, label: 'Compress & Convert', icon: Minimize2, color: '#38BDF8' },
              { id: 'ocr' as SmartOperation, label: 'Extract OCR', icon: FileText, color: '#FB923C' },
            ].map((op) => {
              const IconComp = op.icon;
              const isActive = activeOp === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => setActiveOp(op.id)}
                  style={{ backgroundColor: isActive ? op.color : '#FFFFFF' }}
                  className={`px-3.5 py-2 rounded-xl border-2 border-black font-black text-xs flex items-center gap-2 whitespace-nowrap transition-all shadow-[2px_2px_0px_#000] ${
                    isActive ? '-translate-y-0.5' : 'hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <IconComp className="w-4 h-4 stroke-[2.5]" />
                  <span>{op.label}</span>
                </button>
              );
            })}
          </div>

          {/* Operation Controls & Canvas Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Left Control Column (4 cols) */}
            <div className="lg:col-span-4 p-5 border-b-2 lg:border-b-0 lg:border-r-2 border-black bg-white space-y-5">
              {/* Image Info Tag */}
              {imageMeta && (
                <div className="p-3 bg-[#FAF7F2] border-2 border-black rounded-xl font-mono text-xs space-y-1">
                  <div className="font-black text-black truncate">{imageMeta.name}</div>
                  <div className="text-neutral-600 flex items-center gap-3">
                    <span>{imageMeta.width} × {imageMeta.height} px</span>
                    <span>·</span>
                    <span>{imageMeta.size}</span>
                  </div>
                </div>
              )}

              {/* 1. Enhance Controls */}
              {activeOp === 'enhance' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase font-mono mb-2">
                      Super-Resolution Scale
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[2, 4].map((s) => (
                        <button
                          key={s}
                          onClick={() => setScale(s)}
                          className={`py-2 rounded-xl border-2 border-black font-mono font-black text-xs transition-all ${
                            scale === s
                              ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000]'
                              : 'bg-white hover:bg-neutral-100'
                          }`}
                        >
                          {s}× Upscale
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase font-mono mb-2">
                      Enhancement Mode
                    </label>
                    <select
                      value={enhanceMode}
                      onChange={(e) => setEnhanceMode(e.target.value as any)}
                      className="w-full p-2.5 bg-white border-2 border-black rounded-xl font-bold text-xs focus:outline-none"
                    >
                      <option value="enhance">Smart Auto Enhance (Balanced)</option>
                      <option value="sharpen">Edge Sharpness & Clarity</option>
                      <option value="restore_faces">Face & Portrait Clarity</option>
                      <option value="denoise">Noise & Grain Reduction</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 2. Background Controls */}
              {activeOp === 'background' && (
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase font-mono mb-2">
                    Replacement Backdrop
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'transparent', label: 'Transparent' },
                      { id: '#FFFFFF', label: 'Studio White' },
                      { id: '#000000', label: 'Matte Black' },
                      { id: '#FACC15', label: 'VexoraMods Yellow' },
                      { id: 'custom', label: 'Custom Color' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setBgColor(opt.id)}
                        className={`py-2 px-2.5 rounded-xl border-2 border-black font-mono font-bold text-xs text-left truncate transition-all ${
                          bgColor === opt.id
                            ? 'bg-[#4ADE80] shadow-[2px_2px_0px_#000]'
                            : 'bg-white hover:bg-neutral-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {bgColor === 'custom' && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => setCustomHex(e.target.value)}
                        className="w-10 h-10 border-2 border-black rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customHex}
                        onChange={(e) => setCustomHex(e.target.value)}
                        className="flex-1 p-2 border-2 border-black rounded-xl font-mono text-xs uppercase font-bold"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 3. Inpaint Controls */}
              {activeOp === 'inpaint' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-black uppercase font-mono mb-2">
                      <span>Brush Size</span>
                      <span>{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={80}
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>

                  <p className="text-xs font-medium text-neutral-600 bg-[#FAF7F2] p-2.5 rounded-xl border border-black/20">
                    💡 Paint red mask over unwanted elements, text, or photobombers directly on the canvas preview to erase them.
                  </p>

                  <button
                    onClick={clearMask}
                    className="w-full py-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono text-xs font-bold"
                  >
                    Clear Mask
                  </button>
                </div>
              )}

              {/* 4. Restore Controls */}
              {activeOp === 'restore' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-black uppercase font-mono mb-2">
                      <span>Denoise & Smoothing</span>
                      <span>{denoiseStrength.toFixed(1)}×</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={denoiseStrength}
                      onChange={(e) => setDenoiseStrength(parseFloat(e.target.value))}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoColorize}
                      onChange={(e) => setAutoColorize(e.target.checked)}
                      className="w-4 h-4 accent-black rounded border-2 border-black"
                    />
                    <span>Auto-balance color saturation & contrast</span>
                  </label>
                </div>
              )}

              {/* 5. Compress Controls */}
              {activeOp === 'compress' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase font-mono mb-2">
                      Target Format
                    </label>
                    <select
                      value={targetFormat}
                      onChange={(e) => setTargetFormat(e.target.value as any)}
                      className="w-full p-2.5 bg-white border-2 border-black rounded-xl font-bold text-xs focus:outline-none"
                    >
                      <option value="image/webp">WebP (Modern & Smallest Size)</option>
                      <option value="image/jpeg">JPEG (Standard Universal)</option>
                      <option value="image/png">PNG (Lossless & Alpha)</option>
                    </select>
                  </div>

                  {targetFormat !== 'image/png' && (
                    <div>
                      <div className="flex justify-between text-xs font-black uppercase font-mono mb-2">
                        <span>Quality</span>
                        <span>{targetQuality}%</span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={targetQuality}
                        onChange={(e) => setTargetQuality(parseInt(e.target.value, 10))}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>
                  )}

                  {compressedBlob && file && (
                    <div className="p-3 bg-[#4ADE80]/20 border-2 border-black rounded-xl font-mono text-xs space-y-1">
                      <div className="font-black text-black">Compression Result:</div>
                      <div>Original: {(file.size / 1024).toFixed(0)} KB</div>
                      <div className="font-bold text-green-900">
                        New: {(compressedBlob.size / 1024).toFixed(0)} KB (
                        {Math.round((1 - compressedBlob.size / file.size) * 100)}% saved)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. OCR Results */}
              {activeOp === 'ocr' && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-neutral-600">
                    Extracts typed text, document headers, codes, and paragraphs.
                  </p>

                  {extractedText && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-black uppercase">Extracted Text</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(extractedText);
                            setHasCopied(true);
                            setTimeout(() => setHasCopied(false), 2000);
                          }}
                          className="px-2 py-1 text-[11px] font-mono font-bold bg-[#FAF7F2] border border-black rounded-lg flex items-center gap-1"
                        >
                          {hasCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                          <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={extractedText}
                        rows={8}
                        className="w-full p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl font-mono text-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Run Primary Action Button */}
              <button
                onClick={executeOperation}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-black text-white hover:bg-[#FACC15] hover:text-black hover:border-black border-2 border-black rounded-xl font-mono text-xs font-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {activeOp === 'enhance' && `Run ${scale}× Upscale`}
                      {activeOp === 'background' && 'Remove Background'}
                      {activeOp === 'inpaint' && 'Erase Masked Object'}
                      {activeOp === 'restore' && 'Restore Photo'}
                      {activeOp === 'compress' && 'Compress & Convert'}
                      {activeOp === 'ocr' && 'Extract Text'}
                    </span>
                  </>
                )}
              </button>

              {progressStatus && (
                <div className="text-[11px] font-mono text-neutral-600 animate-pulse text-center">
                  {progressStatus}
                </div>
              )}

              {/* Download Result Button */}
              {resultUrl && (
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 px-4 bg-[#22C55E] text-black border-2 border-black rounded-xl font-mono text-xs font-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Download Output</span>
                </button>
              )}
            </div>

            {/* Right Canvas / Preview Column (8 cols) */}
            <div className="lg:col-span-8 p-5 bg-[#FAF7F2] flex flex-col items-center justify-center relative min-h-[460px]">
              {/* Preview Mode Switcher */}
              {resultUrl && activeOp !== 'inpaint' && (
                <div className="absolute top-4 right-4 z-10 bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_#000] flex items-center gap-1 text-xs font-mono font-bold">
                  <button
                    onClick={() => setCompareMode('slider')}
                    className={`px-2 py-1 rounded-lg ${compareMode === 'slider' ? 'bg-[#FACC15]' : 'hover:bg-neutral-100'}`}
                  >
                    Slider
                  </button>
                  <button
                    onClick={() => setCompareMode('side-by-side')}
                    className={`px-2 py-1 rounded-lg ${compareMode === 'side-by-side' ? 'bg-[#FACC15]' : 'hover:bg-neutral-100'}`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    onClick={() => setCompareMode('result-only')}
                    className={`px-2 py-1 rounded-lg ${compareMode === 'result-only' ? 'bg-[#FACC15]' : 'hover:bg-neutral-100'}`}
                  >
                    Result
                  </button>
                </div>
              )}

              {/* View 1: Inpainting Canvas Mode */}
              {activeOp === 'inpaint' ? (
                <div className="relative max-w-full max-h-[500px] overflow-auto border-2 border-black rounded-xl bg-white shadow-[4px_4px_0px_#000]">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onMouseMove={draw}
                    className="max-h-[480px] w-auto cursor-crosshair block"
                  />
                  <canvas ref={maskCanvasRef} className="hidden" />
                </div>
              ) : resultUrl ? (
                /* View 2: Result Preview with Comparison */
                <div className="w-full flex flex-col items-center justify-center">
                  {compareMode === 'slider' && originalUrl ? (
                    <div className="relative max-w-full max-h-[480px] overflow-hidden border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] select-none">
                      {/* Result Image */}
                      <img
                        src={resultUrl}
                        alt="Result"
                        className="max-h-[460px] w-auto block object-contain"
                      />

                      {/* Original Image Clipped */}
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPos}%` }}
                      >
                        <img
                          src={originalUrl}
                          alt="Original"
                          className="max-h-[460px] w-auto block object-contain"
                        />
                      </div>

                      {/* Split Divider Handle */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-black shadow-[0_0_8px_rgba(0,0,0,0.5)] cursor-ew-resize"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center font-bold text-[10px]">
                          ↔
                        </div>
                      </div>

                      {/* Slider Input Over Canvas */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPos}
                        onChange={(e) => setSliderPos(Number(e.target.value))}
                        className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                      />
                    </div>
                  ) : compareMode === 'side-by-side' && originalUrl ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                      <div className="space-y-1 text-center">
                        <span className="font-mono text-xs font-bold uppercase">Original</span>
                        <div className="border-2 border-black rounded-xl overflow-hidden bg-white">
                          <img src={originalUrl} alt="Original" className="max-h-[300px] mx-auto object-contain" />
                        </div>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="font-mono text-xs font-bold uppercase text-green-700">Processed</span>
                        <div className="border-2 border-black rounded-xl overflow-hidden bg-white">
                          <img src={resultUrl} alt="Processed" className="max-h-[300px] mx-auto object-contain" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-black rounded-xl overflow-hidden bg-white shadow-[4px_4px_0px_#000]">
                      <img src={resultUrl} alt="Output" className="max-h-[460px] w-auto block object-contain" />
                    </div>
                  )}
                </div>
              ) : (
                /* View 3: Single Original Preview */
                <div className="border-2 border-black rounded-xl overflow-hidden bg-white shadow-[4px_4px_0px_#000]">
                  {originalUrl && (
                    <img
                      src={originalUrl}
                      alt="Uploaded Preview"
                      className="max-h-[440px] w-auto block object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
