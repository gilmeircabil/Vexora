import React, { useState } from 'react';
import {
  Compass,
  Search,
  MapPin,
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
    <div className="min-h-screen bg-[#FAF7F2] text-black py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE600] border-2 border-black font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_#000000]">
            <Compass className="w-4 h-4" />
            <span>Vexora Discover</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight">
            Find Nearby Businesses
          </h1>

          <p className="text-neutral-700 text-sm sm:text-base max-w-lg mx-auto font-medium">
            Search for shops, dining, gas stations, and essential services near you — instant Google Maps discovery with zero permission prompts.
          </p>
        </div>

        {/* Main Search Card */}
        <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
          {/* 1. Keyword Search Input */}
          <div className="space-y-2">
            <label
              htmlFor="discover-keyword-input"
              className="block font-black text-xs sm:text-sm uppercase tracking-wide text-neutral-800"
            >
              Business Keyword
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
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
                className={`w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border-2 rounded-xl text-black font-bold placeholder-neutral-400 focus:outline-none focus:bg-white transition-all text-sm sm:text-base ${
                  keywordError
                    ? 'border-red-500 ring-2 ring-red-300'
                    : 'border-black focus:shadow-[2px_2px_0px_#000000]'
                }`}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  aria-label="Clear keyword"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Keyword Validation Error */}
            {keywordError && (
              <div
                role="alert"
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-red-600 bg-red-50 border border-red-300 p-2.5 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{keywordError}</span>
              </div>
            )}

            {/* Quick Suggestions */}
            <div className="pt-1">
              <span className="text-xs font-bold text-neutral-500 block mb-2">
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
                    className={`px-3 py-1 rounded-lg border-2 border-black text-xs font-black transition-all ${
                      keyword.toLowerCase() === suggestion.toLowerCase()
                        ? 'bg-[#FFE600] shadow-[2px_2px_0px_#000000]'
                        : 'bg-neutral-50 hover:bg-[#FFE600]/40 hover:shadow-[1px_1px_0px_#000000]'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Zero-Authorization Nearby Mode Badge */}
          <div className="pt-4 border-t-2 border-black/10 space-y-3">
            <div className="p-3.5 rounded-xl border-2 border-black bg-[#FAF7F2] space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-black">
                  <MapPin className="w-4 h-4 text-emerald-600 fill-emerald-500/20" />
                  <span>
                    Search Scope:{' '}
                    <strong className="text-emerald-700">
                      {customLocation.trim() ? `In "${customLocation.trim()}"` : 'Nearby (Auto-detected by Google Maps)'}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomLocation(!showCustomLocation)}
                  className="text-xs font-bold text-neutral-700 underline hover:text-black"
                >
                  {showCustomLocation ? 'Hide Specific Area' : 'Search Specific City Instead'}
                </button>
              </div>

              <p className="text-[11px] text-neutral-600 font-medium">
                {customLocation.trim()
                  ? `Google Maps will look for businesses specifically in ${customLocation.trim()}.`
                  : 'We append "nearby" directly into your Google Maps search — Google Maps uses your device location automatically with zero permission prompts required.'}
              </p>
            </div>

            {/* Optional Specific City/Area Input */}
            {showCustomLocation && (
              <div className="p-3.5 bg-amber-50 border-2 border-black rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="discover-manual-location"
                    className="block text-xs font-black uppercase text-amber-950 flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-900" />
                    <span>Search in a Specific City or Address (Optional)</span>
                  </label>
                  {customLocation && (
                    <button
                      type="button"
                      onClick={() => setCustomLocation('')}
                      className="text-xs font-bold text-amber-900 underline"
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
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-black rounded-lg text-black font-bold placeholder-neutral-400 text-sm focus:outline-none focus:shadow-[2px_2px_0px_#000000]"
                />
                <p className="text-[11px] text-neutral-600 font-medium">
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
              className="w-full py-3.5 sm:py-4 px-6 bg-[#FFE600] border-2 border-black rounded-xl font-black text-black text-sm sm:text-base uppercase tracking-wider shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5 stroke-[2.5]" />
              <span>
                Search {customLocation.trim() ? `in ${customLocation.trim()}` : 'Nearby'} on Google Maps
              </span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
            </button>
          </div>
        </div>

        {/* Zero-Authorization Privacy Banner */}
        <div className="p-4 rounded-xl border border-black/15 bg-black/5 text-neutral-700 text-xs font-medium flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Zero Authorization Required:</strong> No browser location permission popups.
            Google Maps opens directly in a new tab and uses your device's native navigation accuracy.
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
