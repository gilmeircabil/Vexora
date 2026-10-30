import React from 'react';
import { Card } from '../components/common/Card.js';
import { GitPullRequest, Code2, CheckCircle2, Shield } from 'lucide-react';

export const ContributingPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          Contributing to ToolNest
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          ToolNest is community-driven and welcomes new offline-first browser utilities,
          accessibility fixes, and performance improvements.
        </p>
      </div>

      <div className="space-y-6 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Contribution Standards
            </h2>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-xs">
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
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Step-by-Step: Adding a New Tool
            </h2>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-xs">
            <li>
              <strong>Define the Tool in the Catalog:</strong> Add the metadata entry in{' '}
              <code>src/tools/catalog.ts</code> (id, slug, name, category, keywords, privacy
              notice).
            </li>
            <li>
              <strong>Implement Pure Logic:</strong> Write the domain algorithms in{' '}
              <code>src/lib/&lt;domain&gt;/</code> and add unit tests under <code>src/test/</code>.
            </li>
            <li>
              <strong>Create the Tool Component:</strong> Build the accessible UI under{' '}
              <code>src/features/&lt;category&gt;/YourTool.tsx</code>.
            </li>
            <li>
              <strong>Register the Component:</strong> Connect the component in{' '}
              <code>src/tools/registry.ts</code> using <code>React.lazy</code>.
            </li>
            <li>
              <strong>Run Quality Checks:</strong> Verify that <code>npm run typecheck</code>,{' '}
              <code>npm run test</code>, and <code>npm run build</code> pass without errors.
            </li>
          </ol>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Submitting a Pull Request
            </h2>
          </div>
          <p className="text-xs">
            Fork the repository, create a descriptive feature branch (e.g.{' '}
            <code>feature/audio-trimmer</code>), commit your changes with clean messages, and open a
            Pull Request. CI will run typechecks, linting, and automated tests.
          </p>
        </Card>
      </div>
    </div>
  );
};
