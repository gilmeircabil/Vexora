import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Lock, Cpu, Sparkles, Terminal, ExternalLink, Mail } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.js';
import { platformApi } from '../../services/platformApi.js';

export const Footer: React.FC = () => {
  const [contactEmail, setContactEmail] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [socialLinks, setSocialLinks] = useState<Array<{ label: string; url: string }>>([]);

  useEffect(() => {
    platformApi
      .getHomeOverview()
      .then((res) => {
        if (res?.success && res.data?.config) {
          const cfg = res.data.config;
          if (cfg.contactEmail) setContactEmail(cfg.contactEmail);
          if (cfg.githubUrl) setGithubUrl(cfg.githubUrl);
          if (Array.isArray(cfg.socialLinks)) setSocialLinks(cfg.socialLinks);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer id="contact" className="mt-20 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto rounded-3xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] shadow-sm p-8 sm:p-12 transition-colors text-[var(--theme-dirty-white)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Mission & Identity */}
          <div className="md:col-span-1 space-y-3">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
              className="inline-block group"
              aria-label="VexoraMods Home"
            >
              <BrandLogo size="md" />
            </Link>
            <p className="text-xs font-medium text-[var(--theme-gray-muted)] leading-relaxed">
              Everything You Need. One Platform. Discover free online tools, explore AI-powered
              utilities, create designs, and learn with a growing community.
            </p>
          </div>

          {/* Col 2: Core Platform Workspaces */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-dirty-white)] font-mono mb-3.5">
              Platform Workspaces
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  to="/tools"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  All Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-chat"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  AI Chat
                </Link>
              </li>
              <li>
                <Link
                  to="/studio"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  Studio
                </Link>
              </li>
              <li>
                <Link
                  to="/ui-library"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  UI Library
                </Link>
              </li>
              <li>
                <Link
                  to="/learning"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  Learning Hub
                </Link>
              </li>
              <li>
                <Link
                  to="/study"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  Study Space
                </Link>
              </li>
              <li>
                <Link
                  to="/discover"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors font-semibold"
                >
                  Vexora Discover
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Guarantees & Values */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-dirty-white)] font-mono mb-3.5">
              Open Philosophy
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-[var(--theme-dirty-white-muted)]">
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--theme-dirty-white)] shrink-0 stroke-[2.2]" />
                <span>Zero Cloud Lock-in</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--theme-dirty-white)] shrink-0 stroke-[2.2]" />
                <span>Local &amp; Built-in AI Processing</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--theme-dirty-white)] shrink-0 stroke-[2.2]" />
                <span>No Subscriptions or Paywalls</span>
              </li>
              <li className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--theme-dirty-white)] shrink-0 stroke-[2.2]" />
                <span>Community-Driven Knowledge</span>
              </li>
            </ul>
          </div>

          {/* Col 4: About, Contact Info (if configured) & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-dirty-white)] font-mono mb-3.5">
              Information &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  to="/about"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  to="/licenses"
                  className="text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                >
                  Licenses
                </Link>
              </li>
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-1.5 text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
                    <span>{contactEmail}</span>
                  </a>
                </li>
              )}
              {githubUrl && (
                <li>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                  >
                    <span>Open-Source Repository</span>
                    <ExternalLink className="w-3 h-3 text-[var(--theme-dirty-white)]" />
                  </a>
                </li>
              )}
              {socialLinks.map((social, idx) => (
                <li key={idx}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] transition-colors"
                  >
                    <span>{social.label}</span>
                    <ExternalLink className="w-3 h-3 text-[var(--theme-dirty-white)]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 border-t border-[var(--theme-gray-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[var(--theme-gray-muted)]">
          <p className="font-mono">
            © {new Date().getFullYear()} VexoraMods · Everything You Need. One Platform.
          </p>
          <p className="text-center sm:text-right">
            Free &amp; open-source utilities, visual design studio, and learning community.
          </p>
        </div>
      </div>
    </footer>
  );
};
