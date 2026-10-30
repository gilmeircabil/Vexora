import React from 'react';
import { Card } from '../components/common/Card.js';
import { ShieldCheck, HardDrive, EyeOff, Lock, AlertTriangle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ADE80] border-2 border-black text-black text-xs font-black shadow-[2px_2px_0px_#000]">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Verified Local-First Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
          Privacy Policy & Architecture
        </h1>
        <p className="text-base font-bold text-neutral-700 leading-relaxed">
          How VexoraTool processes your data, why your files never leave your device, and our
          commitment to transparency.
        </p>
      </div>

      <div className="space-y-6 text-sm text-neutral-800 leading-relaxed font-semibold">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-black stroke-[2.5]" />
            <h2 className="text-base font-black text-black">
              1. Where Your Files Are Processed
            </h2>
          </div>
          <p>
            Every currently published tool on VexoraTool operates{' '}
            <strong>entirely inside your browser</strong>. When you drop a PDF, image, or text
            snippet into a tool:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs font-semibold">
            <li>
              The file is loaded directly into your device's RAM via browser File and Blob APIs.
            </li>
            <li>
              Calculations, transformations, and compression run using local JavaScript, HTML5
              Canvas, and WebAssembly.
            </li>
            <li>
              Resulting files are generated in local memory and downloaded via temporary object URLs
              that are revoked immediately after use.
            </li>
            <li>
              <strong>
                Zero file bytes, metadata, or logs are transmitted over the network or saved to our
                servers.
              </strong>
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-black stroke-[2.5]" />
            <h2 className="text-base font-black text-black">
              2. Analytics & Tracking
            </h2>
          </div>
          <p>
            VexoraTool does not use Google Analytics, Facebook Pixels, user fingerprinting, or
            tracking cookies. We do not maintain user profiles or monitor individual tool usage.
          </p>
          <p>
            Standard web hosting infrastructure (such as CDN edge servers) may record customary HTTP
            request logs (IP address, user agent) strictly for DDoS mitigation and reliability, but
            your payload data is never visible to or captured by edge servers.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-black stroke-[2.5]" />
            <h2 className="text-base font-black text-black">
              3. Passwords & Cryptographic Keys
            </h2>
          </div>
          <p>
            The Password Generator and UUID Generator use the standard{' '}
            <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">crypto.getRandomValues()</code> and <code className="bg-[#FACC15]/30 px-1 py-0.5 rounded border border-black font-mono">crypto.randomUUID()</code> Web Crypto
            APIs. Generated passwords are never stored in localStorage, sessionStorage, or URL
            parameters. Once you refresh or close the page, all generated secrets are permanently
            cleared from memory.
          </p>
        </Card>

        <Card className="space-y-3 bg-[#FACC15]/20">
          <div className="flex items-center gap-2 text-black">
            <AlertTriangle className="w-5 h-5 text-black stroke-[2.5]" />
            <h2 className="text-base font-black">4. Honest Security Boundaries</h2>
          </div>
          <p className="text-xs text-neutral-800 font-semibold">
            While VexoraTool does not upload or retain your files, local-first web applications still
            run inside your browser environment. If your computer has malware, untrusted browser
            extensions with permission to read web pages, or compromised memory, those extensions
            could theoretically inspect DOM data. Always keep your browser updated and review
            installed extensions.
          </p>
        </Card>
      </div>
    </div>
  );
};
