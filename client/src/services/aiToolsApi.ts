function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('tn_token');
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const aiToolsApi = {
  async getModelStatus() {
    const res = await fetch('/api/ai/status', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return res.json();
  },

  async enhanceImage(formData: FormData) {
    const res = await fetch('/api/ai/enhance', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async removeBackground(formData: FormData) {
    const res = await fetch('/api/ai/remove-background', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async removeObject(formData: FormData) {
    const res = await fetch('/api/ai/remove-object', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async restorePhoto(formData: FormData) {
    const res = await fetch('/api/ai/restore-photo', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async runOcr(formData: FormData) {
    const res = await fetch('/api/ai/ocr', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    return res.json();
  },

  async getJobStatus(jobId: string) {
    const res = await fetch(`/api/ai/jobs/${jobId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return res.json();
  },

  async getHistory() {
    const res = await fetch('/api/ai/history', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return res.json();
  },
};
