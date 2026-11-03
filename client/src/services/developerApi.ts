function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('tn_token');
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const developerApi = {
  async searchDevelopers(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/developers?${qs.toString()}`);
    return res.json();
  },

  async getFeaturedDevelopers(limit = 6) {
    const res = await fetch(`/api/developers/featured?limit=${limit}`);
    return res.json();
  },

  async getProfileByUsername(username: string) {
    const res = await fetch(`/api/developers/${username}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getMyProfile() {
    const res = await fetch('/api/developers/profile/me', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async saveProfile(data: any) {
    const res = await fetch('/api/developers/profile', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/developers/profile/avatar', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: fd,
    });
    return res.json();
  },

  async uploadCover(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/developers/profile/cover', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: fd,
    });
    return res.json();
  },

  async searchProjects(params: Record<string, any> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    const res = await fetch(`/api/developers/projects?${qs.toString()}`);
    return res.json();
  },

  async getMyProjects() {
    const res = await fetch('/api/developers/projects/my', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getProjectBySlug(slug: string) {
    const res = await fetch(`/api/developers/projects/${slug}`);
    return res.json();
  },

  async createProject(data: any) {
    const res = await fetch('/api/developers/projects', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateProject(id: string, data: any) {
    const res = await fetch(`/api/developers/projects/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteProject(id: string) {
    const res = await fetch(`/api/developers/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async submitReport(data: {
    targetType: 'profile' | 'project';
    targetId: string;
    reason: string;
    description: string;
    reporterEmail?: string;
  }) {
    const res = await fetch('/api/developers/reports', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Project Engagement (Views, Reactions, Comments)
  async recordProjectView(idOrSlug: string) {
    const res = await fetch(`/api/developers/projects/${idOrSlug}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async getProjectReactions(projectId: string) {
    const res = await fetch(`/api/developers/projects/${projectId}/reactions`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async toggleReaction(
    projectId: string,
    reaction: 'love' | 'rocket' | 'fire' | 'insightful' | 'like',
  ) {
    const res = await fetch(`/api/developers/projects/${projectId}/react`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ reaction }),
    });
    return res.json();
  },

  async getProjectComments(projectId: string) {
    const res = await fetch(`/api/developers/projects/${projectId}/comments`);
    return res.json();
  },

  async addProjectComment(
    projectId: string,
    content: string,
    authorName?: string,
    authorAvatar?: string,
  ) {
    const res = await fetch(`/api/developers/projects/${projectId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ content, authorName, authorAvatar }),
    });
    return res.json();
  },

  async deleteProjectComment(commentId: string) {
    const res = await fetch(`/api/developers/projects/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
