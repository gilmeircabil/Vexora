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

  useEffect(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

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

        {/* Search Bar - Desktop */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none stroke-[2.5]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
              placeholder="Search 33 tools... (Press /)"
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-white border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all text-black font-semibold placeholder:text-neutral-500 placeholder:font-normal"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:scale-110"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-black border border-black/40">
                /
              </kbd>
            )}
          </div>

          {/* Quick Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000000] overflow-hidden py-1 z-50">
              {searchResults.length > 0 ? (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-500 font-mono">
                    Matching Tools
                  </div>
                  {searchResults.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool.slug)}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#FACC15]/20 border-b border-black/5 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-neutral-100 border border-black text-black">
                          <Icon name={tool.iconName} className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-black text-black truncate">
                            {tool.name}
                          </p>
                          <p className="text-[11px] font-medium text-neutral-600 truncate">
                            {tool.tagline}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-black shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-xs font-bold text-neutral-600">
                  No tools found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation links & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-black">
            <Link
              to="/tools"
              className="px-3 py-1.5 rounded-xl text-black hover:bg-black/5 transition-colors"
            >
              All Tools
            </Link>
            <Link
              to="/pricing"
              className="px-3 py-1.5 rounded-xl text-black hover:bg-black/5 transition-colors"
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
                className="flex items-center gap-2 p-1.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] text-black hover:-translate-y-0.5 transition-all"
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

          <div className="relative">
            <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search tools..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] font-bold"
            />
          </div>

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
