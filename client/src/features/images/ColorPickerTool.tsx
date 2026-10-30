import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { FileDropZone } from '../../components/common/FileDropZone.js';
import {
  parseHexColor,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  type RgbColor,
  type HslColor,
} from '../../lib/calc/colors.js';
import { createTrackedBlobUrl, revokeTrackedBlobUrl } from '../../lib/files/blob.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { Pipette, UploadCloud } from 'lucide-react';

export const ColorPickerTool: React.FC = () => {
  const [rgb, setRgb] = useState<RgbColor>({ r: 79, g: 70, b: 229, a: 1 }); // Indigo 600
  const [hexInput, setHexInput] = useState<string>('#4F46E5');
  const [hsl, setHsl] = useState<HslColor>(rgbToHsl({ r: 79, g: 70, b: 229, a: 1 }));

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      revokeTrackedBlobUrl(imageUrl);
    };
  }, [imageUrl]);

  const updateColorFromRgb = (newRgb: RgbColor) => {
    setRgb(newRgb);
    setHexInput(rgbToHex(newRgb));
    setHsl(rgbToHsl(newRgb));
  };

  const handleHexChange = (val: string) => {
    setHexInput(val);
    const parsed = parseHexColor(val);
    if (parsed.ok) {
      setRgb(parsed.value);
      setHsl(rgbToHsl(parsed.value));
    }
  };

  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleHexChange(result.sRGBHex);
        }
      } catch {
        // User cancelled eyedropper
      }
    }
  };

  const handleImageSelected = (files: ValidatedFile[]) => {
    const file = files[0];
    if (!file) return;

    revokeTrackedBlobUrl(imageUrl);
    const url = createTrackedBlobUrl(file.file);
    setImageUrl(url);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = url;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel && pixel.length >= 3) {
      updateColorFromRgb({
        r: pixel[0]!,
        g: pixel[1]!,
        b: pixel[2]!,
        a: pixel[3] !== undefined ? Number((pixel[3] / 255).toFixed(2)) : 1,
      });
    }
  };

  const hasNativeEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  return (
    <div className="space-y-8">
      {/* Main color selector card */}
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Color preview swatch */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-full h-48 rounded-2xl shadow-inner border border-neutral-200 dark:border-neutral-800 transition-colors"
            style={{ backgroundColor: rgbToHex(rgb) }}
          />

          <div className="flex items-center gap-3 w-full">
            <input
              type="color"
              value={rgbToHex(rgb).slice(0, 7)}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              title="Native color picker"
            />
            {hasNativeEyeDropper && (
              <Button variant="secondary" onClick={handleEyeDropper} className="flex-1">
                <Pipette className="w-4 h-4 mr-2" />
                Screen Eyedropper
              </Button>
            )}
          </div>
        </div>

        {/* Formats and Copy Buttons */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              HEX Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                className="flex-1 font-mono text-sm px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
              />
              <CopyButton value={hexInput} label="Copy HEX" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              RGB Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                className="flex-1 font-mono text-sm px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400"
              />
              <CopyButton value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} label="Copy RGB" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              HSL Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                className="flex-1 font-mono text-sm px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400"
              />
              <CopyButton value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} label="Copy HSL" />
            </div>
          </div>
        </div>
      </Card>

      {/* Image color sampler section */}
      <Card className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Pick Color from an Image
          </h3>
          <p className="text-xs text-neutral-500">
            Upload an image to click and sample any pixel directly with HTML5 Canvas.
          </p>
        </div>

        {!imageUrl ? (
          <FileDropZone
            allowedKinds={['png', 'jpeg', 'webp', 'bmp']}
            onFilesSelected={handleImageSelected}
            description="Drop an image here to sample colors"
          />
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-neutral-500">
              <span>Click anywhere on the image below to sample color</span>
              <button onClick={() => setImageUrl(null)} className="text-indigo-600 hover:underline">
                Change image
              </button>
            </div>
            <div className="max-h-96 overflow-auto border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-100 dark:bg-neutral-950 flex justify-center p-2">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full cursor-crosshair rounded"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
