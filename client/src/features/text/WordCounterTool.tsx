import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { analyzeText } from '../../lib/text/counter.js';
import { Trash2 } from 'lucide-react';

export const WordCounterTool: React.FC = () => {
  const [text, setText] = useState('');

  const stats = analyzeText(text);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-neutral-500">Words</span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {stats.words.toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-neutral-500">Characters</span>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {stats.characters.toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-neutral-500">No Spaces</span>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {stats.charactersNoSpaces.toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-neutral-500">Lines</span>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {stats.lines.toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-neutral-500">Paragraphs</span>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {stats.paragraphs.toLocaleString()}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-neutral-500">Reading Time</span>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
            ~{stats.readingTimeMinutes} min
          </p>
        </div>
      </div>

      {/* Editor Card */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Text Input
          </span>
          <div className="flex items-center gap-2">
            <CopyButton value={text} label="Copy Text" size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText('')}
              disabled={!text}
              aria-label="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <textarea
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here to see real-time word and character statistics..."
          className="w-full p-3 text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
        />

        <p className="text-[11px] text-neutral-400">
          Counting behavior: Unicode grapheme-aware. Whitespace-only text reports 0 words.
        </p>
      </Card>
    </div>
  );
};
