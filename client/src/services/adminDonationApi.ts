function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('tn_token');
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const adminDonationApi = {
  async getDonations(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/admin/donations?${qs.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateDonation(id: string, data: any) {
    const res = await fetch(`/api/admin/donations/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getWebhooks(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/admin/donations/webhooks?${qs.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getDevelopers(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/admin/developers?${qs.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateDeveloper(id: string, data: any) {
    const res = await fetch(`/api/admin/developers/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getProjects(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/admin/projects?${qs.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateProject(id: string, data: any) {
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteProject(id: string) {
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getReports(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/admin/reports?${qs.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async resolveReport(id: string, data: any) {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateUserStatus(id: string, data: { isSuspended?: boolean; suspensionReason?: string }) {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getLearningPosts(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/admin/learning/posts?${qs.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async moderateLearningPost(id: string, data: { status?: string; isFeatured?: boolean }) {
    const res = await fetch(`/api/admin/learning/posts/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteLearningPost(id: string) {
    const res = await fetch(`/api/admin/learning/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getLearningComments(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/admin/learning/comments?${qs.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async moderateLearningComment(id: string, status: 'active' | 'hidden' | 'deleted') {
    const res = await fetch(`/api/admin/learning/comments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getLearningReports(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/admin/learning/reports?${qs.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async resolveLearningReport(
    id: string,
    data: { status: 'resolved' | 'dismissed'; actionTaken?: string },
  ) {
    const res = await fetch(`/api/admin/learning/reports/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getPlatformConfig() {
    const res = await fetch('/api/admin/platform-config', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updatePlatformConfig(data: Record<string, any>) {
    const res = await fetch('/api/admin/platform-config', {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateMaintenance(data: {
    global?: boolean;
    title?: string;
    message?: string;
    estimatedReturn?: string;
    pages?: Record<string, boolean>;
  }) {
    const res = await fetch('/api/admin/maintenance', {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
