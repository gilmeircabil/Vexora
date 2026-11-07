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
    <footer className="mt-20 border-t-2 border-black bg-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Mission & Identity */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="inline-block group" aria-label="VexoraMods Home">
              <BrandLogo size="md" />
            </Link>
            <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
              Everything You Need. One Platform. Discover free online tools, explore AI-powered
              utilities, create designs, and learn with a growing community.
            </p>
          </div>

          {/* Col 2: Core Platform Workspaces */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3.5">
              Platform Workspaces
            </h4>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <Link
                  to="/tools"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  All Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-chat"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  AI Chat
                </Link>
              </li>
              <li>
                <Link
                  to="/studio"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Studio
                </Link>
              </li>
              <li>
                <Link
                  to="/ui-library"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  UI Library
                </Link>
              </li>
              <li>
                <Link
                  to="/learning"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Learning Hub
                </Link>
              </li>
              <li>
                <Link
                  to="/study"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Study Space
                </Link>
              </li>
              <li>
                <Link
                  to="/discover"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors font-bold text-sky-800"
                >
                  Vexora Discover
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Guarantees & Values */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3.5">
              Open Philosophy
            </h4>
            <ul className="space-y-2.5 text-xs font-bold text-neutral-800">
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                <span>Zero Cloud Lock-in</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                <span>Local &amp; Built-in AI Processing</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                <span>No Subscriptions or Paywalls</span>
              </li>
              <li className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                <span>Community-Driven Knowledge</span>
              </li>
            </ul>
          </div>

          {/* Col 4: About, Contact Info (if configured) & Legal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono mb-3.5">
              Information &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <Link
                  to="/about"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  to="/licenses"
                  className="text-neutral-700 hover:text-black hover:underline transition-colors"
                >
                  Licenses
                </Link>
              </li>
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-black hover:underline transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
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
                    className="inline-flex items-center gap-1 text-neutral-700 hover:text-black hover:underline transition-colors"
                  >
                    <span>Open-Source Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              )}
              {socialLinks.map((social, idx) => (
                <li key={idx}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-700 hover:text-black hover:underline transition-colors"
                  >
                    <span>{social.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-neutral-600">
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
