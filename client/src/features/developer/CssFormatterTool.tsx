import React, { useState } from 'react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { CopyButton } from '../../components/common/CopyButton.js';
import { formatCss, minifyCss } from '../../lib/dev/css.js';
import { AlertCircle, CheckCircle2, Minimize2, FileCode2, Trash2 } from 'lucide-react';

export const CssFormatterTool: React.FC = () => {
  const [cssInput, setCssInput] = useState(
    'body{margin:0;padding:0;background:#f8fafc;color:#0f172a}.card{display:flex;align-items:center;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1)}',
  );
  const [tabWidth, setTabWidth] = useState<number>(2);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleFormat = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setStatusMsg(null);

    const res = await formatCss(cssInput, { tabWidth });
    setIsLoading(false);

    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }

    setCssInput(res.value);
    setStatusMsg('CSS successfully formatted using Prettier AST parser.');
  };

  const handleMinify = () => {
    setErrorMsg(null);
    setStatusMsg(null);

    const res = minifyCss(cssInput);
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }

    setCssInput(res.value);
    setStatusMsg('CSS minified.');
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Tab Width:
          </label>
          <select
            value={tabWidth}
            onChange={(e) => setTabWidth(parseInt(e.target.value, 10))}
            className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none"
          >
            <option value="2">2 Spaces</option>
            <option value="4">4 Spaces</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleMinify} disabled={!cssInput.trim()}>
            <Minimize2 className="w-3.5 h-3.5 mr-1" />
            Minify CSS
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleFormat}
            isLoading={isLoading}
            disabled={!cssInput.trim()}
          >
            <FileCode2 className="w-3.5 h-3.5 mr-1" />
            Format CSS (Prettier)
          </Button>
        </div>
      </Card>

      {/* Error / Status Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-start gap-2.5 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">CSS Syntax Parsing Error</p>
            <p className="mt-0.5 whitespace-pre-wrap font-mono text-[11px]">{errorMsg}</p>
          </div>
        </div>
      )}

      {statusMsg && !errorMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Editor Card */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Stylesheet Content
          </span>
          <div className="flex items-center gap-2">
            <CopyButton value={cssInput} label="Copy CSS" size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCssInput('');
                setErrorMsg(null);
                setStatusMsg(null);
              }}
              disabled={!cssInput}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <textarea
          rows={16}
          value={cssInput}
          onChange={(e) => setCssInput(e.target.value)}
          placeholder="Paste CSS stylesheet here..."
          className="w-full p-4 font-mono text-xs bg-neutral-900 text-neutral-100 rounded-xl border border-neutral-800 focus:outline-none focus:border-indigo-500 leading-relaxed"
          spellCheck={false}
        />

        <p className="text-[11px] text-neutral-400">
          Parser notice: Full CSS3 formatting executed in-browser using Prettier standalone and
          PostCSS AST parser. Syntax violations are clearly reported.
        </p>
      </Card>
    </div>
  );
};
