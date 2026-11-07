import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { Header } from '../components/layout/Header.js';

vi.mock('../context/AuthContext.js', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock('../context/MaintenanceContext.js', () => ({
  useMaintenance: () => ({ isLocked: () => false, config: null }),
}));

vi.mock('../context/ToastContext.js', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('../context/FavoritesContext.js', () => ({
  useFavorites: () => ({ favoriteIds: [], favoritesCount: 0 }),
}));

describe('Vexora Discover Navigation & Header Integration', () => {
  it('renders Discover navigation link pointing to /discover', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    const discoverLinks = screen.getAllByRole('link', { name: /Discover/i });
    expect(discoverLinks.length).toBeGreaterThanOrEqual(1);

    const mainDiscoverLink = discoverLinks[0];
    expect(mainDiscoverLink).toBeDefined();
    expect(mainDiscoverLink!.getAttribute('href')).toBe('/discover');
  });
});
