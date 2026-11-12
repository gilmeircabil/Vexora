import React, { useState } from 'react';
import {
  Compass,
  Search,
  ExternalLink,
  AlertCircle,
  X,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const QUICK_SEARCH_SUGGESTIONS = [
  'Coffee Shop',
  'Gas Station',
  'Market',
  'Restaurant',
  'Pharmacy',
  'Grocery',
  'Bakery',
  'Laundry Shop',
  'Salon',
  'Computer Repair',
  'Printing Shop',
  'Car Wash',
  'ATM / Bank',
  'Hardware Store',
  'Clinic / Hospital',
  'Gym',
];

/**
 * Builds a properly encoded Google Maps universal search URL.
 * Automatically appends "nearby" so Google Maps uses the device's native position
 * without prompting for browser location authorization.
 * If a custom area is entered, queries "{keyword} in {location}".
 * Format: https://www.google.com/maps/search/?api=1&query=...&query_place_id=
 */
export function buildGoogleMapsSearchUrl(
  keyword: string,
  coords?: Coordinates | null,
  manualLocation?: string | null
): string {
  const trimmedKeyword = keyword.trim();
  const trimmedManual = manualLocation?.trim();

  // If a custom area/city is provided
  if (trimmedManual) {
    const query = `${trimmedKeyword} in ${trimmedManual}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=`;
  }

  // If coordinates are explicitly provided (for backwards compatibility/testing)
  if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedKeyword)}&query_place_id=&center=${coords.latitude},${coords.longitude}`;
  }

  // Zero-authorization default: Google Maps automatically detects nearby results using the device's location
  const query = `${trimmedKeyword} nearby`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=`;
}

export function getInitialKeyword(): string {
  try {
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      return params.get('keyword') || params.get('q') || '';
    }
  } catch {
    // fallback
  }
  return '';
}

export const DiscoverPage: React.FC = () => {
  const initialKeyword = getInitialKeyword();

  // Search keyword state
  const [keyword, setKeyword] = useState(initialKeyword);
  const [keywordError, setKeywordError] = useState<string | null>(null);

  // Optional custom location state (e.g. searching a specific city instead of "nearby")
  const [customLocation, setCustomLocation] = useState('');
  const [showCustomLocation, setShowCustomLocation] = useState(false);

  /**
   * Triggers search and launches Google Maps in a new browser tab with "nearby" keyword.
   */
  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setKeywordError('Please enter a business keyword to search.');
      return;
    }
    setKeywordError(null);

    const url = buildGoogleMapsSearchUrl(trimmed, null, customLocation.trim() || null);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] font-bold uppercase text-xs text-[var(--theme-dirty-white)] tracking-wider shadow-sm">
            <Compass className="w-4 h-4 text-[var(--theme-dirty-white)]" />
            <span>Vexora Discover</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight">
            Find Nearby Businesses
          </h1>

          <p className="text-[var(--theme-gray-muted)] text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Search for shops, dining, gas stations, and essential services near you — instant Google Maps discovery with zero permission prompts.
          </p>
        </div>

        {/* Main Search Card */}
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* 1. Keyword Search Input */}
          <div className="space-y-2">
            <label
              htmlFor="discover-keyword-input"
              className="block font-bold text-xs sm:text-sm uppercase tracking-wide text-[var(--theme-dirty-white)]"
            >
              Business Keyword
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--theme-gray-muted)]">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="discover-keyword-input"
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  if (keywordError) setKeywordError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="e.g. Coffee shop, gas station, market, laundry shop, restaurant, pharmacy..."
                className={`w-full pl-11 pr-4 py-3 bg-[var(--theme-surface-raised)] border rounded-xl text-[var(--theme-dirty-white)] font-medium placeholder-[var(--theme-gray-dim)] focus:outline-none transition-all text-sm sm:text-base ${
                  keywordError
                    ? 'border-red-500 ring-2 ring-red-500/30'
                    : 'border-[var(--theme-gray-border)] focus:border-[var(--theme-dirty-white)] focus:ring-1 focus:ring-[var(--theme-dirty-white)]'
                }`}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  aria-label="Clear keyword"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Keyword Validation Error */}
            {keywordError && (
              <div
                role="alert"
                className="flex items-center gap-2 text-xs sm:text-sm font-medium text-red-300 bg-red-950/40 border border-red-800 p-2.5 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{keywordError}</span>
              </div>
            )}

            {/* Quick Suggestions */}
            <div className="pt-1">
              <span className="text-xs font-medium text-[var(--theme-gray-muted)] block mb-2">
                Popular Searches:
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {QUICK_SEARCH_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setKeyword(suggestion);
                      if (keywordError) setKeywordError(null);
                    }}
                    className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      keyword.toLowerCase() === suggestion.toLowerCase()
                        ? 'bg-[var(--theme-dirty-white)] border-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                        : 'bg-[var(--theme-surface-raised)] border-[var(--theme-gray-border)] text-[var(--theme-gray-muted)] hover:bg-[var(--theme-gray-border)] hover:text-[var(--theme-dirty-white)]'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Optional Specific City/Area Toggle & Input */}
          <div className="pt-2 border-t border-[var(--theme-gray-border)] space-y-3">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowCustomLocation(!showCustomLocation)}
                className="text-xs font-bold text-[var(--theme-dirty-white)] underline hover:text-[var(--theme-dirty-white-muted)] cursor-pointer"
              >
                {showCustomLocation ? 'Hide Specific Area' : 'Search Specific City Instead'}
              </button>
            </div>

            {/* Optional Specific City/Area Input */}
            {showCustomLocation && (
              <div className="p-3.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="discover-manual-location"
                    className="block text-xs font-bold uppercase text-[var(--theme-dirty-white)] flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
                    <span>Search in a Specific City or Address (Optional)</span>
                  </label>
                  {customLocation && (
                    <button
                      type="button"
                      onClick={() => setCustomLocation('')}
                      className="text-xs font-bold text-[var(--theme-dirty-white)] underline cursor-pointer"
                    >
                      Reset to "Nearby"
                    </button>
                  )}
                </div>

                <input
                  id="discover-manual-location"
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="e.g. Cebu City, Manila, Makati, Quezon City, Brooklyn..."
                  className="w-full px-3.5 py-2.5 bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] rounded-lg text-[var(--theme-dirty-white)] font-medium placeholder-[var(--theme-gray-dim)] text-sm focus:outline-none focus:border-[var(--theme-dirty-white)]"
                />
                <p className="text-[11px] text-[var(--theme-gray-muted)] font-normal">
                  Leave blank to automatically search businesses closest to you.
                </p>
              </div>
            )}
          </div>

          {/* 3. Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full py-3.5 sm:py-4 px-6 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-dirty-white)] rounded-xl font-bold text-[var(--theme-canvas)] text-sm sm:text-base uppercase tracking-wider shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-5 h-5 stroke-[2.2]" />
              <span>
                Search {customLocation.trim() ? `in ${customLocation.trim()}` : 'Nearby'} on Google Maps
              </span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </button>
          </div>
        </div>

        {/* Zero-Authorization Privacy Banner */}
        <div className="p-4 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-gray-muted)] text-xs font-normal flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--theme-dirty-white)] shrink-0" />
          <span>
            <strong className="text-[var(--theme-dirty-white)]">Zero Authorization Required:</strong> No browser location permission popups.
            Google Maps opens directly in a new tab and uses your device's native navigation accuracy.
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
