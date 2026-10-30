import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { generateLorem, type LoremOptions } from '../../lib/text/lorem.js';
import { RefreshCw } from 'lucide-react';

export const LoremIpsumTool: React.FC = () => {
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);

  const [output, setOutput] = useState<string>(() =>
    generateLorem({ type: 'paragraphs', count: 3, startWithLorem: true }),
  );

  const handleGenerate = () => {
    const text = generateLorem({ type, count, startWithLorem });
    setOutput(text);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Generation Unit
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'paragraphs' | 'sentences' | 'words')}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Count (1 to 50)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))
              }
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-4 pb-1">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span>Start with "Lorem ipsum..."</span>
            </label>

            <Button onClick={handleGenerate} size="md">
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Generate
            </Button>
          </div>
        </div>
      </Card>

      {/* Output Display */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Generated Placeholder Text
          </span>
          <CopyButton value={output} label="Copy Lorem Ipsum" size="sm" />
        </div>

        <textarea
          rows={12}
          readOnly
          value={output}
          className="w-full p-4 text-sm bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed"
        />
      </Card>
    </div>
  );
};
