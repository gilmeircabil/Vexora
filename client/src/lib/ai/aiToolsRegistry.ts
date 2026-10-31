export type AICategory = 'all' | 'image' | 'document';

export interface AIToolDefinition {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: 'image' | 'document';
  route: string;
  creditCost?: number;
  isFree?: boolean;
  requiredModel: string;
  supportedFormats?: string[];
  maxFileSizeMb?: number;
  icon: string;
  isPopular?: boolean;
}

export const AI_TOOLS_REGISTRY: AIToolDefinition[] = [
  {
    id: 'ai-image-enhancer',
    name: 'AI Image Enhancer',
    shortDescription: 'Upscale low-resolution images 2x or 4x with sharp edges and noise reduction.',
    description: 'Enhance photo clarity, reduce noise, and boost resolution with built-in Sharp and neural upscaling. Ready to use out of the box with zero setup.',
    category: 'image',
    route: '/ai-tools/image-enhancer',
    creditCost: 0,
    isFree: true,
    requiredModel: 'Built-in Engine (No Ollama needed)',
    supportedFormats: ['JPG', 'PNG', 'WebP'],
    maxFileSizeMb: 15,
    icon: 'Sparkles',
    isPopular: true,
  },
  {
    id: 'ai-background-remover',
    name: 'AI Background Remover',
    shortDescription: 'Automatically isolate subjects and generate transparent PNGs.',
    description: 'Background segmentation producing transparent PNGs or custom color backgrounds instantly. No external models required.',
    category: 'image',
    route: '/ai-tools/background-remover',
    creditCost: 0,
    isFree: true,
    requiredModel: 'Built-in Engine (No Ollama needed)',
    supportedFormats: ['JPG', 'PNG', 'WebP'],
    maxFileSizeMb: 15,
    icon: 'Scissors',
    isPopular: true,
  },
  {
    id: 'ai-object-remover',
    name: 'AI Object Remover',
    shortDescription: 'Erase unwanted items, text, or photobombers with an interactive brush.',
    description: 'Interactive mask canvas with adjustable brush sizes to cleanly inpaint and remove objects. Runs out of the box.',
    category: 'image',
    route: '/ai-tools/object-remover',
    creditCost: 0,
    isFree: true,
    requiredModel: 'Built-in Canvas Inpainting',
    supportedFormats: ['JPG', 'PNG', 'WebP'],
    maxFileSizeMb: 15,
    icon: 'Eraser',
    isPopular: true,
  },
  {
    id: 'ai-photo-restoration',
    name: 'AI Photo Restoration',
    shortDescription: 'Repair old scratched photos, fix fading, and restore clarity.',
    description: 'Removes scratch lines, dust spots, and recovers vintage photo contrast and details using built-in algorithms.',
    category: 'image',
    route: '/ai-tools/photo-restoration',
    creditCost: 0,
    isFree: true,
    requiredModel: 'Built-in Restoration Filter',
    supportedFormats: ['JPG', 'PNG', 'WebP'],
    maxFileSizeMb: 15,
    icon: 'History',
  },
  {
    id: 'ai-ocr',
    name: 'AI Document OCR',
    shortDescription: 'Extract accurate editable text from scanned documents and images.',
    description: 'Extract paragraphs, text lines, and tables from PDFs and photos with built-in PyMuPDF text engines.',
    category: 'document',
    route: '/ai-tools/ocr',
    creditCost: 0,
    isFree: true,
    requiredModel: 'Built-in PyMuPDF OCR',
    supportedFormats: ['PDF', 'JPG', 'PNG'],
    maxFileSizeMb: 30,
    icon: 'ScanText',
    isPopular: true,
  },
];
