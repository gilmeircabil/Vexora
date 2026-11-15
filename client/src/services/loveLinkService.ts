export type PaperLayoutId =
  | 'classic'
  | 'ornate-frame'
  | 'polaroid-postcard'
  | 'midnight-velvet'
  | 'lined-notebook'
  | 'royal-gold';

export type WaxSealId = 'heart' | 'crown' | 'star' | 'sparkle' | 'lock';
export type ParticleEffectId =
  | 'hearts'
  | 'petals'
  | 'butterflies'
  | 'fireflies'
  | 'stars'
  | 'sparkles'
  | 'none';
export type MusicPresetId =
  | 'none'
  | 'gentle-chimes'
  | 'musicbox-lullaby'
  | 'romantic-piano'
  | 'dreamy-harp'
  | 'custom';

export interface LetterCustomization {
  font?: 'serif' | 'script' | 'sans' | 'handwriting';
  paperLayout?: PaperLayoutId;
  salutation?: string;
  signOff?: string;
  waxSeal?: WaxSealId;
  particleEffect?: ParticleEffectId;
  bgTheme?: string;
  envelopeStyle?: string;
  openingAnimation?: 'gentle-unfold' | 'romantic-pop' | 'wax-break';
  musicPreset?: MusicPresetId;
  customMusicUrl?: string;
  customMusicTitle?: string;
  photoStyle?: 'grid' | 'polaroid';
  alignment?: 'left' | 'center' | 'right';
  decorativeElements?: string[];
}

export const PAPER_LAYOUTS: { id: PaperLayoutId; name: string; badge: string }[] = [
  { id: 'classic', name: 'Classic Parchment', badge: 'Warm' },
  { id: 'ornate-frame', name: 'Ornate Vintage', badge: 'Double Border' },
  { id: 'polaroid-postcard', name: 'Polaroid Postcard', badge: 'Air Mail' },
  { id: 'midnight-velvet', name: 'Midnight Velvet', badge: 'Dark Luxury' },
  { id: 'lined-notebook', name: 'Lined Notebook', badge: 'Ruled Pad' },
  { id: 'royal-gold', name: 'Royal Gold', badge: 'Gilded' },
];

export const REACTION_OPTIONS = [
  { id: 'love', emoji: '❤️', label: 'Loved It' },
  { id: 'touched', emoji: '🥹', label: 'So Touched' },
  { id: 'hug', emoji: '🤗', label: 'Sending Hugs' },
  { id: 'forever', emoji: '💍', label: 'Forever Yours' },
  { id: 'smile', emoji: '😊', label: 'Made Me Smile' },
] as const;

export interface LoveLetter {
  _id: string;
  userId: string;
  recipientName: string;
  senderName: string;
  isAnonymous: boolean;
  title: string;
  message: string;
  template: string;
  customization: LetterCustomization;
  attachments: string[];
  publicToken?: string | null;
  status: 'draft' | 'published' | 'revoked';
  isPasswordProtected: boolean;
  scheduledRevealAt?: string | null;
  expiresAt?: string | null;
  firstOpenedAt?: string | null;
  openCount: number;
  recipientReaction?: string | null;
  recipientReply?: string;
  recipientRepliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicLetter {
  publicToken: string;
  recipientName: string;
  senderName: string;
  isAnonymous?: boolean;
  title?: string;
  message?: string;
  template: string;
  customization: LetterCustomization;
  attachments?: string[];
  isPasswordProtected?: boolean;
  isLocked?: boolean;
  isScheduled?: boolean;
  scheduledRevealAt?: string | null;
  expiresAt?: string | null;
  firstOpenedAt?: string | null;
  recipientReaction?: string | null;
  recipientReply?: string;
  recipientRepliedAt?: string | null;
  createdAt?: string;
}

export interface DashboardMetrics {
  total: number;
  published: number;
  drafts: number;
  opened: number;
}

export interface LetterTemplateInfo {
  id: string;
  name: string;
  description: string;
  envelopeColor: string;
  badge: string;
  paperStyle: string;
  font: 'serif' | 'script' | 'sans' | 'handwriting';
}

export const LETTER_TEMPLATES: LetterTemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic Love Letter',
    description: 'Timeless parchment paper, deep crimson seal, and traditional romantic elegance.',
    envelopeColor: 'bg-rose-900 border-rose-950',
    badge: 'Timeless',
    paperStyle: 'bg-amber-50/95 text-stone-900 border-amber-200/80 shadow-rose-900/10',
    font: 'serif',
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    description: 'Vibrant soft pinks, gentle rose petals, and warm affectionate accents.',
    envelopeColor: 'bg-rose-500 border-rose-600',
    badge: 'Popular',
    paperStyle: 'bg-pink-50/95 text-rose-950 border-pink-200 shadow-rose-400/20',
    font: 'script',
  },
  {
    id: 'playful',
    name: 'Cute and Playful',
    description: 'Pastel peach, bubbly cheerful accents, and sweet whimsical typography.',
    envelopeColor: 'bg-orange-300 border-orange-400',
    badge: 'Sweet',
    paperStyle: 'bg-orange-50/95 text-stone-800 border-orange-200 shadow-orange-200/30',
    font: 'handwriting',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean cream white, structured spacing, and delicate modern typography.',
    envelopeColor: 'bg-stone-200 border-stone-300 text-stone-800',
    badge: 'Modern',
    paperStyle: 'bg-white text-stone-800 border-stone-200 shadow-stone-300/20',
    font: 'sans',
  },
  {
    id: 'secret',
    name: 'Secret Admirer',
    description: 'Deep midnight velvet, enchanting mysterious glow, and confidential charm.',
    envelopeColor: 'bg-purple-900 border-purple-950',
    badge: 'Mystery',
    paperStyle: 'bg-purple-50/95 text-purple-950 border-purple-200 shadow-purple-900/15',
    font: 'serif',
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Warm champagne gold touches, celebratory elegance, and milestone warmth.',
    envelopeColor: 'bg-amber-600 border-amber-700',
    badge: 'Special',
    paperStyle: 'bg-amber-50/90 text-amber-950 border-amber-300 shadow-amber-300/20',
    font: 'serif',
  },
  {
    id: 'friendship',
    name: 'Friendship Letter',
    description: 'Warm sunny peach, heartfelt appreciation, and bright cheerful companionship.',
    envelopeColor: 'bg-amber-400 border-amber-500',
    badge: 'Warm',
    paperStyle: 'bg-yellow-50/95 text-amber-950 border-yellow-200 shadow-yellow-200/30',
    font: 'sans',
  },
  {
    id: 'appreciation',
    name: 'Appreciation Letter',
    description: 'Subtle sage & cream accents, sincere gratitude, and calming grateful warmth.',
    envelopeColor: 'bg-emerald-700 border-emerald-800',
    badge: 'Sincere',
    paperStyle: 'bg-emerald-50/95 text-emerald-950 border-emerald-200 shadow-emerald-200/20',
    font: 'serif',
  },
];

class LoveLinkApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('tn_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async uploadMedia(file: File): Promise<{ url: string; storageKey: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/lovelink/upload', {
      method: 'POST',
      headers: { ...this.getAuthHeader() },
      body: formData,
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to upload media to R2');
    return json;
  }

  async createLetter(data: Partial<LoveLetter> & { password?: string }): Promise<LoveLetter> {
    const res = await fetch('/api/lovelink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save letter');
    return json.letter;
  }

  async updateLetter(id: string, data: Partial<LoveLetter> & { password?: string }): Promise<LoveLetter> {
    const res = await fetch(`/api/lovelink/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update letter');
    return json.letter;
  }

  async publishLetter(id: string): Promise<{ letter: LoveLetter; publicToken: string; publicUrl: string }> {
    const res = await fetch(`/api/lovelink/${id}/publish`, {
      method: 'POST',
      headers: { ...this.getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to publish letter');
    return json;
  }

  async getUserLetters(query?: { status?: string; search?: string; sort?: string }): Promise<{ letters: LoveLetter[]; metrics: DashboardMetrics }> {
    const params = new URLSearchParams();
    if (query?.status) params.set('status', query.status);
    if (query?.search) params.set('search', query.search);
    if (query?.sort) params.set('sort', query.sort);

    const res = await fetch(`/api/lovelink/my?${params.toString()}`, {
      headers: { ...this.getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch letters');
    return { letters: json.letters || [], metrics: json.metrics || { total: 0, published: 0, drafts: 0, opened: 0 } };
  }

  async revokeLetter(id: string): Promise<boolean> {
    const res = await fetch(`/api/lovelink/${id}/revoke`, {
      method: 'POST',
      headers: { ...this.getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to revoke letter');
    return true;
  }

  async deleteLetter(id: string): Promise<boolean> {
    const res = await fetch(`/api/lovelink/${id}`, {
      method: 'DELETE',
      headers: { ...this.getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete letter');
    return true;
  }

  async getPublicLetter(token: string): Promise<PublicLetter> {
    const res = await fetch(`/api/lovelink/public/${token}`);
    const json = await res.json();
    if (res.status === 410) throw new Error('EXPIRED');
    if (!res.ok || !json.success) throw new Error(json.error || 'Letter not found');
    return json.letter;
  }

  async verifyPassword(token: string, password: string): Promise<PublicLetter> {
    const res = await fetch(`/api/lovelink/public/${token}/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Incorrect password');
    return json.letter;
  }

  async recordOpen(token: string): Promise<void> {
    await fetch(`/api/lovelink/public/${token}/open`, {
      method: 'POST',
    }).catch(() => {});
  }

  async submitReaction(
    token: string,
    payload: { reaction?: string; reply?: string },
  ): Promise<{
    success: boolean;
    recipientReaction?: string | null;
    recipientReply?: string;
  }> {
    const res = await fetch(`/api/lovelink/public/${token}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send response');
    return json;
  }
}

export const loveLinkApi = new LoveLinkApiService();
