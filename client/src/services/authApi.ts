function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('tn_token');
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const authApi = {
  async updateProfile(data: { name?: string; bio?: string; avatarUrl?: string }) {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/auth/avatar', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: fd,
    });
    return res.json();
  },

  async deleteAvatar() {
    const res = await fetch('/api/auth/avatar', {
      method: 'DELETE',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    });
    return res.json();
  },
};
