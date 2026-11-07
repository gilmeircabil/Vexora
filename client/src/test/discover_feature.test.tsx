import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import {
  DiscoverPage,
  buildGoogleMapsSearchUrl,
  QUICK_SEARCH_SUGGESTIONS,
} from '../pages/discover/DiscoverPage.js';

describe('Vexora Discover — Zero-Authorization Nearby Search Suite', () => {
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
    it('properly encodes keyword with "nearby" when no custom location is specified', () => {
      const url = buildGoogleMapsSearchUrl('Laundry Shop');

      expect(url).toBe(
        'https://www.google.com/maps/search/?api=1&query=Laundry%20Shop%20nearby&query_place_id='
      );
    });

    it('properly encodes search query when custom location is specified', () => {
      const url = buildGoogleMapsSearchUrl('Computer Repair', null, 'Cebu City');

      expect(url).toBe(
        'https://www.google.com/maps/search/?api=1&query=Computer%20Repair%20in%20Cebu%20City&query_place_id='
      );
    });

    it('supports coordinate centering when explicitly provided for backwards compatibility', () => {
      const url = buildGoogleMapsSearchUrl('Gas Station', {
        latitude: 14.5995,
        longitude: 120.9842,
      });

      expect(url).toBe(
        'https://www.google.com/maps/search/?api=1&query=Gas%20Station&query_place_id=&center=14.5995,120.9842'
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
      expect(screen.getByRole('button', { name: /Search Nearby on Google Maps/i })).toBeDefined();

      // Popular suggestion chips
      QUICK_SEARCH_SUGGESTIONS.forEach((sug) => {
        expect(screen.getByRole('button', { name: sug })).toBeDefined();
      });
    });

    it('shows validation error when attempting to search with empty keyword', async () => {
      render(<DiscoverPage />);

      const searchBtn = screen.getByRole('button', { name: /Search Nearby on Google Maps/i });
      fireEvent.click(searchBtn);

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toContain('Please enter a business keyword to search.');
      expect(window.open).not.toHaveBeenCalled();
    });

    it('clicking a suggestion chip sets keyword and clears validation error', async () => {
      render(<DiscoverPage />);

      const searchBtn = screen.getByRole('button', { name: /Search Nearby on Google Maps/i });
      fireEvent.click(searchBtn);

      expect(await screen.findByRole('alert')).toBeDefined();

      const laundryChip = screen.getByRole('button', { name: 'Laundry Shop' });
      fireEvent.click(laundryChip);

      const input = screen.getByPlaceholderText(/Laundry shop, restaurant, pharmacy/i) as HTMLInputElement;
      expect(input.value).toBe('Laundry Shop');
      expect(screen.queryByRole('alert')).toBeNull();

      // Test popular added chips (Gas Station, Coffee Shop, Market)
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

    it('supports Enter key submission on keyword input with zero browser permission dialogs', () => {
      const mockGetCurrentPosition = vi.fn();
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

      // Browser geolocation API is NEVER requested
      expect(mockGetCurrentPosition).not.toHaveBeenCalled();

      // Directly opens Google Maps with "nearby" keyword in new tab
      expect(window.open).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=Pharmacy%20nearby&query_place_id=',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('3. Zero-Authorization Nearby Mode & Custom Area', () => {
    it('searches nearby without requesting any browser location authorization', () => {
      const mockGetCurrentPosition = vi.fn();
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
        writable: true,
      });

      render(<DiscoverPage />);

      const input = screen.getByPlaceholderText(/Laundry shop, restaurant, pharmacy/i);
      fireEvent.change(input, { target: { value: 'Coffee Shop' } });

      const searchBtn = screen.getByRole('button', { name: /Search Nearby on Google Maps/i });
      fireEvent.click(searchBtn);

      // Verifies no browser authorization was requested
      expect(mockGetCurrentPosition).not.toHaveBeenCalled();

      // Verifies Google Maps opens with "Coffee Shop nearby"
      expect(window.open).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=Coffee%20Shop%20nearby&query_place_id=',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('allows searching a specific city/area when custom location is entered', () => {
      render(<DiscoverPage />);

      // Fill in keyword
      const keywordInput = screen.getByPlaceholderText(/Laundry shop, restaurant, pharmacy/i);
      fireEvent.change(keywordInput, { target: { value: 'Grocery' } });

      // Click "Search Specific City Instead"
      const toggleAreaBtn = screen.getByRole('button', { name: /Search Specific City Instead/i });
      fireEvent.click(toggleAreaBtn);

      // Enter custom city
      const customInput = screen.getByPlaceholderText(/Cebu City, Manila, Makati/i);
      fireEvent.change(customInput, { target: { value: 'Makati City' } });

      // Click search
      const searchBtn = screen.getByRole('button', { name: /Search in Makati City on Google Maps/i });
      fireEvent.click(searchBtn);

      expect(window.open).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=Grocery%20in%20Makati%20City&query_place_id=',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('can reset custom city back to nearby mode', () => {
      render(<DiscoverPage />);

      // Open custom location
      const toggleAreaBtn = screen.getByRole('button', { name: /Search Specific City Instead/i });
      fireEvent.click(toggleAreaBtn);

      const customInput = screen.getByPlaceholderText(/Cebu City, Manila, Makati/i);
      fireEvent.change(customInput, { target: { value: 'Manila' } });

      expect(screen.getByRole('button', { name: /Search in Manila on Google Maps/i })).toBeDefined();

      // Click reset
      const resetBtn = screen.getByRole('button', { name: /Reset to "Nearby"/i });
      fireEvent.click(resetBtn);

      expect(screen.getByRole('button', { name: /Search Nearby on Google Maps/i })).toBeDefined();
    });
  });
});
