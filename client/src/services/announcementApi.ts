export interface BroadcastAnnouncement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'important';
  status: 'active' | 'inactive' | 'archived';
  createdBy?: string;
  createdByName?: string;
  publishedAt: string;
  expiresAt?: string | null;
  dismissedCount?: number;
  viewCount?: number;
  createdAt?: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'important';
  expiresAt?: string | null;
}

function getAuthToken(): string | null {
  return (
    localStorage.getItem('tn_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('vexora_auth_token')
  );
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const announcementApi = {
  // Public / Session APIs
  async getActive(): Promise<{ success: boolean; data: BroadcastAnnouncement[] }> {
    return fetchWithAuth('/api/announcements/active');
  },

  async dismiss(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/announcements/${id}/dismiss`, {
      method: 'POST',
    });
  },

  async recordView(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/announcements/${id}/view`, {
      method: 'POST',
    });
  },

  // Administrative APIs
  async getAll(): Promise<{
    success: boolean;
    data: {
      announcements: BroadcastAnnouncement[];
      connectedLiveClients: number;
    };
  }> {
    return fetchWithAuth('/api/admin/announcements');
  },

  async create(payload: CreateAnnouncementPayload): Promise<{
    success: boolean;
    data: BroadcastAnnouncement;
    message: string;
  }> {
    return fetchWithAuth('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStatus(
    id: string,
    status: 'active' | 'inactive' | 'archived',
  ): Promise<{ success: boolean; data: BroadcastAnnouncement }> {
    return fetchWithAuth(`/api/admin/announcements/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
    });
  },
};
