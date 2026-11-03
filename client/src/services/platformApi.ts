export const platformApi = {
  async getHomeOverview() {
    const res = await fetch('/api/platform/home');
    return res.json();
  },

  async getMaintenance() {
    const res = await fetch('/api/platform/maintenance');
    return res.json();
  },

  async submitContactInquiry(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const res = await fetch('/api/platform/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
