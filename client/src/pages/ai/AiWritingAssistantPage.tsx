import React, { useState } from 'react';
import {
  PenTool,
  Briefcase,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  FileBadge2,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';

const SAMPLE_WRITING = `i worked at acme corp for 2 years and was in charge of customer support. i helped a lot of customers with their issues and reduced ticket waiting times. also trained 3 new hires.`;

export const AiWritingAssistantPage: React.FC = () => {
  const { toast } = useToast();

  const [text, setText] = useState<string>(SAMPLE_WRITING);
  const [mode, setMode] = useState<'rewrite' | 'resume'>('resume');
  const [tone, setTone] = useState<string>('professional');
  const [targetRole, setTargetRole] = useState<string>('Customer Success Team Lead');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleProcess = async () => {
    if (!text.trim()) {
      toast('Please enter text to polish or transform.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await aiToolsApi.assistWriting({
        text,
        mode,
        tone: mode === 'rewrite' ? tone : undefined,
        targetRole: mode === 'resume' ? targetRole : undefined,
      });

      if (res.success && res.data?.text) {
        setResult(res.data.text);
        toast(
          mode === 'resume' ? 'ATS resume bullets generated!' : 'Text polished successfully!',
          'success',
        );
      } else {
        throw new Error(res.error || 'Writing assistance failed');
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
    toast('Copied to clipboard!', 'success');
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

        <div className="border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-gray-border)] pb-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] flex items-center gap-2">
                <PenTool className="w-8 h-8 text-[var(--theme-dirty-white)]" />
                AI Writing & ATS Resume Assistant
              </h1>
              <p className="text-sm text-[var(--theme-gray-muted)] mt-1 font-medium">
                Transform rough notes into persuasive professional copy or create quantifiable,
                high-impact resume achievement bullets for ATS scanners.
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
                  onClick={() => setMode('resume')}
                  className={`flex-1 py-2 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mode === 'resume'
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                      : 'text-[var(--theme-dirty-white)] hover:text-[var(--theme-dirty-white-muted)]'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> ATS Resume Builder
                </button>
                <button
                  type="button"
                  onClick={() => setMode('rewrite')}
                  className={`flex-1 py-2 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mode === 'rewrite'
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                      : 'text-[var(--theme-dirty-white)] hover:text-[var(--theme-dirty-white-muted)]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Tone & Grammar Rewrite
                </button>
              </div>

              {/* Mode-Specific Controls */}
              {mode === 'resume' ? (
                <div>
                  <label className="block font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase mb-1.5">
                    Target Job Title / Career Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer, Product Manager"
                    className="w-full px-3 py-2 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] font-medium text-xs rounded-lg focus:outline-none shadow-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase mb-1.5">
                    Target Writing Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] font-mono text-xs font-bold rounded-lg focus:outline-none shadow-xs"
                  >
                    <option value="professional">Professional & Crisp</option>
                    <option value="persuasive">Persuasive & Compelling</option>
                    <option value="casual">Casual & Friendly</option>
                    <option value="academic">Academic & Formal</option>
                    <option value="concise">Ultra-Concise & Direct</option>
                  </select>
                </div>
              )}

              {/* Draft Text Area */}
              <div>
                <label className="block font-mono text-xs font-bold text-slate-100 uppercase mb-1.5">
                  {mode === 'resume'
                    ? 'Work Experience Draft or Bullet Points'
                    : 'Text Draft to Polish'}
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    mode === 'resume'
                      ? 'Paste your raw work duties, responsibilities, or bullet points...'
                      : 'Paste draft email, article paragraph, or communication note...'
                  }
                  rows={9}
                  className="w-full p-3 font-mono text-xs bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] rounded-xl focus:outline-none shadow-xs resize-y"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full py-3 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-mono text-sm font-bold border border-[var(--theme-gray-border)] rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Polishing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <span>
                      {mode === 'resume'
                        ? 'Generate ATS Resume Bullets (Free)'
                        : 'Polish Text (Free)'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Output Box */}
            <div className="border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase text-[var(--theme-dirty-white)]">
                      {mode === 'resume'
                        ? 'ATS-Optimized Resume Bullets'
                        : 'Polished Copy & Variants'}
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
                    <FileBadge2 className="w-10 h-10 mb-2 stroke-1 text-[var(--theme-gray-muted)]" />
                    <span>
                      Enter your text on the left and click Generate to see AI-optimized results.
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
