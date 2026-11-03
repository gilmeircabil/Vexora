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
                <PenTool className="w-8 h-8 text-black" />
                AI Writing & ATS Resume Assistant
              </h1>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Transform rough notes into persuasive professional copy or create quantifiable, high-impact resume achievement bullets for ATS scanners.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-5">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-[#FAF7F2] border-2 border-black">
                <button
                  type="button"
                  onClick={() => setMode('resume')}
                  className={`flex-1 py-2 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    mode === 'resume'
                      ? 'bg-[#FACC15] text-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> ATS Resume Builder
                </button>
                <button
                  type="button"
                  onClick={() => setMode('rewrite')}
                  className={`flex-1 py-2 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    mode === 'rewrite'
                      ? 'bg-[#FACC15] text-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Tone & Grammar Rewrite
                </button>
              </div>

              {/* Mode-Specific Controls */}
              {mode === 'resume' ? (
                <div>
                  <label className="block font-mono text-xs font-bold text-black uppercase mb-1.5">
                    Target Job Title / Career Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer, Product Manager"
                    className="w-full px-3 py-2 bg-white border-2 border-black font-medium text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[2px_2px_0px_#000]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-mono text-xs font-bold text-black uppercase mb-1.5">
                    Target Writing Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[2px_2px_0px_#000]"
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
                <label className="block font-mono text-xs font-bold text-black uppercase mb-1.5">
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
                  className="w-full p-3 font-mono text-xs bg-white text-gray-900 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[2px_2px_0px_#000] resize-y"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full py-3 bg-black text-white font-mono text-sm font-bold border-2 border-black hover:bg-[#FACC15] hover:text-black transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Polishing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>
                      {mode === 'resume' ? 'Generate ATS Resume Bullets (Free)' : 'Polish Text (Free)'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Output Box */}
            <div className="border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase text-black">
                      {mode === 'resume' ? 'ATS-Optimized Resume Bullets' : 'Polished Copy & Variants'}
                    </span>
                  </div>
                  {result && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-xs font-bold border border-black bg-yellow-200 hover:bg-yellow-300 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-800" /> : <Copy className="w-3.5 h-3.5" />}
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
                    <FileBadge2 className="w-10 h-10 mb-2 stroke-1 text-gray-300" />
                    <span>Enter your text on the left and click Generate to see AI-optimized results.</span>
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
