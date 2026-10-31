import { describe, it, expect } from 'vitest';
import { DEFAULT_TOOL_COSTS } from '../src/config/plans.js';

describe('AI Tools Configuration & Registry Test Suite', () => {
  const expectedTools = [
    'ai-image-enhancer',
    'ai-background-remover',
    'ai-object-remover',
    'ai-photo-restoration',
    'ai-ocr',
  ];

  it('verifies all 5 built-in AI tools are configured and free in plans.ts', () => {
    for (const toolId of expectedTools) {
      expect(DEFAULT_TOOL_COSTS[toolId]).toBeDefined();
      expect(DEFAULT_TOOL_COSTS[toolId]?.creditCost).toBe(0);
      expect(DEFAULT_TOOL_COSTS[toolId]?.name).toBeDefined();
      expect(DEFAULT_TOOL_COSTS[toolId]?.minPlan).toBe('free');
    }
  });

  it('validates all tools are 100% free with 0 credit deduction', () => {
    expect(DEFAULT_TOOL_COSTS['ai-image-enhancer']?.creditCost).toBe(0);
    expect(DEFAULT_TOOL_COSTS['ai-background-remover']?.creditCost).toBe(0);
    expect(DEFAULT_TOOL_COSTS['ai-object-remover']?.creditCost).toBe(0);
    expect(DEFAULT_TOOL_COSTS['ai-photo-restoration']?.creditCost).toBe(0);
    expect(DEFAULT_TOOL_COSTS['ai-ocr']?.creditCost).toBe(0);
  });
});
