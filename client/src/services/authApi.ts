function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('tn_token');
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const authApi = {
  async getOAuthConfig() {
    const res = await fetch('/api/auth/oauth/config');
    return res.json();
  },

  async loginWithOAuth(data: {
    provider: 'google' | 'github' | 'facebook';
    providerId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }) {
    const res = await fetch('/api/auth/oauth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async bindOAuth(data: {
    provider: 'google' | 'github' | 'facebook';
    providerId: string;
    email?: string;
    username?: string;
    avatarUrl?: string;
  }) {
    const res = await fetch('/api/auth/oauth/bind', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async unbindOAuth(provider: 'google' | 'github' | 'facebook') {
    const res = await fetch(`/api/auth/oauth/unbind/${provider}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateProfile(data: { name?: string; bio?: string; avatarUrl?: string }) {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
