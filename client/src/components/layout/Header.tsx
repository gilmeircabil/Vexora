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
    <header className="sticky top-0 z-40 bg-[#FAF7F2] border-b-2 border-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center shrink-0 group" aria-label="VexoraMods Home">
          <BrandLogo size="md" />
        </Link>

        {/* Primary Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-black"
          >
            <Link
              to="/ai-chat"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                isNavActive('/ai-chat')
                  ? 'bg-[#FACC15] border-black shadow-[2px_2px_0px_#000000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>AI Chat</span>
            </Link>

            <Link
              to="/studio"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                isNavActive('/studio')
                  ? 'bg-[#38BDF8] border-black shadow-[2px_2px_0px_#000000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Studio</span>
            </Link>

            <Link
              to="/ui-library"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                isNavActive('/ui-library')
                  ? 'bg-[#818CF8] border-black shadow-[2px_2px_0px_#000000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>UI Library</span>
            </Link>

            <Link
              to="/learning"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                isNavActive('/learning')
                  ? 'bg-[#A78BFA] border-black shadow-[2px_2px_0px_#000000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Learning Hub</span>
            </Link>

            <Link
              to={
                user?.educationRole === 'teacher' || user?.educationRole === 'educator'
                  ? '/study?workspace=teacher'
                  : '/study'
              }
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                isNavActive('/study')
                  ? 'bg-[#FFD21A] border-black shadow-[2px_2px_0px_#000000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {user?.educationRole === 'teacher' || user?.educationRole === 'educator'
                  ? 'Teacher Workspace'
                  : 'Study Space'}
              </span>
            </Link>

            <Link
              to="/discover"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                isNavActive('/discover')
                  ? 'bg-[#38BDF8] border-black shadow-[2px_2px_0px_#000000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Discover</span>
            </Link>

            <Link
              to="/community"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                isNavActive('/community')
                  ? 'bg-[#F472B6] border-black shadow-[2px_2px_0px_#000000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Heart className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Community</span>
            </Link>
          </nav>

          {/* User Account / Sign In */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] text-black hover:-translate-y-0.5 transition-all cursor-pointer"
                aria-label="User account menu"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FACC15] text-black flex items-center justify-center font-black text-xs uppercase border border-black overflow-hidden shrink-0">
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
                <div className="absolute right-0 mt-2 w-60 p-3 bg-white rounded-2xl shadow-[5px_5px_0px_#000000] border-2 border-black z-50">
                  <div className="px-2 py-2 border-b-2 border-black/10 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#FACC15] text-black flex items-center justify-center font-black text-xs uppercase border border-black overflow-hidden shrink-0">
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
                      <p className="text-xs font-black text-black truncate">
                        {user.name || user.username}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-600 truncate">
                        @{user.username || user.email}
                      </p>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <Link
                      to="/ai-chat"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black bg-yellow-100/60 hover:bg-yellow-200/60 transition-colors"
                    >
                      <Bot className="w-4 h-4 text-amber-600" />
                      <span>Vexora AI Chat</span>
                    </Link>

                    <Link
                      to="/learning"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black hover:bg-neutral-100 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-purple-700" />
                      <span>Learning Hub</span>
                    </Link>

                    <Link
                      to={
                        user?.educationRole === 'teacher' || user?.educationRole === 'educator'
                          ? '/study?workspace=teacher'
                          : '/study'
                      }
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black hover:bg-neutral-100 transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-700" />
                      <span>
                        {user?.educationRole === 'teacher' || user?.educationRole === 'educator'
                          ? 'Teacher Workspace'
                          : 'Study Space'}
                      </span>
                    </Link>

                    <Link
                      to="/studio"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black hover:bg-neutral-100 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>My Studio Projects</span>
                    </Link>

                    <Link
                      to="/ui-library"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black hover:bg-neutral-100 transition-colors"
                    >
                      <LayoutGrid className="w-4 h-4 text-indigo-600" />
                      <span>UI Component Library</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black hover:bg-neutral-100 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Account Dashboard</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black bg-[#F472B6]/30 hover:bg-[#F472B6]/50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-black" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-2 border-t-2 border-black/10">
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-black rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-black text-black hover:underline"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-black rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black border-2 border-black shadow-[2.5px_2.5px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile / Tablet menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] text-black hover:-translate-y-0.5 transition-all md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-[#FAF7F2] px-4 py-5 space-y-4">
          <div className="space-y-2 font-black">
            <Link
              to="/tools"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#4ADE80] border-2 border-black shadow-[2px_2px_0px_#000000] text-sm font-black text-black"
            >
              <Wrench className="w-4 h-4" />
              <span>All Tools</span>
            </Link>

            <Link
              to="/ai-chat"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000000] text-sm font-black text-black"
            >
              <Bot className="w-4 h-4" />
              <span>Vexora AI Chat</span>
            </Link>

            <Link
              to="/studio"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#38BDF8] border-2 border-black shadow-[2px_2px_0px_#000000] text-sm font-black text-black"
            >
              <Sparkles className="w-4 h-4" />
              <span>Studio</span>
            </Link>

            <Link
              to="/ui-library"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#818CF8] border-2 border-black shadow-[2px_2px_0px_#000000] text-sm font-black text-black"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>UI Library</span>
            </Link>

            <Link
              to="/learning"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#A78BFA] border-2 border-black shadow-[2px_2px_0px_#000000] text-sm font-black text-black"
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
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#FFD21A] border-2 border-black shadow-[2px_2px_0px_#000000] text-sm font-black text-black"
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
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#38BDF8] border-2 border-black shadow-[2px_2px_0px_#000000] text-sm font-black text-black"
            >
              <Compass className="w-4 h-4" />
              <span>Vexora Discover</span>
            </Link>

            <Link
              to="/community"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F472B6] border-2 border-black shadow-[2px_2px_0px_#000000] text-sm font-black text-black"
            >
              <Heart className="w-4 h-4" />
              <span>Community</span>
            </Link>

            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <div className="w-8 h-8 rounded-lg bg-[#FACC15] text-black flex items-center justify-center font-black text-xs uppercase border border-black overflow-hidden shrink-0">
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
                    <p className="text-xs font-black text-black truncate">
                      {user.name || user.username}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-600 truncate">
                      @{user.username || user.email}
                    </p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-3.5 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] text-sm text-black"
                >
                  Account Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3.5 py-2 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000000] text-sm text-black"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="block w-full text-left px-3.5 py-2 rounded-xl bg-red-100 border-2 border-black shadow-[2px_2px_0px_#000000] text-sm font-black text-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 py-2 text-center text-xs font-black rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] text-black"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 py-2 text-center text-xs font-black rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000000] text-black"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
