import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { TOOL_CATALOG } from '../../tools/catalog.js';

const DEFAULT_TITLE = 'VexoraMods — Free Online Tools and Developer Community';

export const PageTitleUpdater: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Home
    if (pathname === '/') {
      document.title = DEFAULT_TITLE;
      return;
    }

    // 2. Specific Tool Details (/tools/:slug)
    if (pathname.startsWith('/tools/')) {
      const slug = pathname.replace('/tools/', '');
      const tool = TOOL_CATALOG.find((t) => t.id === slug);
      if (tool) {
        document.title = `${tool.name} — VexoraMods`;
        return;
      }
      const titleCase = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      document.title = `${titleCase} — VexoraMods`;
      return;
    }

    // 3. Category Tools (/category/:slug)
    if (pathname.startsWith('/category/')) {
      const cat = pathname.replace('/category/', '').replace(/-/g, ' ');
      const titleCase = cat.replace(/\b\w/g, (c) => c.toUpperCase());
      document.title = `${titleCase} Tools — VexoraMods`;
      return;
    }

    // 4. Tools Directory
    if (pathname === '/tools') {
      document.title = 'All Tools — VexoraMods';
      return;
    }

    // 5. Studio
    if (pathname === '/studio' || pathname.startsWith('/studio') || pathname.startsWith('/design-studio')) {
      document.title = 'Design Studio — VexoraMods';
      return;
    }

    // 6. Learning Hub
    if (pathname === '/learning' || pathname.startsWith('/learning')) {
      document.title = 'Learning Hub — VexoraMods';
      return;
    }

    // 7. Study Space
    if (pathname === '/study' || pathname.startsWith('/study')) {
      document.title = 'Study Space — VexoraMods';
      return;
    }

    // 8. Community & Support
    if (pathname === '/community' || pathname === '/support' || pathname === '/leaderboard') {
      document.title = 'Community — VexoraMods';
      return;
    }

    // 9. Ratings & Reviews
    if (pathname === '/reviews') {
      document.title = 'Ratings & Reviews — VexoraMods';
      return;
    }

    // 10. User & Admin Dashboards
    if (pathname === '/dashboard') {
      document.title = 'Account Dashboard — VexoraMods';
      return;
    }
    if (pathname === '/admin') {
      document.title = 'Admin Console — VexoraMods';
      return;
    }

    // 11. Auth Pages
    if (pathname === '/login') {
      document.title = 'Sign In — VexoraMods';
      return;
    }
    if (pathname === '/register') {
      document.title = 'Sign Up — VexoraMods';
      return;
    }
    if (pathname === '/forgot-password' || pathname === '/reset-password') {
      document.title = 'Forgot Password — VexoraMods';
      return;
    }

    // 12. Informational & Legal
    if (pathname === '/about') {
      document.title = 'About — VexoraMods';
      return;
    }
    if (pathname === '/privacy') {
      document.title = 'Privacy Policy — VexoraMods';
      return;
    }
    if (pathname === '/terms') {
      document.title = 'Terms of Use — VexoraMods';
      return;
    }
    if (pathname === '/licenses') {
      document.title = 'Open Source Licenses — VexoraMods';
      return;
    }
    if (pathname === '/contributing') {
      document.title = 'Contributing Guide — VexoraMods';
      return;
    }

    // Default Fallback
    document.title = DEFAULT_TITLE;
  }, [pathname]);

  return null;
};
