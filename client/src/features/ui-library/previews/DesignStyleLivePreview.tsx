import React from 'react';

interface Props {
  styleId: string;
}

export const DesignStyleLivePreview: React.FC<Props> = ({ styleId }) => {
  switch (styleId) {
    case 'minimalism':
      return (
        <div className="w-full bg-white p-6 md:p-8 rounded-xl border border-neutral-200 text-neutral-900 space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase">Collection 01</span>
            <h2 className="text-2xl font-light tracking-tight text-neutral-950">Quiet Architectural Form</h2>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
            Design reduced to pure proportion, negative space, and disciplined typography.
          </p>
          <div className="flex gap-4 pt-2">
            <button className="px-4 py-2 bg-neutral-950 text-white text-xs font-medium rounded hover:bg-neutral-800 transition">
              Inquire
            </button>
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-medium rounded hover:border-neutral-400 transition">
              Lookbook
            </button>
          </div>
        </div>
      );

    case 'glassmorphism':
      return (
        <div className="w-full p-6 md:p-8 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
          <div className="w-full max-w-sm bg-white/20 backdrop-blur-xl border border-white/40 p-5 rounded-2xl shadow-2xl text-white space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black tracking-wider uppercase text-white/80">Glass Widget</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm animate-pulse"></span>
            </div>
            <div>
              <p className="text-xs text-white/70">Liquid Asset Balance</p>
              <h3 className="text-2xl font-black">$48,290.50</h3>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 py-1.5 bg-white/20 hover:bg-white/30 border border-white/40 rounded-xl text-xs font-bold transition">
                Send
              </button>
              <button className="flex-1 py-1.5 bg-white text-indigo-900 rounded-xl text-xs font-bold shadow-md hover:bg-white/90 transition">
                Receive
              </button>
            </div>
          </div>
        </div>
      );

    case 'neumorphism':
      return (
        <div className="w-full p-6 md:p-8 rounded-2xl bg-[#E0E5EC] flex items-center justify-center">
          <div className="p-6 rounded-3xl bg-[#E0E5EC] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] text-neutral-700 space-y-4 max-w-xs w-full text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E0E5EC] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-xl text-blue-600">
              💡
            </div>
            <div>
              <h4 className="font-bold text-sm text-neutral-800">Living Room Light</h4>
              <p className="text-xs text-neutral-500">Brightness: 75%</p>
            </div>
            <div className="flex justify-center gap-4">
              <button className="w-10 h-10 rounded-xl bg-[#E0E5EC] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center font-bold text-xs transition">
                -
              </button>
              <button className="w-10 h-10 rounded-xl bg-[#E0E5EC] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center font-bold text-xs transition text-blue-600">
                +
              </button>
            </div>
          </div>
        </div>
      );

    case 'bento-grid':
      return (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-neutral-950 rounded-2xl text-white">
          <div className="md:col-span-2 p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
            <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md font-mono">
              PERFORMANCE
            </span>
            <h4 className="font-bold text-base">Instant Global Edge Cache</h4>
            <p className="text-xs text-neutral-400">Sub-10ms latency worldwide with distributed Cloudflare compute nodes.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
            <span className="text-2xl font-black text-emerald-400">99.99%</span>
            <p className="text-xs text-neutral-400">Guaranteed uptime SLA</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <p className="text-xs font-bold text-amber-400 mb-1">100+ Components</p>
            <p className="text-[11px] text-neutral-400">Ready to copy and adapt.</p>
          </div>
          <div className="md:col-span-2 p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-300">Open-source & free under MIT</span>
            <button className="px-3 py-1 bg-white text-black font-bold text-xs rounded-lg">Get Code</button>
          </div>
        </div>
      );

    case 'material-design':
      return (
        <div className="w-full bg-[#FEF7FF] p-6 rounded-2xl border border-[#CAC4D0] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6750A4] text-white flex items-center justify-center font-bold text-sm">
              M3
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1D1B20]">Material 3 Surface</h4>
              <p className="text-xs text-[#49454F]">Tonal elevation & dynamic color</p>
            </div>
          </div>
          <p className="text-xs text-[#49454F] leading-relaxed">
            Standardized elevation tokens, accessible contrast pairings, and responsive state layers.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button className="px-4 py-2 text-xs font-semibold text-[#6750A4] hover:bg-[#6750A4]/10 rounded-full transition">
              Dismiss
            </button>
            <button className="px-4 py-2 text-xs font-semibold bg-[#6750A4] text-white rounded-full shadow hover:shadow-md transition">
              Accept
            </button>
          </div>
        </div>
      );

    case 'flat-design':
      return (
        <div className="w-full grid grid-cols-2 gap-3 p-4 bg-[#2C3E50] rounded-2xl text-white">
          <div className="p-4 bg-[#E74C3C] rounded-lg text-center space-y-1">
            <span className="text-2xl">⚡</span>
            <h5 className="font-bold text-xs">High Speed</h5>
          </div>
          <div className="p-4 bg-[#2ECC71] rounded-lg text-center space-y-1">
            <span className="text-2xl">🛡️</span>
            <h5 className="font-bold text-xs">Secure</h5>
          </div>
          <div className="p-4 bg-[#3498DB] rounded-lg text-center space-y-1">
            <span className="text-2xl">📱</span>
            <h5 className="font-bold text-xs">Responsive</h5>
          </div>
          <div className="p-4 bg-[#F1C40F] text-black rounded-lg text-center space-y-1">
            <span className="text-2xl">⭐</span>
            <h5 className="font-bold text-xs">Simple</h5>
          </div>
        </div>
      );

    case 'brutalism':
      return (
        <div className="w-full bg-[#FAF7F2] p-6 rounded-2xl border-2 border-black shadow-[5px_5px_0px_#000] space-y-4">
          <div className="inline-block px-2.5 py-0.5 bg-[#FACC15] text-black font-black text-xs border border-black rounded shadow-[2px_2px_0px_#000]">
            NEO-BRUTALISM
          </div>
          <h3 className="text-xl font-black text-black tracking-tight">Bold Borders. Zero Apologies.</h3>
          <p className="text-xs text-neutral-800 font-bold leading-relaxed">
            High contrast 2px solid outlines, vibrant pastels, and crisp non-blurred drop shadows.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#4ADE80] text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer">
              Launch Feature
            </button>
            <button className="px-4 py-2 bg-white text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer">
              Inspect
            </button>
          </div>
        </div>
      );

    case 'gradient-design':
      return (
        <div className="w-full p-6 md:p-8 rounded-2xl bg-slate-950 text-white space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-500 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
          <div className="relative z-10 space-y-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 font-black text-xl">
              Aurora Glow Ambient UI
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm">
              Luminous mesh transitions with rich glowing accents for futuristic platforms.
            </p>
            <button className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-xs shadow-lg shadow-purple-500/30 hover:scale-105 transition">
              Explore Aurora
            </button>
          </div>
        </div>
      );

    case 'dark-ui':
      return (
        <div className="w-full bg-[#09090B] p-6 rounded-2xl border border-neutral-800 text-neutral-100 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono text-neutral-400">terminal.sh</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">v2.4.0</span>
          </div>
          <div className="font-mono text-xs text-neutral-300 space-y-1">
            <p><span className="text-emerald-400">$</span> vexora deploy --env=production</p>
            <p className="text-neutral-500">✓ Compiled in 340ms (12 assets)</p>
            <p className="text-neutral-500">✓ Deployed to 280 edge locations</p>
          </div>
        </div>
      );

    case 'light-ui':
      return (
        <div className="w-full bg-[#FAF7F2] p-6 rounded-2xl border border-neutral-300 text-neutral-900 space-y-3 shadow-sm">
          <h4 className="font-semibold text-base text-neutral-900">Daytime Clarity</h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            High-legibility charcoal typography set against comforting warm paper backgrounds.
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs font-medium text-neutral-700">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Optimized for prolonged daytime reading</span>
          </div>
        </div>
      );

    case 'editorial-design':
      return (
        <div className="w-full bg-[#F7F4EE] p-6 md:p-8 rounded-2xl border border-stone-300 text-stone-900 space-y-3 font-serif">
          <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-stone-500">The Chronicle · Issue 42</span>
          <h3 className="text-2xl font-normal tracking-tight text-stone-950 italic">"Typography as Architecture"</h3>
          <p className="text-xs leading-relaxed text-stone-700 font-serif">
            A return to classical editorial balance, asymmetric column dividers, and literary drop caps in digital interfaces.
          </p>
          <div className="pt-2 border-t border-stone-300 flex justify-between items-center text-[11px] font-sans text-stone-600 font-medium">
            <span>By Eleanor Vance</span>
            <span>4 min read</span>
          </div>
        </div>
      );

    case 'modern-saas':
      return (
        <div className="w-full bg-black text-white p-6 rounded-2xl border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-neutral-900 border border-neutral-700 rounded-full text-[10px] font-medium text-neutral-300">
              ⚡ Next Gen Framework
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight">The Modern SaaS Standard</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Inter/Geist typography, dark mode foundations, pill badges, and refined micro-interactions.
          </p>
          <div className="flex gap-2 pt-1">
            <button className="px-3.5 py-1.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition">
              Get Started
            </button>
            <button className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-700 text-neutral-300 font-medium text-xs rounded-lg hover:bg-neutral-800 transition">
              View API Docs
            </button>
          </div>
        </div>
      );

    case 'soft-ui':
      return (
        <div className="w-full p-6 bg-gradient-to-br from-pink-50 to-blue-50 rounded-3xl border border-white/80 space-y-3">
          <div className="p-5 bg-white/80 backdrop-blur rounded-2xl shadow-lg shadow-purple-500/5 border border-purple-100 space-y-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm">🌸</div>
            <h4 className="font-bold text-sm text-neutral-800">Mindful Habits</h4>
            <p className="text-xs text-neutral-500">Gentle pastel tones and rounded cards create an inviting experience.</p>
          </div>
        </div>
      );

    case 'retro-design':
      return (
        <div className="w-full bg-[#C0C0C0] p-1 border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black font-sans text-xs">
          <div className="bg-[#000080] text-white px-2 py-1 font-bold flex justify-between items-center mb-3">
            <span>💾 Vexora_Studio_95.exe</span>
            <div className="flex gap-1">
              <button className="w-4 h-4 bg-[#C0C0C0] text-black font-bold flex items-center justify-center border-t border-l border-white border-b border-r border-black text-[10px]">_</button>
              <button className="w-4 h-4 bg-[#C0C0C0] text-black font-bold flex items-center justify-center border-t border-l border-white border-b border-r border-black text-[10px]">✕</button>
            </div>
          </div>
          <div className="p-3 bg-white border-t border-l border-black border-b border-r border-white font-mono text-xs space-y-2">
            <p className="font-bold">SYSTEM READY.</p>
            <p className="text-neutral-600">Memory OK: 640K Base Memory</p>
            <button className="px-3 py-1 bg-[#C0C0C0] text-black font-bold border-t border-l border-white border-b border-r border-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs">
              OK
            </button>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-6 bg-white border-2 border-black rounded-xl">
          <p className="font-bold text-sm">Design Style Preview: {styleId}</p>
        </div>
      );
  }
};
