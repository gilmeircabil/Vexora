import { UIComponentItem } from '../types.js';

export const NAVIGATION_COMPONENTS: UIComponentItem[] = [
  {
    id: 'navbar',
    name: 'Navbar',
    category: 'navigation',
    description: 'Header navigation bar positioned at the top of a page that provides site-wide links, branding, search, and account actions.',
    purpose: 'Orient the user, provide primary navigational routes across the application, and establish brand presence.',
    whatIsIt: 'A persistent horizontal navigation container fixed or positioned at the very top of a website or web application.',
    whatIsItUsedFor: 'Directing users between primary sections, housing site search, and hosting user authentication controls.',
    whereToUse: 'Top of every public website, web app, and documentation portal.',
    advantages: [
      'Immediately familiar to 100% of web users',
      'Accommodates brand logo, primary links, and actions in one compact bar',
      'Supports sticky or fixed behaviors for continuous access during scroll',
      'Collapses smoothly into mobile drawer menus on smaller viewports',
    ],
    difficulty: 'beginner',
    tags: ['Navbar', 'Header', 'Sticky', 'Responsive', 'Top Bar'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'minimal-navbar',
        name: 'Minimal Navbar',
        description: 'Clean, lightweight navigation with logo on the left and subtle text links on the right.',
        codeReact: `export const MinimalNavbar = () => (
  <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200">
    <div className="font-bold text-lg tracking-tight">VexoraMods</div>
    <div className="flex items-center gap-6 text-sm font-medium text-neutral-600">
      <a href="#features" className="hover:text-black transition">Features</a>
      <a href="#docs" className="hover:text-black transition">Docs</a>
      <a href="#pricing" className="hover:text-black transition">Pricing</a>
      <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition">Get Started</button>
    </div>
  </nav>
);`,
        codeHtml: `<nav class="navbar-minimal">
  <div class="brand">VexoraMods</div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#docs">Docs</a></li>
    <li><a href="#pricing">Pricing</a></li>
  </ul>
  <button class="btn-primary">Get Started</button>
</nav>`,
        codeCss: `.navbar-minimal { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: #fff; border-bottom: 1px solid #e5e7eb; }`,
      },
      {
        id: 'neo-brutalist-navbar',
        name: 'Neo-Brutalist Navbar',
        description: 'High contrast aesthetic with 2px solid borders, vibrant pill badges, and 3D offset box-shadows.',
        codeReact: `export const NeoBrutalistNavbar = () => (
  <nav className="flex items-center justify-between px-6 py-3.5 bg-[#FAF7F2] border-2 border-black shadow-[3px_3px_0px_#000]">
    <div className="flex items-center gap-2 font-black text-lg">
      <span className="w-4 h-4 bg-[#FACC15] border border-black inline-block"></span>
      <span>VexoraMods</span>
    </div>
    <div className="flex items-center gap-3">
      <a href="#tools" className="px-3 py-1.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] text-xs font-black hover:-translate-y-0.5 transition">Tools</a>
      <a href="#library" className="px-3 py-1.5 rounded-xl border-2 border-black bg-[#FACC15] shadow-[2px_2px_0px_#000] text-xs font-black hover:-translate-y-0.5 transition">UI Library</a>
      <button className="px-4 py-1.5 rounded-xl border-2 border-black bg-[#38BDF8] shadow-[2px_2px_0px_#000] text-xs font-black hover:-translate-y-0.5 transition">Sign In</button>
    </div>
  </nav>
);`,
        codeHtml: `<nav class="neo-navbar">
  <div class="logo">VexoraMods</div>
  <div class="actions">
    <a href="#" class="neo-btn">Tools</a>
    <a href="#" class="neo-btn active">UI Library</a>
  </div>
</nav>`,
      },
      {
        id: 'transparent-glass-navbar',
        name: 'Transparent Glass Navbar',
        description: 'Floating pill-shaped frosted glass bar with backdrop blur and delicate glowing borders.',
        codeReact: `export const GlassNavbar = () => (
  <div className="sticky top-4 z-50 max-w-4xl mx-auto px-4">
    <nav className="flex items-center justify-between px-6 py-3 rounded-full bg-white/70 backdrop-blur-md border border-white/40 shadow-lg shadow-black/5">
      <span className="font-bold text-sm tracking-wide">STUDIO</span>
      <div className="flex items-center gap-6 text-xs font-medium text-neutral-600">
        <a href="#overview" className="hover:text-black">Overview</a>
        <a href="#showcase" className="hover:text-black">Showcase</a>
        <a href="#pricing" className="hover:text-black">Pricing</a>
      </div>
      <button className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition">Launch</button>
    </nav>
  </div>
);`,
        codeHtml: `<nav class="glass-navbar">
  <span class="logo">STUDIO</span>
  <ul class="nav-links">
    <li><a href="#overview">Overview</a></li>
  </ul>
</nav>`,
      },
    ],
    relatedComponents: ['sidebar', 'mega-menu', 'breadcrumbs', 'bottom-navigation'],
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    category: 'navigation',
    description: 'Vertical column navigation providing multi-level links, application modules, and utility controls on desktop screens.',
    purpose: 'Organize deep hierarchical structures and complex application tooling in a persistent vertical rail.',
    whatIsIt: 'A vertical panel pinned to the left (or right) side of a web application screen.',
    whatIsItUsedFor: 'Desktop SaaS platforms, dashboards, code repositories, and documentation portals with many links.',
    whereToUse: 'Application workspaces, admin panels, file explorers, and dashboards.',
    advantages: [
      'Holds significantly more links and categories than a horizontal navbar',
      'Supports nested sub-menus, search filters, and collapsible groups',
      'Keeps user context visible without vertical layout shifts during scrolling',
    ],
    difficulty: 'intermediate',
    tags: ['Sidebar', 'Vertical Navigation', 'Dashboard', 'Admin'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'classic-sidebar',
        name: 'Classic App Sidebar',
        description: 'Structured sidebar with icon + label links, active indicators, and user account pill at the bottom.',
        codeReact: `export const ClassicSidebar = () => (
  <aside className="w-64 h-full min-h-[380px] bg-neutral-900 text-neutral-200 p-4 flex flex-col justify-between rounded-xl">
    <div className="space-y-4">
      <div className="px-2 font-bold text-white text-base">Dashboard</div>
      <nav className="space-y-1 text-sm font-medium">
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-800 text-white">Overview</a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800/60 text-neutral-400 hover:text-white transition">Projects</a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800/60 text-neutral-400 hover:text-white transition">Analytics</a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800/60 text-neutral-400 hover:text-white transition">Settings</a>
      </nav>
    </div>
    <div className="border-t border-neutral-800 pt-3 flex items-center gap-3 px-2">
      <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center text-xs">VM</div>
      <div className="text-xs"><p className="font-bold text-white">Alex Dev</p><p className="text-neutral-500">Pro Plan</p></div>
    </div>
  </aside>
);`,
        codeHtml: `<aside class="sidebar">
  <div class="brand">Dashboard</div>
  <nav class="nav-links">
    <a href="#" class="active">Overview</a>
    <a href="#">Projects</a>
  </nav>
</aside>`,
      },
    ],
    relatedComponents: ['collapsible-sidebar', 'navbar', 'vertical-tabs'],
  },
  {
    id: 'collapsible-sidebar',
    name: 'Collapsible Sidebar',
    category: 'navigation',
    description: 'Dynamic vertical sidebar that can toggle between an expanded full-text view and an icon-only slim rail to maximize workspace canvas.',
    purpose: 'Maximize screen real estate for productivity canvases and editors while preserving quick access to tools.',
    whatIsIt: 'A sidebar that collapses from ~240px to ~64px wide on demand.',
    whatIsItUsedFor: 'Design studios (Figma, Canva), code editors (VS Code), email clients, and data dashboards.',
    whereToUse: 'Tools where user canvas width is at a premium.',
    advantages: [
      'Instantly grants 150-200px extra horizontal viewport width',
      'Icon tooltips provide clarity in collapsed mode',
      'Animated smooth transition between states',
    ],
    difficulty: 'intermediate',
    tags: ['Collapsible', 'Sidebar', 'Compact', 'Toggle', 'Icons'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'toggle-sidebar',
        name: 'Icon-Rail Collapsible',
        description: 'Toggles between 220px expanded and 60px mini-rail with smooth CSS transitions.',
        codeReact: `export const CollapsibleSidebarExample = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <aside className={\`\${collapsed ? 'w-16' : 'w-56'} transition-all duration-200 bg-white border-2 border-black shadow-[3px_3px_0px_#000] p-3 rounded-xl flex flex-col justify-between\`}>
      <div>
        <button onClick={() => setCollapsed(!collapsed)} className="w-full flex justify-end text-xs font-black mb-4">
          {collapsed ? '▶' : '◀ Collapse'}
        </button>
        <div className="space-y-2">
          {['Home', 'Files', 'Stats', 'Config'].map((item) => (
            <div key={item} className="flex items-center gap-3 p-2 hover:bg-neutral-100 rounded-lg cursor-pointer text-xs font-bold">
              <span className="w-4 h-4 bg-yellow-400 border border-black rounded-sm shrink-0"></span>
              {!collapsed && <span>{item}</span>}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};`,
        codeHtml: `<aside class="collapsible-sidebar">...</aside>`,
      },
    ],
    relatedComponents: ['sidebar', 'bottom-navigation'],
  },
  {
    id: 'mega-menu',
    name: 'Mega Menu',
    category: 'navigation',
    description: 'Expanded full-width dropdown overlay organized into multi-column categorizations, rich banners, and featured links.',
    purpose: 'Display dozens of categorized links without making users click through nested single-column submenus.',
    whatIsIt: 'A two-dimensional multi-column dropdown triggered on hover or click of a main navigation item.',
    whatIsItUsedFor: 'Large e-commerce catalogs, enterprise software product suites, and comprehensive education portals.',
    whereToUse: 'Top navbar of high-density websites.',
    advantages: [
      'Eliminates repetitive clicking through deeply nested menus',
      'Supports images, badges, promotional banners, and descriptions beside links',
      'Improves discoverability of secondary features',
    ],
    difficulty: 'advanced',
    tags: ['Mega Menu', 'Multi-column', 'Dropdown', 'E-commerce', 'Enterprise'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'three-column-mega-menu',
        name: 'Three-Column Product Menu',
        description: 'Shows Solutions, Developers, and Resources alongside a featured product showcase card.',
        codeReact: `export const MegaMenuPreview = () => (
  <div className="w-full max-w-2xl bg-white border-2 border-black rounded-2xl p-6 shadow-[5px_5px_0px_#000]">
    <div className="grid grid-cols-3 gap-6">
      <div>
        <p className="text-xs font-black uppercase text-neutral-400 mb-2">Products</p>
        <ul className="space-y-2 text-xs font-bold">
          <li className="hover:text-blue-600 cursor-pointer">AI Studio</li>
          <li className="hover:text-blue-600 cursor-pointer">Code Explainer</li>
          <li className="hover:text-blue-600 cursor-pointer">Design Studio</li>
        </ul>
      </div>
      <div>
        <p className="text-xs font-black uppercase text-neutral-400 mb-2">Resources</p>
        <ul className="space-y-2 text-xs font-bold">
          <li className="hover:text-blue-600 cursor-pointer">UI Components</li>
          <li className="hover:text-blue-600 cursor-pointer">Documentation</li>
          <li className="hover:text-blue-600 cursor-pointer">Community Hub</li>
        </ul>
      </div>
      <div className="bg-[#FAF7F2] p-3 rounded-xl border border-black">
        <p className="text-xs font-black mb-1">What's New in 2.0</p>
        <p className="text-[11px] text-neutral-600 mb-2">Explore 100+ UI components & live preview sandbox.</p>
        <span className="text-[10px] font-black underline cursor-pointer">Explore Now →</span>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="mega-menu">...</div>`,
      },
    ],
    relatedComponents: ['navbar', 'dropdown-menu'],
  },
  {
    id: 'dropdown-menu',
    name: 'Dropdown Menu',
    category: 'navigation',
    description: 'Contextual popover list of links or actions triggered when interacting with a button or anchor.',
    purpose: 'Group secondary actions or navigation links under a single clean trigger to prevent UI clutter.',
    whatIsIt: 'A floating menu overlay that opens adjacent to a parent button or link.',
    whatIsItUsedFor: 'User profile menus, filter dropdowns, row action context menus, and navigation sub-links.',
    whereToUse: 'Headers, table row action buttons, and form selectors.',
    advantages: [
      'Hides dozens of actions until required',
      'Keyboard accessible with Arrow keys and Escape key support',
      'Supports dividers, icons, and keyboard shortcut labels',
    ],
    difficulty: 'beginner',
    tags: ['Dropdown', 'Menu', 'Popover', 'Actions'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'user-profile-dropdown',
        name: 'User Profile Dropdown',
        description: 'Menu with user avatar header, account links, dark mode toggle, and sign out.',
        codeReact: `export const ProfileDropdownPreview = () => (
  <div className="w-56 bg-white border-2 border-black rounded-xl p-2 shadow-[4px_4px_0px_#000] text-xs font-bold space-y-1">
    <div className="p-2 border-b border-neutral-200">
      <p className="font-black text-black">Alex Rivera</p>
      <p className="text-[10px] text-neutral-500 font-mono">alex@vexora.dev</p>
    </div>
    <a href="#" className="flex items-center justify-between p-2 rounded hover:bg-neutral-100">Profile <span className="text-[10px] text-neutral-400 font-mono">⌘P</span></a>
    <a href="#" className="flex items-center justify-between p-2 rounded hover:bg-neutral-100">Favorites <span className="text-[10px] bg-yellow-200 px-1 rounded">12</span></a>
    <a href="#" className="flex items-center justify-between p-2 rounded hover:bg-neutral-100">Settings</a>
    <div className="border-t border-neutral-200 pt-1">
      <a href="#" className="block p-2 rounded text-red-600 hover:bg-red-50">Sign Out</a>
    </div>
  </div>
);`,
        codeHtml: `<div class="dropdown-menu">...</div>`,
      },
    ],
    relatedComponents: ['context-menu', 'navbar', 'command-palette'],
  },
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    category: 'navigation',
    description: 'Horizontal chain of links indicating the current page location within the application or site hierarchy.',
    purpose: 'Provide contextual orientation and allow one-click navigation back to parent categories or folders.',
    whatIsIt: 'A trail of hyperlinked titles separated by slashes (/), arrows (→), or chevrons (>).',
    whatIsItUsedFor: 'E-commerce category depth, nested documentation chapters, file systems, and multi-step processes.',
    whereToUse: 'Directly beneath the header or page hero on hierarchical content pages.',
    advantages: [
      'Reduces bounce rates by giving users immediate upstream routes',
      'Occupies minimal vertical space (single line)',
      'Improves SEO with schema.org structured data breadcrumb markup',
    ],
    difficulty: 'beginner',
    tags: ['Breadcrumbs', 'Hierarchy', 'Trail', 'Navigation', 'Orientation'],
    popular: false,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'chevron-breadcrumbs',
        name: 'Chevron Breadcrumbs',
        description: 'Clean typographic trail with chevrons and active page indicator.',
        codeReact: `export const BreadcrumbsPreview = () => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-neutral-500">
    <a href="#" className="hover:text-black transition">Home</a>
    <span>/</span>
    <a href="#" className="hover:text-black transition">UI Library</a>
    <span>/</span>
    <a href="#" className="hover:text-black transition">Navigation</a>
    <span>/</span>
    <span className="text-black font-black">Breadcrumbs</span>
  </nav>
);`,
        codeHtml: `<nav class="breadcrumbs">
  <a href="/">Home</a> / <a href="/ui-library">UI Library</a> / <span>Breadcrumbs</span>
</nav>`,
      },
    ],
    relatedComponents: ['step-navigation', 'pagination'],
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'navigation',
    description: 'Horizontal segmented control allowing users to switch between alternate views or content panels within the same page context.',
    purpose: 'Group related content without forcing users to navigate to different URLs or scroll endlessly.',
    whatIsIt: 'A row of labeled buttons that toggle active display panels beneath them.',
    whatIsItUsedFor: 'Code snippet language switchers, profile tab views (Posts, Likes, Media), and setting panels.',
    whereToUse: 'Component detail views, user dashboards, and code previews.',
    advantages: [
      'Preserves current page scroll and state',
      'Familiar mental model derived from physical folder tabs',
      'Smooth keyboard navigation using Left/Right arrows',
    ],
    difficulty: 'beginner',
    tags: ['Tabs', 'Segmented Control', 'View Switcher', 'Pill'],
    popular: true,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'pill-tabs',
        name: 'Pill Tabs',
        description: 'Enclosed pill-style container with active background switch.',
        codeReact: `export const PillTabsPreview = () => {
  const [active, setActive] = React.useState('Preview');
  return (
    <div className="inline-flex p-1 bg-neutral-200 border-2 border-black rounded-xl">
      {['Preview', 'Code', 'Documentation'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={\`px-4 py-1.5 rounded-lg text-xs font-black transition \${
            active === tab ? 'bg-white text-black shadow-[2px_2px_0px_#000]' : 'text-neutral-600 hover:text-black'
          }\`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};`,
        codeHtml: `<div class="tabs-container">...</div>`,
      },
    ],
    relatedComponents: ['vertical-tabs', 'step-navigation'],
  },
  {
    id: 'vertical-tabs',
    name: 'Vertical Tabs',
    category: 'navigation',
    description: 'Stacked vertical tab list paired with a right-hand content pane, ideal for settings pages and detailed documentation.',
    purpose: 'Organize extensive settings or categories where horizontal tabs would wrap or overflow.',
    whatIsIt: 'A left-hand vertical list of tabs driving content in the adjacent right panel.',
    whatIsItUsedFor: 'Account settings (General, Security, Billing, Notifications), admin preferences, and documentation sections.',
    whereToUse: 'Settings screens and wide desktop administration panels.',
    advantages: [
      'Can scale to 10+ tabs without horizontal crowding',
      'Supports longer descriptive tab labels and badges',
      'Natural top-to-bottom reading flow',
    ],
    difficulty: 'intermediate',
    tags: ['Vertical Tabs', 'Settings', 'Preferences', 'Sidebar'],
    popular: false,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'settings-vertical-tabs',
        name: 'Settings Tab Rail',
        description: 'Vertical tab list with icons, badges, and active border accent.',
        codeReact: `export const VerticalTabsPreview = () => {
  const [active, setActive] = React.useState('General');
  const tabs = ['General', 'Security', 'Billing', 'Team'];
  return (
    <div className="flex gap-6 max-w-lg bg-white p-4 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000]">
      <div className="w-40 space-y-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={\`w-full text-left px-3 py-2 rounded-lg text-xs font-black transition \${
              active === t ? 'bg-[#FACC15] border border-black' : 'hover:bg-neutral-100 text-neutral-600'
            }\`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 p-3 bg-neutral-50 rounded-lg text-xs font-medium">
        <p className="font-black text-sm mb-1">{active} Settings</p>
        <p className="text-neutral-500">Configure your workspace preferences and notifications here.</p>
      </div>
    </div>
  );
};`,
        codeHtml: `<div class="vertical-tabs">...</div>`,
      },
    ],
    relatedComponents: ['tabs', 'sidebar'],
  },
  {
    id: 'bottom-navigation',
    name: 'Bottom Navigation',
    category: 'navigation',
    description: 'Fixed bottom bar for mobile screens providing immediate thumb-friendly switching between 3 to 5 core application destinations.',
    purpose: 'Enable ergonomic single-hand navigation across primary top-level mobile screens.',
    whatIsIt: 'A persistent horizontal bar pinned to the bottom of the viewport on touch devices.',
    whatIsItUsedFor: 'Mobile apps and responsive web applications viewed on smartphones.',
    whereToUse: 'Mobile viewports for mobile web apps, social feeds, and e-commerce apps.',
    advantages: [
      'Placed squarely in the natural smartphone "thumb zone"',
      'Keeps the top of the mobile screen clean for content',
      'Clearly highlights current active screen with badge/icon highlights',
    ],
    difficulty: 'beginner',
    tags: ['Bottom Nav', 'Mobile', 'Thumb-Zone', 'Touch', 'PWA'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'mobile-bottom-bar',
        name: 'Mobile Bottom Tab Bar',
        description: '4-item icon bar with active dot indicator and notification badge.',
        codeReact: `export const BottomNavPreview = () => (
  <div className="max-w-xs mx-auto bg-white border-2 border-black rounded-2xl p-2 shadow-[3px_3px_0px_#000] flex justify-around items-center">
    <button className="flex flex-col items-center gap-1 text-[10px] font-black text-black">
      <span className="w-5 h-5 bg-[#FACC15] border border-black rounded-md flex items-center justify-center text-xs">⌂</span>
      Home
    </button>
    <button className="flex flex-col items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-black">
      <span className="w-5 h-5 bg-neutral-100 border border-neutral-300 rounded-md flex items-center justify-center text-[10px] font-mono">Q</span>
      Search
    </button>
    <button className="flex flex-col items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-black relative">
      <span className="w-5 h-5 bg-neutral-100 border border-neutral-300 rounded-md flex items-center justify-center text-[10px] font-mono">!</span>
      <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      Alerts
    </button>
    <button className="flex flex-col items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-black">
      <span className="w-5 h-5 bg-neutral-100 border border-neutral-300 rounded-md flex items-center justify-center text-[10px] font-mono">U</span>
      Profile
    </button>
  </div>
);`,
        codeHtml: `<nav class="bottom-navigation">...</nav>`,
      },
    ],
    relatedComponents: ['navbar', 'tabs'],
  },
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'navigation',
    description: 'Numbered page navigation allowing users to traverse split datasets, search results, or article archives sequentially or directly.',
    purpose: 'Chunk large datasets into manageable bites, improve initial load times, and provide predictable browsing.',
    whatIsIt: 'A row of numbered buttons with Previous / Next controls.',
    whatIsItUsedFor: 'Data tables, search result pages, e-commerce catalog listings, and forum thread lists.',
    whereToUse: 'Bottom of tables, catalog grids, and long lists.',
    advantages: [
      'Allows direct jumping to specific page numbers (e.g. Page 12)',
      'Saves bandwidth by loading only a slice (e.g. 20 items) at a time',
      'Provides a sense of total catalog size to the user',
    ],
    difficulty: 'beginner',
    tags: ['Pagination', 'Pages', 'Numbers', 'Data Table', 'Prev Next'],
    popular: false,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'numbered-pagination',
        name: 'Numbered Pagination Bar',
        description: 'Full pagination bar with Previous, Next, page numbers, and ellipsis indicator.',
        codeReact: `export const PaginationPreview = () => (
  <div className="flex items-center gap-1.5 text-xs font-black">
    <button className="px-3 py-1.5 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition">← Prev</button>
    <button className="w-8 h-8 rounded-lg border-2 border-black bg-[#FACC15] shadow-[2px_2px_0px_#000] flex items-center justify-center">1</button>
    <button className="w-8 h-8 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000] flex items-center justify-center hover:bg-neutral-100">2</button>
    <button className="w-8 h-8 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000] flex items-center justify-center hover:bg-neutral-100">3</button>
    <span className="px-1 text-neutral-500">...</span>
    <button className="w-8 h-8 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000] flex items-center justify-center hover:bg-neutral-100">18</button>
    <button className="px-3 py-1.5 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition">Next →</button>
  </div>
);`,
        codeHtml: `<div class="pagination">...</div>`,
      },
    ],
    relatedComponents: ['breadcrumbs', 'data-table'],
  },
  {
    id: 'command-palette',
    name: 'Command Palette',
    category: 'navigation',
    description: 'Keyboard-first modal dialog (triggered with ⌘K / Ctrl+K) allowing lightning-fast searching, navigation, and command execution.',
    purpose: 'Empower power users to jump anywhere in the application and execute commands without taking their hands off the keyboard.',
    whatIsIt: 'A centered spotlight search modal inspired by macOS Spotlight, Raycast, and VS Code.',
    whatIsItUsedFor: 'Developer platforms (Vercel, GitHub, Linear, Stripe), note apps (Notion, Obsidian), and complex SaaS tools.',
    whereToUse: 'Global shortcut across the entire application.',
    advantages: [
      'Dramatically accelerates navigation for frequent users',
      'Combines search, shortcuts, page navigation, and actions in one unified dialog',
      'Provides instant fuzzy search feedback',
    ],
    difficulty: 'advanced',
    tags: ['Command Palette', 'Cmd+K', 'Spotlight', 'Keyboard', 'Search'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'raycast-style-palette',
        name: 'Spotlight Command Palette',
        description: 'Centered search input with categorized command groups and keyboard navigation hints.',
        codeReact: `export const CommandPalettePreview = () => (
  <div className="w-full max-w-md bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden">
    <div className="p-3 border-b-2 border-black flex items-center gap-2">
      <span className="text-xs font-mono font-bold text-neutral-400">&gt;</span>
      <input type="text" placeholder="Type a command or search..." className="w-full text-xs font-bold outline-none" readOnly value="Go to " />
      <span className="px-1.5 py-0.5 text-[10px] font-mono border border-black rounded bg-neutral-100">ESC</span>
    </div>
    <div className="p-2 space-y-1 text-xs font-bold">
      <p className="px-2 pt-1 text-[10px] uppercase text-neutral-400 font-black">Navigation</p>
      <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] border border-black">
        <span>Go to UI Library</span>
        <span className="text-[10px] font-mono text-neutral-500">↵ Enter</span>
      </div>
      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100">
        <span>Go to Design Studio</span>
        <span className="text-[10px] font-mono text-neutral-500">G S</span>
      </div>
      <p className="px-2 pt-2 text-[10px] uppercase text-neutral-400 font-black">Actions</p>
      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100">
        <span>Create New Project</span>
        <span className="text-[10px] font-mono text-neutral-500">⌘N</span>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="command-palette">...</div>`,
      },
    ],
    relatedComponents: ['search-input', 'modal', 'dropdown-menu'],
  },
  {
    id: 'context-menu',
    name: 'Context Menu',
    category: 'navigation',
    description: 'Custom right-click menu that reveals localized actions relevant specifically to the targeted element.',
    purpose: 'Provide contextual editing and manipulation actions without cluttering the visible interface.',
    whatIsIt: 'A popup menu that appears directly at the cursor coordinates upon a secondary click (right click) or long press.',
    whatIsItUsedFor: 'Canvas design tools, file trees, spreadsheets, and table rows.',
    whereToUse: 'Creative studio canvases, file explorer rows, and code editor windows.',
    advantages: [
      'Keeps screen uncluttered by hiding element-specific actions until right-clicked',
      'Provides instant access to Copy, Paste, Duplicate, Rename, and Delete',
      'Preserves user focus directly where the mouse pointer rests',
    ],
    difficulty: 'intermediate',
    tags: ['Context Menu', 'Right Click', 'Cursor', 'Actions', 'File'],
    popular: false,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'file-context-menu',
        name: 'File Context Menu',
        description: 'Menu with Cut, Copy, Rename, and Danger Delete actions.',
        codeReact: `export const ContextMenuPreview = () => (
  <div className="w-48 bg-white border-2 border-black rounded-xl p-1.5 shadow-[4px_4px_0px_#000] text-xs font-bold space-y-0.5">
    <div className="flex items-center justify-between p-1.5 rounded hover:bg-neutral-100 cursor-pointer">
      <span>Preview File</span>
      <span className="text-[10px] font-mono text-neutral-400">Space</span>
    </div>
    <div className="flex items-center justify-between p-1.5 rounded hover:bg-neutral-100 cursor-pointer">
      <span>Copy Link</span>
      <span className="text-[10px] font-mono text-neutral-400">⌘C</span>
    </div>
    <div className="flex items-center justify-between p-1.5 rounded hover:bg-neutral-100 cursor-pointer">
      <span>Duplicate</span>
      <span className="text-[10px] font-mono text-neutral-400">⌘D</span>
    </div>
    <div className="border-t border-neutral-200 my-1"></div>
    <div className="flex items-center justify-between p-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer">
      <span>Delete</span>
      <span className="text-[10px] font-mono text-red-400">⌫</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="context-menu">...</div>`,
      },
    ],
    relatedComponents: ['dropdown-menu', 'file-explorer'],
  },
  {
    id: 'step-navigation',
    name: 'Step Navigation (Stepper)',
    category: 'navigation',
    description: 'Progress indicator guiding users through a sequential multi-step workflow such as onboarding or checkout.',
    purpose: 'Communicate overall journey length, highlight current position, and set user expectations.',
    whatIsIt: 'A horizontal or vertical sequence of numbered circles connected by line segments.',
    whatIsItUsedFor: 'E-commerce checkouts, user onboarding wizards, registration forms, and loan applications.',
    whereToUse: 'Multi-screen checkout and registration flows.',
    advantages: [
      'Dramatically reduces form abandonment by breaking lengthy tasks into digestible stages',
      'Provides visual feedback on completed vs pending steps',
      'Allows one-click return to previously completed steps',
    ],
    difficulty: 'intermediate',
    tags: ['Stepper', 'Step Navigation', 'Wizard', 'Checkout', 'Progress'],
    popular: true,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'horizontal-stepper',
        name: 'Horizontal Stepper',
        description: '3-step progress bar showing Completed, Active, and Upcoming steps.',
        codeReact: `export const StepNavigationPreview = () => (
  <div className="w-full max-w-md mx-auto flex items-center justify-between text-xs font-black">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-[#4ADE80] border-2 border-black flex items-center justify-center text-xs">✓</div>
      <span>Account</span>
    </div>
    <div className="flex-1 h-0.5 bg-black mx-3"></div>
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center text-xs shadow-[2px_2px_0px_#000]">2</div>
      <span>Billing</span>
    </div>
    <div className="flex-1 h-0.5 bg-neutral-300 mx-3"></div>
    <div className="flex items-center gap-2 text-neutral-400">
      <div className="w-7 h-7 rounded-full bg-neutral-100 border-2 border-neutral-300 flex items-center justify-center text-xs">3</div>
      <span>Confirm</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="stepper">...</div>`,
      },
    ],
    relatedComponents: ['multi-step-form', 'multi-step-wizard', 'breadcrumbs'],
  },
  {
    id: 'floating-navigation',
    name: 'Floating Navigation (Dock)',
    category: 'navigation',
    description: 'Detached floating navigation dock hovering gracefully over content with magnification and micro-interactions.',
    purpose: 'Provide quick access to core actions while maintaining modern visual aesthetics and minimizing chrome obstruction.',
    whatIsIt: 'A detached pill or dock pinned to the bottom or corner of the screen floating above page content.',
    whatIsItUsedFor: 'Creative portfolios, macOS-style web interfaces, canvas tools, and AI copilot widgets.',
    whereToUse: 'Modern web apps and landing pages with rich visual backgrounds.',
    advantages: [
      'Leaves the top and sides of the viewport open for media',
      'Creates a distinctive, polished, modern visual appeal',
      'Supports smooth hover magnification effects',
    ],
    difficulty: 'intermediate',
    tags: ['Floating Nav', 'Dock', 'macOS', 'Pill', 'Floating Action'],
    popular: true,
    dateAdded: '2026-01-22',
    variations: [
      {
        id: 'dock-pill-nav',
        name: 'macOS Style Floating Dock',
        description: 'Centered bottom floating pill with subtle hover magnification and tooltip hints.',
        codeReact: `export const FloatingNavPreview = () => (
  <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/90 backdrop-blur-md text-white rounded-full border border-neutral-700 shadow-2xl">
    {['Home', 'Files', 'Theme', 'Prefs'].map((label, idx) => (
      <button key={idx} className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-[10px] font-mono">
        {label[0]}
      </button>
    ))}
    <div className="w-[1px] h-6 bg-neutral-700 mx-1"></div>
    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-full text-xs font-bold transition">Share</button>
  </div>
);`,
        codeHtml: `<nav class="floating-dock">...</nav>`,
      },
    ],
    relatedComponents: ['bottom-navigation', 'floating-action-button', 'navbar'],
  },
];
