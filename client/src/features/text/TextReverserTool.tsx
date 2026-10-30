import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { reverseText } from '../../lib/text/reverse.js';
import { ArrowLeftRight, Trash2 } from 'lucide-react';

export const TextReverserTool: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'characters' | 'words'>('characters');

  const reversed = reverseText(inputText, mode);

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
            Reversal Mode
          </h3>
          <p className="text-xs text-neutral-500">
            Grapheme-safe Unicode preservation prevents breaking multi-byte characters and emojis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'characters' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('characters')}
          >
            Reverse Characters
          </Button>
          <Button
            variant={mode === 'words' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('words')}
          >
            Reverse Words
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Original Text
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInputText('')}
              disabled={!inputText}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
          <textarea
            rows={10}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text here (supports emojis: 👩🏽‍💻, 🚀, etc.)..."
            className="w-full p-3 text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
          />
        </Card>

        {/* Output */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Reversed Output
            </span>
            <CopyButton value={reversed} label="Copy Reversed" size="sm" />
          </div>
          <textarea
            rows={10}
            readOnly
            value={reversed}
            placeholder="Reversed text will appear here..."
            className="w-full p-3 text-sm bg-neutral-100/60 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed"
          />
        </Card>
      </div>
    </div>
  );
};
