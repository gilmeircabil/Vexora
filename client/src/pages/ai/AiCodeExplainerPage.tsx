import React, { useState } from 'react';
import {
  Code2,
  Bug,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';

const SAMPLE_CODE = `function findDuplicates(arr) {
  const seen = new Set();
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    if (seen.has(arr[i])) {
      duplicates.push(arr[i]);
    } else {
      seen.add(arr[i]);
    }
  }
  return duplicates;
}`;

export const AiCodeExplainerPage: React.FC = () => {
  const { toast } = useToast();

  const [code, setCode] = useState<string>(SAMPLE_CODE);
  const [language, setLanguage] = useState<string>('javascript');
  const [mode, setMode] = useState<'explain' | 'debug'>('explain');
  const [context, setContext] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleProcess = async () => {
    if (!code.trim()) {
      toast('Please enter code to analyze.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await aiToolsApi.explainCode({
        code,
        language,
        mode,
        context,
      });

      if (res.success && res.data?.text) {
        setResult(res.data.text);
        toast(
          mode === 'explain' ? 'Code walkthrough generated!' : 'Bug diagnosis complete!',
          'success',
        );
      } else {
        throw new Error(res.error || 'Code analysis failed');
      }
    } catch (err: any) {
      toast(err.message || 'Processing failed. Check your API key in .env.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast('Analysis copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-mono font-bold text-[var(--theme-dirty-white)] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Tools
        </Link>

        {/* Header */}
        <div className="border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-gray-border)] pb-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] flex items-center gap-2">
                <Code2 className="w-8 h-8 text-[var(--theme-dirty-white)]" />
                AI Code Explainer & Bug Debugger
              </h1>
              <p className="text-sm text-[var(--theme-gray-muted)] mt-1 font-medium">
                Step-by-step logic breakdown, algorithmic time/space complexity analysis, and
                automated bug fixing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-5">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('explain')}
                  className={`flex-1 py-2 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mode === 'explain'
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                      : 'text-[var(--theme-dirty-white)] hover:text-[var(--theme-dirty-white-muted)]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Explain Code Logic
                </button>
                <button
                  type="button"
                  onClick={() => setMode('debug')}
                  className={`flex-1 py-2 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mode === 'debug'
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                      : 'text-[var(--theme-dirty-white)] hover:text-[var(--theme-dirty-white-muted)]'
                  }`}
                >
                  <Bug className="w-4 h-4" /> Debug & Fix Errors
                </button>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase mb-1.5">
                  Programming Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] font-mono text-xs font-bold rounded-lg focus:outline-none shadow-xs"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML / CSS</option>
                  <option value="rust">Rust</option>
                  <option value="go">Go</option>
                  <option value="csharp">C#</option>
                  <option value="cpp">C++</option>
                  <option value="sql">SQL</option>
                </select>
              </div>

              {/* Code Snippet Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-mono text-xs font-bold text-slate-100 uppercase flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Source Code Snippet
                  </label>
                  <button
                    type="button"
                    onClick={() => setCode(SAMPLE_CODE)}
                    className="text-[11px] font-mono underline text-gray-600 hover:text-slate-100"
                  >
                    Load Sample
                  </button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your function, class, or code snippet here..."
                  rows={10}
                  className="w-full p-3 font-mono text-xs bg-gray-950 text-gray-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Optional Error/Context */}
              <div>
                <label className="block font-mono text-xs font-bold text-slate-100 uppercase mb-1.5">
                  {mode === 'debug'
                    ? 'Error Message or Stack Trace'
                    : 'Additional Context (Optional)'}
                </label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={
                    mode === 'debug'
                      ? 'e.g. TypeError: Cannot read properties of undefined'
                      : 'e.g. Explain for beginner / Focus on performance'
                  }
                  className="w-full px-3 py-2 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] font-medium text-xs rounded-lg focus:outline-none shadow-xs"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing || !code.trim()}
                className="w-full py-3 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-mono text-sm font-bold border border-[var(--theme-gray-border)] rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <span>
                      {mode === 'explain' ? 'Explain Code (Free)' : 'Find & Fix Bugs (Free)'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Analysis Output View */}
            <div className="border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase text-[var(--theme-dirty-white)]">
                      AI Analysis & Output
                    </span>
                  </div>
                  {result && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-xs font-bold rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-800" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>

                {result ? (
                  <div className="prose prose-sm max-w-none font-sans text-xs sm:text-sm text-[var(--theme-dirty-white)] whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]">
                    {result}
                  </div>
                ) : (
                  <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 text-[var(--theme-gray-muted)] font-mono text-xs">
                    <Code2 className="w-10 h-10 mb-2 stroke-1 text-[var(--theme-gray-muted)]" />
                    <span>
                      Enter your code on the left and click Analyze to receive a step-by-step
                      walkthrough.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
