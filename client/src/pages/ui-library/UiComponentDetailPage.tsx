import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft,
  Copy,
  Check,
  Star,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  ExternalLink,
  BookOpen,
  Code2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { findAnyCatalogItem, UIComponentItem } from '../../features/ui-library/data/index.js';
import { ComponentPreviewRenderer } from '../../features/ui-library/previews/ComponentPreviewRenderer.js';
import { useUiLibraryFavorites } from '../../features/ui-library/context/UiLibraryFavoritesContext.js';

export const UiComponentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isFavorite, toggleFavorite } = useUiLibraryFavorites();

  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [codeTab, setCodeTab] = useState<'react' | 'html' | 'css'>('react');
  const [copied, setCopied] = useState(false);

  if (!id) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <h2 className="text-xl font-black">Component Not Found</h2>
        <Link to="/ui-library" className="inline-flex items-center gap-2 px-4 py-2 bg-[#FACC15] border-2 border-black rounded-xl font-black text-xs">
          ← Back to UI Library
        </Link>
      </div>
    );
  }

  const result = findAnyCatalogItem(id);

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] my-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAF7F2] border-2 border-black flex items-center justify-center text-3xl">
          🔍
        </div>
        <h2 className="text-xl font-black text-black">Item Not Found</h2>
        <p className="text-xs text-neutral-600 max-w-sm mx-auto">
          We couldn't find a component, layout, or style matching <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono font-bold">"{id}"</code>.
        </p>
        <Link to="/ui-library" className="inline-flex items-center gap-2 px-5 py-2 bg-[#FACC15] border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_#000]">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const { item, type } = result;
  const isComponent = type === 'component';
  const compItem = isComponent ? (item as UIComponentItem) : null;

  // Selected variation
  const variations = compItem?.variations || [];
  const currentVariation = variations[selectedVariationIdx] || variations[0];

  // Active code snippet
  let currentCode = '';
  if (isComponent && currentVariation) {
    if (codeTab === 'react') currentCode = currentVariation.codeReact;
    else if (codeTab === 'html') currentCode = currentVariation.codeHtml;
    else if (codeTab === 'css') currentCode = currentVariation.codeCss || `/* Tailwind utility classes applied directly */\n.neo-element {\n  border: 2px solid #000000;\n  box-shadow: 3px 3px 0px #000000;\n}`;
  } else if ('codeReact' in item && 'codeHtml' in item) {
    currentCode = codeTab === 'react' ? (item as { codeReact: string }).codeReact : (item as { codeHtml: string }).codeHtml;
  } else if ('codeSnippet' in item) {
    currentCode = (item as { codeSnippet: string }).codeSnippet;
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const favorited = isFavorite(item.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-neutral-500">
        <Link to="/ui-library" className="hover:text-black transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>UI Library</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <span className="capitalize">{type.replace('-', ' ')}</span>
        <ChevronRight className="w-3 h-3 text-neutral-400" />
        <span className="text-black font-black">{item.name}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-[#FAF7F2] p-6 md:p-8 rounded-3xl border-2 border-black shadow-[5px_5px_0px_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#FACC15] text-black font-black text-[10px] uppercase rounded-lg border border-black shadow-[1.5px_1.5px_0px_#000]">
              {type.replace('-', ' ')}
            </span>
            {compItem && (
              <span className="px-2.5 py-0.5 bg-white text-black font-black text-[10px] uppercase rounded-lg border border-black">
                {compItem.category}
              </span>
            )}
            {compItem && (
              <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg border border-black ${
                compItem.difficulty === 'beginner' ? 'bg-[#4ADE80]' : compItem.difficulty === 'intermediate' ? 'bg-[#38BDF8]' : 'bg-[#F472B6]'
              }`}>
                {compItem.difficulty.toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">{item.name}</h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Favorite & Action Buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
          <button
            onClick={() => toggleFavorite(item.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-black font-black text-xs shadow-[2.5px_2.5px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer ${
              favorited ? 'bg-[#F472B6] text-black' : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Star className={`w-4 h-4 ${favorited ? 'fill-black' : ''}`} />
            <span>{favorited ? 'Favorited' : 'Add to Favorites'}</span>
          </button>

          <Link
            to="/ui-library/playground"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Playground</span>
          </Link>
        </div>
      </div>

      {/* Large Live Preview Section */}
      <section className="bg-white rounded-3xl border-2 border-black shadow-[5px_5px_0px_#000] overflow-hidden">
        {/* Preview Control Bar */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b-2 border-black flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-black" />
            <span className="font-black text-xs uppercase tracking-wider text-black">Live Rendered Preview</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Variation Selector if Component */}
            {variations.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 bg-white border border-black rounded-xl">
                {variations.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariationIdx(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      selectedVariationIdx === idx
                        ? 'bg-[#FACC15] text-black border border-black shadow-sm'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}

            {/* Viewport Switcher */}
            <div className="flex items-center gap-1 p-1 bg-white border border-black rounded-xl">
              <button
                onClick={() => setPreviewViewport('desktop')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  previewViewport === 'desktop' ? 'bg-[#FACC15] text-black border border-black' : 'text-neutral-500'
                }`}
                title="Desktop View (100%)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewViewport('tablet')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  previewViewport === 'tablet' ? 'bg-[#FACC15] text-black border border-black' : 'text-neutral-500'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewViewport('mobile')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  previewViewport === 'mobile' ? 'bg-[#FACC15] text-black border border-black' : 'text-neutral-500'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div className="p-8 md:p-14 bg-[#F5F2EB] flex items-center justify-center min-h-[320px] overflow-x-auto">
          <ComponentPreviewRenderer
            itemId={item.id}
            itemType={type}
            variationId={currentVariation?.id}
            previewMode={previewViewport}
          />
        </div>

        {/* Variation Subtitle if present */}
        {currentVariation?.description && (
          <div className="px-6 py-3 bg-[#FAF7F2] border-t-2 border-black text-xs font-bold text-neutral-600">
            <span className="font-black text-black">Active Variation: </span>
            {currentVariation.description}
          </div>
        )}
      </section>

      {/* Code Snippets Section */}
      <section className="bg-neutral-900 text-neutral-100 rounded-3xl border-2 border-black shadow-[5px_5px_0px_#000] overflow-hidden">
        <div className="px-6 py-3.5 bg-neutral-950 border-b border-neutral-800 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-yellow-400" />
            <span className="font-mono text-xs font-bold text-neutral-200">Implementation Code</span>
            <div className="flex gap-1 ml-3">
              {(['react', 'html', 'css'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCodeTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
                    codeTab === tab
                      ? 'bg-yellow-400 text-black'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-black font-black text-xs rounded-xl border border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-6 overflow-x-auto font-mono text-xs text-neutral-200 leading-relaxed max-h-[380px]">
          <code>{currentCode}</code>
        </pre>
      </section>

      {/* Beginner-Friendly Learning Information */}
      <section className="bg-white p-6 md:p-8 rounded-3xl border-2 border-black shadow-[5px_5px_0px_#000] space-y-6">
        <div className="flex items-center gap-2 border-b-2 border-black pb-4">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-black text-black">Design & Learning Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          {/* What is it? */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border-2 border-black space-y-1.5">
            <h3 className="font-black text-sm text-black">What is it?</h3>
            <p className="text-neutral-700 font-medium">
              {compItem?.whatIsIt || item.description}
            </p>
          </div>

          {/* What is it used for? */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border-2 border-black space-y-1.5">
            <h3 className="font-black text-sm text-black">What is it used for?</h3>
            <p className="text-neutral-700 font-medium">
              {compItem?.whatIsItUsedFor || (item as { useCase?: string }).useCase || 'Core structural component in modern web applications.'}
            </p>
          </div>

          {/* Where should you use it? */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border-2 border-black space-y-1.5">
            <h3 className="font-black text-sm text-black">Where should you use it?</h3>
            <p className="text-neutral-700 font-medium">
              {compItem?.whereToUse || (item as { bestFor?: string }).bestFor || 'Everywhere clean user interface hierarchy is needed.'}
            </p>
          </div>

          {/* Key Advantages */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border-2 border-black space-y-2">
            <h3 className="font-black text-sm text-black">Key Advantages</h3>
            <ul className="space-y-1 text-neutral-700 font-medium">
              {compItem?.advantages?.map((adv, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>{adv}</span>
                </li>
              )) ||
                (item as { characteristics?: string[] }).characteristics?.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-black">✓</span>
                    <span>{c}</span>
                  </li>
                )) || (
                  <li>Standardized accessible pattern proven across the industry.</li>
                )}
            </ul>
          </div>
        </div>

        {/* Related Components */}
        {compItem?.relatedComponents && compItem.relatedComponents.length > 0 && (
          <div className="pt-4 border-t-2 border-black/10 space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-neutral-500">Related Components</h4>
            <div className="flex flex-wrap gap-2">
              {compItem.relatedComponents.map((relId) => (
                <Link
                  key={relId}
                  to={`/ui-library/component/${relId}`}
                  className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#FACC15] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer capitalize"
                >
                  {relId.replace(/-/g, ' ')} →
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
