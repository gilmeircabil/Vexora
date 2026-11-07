export * from './types.js';
export * from './componentsData.js';
export * from './websiteLayoutsData.js';
export * from './dashboardLayoutsData.js';
export * from './designStylesData.js';

import { ALL_COMPONENTS } from './componentsData.js';
import { WEBSITE_LAYOUTS } from './websiteLayoutsData.js';
import { DASHBOARD_LAYOUTS } from './dashboardLayoutsData.js';
import { DESIGN_STYLES } from './designStylesData.js';

export const getWebsiteLayoutById = (id: string) => {
  return WEBSITE_LAYOUTS.find((item) => item.id.toLowerCase() === id.toLowerCase());
};

export const getDashboardLayoutById = (id: string) => {
  return DASHBOARD_LAYOUTS.find((item) => item.id.toLowerCase() === id.toLowerCase());
};

export const getDesignStyleById = (id: string) => {
  return DESIGN_STYLES.find((item) => item.id.toLowerCase() === id.toLowerCase());
};

export const findAnyCatalogItem = (id: string) => {
  const comp = ALL_COMPONENTS.find((item) => item.id.toLowerCase() === id.toLowerCase());
  if (comp) return { item: comp, type: 'component' as const };

  const web = WEBSITE_LAYOUTS.find((item) => item.id.toLowerCase() === id.toLowerCase());
  if (web) return { item: web, type: 'website-layout' as const };

  const dash = DASHBOARD_LAYOUTS.find((item) => item.id.toLowerCase() === id.toLowerCase());
  if (dash) return { item: dash, type: 'dashboard-layout' as const };

  const style = DESIGN_STYLES.find((item) => item.id.toLowerCase() === id.toLowerCase());
  if (style) return { item: style, type: 'design-style' as const };

  return null;
};
