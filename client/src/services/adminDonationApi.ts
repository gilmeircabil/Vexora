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
};
