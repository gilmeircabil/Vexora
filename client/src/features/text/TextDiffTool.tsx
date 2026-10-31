import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { computeTextDiff, type DiffPart } from '../../lib/text/diff.js';
import { GitCompare, Plus, Minus } from 'lucide-react';

export const TextDiffTool: React.FC = () => {
  const [original, setOriginal] = useState(
    '{\n  "name": "VexoraMods",\n  "status": "beta",\n  "price": 0\n}',
  );
  const [modified, setModified] = useState(
    '{\n  "name": "VexoraMods",\n  "status": "released",\n  "price": 0,\n  "license": "MIT"\n}',
  );

  const diffParts = computeTextDiff(original, modified);

  const additions = diffParts.filter((p) => p.added).length;
  const deletions = diffParts.filter((p) => p.removed).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Original Text (Before)
            </span>
            <Button variant="ghost" size="sm" onClick={() => setOriginal('')} disabled={!original}>
              Clear
            </Button>
          </div>
          <textarea
            rows={8}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original version..."
            className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </Card>

        {/* Modified */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Modified Text (After)
            </span>
            <Button variant="ghost" size="sm" onClick={() => setModified('')} disabled={!modified}>
              Clear
            </Button>
          </div>
          <textarea
            rows={8}
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified version..."
            className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </Card>
      </div>

      {/* Diff Result View */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Unified Diff
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Plus className="w-3.5 h-3.5" />
              {additions} added
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
              <Minus className="w-3.5 h-3.5" />
              {deletions} removed
            </span>
          </div>
        </div>

        <div className="font-mono text-xs rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 divide-y divide-neutral-800/50 max-h-[420px] overflow-y-auto">
          {diffParts.length === 0 ? (
            <div className="p-6 text-center text-neutral-500">No differences detected.</div>
          ) : (
            diffParts.map((part, index) => {
              const lines = part.value.replace(/\n$/, '').split('\n');
              return lines.map((line, lineIdx) => {
                const isAdded = part.added;
                const isRemoved = part.removed;
                return (
                  <div
                    key={`${index}-${lineIdx}`}
                    className={`flex items-start px-3 py-1 font-mono text-xs ${
                      isAdded
                        ? 'bg-emerald-950/60 text-emerald-300'
                        : isRemoved
                          ? 'bg-rose-950/60 text-rose-300'
                          : 'text-neutral-400 hover:bg-neutral-800/40'
                    }`}
                  >
                    <span className="w-6 select-none font-bold shrink-0 opacity-70">
                      {isAdded ? '+' : isRemoved ? '-' : ' '}
                    </span>
                    <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                  </div>
                );
              });
            })
          )}
        </div>
      </Card>
    </div>
  );
};
