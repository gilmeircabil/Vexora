import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  Search,
  Menu,
  X,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { searchTools, CATEGORIES, type ToolDefinition } from '../../tools/catalog.js';
import { Icon } from '../common/Icon.js';
import { CreditIndicator } from '../common/CreditIndicator.js';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<readonly ToolDefinition[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close search, profile menu, and mobile menu on route change
  useEffect(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Handle outside click for search & profile dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim()) {
      setSearchResults(searchTools(q).slice(0, 6));
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const handleSelectTool = (slug: string) => {
    navigate(`/tools/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/90 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-neutral-800">
              Vexora <span className="text-neutral-400 font-normal">-</span> Tool
              <span className="text-indigo-600">Nest</span>
            </span>
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
              placeholder="Search 33 browser utilities..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-neutral-100/90 border border-neutral-200/90 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all text-neutral-800 placeholder:text-neutral-400"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-neutral-200/80 text-neutral-500 border border-neutral-300/80">
                /
              </kbd>
            )}
          </div>

          {/* Quick Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden py-1 z-50 animate-in fade-in duration-150">
              {searchResults.length > 0 ? (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Matching Tools
                  </div>
                  {searchResults.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool.slug)}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                          <Icon name={tool.iconName} className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-medium text-neutral-800 truncate">
                            {tool.name}
                          </p>
                          <p className="text-[11px] text-neutral-500 truncate">
                            {tool.tagline}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-neutral-500">
                  No tools found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation links & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/tools"
              className="px-2.5 py-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              All Tools
            </Link>
            <Link
              to="/pricing"
              className="px-2.5 py-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
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
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-700 transition-colors"
                aria-label="User account menu"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase border border-indigo-200">
                  {user.name.slice(0, 2)}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 p-2 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-800 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-neutral-100 text-neutral-600">
                      {user.subscription?.plan || 'free'} plan
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Dashboard & Usage</span>
                    </Link>
                    <Link
                      to="/pricing"
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Subscription Plans</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-neutral-100">
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors lg:hidden"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
          {/* Mobile Credit indicator */}
          <CreditIndicator isMobile={true} />

          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search tools..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-100 rounded-xl focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <Link
              to="/tools"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              All Tools Catalog
            </Link>
            <Link
              to="/pricing"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-neutral-100"
            >
              Pricing & Plans
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  My Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-neutral-100 text-neutral-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-indigo-600 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
            <div className="pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 px-3">
              Categories
            </div>
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="block px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-1">
            <Link
              to="/about"
              className="block px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800"
            >
              About Vexora - ToolNest
            </Link>
            <Link
              to="/privacy"
              className="block px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800"
            >
              Privacy & Local-First Architecture
            </Link>
            <Link
              to="/licenses"
              className="block px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800"
            >
              Open Source Licenses
            </Link>
            <Link
              to="/contributing"
              className="block px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800"
            >
              Contributing Guidelines
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
