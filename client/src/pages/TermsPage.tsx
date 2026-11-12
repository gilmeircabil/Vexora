import React from 'react';
import { Card } from '../components/common/Card.js';
import { FileText, ShieldAlert, Cpu, HeartHandshake, Scale } from 'lucide-react';
import { Link } from 'react-router';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10 text-[var(--theme-dirty-white)]">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] text-xs font-semibold">
          <Scale className="w-3.5 h-3.5 stroke-[2]" />
          <span>Terms of Use &amp; Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--theme-dirty-white)]">
          Terms of Service
        </h1>
        <p className="text-base font-normal text-[var(--theme-gray-muted)] leading-relaxed">
          Welcome to VexoraMods. These terms govern your access to and use of our 100% free and
          open-source web utilities, Design Studio, and Learning Hub.
        </p>
      </div>

      <div className="space-y-6 text-sm text-[var(--theme-dirty-white-muted)] leading-relaxed font-normal">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">
              1. Open Philosophy &amp; Free Access
            </h2>
          </div>
          <p>
            VexoraMods is provided completely free of charge. There are no subscriptions, hidden
            tiers, or paywalled features. You may use our client-side utilities without creating an
            account. Account registration is optional and serves to save your custom Design Studio
            projects and participate in the community Learning Hub.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">2. Acceptable Use Policy</h2>
          </div>
          <p>By accessing VexoraMods, you agree that you will not:</p>
          <ul className="list-disc list-inside space-y-1 text-xs font-normal text-[var(--theme-dirty-white-muted)]">
            <li>
              Attempt to bypass, disable, or disrupt the rate limiters, security controls, or
              infrastructure of the platform.
            </li>
            <li>
              Submit, process, or distribute unlawful, defamatory, harassing, or malicious content,
              including malware, viruses, or exploit scripts.
            </li>
            <li>
              Interfere with other users&apos; access or engage in abusive automated scraping that
              degrades service availability for others.
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">
              3. User Content &amp; Intellectual Property
            </h2>
          </div>
          <p>
            <strong className="text-[var(--theme-dirty-white)]">Your Content:</strong> You retain 100% ownership of all images, documents, and
            designs you create or process using VexoraMods. Standard utility processing occurs
            locally in your browser RAM and is never stored on our servers.
          </p>
          <p>
            <strong className="text-[var(--theme-dirty-white)]">Community Submissions:</strong> If you publish articles, tutorials, or public
            templates in the Learning Hub, you grant VexoraMods a non-exclusive license to host and
            display that content for the community.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">
              4. Local AI &amp; Self-Hosted Integration
            </h2>
          </div>
          <p>
            AI utilities are powered by local in-browser algorithms or your self-hosted Ollama /
            Python instances. You are responsible for ensuring that your local models and compute
            environments comply with applicable laws and acceptable use guidelines.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <h2 className="text-base font-bold text-[var(--theme-dirty-white)]">
              5. Disclaimer of Warranties &amp; Limitation of Liability
            </h2>
          </div>
          <p className="text-xs text-[var(--theme-gray-muted)] font-normal">
            VexoraMods and its source code are licensed under the MIT License and provided &ldquo;as
            is&rdquo;, without warranty of any kind, express or implied. In no event shall the
            authors, maintainers, or contributors be liable for any claim, damages, or other
            liability arising from the use of the platform. Please see our{' '}
            <Link to="/licenses" className="text-[var(--theme-dirty-white)] font-semibold underline hover:text-[var(--theme-dirty-white-muted)]">
              Open Source Licenses
            </Link>{' '}
            for full software license terms.
          </p>
        </Card>
      </div>
    </div>
  );
};
