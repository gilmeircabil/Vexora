import React from 'react';
import { Card } from '../components/common/Card.js';
import { FileText, Shield } from 'lucide-react';

export const LicensesPage: React.FC = () => {
  const dependencies = [
    { name: 'React & React DOM', license: 'MIT', purpose: 'UI component framework' },
    { name: 'React Router', license: 'MIT', purpose: 'Client-side SPA routing' },
    { name: 'Lucide React', license: 'ISC', purpose: 'Accessible SVG iconography' },
    { name: 'Tailwind CSS', license: 'MIT', purpose: 'Utility-first styling system' },
    { name: 'pdf-lib', license: 'MIT', purpose: 'Client-side PDF document manipulation' },
    { name: 'pdfjs-dist', license: 'Apache-2.0', purpose: 'Client-side PDF page rendering' },
    { name: 'qrcode', license: 'MIT', purpose: 'QR code generator canvas & SVG library' },
    { name: 'diff', license: 'BSD-3-Clause', purpose: 'Text diff and line comparison algorithm' },
    { name: 'entities', license: 'BSD-2-Clause', purpose: 'HTML entity encoding and decoding' },
    { name: 'Prettier', license: 'MIT', purpose: 'AST CSS parser and beautifier' },
    { name: 'Zod', license: 'MIT', purpose: 'TypeScript-first schema validation' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          Open Source Licenses
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          VexoraTool is licensed under the MIT License and built upon open-source software.
        </p>
      </div>

      <div className="space-y-6">
        {/* VexoraTool MIT License */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              VexoraTool License (MIT)
            </h2>
          </div>
          <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {`MIT License

Copyright (c) 2026 VexoraTool Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </pre>
        </Card>

        {/* Third-Party Dependencies */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Third-Party Dependencies & Libraries
            </h2>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {dependencies.map((dep) => (
              <div key={dep.name} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{dep.name}</p>
                  <p className="text-neutral-500 mt-0.5">{dep.purpose}</p>
                </div>
                <span className="font-mono px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                  {dep.license}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
