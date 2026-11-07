import { UIComponentItem } from '../types.js';

export const FORM_COMPONENTS: UIComponentItem[] = [
  {
    id: 'text-input',
    name: 'Text Input',
    category: 'forms',
    description: 'Single-line data entry field with accessible label, placeholder text, clear focus ring, and helper instructions.',
    purpose: 'Capture short text strings like names, emails, addresses, and titles from users.',
    whatIsIt: 'Standard `<input type="text">` styled with clear boundary, label, and focus state.',
    whatIsItUsedFor: 'Account registration, contact forms, search queries, and profile editing.',
    whereToUse: 'Any form capturing single-line text input.',
    advantages: [
      'Accessible across all screen readers with associated label `for` attribute',
      'Supports prefix/suffix icons (e.g. @ or dollar signs)',
      'Consistent focus indicator helps keyboard navigators',
    ],
    difficulty: 'beginner',
    tags: ['Input', 'Form', 'Text', 'Field', 'Entry'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'neo-text-input',
        name: 'Neo Brutalist Text Input',
        description: 'Input with bold label, 2px border, and offset shadow focus.',
        codeReact: `export const NeoTextInput = () => (
  <div className="w-full max-w-xs space-y-1.5">
    <label className="block text-xs font-black text-black">Email Address</label>
    <input
      type="email"
      placeholder="you@domain.com"
      className="w-full px-3.5 py-2.5 bg-white text-black text-xs font-bold rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] focus:shadow-[4px_4px_0px_#000] outline-none transition"
    />
    <p className="text-[10px] text-neutral-500 font-medium">We'll never share your email.</p>
  </div>
);`,
        codeHtml: `<div class="form-group"><label>Email</label><input type="email" placeholder="you@domain.com" /></div>`,
      },
    ],
    relatedComponents: ['password-input', 'search-input', 'textarea'],
  },
  {
    id: 'password-input',
    name: 'Password Input',
    category: 'forms',
    description: 'Secure text field masking characters with dots/asterisks and featuring an eye toggle to show or hide the password.',
    purpose: 'Protect user credentials from shoulder surfing while allowing password verification.',
    whatIsIt: 'An input field that toggles between `type="password"` and `type="text"` via an eye icon button.',
    whatIsItUsedFor: 'Login forms, signup flows, password changes, and sensitive token inputs.',
    whereToUse: 'Authentication pages and security settings.',
    advantages: [
      'Masks sensitive text from nearby observers',
      'Show/Hide toggle prevents typos and reduces login failure frustration',
      'Meets WCAG accessibility standards for password inputs',
    ],
    difficulty: 'intermediate',
    tags: ['Password', 'Security', 'Eye Toggle', 'Masked', 'Auth'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'password-toggle-input',
        name: 'Password Field with Show/Hide',
        description: 'Masked input with clickable eye icon button on the right.',
        codeReact: `export const PasswordInputPreview = () => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="w-full max-w-xs space-y-1.5">
      <label className="block text-xs font-black text-black">Password</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder="••••••••••••"
          defaultValue="superSecret123!"
          className="w-full px-3.5 py-2.5 pr-10 bg-white text-black text-xs font-bold rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] outline-none transition"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-neutral-600 hover:text-black cursor-pointer"
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
};`,
        codeHtml: `<div class="password-input-group">...</div>`,
      },
    ],
    relatedComponents: ['text-input', 'form-validation', 'otp-input'],
  },
  {
    id: 'search-input',
    name: 'Search Input',
    category: 'forms',
    description: 'Specialized search bar with leading magnifying glass icon, keyboard shortcut badge (⌘K), and 1-click clear button.',
    purpose: 'Allow rapid keyword querying across large collections of components, documents, or data rows.',
    whatIsIt: 'An input field augmented with search glyph, instant clear button, and quick focus shortcut.',
    whatIsItUsedFor: 'Global site search, table filtering, component library filtering, and knowledge bases.',
    whereToUse: 'Headers, top of catalog directories, and filter toolbars.',
    advantages: [
      'Visual icon immediately signifies search functionality',
      'Keyboard shortcut hints prompt power users',
      'Clear button (X) allows immediate query reset without backspacing',
    ],
    difficulty: 'beginner',
    tags: ['Search', 'Filter', 'Find', 'Magnifier', 'Cmd+K'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'neo-search-input',
        name: 'Neo Search Bar',
        description: 'Input with magnifying glass icon and ⌘K badge.',
        codeReact: `export const SearchInputPreview = () => (
  <div className="w-full max-w-sm relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">🔍</span>
    <input
      type="text"
      placeholder="Search 100+ components..."
      className="w-full pl-9 pr-14 py-2.5 bg-white text-black text-xs font-bold rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] outline-none focus:shadow-[4px_4px_0px_#000] transition"
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono border border-black rounded bg-[#FAF7F2] text-neutral-600">
      ⌘K
    </span>
  </div>
);`,
        codeHtml: `<div class="search-input">...</div>`,
      },
    ],
    relatedComponents: ['text-input', 'command-palette', 'search-filters'],
  },
  {
    id: 'textarea',
    name: 'Textarea (Multi-line Input)',
    category: 'forms',
    description: 'Multi-line text entry container supporting word wrapping, dynamic auto-expansion, and character limit counter.',
    purpose: 'Allow input of extensive multi-sentence content like reviews, descriptions, messages, and code snippets.',
    whatIsIt: 'A multiline text area `<textarea>` with customizable rows and character counter.',
    whatIsItUsedFor: 'Feedback submissions, review forms, forum posts, issue descriptions, and bio editors.',
    whereToUse: 'Comment forms, contact support messages, and post composition.',
    advantages: [
      'Supports comfortable paragraphs and line breaks',
      'Character counter prevents unexpected length limit rejections',
      'Resizable or auto-expanding to match content length',
    ],
    difficulty: 'beginner',
    tags: ['Textarea', 'Multiline', 'Comment', 'Message', 'Character Count'],
    popular: false,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'neo-textarea',
        name: 'Neo Textarea with Counter',
        description: 'Multiline area with 2px border and character counter at bottom right.',
        codeReact: `export const TextareaPreview = () => (
  <div className="w-full max-w-sm space-y-1.5">
    <label className="block text-xs font-black text-black">Project Description</label>
    <div className="relative">
      <textarea
        rows={3}
        placeholder="Describe what makes your project unique..."
        className="w-full px-3.5 py-2.5 bg-white text-black text-xs font-medium rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] outline-none transition resize-none"
      />
      <span className="absolute bottom-2 right-2.5 text-[10px] font-mono text-neutral-400">
        48 / 250
      </span>
    </div>
  </div>
);`,
        codeHtml: `<div class="form-textarea">...</div>`,
      },
    ],
    relatedComponents: ['text-input', 'rich-text-editor'],
  },
  {
    id: 'select-dropdown',
    name: 'Select Dropdown',
    category: 'forms',
    description: 'Compact dropdown picker displaying a single chosen option with a popup panel of selectable alternatives.',
    purpose: 'Allow selection of one option from a predefined list of 5 or more items without cluttering the screen.',
    whatIsIt: 'A trigger button showing the active option with a custom dropdown list.',
    whatIsItUsedFor: 'Country selection, language switcher, category selection, and sorting filters.',
    whereToUse: 'Form fields and filter toolbars.',
    advantages: [
      'Conserves vertical space compared to radio button groups',
      'Prevents invalid data input by restricting choices to approved items',
      'Supports custom styling and icons inside option rows',
    ],
    difficulty: 'intermediate',
    tags: ['Select', 'Dropdown', 'Picker', 'Options', 'Form'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'neo-select-dropdown',
        name: 'Neo Select Dropdown',
        description: 'Styled select with custom chevron arrow and hover state.',
        codeReact: `export const SelectDropdownPreview = () => (
  <div className="w-full max-w-xs space-y-1.5">
    <label className="block text-xs font-black text-black">Component Category</label>
    <div className="relative">
      <select className="w-full px-3.5 py-2.5 bg-white text-black text-xs font-bold rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] outline-none appearance-none cursor-pointer">
        <option>Navigation Components</option>
        <option>Buttons & Actions</option>
        <option>Cards & Containers</option>
        <option>Form Components</option>
      </select>
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-black">
        ▼
      </span>
    </div>
  </div>
);`,
        codeHtml: `<div class="select-wrapper">...</div>`,
      },
    ],
    relatedComponents: ['multi-select', 'dropdown-menu'],
  },
  {
    id: 'multi-select',
    name: 'Multi-Select',
    category: 'forms',
    description: 'Interactive selection control allowing multiple items to be picked and displayed as removable pill tags.',
    purpose: 'Allow users to associate several tags, categories, or team members with an entity.',
    whatIsIt: 'A dropdown combining a searchable filter with pill badges that can be deleted via (X).',
    whatIsItUsedFor: 'Tagging articles, assigning multiple collaborators, skill selection, and multi-facet filtering.',
    whereToUse: 'Project settings, filter bars, and issue trackers.',
    advantages: [
      'Visually highlights all active selections as pills',
      'Supports 1-click removal of individual tags',
      'Search input makes finding tags across 50+ options effortless',
    ],
    difficulty: 'intermediate',
    tags: ['Multi-select', 'Tags', 'Pills', 'Chips', 'Filter'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'neo-multi-select',
        name: 'Pill Tag Multi-Select',
        description: 'Displays active selected tags as yellow pills with delete (x) buttons.',
        codeReact: `export const MultiSelectPreview = () => (
  <div className="w-full max-w-xs space-y-1.5">
    <label className="block text-xs font-black text-black">Assigned Technologies</label>
    <div className="p-2 bg-white rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] flex flex-wrap gap-1.5 items-center">
      <span className="px-2 py-0.5 bg-[#FACC15] text-black text-[10px] font-black rounded-md border border-black flex items-center gap-1">
        React ✕
      </span>
      <span className="px-2 py-0.5 bg-[#38BDF8] text-black text-[10px] font-black rounded-md border border-black flex items-center gap-1">
        Tailwind ✕
      </span>
      <span className="px-2 py-0.5 bg-[#4ADE80] text-black text-[10px] font-black rounded-md border border-black flex items-center gap-1">
        TypeScript ✕
      </span>
      <input type="text" placeholder="+ Add tech..." className="text-[10px] font-bold outline-none flex-1 min-w-[70px] px-1" />
    </div>
  </div>
);`,
        codeHtml: `<div class="multi-select">...</div>`,
      },
    ],
    relatedComponents: ['select-dropdown', 'badge'],
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'forms',
    description: 'Binary selection square allowing users to toggle an independent setting on or off, or select multiple items from a list.',
    purpose: 'Capture boolean states (e.g., "I agree to terms") or permit non-exclusive multiple selections.',
    whatIsIt: 'A square box that displays a checkmark when checked.',
    whatIsItUsedFor: 'Terms agreement, todo item completion, bulk table row selection, and preference toggles.',
    whereToUse: 'Form footers, todo lists, and filter panels.',
    advantages: [
      'Universal mental model for non-exclusive choices',
      'Clear checked vs unchecked visual state',
      'Supports indeterminate state (partial group selection)',
    ],
    difficulty: 'beginner',
    tags: ['Checkbox', 'Check', 'Form', 'Selection', 'Multi-choice'],
    popular: true,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'neo-checkbox',
        name: 'Neo Brutalist Checkbox',
        description: 'Square with 2px border, hard shadow, and checkmark.',
        codeReact: `export const CheckboxPreview = () => {
  const [checked, setChecked] = React.useState(true);
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => setChecked(!checked)}
        className={\`w-5 h-5 rounded-lg border-2 border-black flex items-center justify-center font-black text-xs transition \${
          checked ? 'bg-[#4ADE80] shadow-[1.5px_1.5px_0px_#000]' : 'bg-white shadow-[1.5px_1.5px_0px_#000]'
        }\`}
      >
        {checked && '✓'}
      </div>
      <span className="text-xs font-black text-black">I agree to the Terms of Service</span>
    </label>
  );
};`,
        codeHtml: `<label class="checkbox-container"><input type="checkbox" /> Agree</label>`,
      },
    ],
    relatedComponents: ['radio-button', 'toggle-switch'],
  },
  {
    id: 'radio-button',
    name: 'Radio Button',
    category: 'forms',
    description: 'Circular selection control designed for mutually exclusive groups where selecting one option automatically unchecks the others.',
    purpose: 'Force the user to choose exactly one option from a small group (2 to 5 options).',
    whatIsIt: 'A circular target that fills with an inner solid dot when selected.',
    whatIsItUsedFor: 'Payment method choice (Credit card, PayPal, Crypto), delivery speed selection, and role selection.',
    whereToUse: 'Forms where options are mutually exclusive and all choices should remain visible.',
    advantages: [
      'All available choices are immediately visible at a glance',
      'Enforces strictly one selected value per group',
      'Accessible keyboard arrow key switching between radio group items',
    ],
    difficulty: 'beginner',
    tags: ['Radio Button', 'Single Choice', 'Options', 'Group'],
    popular: false,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'neo-radio-group',
        name: 'Neo Radio Group',
        description: 'Group of 2 options with solid black inner dot for active selection.',
        codeReact: `export const RadioButtonPreview = () => {
  const [selected, setSelected] = React.useState('monthly');
  return (
    <div className="space-y-2">
      <label onClick={() => setSelected('monthly')} className="flex items-center gap-2.5 cursor-pointer select-none">
        <div className="w-5 h-5 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
          {selected === 'monthly' && <div className="w-2.5 h-2.5 rounded-full bg-[#000]"></div>}
        </div>
        <span className="text-xs font-black text-black">Monthly Billing ($12/mo)</span>
      </label>
      <label onClick={() => setSelected('annual')} className="flex items-center gap-2.5 cursor-pointer select-none">
        <div className="w-5 h-5 rounded-full border-2 border-black bg-white flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
          {selected === 'annual' && <div className="w-2.5 h-2.5 rounded-full bg-[#000]"></div>}
        </div>
        <span className="text-xs font-black text-black">Annual Billing ($99/yr) — Save 30%</span>
      </label>
    </div>
  );
};`,
        codeHtml: `<div class="radio-group">...</div>`,
      },
    ],
    relatedComponents: ['checkbox', 'toggle-switch'],
  },
  {
    id: 'toggle-switch',
    name: 'Toggle Switch (Switch)',
    category: 'forms',
    description: 'Sliding physical switch metaphor representing an instant on/off toggle that takes effect immediately without needing form submission.',
    purpose: 'Turn settings, preferences, or modes on or off with instant immediate feedback.',
    whatIsIt: 'A pill track with a sliding circular thumb that transitions horizontally between On and Off.',
    whatIsItUsedFor: 'Dark mode toggle, email notification alerts, auto-save enable, and two-factor authentication activation.',
    whereToUse: 'Settings panels, preference dialogs, and feature toggles.',
    advantages: [
      'Communicates immediate effect (no "Submit" button required)',
      'Highly intuitive physical light-switch mental model',
      'Smooth CSS slide animation confirms state change',
    ],
    difficulty: 'beginner',
    tags: ['Toggle Switch', 'Switch', 'On/Off', 'Settings', 'Preferences'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'neo-toggle-switch',
        name: 'Neo Sliding Switch',
        description: 'Vibrant green active track with smooth sliding circular knob.',
        codeReact: `export const ToggleSwitchPreview = () => {
  const [enabled, setEnabled] = React.useState(true);
  return (
    <div className="flex items-center justify-between max-w-xs p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
      <div>
        <p className="text-xs font-black text-black">Instant Notifications</p>
        <p className="text-[10px] text-neutral-500">Receive alerts when components update</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={\`w-12 h-6 rounded-full border-2 border-black p-0.5 transition-colors duration-200 cursor-pointer \${
          enabled ? 'bg-[#4ADE80]' : 'bg-neutral-200'
        }\`}
      >
        <div
          className={\`w-4 h-4 rounded-full bg-white border border-black shadow-sm transform transition-transform duration-200 \${
            enabled ? 'translate-x-6' : 'translate-x-0'
          }\`}
        />
      </button>
    </div>
  );
};`,
        codeHtml: `<div class="toggle-switch">...</div>`,
      },
    ],
    relatedComponents: ['checkbox', 'toggle-button'],
  },
  {
    id: 'slider',
    name: 'Slider (Range Input)',
    category: 'forms',
    description: 'Horizontal track with a draggable thumb allowing users to select a numeric value or range continuously or in stepped increments.',
    purpose: 'Select numeric values (e.g. Volume, Price, Font Size, Opacity) quickly through fluid visual manipulation.',
    whatIsIt: 'An `<input type="range">` track with colored fill up to the draggable thumb.',
    whatIsItUsedFor: 'Audio volume controls, e-commerce price filters, design studio opacity dials, and loan amount calculators.',
    whereToUse: 'Audio/video players, design tool inspectors, and price filter sidebars.',
    advantages: [
      'Far faster than typing numbers for approximate or visual values',
      'Immediate visual feedback on screen as thumb slides',
      'Enforces clean minimum and maximum bounds',
    ],
    difficulty: 'beginner',
    tags: ['Slider', 'Range', 'Volume', 'Draggable', 'Track'],
    popular: false,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'neo-slider',
        name: 'Neo Slider with Live Value',
        description: 'Draggable slider with colored progress track and live percentage value.',
        codeReact: `export const SliderPreview = () => {
  const [val, setVal] = React.useState(75);
  return (
    <div className="w-full max-w-xs space-y-2">
      <div className="flex justify-between text-xs font-black">
        <span>Border Radius</span>
        <span className="px-1.5 bg-[#FACC15] border border-black rounded">{val}px</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-full accent-black cursor-pointer"
      />
    </div>
  );
};`,
        codeHtml: `<input type="range" min="0" max="100" />`,
      },
    ],
    relatedComponents: ['progress-bar', 'rating'],
  },
  {
    id: 'date-picker',
    name: 'Date Picker',
    category: 'forms',
    description: 'Interactive calendar popup allowing users to select single dates, date ranges, or recurring schedules without manual typing.',
    purpose: 'Prevent date format syntax errors (DD/MM vs MM/DD) and provide calendar visualization of days and weeks.',
    whatIsIt: 'An input field that opens an interactive calendar grid displaying month days.',
    whatIsItUsedFor: 'Flight and hotel bookings, event scheduling, task due dates, and reporting period filters.',
    whereToUse: 'Booking engines, project management deadlines, and analytics date filters.',
    advantages: [
      'Eliminates confusion between international date formats',
      'Disables unavailable, booked, or past dates automatically',
      'Provides quick jump shortcuts (Today, Tomorrow, Next Week)',
    ],
    difficulty: 'intermediate',
    tags: ['Date Picker', 'Calendar', 'Schedule', 'Time', 'Booking'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'mini-calendar-picker',
        name: 'Mini Calendar Picker',
        description: 'Calendar view showing active date selection in bold yellow.',
        codeReact: `export const DatePickerPreview = () => (
  <div className="w-64 bg-white p-3 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] text-xs">
    <div className="flex justify-between items-center font-black mb-3">
      <span>November 2026</span>
      <div className="flex gap-1">
        <button className="px-1.5 py-0.5 border border-black rounded hover:bg-neutral-100">‹</button>
        <button className="px-1.5 py-0.5 border border-black rounded hover:bg-neutral-100">›</button>
      </div>
    </div>
    <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-neutral-400 mb-1">
      <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
    </div>
    <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs">
      <span className="text-neutral-300">28</span><span className="text-neutral-300">29</span><span className="text-neutral-300">30</span>
      <span>1</span><span>2</span><span>3</span><span>4</span>
      <span>5</span><span className="bg-[#FACC15] border border-black rounded-lg font-black shadow-[1px_1px_0px_#000]">6</span><span>7</span><span>8</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="date-picker">...</div>`,
      },
    ],
    relatedComponents: ['time-picker', 'calendar'],
  },
  {
    id: 'time-picker',
    name: 'Time Picker',
    category: 'forms',
    description: 'Time selector allowing precise picking of hours, minutes, and AM/PM through clock dials, scroll wheels, or segmented steppers.',
    purpose: 'Select appointment times, meeting hours, or reminder alarms accurately.',
    whatIsIt: 'A segmented input or popup for setting HH:MM AM/PM.',
    whatIsItUsedFor: 'Calendar invites, alarm clocks, restaurant reservations, and delivery scheduling.',
    whereToUse: 'Booking flows and calendar scheduling forms.',
    advantages: [
      'Standardizes 12-hour vs 24-hour time conventions',
      'Restricts selection to valid business hours or intervals (e.g. 15-min increments)',
      'Prevents invalid times like 25:70',
    ],
    difficulty: 'intermediate',
    tags: ['Time Picker', 'Clock', 'Hours', 'Minutes', 'AM/PM'],
    popular: false,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'segmented-time-picker',
        name: 'Segmented Time Pill',
        description: 'Hour, minute, and AM/PM stepper pill with custom buttons.',
        codeReact: `export const TimePickerPreview = () => (
  <div className="inline-flex items-center gap-1.5 p-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-black">
    <div className="px-2 py-1 bg-[#FAF7F2] border border-black rounded-lg">10</div>
    <span>:</span>
    <div className="px-2 py-1 bg-[#FAF7F2] border border-black rounded-lg">30</div>
    <div className="px-2 py-1 bg-[#FACC15] border border-black rounded-lg shadow-[1px_1px_0px_#000]">AM</div>
  </div>
);`,
        codeHtml: `<div class="time-picker">...</div>`,
      },
    ],
    relatedComponents: ['date-picker'],
  },
  {
    id: 'file-upload',
    name: 'File Upload',
    category: 'forms',
    description: 'Button-triggered file selector with selected filename badge, file size indicator, and remove attachment icon.',
    purpose: 'Allow users to browse and attach files from their local storage device to a form.',
    whatIsIt: 'A custom styled button wrapping a hidden `<input type="file">` element.',
    whatIsItUsedFor: 'Resume submissions, avatar uploads, PDF attachments, and support ticket logs.',
    whereToUse: 'Registration forms, job applications, and support ticket creators.',
    advantages: [
      'Cleaner than default browser file input styling',
      'Explicitly displays accepted file types (.PNG, .PDF) and size limits',
      'Provides immediate filename confirmation after selection',
    ],
    difficulty: 'beginner',
    tags: ['File Upload', 'Attachment', 'File Input', 'Document'],
    popular: true,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'neo-file-upload',
        name: 'File Attach Button with Preview',
        description: 'Attach button paired with selected file preview chip.',
        codeReact: `export const FileUploadPreview = () => (
  <div className="w-full max-w-xs space-y-2">
    <label className="block text-xs font-black text-black">Upload Identification</label>
    <div className="flex items-center gap-2">
      <button className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer">
        📁 Choose File
      </button>
      <span className="text-[11px] font-mono text-neutral-500 truncate">resume_2026.pdf</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="file-upload">...</div>`,
      },
    ],
    relatedComponents: ['drag-and-drop-upload', 'download-button'],
  },
  {
    id: 'drag-and-drop-upload',
    name: 'Drag and Drop Upload (Dropzone)',
    category: 'forms',
    description: 'Generous dashed drop boundary that lights up upon dragging files from the operating system desktop or file manager.',
    purpose: 'Provide a fast, friction-free way to upload single or multiple files by dragging them onto the browser.',
    whatIsIt: 'A prominent drop area responding to `dragover`, `dragenter`, and `drop` events with visual feedback.',
    whatIsItUsedFor: 'Photo galleries, batch PDF processing, cloud storage sync, and design studios.',
    whereToUse: 'Image enhancers, media libraries, and document processing tools.',
    advantages: [
      'Huge drag target minimizes missed drops',
      'Visual dragover state gives positive confirmation',
      'Supports multiple simultaneous file drops and folder structures',
    ],
    difficulty: 'intermediate',
    tags: ['Dropzone', 'Drag and Drop', 'Upload', 'Batch', 'File'],
    popular: true,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'neo-dropzone',
        name: 'Neo Dashed Dropzone',
        description: 'Dashed 2px border container with upload icon and accepted formats.',
        codeReact: `export const DropzonePreview = () => (
  <div className="w-full max-w-sm p-6 bg-[#FAF7F2] border-2 border-dashed border-black rounded-2xl text-center space-y-2 hover:bg-yellow-50 transition cursor-pointer">
    <div className="w-10 h-10 mx-auto rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#000]">
      ☁️
    </div>
    <p className="text-xs font-black text-black">Drag & drop files here, or <span className="underline text-blue-600">browse</span></p>
    <p className="text-[10px] text-neutral-500 font-mono">PNG, JPG, PDF up to 25MB</p>
  </div>
);`,
        codeHtml: `<div class="dropzone">...</div>`,
      },
    ],
    relatedComponents: ['file-upload', 'drag-and-drop'],
  },
  {
    id: 'otp-input',
    name: 'OTP Input (One-Time Password)',
    category: 'forms',
    description: 'Series of 4 to 6 connected individual digit boxes with auto-focus progression on typing and paste support for 2FA verification.',
    purpose: 'Allow fast, error-free entry of 2FA verification codes sent via SMS, email, or authenticator apps.',
    whatIsIt: 'A row of 6 single-character inputs that auto-advance focus as digits are entered.',
    whatIsItUsedFor: 'Two-factor authentication (2FA), phone verification, transaction confirmation, and email sign-in codes.',
    whereToUse: 'Two-factor authentication verification screens.',
    advantages: [
      'Prevents typing errors through constrained single-digit boxes',
      'Automatically advances cursor to next box upon keypress',
      'Supports 1-click paste of complete 6-digit codes from clipboard',
    ],
    difficulty: 'intermediate',
    tags: ['OTP', '2FA', 'Verification', 'Security', 'PIN'],
    popular: true,
    dateAdded: '2026-01-22',
    variations: [
      {
        id: 'neo-otp-boxes',
        name: 'Neo 6-Digit PIN Boxes',
        description: '6 square boxes with bold monospace digits and active focus border.',
        codeReact: `export const OtpInputPreview = () => (
  <div className="flex gap-2 justify-center">
    {['4', '8', '2', '', '', ''].map((val, idx) => (
      <input
        key={idx}
        type="text"
        maxLength={1}
        defaultValue={val}
        className={\`w-10 h-12 text-center text-base font-mono font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] outline-none \${
          idx === 3 ? 'bg-[#FACC15]' : 'bg-white'
        }\`}
      />
    ))}
  </div>
);`,
        codeHtml: `<div class="otp-container">...</div>`,
      },
    ],
    relatedComponents: ['password-input', 'text-input'],
  },
  {
    id: 'form-validation',
    name: 'Form Validation (Inline States)',
    category: 'forms',
    description: 'Real-time validation styling displaying success checkmarks, error messages, warning banners, and password strength meters.',
    purpose: 'Give users immediate constructive feedback before they submit, preventing frustration and server validation round-trips.',
    whatIsIt: 'Input states augmented with green/red borders, helper error text, and icons.',
    whatIsItUsedFor: 'Email syntax validation, password complexity meters, username availability checks, and checkout form auditing.',
    whereToUse: 'All interactive forms across the platform.',
    advantages: [
      'Instantly clarifies exact error reasons (e.g. "Password must include a number")',
      'Green positive reinforcement reassures user that format is accepted',
      'Reduces form abandonment rates significantly',
    ],
    difficulty: 'intermediate',
    tags: ['Validation', 'Error', 'Success', 'Feedback', 'Form Helper'],
    popular: true,
    dateAdded: '2026-01-22',
    variations: [
      {
        id: 'validation-states',
        name: 'Success & Error Validation States',
        description: 'Side-by-side inputs demonstrating green verified and red error feedback.',
        codeReact: `export const FormValidationPreview = () => (
  <div className="w-full max-w-sm space-y-3">
    <div className="space-y-1">
      <label className="block text-xs font-black text-black">Username (Available)</label>
      <div className="relative">
        <input
          type="text"
          defaultValue="vexora_builder"
          className="w-full px-3.5 py-2 bg-emerald-50 text-emerald-950 text-xs font-bold rounded-xl border-2 border-emerald-600 outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-xs">✓ Available</span>
      </div>
    </div>
    <div className="space-y-1">
      <label className="block text-xs font-black text-black">Password (Too Short)</label>
      <input
        type="password"
        defaultValue="123"
        className="w-full px-3.5 py-2 bg-rose-50 text-rose-950 text-xs font-bold rounded-xl border-2 border-rose-500 outline-none"
      />
      <p className="text-[10px] text-rose-600 font-bold">Must be at least 8 characters long.</p>
    </div>
  </div>
);`,
        codeHtml: `<div class="form-validation-demo">...</div>`,
      },
    ],
    relatedComponents: ['text-input', 'password-input', 'error-message'],
  },
  {
    id: 'multi-step-form',
    name: 'Multi-Step Form',
    category: 'forms',
    description: 'Sequenced form architecture splitting lengthy questionnaires into phased, bite-sized steps with Back and Next controls.',
    purpose: 'Tackle complex data collection without overwhelming users with a monolithic endless page of inputs.',
    whatIsIt: 'A multi-screen form orchestrated with a stepper progress bar and validated phase transitions.',
    whatIsItUsedFor: 'User registration onboarding, tax calculators, loan applications, and project configuration.',
    whereToUse: 'Complex onboarding flows and enterprise setup wizards.',
    advantages: [
      'Eliminates the intimidating visual shock of long 30-field forms',
      'Saves partial form state automatically between phases',
      'Maintains user momentum with clear step count indicators',
    ],
    difficulty: 'advanced',
    tags: ['Multi-Step', 'Form Wizard', 'Stepper', 'Phased', 'Onboarding'],
    popular: true,
    dateAdded: '2026-01-22',
    variations: [
      {
        id: 'neo-multi-step-form',
        name: 'Phased Multi-Step Card',
        description: 'Step 2 of 3 showing active inputs, Back, and Continue buttons.',
        codeReact: `export const MultiStepFormPreview = () => (
  <div className="w-full max-w-sm bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] space-y-4">
    <div className="flex justify-between items-center text-xs font-black border-b border-black pb-2">
      <span>Step 2 of 3: Organization Details</span>
      <span className="px-2 py-0.5 bg-[#FACC15] rounded border border-black text-[10px]">66% Done</span>
    </div>
    <div className="space-y-2">
      <label className="block text-xs font-bold text-black">Company Name</label>
      <input type="text" defaultValue="Vexora Labs Inc." className="w-full px-3 py-2 text-xs font-bold rounded-lg border-2 border-black outline-none" />
    </div>
    <div className="flex justify-between pt-2">
      <button className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-black font-black text-xs rounded-xl border-2 border-black">
        ← Back
      </button>
      <button className="px-4 py-1.5 bg-[#4ADE80] hover:bg-emerald-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
        Continue →
      </button>
    </div>
  </div>
);`,
        codeHtml: `<div class="multi-step-form">...</div>`,
      },
    ],
    relatedComponents: ['step-navigation', 'multi-step-wizard', 'form-validation'],
  },
];
