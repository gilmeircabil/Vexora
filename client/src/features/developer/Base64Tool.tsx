import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { FileDropZone } from '../../components/common/FileDropZone.js';
import { encodeBase64Text, decodeBase64Text, encodeBase64Bytes } from '../../lib/dev/base64.js';
import { type ValidatedFile } from '../../lib/files/validator.js';
import { formatBytes } from '../../lib/format.js';
import { AlertCircle, FileCode } from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'file'>('text');

  // Text mode state
  const [plainText, setPlainText] = useState(
    'VexoraMods — private, local-first tools for everyone.',
  );
  const [base64Text, setBase64Text] = useState(() =>
    encodeBase64Text('VexoraMods — private, local-first tools for everyone.'),
  );
  const [textError, setTextError] = useState<string | null>(null);

  // File mode state
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileDataUri, setFileDataUri] = useState<string>('');
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    name: string;
    size: number;
    mime: string;
  } | null>(null);

  const handlePlainTextChange = (val: string) => {
    setPlainText(val);
    setTextError(null);
    setBase64Text(encodeBase64Text(val));
  };

  const handleBase64TextChange = (val: string) => {
    setBase64Text(val);
    setTextError(null);
    const res = decodeBase64Text(val);
    if (res.ok) {
      setPlainText(res.value);
    } else {
      setTextError(res.error);
    }
  };

  const handleFileSelected = async (files: ValidatedFile[]) => {
    const item = files[0];
    if (!item) return;

    try {
      const buffer = await item.file.arrayBuffer();
      const b64 = encodeBase64Bytes(buffer);
      const mime = item.file.type || 'application/octet-stream';
      const dataUri = `data:${mime};base64,${b64}`;

      setFileBase64(b64);
      setFileDataUri(dataUri);
      setUploadedFileInfo({
        name: item.file.name,
        size: item.file.size,
        mime,
      });
    } catch {
      setTextError('Failed to read file into Base64.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <Button
          variant={mode === 'text' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setMode('text')}
        >
          Text (UTF-8) Encoder / Decoder
        </Button>
        <Button
          variant={mode === 'file' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setMode('file')}
        >
          Binary File to Base64 Data URI
        </Button>
      </div>

      {mode === 'text' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plain Text Input */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                UTF-8 Plain Text
              </span>
              <CopyButton value={plainText} label="Copy Text" size="sm" />
            </div>
            <textarea
              rows={12}
              value={plainText}
              onChange={(e) => handlePlainTextChange(e.target.value)}
              placeholder="Enter plain text..."
              className="w-full p-3 font-sans text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </Card>

          {/* Base64 Text Output */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Base64 String
              </span>
              <CopyButton value={base64Text} label="Copy Base64" size="sm" />
            </div>
            <textarea
              rows={12}
              value={base64Text}
              onChange={(e) => handleBase64TextChange(e.target.value)}
              placeholder="Enter Base64 to decode..."
              className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed break-all"
            />
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {!fileBase64 ? (
            <FileDropZone
              onFilesSelected={handleFileSelected}
              maxBytes={10 * 1024 * 1024}
              description="Drop any image or small binary file (up to 10 MB) to encode as Base64 Data URI"
            />
          ) : (
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    {uploadedFileInfo?.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {formatBytes(uploadedFileInfo?.size || 0)} · {uploadedFileInfo?.mime}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFileBase64('');
                    setFileDataUri('');
                    setUploadedFileInfo(null);
                  }}
                >
                  Convert Another File
                </Button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Data URI (for HTML & CSS img src)
                  </span>
                  <CopyButton value={fileDataUri} label="Copy Data URI" size="sm" />
                </div>
                <textarea
                  rows={4}
                  readOnly
                  value={fileDataUri}
                  className="w-full p-3 font-mono text-xs bg-neutral-900 text-neutral-100 rounded-xl border border-neutral-800 break-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Raw Base64 Payload
                  </span>
                  <CopyButton value={fileBase64} label="Copy Raw Base64" size="sm" />
                </div>
                <textarea
                  rows={4}
                  readOnly
                  value={fileBase64}
                  className="w-full p-3 font-mono text-xs bg-neutral-900 text-neutral-100 rounded-xl border border-neutral-800 break-all"
                />
              </div>
            </Card>
          )}
        </div>
      )}

      {textError && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{textError}</span>
        </div>
      )}
    </div>
  );
};
