async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data: T; error?: string }> {
  const token = localStorage.getItem('tn_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers,
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json;
}

export const LEARNING_CATEGORIES = [
  'Web Development',
  'Frontend Development',
  'Backend Development',
  'Programming',
  'AI and Machine Learning',
  'Cybersecurity',
  'UI/UX Design',
  'Databases',
  'Tutorials',
  'Project Ideas',
  'Learning Journey',
  'Resources',
  'General Discussion',
] as const;

export const OPEN_LEARNING_TOPICS = [
  'Programming',
  'Technology',
  'Web Development',
  'Frontend Development',
  'Backend Development',
  'AI and Machine Learning',
  'Cybersecurity',
  'UI/UX Design',
  'Databases',
  'Business',
  'Entrepreneurship',
  'Finance',
  'Photography',
  'Graphic Design',
  'Cooking',
  'Science',
  'Mathematics',
  'Music',
  'Languages',
  'Personal Development',
  'Education',
  'Lifestyle',
  'Hobbies',
  'Tutorials',
  'Project Ideas',
  'Learning Journey',
  'Resources',
  'General Discussion',
] as const;

export const LEARNING_CONTENT_TYPES = [
  { id: 'article', label: 'Article / Written Tutorial' },
  { id: 'course', label: 'Complete Course (Chapters & Lessons)' },
  { id: 'video', label: 'Video Lesson' },
  { id: 'guide', label: 'Step-by-Step Guide' },
  { id: 'pdf', label: 'PDF & Document Resource' },
  { id: 'file', label: 'Downloadable Learning Files' },
  { id: 'code', label: 'Code Examples & Project Resource' },
  { id: 'discussion', label: 'Educational Discussion & Community Post' },
] as const;

export type LearningContentType =
  'article' | 'video' | 'pdf' | 'file' | 'course' | 'guide' | 'code' | 'discussion';

export interface LearningLessonResource {
  name: string;
  fileId?: string;
  url?: string;
  size?: number;
  mimeType?: string;
}

export interface LearningCourseLesson {
  lessonId: string;
  title: string;
  contentType: 'text' | 'video' | 'pdf' | 'code' | 'file';
  content: string;
  videoUrl?: string;
  durationMinutes?: number;
  isFreePreview?: boolean;
  isLocked?: boolean;
  order: number;
  resources?: LearningLessonResource[];
}

export interface LearningCourseChapter {
  chapterId: string;
  title: string;
  description?: string;
  order: number;
  lessons: LearningCourseLesson[];
}

export interface LearningStepItem {
  stepNumber: number;
  title: string;
  content: string;
  codeSnippet?: string;
  isLocked?: boolean;
}

export interface LearningCodeSnippet {
  title: string;
  language: string;
  code: string;
  isLocked?: boolean;
}

export interface LearningProtectedFile {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey?: string;
  isPreview?: boolean;
  isLocked?: boolean;
  downloadUrl?: string | null;
}

export interface LearningPost {
  _id: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  contentType?: LearningContentType;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTimeMinutes: number;
  coverImage?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  resourceLinks: Array<{ label: string; url: string }>;
  pricingType?: 'free' | 'paid';
  price?: number;
  currency?: string;
  previewContent?: string;
  learningOutcomes?: string[];
  chapters?: LearningCourseChapter[];
  steps?: LearningStepItem[];
  codeSnippets?: LearningCodeSnippet[];
  protectedFiles?: LearningProtectedFile[];
  rightsConfirmed?: boolean;
  status: 'draft' | 'published' | 'hidden' | 'archived' | 'removed';
  isFeatured: boolean;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  averageRating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  hasAccess?: boolean;
  accessReason?: 'free' | 'author' | 'admin' | 'entitled' | 'purchased' | 'locked';
  viewerLiked?: boolean;
  viewerBookmarked?: boolean;
  viewerProgress?: {
    isSavedToLibrary: boolean;
    completedLessonIds: string[];
    progressPercent: number;
    isCompleted: boolean;
  } | null;
  progress?: {
    completedLessonIds: string[];
    progressPercent: number;
    isCompleted: boolean;
    completedAt?: string;
    lastViewedAt?: string;
  };
  related?: LearningPost[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningComment {
  _id: string;
  postId: string;
  authorId?: string;
  userId?: string;
  authorName?: string;
  userName?: string;
  userUsername?: string;
  authorAvatar?: string;
  userAvatar?: string;
  parentCommentId?: string | null;
  content: string;
  likesCount?: number;
  status: 'active' | 'visible' | 'hidden' | 'deleted';
  createdAt: string;
}

export interface LearningReview {
  _id: string;
  postId: string;
  creatorId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'approved' | 'hidden' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedCreator {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  headline: string;
  bio: string;
  expertise: string[];
  followersCount: number;
  publishedCount: number;
  totalViews: number;
  totalLikes: number;
  totalEnrollments: number;
  averageRating: number;
  reviewCount: number;
}

export interface DiscoveryOverview {
  featured: LearningPost[];
  recentlyPublished: LearningPost[];
  popular: LearningPost[];
  highestRated: LearningPost[];
  freeLearning: LearningPost[];
  paidLearning: LearningPost[];
  trendingCategories: Array<{ category: string; count: number }>;
  trendingTags: Array<{ tag: string; count: number }>;
  recommendedCreators: RecommendedCreator[];
  openTopics: readonly string[];
}

export interface CreatorPublicProfile {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  headline: string;
  expertise: string[];
  interests: string[];
  websiteUrl: string;
  followersCount: number;
  viewerFollowing: boolean;
  stats: {
    totalPublished: number;
    freeCount: number;
    paidCount: number;
    averageRating: number;
    reviewCount: number;
    verifiedReviewsCount: number;
    verifiedPurchasesCount: number;
  };
  publishedMaterials: LearningPost[];
  freeMaterials: LearningPost[];
  paidMaterials: LearningPost[];
  recentFeedback: LearningReview[];
}

export interface CreatorDashboardData {
  overview: {
    totalMaterials: number;
    totalPublished: number;
    totalDrafts: number;
    totalArchived: number;
    freeCount: number;
    paidCount: number;
    totalViews: number;
    totalLikes: number;
    totalEnrollments: number;
    verifiedPurchases: number;
    grossSales: number;
    platformFees: number;
    processingFees: number;
    platformFeePercent: number;
    processingFeePercent: number;
    refundsCount: number;
    refundedAmount: number;
    netCreatorEarnings: number;
    availableEarnings: number;
    pendingPayouts: number;
    paidOutTotal: number;
  };
  materials: LearningPost[];
  drafts: LearningPost[];
  freeContentPerformance: Array<{
    _id: string;
    title: string;
    slug: string;
    contentType: LearningContentType;
    category: string;
    status: string;
    viewsCount: number;
    likesCount: number;
    bookmarksCount: number;
    enrollmentCount: number;
    averageRating: number;
    reviewCount: number;
    createdAt: string;
  }>;
  paidContentPerformance: Array<{
    _id: string;
    title: string;
    slug: string;
    contentType: LearningContentType;
    category: string;
    status: string;
    price: number;
    currency: string;
    viewsCount: number;
    likesCount: number;
    averageRating: number;
    reviewCount: number;
    verifiedPurchases: number;
    grossSales: number;
    netEarnings: number;
    refunds: number;
    createdAt: string;
  }>;
  transactions: Array<{
    _id: string;
    buyerId: { _id: string; name: string; email?: string } | string;
    postId: { _id: string; title: string; slug: string } | string;
    amount: number;
    currency: string;
    platformFee: number;
    processingFee: number;
    creatorNetEarnings: number;
    paymentProvider: string;
    status: 'pending' | 'succeeded' | 'failed' | 'refunded';
    verifiedAt?: string;
    refundedAt?: string;
    createdAt: string;
  }>;
  payoutHistory: Array<{
    _id: string;
    amount: number;
    currency: string;
    payoutMethod: string;
    payoutAccountInfo: string;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    adminNotes?: string;
    processedAt?: string;
    createdAt: string;
  }>;
  creatorProfile?: any;
}

export interface LearnerLibraryData {
  purchasedContent: LearningPost[];
  freeSavedMaterials: LearningPost[];
  bookmarkedLessons: LearningPost[];
  recentlyViewed: LearningPost[];
  inProgressMaterials: LearningPost[];
  completedCourses: LearningPost[];
  purchasesHistory: any[];
}

export const learningApi = {
  listPosts: (params?: {
    q?: string;
    category?: string;
    tag?: string;
    difficulty?: string;
    contentType?: string;
    pricingType?: string;
    minPrice?: number;
    maxPrice?: number;
    authorId?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.category && params.category !== 'All') qs.set('category', params.category);
    if (params?.tag) qs.set('tag', params.tag);
    if (params?.difficulty && params.difficulty !== 'All') qs.set('difficulty', params.difficulty);
    if (params?.contentType && params.contentType !== 'All')
      qs.set('contentType', params.contentType);
    if (params?.pricingType && params.pricingType !== 'All')
      qs.set('pricingType', params.pricingType);
    if (params?.minPrice !== undefined) qs.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) qs.set('maxPrice', String(params.maxPrice));
    if (params?.authorId) qs.set('authorId', params.authorId);
    if (params?.sort) qs.set('sort', params.sort);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));

    return apiFetch<{
      items: LearningPost[];
      featured: LearningPost[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/learning/posts?${qs.toString()}`);
  },

  getDiscoveryOverview: () => apiFetch<DiscoveryOverview>('/learning/discovery'),

  getPostBySlug: (slug: string, skipView = false) =>
    apiFetch<LearningPost>(
      `/learning/posts/${encodeURIComponent(slug)}${skipView ? '?skipView=true' : ''}`,
    ),

  createPost: (data: {
    title: string;
    excerpt?: string;
    content: string;
    contentType?: LearningContentType;
    category: string;
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    coverImage?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    resourceLinks?: Array<{ label: string; url: string }>;
    pricingType?: 'free' | 'paid';
    price?: number;
    currency?: string;
    previewContent?: string;
    learningOutcomes?: string[];
    chapters?: LearningCourseChapter[];
    steps?: LearningStepItem[];
    codeSnippets?: LearningCodeSnippet[];
    protectedFiles?: LearningProtectedFile[];
    rightsConfirmed?: boolean;
    status?: 'draft' | 'published' | 'archived';
  }) =>
    apiFetch<LearningPost>('/learning/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePost: (postId: string, data: Partial<LearningPost>) =>
    apiFetch<LearningPost>(`/learning/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePost: (postId: string) =>
    apiFetch<{ deleted: boolean }>(`/learning/posts/${postId}`, {
      method: 'DELETE',
    }),

  toggleLike: (postId: string) =>
    apiFetch<{ liked: boolean; likesCount: number }>(`/learning/posts/${postId}/like`, {
      method: 'POST',
    }),

  toggleBookmark: (postId: string) =>
    apiFetch<{ bookmarked: boolean; bookmarksCount: number }>(
      `/learning/posts/${postId}/bookmark`,
      {
        method: 'POST',
      },
    ),

  getUserBookmarks: () => apiFetch<{ items: LearningPost[] }>('/learning/bookmarks'),

  getComments: (postId: string) =>
    apiFetch<{ comments: LearningComment[] }>(`/learning/posts/${postId}/comments`),

  addComment: (postId: string, content: string, parentCommentId?: string | null) =>
    apiFetch<LearningComment>(`/learning/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    }),

  deleteComment: (commentId: string) =>
    apiFetch<{ deleted: boolean; commentsCount: number }>(`/learning/comments/${commentId}`, {
      method: 'DELETE',
    }),

  // Ratings & Reviews
  getReviews: (postId: string, page = 1) =>
    apiFetch<{
      reviews: LearningReview[];
      total: number;
      page: number;
      totalPages: number;
      summary: {
        averageRating: number;
        totalApproved: number;
        distribution: Record<number, number>;
      };
    }>(`/learning/posts/${postId}/reviews?page=${page}`),

  upsertReview: (postId: string, rating: number, comment: string) =>
    apiFetch<{
      review: LearningReview;
      averageRating: number;
      reviewCount: number;
    }>(`/learning/posts/${postId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),

  deleteReview: (reviewId: string) =>
    apiFetch<{ deleted: boolean }>(`/learning/reviews/${reviewId}`, {
      method: 'DELETE',
    }),

  // Creator Profile & Following
  getCreatorProfile: (usernameOrId: string) =>
    apiFetch<CreatorPublicProfile>(`/learning/creators/${encodeURIComponent(usernameOrId)}`),

  updateCreatorProfile: (data: {
    displayName?: string;
    username?: string;
    avatarUrl?: string;
    bio?: string;
    headline?: string;
    expertise?: string[];
    interests?: string[];
    websiteUrl?: string;
    payoutMethod?: string;
    payoutAccountInfo?: string;
  }) =>
    apiFetch<any>('/learning/creator/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleFollowCreator: (creatorId: string) =>
    apiFetch<{ following: boolean; followersCount: number }>(
      `/learning/creators/${creatorId}/follow`,
      { method: 'POST' },
    ),

  // Creator Dashboard, Earnings & Payouts
  getCreatorDashboard: () => apiFetch<CreatorDashboardData>('/learning/creator/dashboard'),

  requestPayout: (data: { amount: number; payoutMethod: string; payoutAccountInfo: string }) =>
    apiFetch<any>('/learning/creator/payouts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Learner Library & Course Progress
  getLearnerLibrary: () => apiFetch<LearnerLibraryData>('/learning/library'),

  saveFreeToLibrary: (postId: string) =>
    apiFetch<any>(`/learning/posts/${postId}/library`, {
      method: 'POST',
    }),

  updateCourseProgress: (
    postId: string,
    data: { lessonId?: string; completed?: boolean; markCourseCompleted?: boolean },
  ) =>
    apiFetch<any>(`/learning/posts/${postId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Paid Content Checkout & Verification
  createPurchaseCheckout: (postId: string, paymentProvider?: 'paymongo' | 'stripe' | 'sandbox') =>
    apiFetch<{
      purchaseId: string;
      providerSessionId: string;
      paymentProvider: string;
      amount: number;
      currency: string;
      status: string;
      checkoutUrl: string;
      requiresWebhookVerification: boolean;
    }>(`/learning/posts/${postId}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ paymentProvider }),
    }),

  verifySandboxPurchase: (purchaseId: string) =>
    apiFetch<any>(`/learning/purchases/${purchaseId}/verify-sandbox`, {
      method: 'POST',
    }),

  refundPurchase: (purchaseId: string, reason?: string) =>
    apiFetch<any>(`/learning/purchases/${purchaseId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Protected File Upload
  uploadLearningFile: async (file: File, isPreview = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPreview', String(isPreview));
    return apiFetch<LearningProtectedFile>('/learning/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  createReport: (
    targetType: 'post' | 'comment' | 'review' | 'creator',
    targetId: string,
    reason: string,
    category: 'spam' | 'inappropriate' | 'copyright' | 'prohibited' | 'other' = 'other',
  ) =>
    apiFetch('/learning/reports', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, reason, category }),
    }),
};
