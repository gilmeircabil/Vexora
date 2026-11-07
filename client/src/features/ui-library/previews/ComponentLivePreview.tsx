import React, { useState } from 'react';

interface Props {
  componentId: string;
  variationId?: string;
  isInteractive?: boolean;
}

export const ComponentLivePreview: React.FC<Props> = ({ componentId, variationId, isInteractive = true }) => {
  // Local state hooks for interactive toggles
  const [toggleActive, setToggleActive] = useState(false);
  const [inputText, setInputText] = useState('VexoraMods UI');
  const [count, setCount] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [sliderVal, setSliderVal] = useState(50);
  const [selectedRadio, setSelectedRadio] = useState('option-1');
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [accordionOpen, setAccordionOpen] = useState(true);

  // 1. NAVIGATION
  if (componentId === 'navbar') {
    if (variationId === 'transparent-glass-navbar') {
      return (
        <div className="w-full p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl">
          <nav className="flex items-center justify-between px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-xs font-bold">
            <span className="font-black tracking-wide">STUDIO</span>
            <div className="hidden sm:flex items-center gap-4 text-[11px]">
              <span className="hover:text-yellow-300 cursor-pointer">Explore</span>
              <span className="hover:text-yellow-300 cursor-pointer">Pricing</span>
            </div>
            <button className="px-3 py-1 bg-white text-purple-900 rounded-full font-black text-[10px]">Launch</button>
          </nav>
        </div>
      );
    }
    if (variationId === 'minimal-navbar') {
      return (
        <nav className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-medium">
          <span className="font-bold text-black text-sm">Vexora</span>
          <div className="flex items-center gap-4 text-neutral-600 text-[11px]">
            <span className="hover:text-black cursor-pointer">Docs</span>
            <span className="hover:text-black cursor-pointer">Showcase</span>
            <button className="px-3 py-1 bg-black text-white rounded-lg text-[10px] font-bold">Sign In</button>
          </div>
        </nav>
      );
    }
    // Default Neo-Brutalist Navbar
    return (
      <nav className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF7F2] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-black">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-[#FACC15] border border-black rounded-sm"></span>
          <span>VexoraMods</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 bg-white border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] cursor-pointer">Tools</span>
          <span className="px-2.5 py-1 bg-[#FACC15] border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] cursor-pointer">UI Library</span>
          <button className="px-3 py-1 bg-[#38BDF8] border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] cursor-pointer">Sign In</button>
        </div>
      </nav>
    );
  }

  if (componentId === 'sidebar' || componentId === 'collapsible-sidebar') {
    return (
      <aside className="w-full max-w-xs bg-neutral-900 text-neutral-200 p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] space-y-3 text-xs">
        <div className="flex justify-between items-center text-white font-black text-sm border-b border-neutral-800 pb-2">
          <span>Workspace</span>
          <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded font-mono">v2.0</span>
        </div>
        <div className="space-y-1 font-bold">
          <div className="p-2 bg-[#FACC15] text-black border border-black rounded-xl flex items-center gap-2">
            <span>⌂</span><span>Dashboard</span>
          </div>
          <div className="p-2 hover:bg-neutral-800 rounded-xl flex items-center gap-2 text-neutral-400 hover:text-white transition cursor-pointer">
            <span>📁</span><span>Projects</span>
          </div>
          <div className="p-2 hover:bg-neutral-800 rounded-xl flex items-center gap-2 text-neutral-400 hover:text-white transition cursor-pointer">
            <span>⚙</span><span>Settings</span>
          </div>
        </div>
      </aside>
    );
  }

  if (componentId === 'mega-menu') {
    return (
      <div className="w-full max-w-sm bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="font-black text-[10px] uppercase text-neutral-400">Components</p>
            <p className="font-bold hover:text-blue-600 cursor-pointer">Navbars</p>
            <p className="font-bold hover:text-blue-600 cursor-pointer">Buttons</p>
            <p className="font-bold hover:text-blue-600 cursor-pointer">Cards</p>
          </div>
          <div className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl space-y-1">
            <span className="text-[10px] bg-[#4ADE80] font-black px-1.5 py-0.5 rounded border border-black">NEW</span>
            <p className="font-black text-xs">100+ UI Modules</p>
            <p className="text-[10px] text-neutral-600">Zero dependencies.</p>
          </div>
        </div>
      </div>
    );
  }

  if (componentId === 'dropdown-menu' || componentId === 'context-menu') {
    return (
      <div className="w-48 bg-white border-2 border-black rounded-xl p-2 shadow-[4px_4px_0px_#000] text-xs font-bold space-y-1">
        <div className="p-1.5 rounded hover:bg-neutral-100 cursor-pointer flex justify-between">
          <span>Edit Details</span>
          <span className="text-[10px] text-neutral-400">⌘E</span>
        </div>
        <div className="p-1.5 rounded hover:bg-neutral-100 cursor-pointer flex justify-between">
          <span>Duplicate</span>
          <span className="text-[10px] text-neutral-400">⌘D</span>
        </div>
        <div className="border-t border-black/10 pt-1">
          <div className="p-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer">
            Delete Item
          </div>
        </div>
      </div>
    );
  }

  if (componentId === 'breadcrumbs') {
    return (
      <nav className="flex items-center gap-2 text-xs font-bold text-neutral-500">
        <span className="hover:text-black cursor-pointer">Home</span>
        <span>/</span>
        <span className="hover:text-black cursor-pointer">UI Library</span>
        <span>/</span>
        <span className="text-black font-black">Breadcrumbs</span>
      </nav>
    );
  }

  if (componentId === 'tabs' || componentId === 'vertical-tabs') {
    const tabs = ['Preview', 'Code', 'Docs'];
    return (
      <div className="inline-flex p-1 bg-neutral-200 border-2 border-black rounded-xl">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setTabIndex(idx)}
            className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
              tabIndex === idx ? 'bg-white text-black shadow-[2px_2px_0px_#000]' : 'text-neutral-600 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  }

  if (componentId === 'bottom-navigation' || componentId === 'floating-navigation') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full shadow-[3px_3px_0px_#000] text-xs font-black">
        <button className="p-2 hover:bg-neutral-100 rounded-full cursor-pointer">🏠 Home</button>
        <button className="p-2 bg-[#FACC15] rounded-full border border-black cursor-pointer">🔍 Search</button>
        <button className="p-2 hover:bg-neutral-100 rounded-full cursor-pointer">⭐ Saved</button>
      </div>
    );
  }

  if (componentId === 'pagination') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-black">
        <button className="px-2.5 py-1 rounded-lg border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000]">←</button>
        <button className="w-7 h-7 rounded-lg border-2 border-black bg-[#FACC15] shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center">1</button>
        <button className="w-7 h-7 rounded-lg border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center">2</button>
        <button className="w-7 h-7 rounded-lg border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center">3</button>
        <button className="px-2.5 py-1 rounded-lg border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000]">→</button>
      </div>
    );
  }

  if (componentId === 'step-navigation') {
    return (
      <div className="flex items-center gap-2 text-xs font-black">
        <span className="w-6 h-6 rounded-full bg-[#4ADE80] border-2 border-black flex items-center justify-center text-[10px]">✓</span>
        <span>Details</span>
        <div className="w-8 h-0.5 bg-black"></div>
        <span className="w-6 h-6 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center text-[10px] shadow-[1px_1px_0px_#000]">2</span>
        <span>Review</span>
      </div>
    );
  }

  // 2. BUTTONS
  if (componentId === 'primary-button') {
    return (
      <button
        onClick={() => setCount(count + 1)}
        className="px-5 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer"
      >
        Primary Action {count > 1 ? `(${count})` : ''}
      </button>
    );
  }

  if (componentId === 'secondary-button') {
    return (
      <button className="px-4 py-2 bg-white hover:bg-neutral-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer">
        Secondary Action
      </button>
    );
  }

  if (componentId === 'outline-button') {
    return (
      <button className="px-4 py-2 bg-transparent hover:bg-[#FACC15] text-black font-black text-xs rounded-xl border-2 border-black transition cursor-pointer">
        Outline Button ↗
      </button>
    );
  }

  if (componentId === 'ghost-button') {
    return (
      <button className="px-3 py-1.5 text-neutral-600 hover:text-black hover:bg-black/5 rounded-lg text-xs font-bold transition cursor-pointer">
        Ghost Action
      </button>
    );
  }

  if (componentId === 'icon-button') {
    return (
      <button className="w-9 h-9 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-sm font-black hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer">
        ⚡
      </button>
    );
  }

  if (componentId === 'floating-action-button') {
    return (
      <button className="w-12 h-12 rounded-full bg-[#4ADE80] border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center text-xl font-black hover:-translate-y-1 active:translate-y-0.5 transition cursor-pointer">
        +
      </button>
    );
  }

  if (componentId === 'split-button') {
    return (
      <div className="inline-flex rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] overflow-hidden bg-white">
        <button className="px-4 py-2 bg-[#38BDF8] hover:bg-[#0284c7] hover:text-white font-black text-xs border-r-2 border-black transition cursor-pointer">
          Publish
        </button>
        <button className="px-2.5 py-2 bg-[#38BDF8] hover:bg-[#0284c7] hover:text-white font-black text-xs transition cursor-pointer">
          ▼
        </button>
      </div>
    );
  }

  if (componentId === 'toggle-button') {
    return (
      <button
        onClick={() => setToggleActive(!toggleActive)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black transition cursor-pointer ${
          toggleActive ? 'bg-[#F472B6] text-black' : 'bg-white text-neutral-600 hover:bg-neutral-50'
        }`}
      >
        <span>{toggleActive ? '♥' : '♡'}</span>
        <span>{toggleActive ? 'Favorited' : 'Favorite'}</span>
      </button>
    );
  }

  if (componentId === 'loading-button') {
    return (
      <button disabled className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] opacity-80 cursor-wait">
        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>Processing...</span>
      </button>
    );
  }

  if (componentId === 'download-button') {
    return (
      <button className="flex items-center gap-2 px-4 py-2 bg-[#A78BFA] hover:bg-[#8B5CF6] hover:text-white text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
        <span>⬇</span>
        <span>Download Asset</span>
        <span className="px-1.5 py-0.5 bg-white text-black text-[10px] rounded border border-black">.ZIP</span>
      </button>
    );
  }

  if (componentId === 'copy-button') {
    const handleCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-black text-xs font-black transition cursor-pointer ${
          copied ? 'bg-[#4ADE80] text-black shadow-none' : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5'
        }`}
      >
        <span>{copied ? '✓' : '📋'}</span>
        <span>{copied ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
      </button>
    );
  }

  if (componentId === 'social-buttons') {
    return (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button className="flex items-center justify-center gap-2 py-2 px-3 bg-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
          <span>G</span> Continue with Google
        </button>
        <button className="flex items-center justify-center gap-2 py-2 px-3 bg-black text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
          <span>🐙</span> Continue with GitHub
        </button>
      </div>
    );
  }

  // 3. CARDS
  if (componentId === 'basic-card') {
    return (
      <div className="max-w-xs bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] space-y-2 text-xs">
        <h4 className="font-black text-sm text-black">Interactive Basic Card</h4>
        <p className="text-neutral-600">Clean container with generous spacing and high contrast neo-brutalist borders.</p>
        <button className="px-3 py-1.5 bg-[#FACC15] text-black font-black rounded-lg border border-black text-xs">Explore</button>
      </div>
    );
  }

  if (componentId === 'profile-card') {
    return (
      <div className="max-w-xs bg-[#FAF7F2] p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] text-center space-y-2 text-xs">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#38BDF8] border-2 border-black flex items-center justify-center font-black text-base shadow-[2px_2px_0px_#000]">
          AR
        </div>
        <h4 className="font-black text-sm">Alex Rivera</h4>
        <p className="text-neutral-500 font-mono text-[11px]">@alexrivera · UI Engineer</p>
        <button className="w-full py-1.5 bg-[#FACC15] font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">Follow</button>
      </div>
    );
  }

  if (componentId === 'product-card') {
    return (
      <div className="max-w-xs bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden text-xs">
        <div className="h-28 bg-[#FFE4E6] border-b-2 border-black flex items-center justify-center text-3xl font-black">
          👟
        </div>
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center font-black">
            <span>Neo Sneaker 01</span>
            <span>$95</span>
          </div>
          <button className="w-full py-1.5 bg-[#4ADE80] font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] text-xs">Add to Cart</button>
        </div>
      </div>
    );
  }

  if (componentId === 'statistics-card' || componentId === 'statistics') {
    return (
      <div className="max-w-xs bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] space-y-1 text-xs">
        <p className="text-neutral-500 font-bold">Active Components</p>
        <div className="text-3xl font-black text-black">102+</div>
        <span className="text-emerald-600 font-black text-[11px]">↗ All categories covered</span>
      </div>
    );
  }

  if (componentId === 'pricing-card') {
    return (
      <div className="max-w-xs bg-white p-5 rounded-2xl border-2 border-black shadow-[5px_5px_0px_#000] space-y-3 text-xs">
        <span className="px-2 py-0.5 bg-[#FACC15] font-black rounded border border-black text-[10px]">PRO TIER</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black">$29</span>
          <span className="text-neutral-500 font-bold">/month</span>
        </div>
        <p className="text-neutral-600">Full source code & unlimited playground exports.</p>
        <button className="w-full py-2 bg-[#38BDF8] font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">Get Started</button>
      </div>
    );
  }

  if (componentId === 'bento-card') {
    return (
      <div className="max-w-xs bg-white p-5 rounded-3xl border-2 border-black shadow-[4px_4px_0px_#000] space-y-3 text-xs">
        <span className="px-2 py-0.5 bg-[#4ADE80] font-black rounded border border-black text-[10px]">MODULAR</span>
        <h4 className="font-black text-base">Asymmetric Bento Grid</h4>
        <div className="p-2 bg-neutral-900 text-yellow-300 font-mono text-[10px] rounded-lg">
          &lt;BentoCard span="2" /&gt;
        </div>
      </div>
    );
  }

  // 4. FORMS
  if (componentId === 'text-input') {
    return (
      <div className="w-full max-w-xs space-y-1 text-xs">
        <label className="font-black block">Text Input</label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full px-3 py-2 bg-white rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] font-bold outline-none"
        />
      </div>
    );
  }

  if (componentId === 'password-input') {
    return (
      <div className="w-full max-w-xs space-y-1 text-xs">
        <label className="font-black block">Password</label>
        <input
          type="password"
          defaultValue="superSecret123"
          className="w-full px-3 py-2 bg-white rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] font-bold outline-none"
        />
      </div>
    );
  }

  if (componentId === 'search-input') {
    return (
      <div className="w-full max-w-xs relative text-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
        <input
          type="text"
          placeholder="Search components..."
          className="w-full pl-8 pr-12 py-2 bg-white rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] font-bold outline-none"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] bg-[#FAF7F2] border border-black px-1 rounded">⌘K</span>
      </div>
    );
  }

  if (componentId === 'checkbox') {
    return (
      <label onClick={() => setCheckboxChecked(!checkboxChecked)} className="flex items-center gap-2 text-xs font-black cursor-pointer select-none">
        <div className={`w-5 h-5 rounded-lg border-2 border-black flex items-center justify-center font-black ${checkboxChecked ? 'bg-[#4ADE80]' : 'bg-white'}`}>
          {checkboxChecked && '✓'}
        </div>
        <span>Enable live notifications</span>
      </label>
    );
  }

  if (componentId === 'radio-button') {
    return (
      <div className="space-y-2 text-xs font-black">
        {['Standard Option', 'Express Fast Track'].map((opt, i) => (
          <label key={opt} onClick={() => setSelectedRadio(`option-${i}`)} className="flex items-center gap-2 cursor-pointer select-none">
            <div className="w-4 h-4 rounded-full border-2 border-black bg-white flex items-center justify-center">
              {selectedRadio === `option-${i}` && <div className="w-2 h-2 rounded-full bg-black"></div>}
            </div>
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (componentId === 'toggle-switch') {
    return (
      <div className="flex items-center justify-between max-w-xs p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs">
        <span className="font-black">Auto-Save State</span>
        <button
          onClick={() => setSwitchOn(!switchOn)}
          className={`w-11 h-6 rounded-full border-2 border-black p-0.5 transition-colors cursor-pointer ${switchOn ? 'bg-[#4ADE80]' : 'bg-neutral-200'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white border border-black transform transition-transform ${switchOn ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    );
  }

  if (componentId === 'slider') {
    return (
      <div className="w-full max-w-xs space-y-2 text-xs font-black">
        <div className="flex justify-between">
          <span>Scale Value</span>
          <span className="px-1.5 bg-[#FACC15] border border-black rounded">{sliderVal}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={sliderVal}
          onChange={(e) => setSliderVal(Number(e.target.value))}
          className="w-full accent-black cursor-pointer"
        />
      </div>
    );
  }

  if (componentId === 'otp-input') {
    return (
      <div className="flex gap-2">
        {['5', '9', '2', '8'].map((digit, i) => (
          <div key={i} className="w-9 h-11 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center justify-center font-mono font-black text-sm">
            {digit}
          </div>
        ))}
      </div>
    );
  }

  // 5. DATA DISPLAY
  if (componentId === 'data-table') {
    return (
      <div className="w-full max-w-sm border-2 border-black rounded-xl overflow-hidden text-xs bg-white shadow-[3px_3px_0px_#000]">
        <div className="bg-[#FAF7F2] p-2.5 font-black border-b-2 border-black flex justify-between">
          <span>Component</span>
          <span>Status</span>
        </div>
        <div className="p-2.5 border-b border-black/10 flex justify-between font-bold">
          <span>Navbar</span>
          <span className="px-1.5 py-0.5 bg-[#4ADE80] border border-black rounded text-[10px]">Ready</span>
        </div>
        <div className="p-2.5 flex justify-between font-bold">
          <span>Buttons</span>
          <span className="px-1.5 py-0.5 bg-[#4ADE80] border border-black rounded text-[10px]">Ready</span>
        </div>
      </div>
    );
  }

  if (componentId === 'progress-bar') {
    return (
      <div className="w-full max-w-xs space-y-1 text-xs font-black">
        <div className="flex justify-between">
          <span>Completion</span>
          <span>85%</span>
        </div>
        <div className="w-full h-3.5 bg-white border-2 border-black rounded-full overflow-hidden p-0.5 shadow-[1.5px_1.5px_0px_#000]">
          <div className="h-full bg-[#4ADE80] border border-black rounded-full" style={{ width: '85%' }}></div>
        </div>
      </div>
    );
  }

  if (componentId === 'circular-progress') {
    return (
      <div className="w-16 h-16 rounded-full border-4 border-black border-t-[#FACC15] flex items-center justify-center font-black text-xs bg-white shadow-[2px_2px_0px_#000]">
        75%
      </div>
    );
  }

  if (componentId === 'charts' || componentId === 'line-graph' || componentId === 'bar-chart' || componentId === 'pie-chart') {
    return (
      <div className="max-w-xs bg-white p-3 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] text-xs space-y-2">
        <div className="flex justify-between font-black">
          <span>Monthly Visits</span>
          <span className="text-emerald-600">+28%</span>
        </div>
        <div className="h-16 flex items-end gap-2 border-b-2 border-black pb-1">
          <div className="w-6 bg-[#38BDF8] border border-black rounded-t" style={{ height: '40%' }}></div>
          <div className="w-6 bg-[#38BDF8] border border-black rounded-t" style={{ height: '70%' }}></div>
          <div className="w-6 bg-[#FACC15] border border-black rounded-t" style={{ height: '95%' }}></div>
          <div className="w-6 bg-[#4ADE80] border border-black rounded-t" style={{ height: '80%' }}></div>
        </div>
      </div>
    );
  }

  if (componentId === 'avatar' || componentId === 'avatar-group') {
    return (
      <div className="flex items-center -space-x-2">
        <div className="w-9 h-9 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-xs">AR</div>
        <div className="w-9 h-9 rounded-full bg-[#38BDF8] border-2 border-black flex items-center justify-center font-black text-xs">MK</div>
        <div className="w-9 h-9 rounded-full bg-black text-white border-2 border-black flex items-center justify-center font-black text-xs">+3</div>
      </div>
    );
  }

  if (componentId === 'badge' || componentId === 'status-indicator') {
    return (
      <div className="flex gap-2">
        <span className="px-2.5 py-0.5 bg-[#FACC15] text-black font-black text-xs rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
          PRO
        </span>
        <span className="px-2.5 py-0.5 bg-[#4ADE80] text-black font-black text-xs rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
          LIVE
        </span>
      </div>
    );
  }

  if (componentId === 'accordion') {
    return (
      <div className="w-full max-w-xs bg-white border-2 border-black rounded-xl overflow-hidden text-xs">
        <div onClick={() => setAccordionOpen(!accordionOpen)} className="p-3 bg-[#FAF7F2] font-black flex justify-between items-center cursor-pointer select-none">
          <span>How does it work?</span>
          <span>{accordionOpen ? '▲' : '▼'}</span>
        </div>
        {accordionOpen && (
          <div className="p-3 border-t-2 border-black text-neutral-600 font-medium">
            Browse components, view responsive previews, and copy ready-to-use code snippets.
          </div>
        )}
      </div>
    );
  }

  if (componentId === 'modal' || componentId === 'alert-dialog' || componentId === 'confirmation-dialog') {
    return (
      <div className="max-w-xs bg-white p-4 border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000] text-xs space-y-3">
        <div className="flex justify-between items-center font-black border-b border-black pb-2">
          <span>Confirmation Dialog</span>
          <span>✕</span>
        </div>
        <p className="text-neutral-600">Are you sure you want to proceed with this operation?</p>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 font-bold">Cancel</button>
          <button className="px-3 py-1 bg-[#FACC15] font-black rounded-lg border border-black shadow-[1.5px_1.5px_0px_#000]">Confirm</button>
        </div>
      </div>
    );
  }

  if (componentId === 'toast-notification' || componentId === 'banner-alert') {
    return (
      <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-black">
        <span className="w-4 h-4 rounded-full bg-[#4ADE80] border border-black flex items-center justify-center text-[10px]">✓</span>
        <span>Saved to Favorites</span>
      </div>
    );
  }

  if (componentId === 'loading-spinner' || componentId === 'full-screen-loader' || componentId === 'skeleton-loader') {
    return (
      <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] text-xs font-black">
        <div className="w-5 h-5 border-2 border-black border-t-[#FACC15] rounded-full animate-spin"></div>
        <span>Live Spinner Preview</span>
      </div>
    );
  }

  if (componentId === 'chat-interface') {
    return (
      <div className="max-w-xs bg-white border-2 border-black rounded-2xl p-3 shadow-[3px_3px_0px_#000] text-xs space-y-2">
        <div className="bg-[#FAF7F2] p-2 rounded-xl border border-black font-bold">How do I center a div?</div>
        <div className="bg-[#FACC15] p-2 rounded-xl border border-black font-bold text-right">Use flex items-center justify-center!</div>
      </div>
    );
  }

  if (componentId === 'code-editor') {
    return (
      <div className="max-w-xs bg-neutral-900 text-yellow-300 font-mono text-xs p-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
        &lt;Button variant="primary"&gt;Click Me&lt;/Button&gt;
      </div>
    );
  }

  // Fallback for any other component
  return (
    <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] text-center space-y-1">
      <span className="text-xl">✨</span>
      <p className="font-black text-xs capitalize">{componentId.replace(/-/g, ' ')}</p>
      <p className="text-[10px] text-neutral-500 font-mono">Live Interactive Preview</p>
    </div>
  );
};
