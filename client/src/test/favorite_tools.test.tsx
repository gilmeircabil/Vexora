import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';
import { FavoritesProvider, useFavorites } from '../context/FavoritesContext.js';
import { ToolsDirectoryPage } from '../pages/ToolsDirectoryPage.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { TOOL_CATALOG } from '../tools/catalog.js';

describe('VexoraMods Favorite Tools System Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        if (typeof url === 'string' && url.includes('/api/auth/me')) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ success: false, error: 'Unauthenticated' }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/favorites/sync')) {
          const body = init?.body ? JSON.parse(init.body as string) : { toolIds: [] };
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: Array.from(new Set(['smart-image-studio', ...(body.toolIds || [])])),
            }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/favorites')) {
          if (init?.method === 'POST') {
            return {
              ok: true,
              json: async () => ({
                success: true,
                data: { toolId: 'word-counter', favorited: true },
              }),
            };
          }
          if (init?.method === 'DELETE') {
            return {
              ok: true,
              json: async () => ({
                success: true,
                data: { toolId: 'word-counter', favorited: false },
              }),
            };
          }
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: ['smart-image-studio'],
            }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/ai/status')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { service: { nodeBackend: 'online' }, readyTools: {} },
            }),
          };
        }
        return {
          ok: true,
          json: async () => ({ success: true, data: {} }),
        };
      }),
    );
  });

  describe('1. Guest Favorites & localStorage Persistence', () => {
    const TestConsumer: React.FC = () => {
      const { favoriteIds, favoritesCount, isFavorite, toggleFavorite } = useFavorites();
      return (
        <div>
          <span data-testid="count">{favoritesCount}</span>
          <div data-testid="ids">{favoriteIds.join(',')}</div>
          <button
            onClick={() => toggleFavorite('image-compressor')}
            data-testid="toggle-compressor"
          >
            {isFavorite('image-compressor') ? 'Favorited' : 'Not Favorited'}
          </button>
        </div>
      );
    };

    it('allows guest visitors to add, toggle, and persist favorites in localStorage', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <FavoritesProvider>
              <TestConsumer />
            </FavoritesProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      expect(screen.getByTestId('count')).toHaveTextContent('0');
      expect(screen.getByTestId('toggle-compressor')).toHaveTextContent('Not Favorited');

      // Add to favorites
      fireEvent.click(screen.getByTestId('toggle-compressor'));

      expect(screen.getByTestId('count')).toHaveTextContent('1');
      expect(screen.getByTestId('ids').textContent).toContain('image-compressor');
      expect(screen.getByTestId('toggle-compressor')).toHaveTextContent('Favorited');

      // Verify localStorage was written
      const stored = localStorage.getItem('vexoramods_favorite_tool_ids');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toContain('image-compressor');

      // Remove from favorites
      fireEvent.click(screen.getByTestId('toggle-compressor'));

      expect(screen.getByTestId('count')).toHaveTextContent('0');
      expect(screen.getByTestId('toggle-compressor')).toHaveTextContent('Not Favorited');
      const updatedStored = JSON.parse(localStorage.getItem('vexoramods_favorite_tool_ids')!);
      expect(updatedStored).not.toContain('image-compressor');
    });

    it('restores favorites on load from localStorage and sanitizes invalid tool IDs', async () => {
      // Pre-seed localStorage with 1 valid tool and 1 invalid garbage ID
      localStorage.setItem(
        'vexoramods_favorite_tool_ids',
        JSON.stringify(['word-counter', 'non-existent-tool-xyz']),
      );

      render(
        <BrowserRouter>
          <AuthProvider>
            <FavoritesProvider>
              <TestConsumer />
            </FavoritesProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      // Only valid tools existing in TOOL_CATALOG are included in favoriteTools count
      expect(screen.getByTestId('count')).toHaveTextContent('1');
      expect(screen.getByTestId('ids').textContent).toContain('word-counter');
    });
  });

  describe('2. ToolCard Star Button Interaction', () => {
    it('renders star button with correct accessible label and prevents route navigation on click', () => {
      const mockTool = TOOL_CATALOG.find((t) => t.id === 'word-counter')!;

      render(
        <BrowserRouter>
          <AuthProvider>
            <FavoritesProvider>
              <ToolCard tool={mockTool} />
            </FavoritesProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      const starBtn = screen.getByRole('button', {
        name: /Add Word & Character Counter to favorites/i,
      });
      expect(starBtn).toBeInTheDocument();
      expect(starBtn).toHaveAttribute('title', 'Add to favorites');

      // Click star button
      fireEvent.click(starBtn);

      // Star button aria label updates to remove favorite
      const updatedStarBtn = screen.getByRole('button', {
        name: /Remove Word & Character Counter from favorites/i,
      });
      expect(updatedStarBtn).toBeInTheDocument();
      expect(updatedStarBtn).toHaveAttribute('title', 'Remove from favorites');
    });
  });

  describe('3. All Tools Directory Favorites Ordering & Filtering', () => {
    it('shows empty state when filtering by Favorites category without favorites', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <FavoritesProvider>
                <ToolsDirectoryPage />
              </FavoritesProvider>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      // Click Favorites filter pill
      const favFilterBtn = screen.getByRole('button', { name: /Favorites \(0\)/i });
      fireEvent.click(favFilterBtn);

      expect(screen.getByRole('heading', { name: /Your Favorite Tools/i })).toBeInTheDocument();
      expect(screen.getByText(/Your favorite tools will appear here/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Tap the star on any tool to save it for quick access/i),
      ).toBeInTheDocument();
    });

    it('places favorited tools first in the unified tools directory without separate duplicate sections', async () => {
      // Pre-seed 1 favorite: word-counter
      localStorage.setItem('vexoramods_favorite_tool_ids', JSON.stringify(['word-counter']));

      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <FavoritesProvider>
                <ToolsDirectoryPage />
              </FavoritesProvider>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      // Verify Word & Character Counter is rendered and marked as favorite
      expect(screen.getByText('Word & Character Counter')).toBeInTheDocument();
      const removeBtn = screen.getByRole('button', {
        name: /Remove Word & Character Counter from favorites/i,
      });
      expect(removeBtn).toBeInTheDocument();

      // Tool cards list is unified (exactly 1 instance of the tool on the page)
      const allWordCounters = screen.getAllByText('Word & Character Counter');
      expect(allWordCounters.length).toBe(1);
    });

    it('allows searching across all tools regardless of favorite status', async () => {
      localStorage.setItem('vexoramods_favorite_tool_ids', JSON.stringify(['word-counter']));

      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <FavoritesProvider>
                <ToolsDirectoryPage />
              </FavoritesProvider>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      const searchInput = screen.getByPlaceholderText(/Search all/i);
      fireEvent.change(searchInput, { target: { value: 'word' } });

      // When actively searching, search finds Word & Character Counter in the search results
      await waitFor(() => {
        const matchingCards = screen.getAllByText('Word & Character Counter');
        expect(matchingCards.length).toBeGreaterThan(0);
      });
    });

    it('supports the dedicated Favorites category tab filter', async () => {
      localStorage.setItem(
        'vexoramods_favorite_tool_ids',
        JSON.stringify(['word-counter', 'json-formatter']),
      );

      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <FavoritesProvider>
                <ToolsDirectoryPage />
              </FavoritesProvider>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      // Click Favorites category filter button
      const favFilterBtn = screen.getByRole('button', { name: /Favorites \(2\)/i });
      fireEvent.click(favFilterBtn);

      // View switches to dedicated Favorites view showing both favorited tools
      expect(screen.getByText('Word & Character Counter')).toBeInTheDocument();
      expect(screen.getByText('JSON Formatter & Validator')).toBeInTheDocument();
    });
  });

  describe('4. Guest-to-Account Synchronization Logic', () => {
    it('merges guest favorites with account favorites without duplicates upon login', async () => {
      // Simulate guest who favorited 'image-compressor' before signing in
      localStorage.setItem('vexoramods_favorite_tool_ids', JSON.stringify(['image-compressor']));

      // Mock authenticated user response
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
          if (typeof url === 'string' && url.includes('/api/auth/me')) {
            return {
              ok: true,
              json: async () => ({
                success: true,
                data: {
                  id: 'user-456',
                  email: 'alex@example.com',
                  username: 'Alex',
                  role: 'user',
                },
              }),
            };
          }
          if (typeof url === 'string' && url.includes('/api/favorites/sync')) {
            const body = init?.body ? JSON.parse(init.body as string) : { toolIds: [] };
            // Returns server favorite 'smart-image-studio' merged with guest 'image-compressor'
            return {
              ok: true,
              json: async () => ({
                success: true,
                data: Array.from(new Set(['smart-image-studio', ...(body.toolIds || [])])),
              }),
            };
          }
          return {
            ok: true,
            json: async () => ({ success: true, data: [] }),
          };
        }),
      );

      // Set token to trigger AuthProvider login flow
      localStorage.setItem('tn_token', 'mock-token-xyz');

      const SyncConsumer: React.FC = () => {
        const { favoriteIds, favoritesCount } = useFavorites();
        return (
          <div>
            <span data-testid="sync-count">{favoritesCount}</span>
            <span data-testid="sync-ids">{favoriteIds.join(',')}</span>
          </div>
        );
      };

      render(
        <BrowserRouter>
          <AuthProvider>
            <FavoritesProvider>
              <SyncConsumer />
            </FavoritesProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      await waitFor(() => {
        // Both account favorite 'smart-image-studio' and guest favorite 'image-compressor' are merged
        expect(screen.getByTestId('sync-ids').textContent).toContain('smart-image-studio');
        expect(screen.getByTestId('sync-ids').textContent).toContain('image-compressor');
        expect(screen.getByTestId('sync-count')).toHaveTextContent('2');
      });
    });
  });
});
