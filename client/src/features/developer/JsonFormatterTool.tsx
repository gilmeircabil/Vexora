import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { formatJson, minifyJson } from '../../lib/dev/json.js';
import { AlertCircle, CheckCircle2, Minimize2, Braces, Trash2 } from 'lucide-react';

export const JsonFormatterTool: React.FC = () => {
  const [input, setInput] = useState(
    '{"name":"VexoraMods","tools":33,"free":true,"tags":["tools","privacy","offline"]}',
  );
  const [indent, setIndent] = useState<number | '\t'>(2);
  const [sortKeys, setSortKeys] = useState(false);

  const [errorDetail, setErrorDetail] = useState<{
    message: string;
    line?: number;
    column?: number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFormat = () => {
    setErrorDetail(null);
    setStatusMessage(null);

    const res = formatJson(input, { indent, sortKeys });
    if (!res.ok) {
      setErrorDetail(res.error);
      return;
    }

    setInput(res.value.output);
    setStatusMessage('JSON successfully formatted and validated.');
  };

  const handleMinify = () => {
    setErrorDetail(null);
    setStatusMessage(null);

    const res = minifyJson(input);
    if (!res.ok) {
      setErrorDetail(res.error);
      return;
    }

    setInput(res.value);
    setStatusMessage('JSON minified successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Indentation:
            </label>
            <select
              value={indent === '\t' ? 'tab' : indent}
              onChange={(e) =>
                setIndent(e.target.value === 'tab' ? '\t' : parseInt(e.target.value, 10))
              }
              className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">Tabs</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded accent-[var(--theme-dirty-white)]"
            />
            <span>Alphabetize Keys</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleMinify} disabled={!input.trim()}>
            <Minimize2 className="w-3.5 h-3.5 mr-1" />
            Minify
          </Button>
          <Button variant="primary" size="sm" onClick={handleFormat} disabled={!input.trim()}>
            <Braces className="w-3.5 h-3.5 mr-1" />
            Format & Validate
          </Button>
        </div>
      </Card>

      {/* Error / Status Alerts */}
      {errorDetail && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-start gap-2.5 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">JSON Syntax Error</p>
            <p className="mt-0.5">{errorDetail.message}</p>
            {errorDetail.line !== undefined && (
              <p className="font-mono mt-1 text-[11px] opacity-90">
                Location: Line {errorDetail.line}, Column {errorDetail.column}
              </p>
            )}
          </div>
        </div>
      )}

      {statusMessage && !errorDetail && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Editor Card */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            JSON Content
          </span>
          <div className="flex items-center gap-2">
            <CopyButton value={input} label="Copy JSON" size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput('');
                setErrorDetail(null);
                setStatusMessage(null);
              }}
              disabled={!input}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <textarea
          rows={16}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste JSON here to format, validate, or minify..."
          className="w-full p-4 font-mono text-xs bg-neutral-900 text-neutral-100 rounded-xl border border-neutral-800 focus:outline-none focus:border-[var(--theme-dirty-white)] leading-relaxed"
          spellCheck={false}
        />

        <p className="text-[11px] text-neutral-400">
          Security: Parsing is executed exclusively with native JSON.parse without using eval or
          arbitrary script execution.
        </p>
      </Card>
    </div>
  );
};
