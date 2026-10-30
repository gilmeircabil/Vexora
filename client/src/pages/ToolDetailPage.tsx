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
      document.title = `${entry.definition.name} — Vexora - ToolNest`;
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
            <div className="flex items-center justify-center p-16">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ToolComponent />
        </Suspense>
      </div>

      {/* Usage Instructions & Local Architecture Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-neutral-200/90">
        <Card className="space-y-2 bg-white border-neutral-200/90 shadow-2xs">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-neutral-800 text-sm">
              How to use this tool
            </h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {definition.description}
          </p>
          {definition.supportedInputTypes.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                Supported Formats:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {definition.supportedInputTypes.map((type) => (
                  <span
                    key={type}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200/80"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-2 bg-white border-neutral-200/90 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-neutral-800 text-sm">
              Privacy & Local Processing
            </h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {definition.privacyNotice}
          </p>
          <div className="pt-2 text-[11px] text-neutral-500">
            Location:{' '}
            <span className="font-semibold text-neutral-700 capitalize">
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
