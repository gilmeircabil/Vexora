/**
 * ============================================================================
 * VEXORAMODS GLOBAL PAGE LOCK & MAINTENANCE CONFIGURATION
 * ============================================================================
 *
 * Controls Maintenance Mode across the website. Managed dynamically via the
 * Admin Dashboard or falling back to local defaults.
 */

export interface PageLocksConfig {
  HOME: boolean;
  TOOLS: boolean;
  STUDIO: boolean;
  LEARNING: boolean;
  STUDY_SPACE: boolean;
  COMMUNITY: boolean;
  REVIEWS: boolean;
  DEVELOPER_PROJECTS: boolean;
  DASHBOARD: boolean;
  ABOUT: boolean;
  PRIVACY: boolean;
  TERMS: boolean;
  LICENSES: boolean;
  CONTRIBUTING: boolean;
  [key: string]: boolean;
}

export interface MaintenanceConfigData {
  global: boolean;
  title: string;
  message: string;
  estimatedReturn?: string;
  pages: Record<string, boolean>;
}

export const DEFAULT_MAINTENANCE_DATA: MaintenanceConfigData = {
  global: false,
  title: 'Scheduled Maintenance',
  message: 'This section is currently undergoing maintenance and improvements. Please check back shortly.',
  estimatedReturn: '',
  pages: {
    HOME: false,
    TOOLS: false,
    STUDIO: false,
    LEARNING: false,
    STUDY_SPACE: false,
    COMMUNITY: false,
    REVIEWS: false,
    DEVELOPER_PROJECTS: false,
    DASHBOARD: false,
    ABOUT: false,
    PRIVACY: false,
    TERMS: false,
    LICENSES: false,
    CONTRIBUTING: false,
  },
};

export const PAGE_LOCKS: PageLocksConfig = {
  HOME: false,
  TOOLS: false,
  STUDIO: false,
  LEARNING: false,
  STUDY_SPACE: false,
  COMMUNITY: false,
  REVIEWS: false,
  DEVELOPER_PROJECTS: false,
  DASHBOARD: false,
  ABOUT: false,
  PRIVACY: false,
  TERMS: false,
  LICENSES: false,
  CONTRIBUTING: false,
};

export interface PageLockMetadata {
  key: string;
  label: string;
  description: string;
  paths: string[];
  accentColor: string;
}

export const PAGE_LOCK_ITEMS: PageLockMetadata[] = [
  { key: 'HOME', label: 'Homepage', description: 'Main landing page (/)', paths: ['/'], accentColor: '#4ADE80' },
  { key: 'TOOLS', label: 'Tools Directory', description: 'All Tools & AI Workspaces (/tools, /category/*, /ai-tools/*)', paths: ['/tools', '/category', '/ai-tools'], accentColor: '#4ADE80' },
  { key: 'STUDIO', label: 'Design Studio', description: 'Design Editor (/studio, /design-studio/*)', paths: ['/studio', '/design-studio'], accentColor: '#38BDF8' },
  { key: 'LEARNING', label: 'Learning Hub', description: 'Articles & Tutorials (/learning)', paths: ['/learning'], accentColor: '#A78BFA' },
  { key: 'STUDY_SPACE', label: 'Study Space', description: 'Interactive Flashcards & Pomodoro (/study, /study-space)', paths: ['/study', '/study-space'], accentColor: '#FFD21A' },
  { key: 'COMMUNITY', label: 'Community & Donations', description: 'Supporters & Leaderboard (/community, /support, /leaderboard)', paths: ['/community', '/support', '/leaderboard'], accentColor: '#F472B6' },
  { key: 'REVIEWS', label: 'Ratings & Reviews', description: 'User Feedback & Reviews (/reviews)', paths: ['/reviews'], accentColor: '#FACC15' },
  { key: 'DASHBOARD', label: 'User Dashboard', description: 'Personal Profile & Settings (/dashboard)', paths: ['/dashboard'], accentColor: '#38BDF8' },
  { key: 'ABOUT', label: 'About Us', description: 'Platform information (/about)', paths: ['/about'], accentColor: '#4ADE80' },
  { key: 'PRIVACY', label: 'Privacy Policy', description: 'Privacy details (/privacy)', paths: ['/privacy'], accentColor: '#A78BFA' },
  { key: 'TERMS', label: 'Terms of Service', description: 'Usage terms (/terms)', paths: ['/terms'], accentColor: '#FFD21A' },
  { key: 'LICENSES', label: 'Licenses', description: 'Open Source Licenses (/licenses)', paths: ['/licenses'], accentColor: '#38BDF8' },
  { key: 'CONTRIBUTING', label: 'Contributing', description: 'Contributing Guidelines (/contributing)', paths: ['/contributing'], accentColor: '#4ADE80' },
];

export interface RouteLockStatus {
  isLocked: boolean;
  pageTitle: string;
  accentColor: string;
  key?: string;
}

/**
 * Checks whether the current route pathname is locked based on live MaintenanceConfigData or static fallback
 */
export function getRouteLockStatus(
  pathname: string,
  maintenanceConfig?: MaintenanceConfigData | null,
): RouteLockStatus {
  const path = (pathname || '/').toLowerCase();

  // If global maintenance is enabled, lock all non-admin routes
  if (maintenanceConfig?.global) {
    return {
      isLocked: true,
      pageTitle: 'Platform Maintenance',
      accentColor: '#FB923C',
      key: 'GLOBAL',
    };
  }

  const pagesMap: Record<string, boolean> = maintenanceConfig?.pages || PAGE_LOCKS;

  // Root / Home
  if (path === '/' || path === '') {
    return {
      isLocked: Boolean(pagesMap.HOME),
      pageTitle: 'Home',
      accentColor: '#4ADE80',
      key: 'HOME',
    };
  }

  // All Tools & Categories & AI Tools
  if (path.startsWith('/tools') || path.startsWith('/category') || path.startsWith('/ai-tools')) {
    return {
      isLocked: Boolean(pagesMap.TOOLS),
      pageTitle: 'Tools Directory',
      accentColor: '#4ADE80',
      key: 'TOOLS',
    };
  }

  // Design Studio
  if (path.startsWith('/studio') || path.startsWith('/design-studio')) {
    return {
      isLocked: Boolean(pagesMap.STUDIO),
      pageTitle: 'Design Studio',
      accentColor: '#38BDF8',
      key: 'STUDIO',
    };
  }

  // Learning Hub
  if (path.startsWith('/learning')) {
    return {
      isLocked: Boolean(pagesMap.LEARNING),
      pageTitle: 'Learning Hub',
      accentColor: '#A78BFA',
      key: 'LEARNING',
    };
  }

  // Study Space
  if (path.startsWith('/study')) {
    return {
      isLocked: Boolean(pagesMap.STUDY_SPACE),
      pageTitle: 'Study Space',
      accentColor: '#FFD21A',
      key: 'STUDY_SPACE',
    };
  }

  // Community
  if (path.startsWith('/community') || path.startsWith('/support') || path.startsWith('/leaderboard')) {
    return {
      isLocked: Boolean(pagesMap.COMMUNITY),
      pageTitle: 'Community Hub',
      accentColor: '#F472B6',
      key: 'COMMUNITY',
    };
  }

  // Reviews
  if (path.startsWith('/reviews')) {
    return {
      isLocked: Boolean(pagesMap.REVIEWS),
      pageTitle: 'Reviews',
      accentColor: '#FACC15',
      key: 'REVIEWS',
    };
  }

  // Developer Projects
  if (path.startsWith('/developers')) {
    return {
      isLocked: Boolean(pagesMap.DEVELOPER_PROJECTS),
      pageTitle: 'Developer Projects',
      accentColor: '#FB923C',
      key: 'DEVELOPER_PROJECTS',
    };
  }

  // Dashboard
  if (path.startsWith('/dashboard')) {
    return {
      isLocked: Boolean(pagesMap.DASHBOARD),
      pageTitle: 'Dashboard',
      accentColor: '#38BDF8',
      key: 'DASHBOARD',
    };
  }

  // About
  if (path.startsWith('/about')) {
    return {
      isLocked: Boolean(pagesMap.ABOUT),
      pageTitle: 'About',
      accentColor: '#4ADE80',
      key: 'ABOUT',
    };
  }

  // Privacy Policy
  if (path.startsWith('/privacy')) {
    return {
      isLocked: Boolean(pagesMap.PRIVACY),
      pageTitle: 'Privacy Policy',
      accentColor: '#A78BFA',
      key: 'PRIVACY',
    };
  }

  // Terms
  if (path.startsWith('/terms')) {
    return {
      isLocked: Boolean(pagesMap.TERMS),
      pageTitle: 'Terms of Service',
      accentColor: '#FFD21A',
      key: 'TERMS',
    };
  }

  // Licenses
  if (path.startsWith('/licenses')) {
    return {
      isLocked: Boolean(pagesMap.LICENSES),
      pageTitle: 'Licenses',
      accentColor: '#38BDF8',
      key: 'LICENSES',
    };
  }

  // Contributing
  if (path.startsWith('/contributing')) {
    return {
      isLocked: Boolean(pagesMap.CONTRIBUTING),
      pageTitle: 'Contributing',
      accentColor: '#4ADE80',
      key: 'CONTRIBUTING',
    };
  }

  return { isLocked: false, pageTitle: 'Page', accentColor: '#FFD21A' };
}
