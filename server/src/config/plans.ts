export type PlanTier = 'free' | 'pro' | 'premium';
export type BillingInterval = 'monthly' | 'yearly';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  tagline: string;
  dailyCredits: number;
  monthlyCredits: number;
  currency: string;
  currencySymbol: string;
  price: {
    monthly: number;
    yearly: number;
  };
  priority: 'standard' | 'fast' | 'highest';
  features: string[];
  isPopular?: boolean;
}

export interface ToolCostConfig {
  toolId: string;
  name: string;
  creditCost: number;
  minPlan: PlanTier;
  isEnabled: boolean;
}

// Open-Source VexoraMods Configuration (100% Free)
export const PLANS_CONFIG: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free & Open Source',
    tagline: 'Everything You Need. One Platform. Free.',
    dailyCredits: 0,
    monthlyCredits: 0,
    currency: 'PHP',
    currencySymbol: '₱',
    price: {
      monthly: 0,
      yearly: 0,
    },
    priority: 'standard',
    features: [
      '100% Free and Open Source',
      'Unlimited standard & AI tool runs',
      'Local Ollama AI integration',
      'All 33+ standard tools free forever',
      'VexoraMods Studio with complete design suite',
      'No subscription, credits, or account required',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Community',
    tagline: 'Community edition with full access.',
    dailyCredits: 0,
    monthlyCredits: 0,
    currency: 'PHP',
    currencySymbol: '₱',
    price: {
      monthly: 0,
      yearly: 0,
    },
    priority: 'fast',
    features: [
      'All Free features included',
      'Self-hosted Ollama support',
      'High-resolution processing',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Self-Hosted',
    tagline: 'Self-hosted deployment with complete control.',
    dailyCredits: 0,
    monthlyCredits: 0,
    currency: 'PHP',
    currencySymbol: '₱',
    price: {
      monthly: 0,
      yearly: 0,
    },
    priority: 'highest',
    features: [
      'Full source code access',
      'Local model acceleration',
      'No API limits or tracking',
    ],
  },
};

export const DEFAULT_TOOL_COSTS: Record<string, ToolCostConfig> = {
  'ai-image-enhancer': {
    toolId: 'ai-image-enhancer',
    name: 'AI Image Enhancer',
    creditCost: 0,
    minPlan: 'free',
    isEnabled: true,
  },
  'ai-background-remover': {
    toolId: 'ai-background-remover',
    name: 'AI Background Remover',
    creditCost: 0,
    minPlan: 'free',
    isEnabled: true,
  },
  'ai-object-remover': {
    toolId: 'ai-object-remover',
    name: 'AI Object Remover (Inpainting)',
    creditCost: 0,
    minPlan: 'free',
    isEnabled: true,
  },
  'ai-photo-restoration': {
    toolId: 'ai-photo-restoration',
    name: 'AI Photo Restoration',
    creditCost: 0,
    minPlan: 'free',
    isEnabled: true,
  },
  'ai-ocr': {
    toolId: 'ai-ocr',
    name: 'AI OCR Document Extractor',
    creditCost: 0,
    minPlan: 'free',
    isEnabled: true,
  },
};
