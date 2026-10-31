function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('tn_token');
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface CreateDonationPayload {
  amount: number;
  displayName?: string;
  isAnonymous?: boolean;
  message?: string;
  donorEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const donationApi = {
  async getSummary() {
    const res = await fetch('/api/donations/summary');
    return res.json();
  },

  async getLeaderboard(limit = 20) {
    const res = await fetch(`/api/donations/leaderboard?limit=${limit}`);
    return res.json();
  },

  async getStatus(id: string) {
    const res = await fetch(`/api/donations/${id}/status`);
    return res.json();
  },

  async createCheckout(payload: CreateDonationPayload) {
    const res = await fetch('/api/donations/checkout', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
