import { UIComponentItem } from '../types.js';

export const FEEDBACK_COMPONENTS: UIComponentItem[] = [
  {
    id: 'modal',
    name: 'Modal Dialog',
    category: 'feedback',
    description: 'Overlay window layered above the main viewport with a darkened backdrop, trapping keyboard focus until dismissed.',
    purpose: 'Demand the user’s full attention for critical decisions, forms, or confirmations without leaving the current URL.',
    whatIsIt: 'A centered pop-up container rendered via a React Portal with backdrop overlay.',
    whatIsItUsedFor: 'Authentication dialogs, new project creation, image lightbox previews, and terms acceptance.',
    whereToUse: 'High-priority actions requiring focused input.',
    advantages: [
      'Focus trapping prevents background tab index bleed',
      'Closing on Escape key and backdrop click provides comfortable ergonomics',
      'Prevents accidental loss of page context',
    ],
    difficulty: 'intermediate',
    tags: ['Modal', 'Dialog', 'Overlay', 'Popup', 'Portal'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'neo-modal',
        name: 'Neo Brutalist Modal Dialog',
        description: 'Centered dialog with 3px border, 6px shadow, header with X button, and action footer.',
        codeReact: `export const ModalPreview = () => (
  <div className="w-full max-w-sm bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] p-5 space-y-4">
    <div className="flex justify-between items-center border-b-2 border-black pb-3">
      <h3 className="font-black text-sm text-black">Create New UI Project</h3>
      <button className="w-6 h-6 rounded-lg border border-black bg-neutral-100 flex items-center justify-center font-bold text-xs hover:bg-neutral-200">✕</button>
    </div>
    <div className="space-y-2 text-xs">
      <label className="font-bold text-black block">Project Title</label>
      <input type="text" placeholder="My Awesome Design System" className="w-full px-3 py-2 border-2 border-black rounded-xl outline-none" />
    </div>
    <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
      <button className="px-3 py-1.5 text-xs font-black text-neutral-600 hover:text-black">Cancel</button>
      <button className="px-4 py-1.5 bg-[#4ADE80] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">Create Project</button>
    </div>
  </div>
);`,
        codeHtml: `<div class="modal-dialog">...</div>`,
      },
    ],
    relatedComponents: ['alert-dialog', 'confirmation-dialog', 'drawer'],
  },
  {
    id: 'alert-dialog',
    name: 'Alert Dialog',
    category: 'feedback',
    description: 'Urgent modal dialog interrupting the user to communicate critical system alerts or irreversible security notices.',
    purpose: 'Deliver critical warnings that require explicit user acknowledgement before continuing.',
    whatIsIt: 'A high-contrast dialog with warning symbol and affirmative acknowledge button.',
    whatIsItUsedFor: 'Session expiry warnings, unsaved changes alerts, and permission revocation.',
    whereToUse: 'Critical error alerts and session timeouts.',
    advantages: [
      'Cannot be casually dismissed by clicking outside',
      'Accessible `role="alertdialog"` communicates urgency to assistive tech',
      'Unmistakable visual warning badge',
    ],
    difficulty: 'intermediate',
    tags: ['Alert Dialog', 'Warning', 'Urgent', 'System Alert'],
    popular: false,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'warning-alert-dialog',
        name: 'Urgent Warning Dialog',
        description: 'Warning dialog with yellow alert icon and Acknowledge button.',
        codeReact: `export const AlertDialogPreview = () => (
  <div className="max-w-xs bg-white border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000] p-5 text-center space-y-3">
    <div className="w-12 h-12 mx-auto rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_#000]">
      ⚠️
    </div>
    <h4 className="font-black text-sm text-black">Session About to Expire</h4>
    <p className="text-xs text-neutral-600">Your secure session will timeout in 2 minutes due to inactivity. Would you like to stay logged in?</p>
    <button className="w-full py-2 bg-[#FACC15] hover:bg-[#EAB308] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
      Keep Me Logged In
    </button>
  </div>
);`,
        codeHtml: `<div class="alert-dialog">...</div>`,
      },
    ],
    relatedComponents: ['modal', 'confirmation-dialog', 'banner-alert'],
  },
  {
    id: 'confirmation-dialog',
    name: 'Confirmation Dialog',
    category: 'feedback',
    description: 'Destructive confirmation modal asking users to verify high-consequence operations like account deletion or repository pruning.',
    purpose: 'Prevent accidental irreversible data loss by requiring double-confirmation.',
    whatIsIt: 'A dialog with red danger styling, clear description of consequences, and explicit Delete/Cancel actions.',
    whatIsItUsedFor: 'Account deletion, discarding uncommitted work, and removing database entries.',
    whereToUse: 'Any destructive action trigger.',
    advantages: [
      'Stops irreversible accidental clicks cold',
      'Default focus placed safely on "Cancel" rather than "Delete"',
      'Can require typing confirmation text (e.g. type repo name to confirm)',
    ],
    difficulty: 'intermediate',
    tags: ['Confirmation', 'Delete', 'Danger', 'Destructive', 'Dialog'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'destructive-confirmation',
        name: 'Destructive Delete Confirmation',
        description: 'Red accented dialog asking for confirmation before deleting a project.',
        codeReact: `export const ConfirmationDialogPreview = () => (
  <div className="max-w-xs bg-white border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000] p-5 space-y-3">
    <div className="w-10 h-10 rounded-full bg-rose-100 border-2 border-black flex items-center justify-center text-rose-600 font-black text-base">
      🗑️
    </div>
    <h4 className="font-black text-sm text-black">Delete this component?</h4>
    <p className="text-xs text-neutral-600">This action cannot be undone. This component will be permanently removed from your catalog.</p>
    <div className="flex gap-2 pt-2">
      <button className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-black font-black text-xs rounded-xl border-2 border-black">
        Cancel
      </button>
      <button className="flex-1 py-1.5 bg-[#F43F5E] hover:bg-rose-600 text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
        Delete
      </button>
    </div>
  </div>
);`,
        codeHtml: `<div class="confirm-dialog">...</div>`,
      },
    ],
    relatedComponents: ['modal', 'alert-dialog'],
  },
  {
    id: 'toast-notification',
    name: 'Toast Notification (Snackbar)',
    category: 'feedback',
    description: 'Temporary floating message card popping in at the corner of the screen to confirm an action without interrupting the user.',
    purpose: 'Provide non-blocking feedback confirming completed operations (e.g. "Saved to Favorites", "Link Copied!").',
    whatIsIt: 'A lightweight floating banner appearing for 3 to 5 seconds before smoothly fading out.',
    whatIsItUsedFor: 'Save confirmations, clipboard copies, network reconnect notices, and cart additions.',
    whereToUse: 'Top-right or bottom-right of viewport for asynchronous task confirmations.',
    advantages: [
      'Completely non-blocking — user continues working uninterrupted',
      'Auto-dismisses after a configurable timeout',
      'Supports undo actions directly inside the toast (e.g. "Undo")',
    ],
    difficulty: 'intermediate',
    tags: ['Toast', 'Snackbar', 'Notification', 'Popup', 'Floating'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'neo-toast',
        name: 'Neo Brutalist Success Toast',
        description: 'Green pill with checkmark icon and close button.',
        codeReact: `export const ToastPreview = () => (
  <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] text-xs font-black">
    <span className="w-5 h-5 rounded-md bg-[#4ADE80] border border-black flex items-center justify-center text-[10px]">✓</span>
    <span>Component code copied to clipboard!</span>
    <button className="text-neutral-400 hover:text-black ml-2 text-xs">✕</button>
  </div>
);`,
        codeHtml: `<div class="toast-notification">...</div>`,
      },
    ],
    relatedComponents: ['banner-alert', 'notification-center'],
  },
  {
    id: 'notification-center',
    name: 'Notification Center',
    category: 'feedback',
    description: 'Dropdown drawer cataloging recent alerts, mentions, system announcements, and updates with Mark-as-Read controls.',
    purpose: 'Give users a central hub to review past notifications they may have missed.',
    whatIsIt: 'A popup panel triggered by the bell icon displaying a list of unread and read alerts.',
    whatIsItUsedFor: 'GitHub notifications, team comments, product updates, and platform broadcasts.',
    whereToUse: 'Header navigation adjacent to user profile.',
    advantages: [
      'Preserves history of alerts even after toast notifications disappear',
      'Provides "Mark all as read" 1-click convenience',
      'Filters by Unread, Mentions, or System alerts',
    ],
    difficulty: 'intermediate',
    tags: ['Notification Center', 'Bell', 'Alerts', 'Inbox', 'Unread'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'bell-notification-drawer',
        name: 'Bell Notification Popover',
        description: 'Header notification tray with unread badge and action list.',
        codeReact: `export const NotificationCenterPreview = () => (
  <div className="w-72 bg-white border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000] p-3 text-xs space-y-2">
    <div className="flex justify-between items-center border-b border-black pb-2 font-black">
      <span>Notifications (3 unread)</span>
      <button className="text-[10px] text-blue-600 hover:underline">Mark all read</button>
    </div>
    <div className="space-y-1.5 font-bold">
      <div className="p-2 bg-[#FAF7F2] border border-black rounded-xl">
        <p className="text-black font-black">New Component Added</p>
        <p className="text-[11px] text-neutral-600">Bento Grid component is now live.</p>
        <span className="text-[9px] text-neutral-400 font-mono">10m ago</span>
      </div>
      <div className="p-2 hover:bg-neutral-50 rounded-xl">
        <p className="text-black">Welcome to VexoraMods!</p>
        <span className="text-[9px] text-neutral-400 font-mono">2h ago</span>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="notification-center">...</div>`,
      },
    ],
    relatedComponents: ['toast-notification', 'dropdown-menu'],
  },
  {
    id: 'drawer',
    name: 'Drawer (Slide-over Panel)',
    category: 'feedback',
    description: 'Off-canvas sheet sliding in smoothly from the edge of the screen (right, left, or bottom) to present secondary workflows.',
    purpose: 'Display deep contextual details or forms without navigating away from the current page.',
    whatIsIt: 'A panel pinned to screen edge with backdrop blur that slides in using CSS transform.',
    whatIsItUsedFor: 'Shopping cart drawer, mobile navigation menu, filter drawer, and detail inspector.',
    whereToUse: 'E-commerce carts, mobile menus, and item property inspectors.',
    advantages: [
      'Preserves current scroll and page context behind the backdrop',
      'Provides significantly more vertical room than a small modal',
      'Very natural touch swipe gesture to dismiss on mobile',
    ],
    difficulty: 'intermediate',
    tags: ['Drawer', 'Slide-over', 'Sheet', 'Cart', 'Off-canvas'],
    popular: true,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'slide-over-cart-drawer',
        name: 'Slide-Over Inspector Drawer',
        description: 'Right-pinned sheet with header, scrollable body, and action footer.',
        codeReact: `export const DrawerPreview = () => (
  <div className="w-72 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] p-4 flex flex-col justify-between h-64">
    <div>
      <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
        <h4 className="font-black text-xs text-black">Component Properties</h4>
        <button className="text-xs font-black">✕</button>
      </div>
      <p className="text-xs text-neutral-600 font-medium">Customize active properties, variants, and responsive states.</p>
    </div>
    <button className="w-full py-2 bg-[#FACC15] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
      Apply Changes
    </button>
  </div>
);`,
        codeHtml: `<div class="drawer-panel">...</div>`,
      },
    ],
    relatedComponents: ['modal', 'sidebar'],
  },
  {
    id: 'popover',
    name: 'Popover',
    category: 'feedback',
    description: 'Interactive rich content bubble anchored directly to a trigger element, supporting forms, rich text, and buttons.',
    purpose: 'Offer interactive micro-workflows (e.g. date picker, color picker, share popover) right where the trigger sits.',
    whatIsIt: 'A floating bubble positioned dynamically with popper/anchor math and pointer arrow.',
    whatIsItUsedFor: 'Color swatches, share link copy box, quick inline calculators, and filter popovers.',
    whereToUse: 'Toolbar buttons, color pickers, and inline action triggers.',
    advantages: [
      'Direct visual connection to the triggering element via anchor arrow',
      'Can host full interactive controls (inputs, buttons) unlike tooltips',
      'Dismisses smoothly on outside click or Escape key',
    ],
    difficulty: 'intermediate',
    tags: ['Popover', 'Bubble', 'Anchor', 'Popup', 'Interactive'],
    popular: false,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'share-popover',
        name: 'Share Link Popover',
        description: 'Popover containing input with copyable link and quick copy button.',
        codeReact: `export const PopoverPreview = () => (
  <div className="max-w-xs bg-white border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_#000] space-y-2 text-xs font-bold">
    <p className="text-black font-black">Share this component</p>
    <div className="flex gap-1.5">
      <input type="text" readOnly value="vexoramods.com/ui/btn" className="flex-1 px-2 py-1 bg-neutral-100 border border-black rounded-lg text-[10px] font-mono" />
      <button className="px-2.5 py-1 bg-[#FACC15] text-black font-black rounded-lg border border-black text-[10px]">Copy</button>
    </div>
  </div>
);`,
        codeHtml: `<div class="popover">...</div>`,
      },
    ],
    relatedComponents: ['tooltip', 'dropdown-menu'],
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'feedback',
    description: 'Non-interactive micro-label appearing on hover or keyboard focus to explain the meaning of an icon or truncated text.',
    purpose: 'Clarify iconography or provide supplementary context without consuming visible layout space.',
    whatIsIt: 'A small dark capsule appearing above or below an element on hover.',
    whatIsItUsedFor: 'Icon buttons (Save, Settings, Delete), keyboard shortcut indicators, and truncated table cells.',
    whereToUse: 'Icon buttons and compact toolbar controls.',
    advantages: [
      'Zero layout footprint when idle',
      'Prevents ambiguity for icon-only controls',
      'Provides accessible tooltip descriptions via `aria-describedby`',
    ],
    difficulty: 'beginner',
    tags: ['Tooltip', 'Hover Label', 'Hint', 'Micro-copy', 'Icon Label'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'dark-capsule-tooltip',
        name: 'Dark Capsule with Arrow',
        description: 'Tooltip hovering over an icon button with keyboard shortcut hint.',
        codeReact: `export const TooltipPreview = () => (
  <div className="flex flex-col items-center gap-1.5">
    <div className="px-2.5 py-1 bg-black text-white text-[10px] font-black rounded-lg shadow-md flex items-center gap-1.5">
      <span>Copy Source Code</span>
      <span className="text-neutral-400 font-mono text-[9px]">⌘C</span>
    </div>
    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border-2 border-black flex items-center justify-center font-black text-xs shadow-[1.5px_1.5px_0px_#000]">
      📋
    </div>
  </div>
);`,
        codeHtml: `<div class="tooltip-container">...</div>`,
      },
    ],
    relatedComponents: ['popover', 'icon-button'],
  },
  {
    id: 'banner-alert',
    name: 'Banner Alert (Callout Banner)',
    category: 'feedback',
    description: 'Prominent horizontal banner running across the top of a page or inside a container to communicate site-wide notices.',
    purpose: 'Notify all visitors about scheduled maintenance, new major versions, or account subscription alerts.',
    whatIsIt: 'A full-width banner container styled with high-visibility background color and call to action.',
    whatIsItUsedFor: 'Scheduled maintenance notices, promotional discounts, cookie consent, and broadcast announcements.',
    whereToUse: 'Top of page directly above or below navbar, or inside card containers.',
    advantages: [
      'Unmissable placement across the top of the viewport',
      'Includes direct action link (e.g. "Learn More", "Upgrade Now")',
      'Dismissible with an (X) button that remembers dismissal state',
    ],
    difficulty: 'beginner',
    tags: ['Banner Alert', 'Announcement', 'Notice', 'Top Bar', 'Callout'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'neo-announcement-banner',
        name: 'Neo Announcement Banner',
        description: 'Yellow notice banner with megaphone icon and action pill.',
        codeReact: `export const BannerAlertPreview = () => (
  <div className="w-full max-w-md px-4 py-2 bg-[#FACC15] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-between text-xs font-black">
    <div className="flex items-center gap-2">
      <span>📣</span>
      <span>VexoraMods UI Library 2.0 is now live!</span>
    </div>
    <span className="underline cursor-pointer hover:text-white">Explore →</span>
  </div>
);`,
        codeHtml: `<div class="banner-alert">...</div>`,
      },
    ],
    relatedComponents: ['toast-notification', 'alert-dialog'],
  },
  {
    id: 'loading-spinner',
    name: 'Loading Spinner',
    category: 'feedback',
    description: 'Rotating circular animation indicating that background work or data fetching is actively occurring.',
    purpose: 'Reassure the user that the application has not frozen while awaiting an asynchronous operation.',
    whatIsIt: 'An SVG ring with a rotating broken border created via CSS `@keyframes spin`.',
    whatIsItUsedFor: 'Button click states, in-page component fetching, and lazy-loaded image placeholders.',
    whereToUse: 'Inside buttons, empty card centers, and async content blocks.',
    advantages: [
      'Universal symbol for in-progress operations',
      'Extremely lightweight CSS animation with zero external dependencies',
      'Scales to any size from 12px (inline) to 64px (full-screen)',
    ],
    difficulty: 'beginner',
    tags: ['Spinner', 'Loading', 'Async', 'Animation', 'Pending'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'spinning-ring',
        name: 'Dual Ring Spinner',
        description: 'Smooth spinning circular ring with bold black border.',
        codeReact: `export const LoadingSpinnerPreview = () => (
  <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_#000] text-xs font-black">
    <div className="w-5 h-5 border-2 border-black border-t-[#FACC15] rounded-full animate-spin"></div>
    <span>Loading preview data...</span>
  </div>
);`,
        codeHtml: `<div class="spinner"></div>`,
      },
    ],
    relatedComponents: ['full-screen-loader', 'skeleton-loader', 'loading-button'],
  },
  {
    id: 'full-screen-loader',
    name: 'Full-Screen Loader',
    category: 'feedback',
    description: 'Immersive screen takeover with centered brand logo, spinner, and status text used during heavy initial loads.',
    purpose: 'Mask blank screens during major initial application bootstrap or file export processing.',
    whatIsIt: 'A fixed 100vw/100vh overlay displaying an animated brand icon and progress indicator.',
    whatIsItUsedFor: 'Initial single-page app boot, heavy WebAssembly module initialization, and bulk video rendering.',
    whereToUse: 'Root application level during app boot or export.',
    advantages: [
      'Eliminates jarring white flashes during heavy asset loading',
      'Reinforces brand identity with animated logo',
      'Prevents premature user interactions before app is ready',
    ],
    difficulty: 'intermediate',
    tags: ['Full-Screen Loader', 'Splash', 'Bootstrap', 'Loading', 'Overlay'],
    popular: false,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'brand-splash-loader',
        name: 'Brand Splash Loader',
        description: 'Centered box with animated pulsing brand logo and status text.',
        codeReact: `export const FullScreenLoaderPreview = () => (
  <div className="max-w-xs p-6 bg-[#FAF7F2] border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] text-center space-y-3">
    <div className="w-12 h-12 mx-auto rounded-xl bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-lg animate-bounce">
      VM
    </div>
    <p className="text-xs font-black text-black uppercase tracking-wider">Loading VexoraMods Studio...</p>
    <div className="w-32 mx-auto h-2 bg-white border border-black rounded-full overflow-hidden">
      <div className="h-full bg-black animate-pulse w-3/4"></div>
    </div>
  </div>
);`,
        codeHtml: `<div class="fullscreen-loader">...</div>`,
      },
    ],
    relatedComponents: ['loading-spinner', 'skeleton-loader'],
  },
  {
    id: 'success-message',
    name: 'Success Message (Callout)',
    category: 'feedback',
    description: 'Positive confirmation box featuring green iconography, celebratory message, and next step suggestions.',
    purpose: 'Celebrate and confirm successful task completion (e.g. "Order Placed!", "Password Changed Successfully").',
    whatIsIt: 'An alert callout container styled with emerald accents and success checkmark.',
    whatIsItUsedFor: 'Order checkout success page, registration email sent confirmation, and form submission.',
    whereToUse: 'Form results, checkout receipts, and post-action confirmation panels.',
    advantages: [
      'Provides high-confidence psychological closure for users',
      'Provides receipt number or confirmation details',
      'Guides user toward their next productive action',
    ],
    difficulty: 'beginner',
    tags: ['Success Message', 'Confirmation', 'Green', 'Celebration', 'Callout'],
    popular: true,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'neo-success-callout',
        name: 'Neo Success Callout',
        description: 'Emerald callout with large checkmark badge and next action button.',
        codeReact: `export const SuccessMessagePreview = () => (
  <div className="max-w-xs bg-emerald-50 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] p-4 text-center space-y-2">
    <div className="w-10 h-10 mx-auto rounded-full bg-[#4ADE80] border-2 border-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#000]">
      ✓
    </div>
    <h4 className="font-black text-sm text-black">Payment Confirmed!</h4>
    <p className="text-xs text-neutral-700">Receipt #98421 was sent to your email.</p>
    <button className="px-4 py-1.5 bg-white text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
      View Invoice →
    </button>
  </div>
);`,
        codeHtml: `<div class="success-callout">...</div>`,
      },
    ],
    relatedComponents: ['error-message', 'toast-notification'],
  },
  {
    id: 'error-message',
    name: 'Error Message (Error State)',
    category: 'feedback',
    description: 'Constructive failure alert detailing what went wrong, why it happened, and actionable troubleshooting steps to resolve it.',
    purpose: 'Turn errors into solvable problems by clearly communicating what failed and how to recover.',
    whatIsIt: 'A red or rose tinted callout with warning icon, error description, and retry action.',
    whatIsItUsedFor: 'Failed payment transactions, 404/500 server errors, invalid API keys, and network timeouts.',
    whereToUse: 'Failed form submissions and disconnected network states.',
    advantages: [
      'Avoids obscure technical jargon in favor of user-friendly explanations',
      'Provides direct Retry or Support buttons',
      'High-contrast styling prevents user from missing the issue',
    ],
    difficulty: 'beginner',
    tags: ['Error', 'Failure', 'Troubleshooting', 'Retry', 'Alert'],
    popular: true,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'neo-error-callout',
        name: 'Neo Error Callout with Retry',
        description: 'Rose tinted callout with retry button and clear guidance.',
        codeReact: `export const ErrorMessagePreview = () => (
  <div className="max-w-xs bg-rose-50 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] p-4 space-y-2">
    <div className="flex items-center gap-2 font-black text-xs text-rose-700">
      <span className="w-5 h-5 rounded-full bg-[#F43F5E] text-white flex items-center justify-center text-xs">✕</span>
      <span>Unable to Connect to Server</span>
    </div>
    <p className="text-xs text-neutral-700">Please check your internet connection or try again in a few moments.</p>
    <button className="px-3 py-1 bg-white hover:bg-neutral-100 text-black font-black text-xs rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer">
      ↻ Try Again
    </button>
  </div>
);`,
        codeHtml: `<div class="error-callout">...</div>`,
      },
    ],
    relatedComponents: ['success-message', 'form-validation', 'banner-alert'],
  },
];
