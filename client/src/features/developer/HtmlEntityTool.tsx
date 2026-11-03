import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { encodeHtmlEntities, decodeHtmlEntities } from '../../lib/dev/entities.js';
import { Trash2 } from 'lucide-react';

export const HtmlEntityTool: React.FC = () => {
  const [plain, setPlain] = useState('<div class="hero">© 2026 VexoraMods & "Friends"</div>');
  const [encoded, setEncoded] = useState(() =>
    encodeHtmlEntities('<div class="hero">© 2026 VexoraMods & "Friends"</div>', {
      mode: 'special',
    }),
  );
  const [mode, setMode] = useState<'special' | 'nonAscii' | 'extensive'>('special');

  const handlePlainChange = (val: string) => {
    setPlain(val);
    setEncoded(encodeHtmlEntities(val, { mode }));
  };

  const handleEncodedChange = (val: string) => {
    setEncoded(val);
    setPlain(decodeHtmlEntities(val));
  };

  const handleModeChange = (newMode: 'special' | 'nonAscii' | 'extensive') => {
    setMode(newMode);
    setEncoded(encodeHtmlEntities(plain, { mode: newMode }));
  };

  return (
    <div className="space-y-6">
      {/* Settings Bar */}
      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
            Encoding Scope
          </h3>
          <p className="text-xs text-neutral-500">
            Select which characters to replace with HTML character references.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Button
            variant={mode === 'special' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleModeChange('special')}
          >
            Critical XML/HTML (&lt;, &gt;, &amp;, &quot;)
          </Button>
          <Button
            variant={mode === 'nonAscii' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleModeChange('nonAscii')}
          >
            Non-ASCII Characters
          </Button>
          <Button
            variant={mode === 'extensive' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleModeChange('extensive')}
          >
            Extensive Named Entities
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Decoded Plain HTML */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Unescaped Plain Text / Markup
            </span>
            <div className="flex items-center gap-2">
              <CopyButton value={plain} label="Copy Plain" size="sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPlain('');
                  setEncoded('');
                }}
                disabled={!plain}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            </div>
          </div>
          <textarea
            rows={12}
            value={plain}
            onChange={(e) => handlePlainChange(e.target.value)}
            placeholder="Type or paste HTML markup or text with special characters..."
            className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </Card>

        {/* Encoded HTML Entities */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Encoded HTML Entities
            </span>
            <CopyButton value={encoded} label="Copy Entities" size="sm" />
          </div>
          <textarea
            rows={12}
            value={encoded}
            onChange={(e) => handleEncodedChange(e.target.value)}
            placeholder="Paste HTML entities to decode..."
            className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </Card>
      </div>
    </div>
  );
};
