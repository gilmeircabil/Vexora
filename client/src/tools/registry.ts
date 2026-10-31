import React, { lazy } from 'react';
import { TOOL_CATALOG, type ToolDefinition } from './catalog.js';

export interface ToolRegistryEntry {
  definition: ToolDefinition;
  component: React.ComponentType;
}

export const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  // Phase A: Image & AI Tools
  'smart-image-studio': lazy(() =>
    import('../features/images/SmartImageStudio.js').then((m) => ({
      default: m.SmartImageStudio,
    })),
  ),
  'ai-image-enhancer': lazy(() =>
    import('../features/images/AiImageEnhancerTool.js').then((m) => ({
      default: m.AiImageEnhancerTool,
    })),
  ),
  'image-compressor': lazy(() =>
    import('../features/images/ImageCompressorTool.js').then((m) => ({
      default: m.ImageCompressorTool,
    })),
  ),
  'image-resizer': lazy(() =>
    import('../features/images/ImageResizerTool.js').then((m) => ({ default: m.ImageResizerTool })),
  ),
  'image-converter': lazy(() =>
    import('../features/images/ImageConverterTool.js').then((m) => ({
      default: m.ImageConverterTool,
    })),
  ),
  'image-cropper': lazy(() =>
    import('../features/images/ImageCropperTool.js').then((m) => ({ default: m.ImageCropperTool })),
  ),
  'image-rotator': lazy(() =>
    import('../features/images/ImageRotatorTool.js').then((m) => ({ default: m.ImageRotatorTool })),
  ),
  'color-picker': lazy(() =>
    import('../features/images/ColorPickerTool.js').then((m) => ({ default: m.ColorPickerTool })),
  ),
  'image-metadata': lazy(() =>
    import('../features/images/ImageMetadataTool.js').then((m) => ({
      default: m.ImageMetadataTool,
    })),
  ),
  'background-remover': lazy(() =>
    import('../features/images/BackgroundRemoverTool.js').then((m) => ({
      default: m.BackgroundRemoverTool,
    })),
  ),

  // Phase B: Text Tools
  'word-counter': lazy(() =>
    import('../features/text/WordCounterTool.js').then((m) => ({ default: m.WordCounterTool })),
  ),
  'case-converter': lazy(() =>
    import('../features/text/CaseConverterTool.js').then((m) => ({ default: m.CaseConverterTool })),
  ),
  'text-reverser': lazy(() =>
    import('../features/text/TextReverserTool.js').then((m) => ({ default: m.TextReverserTool })),
  ),
  'duplicate-line-remover': lazy(() =>
    import('../features/text/DuplicateLineRemoverTool.js').then((m) => ({
      default: m.DuplicateLineRemoverTool,
    })),
  ),
  'text-diff': lazy(() =>
    import('../features/text/TextDiffTool.js').then((m) => ({ default: m.TextDiffTool })),
  ),
  'lorem-ipsum': lazy(() =>
    import('../features/text/LoremIpsumTool.js').then((m) => ({ default: m.LoremIpsumTool })),
  ),

  // Phase C: Developer Tools
  'json-formatter': lazy(() =>
    import('../features/developer/JsonFormatterTool.js').then((m) => ({
      default: m.JsonFormatterTool,
    })),
  ),
  'base64-encoder': lazy(() =>
    import('../features/developer/Base64Tool.js').then((m) => ({ default: m.Base64Tool })),
  ),
  'url-encoder': lazy(() =>
    import('../features/developer/UrlEncoderTool.js').then((m) => ({ default: m.UrlEncoderTool })),
  ),
  'uuid-generator': lazy(() =>
    import('../features/developer/UuidGeneratorTool.js').then((m) => ({
      default: m.UuidGeneratorTool,
    })),
  ),
  'password-generator': lazy(() =>
    import('../features/developer/PasswordGeneratorTool.js').then((m) => ({
      default: m.PasswordGeneratorTool,
    })),
  ),
  'html-entity-encoder': lazy(() =>
    import('../features/developer/HtmlEntityTool.js').then((m) => ({ default: m.HtmlEntityTool })),
  ),
  'css-formatter': lazy(() =>
    import('../features/developer/CssFormatterTool.js').then((m) => ({
      default: m.CssFormatterTool,
    })),
  ),
  'jwt-generator': lazy(() =>
    import('../features/developer/JwtGeneratorTool.js').then((m) => ({
      default: m.JwtGeneratorTool,
    })),
  ),

  // Phase D: Everyday Utilities
  'qr-code-generator': lazy(() =>
    import('../features/utilities/QrCodeTool.js').then((m) => ({ default: m.QrCodeTool })),
  ),
  'percentage-calculator': lazy(() =>
    import('../features/utilities/PercentageCalculatorTool.js').then((m) => ({
      default: m.PercentageCalculatorTool,
    })),
  ),
  'unit-converter': lazy(() =>
    import('../features/utilities/UnitConverterTool.js').then((m) => ({
      default: m.UnitConverterTool,
    })),
  ),
  'date-difference-calculator': lazy(() =>
    import('../features/utilities/DateDifferenceTool.js').then((m) => ({
      default: m.DateDifferenceTool,
    })),
  ),
  'color-converter': lazy(() =>
    import('../features/utilities/ColorConverterTool.js').then((m) => ({
      default: m.ColorConverterTool,
    })),
  ),

  // Phase E: PDF Tools
  'pdf-merger': lazy(() =>
    import('../features/pdf/PdfMergerTool.js').then((m) => ({ default: m.PdfMergerTool })),
  ),
  'pdf-splitter': lazy(() =>
    import('../features/pdf/PdfSplitterTool.js').then((m) => ({ default: m.PdfSplitterTool })),
  ),
  'pdf-rotator': lazy(() =>
    import('../features/pdf/PdfRotatorTool.js').then((m) => ({ default: m.PdfRotatorTool })),
  ),
  'image-to-pdf': lazy(() =>
    import('../features/pdf/ImageToPdfTool.js').then((m) => ({ default: m.ImageToPdfTool })),
  ),
  'pdf-preview': lazy(() =>
    import('../features/pdf/PdfPreviewTool.js').then((m) => ({ default: m.PdfPreviewTool })),
  ),
};

export function getToolRegistryEntry(toolIdOrSlug: string): ToolRegistryEntry | null {
  const definition = TOOL_CATALOG.find((t) => t.id === toolIdOrSlug || t.slug === toolIdOrSlug);
  if (!definition) return null;

  const component = TOOL_COMPONENTS[definition.id];
  if (!component) return null;

  return { definition, component };
}
