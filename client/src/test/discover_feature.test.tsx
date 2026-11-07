import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import {
  DiscoverPage,
  buildGoogleMapsSearchUrl,
  QUICK_SEARCH_SUGGESTIONS,
} from '../pages/discover/DiscoverPage.js';

describe('Vexora Discover — Unit & Integration Suite', () => {
  let originalGeolocation: Geolocation | undefined;
  let originalOpen: typeof window.open;

  beforeEach(() => {
    originalGeolocation = navigator.geolocation;
    originalOpen = window.open;
    window.open = vi.fn();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
      writable: true,
    });
    window.open = originalOpen;
    vi.restoreAllMocks();
  });

  describe('1. Google Maps URL Builder', () => {
    it('properly encodes keyword and coordinates', () => {
      const url = buildGoogleMapsSearchUrl('Laundry Shop', {
        latitude: 14.5995,
        longitude: 120.9842,
      });

      expect(url).toBe(
        'https://www.google.com/maps/search/?api=1&query=Laundry%20Shop&query_place_id=&center=14.5995,120.9842'
      );
    });

    it('properly encodes keyword when coordinates are omitted', () => {
      const url = buildGoogleMapsSearchUrl('Laundry Shop');

      expect(url).toBe(
        'https://www.google.com/maps/search/?api=1&query=Laundry%20Shop&query_place_id='
      );
    });

    it('properly encodes search query when manual location is specified', () => {
      const url = buildGoogleMapsSearchUrl('Computer Repair', null, 'Cebu City');

      expect(url).toBe(
        'https://www.google.com/maps/search/?api=1&query=Computer%20Repair%20in%20Cebu%20City&query_place_id='
      );
    });

    it('handles special characters and punctuation in keyword and address', () => {
      const url = buildGoogleMapsSearchUrl('Coffee & Pastries', null, 'St. Jude Ave, Manila #12');

      expect(url).toBe(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Coffee & Pastries in St. Jude Ave, Manila #12')}&query_place_id=`
      );
    });
  });

  describe('2. Keyword Search & Validation', () => {
    it('renders search input, popular suggestions, and search button', () => {
      render(<DiscoverPage />);

      expect(screen.getByText('Vexora Discover')).toBeDefined();
      expect(screen.getByText('Find Nearby Businesses')).toBeDefined();
      expect(screen.getByPlaceholderText(/Laundry shop, restaurant, pharmacy/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Search on Google Maps/i })).toBeDefined();

      // Popular suggestion chips
      QUICK_SEARCH_SUGGESTIONS.forEach((sug) => {
        expect(screen.getByRole('button', { name: sug })).toBeDefined();
      });
    });

    it('shows validation error when attempting to search with empty keyword', async () => {
      render(<DiscoverPage />);

      const searchBtn = screen.getByRole('button', { name: /Search on Google Maps/i });
      fireEvent.click(searchBtn);

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toContain('Please enter a business keyword to search.');
      expect(window.open).not.toHaveBeenCalled();
    });

    it('clicking a suggestion chip sets keyword and clears validation error', async () => {
      render(<DiscoverPage />);

      const searchBtn = screen.getByRole('button', { name: /Search on Google Maps/i });
      fireEvent.click(searchBtn);

      expect(await screen.findByRole('alert')).toBeDefined();

      const laundryChip = screen.getByRole('button', { name: 'Laundry Shop' });
      fireEvent.click(laundryChip);

      const input = screen.getByPlaceholderText(/Laundry shop, restaurant, pharmacy/i) as HTMLInputElement;
      expect(input.value).toBe('Laundry Shop');
      expect(screen.queryByRole('alert')).toBeNull();

      // Test newly added chips (Gas Station, Coffee Shop, Market)
      const gasStationChip = screen.getByRole('button', { name: 'Gas Station' });
      fireEvent.click(gasStationChip);
      expect(input.value).toBe('Gas Station');

      const coffeeShopChip = screen.getByRole('button', { name: 'Coffee Shop' });
      fireEvent.click(coffeeShopChip);
      expect(input.value).toBe('Coffee Shop');

      const marketChip = screen.getByRole('button', { name: 'Market' });
      fireEvent.click(marketChip);
      expect(input.value).toBe('Market');
    });

    it('supports Enter key submission on keyword input', () => {
      let mockSuccess: (pos: GeolocationPosition) => void;
      const mockGetCurrentPosition = vi.fn((success) => {
        mockSuccess = success;
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
        writable: true,
      });

      render(<DiscoverPage />);

      const input = screen.getByPlaceholderText(/Laundry shop, restaurant, pharmacy/i);
      act(() => {
        fireEvent.change(input, { target: { value: 'Pharmacy' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      });

      expect(mockGetCurrentPosition).toHaveBeenCalled();

      // Simulate browser returning location
      act(() => {
        mockSuccess!({
          coords: {
            latitude: 14.5995,
            longitude: 120.9842,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as any);
      });

      expect(window.open).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=Pharmacy&query_place_id=&center=14.5995,120.9842',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('3. Browser Geolocation & Permission Handling', () => {
    it('does not request location on initial page load (idle status)', () => {
      const mockGetCurrentPosition = vi.fn();
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
        writable: true,
      });

      render(<DiscoverPage />);

      expect(screen.getByText(/Location: Not requested yet/i)).toBeDefined();
      expect(mockGetCurrentPosition).not.toHaveBeenCalled();
    });

    it('handles successful geolocation detection via "Use My Location" button', async () => {
      const mockGetCurrentPosition = vi.fn((success) => {
        success({
          coords: {
            latitude: 10.3157,
            longitude: 123.8854,
            accuracy: 15,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as any);
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
        writable: true,
      });

      render(<DiscoverPage />);

      const locateBtn = screen.getByRole('button', { name: /Use My Location/i });
      fireEvent.click(locateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Location Available \(10.316, 123.885\)/i)).toBeDefined();
      });

      // Clear/Reset location returns state to idle
      const resetBtn = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(resetBtn);

      expect(screen.getByText(/Location: Not requested yet/i)).toBeDefined();
    });

    it('handles permission denied (error code 1) and displays manual location explanation', async () => {
      const mockGetCurrentPosition = vi.fn((_success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: 'User denied Geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
        writable: true,
      });

      render(<DiscoverPage />);

      const locateBtn = screen.getByRole('button', { name: /Use My Location/i });
      fireEvent.click(locateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Location Permission Denied/i)).toBeDefined();
      });

      expect(
        screen.getByText(/Location access was denied\. You can still search by manually entering a city, municipality, or address below\./i)
      ).toBeDefined();

      // Manual location input is revealed
      expect(screen.getByPlaceholderText(/Cebu City, Manila, Makati/i)).toBeDefined();
    });

    it('handles unavailable location / timeout (error code 2 & 3) and shows explanation', async () => {
      const mockGetCurrentPosition = vi.fn((_success, error) => {
        error({
          code: 3, // TIMEOUT
          message: 'Geolocation timed out',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
        writable: true,
      });

      render(<DiscoverPage />);

      const locateBtn = screen.getByRole('button', { name: /Use My Location/i });
      fireEvent.click(locateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Location Unavailable/i)).toBeDefined();
      });

      expect(screen.getByText(/Location request timed out/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/Cebu City, Manila, Makati/i)).toBeDefined();
    });
  });

  describe('4. Google Maps Search & Navigation', () => {
    it('searches with manual location and opens Google Maps in a new tab', () => {
      render(<DiscoverPage />);

      // Fill in keyword
      const keywordInput = screen.getByPlaceholderText(/Laundry shop, restaurant, pharmacy/i);
      fireEvent.change(keywordInput, { target: { value: 'Grocery' } });

      // Click "Enter Manually"
      const enterManuallyBtn = screen.getByRole('button', { name: /Enter Manually/i });
      fireEvent.click(enterManuallyBtn);

      // Enter manual city
      const manualInput = screen.getByPlaceholderText(/Cebu City, Manila, Makati/i);
      fireEvent.change(manualInput, { target: { value: 'Makati City' } });

      // Click search
      const searchBtn = screen.getByRole('button', { name: /Search on Google Maps/i });
      fireEvent.click(searchBtn);

      expect(window.open).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=Grocery%20in%20Makati%20City&query_place_id=',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('when coordinates are already detected, search opens Google Maps directly with coordinates', () => {
      const mockGetCurrentPosition = vi.fn((success) => {
        success({
          coords: {
            latitude: 14.5995,
            longitude: 120.9842,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as any);
      });

      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
        writable: true,
      });

      render(<DiscoverPage />);

      // Detect location first
      const locateBtn = screen.getByRole('button', { name: /Use My Location/i });
      fireEvent.click(locateBtn);

      // Set keyword
      const keywordInput = screen.getByPlaceholderText(/Laundry shop, restaurant, pharmacy/i);
      fireEvent.change(keywordInput, { target: { value: 'Restaurant' } });

      // Click search
      const searchBtn = screen.getByRole('button', { name: /Search on Google Maps/i });
      fireEvent.click(searchBtn);

      expect(window.open).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=Restaurant&query_place_id=&center=14.5995,120.9842',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });
});
