import React from 'react';
import {
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Info,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TOOL_BY_ID } from '../../tools/catalog.js';

export const GoogleFlowTool: React.FC = () => {
  const tool = TOOL_BY_ID.get('google-flow');
  const externalUrl = tool?.externalUrl || 'https://labs.google/fx/tools/flow';

  const capabilities = [
    {
      title: 'AI Image Generation',
      desc: 'Generate photorealistic visuals, creative artwork, and concept mockups using Google AI models.',
    },
    {
      title: 'AI Video Generation',
      desc: 'Transform visual concepts into cinematic video clips with fluid camera motion and dynamic effects.',
    },
    {
      title: 'Visual Storytelling',
      desc: 'Assemble coherent scenes, storyboard narratives, and craft visual arcs across sequential frames.',
    },
    {
      title: 'AI-Assisted Creative Workflows',
      desc: 'Iterate quickly with prompt refinement, visual style matching, and rapid creative branching.',
    },
    {
      title: 'Creative Experimentation',
      desc: 'Explore generative toolsets and multi-modal creative techniques powered by Google Labs research.',
    },
  ];

  return (
    <div className="space-y-8" data-testid="google-flow-tool">
      {/* Main Hero Launch Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#38BDF8] text-black border-2 border-black">
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                External Tool
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#F472B6] text-black border-2 border-black">
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                AI-Powered
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#FACC15] text-black border-2 border-black">
                Provider: Google
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-black">
              Google Flow Creative Workspace
            </h2>

            <p className="text-sm sm:text-base font-semibold text-neutral-700 leading-relaxed">
              Create stunning visuals and cinematic videos using Google's AI-powered creative
              workspace. Explore AI-assisted image generation, visual storytelling, and creative
              workflows.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="launch-google-flow-btn"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#FACC15] hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Open Google Flow</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </a>
            <span className="text-[11px] font-mono font-bold text-neutral-500">
              Opens https://labs.google/fx/tools/flow in a new tab
            </span>
          </div>
        </div>

        {/* External Service Notice */}
        <div className="mt-6 pt-5 border-t-2 border-black/10 flex items-start gap-3 bg-[#FAF7F0] p-4 rounded-xl border border-black/15">
          <Info className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5 stroke-[2.3]" />
          <div className="text-xs space-y-1">
            <p className="font-black text-black uppercase tracking-wide">External Service Notice</p>
            <p className="font-semibold text-neutral-700 leading-relaxed">
              Google Flow is an external service operated by Google. Opening it will take you
              outside VexoraMods. Google account requirements, availability, and usage limits apply.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Capabilities Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-black flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 stroke-[2.5]" />
          <span>Supported Capabilities & Creative Features</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="p-5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000000] space-y-1.5"
            >
              <div className="flex items-center gap-2 text-black font-black text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] stroke-[2.5]" />
                <span>{cap.title}</span>
              </div>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Zero Overhead & Discovery Policy Strip */}
      <div className="border-t-2 border-black/10 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white border-2 border-black rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 font-black text-black uppercase">
            <ShieldCheck className="w-4 h-4 text-neutral-700" />
            <span>Provider</span>
          </div>
          <p className="font-semibold text-neutral-700">
            Hosted and maintained directly by Google Labs.
          </p>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 font-black text-black uppercase">
            <Zap className="w-4 h-4 text-neutral-700" />
            <span>Zero Infrastructure Costs</span>
          </div>
          <p className="font-semibold text-neutral-700">
            No local API backend, Gemini subscription, or GPU infrastructure required.
          </p>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 font-black text-black uppercase">
            <Sparkles className="w-4 h-4 text-neutral-700" />
            <span>Free Discovery</span>
          </div>
          <p className="font-semibold text-neutral-700">
            Discover Google Flow freely on VexoraMods without requiring an account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleFlowTool;
