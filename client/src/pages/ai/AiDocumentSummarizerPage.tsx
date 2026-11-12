import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useToast } from '../../context/ToastContext.js';

const SAMPLE_DOCUMENT = `Artificial intelligence in web browsers has undergone a paradigm shift over the past two years. With WebAssembly (WASM), WebGPU, and modern neural execution engines, machine learning pipelines that once demanded expensive cloud GPU clusters now execute client-side with near-instant latency.

This transition delivers three immense advantages:
1. Zero Recurring Hosting Costs: Rather than paying for million-token API calls on serverless clouds, processing is offloaded to the user's local device.
2. Uncompromising Privacy: Personal documents, contracts, and photos never traverse external network cables, eliminating data breach risks.
3. Offline Capabilities: Web utilities maintain full operational utility even when the user experiences connectivity drops.`;

export const AiDocumentSummarizerPage: React.FC = () => {
  const { toast } = useToast();

  const [text, setText] = useState<string>(SAMPLE_DOCUMENT);
  const [mode, setMode] = useState<'summary' | 'qa'>('summary');
  const [question, setQuestion] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
        toast(`Loaded ${file.name} (${content.length} characters)`, 'success');
      }
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    if (!text.trim()) {
      toast('Please enter or upload document text.', 'error');
      return;
    }

    if (mode === 'qa' && !question.trim()) {
      toast('Please enter a question to ask about the document.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await aiToolsApi.summarizeDocument({
        text,
        mode,
        question: mode === 'qa' ? question : undefined,
      });

      if (res.success && res.data?.text) {
        setResult(res.data.text);
        toast(mode === 'summary' ? 'Summary ready!' : 'Question answered!', 'success');
      } else {
        throw new Error(res.error || 'Document processing failed');
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
                <FileText className="w-8 h-8 text-[var(--theme-dirty-white)]" />
                AI Document Summarizer & Q&A
              </h1>
              <p className="text-sm text-[var(--theme-gray-muted)] mt-1 font-medium">
                Condense articles, PDFs, and meeting notes into clear bullet points or ask specific
                questions with cited answers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Controls */}
            <div className="space-y-5">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('summary')}
                  className={`flex-1 py-2 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mode === 'summary'
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                      : 'text-[var(--theme-dirty-white)] hover:text-[var(--theme-dirty-white-muted)]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Executive Summary
                </button>
                <button
                  type="button"
                  onClick={() => setMode('qa')}
                  className={`flex-1 py-2 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mode === 'qa'
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                      : 'text-[var(--theme-dirty-white)] hover:text-[var(--theme-dirty-white-muted)]'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" /> Ask Document Q&A
                </button>
              </div>

              {/* Document Text / File Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase">
                    Document Text or Upload
                  </label>
                  <label className="text-[11px] font-mono underline text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] cursor-pointer inline-flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" /> Upload File (.txt, .md)
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste document text, research notes, or meeting transcripts here..."
                  rows={10}
                  className="w-full p-3 font-mono text-xs bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] rounded-xl focus:outline-none shadow-xs resize-y"
                />
              </div>

              {/* Question input if Q&A mode */}
              {mode === 'qa' && (
                <div>
                  <label className="block font-mono text-xs font-bold text-[var(--theme-dirty-white)] uppercase mb-1.5">
                    What question do you want to ask about this document?
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What are the three main advantages mentioned?"
                    className="w-full px-3 py-2 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] font-medium text-xs rounded-lg focus:outline-none shadow-xs"
                  />
                </div>
              )}

              {/* Process Button */}
              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full py-3 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-mono text-sm font-bold border border-[var(--theme-gray-border)] rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <span>
                      {mode === 'summary' ? 'Generate Summary (Free)' : 'Find Answer (Free)'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Output Display */}
            <div className="border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase text-[var(--theme-dirty-white)]">
                      Summary & Answer Output
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
                    <FileText className="w-10 h-10 mb-2 stroke-1 text-[var(--theme-gray-muted)]" />
                    <span>
                      Paste or upload your text on the left to generate an executive summary.
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
