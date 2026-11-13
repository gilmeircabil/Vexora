import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { Wrench } from 'lucide-react';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { MaintenanceModal } from '../common/LockedPageModal.js';
import { AuthRequiredModal } from '../common/AuthRequiredModal.js';
import { WindBackground } from '../common/WindBackground.js';
import { useAuth } from '../../context/AuthContext.js';
import { useMaintenance } from '../../context/MaintenanceContext.js';
import { FULLSCREEN_EVENT } from '../../features/education/shared/useFullscreenMode.js';

// Public pages that are 100% free and open to view without requiring login
const PUBLIC_PATHS = new Set([
  '/',
  '/tools',
  '/how-it-works',
  '/about',
  '/privacy',
  '/terms',
  '/licenses',
  '/contributing',
  '/404',
]);

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { maintenance, checkRouteLock } = useMaintenance();

  const lockStatus = checkRouteLock(location.pathname);
  const isAdmin = user?.role === 'admin';

  // If a route is under maintenance:
  // - Admins get full preview access with an informational warning banner.
  // - Regular users & guests are blocked by the MaintenanceModal.
  const isMaintenanceActiveForUser = lockStatus.isLocked && !isAdmin;
  const isAdminPreviewActive = lockStatus.isLocked && isAdmin;

  // Require login for non-public pages (unless already under maintenance for regular users)
  const REQUIRE_AUTH_TO_OPEN_PAGES = true;
  const isPublicPage =
    PUBLIC_PATHS.has(location.pathname) ||
    location.pathname.startsWith('/tools/') ||
    location.pathname.startsWith('/category/');
  const isAiChatRoute =
    location.pathname.startsWith('/ai-tools/chat') ||
    location.pathname === '/ai-chat' ||
    location.pathname === '/chat';
  const isStudySpaceRoute =
    location.pathname.startsWith('/study') || location.pathname.startsWith('/study-space');
  const isFullBleedRoute = isAiChatRoute || isStudySpaceRoute;

  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const handleFullscreenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ isFullscreen: boolean }>;
      setIsFocusMode(Boolean(customEvent.detail?.isFullscreen));
    };
    window.addEventListener(FULLSCREEN_EVENT, handleFullscreenEvent);
    return () => {
      window.removeEventListener(FULLSCREEN_EVENT, handleFullscreenEvent);
    };
  }, []);

  const requiresAuth =
    REQUIRE_AUTH_TO_OPEN_PAGES &&
    !isPublicPage &&
    !isAuthenticated &&
    !isLoading &&
    !isMaintenanceActiveActivePage();

  function isMaintenanceActiveActivePage() {
    return isMaintenanceActiveForUser;
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-clip">
      <WindBackground />
      {/* Top Golden Route Transition Progress Bar */}
      <div
        key={`progress-${location.pathname}`}
        data-testid="route-transition-progress"
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 h-0.5 pointer-events-none overflow-hidden"
      >
        <div className="h-full w-full bg-[var(--theme-yellow)] shadow-[0_0_10px_var(--theme-yellow)] route-progress-bar" />
      </div>
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-semibold text-xs uppercase tracking-wider rounded-full shadow-sm"
      >
        Skip to main content
      </a>

      {!isFocusMode && <Header />}
      <main
        id="main-content"
        tabIndex={-1}
        className={
          isFullBleedRoute
            ? 'flex-1 w-full p-0 relative z-10 focus:outline-none flex flex-col min-h-0'
            : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 focus:outline-none'
        }
      >
        {/* Admin Bypass Notification Banner */}
        {isAdminPreviewActive && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-sm flex flex-wrap items-center justify-between gap-3 text-slate-100 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Wrench className="w-5 h-5 stroke-[2]" />
              </span>
              <div>
                <p className="text-sm font-bold tracking-tight text-slate-100">
                  Admin Preview Active: Maintenance Mode
                </p>
                <p className="text-xs font-normal text-slate-300">
                  This page ({lockStatus.pageTitle}) is currently marked as{' '}
                  <strong className="text-white">under maintenance</strong> for regular users and guests. As an
                  administrator, you have bypass access to test and manage this workspace.
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs shadow-sm active:translate-y-0.5 transition-all"
            >
              Open Admin Settings
            </Link>
          </div>
        )}

        {isMaintenanceActiveForUser ? (
          <MaintenanceModal
            title={maintenance.title || 'Scheduled Maintenance'}
            description={
              maintenance.message ||
              `${lockStatus.pageTitle} is currently undergoing scheduled maintenance.`
            }
            estimatedReturn={maintenance.estimatedReturn}
            pageTitle={lockStatus.pageTitle}
            accentColor={lockStatus.accentColor}
          />
        ) : requiresAuth ? (
          <AuthRequiredModal pageTitle={lockStatus.pageTitle || 'this feature'} />
        ) : null}

        <div
          key={location.pathname}
          data-testid="page-transition-stage"
          data-route-key={location.pathname}
          className={`page-transition-enter ${
            isMaintenanceActiveForUser || requiresAuth
              ? 'pointer-events-none select-none filter blur-[3px] opacity-40'
              : isFullBleedRoute
                ? 'flex-1 w-full flex flex-col min-h-0'
                : ''
          }`}
        >
          <Suspense
            fallback={
              <div className="py-20 text-center text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                Loading...
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
      {!isFullBleedRoute && !isFocusMode && <Footer />}
    </div>
  );
};
