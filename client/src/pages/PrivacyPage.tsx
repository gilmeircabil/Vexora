import React from 'react';
import { Card } from '../components/common/Card.js';
import { ShieldCheck, HardDrive, EyeOff, Lock, AlertTriangle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Local-First Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          Privacy Policy & Architecture
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          How VexoraTool processes your data, why your files never leave your device, and our
          commitment to transparency.
        </p>
      </div>

      <div className="space-y-6 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              1. Where Your Files Are Processed
            </h2>
          </div>
          <p>
            Every currently published tool on VexoraTool operates{' '}
            <strong>entirely inside your browser</strong>. When you drop a PDF, image, or text
            snippet into a tool:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
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
            <EyeOff className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
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
            <Lock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              3. Passwords & Cryptographic Keys
            </h2>
          </div>
          <p>
            The Password Generator and UUID Generator use the standard{' '}
            <code>crypto.getRandomValues()</code> and <code>crypto.randomUUID()</code> Web Crypto
            APIs. Generated passwords are never stored in localStorage, sessionStorage, or URL
            parameters. Once you refresh or close the page, all generated secrets are permanently
            cleared from memory.
          </p>
        </Card>

        <Card className="space-y-3 border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base font-bold">4. Honest Security Boundaries</h2>
          </div>
          <p className="text-xs text-amber-900 dark:text-amber-200">
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
