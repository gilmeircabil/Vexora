import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import type { Canvas, FabricImage } from 'fabric';
import { useAuth } from '../../context/AuthContext.js';
import { addImageFromUrl } from './canvasUtils.js';

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: Canvas | null;
  selectedImage: FabricImage | null;
}

export const AIToolsModal: React.FC<AIToolsModalProps> = ({
  isOpen,
  onClose,
  canvas,
  selectedImage,
}) => {
  const { user } = useAuth();

  const [mode, setMode] = useState<'enhance' | 'denoise' | 'restore_faces' | 'sharpen'>('enhance');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (!canvas) return;

    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let imageBlob: Blob;

      if (selectedImage) {
        // Export selected image element
        const dataUrl = selectedImage.toDataURL({});
        const res = await fetch(dataUrl);
        imageBlob = await res.blob();
      } else {
        // Render canvas area as input
        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
        const res = await fetch(dataUrl);
        imageBlob = await res.blob();
      }

      const token = localStorage.getItem('tn_token');
      const formData = new FormData();
      formData.append('image', imageBlob, 'design_source.png');
      formData.append('mode', mode);
      formData.append('toolId', 'ai-image-enhancer');

      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI enhancement processing failed.');
      }

      // Add the resulting enhanced image to canvas
      const outputUrl = data.data?.outputUrl;
      if (outputUrl) {
        if (selectedImage) {
          // Replace selected image on canvas
          const left = selectedImage.left;
          const top = selectedImage.top;
          const scaleX = selectedImage.scaleX;
          const scaleY = selectedImage.scaleY;

          canvas.remove(selectedImage);
          const newImg = await addImageFromUrl(canvas, outputUrl, {
            left,
            top,
            scaleX,
            scaleY,
          });
          canvas.setActiveObject(newImg);
        } else {
          // Add as new layer
          await addImageFromUrl(canvas, outputUrl);
        }
      }

      setSuccessMsg('AI enhancement completed successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('AI operation error:', err);
      setError(err.message || 'AI processing encountered an issue.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl border-4 border-black p-6 shadow-[8px_8px_0px_#000000]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FACC15] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">AI Studio Magic</h3>
              <p className="text-xs font-semibold text-gray-600">
                Enhance clarity, sharpen details, and denoise imagery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Free Editing Disclaimer */}
        <div className="my-3 p-2.5 bg-emerald-50 border-2 border-emerald-600 rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <p className="text-[11px] font-bold text-emerald-800">
            VexoraMods Studio and AI Magic tools are 100% FREE and open-source.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-100 border-2 border-red-500 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-3 bg-green-100 border-2 border-green-600 rounded-xl text-xs font-bold text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Target Indicator */}
        <div className="py-2">
          <div className="text-xs font-black uppercase text-black mb-1.5">Processing Target</div>
          <div className="p-3 bg-white rounded-xl border-2 border-black flex items-center gap-2.5">
            <ImageIcon className="w-4 h-4 text-[#EA580C]" />
            <span className="text-xs font-bold text-black">
              {selectedImage ? 'Selected image element on canvas' : 'Current canvas frame snapshot'}
            </span>
          </div>
        </div>

        {/* Enhancement Mode Picker */}
        <div className="py-2">
          <label className="block text-xs font-black uppercase text-black mb-1.5">
            Enhancement Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'enhance', name: 'Smart Enhance', desc: 'Auto color & dynamic range' },
              { id: 'sharpen', name: 'Sharpen Details', desc: 'Crisp edges & textures' },
              { id: 'denoise', name: 'Denoise Artifacts', desc: 'Smooth out low-light noise' },
              { id: 'restore_faces', name: 'Face Restoration', desc: 'Enhance portrait faces' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id as any)}
                className={`p-2.5 rounded-xl border-2 border-black text-left transition-all ${
                  mode === m.id
                    ? 'bg-[#FACC15] shadow-[2px_2px_0px_#000000]'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="font-black text-xs text-black">{m.name}</div>
                <div className="text-[10px] text-gray-600 font-semibold">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="mt-3 p-3 rounded-xl border-2 border-black bg-white flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-600">Platform Edition</div>
            <div className="text-sm font-black text-black">100% Free & Unlimited</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-600">Access</div>
            <div className="text-sm font-black text-emerald-600">Free / Uncapped</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t-2 border-black flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border-2 border-black font-bold text-sm bg-white hover:bg-gray-100 text-black transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border-2 border-black font-black text-sm bg-[#FACC15] text-black shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Apply AI Magic
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
