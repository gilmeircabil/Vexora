import React from 'react';

interface Props {
  layoutId: string;
}

export const WebsiteLayoutLivePreview: React.FC<Props> = ({ layoutId }) => {
  switch (layoutId) {
    case 'landing-page':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl overflow-hidden text-black text-xs font-sans shadow-[5px_5px_0px_#000]">
          {/* Navbar */}
          <header className="px-4 py-2.5 border-b-2 border-black bg-[#FAF7F2] flex justify-between items-center">
            <span className="font-black text-sm">VexoraMods</span>
            <div className="flex items-center gap-3 font-bold text-[11px]">
              <span>Features</span>
              <span>Testimonials</span>
              <span>Pricing</span>
              <span className="px-2.5 py-1 bg-[#FACC15] border border-black rounded-lg">Get Started</span>
            </div>
          </header>
          {/* Hero */}
          <div className="px-6 py-8 text-center bg-gradient-to-b from-[#FAF7F2] to-white space-y-3">
            <span className="px-2 py-0.5 bg-[#4ADE80] border border-black rounded-md text-[10px] font-black">
              ★ High-Converting Layout
            </span>
            <h3 className="text-xl md:text-2xl font-black tracking-tight max-w-sm mx-auto">
              Build Faster Interfaces with Visual Mastery
            </h3>
            <p className="text-neutral-600 text-xs max-w-xs mx-auto">
              Everything frontend developers need to preview, study, and integrate world-class UI patterns.
            </p>
            <div className="flex justify-center gap-2 pt-1">
              <button className="px-4 py-1.5 bg-[#FACC15] font-black rounded-xl border border-black shadow-[2px_2px_0px_#000]">
                Explore Catalog
              </button>
              <button className="px-4 py-1.5 bg-white font-bold rounded-xl border border-black">
                Live Demo ↗
              </button>
            </div>
          </div>
          {/* Social Proof */}
          <div className="py-2.5 border-y border-neutral-200 bg-neutral-50 flex justify-around text-[10px] font-mono text-neutral-400 font-bold uppercase">
            <span>Stripe</span><span>GitHub</span><span>Vercel</span><span>Figma</span>
          </div>
          {/* Feature Grid */}
          <div className="p-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <span className="font-mono text-xs font-bold text-black">&gt;</span>
              <p className="font-black text-[11px]">Instant Previews</p>
              <p className="text-[10px] text-neutral-500">Live rendered HTML/CSS.</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <span className="font-mono text-xs font-bold text-black">M</span>
              <p className="font-black text-[11px]">Responsive</p>
              <p className="text-[10px] text-neutral-500">Desktop, tablet, mobile.</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <span className="font-mono text-xs font-bold text-black">C</span>
              <p className="font-black text-[11px]">1-Click Copy</p>
              <p className="text-[10px] text-neutral-500">Clean React TSX snippets.</p>
            </div>
          </div>
        </div>
      );

    case 'saas-website':
      return (
        <div className="w-full bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 text-xs font-sans">
          <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <span className="font-black text-sm text-indigo-400">SaaSFlow</span>
            <div className="flex gap-3 text-neutral-400 text-[11px]">
              <span>Product</span><span>Solutions</span><span>Docs</span>
            </div>
            <button className="px-3 py-1 bg-indigo-600 rounded-lg text-white font-bold text-[11px]">
              Deploy
            </button>
          </div>
          <div className="p-6 text-center space-y-3">
            <h3 className="text-lg font-black tracking-tight text-white">
              The Developer Cloud for Modern Teams
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Automate deployments, observe latency metrics, and scale edge computing with zero configuration.
            </p>
            {/* Mock Dashboard Preview */}
            <div className="max-w-xs mx-auto p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-left space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Active Compute</span>
                <span className="text-emerald-400 font-mono">12 Nodes</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'portfolio-website':
      return (
        <div className="w-full bg-[#FAF7F2] p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] text-black text-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FACC15] border border-black flex items-center justify-center font-black">
                AD
              </div>
              <div>
                <p className="font-black text-xs">Alex Dev</p>
                <p className="text-[10px] text-neutral-500">Design Engineer</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-[#4ADE80] border border-black rounded-full text-[10px] font-black">
              ● Available for Hire
            </span>
          </div>
          <div>
            <h3 className="text-base font-black">Crafting interfaces where speed meets delight.</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] space-y-1">
              <div className="h-14 bg-purple-100 rounded-lg flex items-center justify-center font-bold text-xs text-purple-700 font-mono">UI</div>
              <p className="font-black text-[11px]">VexoraMods Studio</p>
            </div>
            <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] space-y-1">
              <div className="h-14 bg-sky-100 rounded-lg flex items-center justify-center font-bold text-xs text-sky-700 font-mono">DS</div>
              <p className="font-black text-[11px]">Design System Pro</p>
            </div>
          </div>
        </div>
      );

    case 'blog-layout':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] text-black text-xs space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-neutral-500">
            <span className="px-2 py-0.5 bg-[#FACC15] text-black rounded border border-black">ENGINEERING</span>
            <span>· 6 min read · Nov 2026</span>
          </div>
          <h3 className="text-base font-black">Why Neo-Brutalism Is Taking Over Modern Web Products</h3>
          <p className="text-neutral-600 text-xs leading-relaxed">
            From Gumroad to Figma community plugins, bold high-contrast borders and hard shadows have emerged as an energetic antidote to generic bland templates.
          </p>
          <div className="flex items-center justify-between border-t border-black/10 pt-2 text-[11px]">
            <span className="font-black">Read full essay →</span>
            <span className="text-neutral-400">142 claps</span>
          </div>
        </div>
      );

    case 'documentation-layout':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] flex overflow-hidden text-xs">
          <div className="w-36 bg-[#FAF7F2] border-r-2 border-black p-3 space-y-2 shrink-0">
            <p className="font-black text-[10px] uppercase text-neutral-500">Docs</p>
            <div className="space-y-1 font-bold text-[11px]">
              <p className="text-blue-600 bg-white p-1 rounded border border-black">Introduction</p>
              <p className="text-neutral-600 p-1">Installation</p>
              <p className="text-neutral-600 p-1">Component API</p>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-2">
            <h4 className="font-black text-sm">Getting Started</h4>
            <p className="text-neutral-600 text-xs">Import the prebuilt components into your project:</p>
            <div className="p-2 bg-neutral-900 text-neutral-200 rounded-lg font-mono text-[10px]">
              import &#123; Button &#125; from 'vexoramods';
            </div>
          </div>
        </div>
      );

    case 'ecommerce-layout':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] text-black text-xs space-y-3">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span className="font-black text-xs">Storefront Catalog</span>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="px-2 py-0.5 bg-[#FAF7F2] border border-black rounded">Filters (2)</span>
              <span className="px-2 py-0.5 bg-[#FACC15] border border-black rounded">Cart (3)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl space-y-1">
              <div className="h-16 bg-white border border-black rounded flex items-center justify-center font-mono text-xs text-neutral-400 font-bold">01</div>
              <p className="font-black text-xs">Neo Kicks v2</p>
              <div className="flex justify-between items-center">
                <span className="font-black text-xs">$120</span>
                <button className="px-2 py-0.5 bg-[#4ADE80] font-black rounded border border-black text-[10px]">+ Add</button>
              </div>
            </div>
            <div className="p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl space-y-1">
              <div className="h-16 bg-white border border-black rounded flex items-center justify-center font-mono text-xs text-neutral-400 font-bold">02</div>
              <p className="font-black text-xs">Designer Pack</p>
              <div className="flex justify-between items-center">
                <span className="font-black text-xs">$85</span>
                <button className="px-2 py-0.5 bg-[#4ADE80] font-black rounded border border-black text-[10px]">+ Add</button>
              </div>
            </div>
          </div>
        </div>
      );

    case 'agency-website':
      return (
        <div className="w-full bg-black text-white p-6 rounded-2xl border-2 border-neutral-800 text-xs space-y-3">
          <span className="text-[10px] tracking-widest uppercase font-mono text-neutral-400">AGENCY / STUDIO</span>
          <h3 className="text-xl font-black tracking-tight leading-tight">
            We Design Software That Drives Millions.
          </h3>
          <p className="text-neutral-400 text-xs">
            Award-winning creative engineering for top tech brands and bold venture-backed startups.
          </p>
          <div className="flex gap-2 pt-1">
            <button className="px-4 py-1.5 bg-white text-black font-black rounded-lg">
              View Work
            </button>
            <button className="px-4 py-1.5 bg-neutral-900 border border-neutral-700 font-bold rounded-lg text-neutral-300">
              Book Call
            </button>
          </div>
        </div>
      );

    case 'personal-website':
      return (
        <div className="w-full bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] text-black text-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#38BDF8] border-2 border-black flex items-center justify-center font-black text-sm">
              JD
            </div>
            <div>
              <h4 className="font-black text-sm">Jordan Doe</h4>
              <p className="text-neutral-500 text-[11px]">Software Engineer & Indie Maker</p>
            </div>
          </div>
          <p className="text-neutral-700 text-xs leading-relaxed">
            Building open-source developer tools, exploring local LLM agents, and writing about software architecture.
          </p>
          <div className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl">
            <p className="font-black text-[10px] uppercase text-neutral-500">Currently Building</p>
            <p className="font-bold text-xs">VexoraMods UI Component Library</p>
          </div>
        </div>
      );

    case 'educational-website':
      return (
        <div className="w-full bg-[#FAF7F2] p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] text-black text-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-black text-xs">Academy Track</span>
            <span className="px-2 py-0.5 bg-[#4ADE80] border border-black rounded-md text-[10px] font-black">Free Course</span>
          </div>
          <h4 className="text-sm font-black">Modern Frontend Architecture 101</h4>
          <div className="space-y-1 text-neutral-600 text-[11px] font-medium">
            <p className="flex items-center gap-1.5"><span className="text-green-600 font-black">✓</span> 01. Semantic HTML & ARIA Landmarks</p>
            <p className="flex items-center gap-1.5"><span className="text-green-600 font-black">✓</span> 02. Tailwind CSS & Design Tokens</p>
            <p className="flex items-center gap-1.5"><span className="text-amber-600 font-black">▶</span> 03. State Management & Hooks</p>
          </div>
          <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden border border-black">
            <div className="bg-[#FACC15] h-full w-2/3"></div>
          </div>
        </div>
      );

    case 'community-website':
      return (
        <div className="w-full bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] text-black text-xs space-y-3">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <span className="font-black text-xs">Developer Forum</span>
            <span className="text-[10px] font-mono text-neutral-500">14.2k Members</span>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-[#FAF7F2] border border-black rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-black text-xs">Best way to structure React component tokens?</p>
                <p className="text-[10px] text-neutral-500">Started by @sara · 24 replies</p>
              </div>
              <span className="px-2 py-1 bg-yellow-200 rounded border border-black font-black text-[10px]">▲ 84</span>
            </div>
          </div>
        </div>
      );

    case 'authentication-layout':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] grid grid-cols-1 md:grid-cols-2 overflow-hidden text-xs">
          <div className="hidden md:flex flex-col justify-between p-4 bg-[#FAF7F2] border-r-2 border-black font-bold">
            <span className="font-black text-sm">VexoraMods</span>
            <p className="text-neutral-700 text-xs">"The cleanest UI library for modern frontend development."</p>
            <span className="text-[10px] text-neutral-400 font-mono">© 2026</span>
          </div>
          <div className="p-4 space-y-2.5">
            <h4 className="font-black text-sm">Welcome back</h4>
            <input type="email" placeholder="Email" className="w-full px-2.5 py-1.5 border border-black rounded-lg text-xs" readOnly value="developer@vexora.dev" />
            <input type="password" placeholder="Password" className="w-full px-2.5 py-1.5 border border-black rounded-lg text-xs" readOnly value="••••••••" />
            <button className="w-full py-2 bg-[#FACC15] font-black rounded-xl border border-black shadow-[2px_2px_0px_#000]">
              Sign In
            </button>
          </div>
        </div>
      );

    case 'pricing-page-layout':
      return (
        <div className="w-full bg-[#FAF7F2] p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] text-black text-xs space-y-4">
          <div className="text-center space-y-1">
            <h4 className="text-base font-black">Simple, Transparent Pricing</h4>
            <div className="inline-flex p-1 bg-white border border-black rounded-xl text-[10px] font-black">
              <span className="px-2 py-0.5 bg-[#FACC15] rounded">Monthly</span>
              <span className="px-2 py-0.5 text-neutral-500">Annual (Save 20%)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border-2 border-black rounded-xl space-y-1">
              <p className="font-black text-xs">Hobby</p>
              <p className="text-xl font-black">$0</p>
              <p className="text-[10px] text-neutral-500">Core components</p>
            </div>
            <div className="p-3 bg-white border-2 border-black rounded-xl space-y-1 shadow-[2px_2px_0px_#000]">
              <p className="font-black text-xs text-blue-600">Pro</p>
              <p className="text-xl font-black">$19</p>
              <p className="text-[10px] text-neutral-500">Playground & Code export</p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-white border-2 border-black rounded-xl">
          <p className="font-bold text-xs">Layout: {layoutId}</p>
        </div>
      );
  }
};
