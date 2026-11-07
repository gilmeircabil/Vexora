export type UIComponentCategory =
  | 'navigation'
  | 'buttons'
  | 'cards'
  | 'forms'
  | 'data-display'
  | 'feedback'
  | 'advanced';

export type UILibrarySection =
  | 'components'
  | 'website-layouts'
  | 'dashboard-layouts'
  | 'design-styles'
  | 'playground'
  | 'favorites';

export interface ComponentVariation {
  id: string;
  name: string;
  description: string;
  codeReact: string;
  codeHtml: string;
  codeCss?: string;
  codeJs?: string;
}

export interface UIComponentItem {
  id: string;
  name: string;
  category: UIComponentCategory;
  description: string;
  purpose: string;
  whatIsIt: string;
  whatIsItUsedFor: string;
  whereToUse: string;
  advantages: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  variations: ComponentVariation[];
  relatedComponents: string[];
  popular?: boolean;
  dateAdded?: string;
}

export interface WebsiteLayoutItem {
  id: string;
  name: string;
  description: string;
  useCase: string;
  bestFor: string;
  features: string[];
  codeReact: string;
  codeHtml: string;
  tags: string[];
}

export interface DashboardLayoutItem {
  id: string;
  name: string;
  description: string;
  useCase: string;
  layoutType: string;
  keyFeatures: string[];
  codeReact: string;
  codeHtml: string;
  tags: string[];
}

export interface DesignStyleItem {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  exampleApplications: string[];
  colorPalette: string[];
  codeSnippet: string;
  tags: string[];
}
