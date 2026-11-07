import React, { useState } from 'react';
import {
  Compass,
  Search,
  MapPin,
  ExternalLink,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type LocationStatus = 'idle' | 'locating' | 'detected' | 'denied' | 'unavailable';

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
 * - When browser coordinates are available: includes keyword and map center coordinates.
 * - When manual location is provided: queries keyword in the specified location.
 * - Format: https://www.google.com/maps/search/?api=1&query=...&query_place_id=
 */
export function buildGoogleMapsSearchUrl(
  keyword: string,
  coords?: Coordinates | null,
  manualLocation?: string | null
): string {
  const trimmedKeyword = keyword.trim();
  const trimmedManual = manualLocation?.trim();

  // If manual location is provided
  if (trimmedManual) {
    const query = `${trimmedKeyword} in ${trimmedManual}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=`;
  }

  // If coordinates are available
  if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedKeyword)}&query_place_id=&center=${coords.latitude},${coords.longitude}`;
  }

  // Fallback query without coordinates
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedKeyword)}&query_place_id=`;
}

export const DiscoverPage: React.FC = () => {
  // Search keyword state
  const [keyword, setKeyword] = useState('');
  const [keywordError, setKeywordError] = useState<string | null>(null);

  // Browser geolocation state (never permanently stored)
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Manual location state
  const [manualLocation, setManualLocation] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  /**
   * Request browser location via Geolocation API only when initiated.
   */
  const requestLocation = (onSuccess?: (detected: Coordinates) => void) => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setLocationError('Geolocation is not supported by your browser. You can enter your location manually below.');
      setIsManualMode(true);
      return;
    }

    setStatus('locating');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(detected);
        setStatus('detected');
        setLocationError(null);
        if (onSuccess) {
          onSuccess(detected);
        }
      },
      (error) => {
        setCoords(null);
        setIsManualMode(true);
        if (error.code === 1) {
          // PERMISSION_DENIED
          setStatus('denied');
          setLocationError(
            'Location access was denied. You can still search by manually entering a city, municipality, or address below.'
          );
        } else if (error.code === 2) {
          // POSITION_UNAVAILABLE
          setStatus('unavailable');
          setLocationError(
            'Location information is unavailable. You can enter your location manually below.'
          );
        } else if (error.code === 3) {
          // TIMEOUT
          setStatus('unavailable');
          setLocationError(
            'Location request timed out. You can enter your location manually below.'
          );
        } else {
          setStatus('unavailable');
          setLocationError(
            'Unable to detect location. You can enter your location manually below.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /**
   * Clears the current detected location from transient state.
   */
  const handleClearLocation = () => {
    setCoords(null);
    setStatus('idle');
    setLocationError(null);
  };

  /**
   * Triggers search and launches Google Maps in a new browser tab.
   */
  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setKeywordError('Please enter a business keyword to search.');
      return;
    }
    setKeywordError(null);

    // If manual location has been entered, search with it directly
    if (manualLocation.trim()) {
      const url = buildGoogleMapsSearchUrl(trimmed, null, manualLocation.trim());
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // If browser coordinates are already available, search with them
    if (coords) {
      const url = buildGoogleMapsSearchUrl(trimmed, coords);
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // If location permission was previously denied or unavailable, prompt for manual location
    if (status === 'denied' || status === 'unavailable') {
      setIsManualMode(true);
      setLocationError('Please enter a city, municipality, or address below to complete your search.');
      return;
    }

    // Otherwise, request location as the user initiated the search
    requestLocation((detectedCoords) => {
      const url = buildGoogleMapsSearchUrl(trimmed, detectedCoords);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
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
            Search for local shops, food, and essential services near your location and open results directly in Google Maps.
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

          {/* 2. Location Status & Actions */}
          <div className="pt-4 border-t-2 border-black/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs sm:text-sm uppercase tracking-wide text-neutral-800">
                Location Status
              </span>
              {!isManualMode && (
                <button
                  type="button"
                  onClick={() => setIsManualMode(true)}
                  className="text-xs font-bold text-neutral-700 underline hover:text-black"
                >
                  Enter Manually
                </button>
              )}
            </div>

            {/* Status Display Pill */}
            <div className="p-3.5 rounded-xl border-2 border-black bg-[#FAF7F2] space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-700" />
                  <span className="text-xs sm:text-sm font-bold">
                    {status === 'idle' && 'Location: Not requested yet'}
                    {status === 'locating' && 'Detecting your browser location...'}
                    {status === 'detected' && (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                        Location Available ({coords?.latitude.toFixed(3)}, {coords?.longitude.toFixed(3)})
                      </span>
                    )}
                    {status === 'denied' && (
                      <span className="text-red-700 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-red-600 inline" />
                        Location Permission Denied
                      </span>
                    )}
                    {status === 'unavailable' && (
                      <span className="text-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-amber-700 inline" />
                        Location Unavailable
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {status === 'detected' ? (
                    <button
                      type="button"
                      onClick={handleClearLocation}
                      className="text-xs font-black text-neutral-600 hover:text-black underline"
                    >
                      Reset
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={status === 'locating'}
                      onClick={() => requestLocation()}
                      className="px-3 py-1 bg-[#38BDF8] border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {status === 'locating' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Detecting...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Use My Location</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Explanation Message */}
              {locationError && (
                <p className="text-xs font-bold text-neutral-700 pt-1">
                  {locationError}
                </p>
              )}
            </div>

            {/* 3. Manual Location Input (Fallback) */}
            {isManualMode && (
              <div className="p-3.5 bg-amber-50 border-2 border-black rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="discover-manual-location"
                    className="block text-xs font-black uppercase text-amber-950 flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-900" />
                    <span>Search in City, Municipality or Address</span>
                  </label>
                  {status === 'detected' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualMode(false);
                        setManualLocation('');
                      }}
                      className="text-xs font-bold text-amber-900 underline"
                    >
                      Use GPS Instead
                    </button>
                  )}
                </div>

                <input
                  id="discover-manual-location"
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="e.g. Cebu City, Manila, Makati, Quezon City, Brooklyn..."
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-black rounded-lg text-black font-bold placeholder-neutral-400 text-sm focus:outline-none focus:shadow-[2px_2px_0px_#000000]"
                />
                <p className="text-[11px] text-neutral-600 font-medium">
                  We will query Google Maps for businesses in this area.
                </p>
              </div>
            )}
          </div>

          {/* 4. Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full py-3.5 sm:py-4 px-6 bg-[#FFE600] border-2 border-black rounded-xl font-black text-black text-sm sm:text-base uppercase tracking-wider shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5 stroke-[2.5]" />
              <span>Search on Google Maps</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 rounded-xl border border-black/15 bg-black/5 text-neutral-700 text-xs font-medium flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Privacy Protected:</strong> Your location is requested only when you search.
            Coordinates are never stored, saved to a database, or tracked. Google Maps opens in a new tab.
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
