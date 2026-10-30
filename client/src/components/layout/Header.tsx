import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { CreditIndicator } from '../common/CreditIndicator.js';

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
        {/* Brand / Logo (Neo-Brutalist Badge) */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-center text-black group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 group-hover:shadow-[3.5px_3.5px_0px_#000000] transition-all">
            <svg
              className="w-5 h-5 stroke-[2.5]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-black">
              VexoraTool
            </span>
          </div>
        </Link>

        {/* Navigation links & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden md:flex items-center gap-2 text-sm font-black">
            <Link
              to="/tools"
              className="px-3.5 py-2 rounded-xl text-black hover:bg-black/5 transition-colors"
            >
              All Tools
            </Link>
            <Link
              to="/pricing"
              className="px-3.5 py-2 rounded-xl text-black hover:bg-black/5 transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Credit Indicator */}
          <div className="hidden sm:block">
            <CreditIndicator />
          </div>

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
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-black bg-[#FACC15] border border-black text-black">
                      {user.subscription?.plan || 'free'} plan
                    </span>
                  </div>

                  <div className="py-2 space-y-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg text-black hover:bg-black/5 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard & Usage</span>
                    </Link>
                    <Link
                      to="/pricing"
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg text-black hover:bg-black/5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Subscription Plans</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-black rounded-lg text-black bg-[#F472B6]/20 border border-black"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-2 border-t-2 border-black/10">
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-black rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
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
            className="p-2 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] text-black hover:-translate-y-0.5 transition-all lg:hidden"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-black bg-[#FAF7F2] px-4 py-5 space-y-4">
          <CreditIndicator isMobile={true} />

          <div className="space-y-1.5 font-black">
            <Link
              to="/tools"
              className="block px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-sm text-black"
            >
              All Tools Catalog
            </Link>
            <Link
              to="/pricing"
              className="block px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-sm text-black"
            >
              Pricing & Plans
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000] text-sm text-black"
                >
                  My Dashboard
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
