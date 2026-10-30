import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { removeDuplicateLines } from '../../lib/text/dedupe.js';
import { Trash2, ListFilter } from 'lucide-react';

export const DuplicateLineRemoverTool: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(false);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);

  const result = removeDuplicateLines(inputText, {
    caseSensitive,
    trimWhitespace,
    removeEmptyLines,
  });

  return (
    <div className="space-y-6">
      {/* Options Bar */}
      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>Case Sensitive</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>Trim Leading / Trailing Spaces</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={removeEmptyLines}
              onChange={(e) => setRemoveEmptyLines(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>Remove Empty Lines</span>
          </label>
        </div>

        {/* Metrics Badge */}
        {inputText.trim() && (
          <div className="text-xs text-neutral-500 font-medium">
            <span>Original: {result.originalLines}</span>
            <span className="mx-1.5">·</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              Unique: {result.uniqueLines}
            </span>
            <span className="mx-1.5">·</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Removed: {result.removedCount}
            </span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Input Lines
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
            rows={12}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your list or multi-line text here..."
            className="w-full p-3 text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
          />
        </Card>

        {/* Output */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Deduplicated Result
            </span>
            <CopyButton value={result.text} label="Copy Clean Lines" size="sm" />
          </div>
          <textarea
            rows={12}
            readOnly
            value={result.text}
            placeholder="Deduplicated lines will appear here (first occurrence preserved)..."
            className="w-full p-3 text-sm bg-neutral-100/60 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 font-mono text-xs leading-relaxed"
          />
        </Card>
      </div>
    </div>
  );
};
