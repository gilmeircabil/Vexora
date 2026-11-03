export type ToolCategory = 'images' | 'text' | 'developer' | 'utilities' | 'pdf';

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  slug: string;
  description: string;
  iconName: string;
}

export const CATEGORIES: readonly CategoryInfo[] = [
  {
    id: 'images',
    slug: 'images',
    name: 'Image Tools',
    description:
      'Compress, resize, convert, crop, rotate, and inspect images directly in your browser.',
    iconName: 'Image',
  },
  {
    id: 'text',
    slug: 'text',
    name: 'Text Tools',
    description:
      'Count words, convert casing, reverse text, remove duplicates, compare diffs, and generate placeholder text.',
    iconName: 'FileText',
  },
  {
    id: 'developer',
    slug: 'developer',
    name: 'Developer Tools',
    description:
      'Format JSON and CSS, encode/decode Base64 and URLs, generate secure UUIDs and passwords, and handle HTML entities.',
    iconName: 'Code',
  },
  {
    id: 'utilities',
    slug: 'utilities',
    name: 'Everyday Utilities',
    description:
      'Generate QR codes, compute percentages, convert units, calculate date intervals, and transform colors.',
    iconName: 'Wrench',
  },
  {
    id: 'pdf',
    slug: 'pdf',
    name: 'PDF Tools',
    description:
      'Merge documents, extract and split pages, rotate pages, convert images to PDF, and preview files locally.',
    iconName: 'Files',
  },
];

export type ProcessingLocation = 'browser' | 'server';
export type ToolStatus = 'available' | 'planned' | 'maintenance';
export type ToolType = 'standard' | 'ai-powered';
export type UnifiedToolCategory =
  'Image' | 'PDF' | 'Text' | 'Developer' | 'Productivity' | 'Media' | 'Design' | 'Other';

export const UNIFIED_CATEGORIES: readonly UnifiedToolCategory[] = [
  'Image',
  'PDF',
  'Text',
  'Developer',
  'Productivity',
  'Media',
  'Design',
];

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  unifiedCategory?: UnifiedToolCategory;
  route?: string;
  toolType?: ToolType;
  aiRequired?: boolean;
  requiredModel?: string;
  isExternal?: boolean;
  externalUrl?: string;
  provider?: string;
  features?: readonly string[];
  externalNotice?: string;
  keywords: readonly string[];
  iconName: string;
  supportedInputTypes: readonly string[];
  processingLocation: ProcessingLocation;
  status: ToolStatus;
  privacyNotice: string;
}

export const TOOL_CATALOG: readonly ToolDefinition[] = [
  // --- PHASE A: IMAGE & AI TOOLS ---
  {
    id: 'google-flow',
    slug: 'google-flow',
    name: 'Google Flow',
    tagline: "Google's AI-powered creative workspace for visual storytelling and video generation.",
    description:
      "Create stunning visuals and cinematic videos using Google's AI-powered creative workspace. Explore AI-assisted image generation, visual storytelling, and creative workflows.",
    category: 'images',
    unifiedCategory: 'Media',
    route: '/tools/google-flow',
    toolType: 'ai-powered',
    aiRequired: true,
    isExternal: true,
    externalUrl: 'https://labs.google/fx/tools/flow',
    provider: 'Google',
    features: [
      'AI image generation',
      'AI video generation',
      'Visual storytelling',
      'AI-assisted creative workflows',
      'Creative experimentation',
    ],
    externalNotice:
      'Google Flow is an external service operated by Google. Opening it will take you outside VexoraMods. Google account requirements, availability, and usage limits apply.',
    requiredModel: 'Google DeepMind & Labs Creative Flow Models (Hosted by Google)',
    keywords: [
      'google flow',
      'google',
      'flow',
      'labs google',
      'ai video generation',
      'ai image generation',
      'cinematic video',
      'visual storytelling',
      'creative workspace',
      'external tool',
      'multimodal ai',
    ],
    iconName: 'Sparkles',
    supportedInputTypes: ['text/prompt', 'image/reference'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice:
      'Google Flow is operated externally by Google. No prompt data is processed or stored on VexoraMods.',
  },
  {
    id: 'smart-image-studio',
    slug: 'smart-image-studio',
    name: 'Smart Image Studio',
    tagline: 'All-in-one image workspace with AI enhancement, background removal, and editing.',
    description:
      'All-in-one flagship studio to upscale images, remove backgrounds, erase unwanted objects, restore vintage photos, extract OCR text, and apply instant transformations in one unified editor.',
    category: 'images',
    keywords: [
      'smart image studio',
      'image editor',
      'all in one image',
      'ai photo',
      'background remover',
      'upscale',
      'photo restoration',
      'object eraser',
    ],
    iconName: 'Sparkles',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/bmp'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'Runs locally in memory with client canvas and local AI inference. No files are ever saved without your action.',
  },
  {
    id: 'ai-image-enhancer',
    slug: 'ai-image-enhancer',
    name: 'AI Image Enhancer',
    tagline:
      'Super-resolution upscaling, face restoration, and noise reduction with neural processing.',
    description:
      'Enhance photo clarity, restore soft facial details, remove noise artifacts, and upscale up to 4x ultra-HD resolution using high-performance AI models.',
    category: 'images',
    unifiedCategory: 'Image',
    route: '/tools/ai-image-enhancer',
    toolType: 'ai-powered',
    aiRequired: true,
    requiredModel: 'Built-in Sharp & Neural Upscaler (No Ollama needed)',
    keywords: [
      'ai enhancer',
      'image upscaler',
      'photo restore',
      'face restoration',
      'denoise image',
      'super resolution',
    ],
    iconName: 'Sparkles',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice:
      'Processed securely with temporary server memory and immediate file lifecycle cleanup. Uploads are never retained permanently or used to train models.',
  },
  {
    id: 'ai-background-remover',
    slug: 'ai-background-remover',
    name: 'AI Background Remover',
    tagline: 'Automatically isolate subjects and generate transparent PNGs with AI segmentation.',
    description:
      'High-precision AI background segmentation producing transparent PNGs or custom studio color backgrounds instantly without external model configuration.',
    category: 'images',
    unifiedCategory: 'Image',
    route: '/ai-tools/background-remover',
    toolType: 'ai-powered',
    aiRequired: true,
    requiredModel: 'Built-in Vision Segmentation Engine (No Ollama needed)',
    keywords: [
      'ai background remover',
      'transparent png',
      'cutout subject',
      'remove bg ai',
      'portrait segmentation',
    ],
    iconName: 'Scissors',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice:
      'Processed in ephemeral server memory and cleaned up automatically. Never stored or used for training.',
  },
  {
    id: 'ai-object-remover',
    slug: 'ai-object-remover',
    name: 'AI Object Remover',
    tagline:
      'Erase unwanted objects, watermarks, or photobombers with an interactive inpainting brush.',
    description:
      'Interactive mask canvas with adjustable brush sizes to cleanly inpaint and remove unwanted elements from photos.',
    category: 'images',
    unifiedCategory: 'Design',
    route: '/ai-tools/object-remover',
    toolType: 'ai-powered',
    aiRequired: true,
    requiredModel: 'Built-in Canvas & Neural Inpainting Engine',
    keywords: [
      'ai object remover',
      'inpainting',
      'magic eraser',
      'remove photobomber',
      'clean photo',
    ],
    iconName: 'Eraser',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice: 'Inpainting runs in ephemeral memory with zero persistent storage.',
  },
  {
    id: 'ai-photo-restoration',
    slug: 'ai-photo-restoration',
    name: 'AI Photo Restoration',
    tagline: 'Repair old scratched photos, fix fading, and recover vintage image contrast.',
    description:
      'Removes scratch lines, dust spots, and recovers vintage photo contrast and facial details using built-in restoration algorithms.',
    category: 'images',
    unifiedCategory: 'Media',
    route: '/ai-tools/photo-restoration',
    toolType: 'ai-powered',
    aiRequired: true,
    requiredModel: 'Built-in Photo Restoration Filter Engine',
    keywords: [
      'ai photo restoration',
      'restore old photo',
      'vintage photo repair',
      'denoise',
      'scratch removal',
    ],
    iconName: 'History',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice: 'Restored photos are processed in memory and deleted right after download.',
  },
  {
    id: 'ai-ocr',
    slug: 'ai-ocr',
    name: 'AI Document OCR',
    tagline:
      'Extract accurate editable text and structured paragraphs from scanned PDFs and images.',
    description:
      'Extract paragraphs, text lines, and structured content from scanned PDFs and photos using built-in optical character recognition engines.',
    category: 'pdf',
    unifiedCategory: 'PDF',
    route: '/ai-tools/ocr',
    toolType: 'ai-powered',
    aiRequired: true,
    requiredModel: 'Built-in PyMuPDF & Vision OCR Engine',
    keywords: [
      'ai ocr',
      'extract text from pdf',
      'image to text',
      'document scanner',
      'optical character recognition',
    ],
    iconName: 'ScanText',
    supportedInputTypes: ['application/pdf', 'image/png', 'image/jpeg'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice:
      'Documents are parsed in temporary memory and purged immediately after text extraction.',
  },
  {
    id: 'ai-code-explainer',
    slug: 'ai-code-explainer',
    name: 'AI Code Explainer & Debugger',
    tagline: 'Explain code logic, syntax walkthroughs, and instant bug fixes.',
    description:
      'Analyze code snippets, explain complex programming logic step-by-step, calculate complexity, and get instant bug diagnoses and fixes.',
    category: 'developer',
    unifiedCategory: 'Developer',
    route: '/ai-tools/code-explainer',
    toolType: 'ai-powered',
    aiRequired: true,
    requiredModel: 'Google Gemini & NVIDIA Cloud Models',
    keywords: ['code explainer', 'debugger', 'ai code', 'explain code', 'fix bugs', 'syntax review'],
    iconName: 'Code2',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice: 'Code snippets are processed transiently via secure cloud AI API and are never stored.',
  },
  {
    id: 'ai-document-summarizer',
    slug: 'ai-document-summarizer',
    name: 'AI Document Summarizer & Q&A',
    tagline: 'Generate bulleted executive summaries and interactive Q&A citations.',
    description:
      'Condense long technical documents, articles, and research papers into executive summaries, key takeaways, and ask custom questions.',
    category: 'pdf',
    unifiedCategory: 'PDF',
    route: '/ai-tools/document-summarizer',
    toolType: 'ai-powered',
    aiRequired: true,
    requiredModel: 'Google Gemini Cloud Model',
    keywords: ['summarize', 'document chat', 'pdf summary', 'q and a', 'notes summarizer'],
    iconName: 'FileText',
    supportedInputTypes: ['text/plain', 'application/pdf'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice: 'Document text is parsed in memory and never retained on disk.',
  },
  {
    id: 'ai-writing-assistant',
    slug: 'ai-writing-assistant',
    name: 'AI Writing & ATS Resume Assistant',
    tagline: 'Tone rewriting, grammar polish, and ATS-optimized resume builder.',
    description:
      'Transform draft text into polished professional prose or generate high-impact, quantifiable resume achievement bullets tailored for job applications.',
    category: 'text',
    unifiedCategory: 'Text',
    route: '/ai-tools/writing-assistant',
    toolType: 'ai-powered',
    aiRequired: true,
    requiredModel: 'Google Gemini Cloud Model',
    keywords: ['writing assistant', 'resume builder', 'ats resume', 'paraphrase', 'tone rewrite'],
    iconName: 'PenTool',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice: 'Your text is processed transiently and never saved to any database.',
  },
  {
    id: 'vexora-ai-chat',
    slug: 'ai-chat',
    name: 'Vexora AI Chat Assistant',
    tagline: 'Interactive free AI chatbot powered by Google Gemini & Llama 3.3.',
    description:
      'Chat, code, brainstorm, and solve complex problems in real-time with an intelligent AI assistant. Free forever with zero credit limits.',
    category: 'text',
    unifiedCategory: 'Productivity',
    route: '/ai-tools/chat',
    toolType: 'ai-powered',
    aiRequired: true,
    requiredModel: 'Google Gemini 2.0 Flash & NVIDIA Llama 3.3',
    keywords: ['ai chat', 'chatgpt', 'gemini', 'chatbot', 'assistant', 'ai coding', 'free ai'],
    iconName: 'Bot',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'server',
    status: 'available',
    privacyNotice: 'Your chat messages are processed transiently in memory and stored locally in your browser only.',
  },
  {
    id: 'image-compressor',
    slug: 'image-compressor',
    name: 'Image Compressor',
    tagline: 'Reduce raster image file sizes locally with quality and format controls.',
    description:
      'Compress PNG, JPEG, and WebP images directly in your browser. Choose compression quality, compare file sizes accurately, preview results, and download smaller images without uploading anything.',
    category: 'images',
    keywords: [
      'compress',
      'optimize',
      'image size',
      'reduce mb',
      'shrink photo',
      'tinypng alternative',
    ],
    iconName: 'Minimize2',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/bmp'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'All compression runs entirely in your browser using HTML5 Canvas. Your image is never uploaded to any server.',
  },
  {
    id: 'image-resizer',
    slug: 'image-resizer',
    name: 'Image Resizer',
    tagline: 'Scale images to custom pixel dimensions with aspect ratio lock.',
    description:
      'Quickly resize images to exact widths and heights. Lock aspect ratios, scale by percentage, and download optimized outputs in seconds.',
    category: 'images',
    keywords: ['resize', 'dimensions', 'width', 'height', 'scale', 'photo resolution'],
    iconName: 'Maximize2',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/gif'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'Processed locally in memory via client-side canvas. No file transfer takes place.',
  },
  {
    id: 'image-converter',
    slug: 'image-converter',
    name: 'Image Format Converter',
    tagline: 'Convert raster images between PNG, JPEG, WebP, and BMP.',
    description:
      'Convert photos between browser-supported formats with strict MIME validation. We ensure the resulting file matches the requested container and never report a failed conversion as successful.',
    category: 'images',
    keywords: ['convert image', 'png to jpg', 'jpg to png', 'webp to jpg', 'format converter'],
    iconName: 'RefreshCw',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/gif'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'Transcoded locally using browser rendering APIs. Files never leave your device.',
  },
  {
    id: 'image-cropper',
    slug: 'image-cropper',
    name: 'Image Cropper',
    tagline: 'Crop photos to exact boundaries or standard aspect ratios.',
    description:
      'Interactive, keyboard-accessible cropping tool. Supports freeform selection or presets (1:1, 4:3, 16:9) with real-time download output.',
    category: 'images',
    keywords: ['crop', 'cut', 'aspect ratio', 'square photo', 'avatar crop'],
    iconName: 'Crop',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/bmp'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Cropped locally on your device. Zero data sent across the network.',
  },
  {
    id: 'image-rotator',
    slug: 'image-rotator',
    name: 'Image Rotator and Flipper',
    tagline: 'Rotate in 90-degree increments and flip horizontally or vertically.',
    description:
      'Fix photo orientation effortlessly. Rotate images 90°, 180°, or 270°, or mirror them horizontally and vertically with instant preview.',
    category: 'images',
    keywords: ['rotate', 'flip', 'mirror', 'orientation', 'turn photo'],
    iconName: 'RotateCw',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/bmp'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Transformation runs completely inside your browser.',
  },
  {
    id: 'color-picker',
    slug: 'color-picker',
    name: 'Color Picker & Eyedropper',
    tagline: 'Pick colors, sample from images, and copy HEX, RGB, or HSL values.',
    description:
      'Comprehensive color tool with native eyedropper support, canvas color sampling from your photos, and multi-format conversions.',
    category: 'images',
    keywords: ['color picker', 'eyedropper', 'palette', 'hex to rgb', 'sample color'],
    iconName: 'Pipette',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Color inspection happens purely in local memory.',
  },
  {
    id: 'background-remover',
    slug: 'background-remover',
    name: 'Background Remover',
    tagline: 'Remove solid and studio backgrounds with color keying and flood-fill.',
    description:
      'Remove solid, white, black, or chroma-keyed green screen backgrounds directly in your browser. Features contiguous flood-fill to preserve foreground subjects, adjustable tolerance, edge feathering, and real-time transparent PNG export.',
    category: 'images',
    keywords: [
      'remove background',
      'background remover',
      'transparent background',
      'png cutout',
      'chroma key',
      'erase background',
    ],
    iconName: 'Sparkles',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/bmp'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'Processed 100% locally in your browser memory via HTML5 Canvas. Your photo is never uploaded to any server.',
  },
  {
    id: 'image-metadata',
    slug: 'image-metadata',
    name: 'Image Metadata Viewer',
    tagline: 'Inspect image dimensions, MIME type, file size, and basic header tags.',
    description:
      'Safely view technical metadata from local image files without sending them to any third-party server. GPS coordinates are kept private and never mapped without explicit consent.',
    category: 'images',
    keywords: ['metadata', 'exif', 'file info', 'dimensions', 'image header'],
    iconName: 'Info',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Inspected entirely via client-side binary parsing. No metadata is transmitted.',
  },

  // --- PHASE B: TEXT TOOLS ---
  {
    id: 'word-counter',
    slug: 'word-counter',
    name: 'Word & Character Counter',
    tagline: 'Count words, characters, spaces, paragraphs, and reading time in real time.',
    description:
      'Detailed textual statistics including word count, characters with/without whitespace, line counts, and estimated reading time with Unicode awareness.',
    category: 'text',
    keywords: [
      'word count',
      'character count',
      'letter counter',
      'reading time',
      'text statistics',
    ],
    iconName: 'Hash',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'Your text is never sent anywhere; counting executes synchronously in your browser.',
  },
  {
    id: 'case-converter',
    slug: 'case-converter',
    name: 'Case Converter',
    tagline: 'Convert text between UPPERCASE, lowercase, Title Case, sentence case, and camelCase.',
    description:
      'Effortlessly transform text casing. Supports uppercase, lowercase, sentence case, title case, camelCase, kebab-case, snake_case, and slugify.',
    category: 'text',
    keywords: ['uppercase', 'lowercase', 'title case', 'sentence case', 'camelcase', 'kebab-case'],
    iconName: 'Type',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'All casing algorithms run locally.',
  },
  {
    id: 'text-reverser',
    slug: 'text-reverser',
    name: 'Text Reverser',
    tagline: 'Reverse text by character or word while preserving Unicode surrogate pairs.',
    description:
      'Reverse characters or words safely with grapheme-cluster preservation so emojis and complex Unicode symbols are not corrupted.',
    category: 'text',
    keywords: ['reverse text', 'backwards', 'flip text', 'mirror text', 'palindrome test'],
    iconName: 'ArrowLeftRight',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Runs locally in memory.',
  },
  {
    id: 'duplicate-line-remover',
    slug: 'duplicate-line-remover',
    name: 'Duplicate Line Remover',
    tagline: 'Deduplicate lines with case-sensitivity and sorting options.',
    description:
      'Clean lists and data by stripping duplicate lines. Choose to preserve original order, ignore casing, trim whitespace, and view removed counts.',
    category: 'text',
    keywords: ['dedupe', 'unique lines', 'remove duplicates', 'filter list', 'clean lines'],
    iconName: 'ListFilter',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Processed entirely on the client side.',
  },
  {
    id: 'text-diff',
    slug: 'text-diff',
    name: 'Text Diff Checker',
    tagline: 'Compare two text snippets and highlight additions, deletions, and modifications.',
    description:
      'Side-by-side or unified line-by-line diff tool for text, code, and documentation comparisons using proven diff algorithms.',
    category: 'text',
    keywords: ['diff', 'compare text', 'text difference', 'line diff', 'git diff tool'],
    iconName: 'GitCompare',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Diffs are calculated directly in JavaScript in your browser.',
  },
  {
    id: 'lorem-ipsum',
    slug: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    tagline: 'Generate standard Latin placeholder paragraphs, sentences, or words.',
    description:
      'Configurable placeholder text generator for UI design and mockups. Select paragraph counts, word counts, or list items with easy one-click copying.',
    category: 'text',
    keywords: ['lorem ipsum', 'placeholder', 'dummy text', 'filler text', 'mockup text'],
    iconName: 'AlignLeft',
    supportedInputTypes: [],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Generated entirely client-side using deterministic templates.',
  },

  // --- PHASE C: DEVELOPER TOOLS ---
  {
    id: 'json-formatter',
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    tagline: 'Format, validate, prettify, and minify JSON with descriptive syntax error reporting.',
    description:
      'Parse JSON securely without using eval. Highlights precise line and column errors, formats with configurable tab or space indentation, and computes size savings.',
    category: 'developer',
    keywords: ['json format', 'json validator', 'prettify json', 'minify json', 'json lint'],
    iconName: 'Braces',
    supportedInputTypes: ['application/json', 'text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'JSON is parsed using native JSON.parse in your browser. Never transmitted.',
  },
  {
    id: 'base64-encoder',
    slug: 'base64-encoder',
    name: 'Base64 Encoder & Decoder',
    tagline: 'Encode and decode UTF-8 text and binary files to Base64 safely.',
    description:
      'Full UTF-8 support for text encoding and decoding, plus file-to-Base64 conversion with Data URI generation and copy-ready outputs.',
    category: 'developer',
    keywords: ['base64', 'encode base64', 'decode base64', 'data uri', 'btoa', 'atob'],
    iconName: 'Binary',
    supportedInputTypes: ['text/plain', 'application/octet-stream'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Conversion is performed locally using typed arrays and browser APIs.',
  },
  {
    id: 'url-encoder',
    slug: 'url-encoder',
    name: 'URL Encoder & Decoder',
    tagline: 'Encode and decode URI components and query strings cleanly.',
    description:
      'Convert special characters to percent-encoded hex sequences and vice versa. Highlights malformed URI sequences with helpful diagnostics.',
    category: 'developer',
    keywords: ['url encode', 'url decode', 'uri component', 'percent encoding', 'querystring'],
    iconName: 'Link2',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Runs locally in memory.',
  },
  {
    id: 'uuid-generator',
    slug: 'uuid-generator',
    name: 'UUID / GUID Generator',
    tagline: 'Generate cryptographically secure v4 UUIDs individually or in bulk.',
    description:
      'Generates cryptographically random UUIDs using the Web Crypto API. Support for uppercase, lowercase, hyphens, and bulk generation up to 500 IDs.',
    category: 'developer',
    keywords: ['uuid', 'guid', 'v4 uuid', 'random id', 'crypto uuid', 'unique id'],
    iconName: 'Fingerprint',
    supportedInputTypes: [],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Generated via crypto.randomUUID() in your browser. Never logged or stored.',
  },
  {
    id: 'password-generator',
    slug: 'password-generator',
    name: 'Password Generator',
    tagline: 'Create strong, high-entropy passwords with custom character sets.',
    description:
      'Generate passwords locally using the Web Crypto API. Customize length, uppercase, lowercase, numbers, and symbols, with entropy estimation and zero storage.',
    category: 'developer',
    keywords: ['password', 'random password', 'strong password', 'password generator', 'entropy'],
    iconName: 'KeyRound',
    supportedInputTypes: [],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'Generated using crypto.getRandomValues(). Passwords are never saved, transmitted, or logged.',
  },
  {
    id: 'html-entity-encoder',
    slug: 'html-entity-encoder',
    name: 'HTML Entity Encoder & Decoder',
    tagline: 'Encode reserved HTML characters into named and numeric entities safely.',
    description:
      'Protect web applications from XSS by encoding quotes, ampersands, angle brackets, and non-ASCII characters, or decode HTML entities back to plain text.',
    category: 'developer',
    keywords: ['html entities', 'html encode', 'html decode', 'escape html', 'xss prevention'],
    iconName: 'Code2',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'Entities are encoded/decoded in JavaScript without ever injecting HTML into the DOM.',
  },
  {
    id: 'css-formatter',
    slug: 'css-formatter',
    name: 'CSS Formatter & Beautifier',
    tagline: 'Format, indent, and organize CSS with a real parser and error diagnostics.',
    description:
      'Beautify messy CSS stylesheets or minify them for production. Powered by Prettier standalone running in your browser for true AST-level formatting.',
    category: 'developer',
    keywords: ['css formatter', 'beautify css', 'css beautifier', 'format stylesheet', 'css clean'],
    iconName: 'FileCode2',
    supportedInputTypes: ['text/css', 'text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Runs locally using Prettier in your browser.',
  },
  {
    id: 'jwt-generator',
    slug: 'jwt-generator',
    name: 'JWT Generator & Debugger',
    tagline: 'Create, sign, decode, and verify JSON Web Tokens using Web Crypto HMAC.',
    description:
      'Generate and sign JSON Web Tokens with HS256, HS384, or HS512 using browser Web Crypto APIs. Inspect decoded headers and payload claims, evaluate expiration status, and cryptographically verify signatures against your secret key.',
    category: 'developer',
    keywords: [
      'jwt',
      'json web token',
      'jwt generator',
      'jwt decode',
      'jwt verify',
      'jwt debugger',
      'hs256',
      'hmac',
    ],
    iconName: 'KeyRound',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'Signed and verified locally using Web Crypto HMAC. Secret keys and claims are never sent to a server.',
  },

  // --- PHASE D: EVERYDAY UTILITIES ---
  {
    id: 'qr-code-generator',
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    tagline: 'Generate downloadable QR codes for URLs, WiFi, contact info, and plain text.',
    description:
      'Generate custom QR codes with adjustable error correction (L, M, Q, H), sizing, and colors. Download as high-resolution PNG or crisp SVG.',
    category: 'utilities',
    keywords: ['qr code', 'generate qr', 'qr generator', 'barcode', 'scan code', 'wifi qr'],
    iconName: 'QrCode',
    supportedInputTypes: ['text/plain'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'QR codes are rendered locally onto a canvas or SVG string. Nothing is sent to an external API.',
  },
  {
    id: 'percentage-calculator',
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    tagline: 'Calculate percentage values, percentage increases/decreases, and proportions.',
    description:
      'Three-in-one percentage tool: what is X% of Y, X is what percent of Y, and percentage change (increase or decrease) with division-by-zero safeguards.',
    category: 'utilities',
    keywords: ['percentage', 'percent increase', 'percent decrease', 'discount calculator', 'math'],
    iconName: 'Percent',
    supportedInputTypes: [],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Calculated instantly in memory.',
  },
  {
    id: 'unit-converter',
    slug: 'unit-converter',
    name: 'Unit Converter',
    tagline:
      'Convert between metric and imperial units for length, mass, temperature, area, and volume.',
    description:
      'Accurate unit converter with documented conversion ratios. Switch smoothly between meters, feet, miles, kilograms, pounds, Celsius, Fahrenheit, and more.',
    category: 'utilities',
    keywords: [
      'unit converter',
      'metric to imperial',
      'length',
      'weight',
      'temperature',
      'celsius to fahrenheit',
    ],
    iconName: 'Scale',
    supportedInputTypes: [],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Runs locally with mathematical formulas.',
  },
  {
    id: 'date-difference-calculator',
    slug: 'date-difference-calculator',
    name: 'Date Difference Calculator',
    tagline: 'Calculate exact days, weeks, months, and years between two calendar dates.',
    description:
      'Accurately measure the duration between two dates with options for inclusive or exclusive end-day counting, business days, and time breakdowns.',
    category: 'utilities',
    keywords: [
      'date difference',
      'days between dates',
      'date calculator',
      'how many days',
      'countdown',
    ],
    iconName: 'CalendarDays',
    supportedInputTypes: [],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Calculated client-side using native Date arithmetic.',
  },
  {
    id: 'color-converter',
    slug: 'color-converter',
    name: 'Color Converter',
    tagline: 'Convert seamlessly between HEX, RGB, HSL, and HSV color models.',
    description:
      'Enter any valid color in HEX, RGB, or HSL format to see instant conversions, contrast ratios, and copyable CSS syntax.',
    category: 'utilities',
    keywords: ['color converter', 'hex to rgb', 'rgb to hex', 'hsl to hex', 'color code'],
    iconName: 'Palette',
    supportedInputTypes: [],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Runs locally in JavaScript.',
  },

  // --- PHASE E: PDF TOOLS ---
  {
    id: 'pdf-merger',
    slug: 'pdf-merger',
    name: 'PDF Merger',
    tagline: 'Combine multiple PDF files into a single organized document.',
    description:
      'Merge multiple PDF documents into one. Reorder files via drag or buttons, remove unwanted files, and generate a clean merged PDF using pdf-lib.',
    category: 'pdf',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'concatenate pdf', 'pdf binder'],
    iconName: 'FilePlus',
    supportedInputTypes: ['application/pdf'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice:
      'Merging executes entirely in your browser using pdf-lib. Your confidential documents are never uploaded.',
  },
  {
    id: 'pdf-splitter',
    slug: 'pdf-splitter',
    name: 'PDF Page Extractor & Splitter',
    tagline: 'Extract specific pages or page ranges into a new PDF document.',
    description:
      'Extract custom page ranges (e.g., "1-3, 5, 8-10") from large PDF files. Validates page numbers and outputs a ready-to-download PDF.',
    category: 'pdf',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf', 'pdf page extractor'],
    iconName: 'Split',
    supportedInputTypes: ['application/pdf'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Page extraction runs entirely client-side.',
  },
  {
    id: 'pdf-rotator',
    slug: 'pdf-rotator',
    name: 'PDF Rotator',
    tagline: 'Rotate individual or all pages of a PDF document by 90, 180, or 270 degrees.',
    description:
      'Fix upside-down or sideways PDF scans. Select specific pages or apply rotation to all pages simultaneously, then download the corrected PDF.',
    category: 'pdf',
    keywords: ['rotate pdf', 'turn pdf', 'fix orientation', 'pdf landscape to portrait'],
    iconName: 'RotateCcw',
    supportedInputTypes: ['application/pdf'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Document rotation is performed locally in browser memory.',
  },
  {
    id: 'image-to-pdf',
    slug: 'image-to-pdf',
    name: 'Image to PDF Converter',
    tagline: 'Convert images (PNG, JPEG, WebP) into standard PDF pages.',
    description:
      'Convert one or more images into a multi-page PDF document. Configure page layout (Fit to page, A4, Letter) and page orientations (Portrait, Landscape).',
    category: 'pdf',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert photo to pdf'],
    iconName: 'FileImage',
    supportedInputTypes: ['image/png', 'image/jpeg', 'image/webp'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Image decoding and PDF page generation execute locally in your browser.',
  },
  {
    id: 'pdf-preview',
    slug: 'pdf-preview',
    name: 'PDF Viewer & Inspector',
    tagline: 'Inspect and preview PDF documents page by page with zoom controls.',
    description:
      'Fast, secure in-browser PDF reader powered by PDF.js. View pages with zoom, navigate with keyboard shortcuts, and inspect page dimensions without uploading.',
    category: 'pdf',
    keywords: ['pdf preview', 'pdf reader', 'view pdf', 'inspect pdf', 'pdf viewer'],
    iconName: 'Eye',
    supportedInputTypes: ['application/pdf'],
    processingLocation: 'browser',
    status: 'available',
    privacyNotice: 'Rendered directly into HTML5 canvas by PDF.js in local memory. Never uploaded.',
  },
];

/** Quick lookup maps */
export const TOOL_BY_ID = new Map<string, ToolDefinition>(
  TOOL_CATALOG.map((tool) => [tool.id, tool]),
);

export const TOOL_BY_SLUG = new Map<string, ToolDefinition>(
  TOOL_CATALOG.map((tool) => [tool.slug, tool]),
);

export function getToolsByCategory(category: ToolCategory): readonly ToolDefinition[] {
  return TOOL_CATALOG.filter((tool) => tool.category === category);
}

export function searchTools(query: string): readonly ToolDefinition[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return TOOL_CATALOG;

  const terms = trimmed.split(/\s+/);

  return TOOL_CATALOG.filter((tool) => {
    const haystack = [tool.name, tool.tagline, tool.description, tool.category, ...tool.keywords]
      .join(' ')
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}

export function getRelatedTools(toolId: string, limit = 4): readonly ToolDefinition[] {
  const target = TOOL_BY_ID.get(toolId);
  if (!target) return [];

  // Match same category first, excluding the current tool
  const sameCategory = TOOL_CATALOG.filter(
    (t) => t.category === target.category && t.id !== target.id,
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  // Fill remainder from other categories
  const others = TOOL_CATALOG.filter((t) => t.category !== target.category && t.id !== target.id);
  return [...sameCategory, ...others].slice(0, limit);
}

/**
 * Helper functions for the Unified All Tools Directory
 */
export function getToolType(tool: ToolDefinition): ToolType {
  if (tool.toolType) return tool.toolType;
  if (
    tool.processingLocation === 'server' ||
    tool.id.startsWith('ai-') ||
    tool.id === 'smart-image-studio'
  ) {
    return 'ai-powered';
  }
  return 'standard';
}

export function isAiPoweredTool(tool: ToolDefinition): boolean {
  return getToolType(tool) === 'ai-powered';
}

export function getToolRoute(tool: ToolDefinition): string {
  return tool.route || `/tools/${tool.slug}`;
}

export function getRequiredModel(tool: ToolDefinition): string {
  if (tool.requiredModel) return tool.requiredModel;
  if (tool.id === 'smart-image-studio') {
    return 'Hybrid Client Canvas + Built-in Vision AI';
  }
  if (isAiPoweredTool(tool)) {
    return 'Built-in Vision Engine (No Ollama required)';
  }
  return 'In-Browser Web APIs (Zero Server Dependency)';
}

export function getUnifiedCategory(tool: ToolDefinition): UnifiedToolCategory {
  if (tool.unifiedCategory) return tool.unifiedCategory;

  if (
    tool.id === 'smart-image-studio' ||
    tool.id === 'color-picker' ||
    tool.id === 'color-converter' ||
    tool.id === 'lorem-ipsum'
  ) {
    return 'Design';
  }

  if (tool.id === 'image-metadata' || tool.id === 'image-converter') {
    return 'Media';
  }

  switch (tool.category) {
    case 'images':
      return 'Image';
    case 'pdf':
      return 'PDF';
    case 'text':
      return 'Text';
    case 'developer':
      return 'Developer';
    case 'utilities':
      return 'Productivity';
    default:
      return 'Other';
  }
}
