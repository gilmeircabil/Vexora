import { UIComponentItem } from '../types.js';

export const ADVANCED_COMPONENTS: UIComponentItem[] = [
  {
    id: 'command-palette-advanced',
    name: 'Command Palette (Pro)',
    category: 'advanced',
    description: 'High-performance searchable modal dialog supporting fuzzy filtering, sub-command trees, keyboard navigation, and recent history.',
    purpose: 'Deliver instantaneous keyboard-driven control over an entire application without mouse clicks.',
    whatIsIt: 'A full-featured command center modal (⌘K) with multiple action categories and shortcut hints.',
    whatIsItUsedFor: 'Raycast-style application navigation, global search, and rapid shortcut execution.',
    whereToUse: 'Modern web applications and developer tools.',
    advantages: [
      'Transforms complex multi-menu navigation into a 2-second keystroke',
      'Fuzzy search finds relevant commands even with slight typos',
      'Shows keyboard shortcuts alongside each command to train users',
    ],
    difficulty: 'advanced',
    tags: ['Command Palette', 'Cmd+K', 'Keyboard First', 'Spotlight', 'Fuzzy Search'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'advanced-palette',
        name: 'Command Center with History',
        description: 'Centered search palette with Recent Commands and Action Categories.',
        codeReact: `export const AdvancedCommandPalettePreview = () => (
  <div className="w-full max-w-sm bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden text-xs">
    <div className="p-3 border-b-2 border-black flex items-center gap-2 bg-[#FAF7F2]">
      <span className="font-mono text-black font-black">&gt;</span>
      <input type="text" placeholder="Type a command or search..." className="w-full bg-transparent font-bold outline-none" defaultValue="toggle theme" />
    </div>
    <div className="p-2 space-y-1">
      <div className="p-2 bg-[#FACC15] border border-black rounded-lg flex justify-between items-center font-black">
        <span>Toggle Dark / Light Theme</span>
        <span className="font-mono text-[10px]">↵</span>
      </div>
      <div className="p-2 hover:bg-neutral-100 rounded-lg flex justify-between items-center font-bold text-neutral-600">
        <span>Open Component Library</span>
        <span className="font-mono text-[10px]">G L</span>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="advanced-command-palette">...</div>`,
      },
    ],
    relatedComponents: ['command-palette', 'search-input'],
  },
  {
    id: 'drag-and-drop',
    name: 'Drag and Drop (Draggable List)',
    category: 'advanced',
    description: 'Interactive reorderable list allowing items to be grabbed, lifted, and resequenced smoothly with immediate drop feedback.',
    purpose: 'Empower users to prioritize tasks, reorder navigation menus, or customize workspace columns visually.',
    whatIsIt: 'A list supporting pointer dragging with ghost preview and placeholder animations.',
    whatIsItUsedFor: 'Task prioritization, playlist ordering, playlist tracks, and form builder fields.',
    whereToUse: 'Kanban boards, task lists, and settings reordering.',
    advantages: [
      'Visually satisfying and intuitive manipulation',
      'Provides instantaneous reordering without typing sequence numbers',
      'Accessible keyboard reordering support (Space to grab, Arrows to move)',
    ],
    difficulty: 'advanced',
    tags: ['Drag and Drop', 'Reorder', 'Sortable', 'Draggable', 'List'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'draggable-list-preview',
        name: 'Draggable Priority Tasks',
        description: '3 items with grip handle dots and active dragging elevation.',
        codeReact: `export const DragAndDropPreview = () => (
  <div className="w-full max-w-xs space-y-2">
    <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-between text-xs font-black cursor-grab">
      <div className="flex items-center gap-2">
        <span className="text-neutral-400">⠿</span>
        <span>1. Refactor Navbar Components</span>
      </div>
      <span className="text-[10px] bg-yellow-200 px-1 rounded border border-black">High</span>
    </div>
    <div className="p-2.5 bg-[#FAF7F2] border-2 border-dashed border-black rounded-xl flex items-center gap-2 text-xs font-bold text-neutral-500">
      <span>⠿</span>
      <span>2. Update Accessibility Tests</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="drag-drop-list">...</div>`,
      },
    ],
    relatedComponents: ['kanban-board', 'drag-and-drop-upload'],
  },
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    category: 'advanced',
    description: 'Multi-column workflow board where cards move through status lanes (Backlog, In Progress, Review, Completed).',
    purpose: 'Visualize team workflow, optimize work-in-progress (WIP) limits, and track task lifecycles.',
    whatIsIt: 'Horizontal columns holding stacked task cards that can be dragged between stages.',
    whatIsItUsedFor: 'Software sprint planning, bug tracking, applicant tracking (ATS), and content pipelines.',
    whereToUse: 'Project management tools and sprint planning views.',
    advantages: [
      'Complete visibility into team workload distribution and bottlenecks',
      'Cards surface assignees, due dates, tags, and subtask checklists',
      'Flexible columns can match any organizational workflow',
    ],
    difficulty: 'advanced',
    tags: ['Kanban Board', 'Lanes', 'Workflow', 'Agile', 'Sprint'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'mini-kanban-board',
        name: 'Mini 2-Column Kanban Lane',
        description: 'Two columns (To Do & In Progress) with task cards.',
        codeReact: `export const KanbanBoardPreview = () => (
  <div className="flex gap-3 max-w-md bg-[#FAF7F2] p-3 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] overflow-x-auto">
    <div className="w-40 bg-white border-2 border-black rounded-xl p-2.5 space-y-2 shrink-0">
      <div className="flex justify-between items-center text-xs font-black">
        <span>To Do (2)</span>
        <span className="text-xs">+</span>
      </div>
      <div className="p-2 bg-[#FAF7F2] border border-black rounded-lg text-[11px] font-bold shadow-[1px_1px_0px_#000]">
        <p className="font-black text-black">Audit contrast</p>
        <span className="text-[9px] text-neutral-500 font-mono">WCAG AAA</span>
      </div>
    </div>
    <div className="w-40 bg-white border-2 border-black rounded-xl p-2.5 space-y-2 shrink-0">
      <div className="flex justify-between items-center text-xs font-black">
        <span>In Progress (1)</span>
      </div>
      <div className="p-2 bg-[#FACC15] border border-black rounded-lg text-[11px] font-bold shadow-[1px_1px_0px_#000]">
        <p className="font-black text-black">Playground live</p>
        <span className="text-[9px] bg-black text-white px-1 rounded">Dev</span>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="kanban-board">...</div>`,
      },
    ],
    relatedComponents: ['drag-and-drop', 'kanban-dashboard'],
  },
  {
    id: 'resizable-panels',
    name: 'Resizable Panels',
    category: 'advanced',
    description: 'Split container with a draggable divider handle allowing users to resize adjacent workspace panels horizontally or vertically.',
    purpose: 'Give users control over their workspace layout (e.g. expand code editor while shrinking file tree).',
    whatIsIt: 'Two or more panel panes separated by a draggable splitter bar with hover highlights.',
    whatIsItUsedFor: 'Code playgrounds, design editors, terminal drawers, and documentation sidebars.',
    whereToUse: 'IDE workspaces, preview playgrounds, and complex split views.',
    advantages: [
      'Empowers users to prioritize whatever content needs focus right now',
      'Smooth mouse dragging with min/max constraint clamping',
      'Remembers user layout preference across sessions',
    ],
    difficulty: 'advanced',
    tags: ['Resizable', 'Splitter', 'Panels', 'Workspace', 'Layout'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'horizontal-resizable',
        name: 'Horizontal Split Panels',
        description: 'Left editor pane and right preview pane separated by a draggable grab handle.',
        codeReact: `export const ResizablePanelsPreview = () => (
  <div className="max-w-md h-32 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] flex overflow-hidden">
    <div className="w-1/2 p-3 bg-neutral-900 text-neutral-200 font-mono text-[10px] space-y-1">
      <p className="text-neutral-500">// Editor</p>
      <p className="text-yellow-400">&lt;Button variant="neo" /&gt;</p>
    </div>
    <div className="w-2 bg-[#FACC15] border-x border-black flex items-center justify-center cursor-col-resize hover:bg-amber-400">
      <span className="w-0.5 h-4 bg-black rounded-full"></span>
    </div>
    <div className="flex-1 p-3 flex items-center justify-center bg-[#FAF7F2]">
      <button className="px-3 py-1 bg-[#FACC15] border border-black rounded font-black text-xs shadow-[1px_1px_0px_#000]">
        Preview
      </button>
    </div>
  </div>
);`,
        codeHtml: `<div class="resizable-panels">...</div>`,
      },
    ],
    relatedComponents: ['split-view', 'code-editor'],
  },
  {
    id: 'split-view',
    name: 'Split View (Diff / Compare)',
    category: 'advanced',
    description: 'Side-by-side or stacked split comparison container displaying differences between two versions or before/after assets.',
    purpose: 'Highlight additions and deletions in code diffs, or compare image enhancement before vs after.',
    whatIsIt: 'A container with synchronized scrolling or sliding before/after curtain handle.',
    whatIsItUsedFor: 'Git pull request code reviews, image restoration before/after, and translation comparators.',
    whereToUse: 'Code review screens, AI image restoration tools, and translation editors.',
    advantages: [
      'Immediate visual verification of modifications',
      'Synchronized scrolling keeps parallel lines aligned',
      'Color coding (Green = Added, Red = Removed) communicates intent',
    ],
    difficulty: 'intermediate',
    tags: ['Split View', 'Diff', 'Compare', 'Before/After', 'Side-by-Side'],
    popular: false,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'code-diff-preview',
        name: 'Code Diff Comparison',
        description: 'Red deleted line and green added line in side-by-side view.',
        codeReact: `export const SplitViewPreview = () => (
  <div className="max-w-md bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] overflow-hidden text-xs font-mono">
    <div className="bg-red-50 border-b border-red-200 p-2 text-rose-800 flex gap-2">
      <span className="font-black">-</span>
      <span>const radius = '4px';</span>
    </div>
    <div className="bg-emerald-50 p-2 text-emerald-800 flex gap-2">
      <span className="font-black">+</span>
      <span>const radius = '12px'; // Neo-brutalist standard</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="split-diff">...</div>`,
      },
    ],
    relatedComponents: ['resizable-panels', 'code-editor'],
  },
  {
    id: 'calendar',
    name: 'Calendar (Event Scheduler)',
    category: 'advanced',
    description: 'Full-size monthly and weekly schedule grid displaying booked events, deadlines, color-coded badges, and quick-add slots.',
    purpose: 'Manage time-based schedules, team appointments, content publishing calendars, and project milestones.',
    whatIsIt: 'A grid of 7-day columns and multi-week rows with event pills in date cells.',
    whatIsItUsedFor: 'Google Calendar / Outlook alternatives, editorial calendars, and room booking systems.',
    whereToUse: 'Event scheduling and project timeline pages.',
    advantages: [
      'Unmatched spatial visualization of time allocation and open slots',
      'Supports dragging events to reschedule dates',
      'Multiple view switches (Month, Week, Day, Agenda)',
    ],
    difficulty: 'advanced',
    tags: ['Calendar', 'Schedule', 'Events', 'Appointments', 'Agenda'],
    popular: true,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'event-calendar-preview',
        name: 'Event Calendar Grid Cell',
        description: 'Mini calendar cell with 2 color-coded event pill badges.',
        codeReact: `export const CalendarPreview = () => (
  <div className="max-w-xs bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] p-4 text-xs space-y-3">
    <div className="flex justify-between items-center font-black">
      <span>Friday, Nov 6, 2026</span>
      <span className="px-2 py-0.5 bg-[#FACC15] border border-black rounded text-[10px]">Today</span>
    </div>
    <div className="space-y-1.5 font-bold">
      <div className="p-2 bg-blue-50 border-l-4 border-blue-600 rounded text-blue-900">
        <p className="font-black">Design System Standup</p>
        <span className="text-[10px] text-blue-700 font-mono">10:00 AM – 10:30 AM</span>
      </div>
      <div className="p-2 bg-purple-50 border-l-4 border-purple-600 rounded text-purple-900">
        <p className="font-black">UI Component Release</p>
        <span className="text-[10px] text-purple-700 font-mono">2:00 PM – 3:00 PM</span>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="calendar-widget">...</div>`,
      },
    ],
    relatedComponents: ['date-picker', 'timeline'],
  },
  {
    id: 'file-explorer',
    name: 'File Explorer (Tree View)',
    category: 'advanced',
    description: 'Hierarchical directory tree with expanding/collapsing folder chevrons, filetype icons, and selection highlights.',
    purpose: 'Navigate nested project folders, document archives, and asset repositories with deep nesting.',
    whatIsIt: 'A nested recursive tree list with folder and file glyphs.',
    whatIsItUsedFor: 'VS Code style file explorers, Google Drive folders, and documentation table of contents.',
    whereToUse: 'Developer editors, document managers, and file upload managers.',
    advantages: [
      'Handles arbitrary directory nesting depth cleanly',
      'Expanding and collapsing keeps tree tidy',
      'Instantly indicates file extensions (.tsx, .css, .json) with specialized icons',
    ],
    difficulty: 'intermediate',
    tags: ['File Explorer', 'Tree View', 'Folders', 'Hierarchy', 'Files'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'tree-view-preview',
        name: 'Nested File Tree',
        description: 'Folder with expanded sub-items and TSX/CSS file rows.',
        codeReact: `export const FileExplorerPreview = () => (
  <div className="w-56 bg-neutral-900 text-neutral-300 p-3 rounded-2xl border-2 border-black font-mono text-xs space-y-1 shadow-[4px_4px_0px_#000]">
    <div className="font-bold text-white text-[11px] mb-2 uppercase tracking-wider">Explorer</div>
    <div className="text-yellow-400 font-bold flex items-center gap-1.5 cursor-pointer">
      <span>▼</span> <span>src/components</span>
    </div>
    <div className="pl-4 space-y-1 text-neutral-400">
      <div className="flex items-center gap-1.5 hover:text-white cursor-pointer"><span className="text-blue-400 font-mono">::</span> Navbar.tsx</div>
      <div className="flex items-center gap-1.5 text-white bg-neutral-800 px-1 rounded cursor-pointer"><span className="text-blue-400 font-mono">::</span> Button.tsx</div>
      <div className="flex items-center gap-1.5 hover:text-white cursor-pointer"><span className="text-pink-400 font-mono">::</span> styles.css</div>
    </div>
  </div>
);`,
        codeHtml: `<div class="file-tree">...</div>`,
      },
    ],
    relatedComponents: ['context-menu', 'breadcrumbs'],
  },
  {
    id: 'image-gallery',
    name: 'Image Gallery (Masonry / Grid)',
    category: 'advanced',
    description: 'Responsive media grid supporting lightbox zoom overlays, captions, tags, and masonry dynamic height balancing.',
    purpose: 'Showcase visual portfolios, product photos, wallpapers, and design inspirations beautifully.',
    whatIsIt: 'A CSS masonry or responsive grid of image cards with hover details.',
    whatIsItUsedFor: 'Design inspiration feeds (Dribbble/Behance), photography showcases, and asset libraries.',
    whereToUse: 'Creative portfolios, wallpaper galleries, and product photo grids.',
    advantages: [
      'Masonry layout eliminates awkward whitespace between varied aspect ratios',
      'Clicking expands image into high-resolution lightbox modal',
      'Lazy loading saves bandwidth until images scroll into view',
    ],
    difficulty: 'intermediate',
    tags: ['Image Gallery', 'Masonry', 'Lightbox', 'Photos', 'Portfolio'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'masonry-gallery-preview',
        name: 'Mini Masonry Preview',
        description: '2-column dynamic height visual showcase with hover chips.',
        codeReact: `export const ImageGalleryPreview = () => (
  <div className="max-w-xs grid grid-cols-2 gap-2 bg-white p-3 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
    <div className="h-28 bg-[#38BDF8] rounded-xl border border-black flex items-center justify-center font-black text-white text-xs">
      Design #01
    </div>
    <div className="h-36 bg-[#FACC15] rounded-xl border border-black flex items-center justify-center font-black text-black text-xs">
      Poster #02
    </div>
  </div>
);`,
        codeHtml: `<div class="image-gallery">...</div>`,
      },
    ],
    relatedComponents: ['image-card', 'carousel'],
  },
  {
    id: 'carousel',
    name: 'Carousel (Slider)',
    category: 'advanced',
    description: 'Horizontal sliding viewport with Prev/Next chevron buttons, dot pagination, and touch swipe gesture navigation.',
    purpose: 'Present multiple featured slides, testimonials, or products within a single fixed screen area.',
    whatIsIt: 'A track of slides with horizontal overflow hidden and smooth transition animation.',
    whatIsItUsedFor: 'Hero banner showcases, client reviews slider, featured courses, and mobile onboarding cards.',
    whereToUse: 'Landing page heroes and customer testimonial sections.',
    advantages: [
      'Preserves vertical page space while holding 5+ promotional slides',
      'Dot pagination indicates total slide count and active index',
      'Autoplay with pause-on-hover accessibility respect',
    ],
    difficulty: 'intermediate',
    tags: ['Carousel', 'Slider', 'Swiper', 'Hero Slider', 'Slideshow'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'slider-carousel-preview',
        name: 'Interactive Slide Card',
        description: 'Card with Previous / Next arrow pills and dot indicators.',
        codeReact: `export const CarouselPreview = () => {
  const [slide, setSlide] = React.useState(0);
  const slides = ['Explore 100+ UI Components', 'Real-Time Interactive Playground', '100% Free & Open-Source'];
  return (
    <div className="max-w-xs bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] text-center space-y-3">
      <div className="h-16 flex items-center justify-center font-black text-xs text-black">
        {slides[slide]}
      </div>
      <div className="flex justify-between items-center">
        <button onClick={() => setSlide((slide - 1 + slides.length) % slides.length)} className="w-6 h-6 rounded-lg border border-black bg-neutral-100 flex items-center justify-center font-black text-xs">‹</button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <span key={i} className={\`w-2 h-2 rounded-full border border-black \${slide === i ? 'bg-[#FACC15]' : 'bg-neutral-200'}\`} />
          ))}
        </div>
        <button onClick={() => setSlide((slide + 1) % slides.length)} className="w-6 h-6 rounded-lg border border-black bg-neutral-100 flex items-center justify-center font-black text-xs">›</button>
      </div>
    </div>
  );
};`,
        codeHtml: `<div class="carousel">...</div>`,
      },
    ],
    relatedComponents: ['image-gallery', 'testimonial-card'],
  },
  {
    id: 'rich-text-editor',
    name: 'Rich Text Editor (WYSIWYG)',
    category: 'advanced',
    description: 'Formatted content composition canvas with top formatting toolbar for Bold, Italic, Headings, Code, Links, and Lists.',
    purpose: 'Empower users to format long-form articles, documentation posts, and notes with rich formatting.',
    whatIsIt: 'A contenteditable or ProseMirror/TipTap powered editor with styling controls.',
    whatIsItUsedFor: 'Blog publishing platforms, community forum posts, support ticket responses, and CMS editors.',
    whereToUse: 'Content creation dashboards and forum posting forms.',
    advantages: [
      'Visual formatting eliminates need to memorize Markdown syntax',
      'Supports headings, blockquotes, bulleted lists, and embedded images',
      'Outputs clean semantic HTML or structured JSON',
    ],
    difficulty: 'advanced',
    tags: ['Rich Text Editor', 'WYSIWYG', 'Prose', 'Formatting', 'Toolbar'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'editor-toolbar-preview',
        name: 'WYSIWYG Editor with Toolbar',
        description: 'Editor toolbar with Bold, Italic, Link, and Code formatting buttons.',
        codeReact: `export const RichTextEditorPreview = () => (
  <div className="max-w-sm bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] overflow-hidden text-xs">
    <div className="p-2 bg-[#FAF7F2] border-b-2 border-black flex gap-1 items-center font-black">
      <button className="w-6 h-6 border border-black rounded bg-white font-bold hover:bg-neutral-100">B</button>
      <button className="w-6 h-6 border border-black rounded bg-white italic hover:bg-neutral-100">I</button>
      <button className="w-6 h-6 border border-black rounded bg-white underline hover:bg-neutral-100">U</button>
      <div className="w-[1px] h-4 bg-black/20 mx-1"></div>
      <button className="px-2 h-6 border border-black rounded bg-white text-[10px] hover:bg-neutral-100">H1</button>
      <button className="px-2 h-6 border border-black rounded bg-white text-[10px] hover:bg-neutral-100">Link</button>
    </div>
    <div className="p-3 min-h-[60px] font-medium text-neutral-800">
      <p>Start writing clean, structured documentation with live preview...</p>
    </div>
  </div>
);`,
        codeHtml: `<div class="rich-text-editor">...</div>`,
      },
    ],
    relatedComponents: ['textarea', 'code-editor'],
  },
  {
    id: 'chat-interface',
    name: 'Chat Interface (Message Thread)',
    category: 'advanced',
    description: 'Conversation stream featuring alternating user and bot bubbles, markdown code rendering, typing indicators, and message input.',
    purpose: 'Facilitate natural language conversations between users or with AI copilots.',
    whatIsIt: 'A scrolling message history container with bottom pinned text bar and send action.',
    whatIsItUsedFor: 'AI chat assistants (ChatGPT style), customer live support, and direct team messaging.',
    whereToUse: 'AI chat pages and support ticket windows.',
    advantages: [
      'Intuitive conversational messaging format',
      'Distinguishes user prompts from assistant responses with bubble alignment',
      'Supports markdown formatting and inline copyable code blocks',
    ],
    difficulty: 'advanced',
    tags: ['Chat', 'Messaging', 'AI Assistant', 'Conversation', 'Bot'],
    popular: true,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'neo-chat-thread',
        name: 'Neo AI Chat Message Stream',
        description: 'User bubble on right, AI assistant bubble with yellow chip on left.',
        codeReact: `export const ChatInterfacePreview = () => (
  <div className="max-w-xs bg-white border-2 border-black rounded-2xl p-3 shadow-[4px_4px_0px_#000] space-y-2 text-xs">
    <div className="flex justify-end">
      <div className="bg-[#FAF7F2] border-2 border-black rounded-xl p-2 font-bold max-w-[85%] shadow-[1.5px_1.5px_0px_#000]">
        How do I build a accessible navbar?
      </div>
    </div>
    <div className="flex justify-start">
      <div className="bg-[#FACC15] border-2 border-black rounded-xl p-2 font-bold max-w-[85%] shadow-[1.5px_1.5px_0px_#000]">
        Use semantic &lt;nav&gt;, clear ARIA labels, and keyboard tab focus!
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="chat-thread">...</div>`,
      },
    ],
    relatedComponents: ['text-input', 'icon-button'],
  },
  {
    id: 'code-editor',
    name: 'Code Editor (Syntax Highlighter)',
    category: 'advanced',
    description: 'Embedded source code viewer featuring syntax highlighting, line numbers, language badge, and 1-click clipboard copy button.',
    purpose: 'Display and format programming code with maximum readability and copy ergonomics.',
    whatIsIt: 'A dark or light container styled with monospaced font, colored syntax tokens, and line counter.',
    whatIsItUsedFor: 'Developer documentation, API reference guides, component code snippets, and coding tutorials.',
    whereToUse: 'Documentation portals, UI libraries, and technical articles.',
    advantages: [
      'Syntax coloring makes code structure instantly decipherable',
      'Line numbers make referencing specific code lines effortless',
      'Dedicated copy button prevents accidental whitespace formatting errors',
    ],
    difficulty: 'intermediate',
    tags: ['Code Editor', 'Syntax Highlighting', 'Code Block', 'Monaco', 'Developer'],
    popular: true,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'dark-syntax-block',
        name: 'Monokai Syntax Code Block',
        description: 'Dark container with colored syntax tokens and copy button.',
        codeReact: `export const CodeEditorPreview = () => (
  <div className="max-w-sm bg-neutral-900 text-neutral-200 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] overflow-hidden text-xs font-mono">
    <div className="px-3 py-2 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center text-[10px]">
      <span className="text-yellow-400 font-bold">Button.tsx</span>
      <span className="text-neutral-400">Copy</span>
    </div>
    <div className="p-3 space-y-1">
      <p><span className="text-pink-400">export</span> <span className="text-blue-400">const</span> Button = () =&gt; (</p>
      <p className="pl-4 text-emerald-400">&lt;button className="neo-btn"&gt;</p>
      <p className="pl-4">&lt;/button&gt;</p>
      <p>);</p>
    </div>
  </div>
);`,
        codeHtml: `<pre class="code-editor"><code>...</code></pre>`,
      },
    ],
    relatedComponents: ['copy-button', 'rich-text-editor'],
  },
  {
    id: 'search-filters',
    name: 'Search Filters (Facet Sidebar)',
    category: 'advanced',
    description: 'Multi-faceted filter panel combining search query, category checkboxes, price sliders, and sort options.',
    purpose: 'Narrow down thousands of catalog items into exact matches based on specific criteria.',
    whatIsIt: 'A sidebar or drawer loaded with multiple coordinated form filters.',
    whatIsItUsedFor: 'E-commerce catalogs, component libraries, job boards, and real estate portals.',
    whereToUse: 'Left rail of catalog pages and store search results.',
    advantages: [
      'Empowers users to combine multiple criteria (e.g. Navigation + Beginner)',
      'Active filter tag pills show current filter state clearly',
      'Single-click "Reset All" clears all criteria instantly',
    ],
    difficulty: 'intermediate',
    tags: ['Search Filters', 'Facets', 'Catalog', 'Refine', 'Filter'],
    popular: true,
    dateAdded: '2026-01-22',
    variations: [
      {
        id: 'facet-filter-panel',
        name: 'Multi-Facet Filter Rail',
        description: 'Categories checklist and difficulty pill filters.',
        codeReact: `export const SearchFiltersPreview = () => (
  <div className="max-w-xs bg-white p-4 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] text-xs space-y-3">
    <div className="flex justify-between items-center font-black">
      <span>Filters</span>
      <button className="text-[10px] text-blue-600 hover:underline">Reset</button>
    </div>
    <div className="space-y-1 font-bold">
      <p className="text-[10px] uppercase text-neutral-400 font-black">Difficulty</p>
      <div className="flex gap-1.5">
        <span className="px-2 py-0.5 bg-[#4ADE80] border border-black rounded text-[10px]">Beginner</span>
        <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-[10px]">Advanced</span>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="search-filters">...</div>`,
      },
    ],
    relatedComponents: ['search-input', 'checkbox', 'select-dropdown'],
  },
  {
    id: 'multi-step-wizard',
    name: 'Multi-Step Wizard',
    category: 'advanced',
    description: 'Guided sequential questionnaire orchestrating screen transitions, progress calculation, and final summary confirmation.',
    purpose: 'Walk new users through setup configuration without cognitive fatigue.',
    whatIsIt: 'A step-by-step onboarding flow with forward/backward validation gates.',
    whatIsItUsedFor: 'New account setup, workspace creation, cloud server provisioning, and checkout.',
    whereToUse: 'Onboarding and complex creation flows.',
    advantages: [
      'Reduces complexity by presenting 1 simple choice per screen',
      'Celebratory completion screen rewards user progress',
      'Validates each stage before allowing forward advancement',
    ],
    difficulty: 'advanced',
    tags: ['Wizard', 'Multi-step', 'Onboarding', 'Walkthrough', 'Setup'],
    popular: true,
    dateAdded: '2026-01-22',
    variations: [
      {
        id: 'wizard-card-preview',
        name: 'Setup Wizard Modal',
        description: 'Question screen with selectable visual cards and progress stepper.',
        codeReact: `export const MultiStepWizardPreview = () => (
  <div className="max-w-xs bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] space-y-3 text-xs">
    <div className="flex justify-between font-black text-neutral-500">
      <span>Step 1 of 4</span>
      <span>25%</span>
    </div>
    <h4 className="font-black text-sm text-black">What are you building?</h4>
    <div className="space-y-1.5 font-bold">
      <div className="p-2 bg-[#FACC15] border border-black rounded-lg">Web Application</div>
      <div className="p-2 border border-black rounded-lg hover:bg-neutral-50">Mobile Native App</div>
    </div>
    <button className="w-full py-1.5 bg-[#4ADE80] font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">Next Step →</button>
  </div>
);`,
        codeHtml: `<div class="wizard">...</div>`,
      },
    ],
    relatedComponents: ['step-navigation', 'multi-step-form'],
  },
  {
    id: 'undo-and-redo',
    name: 'Undo and Redo (History Manager)',
    category: 'advanced',
    description: 'State history controller maintaining an immutable action stack allowing users to step backward and forward through design or text changes.',
    purpose: 'Eliminate user anxiety by providing instant recovery from accidental modifications or deletions.',
    whatIsIt: 'A pair of curved arrow buttons connected to an undo/redo history stack (⌘Z / ⇧⌘Z).',
    whatIsItUsedFor: 'Design studio canvases, rich text document editors, and form builders.',
    whereToUse: 'Creative studio top toolbars and drawing canvases.',
    advantages: [
      'Gives users confidence to experiment freely without fear of data loss',
      'Supports standard keyboard shortcuts (⌘Z and ⌘Y / ⇧⌘Z)',
      'Disabled state clearly communicates when at the boundary of history',
    ],
    difficulty: 'intermediate',
    tags: ['Undo', 'Redo', 'History', 'State Management', 'Cmd+Z'],
    popular: false,
    dateAdded: '2026-01-23',
    variations: [
      {
        id: 'undo-redo-pill',
        name: 'Undo / Redo Toolbar Pill',
        description: 'Curved arrow buttons with active and disabled states.',
        codeReact: `export const UndoRedoPreview = () => (
  <div className="inline-flex items-center gap-1 p-1 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-black">
    <button aria-label="Undo" className="px-2.5 py-1 rounded-lg hover:bg-neutral-100 flex items-center gap-1">
      <span>↩</span>
      <span className="text-[10px] font-mono text-neutral-400">⌘Z</span>
    </button>
    <div className="w-[1px] h-4 bg-black/20"></div>
    <button aria-label="Redo" className="px-2.5 py-1 rounded-lg text-neutral-400 cursor-not-allowed flex items-center gap-1">
      <span>↪</span>
      <span className="text-[10px] font-mono text-neutral-300">⇧⌘Z</span>
    </button>
  </div>
);`,
        codeHtml: `<div class="undo-redo">...</div>`,
      },
    ],
    relatedComponents: ['icon-button', 'rich-text-editor'],
  },
];
