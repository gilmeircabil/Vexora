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
  Users,
  Trophy,
  FolderKanban,
  UserCheck,
  Wrench,
  Bot,
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

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2] border-b-2 border-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center shrink-0 group" aria-label="VexoraMods Home">
          <BrandLogo size="md" />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden lg:flex items-center gap-1.5 text-xs sm:text-sm font-black">
            <Link
              to="/tools"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                location.pathname === '/tools'
                  ? 'bg-black text-white border-black shadow-[2px_2px_0px_#000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>All Tools</span>
            </Link>

            <Link
              to="/ai-tools"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/ai-tools')
                  ? 'bg-[#4ADE80] border-black shadow-[2px_2px_0px_#000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
              <span>AI Tools</span>
            </Link>

            <Link
              to="/design-studio"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/design-studio')
                  ? 'bg-[#FACC15] border-black shadow-[2px_2px_0px_#000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600 stroke-[2.5]" />
              <span>Studio</span>
            </Link>

            <Link
              to="/developers"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/developers')
                  ? 'bg-[#A78BFA] border-black shadow-[2px_2px_0px_#000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-700 stroke-[2.5]" />
              <span>Developer Hub</span>
            </Link>

            <Link
              to="/leaderboard"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                location.pathname === '/leaderboard'
                  ? 'bg-[#38BDF8] border-black shadow-[2px_2px_0px_#000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
              <span>Leaderboard</span>
            </Link>

            <Link
              to="/support"
              className={`px-3 py-1.5 rounded-xl text-black border-2 transition-all flex items-center gap-1.5 ${
                location.pathname === '/support'
                  ? 'bg-[#F472B6] border-black shadow-[2px_2px_0px_#000]'
                  : 'border-transparent hover:bg-black/5'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-red-600 fill-red-500 stroke-[2.5]" />
              <span>Support</span>
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
                <div className="w-8 h-8 rounded-lg bg-[#FACC15] text-black flex items-center justify-center font-black text-xs uppercase border border-black">
                  {user.name.slice(0, 2)}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 p-3 bg-white rounded-2xl shadow-[5px_5px_0px_#000000] border-2 border-black z-50">
                  <div className="px-2 py-1.5 border-b-2 border-black/10">
                    <p className="text-xs font-black text-black truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-neutral-600 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-black bg-[#4ADE80] border border-black text-black">
                      100% Free Account
                    </span>
                  </div>

                  <div className="py-2 space-y-1">
                    <Link
                      to="/developers/profile/edit"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black hover:bg-neutral-100 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <span>My Developer Profile</span>
                    </Link>

                    <Link
                      to="/developers/projects/manage"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black hover:bg-neutral-100 transition-colors"
                    >
                      <FolderKanban className="w-4 h-4 text-blue-600" />
                      <span>My Projects</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black hover:bg-neutral-100 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Saved Designs</span>
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

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] text-black hover:-translate-y-0.5 transition-all md:hidden"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-black bg-[#FAF7F2] px-4 py-5 space-y-4">
          <div className="space-y-2 font-black">
            <Link
              to="/tools"
              className="block px-3 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-sm font-black text-black"
            >
              🛠️ All Tools Catalog
            </Link>

            <Link
              to="/ai-tools"
              className="block px-3 py-2.5 rounded-xl bg-[#4ADE80] border-2 border-black shadow-[2px_2px_0px_#000] text-sm font-black text-black"
            >
              🤖 AI Tools
            </Link>

            <Link
              to="/design-studio"
              className="block px-3 py-2.5 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000] text-sm font-black text-black"
            >
              🎨 VexoraMods Studio
            </Link>

            <Link
              to="/developers"
              className="block px-3 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-sm font-black text-black"
            >
              👨‍💻 Developer Hub
            </Link>

            <Link
              to="/developers/projects"
              className="block px-3 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-sm font-black text-black"
            >
              🚀 Showcase Projects
            </Link>

            <Link
              to="/leaderboard"
              className="block px-3 py-2.5 rounded-xl bg-[#38BDF8]/30 border-2 border-black shadow-[2px_2px_0px_#000] text-sm font-black text-black"
            >
              🏆 Supporter Leaderboard
            </Link>

            <Link
              to="/support"
              className="block px-3 py-2.5 rounded-xl bg-[#F472B6]/30 border-2 border-black shadow-[2px_2px_0px_#000] text-sm font-black text-black"
            >
              ❤️ Support VexoraMods
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/developers/profile/edit"
                  className="block px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-sm text-black"
                >
                  My Developer Profile
                </Link>
                <Link
                  to="/developers/projects/manage"
                  className="block px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-sm text-black"
                >
                  My Projects
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-sm text-black"
                >
                  Saved Designs
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-xl bg-[#F472B6] border-2 border-black shadow-[2px_2px_0px_#000] text-sm text-black"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="block w-full text-left px-3 py-2 rounded-xl bg-red-100 border-2 border-black shadow-[2px_2px_0px_#000] text-sm font-black text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 py-2 text-center text-xs font-black rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 py-2 text-center text-xs font-black rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000] text-black"
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
