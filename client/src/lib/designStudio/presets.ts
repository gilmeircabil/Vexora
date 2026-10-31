export interface DesignPreset {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export const DESIGN_CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'social-media', name: 'Social Media' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'presentations', name: 'Presentations' },
  { id: 'marketing', name: 'Marketing & Flyers' },
  { id: 'business', name: 'Business' },
  { id: 'events', name: 'Events & Posters' },
  { id: 'custom', name: 'Custom' },
];

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    category: 'social-media',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: '1080 × 1080 px (Square)',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story / Reel',
    category: 'social-media',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: '1080 × 1920 px (Vertical)',
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    category: 'youtube',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    description: '1280 × 720 px (HD)',
  },
  {
    id: 'youtube-banner',
    name: 'YouTube Channel Banner',
    category: 'youtube',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    description: '2560 × 1440 px (Header)',
  },
  {
    id: 'facebook-cover',
    name: 'Facebook Cover',
    category: 'social-media',
    width: 820,
    height: 312,
    aspectRatio: '2.6:1',
    description: '820 × 312 px (Banner)',
  },
  {
    id: 'presentation-slide',
    name: 'Presentation Slide',
    category: 'presentations',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: '1920 × 1080 px (Full HD)',
  },
  {
    id: 'poster',
    name: 'Event Poster',
    category: 'events',
    width: 1200,
    height: 1600,
    aspectRatio: '3:4',
    description: '1200 × 1600 px (Portrait)',
  },
  {
    id: 'marketing-flyer',
    name: 'Marketing Flyer',
    category: 'marketing',
    width: 1080,
    height: 1440,
    aspectRatio: '3:4',
    description: '1080 × 1440 px (Portrait)',
  },
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'business',
    width: 1050,
    height: 600,
    aspectRatio: '3.5:2',
    description: '1050 × 600 px (Landscape)',
  },
  {
    id: 'logo-design',
    name: 'Logo Design',
    category: 'business',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    description: '800 × 800 px (Square)',
  },
];
