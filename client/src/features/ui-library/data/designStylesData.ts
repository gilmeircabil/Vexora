import { DesignStyleItem } from './types.js';

export const DESIGN_STYLES: DesignStyleItem[] = [
  {
    id: 'minimalism',
    name: 'Minimalism',
    description: 'Design stripped down to its essential elements, emphasizing whitespace, crisp typography, and restrained palettes.',
    characteristics: [
      'Generous whitespace and breathing room',
      'High-contrast typography (clean sans-serif or refined serif)',
      'Restrained, deliberate color palette (monochrome + single accent)',
      'Lack of decorative clutter or heavy gradients',
      'Focus on content hierarchy and effortless scanning',
    ],
    exampleApplications: [
      'Apple product pages',
      'Medium reading experience',
      'Stripe documentation & billing',
      'Architectural & design studio portfolios',
    ],
    colorPalette: ['#FFFFFF', '#F8FAFC', '#0F172A', '#64748B', '#3B82F6'],
    codeSnippet: `/* Minimalist Card Style */
.minimal-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  color: #0f172a;
  transition: border-color 0.2s ease;
}
.minimal-card:hover {
  border-color: #94a3b8;
}`,
    tags: ['Clean', 'Whitespace', 'Modern', 'Typography', 'Minimal'],
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Frosted-glass aesthetic featuring background blur, translucent surface layers, and subtle specular borders.',
    characteristics: [
      'Backdrop filter blur (backdrop-blur-md / blur-lg)',
      'Translucent rgba/hsla background (e.g. rgba(255,255,255,0.15))',
      'Subtle 1px border with semi-transparent white gradient',
      'Deep, soft, colored box-shadows',
      'Vibrant background gradients to reveal the frosted glass effect',
    ],
    exampleApplications: [
      'macOS Big Sur / Sonoma & iOS widgets',
      'Windows 11 Mica & Acrylic materials',
      'Web3 and crypto financial dashboards',
      'Futuristic media players and overlays',
    ],
    colorPalette: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)', '#6366F1', '#EC4899', '#0F172A'],
    codeSnippet: `/* Glassmorphic Panel */
.glass-panel {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
}`,
    tags: ['Frosted Glass', 'Blur', 'Translucent', 'Apple', 'Modern'],
  },
  {
    id: 'neumorphism',
    name: 'Neumorphism (Soft UI)',
    description: 'Extruded plastic aesthetic created with dual soft drop-shadows (light source from top-left) on monochromatic surfaces.',
    characteristics: [
      'Same background color for element and canvas (typically off-white or soft gray)',
      'Dual opposing shadows: light highlight on top-left, dark shadow on bottom-right',
      'Convex / concave surface simulations',
      'Tactile, physical button depressions when pressed',
      'Low contrast requires careful attention to accessibility',
    ],
    exampleApplications: [
      'Smart home thermostat & lighting controllers',
      'Audio mixing & synthesizer dials',
      'Fitness tracker dashboards',
      'Personal finance calculators',
    ],
    colorPalette: ['#E0E5EC', '#FFFFFF', '#A3B1C6', '#4D5B76', '#3B82F6'],
    codeSnippet: `/* Neumorphic Extrusion */
.neumorphic-card {
  background: #e0e5ec;
  border-radius: 20px;
  box-shadow: 9px 9px 18px #b8b9be,
              -9px -9px 18px #ffffff;
}
.neumorphic-inset {
  box-shadow: inset 5px 5px 10px #b8b9be,
              inset -5px -5px 10px #ffffff;
}`,
    tags: ['Soft Shadows', 'Tactile', 'Physical', 'Monochrome'],
  },
  {
    id: 'bento-grid',
    name: 'Bento Grid',
    description: 'Modular grid layout inspired by Japanese bento boxes, grouping diverse features and widgets into varied tile sizes.',
    characteristics: [
      'Asymmetric CSS grid with cells of varying widths and heights (1x1, 2x1, 2x2)',
      'Rounded corners with consistent gap spacing (usually 16px to 24px)',
      'Self-contained modular cards with micro-illustrations or mini-dashboards',
      'Dynamic visual pacing alternating between text, graphs, and images',
      'Highly responsive reflow from multi-column grid to single-column stack',
    ],
    exampleApplications: [
      'Apple keynote feature overview slides',
      'Linear homepage feature showcase',
      'GitHub README feature summaries',
      'Modern SaaS product landing pages',
    ],
    colorPalette: ['#0A0A0A', '#171717', '#262626', '#3B82F6', '#10B981'],
    codeSnippet: `/* Bento Grid Layout */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.bento-card-wide {
  grid-column: span 2;
}
.bento-card-tall {
  grid-row: span 2;
}`,
    tags: ['Grid', 'Apple', 'Modular', 'Showcase', 'Popular'],
  },
  {
    id: 'material-design',
    name: 'Material Design',
    description: 'Google’s tactile design system inspired by paper and ink, featuring elevation z-indices, ripple physics, and bold color accents.',
    characteristics: [
      'Elevation expressed through layered drop-shadow depths (dp2 to dp24)',
      'Interactive ripple animations on user touch/click',
      'Bold primary and secondary color pairings with surface tints',
      'Standardized floating action buttons (FABs) and app bars',
      'Systematic responsive density and icon grids',
    ],
    exampleApplications: [
      'Android operating system apps',
      'Google Workspace (Gmail, Drive, Docs)',
      'Enterprise productivity suites',
      'Cross-platform Flutter applications',
    ],
    colorPalette: ['#6750A4', '#EADDFF', '#625B71', '#7D5260', '#FEF7FF'],
    codeSnippet: `/* Material 3 Surface */
.material-card {
  background: #fef7ff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15),
              0px 1px 2px 0px rgba(0, 0, 0, 0.30);
  transition: box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1);
}`,
    tags: ['Google', 'Paper', 'Elevation', 'Ripples', 'Systematic'],
  },
  {
    id: 'flat-design',
    name: 'Flat Design',
    description: 'Two-dimensional aesthetic rejecting skeuomorphic textures, gradients, and shadows in favor of vivid colors and geometric clarity.',
    characteristics: [
      'Strictly 2D graphics with zero simulated depth or gradients',
      'Vibrant, saturated color palettes (often 5+ distinct bright hues)',
      'Clean geometric shapes: sharp squares, circles, and rounded rectangles',
      'Iconography built with crisp vector silhouettes',
      'Instant load times and ultra-lightweight CSS footprint',
    ],
    exampleApplications: [
      'Early Windows Phone Metro UI',
      'Duolingo gamified learning interface',
      'Simple landing pages and infographic portals',
      'Icon libraries and signage',
    ],
    colorPalette: ['#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#F1C40F'],
    codeSnippet: `/* Flat Card */
.flat-card {
  background: #3498db;
  color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
}`,
    tags: ['2D', 'Vibrant', 'Minimalist', 'Lightweight'],
  },
  {
    id: 'brutalism',
    name: 'Brutalism / Neo-Brutalism',
    description: 'Raw, energetic aesthetic featuring thick solid borders, high contrast colors, drop hard shadows with zero blur, and monospaced typography.',
    characteristics: [
      'Thick black borders (2px to 4px solid #000000)',
      'Hard offset box-shadows without blur (e.g. 4px 4px 0px #000)',
      'Vivid, punchy pastel and primary color pairings (yellow, neon green, cyan, magenta)',
      'Expressive typography mixing heavy sans with monospaced accents',
      'Playful hover offsets (-2px translate with expanded shadow)',
    ],
    exampleApplications: [
      'Gumroad creator platform',
      'Figma community templates',
      'Modern developer portfolios & dev tool landing pages',
      'VexoraMods platform visual identity',
    ],
    colorPalette: ['#FAF7F2', '#FACC15', '#38BDF8', '#4ADE80', '#000000'],
    codeSnippet: `/* Neo-Brutalist Card */
.neo-card {
  background: #ffffff;
  border: 3px solid #000000;
  border-radius: 12px;
  box-shadow: 4px 4px 0px #000000;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.neo-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px #000000;
}`,
    tags: ['Neo-Brutalism', 'Hard Shadows', 'Bold Borders', 'Vibrant', 'VexoraMods'],
  },
  {
    id: 'gradient-design',
    name: 'Gradient & Aurora Design',
    description: 'Luminous mesh gradients and glowing ambient color transitions that inject energy, depth, and futuristic elegance into interfaces.',
    characteristics: [
      'Multi-stop linear and radial gradient backgrounds',
      'Mesh gradients blending 3 to 5 complementary hues',
      'Text clip gradients (bg-clip-text text-transparent)',
      'Glow effects with saturated box-shadows matching element color',
      'Fluid, organic color blurs (ambient lighting)',
    ],
    exampleApplications: [
      'Stripe homepage payment animation',
      'Raycast and Arc Browser interfaces',
      'AI platforms (OpenAI, Anthropic, Gemini UI)',
      'Music streaming apps and festival websites',
    ],
    colorPalette: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#0F172A'],
    codeSnippet: `/* Aurora Gradient Background */
.aurora-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.gradient-text {
  background: linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`,
    tags: ['Aurora', 'Mesh', 'Glowing', 'Futuristic', 'AI'],
  },
  {
    id: 'dark-ui',
    name: 'Dark UI / Dark Mode',
    description: 'High-contrast dark-themed interfaces designed for low-light environments, reduced eye fatigue, and focused content consumption.',
    characteristics: [
      'Deep dark charcoal and slate backgrounds (#09090B, #121212) rather than pure black',
      'Layered elevation conveyed through successively lighter surface shades',
      'Crisp high-contrast text with slightly softened white (#E2E8F0) to eliminate glare',
      'Accent colors with increased saturation to stand out against dark backdrops',
      'Subtle 1px borders with 10-15% white opacity for clean structural separation',
    ],
    exampleApplications: [
      'Code editors (VS Code, Cursor, JetBrains)',
      'Trading terminals and analytics platforms',
      'Night-mode reader apps and streaming platforms (Netflix, Spotify)',
      'Developer documentation portals',
    ],
    colorPalette: ['#09090B', '#18181B', '#27272A', '#38BDF8', '#F43F5E'],
    codeSnippet: `/* Dark Mode Container */
.dark-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  color: #f4f4f5;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}`,
    tags: ['Dark Mode', 'Developer', 'Contrast', 'OLED', 'Modern'],
  },
  {
    id: 'light-ui',
    name: 'Light UI / Modern Clean',
    description: 'Airy, radiant interfaces built on warm neutrals, crisp contrasts, and comfortable daytime legibility.',
    characteristics: [
      'Off-white and soft warm surfaces (#FAFAFA, #FAF7F2, #F8FAFC)',
      'Deep neutral typography (#1E293B) offering WCAG AAA contrast',
      'Delicate borders with light slate tints (#E2E8F0)',
      'Soft diffused drop-shadows mimicking gentle daylight',
      'Trust-inspiring, approachable aesthetic ideal for business and education',
    ],
    exampleApplications: [
      'Notion productivity workspace',
      'Linear and Slack daytime views',
      'Fintech and modern banking apps (Revolut, Wise)',
      'E-commerce marketplaces and university portals',
    ],
    colorPalette: ['#FAF7F2', '#FFFFFF', '#0F172A', '#475569', '#3B82F6'],
    codeSnippet: `/* Clean Light Container */
.light-container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
              0 2px 4px -2px rgba(0, 0, 0, 0.05);
}`,
    tags: ['Light Mode', 'Clean', 'Legibility', 'Approachable'],
  },
  {
    id: 'editorial-design',
    name: 'Editorial Design',
    description: 'Typography-driven aesthetic drawing inspiration from print magazines, newspapers, and luxury editorial publications.',
    characteristics: [
      'Prominent serif display typography paired with legible body text',
      'Multi-column article grids, drop caps, and typographic pull quotes',
      'Asymmetric layouts with elegant photo captions and divider rules',
      'Subtle, understated palette (cream, charcoal, deep crimson, forest green)',
      'Emphasis on storytelling, pacing, and long-form reading comfort',
    ],
    exampleApplications: [
      'The New York Times & The Atlantic interactive features',
      'Vogue and high-fashion digital showcases',
      'Kinfolk, Monocle, and lifestyle magazines',
      'Thought leadership essays and long-form technical blogs',
    ],
    colorPalette: ['#F7F4EE', '#1C1917', '#78350F', '#065F46', '#44403C'],
    codeSnippet: `/* Editorial Typography Block */
.editorial-quote {
  font-family: Georgia, 'Playfair Display', serif;
  font-size: 1.5rem;
  line-height: 1.6;
  border-left: 3px solid #1c1917;
  padding-left: 1.5rem;
  margin: 2rem 0;
  color: #1c1917;
}`,
    tags: ['Serif', 'Print', 'Magazine', 'Typography', 'Luxury'],
  },
  {
    id: 'modern-saas',
    name: 'Modern SaaS Design',
    description: 'The polished industry standard for software-as-a-service products: micro-interactions, dark accents, pill badges, and refined typography.',
    characteristics: [
      'Inter or Geist geometric sans-serif typography',
      'Monochrome foundation with intentional vivid brand accents (indigo, emerald, violet)',
      'Pill badges with subtle glowing borders and dot indicators',
      'Subtle noise textures, radial background gradients, and sleek code blocks',
      'Sticky navigation bars with translucent blur backgrounds',
    ],
    exampleApplications: [
      'Vercel and Next.js documentation & dashboards',
      'Supabase database dashboard',
      'Resend email platform',
      'Clerk authentication suite',
    ],
    colorPalette: ['#000000', '#111111', '#EDEDED', '#38BDF8', '#10B981'],
    codeSnippet: `/* Modern SaaS Pill */
.saas-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.75rem;
  font-weight: 500;
}`,
    tags: ['SaaS', 'Vercel', 'Tech', 'Modern', 'Refined'],
  },
  {
    id: 'soft-ui',
    name: 'Soft UI',
    description: 'A contemporary evolution balancing gentle pastel surfaces, delicate rounded cards, and warm diffused shadows for an inviting feel.',
    characteristics: [
      'Ultra-soft pastel background tints (blush pink, sky blue, butter yellow)',
      'Extra-large border radiuses (20px to 32px)',
      'Subtle low-opacity borders paired with large, multi-layered blur shadows',
      'Friendly, playful iconography with rounded stroke endings',
      'Warm and welcoming tone suitable for wellness, finance, and productivity',
    ],
    exampleApplications: [
      'Headspace and Calm wellness apps',
      'Amie calendar app',
      'Monzo and Cash App mobile interfaces',
      'Modern collaborative canvas tools',
    ],
    colorPalette: ['#FDF2F8', '#EFF6FF', '#FEF9C3', '#1E293B', '#6366F1'],
    codeSnippet: `/* Soft UI Container */
.soft-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.08),
              0 8px 10px -6px rgba(99, 102, 241, 0.04);
}`,
    tags: ['Friendly', 'Pastel', 'Rounded', 'Approachable'],
  },
  {
    id: 'retro-design',
    name: 'Retro / Y2K Cyber UI',
    description: 'Nostalgic digital aesthetic borrowing from early 90s computing, Windows 95 bevels, pixelated icons, and early web optimism.',
    characteristics: [
      'Chiseled 3D beveled borders (inset and outset light/dark edges)',
      'Pixel art fonts, marquee text, and monospaced terminal logs',
      'Classic system title bars with minimize, maximize, and close buttons',
      'High-saturation neon accents (lime green, hot pink, cobalt blue)',
      'Delightful retro sound effects and nostalgic interaction metaphors',
    ],
    exampleApplications: [
      'Indie game landing pages and Steam showcases',
      'Music album interactive promotional websites',
      'Creative developer portfolios with desktop OS metaphors (Poolsuite, 90s desktop)',
      'Web3 retro art collections',
    ],
    colorPalette: ['#C0C0C0', '#000080', '#008080', '#FFFFFF', '#000000'],
    codeSnippet: `/* Retro 95 Window */
.retro-window {
  background: #c0c0c0;
  border-top: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  border-right: 2px solid #000000;
  border-bottom: 2px solid #000000;
  padding: 3px;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
}`,
    tags: ['Y2K', 'Retro', 'Windows 95', 'Pixel', 'Nostalgia'],
  },
];
