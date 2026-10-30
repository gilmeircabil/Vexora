import React from 'react';
import { Card } from '../components/common/Card.js';
import { GitPullRequest, Code2, CheckCircle2, Shield } from 'lucide-react';

export const ContributingPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
          Contributing to VexoraTool
        </h1>
        <p className="text-base font-bold text-neutral-700 leading-relaxed">
          VexoraTool is community-driven and welcomes new offline-first browser utilities,
          accessibility fixes, and performance improvements.
        </p>
      </div>

      <div className="space-y-6 text-sm text-neutral-800 leading-relaxed font-semibold">
        <Card className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-black/10">
            <Shield className="w-5 h-5 text-black stroke-[2.5]" />
            <h2 className="text-base font-black text-black">
              Contribution Standards
            </h2>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-xs font-semibold">
            <li>
              <strong>Local-First Mandatory:</strong> Tools must process data directly in the
              browser. Do not introduce servers, paid APIs, or third-party webhooks.
            </li>
            <li>
              <strong>No Fake Tools:</strong> Never submit placeholder mockups, non-functioning
              buttons, or fake progress indicators.
            </li>
            <li>
              <strong>Strict TypeScript:</strong> Avoid <code>any</code>. All tool logic must have
              typed results (<code>Result&lt;T, E&gt;</code>).
            </li>
            <li>
              <strong>Unit Tests:</strong> Every new calculation or conversion helper must include
              Vitest unit tests.
            </li>
            <li>
              <strong>Accessibility:</strong> All interactive elements must be keyboard-focusable
              with visible outlines, aria attributes, and proper color contrast.
            </li>
          </ul>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-black/10">
            <Code2 className="w-5 h-5 text-black stroke-[2.5]" />
            <h2 className="text-base font-black text-black">
              Step-by-Step: Adding a New Tool
            </h2>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-xs font-semibold">
            <li>
              <strong>Define the Tool in the Catalog:</strong> Add the metadata entry in{' '}
              <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">src/tools/catalog.ts</code> (id, slug, name, category, keywords, privacy
              notice).
            </li>
            <li>
              <strong>Implement Pure Logic:</strong> Write the domain algorithms in{' '}
              <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">src/lib/&lt;domain&gt;/</code> and add unit tests under <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">src/test/</code>.
            </li>
            <li>
              <strong>Create the Tool Component:</strong> Build the accessible UI under{' '}
              <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">src/features/&lt;category&gt;/YourTool.tsx</code>.
            </li>
            <li>
              <strong>Register the Component:</strong> Connect the component in{' '}
              <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">src/tools/registry.ts</code> using <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">React.lazy</code>.
            </li>
            <li>
              <strong>Run Quality Checks:</strong> Verify that <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">npm run typecheck</code>,{' '}
              <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">npm run test</code>, and <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">npm run build</code> pass without errors.
            </li>
          </ol>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-black/10">
            <GitPullRequest className="w-5 h-5 text-black stroke-[2.5]" />
            <h2 className="text-base font-black text-black">
              Submitting a Pull Request
            </h2>
          </div>
          <p className="text-xs font-semibold">
            Fork the repository, create a descriptive feature branch (e.g.{' '}
            <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">feature/audio-trimmer</code>), commit your changes with clean messages, and open a
            Pull Request. CI will run typechecks, linting, and automated tests.
          </p>
        </Card>
      </div>
    </div>
  );
};
