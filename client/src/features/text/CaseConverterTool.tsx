import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { convertCasing, type CasingType } from '../../lib/text/casing.js';
import { Trash2 } from 'lucide-react';

export const CaseConverterTool: React.FC = () => {
  const [inputText, setInputText] = useState('');

  const casingOptions: Array<{ type: CasingType; label: string; desc: string }> = [
    { type: 'upper', label: 'UPPERCASE', desc: 'ALL LETTERS CAPITALIZED' },
    { type: 'lower', label: 'lowercase', desc: 'all letters small' },
    { type: 'title', label: 'Title Case', desc: 'First Letter Of Each Word' },
    { type: 'sentence', label: 'Sentence case', desc: 'First letter capitalized after period' },
    { type: 'camel', label: 'camelCase', desc: 'wordsJoinedTogetherWithCapital' },
    { type: 'pascal', label: 'PascalCase', desc: 'WordsJoinedTogetherWithFirstCapital' },
    { type: 'kebab', label: 'kebab-case', desc: 'words-separated-by-hyphen' },
    { type: 'snake', label: 'snake_case', desc: 'words_separated_by_underscore' },
  ];

  const applyCasing = (type: CasingType) => {
    setInputText((prev) => convertCasing(prev, type));
  };

  return (
    <div className="space-y-6">
      {/* Transformation Buttons */}
      <Card className="space-y-3">
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
          Select Casing Transformation
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {casingOptions.map((opt) => (
            <Button
              key={opt.type}
              variant="secondary"
              size="sm"
              onClick={() => applyCasing(opt.type)}
              disabled={!inputText.trim()}
              className="flex flex-col items-center py-2.5 h-auto text-center"
            >
              <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                {opt.label}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate max-w-[120px]">
                {opt.desc}
              </span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Editor Card */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Text Content
          </span>
          <div className="flex items-center gap-2">
            <CopyButton value={inputText} label="Copy Result" size="sm" />
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
        </div>

        <textarea
          rows={10}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste text to convert its case..."
          className="w-full p-3 text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
        />

        <p className="text-[11px] text-neutral-400">
          Unicode notes: Case conversions utilize ECMAScript Unicode properties. Certain scripts
          (e.g. Arabic, Hebrew) do not have letter cases.
        </p>
      </Card>
    </div>
  );
};
