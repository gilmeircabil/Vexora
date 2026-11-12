import React from 'react';
import { Card } from '../components/common/Card.js';
import { ShieldCheck, HardDrive, EyeOff, Lock, AlertTriangle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10 text-slate-100">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
          <span>Verified Local-First Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">
          Privacy Policy & Architecture
        </h1>
        <p className="text-base font-normal text-slate-400 leading-relaxed">
          How VexoraMods processes your data, why your files never leave your device, and our
          commitment to transparency.
        </p>
      </div>

      <div className="space-y-6 text-sm text-[var(--theme-dirty-white-muted)] leading-relaxed font-normal">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">1. Where Your Files Are Processed</h2>
          </div>
          <p>
            Every currently published tool on VexoraMods operates{' '}
            <strong className="text-[var(--theme-dirty-white)]">entirely inside your browser</strong>. When you drop a PDF, image, or text
            snippet into a tool:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs font-normal text-[var(--theme-dirty-white-muted)]">
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
              <strong className="text-[var(--theme-dirty-white)]">
                Zero file bytes, metadata, or logs are transmitted over the network or saved to our
                servers.
              </strong>
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">2. Analytics & Tracking</h2>
          </div>
          <p>
            VexoraMods does not use Google Analytics, Facebook Pixels, user fingerprinting, or
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
            <Lock className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">3. Passwords & Cryptographic Keys</h2>
          </div>
          <p>
            The Password Generator and UUID Generator use the standard{' '}
            <code className="bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] px-1 py-0.5 rounded border border-[var(--theme-gray-border)] font-mono">
              crypto.getRandomValues()
            </code>{' '}
            and{' '}
            <code className="bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] px-1 py-0.5 rounded border border-[var(--theme-gray-border)] font-mono">
              crypto.randomUUID()
            </code>{' '}
            Web Crypto APIs. Generated passwords are never stored in localStorage, sessionStorage,
            or URL parameters. Once you refresh or close the page, all generated secrets are
            permanently cleared from memory.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">
              4. Optional Accounts &amp; Cloud Studio Storage
            </h2>
          </div>
          <p>
            Account registration on VexoraMods is completely optional. If you choose to create an
            account:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs font-normal text-[var(--theme-dirty-white-muted)]">
            <li>
              We store your name, email address, and a securely salted bcrypt password hash in our
              database. Plaintext passwords are never stored or logged.
            </li>
            <li>
              When using VexoraMods Studio, canvas object models and version history are saved to
              your account so you can continue editing from any device.
            </li>
            <li>
              Session continuity is maintained using a secure, HTTP-only cookie ({' '}
              <code className="bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] px-1 py-0.5 rounded border border-[var(--theme-gray-border)] font-mono">
                refreshToken
              </code>
              ). We do not store tokens in unencrypted local storage.
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">
              5. Bot Protection &amp; Spam Defense
            </h2>
          </div>
          <p>
            To prevent automated account enumeration, brute-force attacks, and denial-of-service,
            our registration and authentication endpoints use Cloudflare Turnstile. Turnstile
            evaluates visitor telemetry non-invasively to confirm human presence without cookies or
            cross-site tracking.
          </p>
        </Card>

        <Card className="space-y-3 bg-[var(--theme-surface-raised)] border-[var(--theme-gray-border)]">
          <div className="flex items-center gap-2 text-[var(--theme-dirty-white)]">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">
              6. Honest Security Boundaries &amp; Data Rights
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-normal">
            You have full control over your data. You may export your Design Studio projects at any
            time in PNG, SVG, or JSON format. If you wish to delete your account or any personal
            data, you can do so directly from your dashboard or by contacting the maintainers. While
            VexoraMods does not upload or retain your standard utility files, local-first web
            applications run inside your browser environment. Always keep your browser updated and
            review installed extensions.
          </p>
        </Card>
      </div>
    </div>
  );
};
