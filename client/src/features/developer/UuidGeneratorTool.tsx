import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { generateBulkUuids, type UuidOptions } from '../../lib/dev/uuid.js';
import { RefreshCw, Copy, Check } from 'lucide-react';

export const UuidGeneratorTool: React.FC = () => {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [braces, setBraces] = useState<boolean>(false);

  const [uuids, setUuids] = useState<string[]>(() =>
    generateBulkUuids(5, { uppercase: false, hyphens: true, braces: false }),
  );

  const handleGenerate = () => {
    const generated = generateBulkUuids(count, { uppercase, hyphens, braces });
    setUuids(generated);
  };

  const allUuidsString = uuids.join('\n');

  return (
    <div className="space-y-6">
      {/* Options Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Configuration Options
            </h3>
            <p className="text-xs text-neutral-500">
              Generates RFC 4122 v4 UUIDs using browser crypto.randomUUID().
            </p>
          </div>

          <Button onClick={handleGenerate}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Generate UUIDs
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Quantity (1 to 200)
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(200, parseInt(e.target.value, 10) || 1)))
              }
              className="w-full px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer pt-4">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>UPPERCASE</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer pt-4">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>Include Hyphens</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer pt-4">
            <input
              type="checkbox"
              checked={braces}
              onChange={(e) => setBraces(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>Enclose in Braces {'{}'}</span>
          </label>
        </div>
      </Card>

      {/* Results List */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Generated UUIDs ({uuids.length})
          </span>
          <CopyButton value={allUuidsString} label="Copy All" size="sm" />
        </div>

        <div className="space-y-1.5 max-h-[380px] overflow-y-auto font-mono text-xs">
          {uuids.map((id, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 group"
            >
              <span className="text-neutral-800 dark:text-neutral-200 select-all font-mono">
                {id}
              </span>
              <CopyButton value={id} label="Copy" size="sm" variant="ghost" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
