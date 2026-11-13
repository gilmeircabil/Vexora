import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { HomePage } from '../pages/HomePage.js';
import { MascotProvider } from '../context/MascotContext.js';

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
  useFavorites: () => ({
    favoriteIds: [],
    favoritesCount: 0,
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
  }),
}));

describe('Vexora Discover Navigation & HomePage Card Grid Integration', () => {
  it('renders Discover workspace card on HomePage pointing to /discover', () => {
    render(
      <MascotProvider>
        <MemoryRouter initialEntries={['/']}>
          <HomePage />
        </MemoryRouter>
      </MascotProvider>
    );

    const discoverLinks = screen.getAllByRole('link', { name: /Discover/i });
    expect(discoverLinks.length).toBeGreaterThanOrEqual(1);

    const mainDiscoverLink = discoverLinks[0];
    expect(mainDiscoverLink).toBeDefined();
    expect(mainDiscoverLink!.getAttribute('href')).toBe('/discover');
  });
});
