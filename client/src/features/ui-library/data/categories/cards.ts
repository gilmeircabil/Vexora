import { UIComponentItem } from '../types.js';

export const CARD_COMPONENTS: UIComponentItem[] = [
  {
    id: 'basic-card',
    name: 'Basic Card',
    category: 'cards',
    description: 'Foundational container component used to group related information, media, and actions into a distinct visual surface.',
    purpose: 'Chunk content into clear, digestible units that can be arranged in flexible responsive grids.',
    whatIsIt: 'A bounded rectangle with background, border or shadow, padding, and internal hierarchy.',
    whatIsItUsedFor: 'Generic content chunks, dashboard widgets, article previews, and settings modules.',
    whereToUse: 'Anywhere content needs clear visual separation from page background.',
    advantages: [
      'Universal mental model for grouping content',
      'Easily arranged into flexible CSS grid and flexbox layouts',
      'Consistent margins and internal padding prevent visual crowding',
    ],
    difficulty: 'beginner',
    tags: ['Card', 'Container', 'Basic', 'Box', 'Surface'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'neo-basic-card',
        name: 'Neo-Brutalist Basic Card',
        description: 'White card with 2px black border, 4px shadow, and clean header.',
        codeReact: `export const NeoBasicCard = () => (
  <div className="max-w-sm bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000]">
    <h3 className="font-black text-base text-black mb-1">Getting Started</h3>
    <p className="text-xs text-neutral-600 mb-4">Learn the fundamentals of modern UI/UX design with our visual component catalog.</p>
    <button className="px-3.5 py-1.5 bg-[#FACC15] text-black font-black text-xs rounded-xl border border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
      Read Guide →
    </button>
  </div>
);`,
        codeHtml: `<div class="card-neo">...</div>`,
      },
    ],
    relatedComponents: ['feature-card', 'bento-card', 'profile-card'],
  },
  {
    id: 'profile-card',
    name: 'Profile Card',
    category: 'cards',
    description: 'Personalized user showcase card displaying an avatar, display name, handle, role badge, bio, and social follow actions.',
    purpose: 'Showcase individual contributors, team members, community users, or authors.',
    whatIsIt: 'A card centered around a person’s avatar image, identity, and social links.',
    whatIsItUsedFor: 'About Us team pages, community member lists, author bios, and user profile summaries.',
    whereToUse: 'Community directories, team pages, and article footers.',
    advantages: [
      'Humanizes the platform and highlights contributors',
      'Provides quick follow or message actions',
      'Compact format suitable for grid or carousel layout',
    ],
    difficulty: 'beginner',
    tags: ['Profile', 'User', 'Avatar', 'Team', 'Bio'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'neo-profile-card',
        name: 'Neo Profile Card',
        description: 'Avatar with status dot, follower counters, and follow button.',
        codeReact: `export const ProfileCardPreview = () => (
  <div className="max-w-xs bg-[#FAF7F2] p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] text-center">
    <div className="w-16 h-16 mx-auto rounded-full bg-[#38BDF8] border-2 border-black flex items-center justify-center font-black text-lg mb-3 shadow-[2px_2px_0px_#000]">
      AR
    </div>
    <h4 className="font-black text-sm text-black">Alex Rivera</h4>
    <p className="text-xs text-neutral-500 font-mono mb-2">@alexrivera</p>
    <p className="text-xs text-neutral-700 mb-4">Lead Frontend Engineer & Design Systems Advocate at VexoraMods.</p>
    <div className="flex justify-around border-t-2 border-black/10 pt-3 mb-4 text-xs">
      <div><p className="font-black text-black">42</p><p className="text-[10px] text-neutral-500">Components</p></div>
      <div><p className="font-black text-black">1.8k</p><p className="text-[10px] text-neutral-500">Followers</p></div>
    </div>
    <button className="w-full py-2 bg-[#FACC15] hover:bg-[#EAB308] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
      Follow
    </button>
  </div>
);`,
        codeHtml: `<div class="profile-card">...</div>`,
      },
    ],
    relatedComponents: ['avatar', 'testimonial-card'],
  },
  {
    id: 'product-card',
    name: 'Product Card',
    category: 'cards',
    description: 'E-commerce card displaying product thumbnail image, title, price, discount badge, rating stars, and Add-to-Cart button.',
    purpose: 'Display items in online storefronts to drive product views and purchases.',
    whatIsIt: 'A card combining product imagery, pricing metadata, rating indicators, and conversion buttons.',
    whatIsItUsedFor: 'Online retail catalogs, digital asset marketplaces, software presets, and physical merchandise.',
    whereToUse: 'E-commerce product grids, recommendation carousels, and search results.',
    advantages: [
      'Optimized layout proven to maximize click-through and purchase intent',
      'Clearly communicates price, discounts, and customer ratings',
      'Accommodates hover image flips or quick preview modals',
    ],
    difficulty: 'intermediate',
    tags: ['Product', 'E-commerce', 'Price', 'Cart', 'Rating'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'neo-product-card',
        name: 'Neo E-commerce Card',
        description: 'Product card with price tag, discount chip, and quick add button.',
        codeReact: `export const ProductCardPreview = () => (
  <div className="max-w-xs bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
    <div className="h-36 bg-[#FFE4E6] border-b-2 border-black flex items-center justify-center font-black text-2xl relative">
      <span className="font-mono text-lg font-black tracking-wider">PACK</span>
      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#F43F5E] text-white text-[10px] font-black rounded-lg border border-black shadow-[1.5px_1.5px_0px_#000]">
        -25%
      </span>
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-black text-sm text-black">UI Icons Pack Pro</h4>
        <span className="font-black text-sm text-black">$29</span>
      </div>
      <p className="text-[11px] text-neutral-600 mb-3">500+ customizable vector glyphs for modern dashboards.</p>
      <div className="flex items-center justify-between">
        <div className="text-xs text-amber-500 font-bold">★★★★★ <span className="text-neutral-500 text-[10px]">(48)</span></div>
        <button className="px-3 py-1.5 bg-[#4ADE80] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
          + Add
        </button>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="product-card">...</div>`,
      },
    ],
    relatedComponents: ['pricing-card', 'rating', 'ecommerce-layout'],
  },
  {
    id: 'statistics-card',
    name: 'Statistics Card (KPI Card)',
    category: 'cards',
    description: 'High-density metric tile featuring a prominent numeric value, title, trend badge (+18.4%), and contextual sparkline graph.',
    purpose: 'Deliver at-a-glance performance insights and trend trajectories in analytics dashboards.',
    whatIsIt: 'A card displaying a single KPI (Key Performance Indicator) with comparative delta indicator.',
    whatIsItUsedFor: 'Analytics consoles, revenue monitors, user growth dashboards, and server telemetry.',
    whereToUse: 'Top row of analytics, admin, and financial dashboards.',
    advantages: [
      'Enables lightning-fast executive status evaluation',
      'Trend badges indicate whether metrics are moving positively or negatively',
      'Supports miniature inline sparklines for quick historical context',
    ],
    difficulty: 'beginner',
    tags: ['KPI', 'Stats', 'Metrics', 'Trend', 'Dashboard'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'neo-stat-card',
        name: 'Neo KPI Stat Card',
        description: 'Vibrant statistic card with green positive delta pill.',
        codeReact: `export const StatCardPreview = () => (
  <div className="max-w-xs bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000]">
    <div className="flex justify-between items-center text-xs text-neutral-500 font-bold mb-1">
      <span>Total Active Users</span>
      <span className="w-6 h-6 rounded-lg bg-[#FAF7F2] border border-black flex items-center justify-center text-[10px] font-mono font-bold">USR</span>
    </div>
    <div className="text-2xl font-black text-black mb-2">24,892</div>
    <div className="flex items-center gap-1.5 text-[11px] font-bold">
      <span className="px-1.5 py-0.5 bg-[#4ADE80] text-black rounded border border-black text-[10px] font-black">
        +14.8%
      </span>
      <span className="text-neutral-500">vs last month</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="kpi-card">...</div>`,
      },
    ],
    relatedComponents: ['progress-bar', 'charts', 'analytics-dashboard'],
  },
  {
    id: 'feature-card',
    name: 'Feature Card',
    category: 'cards',
    description: 'Marketing card presenting an icon/illustration, value proposition headline, and concise explanatory paragraph.',
    purpose: 'Explain a specific capability or selling point of a product cleanly in a feature grid.',
    whatIsIt: 'A card combining an icon graphic with headline and benefit copy.',
    whatIsItUsedFor: 'Landing page 3-column feature grids, product overview pages, and service highlights.',
    whereToUse: 'Landing pages, marketing websites, and onboarding screens.',
    advantages: [
      'Scannable format allows quick evaluation of product features',
      'Icon anchors attention and communicates function before reading',
      'Even grid heights maintain aesthetic balance',
    ],
    difficulty: 'beginner',
    tags: ['Feature', 'Marketing', 'Landing Page', 'Grid'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'neo-feature-card',
        name: 'Neo Feature Card',
        description: 'Vibrant yellow icon box with bold title and arrow link.',
        codeReact: `export const FeatureCardPreview = () => (
  <div className="max-w-xs bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition">
    <div className="w-12 h-12 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center mb-4">
      <svg className="w-6 h-6 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    </div>
    <h4 className="font-black text-base text-black mb-2">Zero-Config Playgrounds</h4>
    <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
      Test and customize component parameters in real time with instant React and HTML code updates.
    </p>
    <a href="#" className="text-xs font-black text-black hover:underline flex items-center gap-1">
      Learn More →
    </a>
  </div>
);`,
        codeHtml: `<div class="feature-card">...</div>`,
      },
    ],
    relatedComponents: ['basic-card', 'bento-card'],
  },
  {
    id: 'pricing-card',
    name: 'Pricing Card',
    category: 'cards',
    description: 'Tiered subscription card detailing plan price, billing period, included features checklist, and sign-up button.',
    purpose: 'Convert visitors into paying customers by clearly differentiating plan tiers and values.',
    whatIsIt: 'A card featuring price ($29/mo), target audience, feature bullet points, and high-impact CTA.',
    whatIsItUsedFor: 'SaaS pricing pages, membership clubs, service packages, and hosting tiers.',
    whereToUse: 'Pricing page layouts and subscription upgrade modals.',
    advantages: [
      'Direct comparison between free and premium tiers',
      'Checklist highlights key inclusions and capabilities',
      'Can be highlighted with "Most Popular" ribbon badge',
    ],
    difficulty: 'intermediate',
    tags: ['Pricing', 'Tier', 'Subscription', 'SaaS', 'Checkout'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'neo-pricing-card',
        name: 'Neo "Pro" Pricing Tier',
        description: 'Highlighted card with "Popular" banner and checkmarks.',
        codeReact: `export const PricingCardPreview = () => (
  <div className="max-w-xs bg-white p-6 rounded-2xl border-2 border-black shadow-[5px_5px_0px_#000] relative">
    <div className="absolute -top-3 right-4 px-3 py-0.5 bg-[#FACC15] text-black text-[10px] font-black rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
      MOST POPULAR
    </div>
    <h4 className="font-black text-base text-black">Pro Developer</h4>
    <p className="text-xs text-neutral-500 mb-4">For power developers and growing teams.</p>
    <div className="flex items-baseline gap-1 mb-5">
      <span className="text-3xl font-black text-black">$19</span>
      <span className="text-xs text-neutral-500 font-bold">/month</span>
    </div>
    <ul className="space-y-2 text-xs font-bold text-neutral-700 mb-6">
      <li className="flex items-center gap-2"><span className="text-green-600 font-black">✓</span> All 100+ UI Components</li>
      <li className="flex items-center gap-2"><span className="text-green-600 font-black">✓</span> Interactive Playgrounds</li>
      <li className="flex items-center gap-2"><span className="text-green-600 font-black">✓</span> Full Source React & HTML</li>
      <li className="flex items-center gap-2"><span className="text-green-600 font-black">✓</span> Unlimited Saved Favorites</li>
    </ul>
    <button className="w-full py-2.5 bg-[#38BDF8] hover:bg-[#0284c7] hover:text-white text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
      Start 14-Day Trial
    </button>
  </div>
);`,
        codeHtml: `<div class="pricing-card">...</div>`,
      },
    ],
    relatedComponents: ['pricing-page-layout', 'product-card'],
  },
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'cards',
    description: 'Social proof card highlighting a customer quote, customer rating stars, reviewer name, avatar, and company role.',
    purpose: 'Build visitor trust, credibility, and social proof through authentic user endorsements.',
    whatIsIt: 'A card featuring a quote block accompanied by customer credentials and photo.',
    whatIsItUsedFor: 'Landing page social proof sections, wall of love galleries, and review feeds.',
    whereToUse: 'Directly below feature showcases or above pricing tables.',
    advantages: [
      'Substantially boosts visitor conversion through social verification',
      'Provides human connection and relatable customer stories',
      'Can be displayed in a responsive masonry grid or horizontal ticker',
    ],
    difficulty: 'beginner',
    tags: ['Testimonial', 'Review', 'Social Proof', 'Quote', 'Customer'],
    popular: true,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'neo-testimonial-card',
        name: 'Neo Testimonial Card',
        description: 'Quote card with 5 gold stars and reviewer profile chip.',
        codeReact: `export const TestimonialCardPreview = () => (
  <div className="max-w-xs bg-[#FAF7F2] p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000]">
    <div className="text-amber-500 font-black text-sm mb-3">★★★★★</div>
    <p className="text-xs text-neutral-800 font-medium mb-4 italic leading-relaxed">
      "The UI Library in VexoraMods is a game changer for our design students. The live previews and beginner explanations made learning UI intuitive."
    </p>
    <div className="flex items-center gap-3 border-t-2 border-black/10 pt-3">
      <div className="w-8 h-8 rounded-full bg-[#A78BFA] border border-black flex items-center justify-center font-black text-xs">
        EM
      </div>
      <div>
        <p className="text-xs font-black text-black">Elena Morris</p>
        <p className="text-[10px] text-neutral-500 font-mono">Design Educator @ TechCamp</p>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="testimonial-card">...</div>`,
      },
    ],
    relatedComponents: ['profile-card', 'rating'],
  },
  {
    id: 'image-card',
    name: 'Image Card',
    category: 'cards',
    description: 'Visual media card pairing a rich photograph, artwork, or graphic with overlay text, category badge, and action trigger.',
    purpose: 'Deliver high-impact visual storytelling for articles, projects, and creative portfolios.',
    whatIsIt: 'A card dominated by an aspect-ratio constrained image with caption or hover details.',
    whatIsItUsedFor: 'Blog thumbnails, project showcases, travel destinations, and creative galleries.',
    whereToUse: 'Blogs, media galleries, and photography portfolios.',
    advantages: [
      'Maximizes visual engagement with high-quality graphics',
      'Supports smooth zoom or overlay transitions on hover',
      'Clear aspect-ratio prevents cumulative layout shifts (CLS)',
    ],
    difficulty: 'beginner',
    tags: ['Image Card', 'Media', 'Visual', 'Gallery', 'Thumbnail'],
    popular: false,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'neo-image-card',
        name: 'Neo Media Card',
        description: 'Vibrant card with color gradient illustration and tag.',
        codeReact: `export const ImageCardPreview = () => (
  <div className="max-w-xs bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden group cursor-pointer">
    <div className="h-40 bg-gradient-to-tr from-purple-500 to-pink-400 border-b-2 border-black p-4 flex flex-col justify-between text-white">
      <span className="self-start px-2.5 py-0.5 bg-black/60 backdrop-blur text-[10px] font-black rounded-lg">
        DESIGN SYSTEM
      </span>
      <span className="text-2xl font-black">2026 Trends</span>
    </div>
    <div className="p-4">
      <h4 className="font-black text-sm text-black mb-1 group-hover:text-blue-600 transition">Design Systems in 2026</h4>
      <p className="text-xs text-neutral-600">A comprehensive dive into tokenization and accessible color spaces.</p>
    </div>
  </div>
);`,
        codeHtml: `<div class="image-card">...</div>`,
      },
    ],
    relatedComponents: ['basic-card', 'image-gallery'],
  },
  {
    id: 'glass-card',
    name: 'Glass Card (Glassmorphism)',
    category: 'cards',
    description: 'Translucent card with backdrop blur filter, semi-transparent white tint, and delicate specular borders floating over vivid backgrounds.',
    purpose: 'Add futuristic elegance and depth while allowing underlying colorful backdrops to shine through softly.',
    whatIsIt: 'A card styled with `backdrop-blur-md` and `bg-white/20` with subtle border opacity.',
    whatIsItUsedFor: 'Web3 portals, modern audio players, iOS-inspired widgets, and futuristic SaaS headers.',
    whereToUse: 'Over rich colorful gradients or ambient backgrounds.',
    advantages: [
      'Gives interfaces a contemporary, high-end, premium aesthetic',
      'Provides high visual depth without heavy dark shadows',
      'Seamlessly integrates with both light and dark backgrounds',
    ],
    difficulty: 'intermediate',
    tags: ['Glass', 'Glassmorphism', 'Backdrop Blur', 'Translucent', 'Modern'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'frosted-glass-card',
        name: 'Frosted Glass Widget',
        description: 'Translucent widget over a vivid gradient with crisp text.',
        codeReact: `export const GlassCardPreview = () => (
  <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl max-w-xs">
    <div className="bg-white/20 backdrop-blur-md border border-white/40 p-5 rounded-2xl text-white shadow-xl">
      <p className="text-xs uppercase tracking-wider font-bold text-white/80 mb-1">Live Telemetry</p>
      <h4 className="text-2xl font-black mb-2">99.98%</h4>
      <p className="text-xs text-white/90">Global edge node latency under 12ms.</p>
    </div>
  </div>
);`,
        codeHtml: `<div class="glass-card">...</div>`,
      },
    ],
    relatedComponents: ['glassmorphism', 'statistics-card'],
  },
  {
    id: 'horizontal-card',
    name: 'Horizontal Card',
    category: 'cards',
    description: 'Landscape-oriented card placing thumbnail media on one side and title, description, and actions on the other.',
    purpose: 'Display article search results or course modules where vertical space is tight.',
    whatIsIt: 'A card using flex-row to arrange media and text side-by-side.',
    whatIsItUsedFor: 'Search results, feed items, course lesson modules, and compact news lists.',
    whereToUse: 'List feeds, search result columns, and dashboard sidebars.',
    advantages: [
      'Fits naturally into full-width vertical feeds',
      'Enables effortless scanning of long article lists',
      'Accommodates generous headline and excerpt text lengths',
    ],
    difficulty: 'beginner',
    tags: ['Horizontal Card', 'List Card', 'Row', 'Search Result'],
    popular: false,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'horizontal-row-card',
        name: 'Horizontal Row Card',
        description: 'Side-by-side square media thumbnail and text content.',
        codeReact: `export const HorizontalCardPreview = () => (
  <div className="max-w-md bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] p-3 flex gap-4 items-center">
    <div className="w-20 h-20 rounded-xl bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-sm font-mono shrink-0">
      #04
    </div>
    <div className="min-w-0 flex-1">
      <span className="text-[10px] font-black uppercase text-neutral-400">Tutorial #04</span>
      <h4 className="font-black text-sm text-black truncate">Building Accessible Modals</h4>
      <p className="text-xs text-neutral-600 line-clamp-1 mb-2">Focus trapping and ARIA dialog properties.</p>
      <span className="text-xs font-black text-blue-600 hover:underline cursor-pointer">Watch 8 min →</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="horizontal-card">...</div>`,
      },
    ],
    relatedComponents: ['basic-card', 'data-table'],
  },
  {
    id: 'expandable-card',
    name: 'Expandable Card',
    category: 'cards',
    description: 'Interactive card that expands vertically or reveals hidden detail trays upon user click or hover.',
    purpose: 'Keep overview screens uncluttered while giving users instant access to detailed parameters.',
    whatIsIt: 'A card with a collapsible accordion tray or expandable details drawer.',
    whatIsItUsedFor: 'Order history summaries, server logs, invoice itemization, and FAQ overviews.',
    whereToUse: 'Dense dashboards and order tracking lists.',
    advantages: [
      'Progressive disclosure minimizes cognitive overload',
      'Preserves current scroll position without opening new pages',
      'Smooth CSS height animation gives delightful feedback',
    ],
    difficulty: 'intermediate',
    tags: ['Expandable', 'Accordion Card', 'Progressive Disclosure', 'Details'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'interactive-expandable-card',
        name: 'Interactive Expandable Card',
        description: 'Toggles between compact summary and expanded metadata drawer.',
        codeReact: `export const ExpandableCardPreview = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="max-w-xs bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
      <div onClick={() => setOpen(!open)} className="p-4 flex justify-between items-center cursor-pointer select-none">
        <div>
          <h4 className="font-black text-sm text-black">Order #84920</h4>
          <p className="text-xs text-neutral-500">3 items · $89.00</p>
        </div>
        <span className="text-sm font-black transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          ▼
        </span>
      </div>
      {open && (
        <div className="p-4 bg-[#FAF7F2] border-t-2 border-black text-xs space-y-1 font-medium">
          <p className="font-black text-black">Delivery Details:</p>
          <p className="text-neutral-600">Shipped via Express Priority</p>
          <p className="text-neutral-600">Tracking: VM-9920-149</p>
        </div>
      )}
    </div>
  );
};`,
        codeHtml: `<div class="expandable-card">...</div>`,
      },
    ],
    relatedComponents: ['accordion', 'basic-card'],
  },
  {
    id: 'bento-card',
    name: 'Bento Card',
    category: 'cards',
    description: 'Modular grid card designed for Bento layouts with asymmetric dimensions, micro-illustrations, and rounded geometry.',
    purpose: 'Display features or tools as self-contained micro-modules within a modern Bento grid arrangement.',
    whatIsIt: 'An Apple/Linear inspired card crafted for multi-span grid layouts.',
    whatIsItUsedFor: 'Product feature overviews, personal portfolios, and software launch pages.',
    whereToUse: 'Bento grid sections on modern homepages.',
    advantages: [
      'Visual variety breaks monotony of uniform square grids',
      'Perfect for pairing visual illustrations with punchy copy',
      'Highly responsive across mobile, tablet, and desktop',
    ],
    difficulty: 'intermediate',
    tags: ['Bento Card', 'Bento Grid', 'Apple Style', 'Modular'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'neo-bento-card',
        name: 'Neo Bento Feature Module',
        description: 'Asymmetric module with code snippet preview and pill badge.',
        codeReact: `export const BentoCardPreview = () => (
  <div className="max-w-sm bg-white p-6 rounded-3xl border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col justify-between">
    <div className="mb-4">
      <span className="px-2.5 py-0.5 bg-[#4ADE80] text-black text-[10px] font-black rounded-lg border border-black mb-3 inline-block">
        FEATURE 01
      </span>
      <h3 className="font-black text-lg text-black mb-1">Instant Code Copy</h3>
      <p className="text-xs text-neutral-600">Extract production-ready React TSX and HTML/CSS snippets with 1 click.</p>
    </div>
    <div className="p-3 bg-neutral-900 rounded-xl text-neutral-200 font-mono text-[11px] border border-black">
      <span className="text-pink-400">const</span> <span className="text-blue-400">button</span> = <span className="text-yellow-400">render</span>();
    </div>
  </div>
);`,
        codeHtml: `<div class="bento-card">...</div>`,
      },
    ],
    relatedComponents: ['bento-grid', 'feature-card'],
  },
];
