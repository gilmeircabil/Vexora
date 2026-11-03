export interface FavoriteResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class FavoriteApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('tn_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getFavorites(): Promise<string[]> {
    const res = await fetch('/api/favorites', {
      headers: {
        ...this.getAuthHeader(),
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch favorites: ${res.statusText}`);
    }
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  }

  async addFavorite(toolId: string): Promise<boolean> {
    const res = await fetch(`/api/favorites/${encodeURIComponent(toolId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to add favorite: ${res.statusText}`);
    }
    const json = await res.json();
    return Boolean(json.success);
  }

  async removeFavorite(toolId: string): Promise<boolean> {
    const res = await fetch(`/api/favorites/${encodeURIComponent(toolId)}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeader(),
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to remove favorite: ${res.statusText}`);
    }
    const json = await res.json();
    return Boolean(json.success);
  }

  async syncFavorites(toolIds: string[]): Promise<string[]> {
    const res = await fetch('/api/favorites/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ toolIds }),
    });
    if (!res.ok) {
      throw new Error(`Failed to sync favorites: ${res.statusText}`);
    }
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  }
}

export const favoriteApi = new FavoriteApiService();
