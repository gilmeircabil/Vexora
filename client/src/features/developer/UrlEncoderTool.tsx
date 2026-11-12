import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { encodeUrl, decodeUrl } from '../../lib/dev/url.js';
import { AlertCircle, Trash2 } from 'lucide-react';

export const UrlEncoderTool: React.FC = () => {
  const [plain, setPlain] = useState(
    'https://vexoramods.org/search?q=free tools & local-first=yes!',
  );
  const [encoded, setEncoded] = useState(() =>
    encodeUrl('https://vexoramods.org/search?q=free tools & local-first=yes!', 'component'),
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePlainChange = (val: string) => {
    setPlain(val);
    setErrorMsg(null);
    setEncoded(encodeUrl(val, 'component'));
  };

  const handleEncodedChange = (val: string) => {
    setEncoded(val);
    setErrorMsg(null);
    const res = decodeUrl(val, 'component');
    if (res.ok) {
      setPlain(res.value);
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Decoded input */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Decoded / Plain URL
            </span>
            <div className="flex items-center gap-2">
              <CopyButton value={plain} label="Copy Decoded" size="sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPlain('');
                  setEncoded('');
                  setErrorMsg(null);
                }}
                disabled={!plain}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            </div>
          </div>
          <textarea
            rows={10}
            value={plain}
            onChange={(e) => handlePlainChange(e.target.value)}
            placeholder="Enter standard URL or query parameters..."
            className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--theme-dirty-white)] leading-relaxed break-all"
          />
        </Card>

        {/* Encoded input */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Percent-Encoded URL Component
            </span>
            <CopyButton value={encoded} label="Copy Encoded" size="sm" />
          </div>
          <textarea
            rows={10}
            value={encoded}
            onChange={(e) => handleEncodedChange(e.target.value)}
            placeholder="Enter percent-encoded URL (e.g. %20 for space)..."
            className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--theme-dirty-white)] leading-relaxed break-all"
          />
        </Card>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
