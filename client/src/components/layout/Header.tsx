import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Heart,
  BookOpen,
  Wrench,
  GraduationCap,
  Bot,
  Compass,
  LayoutGrid,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { BrandLogo } from '../common/BrandLogo.js';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isNavActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/ai-chat') {
      return location.pathname.startsWith('/ai-chat') || location.pathname.startsWith('/chat');
    }
    if (path === '/discover') {
      return location.pathname.startsWith('/discover');
    }
    if (path === '/studio') {
      return (
        location.pathname.startsWith('/studio') || location.pathname.startsWith('/design-studio')
      );
    }
    if (path === '/ui-library') {
      return location.pathname.startsWith('/ui-library');
    }
    if (path === '/study') {
      return location.pathname.startsWith('/study') || location.pathname.startsWith('/study-space');
    }
    if (path === '/tools') {
      return (
        location.pathname.startsWith('/tools') ||
        location.pathname.startsWith('/ai-tools') ||
        location.pathname.startsWith('/category')
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--theme-canvas)]/95 backdrop-blur-md border-b border-[var(--theme-gray-border)] shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center shrink-0 group" aria-label="VexoraMods Home">
          <BrandLogo size="md" />
        </Link>

        {/* Primary Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-1 xl:gap-2 text-xs font-bold"
        >
          <Link
            to="/ai-chat"
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isNavActive('/ai-chat')
                ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] font-bold shadow-xs'
                : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>AI Chat</span>
          </Link>

          <Link
            to="/studio"
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isNavActive('/studio')
                ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] font-bold shadow-xs'
                : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Studio</span>
          </Link>

          <Link
            to="/ui-library"
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isNavActive('/ui-library')
                ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] font-bold shadow-xs'
                : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>UI Library</span>
          </Link>

          <Link
            to="/learning"
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isNavActive('/learning')
                ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] font-bold shadow-xs'
                : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Learning Hub</span>
          </Link>

          <Link
            to={
              user?.educationRole === 'teacher' || user?.educationRole === 'educator'
                ? '/study?workspace=teacher'
                : '/study'
            }
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isNavActive('/study')
                ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] font-bold shadow-xs'
                : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>
              {user?.educationRole === 'teacher' || user?.educationRole === 'educator'
                ? 'Teacher Workspace'
                : 'Study Space'}
            </span>
          </Link>

          <Link
            to="/discover"
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isNavActive('/discover')
                ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] font-bold shadow-xs'
                : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Discover</span>
          </Link>

          <Link
            to="/community"
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isNavActive('/community')
                ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] font-bold shadow-xs'
                : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Community</span>
          </Link>
        </nav>

        {/* Right Section: Ratings + Auth Menu + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/reviews"
            className="hidden sm:inline-flex px-4 py-2 text-xs font-bold rounded-full bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] border border-[var(--theme-dirty-white)] shadow-xs hover:shadow-sm active:scale-95 transition-all whitespace-nowrap"
          >
            Ratings
          </Link>

          {/* User Account / Sign In */}
          {isAuthenticated && user ? (
            <div className="relative hidden md:block" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] shadow-xs hover:border-[var(--theme-gray-subtle)] transition-all cursor-pointer"
                aria-label="User account menu"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] flex items-center justify-center font-bold text-xs uppercase border border-[var(--theme-gray-border)] overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user.name || user.username || 'U').slice(0, 2).toUpperCase()
                  )}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 p-3 bg-[var(--theme-surface)] rounded-2xl shadow-xl border border-[var(--theme-gray-border)] z-50">
                  <div className="px-2 py-2 border-b border-[var(--theme-gray-border)] flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] flex items-center justify-center font-bold text-xs uppercase border border-[var(--theme-gray-border)] overflow-hidden shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name || user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (user.name || user.username || 'U').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[var(--theme-dirty-white)] truncate">
                        {user.name || user.username}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--theme-gray-muted)] truncate">
                        @{user.username || user.email}
                      </p>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[var(--theme-dirty-white-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[var(--theme-gray-muted)]" />
                      <span>Account Dashboard</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg text-[var(--theme-dirty-white)] bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] hover:bg-[var(--theme-gray-border)] transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[var(--theme-dirty-white)]" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[var(--theme-gray-border)]">
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-400 hover:bg-red-950/50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-bold rounded-full bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] shadow-xs transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile / Tablet menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className={`p-1 rounded-full border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] shadow-xs text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)] transition-all md:hidden cursor-pointer ${
              isMobileMenuOpen ? 'ring-2 ring-[var(--theme-dirty-white)]' : ''
            }`}
          >
            {isAuthenticated && user ? (
              <div className="relative w-8 h-8 rounded-full bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] flex items-center justify-center font-bold text-xs uppercase border border-[var(--theme-gray-border)] overflow-hidden shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.name || user.username || 'U').slice(0, 2).toUpperCase()
                )}
                {isMobileMenuOpen && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-xs">
                    <X className="w-4 h-4 text-white stroke-[2.5]" />
                  </div>
                )}
              </div>
            ) : isMobileMenuOpen ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <X className="w-5 h-5 stroke-[2.2]" />
              </div>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center">
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--theme-gray-border)] bg-[var(--theme-canvas)] p-4 shadow-xl space-y-3">
          <div className="space-y-2 font-bold">
            {/* User Profile Card at Top of Mobile Drawer */}
            {isAuthenticated && user ? (
              <div className="p-3 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] space-y-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] flex items-center justify-center font-bold text-sm uppercase border border-[var(--theme-gray-border)] overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user.name || user.username || 'U').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--theme-dirty-white)] truncate">
                      {user.name || user.username}
                    </p>
                    <p className="text-xs font-mono text-[var(--theme-gray-muted)] truncate">
                      @{user.username || user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[var(--theme-gray-border)]">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--theme-dirty-white)] bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] hover:bg-[var(--theme-gray-subtle)] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[var(--theme-gray-muted)]" />
                    <span>Account Dashboard</span>
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-[var(--theme-dirty-white)] bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)]"
                    >
                      <ShieldCheck className="w-4 h-4 text-[var(--theme-dirty-white)]" />
                      <span>Admin Console</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pb-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <Link
              to="/tools"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-sm font-semibold text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]"
            >
              <Wrench className="w-4 h-4 text-[var(--theme-dirty-white)]" />
              <span>All Tools</span>
            </Link>

            <Link
              to="/ai-chat"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isNavActive('/ai-chat')
                  ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)] font-bold'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Vexora AI Chat</span>
            </Link>

            <Link
              to="/studio"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isNavActive('/studio')
                  ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)] font-bold'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Studio</span>
            </Link>

            <Link
              to="/ui-library"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isNavActive('/ui-library')
                  ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)] font-bold'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>UI Library</span>
            </Link>

            <Link
              to="/learning"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isNavActive('/learning')
                  ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)] font-bold'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Learning Hub</span>
            </Link>

            <Link
              to={
                user?.educationRole === 'teacher' || user?.educationRole === 'educator'
                  ? '/study?workspace=teacher'
                  : '/study'
              }
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isNavActive('/study')
                  ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)] font-bold'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>
                {user?.educationRole === 'teacher' || user?.educationRole === 'educator'
                  ? 'Teacher Workspace'
                  : 'Study Space'}
              </span>
            </Link>

            <Link
              to="/discover"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isNavActive('/discover')
                  ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)] font-bold'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Vexora Discover</span>
            </Link>

            <Link
              to="/community"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isNavActive('/community')
                  ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)] font-bold'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Community</span>
            </Link>

            <Link
              to="/reviews"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isNavActive('/reviews')
                  ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)] font-bold'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Ratings</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
