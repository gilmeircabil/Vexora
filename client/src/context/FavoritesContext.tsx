import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext.js';
import { favoriteApi } from '../services/favoriteApi.js';
import { TOOL_CATALOG, type ToolDefinition } from '../tools/catalog.js';

const GUEST_STORAGE_KEY = 'vexoramods_favorite_tool_ids';

interface FavoritesContextType {
  favoriteIds: string[];
  favoritesCount: number;
  favoriteTools: ToolDefinition[];
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => Promise<void>;
  addFavorite: (toolId: string) => Promise<void>;
  removeFavorite: (toolId: string) => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function readLocalFavorites(): string[] {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Only keep non-empty strings
    return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
  } catch {
    return [];
  }
}

function saveLocalFavorites(ids: string[]): void {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // LocalStorage quota or disabled
  }
}

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readLocalFavorites());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync / fetch favorites when authentication state changes
  useEffect(() => {
    let active = true;

    const initializeFavorites = async () => {
      setIsLoading(true);
      if (isAuthenticated && user) {
        try {
          const guestIds = readLocalFavorites();
          if (guestIds.length > 0) {
            // Guest-to-account migration: merge guest favorites with account
            const merged = await favoriteApi.syncFavorites(guestIds);
            if (active) {
              setFavoriteIds(merged);
              saveLocalFavorites(merged);
            }
          } else {
            // Fetch account favorites
            const accountFavs = await favoriteApi.getFavorites();
            if (active) {
              setFavoriteIds(accountFavs);
              saveLocalFavorites(accountFavs);
            }
          }
        } catch (e) {
          console.error('Failed to sync favorites with server:', e);
          // Retain local favorites so guest data is never lost
        }
      } else {
        // Guest mode: load from localStorage
        const local = readLocalFavorites();
        if (active) {
          setFavoriteIds(local);
        }
      }
      if (active) {
        setIsLoading(false);
      }
    };

    initializeFavorites();

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id]);

  const isFavorite = useCallback(
    (toolId: string) => {
      return favoriteIds.includes(toolId);
    },
    [favoriteIds],
  );

  const addFavorite = useCallback(
    async (toolId: string) => {
      if (!toolId) return;
      const previous = [...favoriteIds];
      if (previous.includes(toolId)) return;

      const next = [toolId, ...previous];
      setFavoriteIds(next);
      saveLocalFavorites(next);

      if (isAuthenticated) {
        try {
          await favoriteApi.addFavorite(toolId);
        } catch (err) {
          console.error('Failed to add favorite on server, rolling back:', err);
          setFavoriteIds(previous);
          saveLocalFavorites(previous);
        }
      }
    },
    [favoriteIds, isAuthenticated],
  );

  const removeFavorite = useCallback(
    async (toolId: string) => {
      if (!toolId) return;
      const previous = [...favoriteIds];
      if (!previous.includes(toolId)) return;

      const next = previous.filter((id) => id !== toolId);
      setFavoriteIds(next);
      saveLocalFavorites(next);

      if (isAuthenticated) {
        try {
          await favoriteApi.removeFavorite(toolId);
        } catch (err) {
          console.error('Failed to remove favorite on server, rolling back:', err);
          setFavoriteIds(previous);
          saveLocalFavorites(previous);
        }
      }
    },
    [favoriteIds, isAuthenticated],
  );

  const toggleFavorite = useCallback(
    async (toolId: string) => {
      if (isFavorite(toolId)) {
        await removeFavorite(toolId);
      } else {
        await addFavorite(toolId);
      }
    },
    [isFavorite, addFavorite, removeFavorite],
  );

  // Derive favorite ToolDefinition objects from TOOL_CATALOG in the order of favoriteIds
  const favoriteTools = useMemo(() => {
    const catalogMap = new Map<string, ToolDefinition>();
    for (const tool of TOOL_CATALOG) {
      catalogMap.set(tool.id, tool);
    }
    const tools: ToolDefinition[] = [];
    for (const id of favoriteIds) {
      const found = catalogMap.get(id);
      if (found) {
        tools.push(found);
      }
    }
    return tools;
  }, [favoriteIds]);

  const value = useMemo(
    () => ({
      favoriteIds,
      favoritesCount: favoriteTools.length,
      favoriteTools,
      isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      isLoading,
    }),
    [
      favoriteIds,
      favoriteTools,
      isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      isLoading,
    ],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    // Graceful fallback for isolated renders / unit test harnesses
    return {
      favoriteIds: [],
      favoritesCount: 0,
      favoriteTools: [],
      isFavorite: () => false,
      toggleFavorite: async () => {},
      addFavorite: async () => {},
      removeFavorite: async () => {},
      isLoading: false,
    };
  }
  return context;
};
