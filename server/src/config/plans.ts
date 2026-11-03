export type PlanTier = 'free' | 'pro' | 'premium';
export type BillingInterval = 'monthly' | 'yearly';

export interface ToolCostConfig {
  toolId: string;
  name: string;
  creditCost: number;
  minPlan: PlanTier;
  isEnabled: boolean;
}

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
