import { UIComponentItem } from '../types.js';

export const BUTTON_COMPONENTS: UIComponentItem[] = [
  {
    id: 'primary-button',
    name: 'Primary Button',
    category: 'buttons',
    description: 'The highest-prominence call-to-action button on a screen, drawing immediate visual attention to the intended primary action.',
    purpose: 'Direct users toward the single most important action on a page (e.g., Save, Submit, Buy, Create).',
    whatIsIt: 'A solid, high-contrast button styled with the primary brand color to establish visual dominance.',
    whatIsItUsedFor: 'Form submission, purchase confirmation, user signup, file download, and document saving.',
    whereToUse: 'Limit to 1 (rarely 2) per visible viewport to prevent visual decision fatigue.',
    advantages: [
      'Establishes an unambiguous primary user journey',
      'High visual contrast guarantees accessibility and clarity',
      'Reinforces brand recognition through primary palette expression',
    ],
    difficulty: 'beginner',
    tags: ['Button', 'Primary', 'CTA', 'Action', 'Neo-Brutalist'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'neo-primary',
        name: 'Neo-Brutalist Primary',
        description: 'Vibrant yellow with 2px solid border, hard shadow, and hover translation.',
        codeReact: `export const NeoPrimaryButton = () => (
  <button className="px-5 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer">
    Get Started Free
  </button>
);`,
        codeHtml: `<button class="btn-neo-primary">Get Started Free</button>`,
        codeCss: `.btn-neo-primary { background: #facc15; color: #000; font-weight: 900; border: 2px solid #000; border-radius: 12px; box-shadow: 3px 3px 0 #000; padding: 10px 20px; cursor: pointer; transition: all 0.15s ease; } .btn-neo-primary:hover { transform: translateY(-2px); box-shadow: 5px 5px 0 #000; }`,
      },
      {
        id: 'modern-indigo',
        name: 'Modern Gradient Glow',
        description: 'Sleek indigo button with soft glow shadow and subtle gradient.',
        codeReact: `export const GlowPrimaryButton = () => (
  <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all cursor-pointer">
    Launch Studio
  </button>
);`,
        codeHtml: `<button class="btn-glow-primary">Launch Studio</button>`,
      },
    ],
    relatedComponents: ['secondary-button', 'outline-button', 'loading-button'],
  },
  {
    id: 'secondary-button',
    name: 'Secondary Button',
    category: 'buttons',
    description: 'Medium-prominence button providing an alternative or supplementary path without competing visually with the primary action.',
    purpose: 'Offer useful secondary options (e.g., Save Draft, Learn More, Cancel, Back) that support the primary flow.',
    whatIsIt: 'A subdued button usually styled with neutral background or muted tint.',
    whatIsItUsedFor: 'Back buttons, secondary workflows, preview actions, and non-destructive decisions.',
    whereToUse: 'Paired directly adjacent to a primary button inside forms and dialog footers.',
    advantages: [
      'Creates a clear visual hierarchy alongside primary buttons',
      'Provides safe exit routes or low-commitment alternatives',
      'Does not distract user attention from primary conversions',
    ],
    difficulty: 'beginner',
    tags: ['Button', 'Secondary', 'Neutral', 'Alternative'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'neutral-secondary',
        name: 'Neutral White Pill',
        description: 'Crisp white surface with black border and offset shadow.',
        codeReact: `export const SecondaryButtonPreview = () => (
  <button className="px-4 py-2 bg-white hover:bg-neutral-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer">
    Save Draft
  </button>
);`,
        codeHtml: `<button class="btn-secondary">Save Draft</button>`,
      },
    ],
    relatedComponents: ['primary-button', 'outline-button', 'ghost-button'],
  },
  {
    id: 'outline-button',
    name: 'Outline Button',
    category: 'buttons',
    description: 'Transparent interior with a crisp colored border that fills on hover, offering a lightweight interactive footprint.',
    purpose: 'Indicate an action without visual heaviness, keeping background graphics or text unobstructed.',
    whatIsIt: 'A button with a 1-2px border, transparent background, and inverted hover state.',
    whatIsItUsedFor: 'Filter toggles, category selectors, "View Docs", and secondary hero CTAs.',
    whereToUse: 'Hero sections beside solid primary buttons or within cards.',
    advantages: [
      'Preserves background visibility in rich media layouts',
      'Delivers an elegant, refined aesthetic',
      'Clear interactive hover inversion gives satisfying user feedback',
    ],
    difficulty: 'beginner',
    tags: ['Outline', 'Bordered', 'Ghost', 'Hero CTA'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'neo-outline',
        name: 'Neo Outline',
        description: '2px solid black outline with yellow fill on hover.',
        codeReact: `export const NeoOutlineButton = () => (
  <button className="px-4 py-2 bg-transparent hover:bg-[#FACC15] text-black font-black text-xs rounded-xl border-2 border-black transition-all cursor-pointer">
    Documentation ↗
  </button>
);`,
        codeHtml: `<button class="btn-outline">Documentation ↗</button>`,
      },
    ],
    relatedComponents: ['secondary-button', 'ghost-button'],
  },
  {
    id: 'ghost-button',
    name: 'Ghost Button',
    category: 'buttons',
    description: 'Border-free button that only displays a background tint on hover, ideal for low-priority utility actions and table rows.',
    purpose: 'Keep dense interfaces clean by rendering button chrome only when user actively hovers or focuses.',
    whatIsIt: 'A text-like button with generous padding that shows a faint background on hover.',
    whatIsItUsedFor: 'Toolbar controls, navigation sub-links, table action menus, and modal close buttons.',
    whereToUse: 'Data tables, toolbars, and rich text editor bars.',
    advantages: [
      'Zero visual clutter when sitting idle',
      'Seamlessly blends into navigation bars and toolbars',
      'Maintains standard accessible tap/click area',
    ],
    difficulty: 'beginner',
    tags: ['Ghost', 'Subtle', 'Minimal', 'Toolbar'],
    popular: false,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'subtle-ghost',
        name: 'Subtle Ghost',
        description: 'Completely transparent at rest, soft grey tint on hover.',
        codeReact: `export const GhostButtonPreview = () => (
  <button className="px-3 py-1.5 text-neutral-600 hover:text-black hover:bg-black/5 rounded-lg text-xs font-bold transition-all cursor-pointer">
    Cancel
  </button>
);`,
        codeHtml: `<button class="btn-ghost">Cancel</button>`,
      },
    ],
    relatedComponents: ['icon-button', 'outline-button'],
  },
  {
    id: 'icon-button',
    name: 'Icon Button',
    category: 'buttons',
    description: 'Compact square or circular button containing an icon without text label, optimized for standard recognizable operations.',
    purpose: 'Conserve screen space while providing immediate access to universally recognized actions (e.g., Close, Settings, Search, Edit).',
    whatIsIt: 'A 1:1 aspect ratio button hosting a clear vector glyph or SVG icon.',
    whatIsItUsedFor: 'Search triggers, notification bells, modal close (X), volume toggles, and editor toolbars.',
    whereToUse: 'Headers, chat inputs, audio players, and floating docks.',
    advantages: [
      'Compact footprint fits easily into tight headers and rows',
      'Universally understood across languages (when using standard icons)',
      'Touch-friendly 44x44px target on mobile',
    ],
    difficulty: 'beginner',
    tags: ['Icon Button', 'Compact', 'Toolbar', 'Glyph'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'neo-icon-btn',
        name: 'Neo Brutalist Icon Button',
        description: 'Square with 2px border, yellow fill, and hard shadow.',
        codeReact: `export const NeoIconButton = () => (
  <button aria-label="Settings" className="w-9 h-9 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer">
    <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  </button>
);`,
        codeHtml: `<button class="btn-icon">Settings</button>`,
      },
    ],
    relatedComponents: ['ghost-button', 'floating-action-button'],
  },
  {
    id: 'floating-action-button',
    name: 'Floating Action Button (FAB)',
    category: 'buttons',
    description: 'Elevated circular action button floating above all page content at the bottom corner of the viewport for the single key action.',
    purpose: 'Keep the most important action (Compose, Add, Create, Chat) instantly accessible regardless of scroll position.',
    whatIsIt: 'A circular button floating fixed at the bottom-right of the screen with a high elevation shadow.',
    whatIsItUsedFor: 'New email compose, create note, live customer support chat widget, and add expense.',
    whereToUse: 'Mobile applications and dynamic feed platforms.',
    advantages: [
      'Always accessible without scrolling back to top',
      'Strongest visual hierarchy anchor on mobile viewports',
      'Can expand into a speed-dial cluster of sub-actions',
    ],
    difficulty: 'intermediate',
    tags: ['FAB', 'Floating Action', 'Material', 'Compose', 'Mobile'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'corner-fab',
        name: 'Neo-Brutalist FAB',
        description: 'Large floating button with bold + symbol and drop shadow.',
        codeReact: `export const FabPreview = () => (
  <button aria-label="Create new" className="w-12 h-12 rounded-full bg-[#4ADE80] border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center text-xl font-black hover:-translate-y-1 active:translate-y-0.5 transition-all cursor-pointer">
    +
  </button>
);`,
        codeHtml: `<button class="fab-button">+</button>`,
      },
    ],
    relatedComponents: ['icon-button', 'primary-button'],
  },
  {
    id: 'split-button',
    name: 'Split Button',
    category: 'buttons',
    description: 'Dual-action button combining an immediate default click action on the left with a dropdown chevron toggle on the right.',
    purpose: 'Execute a default command instantly while offering related alternative variations from an attached dropdown.',
    whatIsIt: 'A segmented button where the main body triggers default action and the right slice opens a list of alternatives.',
    whatIsItUsedFor: 'GitHub PR merge styles (Merge commit, Squash and merge, Rebase), Save & Publish vs Save Draft.',
    whereToUse: 'Publishing bars, version control managers, and export toolbars.',
    advantages: [
      'Fast 1-click execution for the 90% common use case',
      'Preserves easy discovery of related alternative modes',
      'Consolidates multiple buttons into a single compact footprint',
    ],
    difficulty: 'intermediate',
    tags: ['Split Button', 'Segmented', 'Dropdown Action', 'Merge'],
    popular: false,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'split-button-preview',
        name: 'Neo Split Button',
        description: 'Segmented button with "Publish Now" and arrow toggle.',
        codeReact: `export const SplitButtonPreview = () => (
  <div className="inline-flex rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] overflow-hidden bg-white">
    <button className="px-4 py-2 bg-[#38BDF8] hover:bg-[#0284c7] hover:text-white font-black text-xs border-r-2 border-black transition cursor-pointer">
      Publish Now
    </button>
    <button className="px-2.5 py-2 bg-[#38BDF8] hover:bg-[#0284c7] hover:text-white font-black text-xs transition cursor-pointer">
      ▼
    </button>
  </div>
);`,
        codeHtml: `<div class="split-btn">...</div>`,
      },
    ],
    relatedComponents: ['primary-button', 'dropdown-menu'],
  },
  {
    id: 'toggle-button',
    name: 'Toggle Button',
    category: 'buttons',
    description: 'Stateful button that toggles between active and inactive states on click, showing clear visual confirmation.',
    purpose: 'Allow users to switch a binary state (On/Off, Favorite, Bold, Bookmark) or select one option among a group.',
    whatIsIt: 'A button whose styling persists in an "active/pressed" appearance when turned on.',
    whatIsItUsedFor: 'Formatting bars (Bold, Italic, Strikethrough), bookmarking, mute toggles, and view grid/list switchers.',
    whereToUse: 'Text editors, audio controls, and feed filter rails.',
    advantages: [
      'Provides immediate visual feedback of active state',
      'Eliminates need for separate checkboxes or form controls in toolbars',
      'Can be grouped together into multi-select or single-select button bars',
    ],
    difficulty: 'beginner',
    tags: ['Toggle', 'Stateful', 'Active', 'Bookmark', 'Switch'],
    popular: true,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'favorite-toggle',
        name: 'Heart Favorite Toggle',
        description: 'Toggles between saved pink state and inactive state.',
        codeReact: `export const ToggleButtonPreview = () => {
  const [active, setActive] = React.useState(false);
  return (
    <button
      onClick={() => setActive(!active)}
      className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black transition cursor-pointer \${
        active ? 'bg-[#F472B6] text-black' : 'bg-white text-neutral-600 hover:bg-neutral-50'
      }\`}
    >
      <span>{active ? '♥' : '♡'}</span>
      <span>{active ? 'Saved' : 'Save to Favorites'}</span>
    </button>
  );
};`,
        codeHtml: `<button class="toggle-btn">...</button>`,
      },
    ],
    relatedComponents: ['toggle-switch', 'checkbox'],
  },
  {
    id: 'loading-button',
    name: 'Loading Button (Spinner State)',
    category: 'buttons',
    description: 'Button that transitions into an animated spinner and disabled state upon click to indicate asynchronous operation in progress.',
    purpose: 'Prevent duplicate form submissions and assure the user that their request is being actively processed.',
    whatIsIt: 'A button that replaces or supplements text with a rotating spinner and disables pointer events while pending.',
    whatIsItUsedFor: 'Payment processing, file uploading, database saving, and authentication login.',
    whereToUse: 'Any form submission or asynchronous API request button.',
    advantages: [
      'Prevents double-charging credit cards and duplicate database entries',
      'Provides visual reassurance during network latency',
      'Smoothly handles success or error completion transitions',
    ],
    difficulty: 'intermediate',
    tags: ['Loading Button', 'Spinner', 'Async', 'Pending', 'Feedback'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'spinner-btn',
        name: 'Spinner State Button',
        description: 'Shows spinning ring with "Processing..." text and disabled styling.',
        codeReact: `export const LoadingButtonPreview = () => (
  <button disabled className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] opacity-80 cursor-wait">
    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
    <span>Processing Order...</span>
  </button>
);`,
        codeHtml: `<button class="btn-loading" disabled>...</button>`,
      },
    ],
    relatedComponents: ['loading-spinner', 'primary-button'],
  },
  {
    id: 'download-button',
    name: 'Download Button',
    category: 'buttons',
    description: 'Specialized action button featuring a downward arrow icon, file size, or format badge explicitly communicating a file download.',
    purpose: 'Assure users that clicking will initiate a local file transfer, indicating file type and size up front.',
    whatIsIt: 'A call to action button augmented with download iconography and metadata chips.',
    whatIsItUsedFor: 'PDF exports, software installer downloads, dataset downloads, and creative studio asset exports.',
    whereToUse: 'Export modals, resource pages, and software release release pages.',
    advantages: [
      'Sets clear expectations about file download behavior',
      'Displays file format (e.g. .ZIP, .PDF) and size (14.2 MB) to avoid surprises',
      'Increases trust and click-through rates',
    ],
    difficulty: 'beginner',
    tags: ['Download', 'Export', 'File', 'PDF', 'Asset'],
    popular: false,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'neo-download',
        name: 'Neo Download Pill',
        description: 'Vibrant download button with file type chip.',
        codeReact: `export const DownloadButtonPreview = () => (
  <button className="flex items-center gap-2.5 px-4 py-2 bg-[#A78BFA] hover:bg-[#8B5CF6] hover:text-white text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
    <span>⬇</span>
    <span>Download Package</span>
    <span className="px-1.5 py-0.5 bg-white text-black text-[10px] rounded border border-black">.ZIP 12MB</span>
  </button>
);`,
        codeHtml: `<button class="btn-download">...</button>`,
      },
    ],
    relatedComponents: ['primary-button', 'copy-button'],
  },
  {
    id: 'copy-button',
    name: 'Copy Button',
    category: 'buttons',
    description: 'Compact clipboard utility button that copies associated text/code to the system clipboard and flashes a "Copied!" confirmation checkmark.',
    purpose: 'Allow effortless 1-click copying of code snippets, API keys, referral links, and color values.',
    whatIsIt: 'A button that reads text via `navigator.clipboard.writeText` and temporarily updates icon and label to a green checkmark.',
    whatIsItUsedFor: 'Code snippet blocks, wallet addresses, sharing links, and design color values.',
    whereToUse: 'Top-right corner of code blocks and adjacent to read-only input keys.',
    advantages: [
      'Eliminates manual text highlight errors and truncated copy mistakes',
      'Immediate positive feedback confirms successful copy',
      'Compact size embeds easily into headers and pre blocks',
    ],
    difficulty: 'beginner',
    tags: ['Copy Button', 'Clipboard', 'Code Block', 'Feedback', 'Checkmark'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'animated-copy-btn',
        name: 'Animated Feedback Copy',
        description: 'Copies sample text and flips to a green "Copied!" checkmark for 2 seconds.',
        codeReact: `export const CopyButtonPreview = () => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black transition cursor-pointer \${
        copied ? 'bg-[#4ADE80] text-black shadow-none' : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5'
      }\`}
    >
      <span>{copied ? '✓' : ''}</span>
      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
    </button>
  );
};`,
        codeHtml: `<button class="btn-copy">Copy Code</button>`,
      },
    ],
    relatedComponents: ['icon-button', 'toast-notification'],
  },
  {
    id: 'social-buttons',
    name: 'Social Authentication Buttons',
    category: 'buttons',
    description: 'Branded identity provider buttons allowing 1-click OAuth login and social registration via Google, GitHub, Apple, and Discord.',
    purpose: 'Reduce authentication friction by letting users sign in with their existing identity accounts.',
    whatIsIt: 'Full-width buttons styled with official brand logos and recognizable guidelines.',
    whatIsItUsedFor: 'Login and signup modals, checkout guest shortcuts, and account linking screens.',
    whereToUse: 'Top or bottom of authentication pages.',
    advantages: [
      'Eliminates password fatigue and forgotten credentials',
      'Significantly lifts signup conversion rates',
      'Verified email address from trusted OAuth providers',
    ],
    difficulty: 'intermediate',
    tags: ['Social Button', 'OAuth', 'Google', 'GitHub', 'Login'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'social-auth-cluster',
        name: 'OAuth Cluster',
        description: 'Stacked Google and GitHub buttons with clean borders and neo-brutalist shadows.',
        codeReact: `export const SocialButtonsPreview = () => (
  <div className="w-full max-w-xs space-y-2">
    <button className="w-full flex items-center justify-center gap-2.5 py-2 px-4 bg-white hover:bg-neutral-50 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
      <span className="font-mono text-sm">G</span>
      <span>Continue with Google</span>
    </button>
    <button className="w-full flex items-center justify-center gap-2.5 py-2 px-4 bg-neutral-900 hover:bg-black text-white font-black text-xs rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
      <span className="font-mono text-sm font-bold">GH</span>
      <span>Continue with GitHub</span>
    </button>
  </div>
);`,
        codeHtml: `<div class="social-buttons">...</div>`,
      },
    ],
    relatedComponents: ['primary-button', 'authentication-layout'],
  },
];
