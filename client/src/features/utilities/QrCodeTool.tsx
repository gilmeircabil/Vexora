import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { DownloadButton } from '../../components/common/DownloadButton.js';
import { generateQrPng, generateQrSvg } from '../../lib/calc/qr.js';
import { triggerFileDownload } from '../../lib/files/blob.js';
import { QrCode, Download, RefreshCw, AlertCircle } from 'lucide-react';

export const QrCodeTool: React.FC = () => {
  const [content, setContent] = useState('https://toolnest.org');
  const [ecc, setEcc] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [size, setSize] = useState<number>(300);
  const [darkColor, setDarkColor] = useState<string>('#000000');
  const [lightColor, setLightColor] = useState<string>('#ffffff');

  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generate = async () => {
    if (!content.trim()) {
      setPngDataUrl(null);
      setSvgString(null);
      return;
    }

    setErrorMsg(null);
    const pngRes = await generateQrPng(content, {
      errorCorrectionLevel: ecc,
      width: size,
      darkColor,
      lightColor,
    });

    const svgRes = await generateQrSvg(content, {
      errorCorrectionLevel: ecc,
      width: size,
      darkColor,
      lightColor,
    });

    if (pngRes.ok) {
      setPngDataUrl(pngRes.value);
    } else {
      setErrorMsg(pngRes.error);
    }

    if (svgRes.ok) {
      setSvgString(svgRes.value);
    }
  };

  useEffect(() => {
    generate();
  }, [content, ecc, size, darkColor, lightColor]);

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    triggerFileDownload(blob, 'qrcode.svg');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Settings & Input */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                QR Code Content (Text or URL)
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://yourwebsite.com or any text..."
                className="w-full p-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={ecc}
                  onChange={(e) => setEcc(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                >
                  <option value="L">Low (7% recovery)</option>
                  <option value="M">Medium (15% recovery)</option>
                  <option value="Q">Quartile (25% recovery)</option>
                  <option value="H">High (30% recovery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Image Resolution
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg"
                >
                  <option value="200">200 × 200 px</option>
                  <option value="300">300 × 300 px</option>
                  <option value="500">500 × 500 px</option>
                  <option value="1000">1000 × 1000 px</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Pattern Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-xs">{darkColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-xs">{lightColor}</span>
                </div>
              </div>
            </div>
          </Card>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Preview & Download */}
        <Card className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-neutral-200 inline-block">
            {pngDataUrl ? (
              <img
                src={pngDataUrl}
                alt={`QR code for ${content}`}
                className="w-64 h-64 object-contain"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-xs text-neutral-400">
                Enter content to generate code
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 w-full flex-wrap">
            <DownloadButton
              file={pngDataUrl}
              filename="qrcode.png"
              label="Download PNG"
              disabled={!pngDataUrl}
            />

            <Button variant="secondary" onClick={handleDownloadSvg} disabled={!svgString}>
              <Download className="w-4 h-4 mr-2" />
              Download Vector SVG
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
