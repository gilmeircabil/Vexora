import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { Wrench } from 'lucide-react';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { FallingStarsBackground } from '../common/FallingStarsBackground.js';
import { MaintenanceModal } from '../common/LockedPageModal.js';
import { AuthRequiredModal } from '../common/AuthRequiredModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { useMaintenance } from '../../context/MaintenanceContext.js';
import { FULLSCREEN_EVENT } from '../../features/education/shared/useFullscreenMode.js';

// Public pages that are 100% free and open to view without requiring login
const PUBLIC_PATHS = new Set([
  '/',
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
  const isPublicPage = PUBLIC_PATHS.has(location.pathname);
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
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 px-4 py-2 bg-[#FACC15] text-black font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000]"
      >
        Skip to main content
      </a>

      {/* Neo-Brutalist Falling Stars Canvas Animation */}
      <FallingStarsBackground />

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
          <div className="mb-6 p-4 rounded-2xl bg-amber-100 border-2 border-black shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-3 text-black animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-400 border-2 border-black shadow-[2px_2px_0px_#000]">
                <Wrench className="w-5 h-5 text-black stroke-[2.5]" />
              </span>
              <div>
                <p className="text-sm font-black tracking-tight">
                  Admin Preview Active: Maintenance Mode
                </p>
                <p className="text-xs font-semibold text-neutral-700">
                  This page ({lockStatus.pageTitle}) is currently marked as{' '}
                  <strong>under maintenance</strong> for regular users and guests. As an
                  administrator, you have bypass access to test and manage this workspace.
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border-2 border-black text-black font-black text-xs shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
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
          className={
            isMaintenanceActiveForUser || requiresAuth
              ? 'pointer-events-none select-none filter blur-[3px] opacity-40'
              : isFullBleedRoute
                ? 'flex-1 w-full flex flex-col min-h-0'
                : ''
          }
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
