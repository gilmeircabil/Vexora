import React, { useEffect, Suspense } from 'react';
import { useParams, Navigate } from 'react-router';
import { getToolRegistryEntry } from '../tools/registry.js';
import { ToolHeader } from '../components/common/ToolHeader.js';
import { RelatedTools } from '../components/common/RelatedTools.js';
import { Card } from '../components/common/Card.js';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export const ToolDetailPage: React.FC = () => {
  const { toolSlug } = useParams<{ toolSlug: string }>();

  const entry = toolSlug ? getToolRegistryEntry(toolSlug) : null;

  useEffect(() => {
    if (entry) {
      document.title = `${entry.definition.name} — VexoraMods`;
    }
  }, [entry]);

  if (!entry) {
    return <Navigate to="/404" replace />;
  }

  const { definition, component: ToolComponent } = entry;

  return (
    <div className="space-y-12">
      {/* Header and metadata */}
      <ToolHeader tool={definition} />

      {/* Main Tool Interactive Area */}
      <div className="min-h-[360px]">
        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center p-16 gap-3"
            >
              <div className="w-9 h-9 border-4 border-black border-t-[#FACC15] rounded-full animate-spin" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600">
                Loading tool workspace...
              </span>
            </div>
          }
        >
          <ToolComponent />
        </Suspense>
      </div>

      {/* Usage Instructions & Local Architecture Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t-2 border-black/10">
        <Card className="space-y-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-black stroke-[2.5]" />
            <h3 className="font-black text-black text-sm">How to use this tool</h3>
          </div>
          <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
            {definition.description}
          </p>
          {definition.supportedInputTypes.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-black text-black uppercase tracking-wider block mb-1 font-mono">
                Supported Formats:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {definition.supportedInputTypes.map((type) => (
                  <span
                    key={type}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FACC15]/30 text-black border border-black"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
            <h3 className="font-black text-black text-sm">Privacy & Local Processing</h3>
          </div>
          <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
            {definition.privacyNotice}
          </p>
          <div className="pt-2 text-[11px] font-mono font-bold text-neutral-600">
            Location:{' '}
            <span className="font-black text-black uppercase">
              {definition.processingLocation}-side execution
            </span>
          </div>
        </Card>
      </div>

      {/* Related Tools Carousel / Grid */}
      <RelatedTools currentToolId={definition.id} />
    </div>
  );
};
