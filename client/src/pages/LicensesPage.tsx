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
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
          Open Source Licenses
        </h1>
        <p className="text-base font-bold text-neutral-700 leading-relaxed">
          VexoraMods is licensed under the MIT License and built upon open-source software.
        </p>
      </div>

      <div className="space-y-6">
        {/* VexoraMods MIT License */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-black/10">
            <Shield className="w-5 h-5 text-black stroke-[2.5]" />
            <h2 className="text-base font-black text-black">
              VexoraMods License (MIT)
            </h2>
          </div>
          <pre className="p-4 rounded-xl bg-[#FAF7F2] border-2 border-black text-black font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-[2px_2px_0px_#000]">
            {`MIT License

Copyright (c) 2026 VexoraMods Contributors

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
          <div className="flex items-center gap-2 pb-2 border-b-2 border-black/10">
            <FileText className="w-5 h-5 text-black stroke-[2.5]" />
            <h2 className="text-base font-black text-black">
              Third-Party Dependencies & Libraries
            </h2>
          </div>

          <div className="divide-y-2 divide-black/10 text-xs">
            {dependencies.map((dep) => (
              <div key={dep.name} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-black text-black">{dep.name}</p>
                  <p className="text-neutral-600 font-bold mt-0.5">{dep.purpose}</p>
                </div>
                <span className="font-mono font-bold px-2.5 py-1 rounded-md bg-[#FACC15]/30 border border-black text-black">
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
