export type PlanTier = 'free' | 'pro' | 'premium';
export type BillingInterval = 'monthly' | 'yearly';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  tagline: string;
  dailyCredits: number;
  monthlyCredits: number;
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

// Configurable pricing and allowances (fallbacks can be overridden via env vars)
export const PLANS_CONFIG: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Everyday tools with essential daily AI credits.',
    dailyCredits: 3,
    monthlyCredits: 0,
    price: {
      monthly: 0,
      yearly: 0,
    },
    priority: 'standard',
    features: [
      '3 AI generation credits per day',
      'Automatic daily credit reset at 00:00 UTC',
      'All 32+ standard offline tools 100% free',
      'Standard processing priority',
      'Access to standard AI enhancement models',
      'No credit card required',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For creators, developers, and power users.',
    dailyCredits: 0,
    monthlyCredits: Number(process.env.PLAN_PRO_MONTHLY_CREDITS) || 300,
    price: {
      monthly: Number(process.env.PLAN_PRO_MONTHLY_PRICE) || 9.99,
      yearly: Number(process.env.PLAN_PRO_YEARLY_PRICE) || 99.0,
    },
    priority: 'fast',
    isPopular: true,
    features: [
      '300 AI credits per billing month',
      'Faster processing priority',
      'High-resolution enhancement (up to 4K)',
      'Processing history & downloadable archives',
      'Priority queue for AI workloads',
      'Email support',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'Maximum power for businesses and heavy workflows.',
    dailyCredits: 0,
    monthlyCredits: Number(process.env.PLAN_PREMIUM_MONTHLY_CREDITS) || 1000,
    price: {
      monthly: Number(process.env.PLAN_PREMIUM_MONTHLY_PRICE) || 24.99,
      yearly: Number(process.env.PLAN_PREMIUM_YEARLY_PRICE) || 249.0,
    },
    priority: 'highest',
    features: [
      '1,000 AI credits per billing month',
      'Highest processing priority & real-time queue',
      'Advanced AI models & face restoration',
      'Batch processing mode (multi-image)',
      'Complete processing history with 30-day retention',
      'Dedicated priority support',
    ],
  },
};

export const DEFAULT_TOOL_COSTS: Record<string, ToolCostConfig> = {
  'ai-image-enhancer': {
    toolId: 'ai-image-enhancer',
    name: 'AI Image Enhancer',
    creditCost: 1,
    minPlan: 'free',
    isEnabled: true,
  },
  'ai-image-upscaler': {
    toolId: 'ai-image-upscaler',
    name: 'AI Image Upscaler',
    creditCost: 2,
    minPlan: 'pro',
    isEnabled: true,
  },
  'ai-background-remover': {
    toolId: 'ai-background-remover',
    name: 'AI Background Remover (Neural)',
    creditCost: 1,
    minPlan: 'free',
    isEnabled: true,
  },
  'ai-face-restoration': {
    toolId: 'ai-face-restoration',
    name: 'AI Face Restoration',
    creditCost: 2,
    minPlan: 'premium',
    isEnabled: true,
  },
};
