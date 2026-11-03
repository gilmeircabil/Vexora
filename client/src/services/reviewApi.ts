export interface ReviewItem {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalApproved: number;
  distribution: ReviewDistribution;
  recentReviews: ReviewItem[];
}

export const reviewApi = {
  async getSummary(limit = 4): Promise<{ success: boolean; data?: ReviewSummary; error?: string }> {
    const res = await fetch(`/api/reviews/summary?limit=${limit}`);
    return res.json();
  },

  async listReviews(params?: {
    page?: number;
    limit?: number;
    rating?: number;
    sort?: 'newest' | 'highest' | 'lowest';
  }): Promise<{
    success: boolean;
    data?: {
      reviews: ReviewItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      summary: {
        averageRating: number;
        totalApproved: number;
        distribution: ReviewDistribution;
      };
    };
    error?: string;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.rating) query.set('rating', String(params.rating));
    if (params?.sort) query.set('sort', params.sort);

    const qs = query.toString();
    const res = await fetch(`/api/reviews${qs ? `?${qs}` : ''}`);
    return res.json();
  },

  async submitReview(payload: {
    rating: number;
    comment: string;
    userAvatar?: string;
  }): Promise<{ success: boolean; data?: ReviewItem; message?: string; error?: string }> {
    const token = localStorage.getItem('tn_token') || localStorage.getItem('vexora_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteOwnReview(
    id: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const token = localStorage.getItem('tn_token') || localStorage.getItem('vexora_auth_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.json();
  },
};
