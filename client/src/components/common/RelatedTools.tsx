import React from 'react';
import { getRelatedTools } from '../../tools/catalog.js';
import { ToolCard } from './ToolCard.js';

interface RelatedToolsProps {
  currentToolId: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentToolId }) => {
  const related = getRelatedTools(currentToolId, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-neutral-200/90">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-800">Related Tools</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Other utilities you might find useful</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
};
