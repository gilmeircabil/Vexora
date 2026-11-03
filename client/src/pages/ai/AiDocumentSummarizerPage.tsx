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
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-mono font-bold text-black hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Tools
        </Link>

        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black flex items-center gap-2">
                <FileText className="w-8 h-8 text-black" />
                AI Document Summarizer & Q&A
              </h1>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Condense articles, PDFs, and meeting notes into clear bullet points or ask specific
                questions with cited answers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Controls */}
            <div className="space-y-5">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-[#FAF7F2] border-2 border-black">
                <button
                  type="button"
                  onClick={() => setMode('summary')}
                  className={`flex-1 py-2 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    mode === 'summary'
                      ? 'bg-[#FACC15] text-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Executive Summary
                </button>
                <button
                  type="button"
                  onClick={() => setMode('qa')}
                  className={`flex-1 py-2 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    mode === 'qa'
                      ? 'bg-[#FACC15] text-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" /> Ask Document Q&A
                </button>
              </div>

              {/* Document Text / File Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-mono text-xs font-bold text-black uppercase">
                    Document Text or Upload
                  </label>
                  <label className="text-[11px] font-mono underline text-gray-600 hover:text-black cursor-pointer inline-flex items-center gap-1">
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
                  className="w-full p-3 font-mono text-xs bg-white text-gray-900 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[2px_2px_0px_#000] resize-y"
                />
              </div>

              {/* Question input if Q&A mode */}
              {mode === 'qa' && (
                <div>
                  <label className="block font-mono text-xs font-bold text-black uppercase mb-1.5">
                    What question do you want to ask about this document?
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What are the three main advantages mentioned?"
                    className="w-full px-3 py-2 bg-white border-2 border-black font-medium text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[2px_2px_0px_#000]"
                  />
                </div>
              )}

              {/* Process Button */}
              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full py-3 bg-black text-white font-mono text-sm font-bold border-2 border-black hover:bg-[#FACC15] hover:text-black transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>
                      {mode === 'summary' ? 'Generate Summary (Free)' : 'Find Answer (Free)'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Output Display */}
            <div className="border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase text-black">
                      Summary & Answer Output
                    </span>
                  </div>
                  {result && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-xs font-bold border border-black bg-yellow-200 hover:bg-yellow-300 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-800" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>

                {result ? (
                  <div className="prose prose-sm max-w-none font-sans text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]">
                    {result}
                  </div>
                ) : (
                  <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 text-gray-400 font-mono text-xs">
                    <FileText className="w-10 h-10 mb-2 stroke-1 text-gray-300" />
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
