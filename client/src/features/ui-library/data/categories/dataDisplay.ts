import { UIComponentItem } from '../types.js';

export const DATA_DISPLAY_COMPONENTS: UIComponentItem[] = [
  {
    id: 'data-table',
    name: 'Data Table',
    category: 'data-display',
    description: 'Tabular matrix displaying structured records with sortable column headers, pagination controls, status badges, and row selection checkboxes.',
    purpose: 'Display, compare, and organize dense structured records for quick scanning and bulk processing.',
    whatIsIt: 'A table component `<table className="w-full">` with sticky headers, striped rows, and cell formatting.',
    whatIsItUsedFor: 'Admin user rosters, financial transaction logs, inventory databases, and audit trails.',
    whereToUse: 'Admin dashboards, account history, and database inspectors.',
    advantages: [
      'High information density allows comparing 10+ attributes across rows',
      'Supports sortable columns (A-Z, Date, Amount) and pagination',
      'Enables bulk actions via row checkboxes',
    ],
    difficulty: 'intermediate',
    tags: ['Table', 'Data Table', 'Grid', 'Records', 'Sort'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'neo-data-table',
        name: 'Neo Brutalist Data Table',
        description: 'Table with thick black borders, colorful status chips, and action buttons.',
        codeReact: `export const DataTablePreview = () => (
  <div className="w-full overflow-x-auto border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] bg-white">
    <table className="w-full text-left text-xs">
      <thead className="bg-[#FAF7F2] border-b-2 border-black font-black">
        <tr>
          <th className="p-3">User</th>
          <th className="p-3">Role</th>
          <th className="p-3">Status</th>
          <th className="p-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-black/10 font-bold">
        <tr>
          <td className="p-3">Alex Rivera</td>
          <td className="p-3 text-neutral-600">Admin</td>
          <td className="p-3"><span className="px-2 py-0.5 bg-[#4ADE80] text-black text-[10px] rounded border border-black">Active</span></td>
          <td className="p-3 text-right"><button className="text-xs hover:underline">Edit</button></td>
        </tr>
        <tr>
          <td className="p-3">Jordan Lee</td>
          <td className="p-3 text-neutral-600">Editor</td>
          <td className="p-3"><span className="px-2 py-0.5 bg-[#FACC15] text-black text-[10px] rounded border border-black">Pending</span></td>
          <td className="p-3 text-right"><button className="text-xs hover:underline">Edit</button></td>
        </tr>
      </tbody>
    </table>
  </div>
);`,
        codeHtml: `<div class="data-table">...</div>`,
      },
    ],
    relatedComponents: ['pagination', 'search-filters', 'badge'],
  },
  {
    id: 'statistics',
    name: 'Statistics (Metric Tile)',
    category: 'data-display',
    description: 'Prominent numerical display pairing a large statistic value with contextual label, comparison percentage, and icon.',
    purpose: 'Highlight essential metrics and operational numbers with high visual impact.',
    whatIsIt: 'A display module with extra-large typography for key numbers.',
    whatIsItUsedFor: 'Revenue summaries, project counts, total users, and conversion statistics.',
    whereToUse: 'Top rows of dashboards and marketing homepages.',
    advantages: [
      'Immediate comprehension in under 1 second',
      'Pairs nicely with sparklines and comparison indicators',
      'Clean typography hierarchy',
    ],
    difficulty: 'beginner',
    tags: ['Stats', 'KPI', 'Numbers', 'Metrics', 'Summary'],
    popular: true,
    dateAdded: '2026-01-15',
    variations: [
      {
        id: 'neo-stat-tile',
        name: 'Neo Stat Tile',
        description: 'Large number with icon and comparison badge.',
        codeReact: `export const StatTilePreview = () => (
  <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] inline-block min-w-[200px]">
    <p className="text-xs font-black text-neutral-500 uppercase tracking-wide">Monthly Downloads</p>
    <div className="text-3xl font-black text-black my-1">1.2M+</div>
    <span className="text-[11px] font-bold text-emerald-600">↗ +24% vs last year</span>
  </div>
);`,
        codeHtml: `<div class="stat-tile">...</div>`,
      },
    ],
    relatedComponents: ['statistics-card', 'progress-bar'],
  },
  {
    id: 'progress-bar',
    name: 'Progress Bar',
    category: 'data-display',
    description: 'Linear horizontal indicator visually representing the percentage completion of an operation or quota.',
    purpose: 'Show progress towards a goal (e.g. 75% storage used, 3 of 4 tasks finished).',
    whatIsIt: 'A rounded background track with a colored foreground bar filling proportionally (0% to 100%).',
    whatIsItUsedFor: 'File download progress, storage quotas, profile completion meters, and fundraising targets.',
    whereToUse: 'File upload queues, goal widgets, and dashboard quotas.',
    advantages: [
      'Intuitive visual measurement of task completion',
      'Communicates proximity to goal or quota limits',
      'Can be striped or animated for indeterminate operations',
    ],
    difficulty: 'beginner',
    tags: ['Progress Bar', 'Meter', 'Linear', 'Completion', 'Goal'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'neo-progress-bar',
        name: 'Neo Progress Bar',
        description: 'Track with 2px border, striped yellow fill, and percentage label.',
        codeReact: `export const ProgressBarPreview = () => (
  <div className="w-full max-w-xs space-y-1.5">
    <div className="flex justify-between text-xs font-black">
      <span>Storage Used</span>
      <span>72%</span>
    </div>
    <div className="w-full h-4 bg-white border-2 border-black rounded-full overflow-hidden p-0.5 shadow-[2px_2px_0px_#000]">
      <div className="h-full bg-[#FACC15] border border-black rounded-full transition-all duration-500" style={{ width: '72%' }} />
    </div>
  </div>
);`,
        codeHtml: `<div class="progress-bar-wrapper">...</div>`,
      },
    ],
    relatedComponents: ['circular-progress', 'slider', 'step-navigation'],
  },
  {
    id: 'circular-progress',
    name: 'Circular Progress (Donut Gauge)',
    category: 'data-display',
    description: 'Circular radial gauge displaying progress as an SVG ring stroke with centered percentage label.',
    purpose: 'Display percentage completion in a compact square footprint without needing horizontal space.',
    whatIsIt: 'An SVG circle utilizing `strokeDasharray` and `strokeDashoffset` to depict percentages.',
    whatIsItUsedFor: 'Activity rings (Apple Fitness), test score summaries, battery indicators, and performance ratings.',
    whereToUse: 'Fitness apps, performance audits (Lighthouse), and compact widget cards.',
    advantages: [
      'Compact aspect ratio fits easily into square grid cells',
      'Leaves center open for percentage or rating grade (e.g. "98")',
      'Visually engaging radial stroke animation',
    ],
    difficulty: 'intermediate',
    tags: ['Circular Progress', 'Radial', 'Donut', 'Gauge', 'Ring'],
    popular: true,
    dateAdded: '2026-01-16',
    variations: [
      {
        id: 'svg-radial-gauge',
        name: 'SVG Radial Progress Ring',
        description: '80% circle with centered percentage and bold neo-brutalist border.',
        codeReact: `export const CircularProgressPreview = () => (
  <div className="relative w-24 h-24 flex items-center justify-center bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
    <svg className="w-20 h-20 -rotate-90">
      <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="6" fill="transparent" />
      <circle
        cx="40"
        cy="40"
        r="32"
        stroke="#4ADE80"
        strokeWidth="6"
        strokeDasharray="201"
        strokeDashoffset="40"
        strokeLinecap="round"
        fill="transparent"
      />
    </svg>
    <div className="absolute font-black text-sm text-black">80%</div>
  </div>
);`,
        codeHtml: `<div class="radial-progress">...</div>`,
      },
    ],
    relatedComponents: ['progress-bar', 'charts'],
  },
  {
    id: 'charts',
    name: 'Charts (Data Visualization Hub)',
    category: 'data-display',
    description: 'Comprehensive data visualization suite encompassing line charts, bar graphs, and area curves for telemetry analysis.',
    purpose: 'Transform raw datasets into actionable graphical trends and historical patterns.',
    whatIsIt: 'Interactive graphical rendering of data points with axes, tooltips, and legends.',
    whatIsItUsedFor: 'Business analytics, visitor tracking, revenue metrics, and sensor telemetry.',
    whereToUse: 'Analytics dashboards and performance reporting pages.',
    advantages: [
      'Reveals trends, cycles, and anomalies invisible in raw tables',
      'Supports interactive hover tooltips for exact values',
      'Multiple visualization paradigms fit different data types',
    ],
    difficulty: 'advanced',
    tags: ['Charts', 'Visualization', 'Graphs', 'Telemetry', 'Analytics'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'chart-hub-preview',
        name: 'Interactive Chart Module',
        description: 'Multi-bar comparison with axis values and legend chips.',
        codeReact: `export const ChartHubPreview = () => (
  <div className="max-w-sm bg-white p-4 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000]">
    <div className="flex justify-between items-center mb-3">
      <span className="font-black text-xs">Weekly Activity</span>
      <span className="px-2 py-0.5 bg-[#FAF7F2] border border-black rounded text-[10px] font-bold">This Week</span>
    </div>
    <div className="h-24 flex items-end gap-3 justify-between px-2 pt-2 border-b-2 border-black">
      <div className="w-6 bg-[#38BDF8] border border-black rounded-t" style={{ height: '40%' }}></div>
      <div className="w-6 bg-[#38BDF8] border border-black rounded-t" style={{ height: '70%' }}></div>
      <div className="w-6 bg-[#FACC15] border border-black rounded-t" style={{ height: '95%' }}></div>
      <div className="w-6 bg-[#38BDF8] border border-black rounded-t" style={{ height: '60%' }}></div>
      <div className="w-6 bg-[#38BDF8] border border-black rounded-t" style={{ height: '85%' }}></div>
    </div>
    <div className="flex justify-between text-[10px] font-mono text-neutral-500 pt-2 px-1">
      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="chart-container">...</div>`,
      },
    ],
    relatedComponents: ['line-graph', 'bar-chart', 'pie-chart'],
  },
  {
    id: 'line-graph',
    name: 'Line Graph',
    category: 'data-display',
    description: 'Continuous polyline chart visualizing metric fluctuations over continuous time intervals.',
    purpose: 'Track trajectories, stock trends, temperature variations, and monthly growth rates over time.',
    whatIsIt: 'A 2D coordinate system plotting sequential data points connected by line segments.',
    whatIsItUsedFor: 'Time-series financial monitors, server CPU utilization, and web traffic histories.',
    whereToUse: 'Analytics pages and telemetry screens.',
    advantages: [
      'Unmatched clarity for continuous temporal changes',
      'Supports multiple overlapping series with colored lines',
      'Highlights peaks, valleys, and moving averages',
    ],
    difficulty: 'intermediate',
    tags: ['Line Graph', 'Time Series', 'Trendline', 'Stock', 'Analytics'],
    popular: true,
    dateAdded: '2026-01-17',
    variations: [
      {
        id: 'svg-line-graph',
        name: 'SVG Vector Line Graph',
        description: 'Smooth SVG trendline with gradient fill beneath.',
        codeReact: `export const LineGraphPreview = () => (
  <div className="max-w-xs bg-white p-4 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
    <div className="flex justify-between items-center text-xs font-black mb-2">
      <span>Traffic Trajectory</span>
      <span className="text-emerald-600 font-bold">+38.2%</span>
    </div>
    <svg className="w-full h-20" viewBox="0 0 100 40">
      <polyline
        fill="none"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,32 20,24 40,28 60,14 80,18 100,6"
      />
      <circle cx="100" cy="6" r="3" fill="#FACC15" stroke="#000" strokeWidth="1.5" />
    </svg>
  </div>
);`,
        codeHtml: `<div class="line-graph">...</div>`,
      },
    ],
    relatedComponents: ['charts', 'bar-chart'],
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    category: 'data-display',
    description: 'Categorical comparison chart displaying rectangular bars proportional to the values they represent.',
    purpose: 'Compare discrete categories side by side (e.g., Sales by Region, Browsers, Devices).',
    whatIsIt: 'Horizontal or vertical bars representing categorical discrete values.',
    whatIsItUsedFor: 'Demographics, product inventory comparisons, monthly revenue totals, and survey results.',
    whereToUse: 'Reports, dashboards, and comparison tables.',
    advantages: [
      'Easiest visualization for the human eye to compare accurate relative magnitudes',
      'Works well horizontally for long category labels',
      'Supports stacked or grouped bars for sub-categories',
    ],
    difficulty: 'intermediate',
    tags: ['Bar Chart', 'Categories', 'Histogram', 'Comparison'],
    popular: true,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'horizontal-bars',
        name: 'Horizontal Bar Comparison',
        description: 'Horizontal ranking bars with percentages and clean labels.',
        codeReact: `export const BarChartPreview = () => (
  <div className="max-w-xs bg-white p-4 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] space-y-2.5">
    <p className="text-xs font-black text-black">Traffic by Source</p>
    <div>
      <div className="flex justify-between text-[11px] font-bold mb-1">
        <span>Direct</span><span>58%</span>
      </div>
      <div className="w-full h-3 bg-neutral-100 border border-black rounded-full overflow-hidden">
        <div className="h-full bg-[#38BDF8]" style={{ width: '58%' }}></div>
      </div>
    </div>
    <div>
      <div className="flex justify-between text-[11px] font-bold mb-1">
        <span>Search</span><span>32%</span>
      </div>
      <div className="w-full h-3 bg-neutral-100 border border-black rounded-full overflow-hidden">
        <div className="h-full bg-[#FACC15]" style={{ width: '32%' }}></div>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="bar-chart">...</div>`,
      },
    ],
    relatedComponents: ['charts', 'progress-bar'],
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart (Doughnut Chart)',
    category: 'data-display',
    description: 'Circular proportional chart divided into slices illustrating numerical proportions that sum to 100%.',
    purpose: 'Show the composition or percentage distribution of parts of a whole.',
    whatIsIt: 'A circular graphic partitioned into pie or doughnut wedges.',
    whatIsItUsedFor: 'Market share, budget expense breakdowns, device distributions, and asset allocations.',
    whereToUse: 'Financial portfolios, budget planners, and demographic reports.',
    advantages: [
      'Instantly communicates relative proportions of a whole',
      'Doughnut variant leaves center open for total summary value',
      'Clear color legend distinguishes each category slice',
    ],
    difficulty: 'intermediate',
    tags: ['Pie Chart', 'Donut', 'Proportions', 'Distribution', 'Budget'],
    popular: false,
    dateAdded: '2026-01-18',
    variations: [
      {
        id: 'doughnut-pie-preview',
        name: 'Doughnut Breakdown with Legend',
        description: 'Pie doughnut circle with color legend tags.',
        codeReact: `export const PieChartPreview = () => (
  <div className="max-w-xs bg-white p-4 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] flex items-center gap-4">
    <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center font-black text-xs bg-gradient-to-tr from-[#38BDF8] via-[#FACC15] to-[#4ADE80]">
      <div className="w-8 h-8 rounded-full bg-white border border-black"></div>
    </div>
    <div className="text-[11px] font-bold space-y-1">
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#38BDF8] border border-black rounded-sm"></span> Dev (50%)</div>
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#FACC15] border border-black rounded-sm"></span> Design (30%)</div>
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#4ADE80] border border-black rounded-sm"></span> Ops (20%)</div>
    </div>
  </div>
);`,
        codeHtml: `<div class="pie-chart">...</div>`,
      },
    ],
    relatedComponents: ['charts', 'circular-progress'],
  },
  {
    id: 'timeline',
    name: 'Timeline',
    category: 'data-display',
    description: 'Chronological vertical or horizontal sequence connecting event nodes with dates, descriptions, and status icons.',
    purpose: 'Display the chronological history, roadmap milestones, or shipping delivery stages of an entity.',
    whatIsIt: 'A spine line connecting milestone nodes ordered by date or step.',
    whatIsItUsedFor: 'Company history, order package tracking, changelogs, and product roadmaps.',
    whereToUse: 'About us pages, order status views, and changelog feeds.',
    advantages: [
      'Clear story-driven chronological narrative',
      'Highlights completed vs upcoming milestones with distinct icons',
      'Easy to read vertically on mobile devices',
    ],
    difficulty: 'intermediate',
    tags: ['Timeline', 'Milestones', 'History', 'Changelog', 'Tracking'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'vertical-timeline',
        name: 'Vertical Event Spine',
        description: 'Spine line with node dots, event times, and descriptions.',
        codeReact: `export const TimelinePreview = () => (
  <div className="max-w-xs space-y-4 pl-4 border-l-2 border-black font-bold text-xs">
    <div className="relative">
      <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[#4ADE80] border-2 border-black"></div>
      <p className="text-[10px] text-neutral-500 font-mono">Today, 2:30 PM</p>
      <p className="text-black font-black">Release v2.4 Deployed</p>
      <p className="text-neutral-600 text-[11px]">All components published to production.</p>
    </div>
    <div className="relative">
      <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[#FACC15] border-2 border-black"></div>
      <p className="text-[10px] text-neutral-500 font-mono">Yesterday, 9:00 AM</p>
      <p className="text-black font-black">Code Review Approved</p>
    </div>
  </div>
);`,
        codeHtml: `<div class="timeline">...</div>`,
      },
    ],
    relatedComponents: ['activity-feed', 'step-navigation'],
  },
  {
    id: 'activity-feed',
    name: 'Activity Feed',
    category: 'data-display',
    description: 'Dynamic event stream detailing real-time actions taken by users or system processes in chronological order.',
    purpose: 'Keep users updated on team actions, comments, commits, and status modifications.',
    whatIsIt: 'A vertical list of mini-events featuring user avatars, action verbs, target links, and relative timestamps.',
    whatIsItUsedFor: 'GitHub repository activity, social feeds, audit logs, and project collaboration streams.',
    whereToUse: 'Project overviews, team dashboards, and user profiles.',
    advantages: [
      'Establishes transparency across collaborative workspaces',
      'Relative timestamps ("5m ago") give immediacy',
      'Avatars make identifying teammates effortless',
    ],
    difficulty: 'beginner',
    tags: ['Activity Feed', 'Stream', 'Audit', 'Events', 'Recent'],
    popular: true,
    dateAdded: '2026-01-19',
    variations: [
      {
        id: 'team-activity-feed',
        name: 'Team Activity Stream',
        description: 'Compact feed of recent user operations with avatar circles.',
        codeReact: `export const ActivityFeedPreview = () => (
  <div className="max-w-xs bg-white p-4 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] space-y-3">
    <p className="text-xs font-black text-black">Recent Activity</p>
    <div className="flex gap-2.5 items-start text-xs font-medium">
      <div className="w-6 h-6 rounded-full bg-[#38BDF8] border border-black flex items-center justify-center font-black text-[10px] shrink-0">
        AL
      </div>
      <div>
        <p className="text-black leading-tight"><strong className="font-black">Alex</strong> added a new variation to <strong className="font-black">Navbar</strong></p>
        <span className="text-[10px] text-neutral-500 font-mono">12 minutes ago</span>
      </div>
    </div>
  </div>
);`,
        codeHtml: `<div class="activity-feed">...</div>`,
      },
    ],
    relatedComponents: ['timeline', 'avatar'],
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'data-display',
    description: 'Circular or rounded-square visual representation of a user through their photo, illustrated initials, or fallback glyph.',
    purpose: 'Identify individual users and authors across comments, navigation bars, and data tables.',
    whatIsIt: 'An image or monogram circle with fallback initials and border styling.',
    whatIsItUsedFor: 'User profiles, comment authors, team lists, and navigation profile triggers.',
    whereToUse: 'Headers, comment threads, table rows, and chat interfaces.',
    advantages: [
      'Instantly humanizes the interface',
      'Provides reliable fallback to initials when image fails to load',
      'Supports presence status dots (Online, Busy, Away)',
    ],
    difficulty: 'beginner',
    tags: ['Avatar', 'User Photo', 'Initials', 'Profile', 'Presence'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'neo-avatar-set',
        name: 'Neo Avatar with Presence Dot',
        description: 'Avatar with bold border, initials, and green online badge.',
        codeReact: `export const AvatarPreview = () => (
  <div className="relative inline-block">
    <div className="w-10 h-10 rounded-xl bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black text-xs text-black">
      JD
    </div>
    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#4ADE80] border-2 border-black rounded-full"></span>
  </div>
);`,
        codeHtml: `<div class="avatar">...</div>`,
      },
    ],
    relatedComponents: ['avatar-group', 'profile-card'],
  },
  {
    id: 'avatar-group',
    name: 'Avatar Group',
    category: 'data-display',
    description: 'Overlapping horizontal stack of user avatars representing collaborative teams, attendees, or contributors.',
    purpose: 'Communicate multiple active collaborators or participants in a single compact horizontal footprint.',
    whatIsIt: 'A row of avatars overlapping with negative margin, ending in a +N overflow indicator.',
    whatIsItUsedFor: 'Shared document collaborators (Google Docs style), project assignees, and event attendee previews.',
    whereToUse: 'Project cards, meeting summaries, and repository headers.',
    advantages: [
      'Displays 5+ participants in less than 150px width',
      '+N overflow pill handles large groups gracefully',
      'Overlapping border separation guarantees individual distinction',
    ],
    difficulty: 'beginner',
    tags: ['Avatar Group', 'Team', 'Collaborators', 'Overlap', 'Stack'],
    popular: true,
    dateAdded: '2026-01-20',
    variations: [
      {
        id: 'overlapping-avatars',
        name: 'Overlapping Stack with +4 Overflow',
        description: 'Row of 3 colorful initials followed by a +4 pill.',
        codeReact: `export const AvatarGroupPreview = () => (
  <div className="flex items-center -space-x-2">
    <div className="w-8 h-8 rounded-full bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-[10px]">
      AR
    </div>
    <div className="w-8 h-8 rounded-full bg-[#38BDF8] border-2 border-black flex items-center justify-center font-black text-[10px]">
      MK
    </div>
    <div className="w-8 h-8 rounded-full bg-[#F472B6] border-2 border-black flex items-center justify-center font-black text-[10px]">
      TL
    </div>
    <div className="w-8 h-8 rounded-full bg-black text-white border-2 border-black flex items-center justify-center font-black text-[10px]">
      +4
    </div>
  </div>
);`,
        codeHtml: `<div class="avatar-group">...</div>`,
      },
    ],
    relatedComponents: ['avatar', 'profile-card'],
  },
  {
    id: 'badge',
    name: 'Badge (Tag / Chip)',
    category: 'data-display',
    description: 'Small status chip or category pill used to highlight metadata, counts, categories, or new feature flags.',
    purpose: 'Draw attention to key attributes (e.g. "PRO", "NEW", "BETA", "12") in a compact visual chip.',
    whatIsIt: 'A compact pill with background tint, optional border, and bold uppercase text.',
    whatIsItUsedFor: 'Status indicators, notification counters, tag pills, pricing tier ribbons, and version badges.',
    whereToUse: 'Adjacent to titles, on cards, and inside table cells.',
    advantages: [
      'Minimal footprint fits inside any header or row',
      'Color coding communicates semantic state instantly (Green = Success, Red = Danger)',
      'Can be rounded pill or rectangular stamp',
    ],
    difficulty: 'beginner',
    tags: ['Badge', 'Chip', 'Pill', 'Tag', 'Status Chip'],
    popular: true,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'neo-badges-cluster',
        name: 'Neo Brutalist Status Badges',
        description: 'Cluster of Pro, Beta, and Success badges with 1.5px borders.',
        codeReact: `export const BadgeClusterPreview = () => (
  <div className="flex flex-wrap gap-2">
    <span className="px-2.5 py-0.5 bg-[#FACC15] text-black text-[10px] font-black rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
      PRO
    </span>
    <span className="px-2.5 py-0.5 bg-[#4ADE80] text-black text-[10px] font-black rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
      ACTIVE
    </span>
    <span className="px-2.5 py-0.5 bg-[#F472B6] text-black text-[10px] font-black rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
      NEW
    </span>
  </div>
);`,
        codeHtml: `<span class="badge">PRO</span>`,
      },
    ],
    relatedComponents: ['status-indicator', 'multi-select'],
  },
  {
    id: 'status-indicator',
    name: 'Status Indicator (Live Dot)',
    category: 'data-display',
    description: 'Compact visual dot with optional pulsing ping animation communicating operational health or connection status.',
    purpose: 'Communicate live system health, connection online/offline status, or alert severity without large text.',
    whatIsIt: 'A circular dot (typically 8-10px) with green, amber, or red fill and an optional pulsing ping halo.',
    whatIsItUsedFor: 'System status pages (All systems operational), live streaming indicators, and online presence.',
    whereToUse: 'Footers, user avatars, and system monitors.',
    advantages: [
      'Pulsing ping animation immediately signals live real-time connection',
      'Extremely compact footprint',
      'Universally recognized color conventions',
    ],
    difficulty: 'beginner',
    tags: ['Status', 'Dot', 'Ping', 'Online', 'Pulse'],
    popular: false,
    dateAdded: '2026-01-21',
    variations: [
      {
        id: 'pulsing-status-dot',
        name: 'Pulsing Live Dot',
        description: 'Green dot with continuous ripple ping animation and label.',
        codeReact: `export const StatusIndicatorPreview = () => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_#000] text-xs font-black">
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
    </span>
    <span>All Systems Operational</span>
  </div>
);`,
        codeHtml: `<div class="status-indicator">...</div>`,
      },
    ],
    relatedComponents: ['badge', 'statistics-card'],
  },
  {
    id: 'rating',
    name: 'Rating (Star Rating)',
    category: 'data-display',
    description: 'Five-star rating visualization displaying customer review scores with filled, half-filled, and interactive hover states.',
    purpose: 'Show overall satisfaction ratings or allow users to submit review scores.',
    whatIsIt: 'A row of 5 star glyphs with numeric score and total review counter.',
    whatIsItUsedFor: 'Product reviews, course ratings, restaurant critiques, and driver feedback.',
    whereToUse: 'Product cards, course listings, and review modals.',
    advantages: [
      'Instant visual representation of customer consensus',
      'Supports half-star precision (e.g. 4.8 / 5)',
      'Clickable for review input with hover highlights',
    ],
    difficulty: 'beginner',
    tags: ['Rating', 'Stars', 'Reviews', 'Score', 'Feedback'],
    popular: true,
    dateAdded: '2026-01-22',
    variations: [
      {
        id: 'star-rating-preview',
        name: 'Five-Star Rating Row',
        description: 'Gold stars with numeric score and total count.',
        codeReact: `export const RatingPreview = () => (
  <div className="flex items-center gap-1.5 text-xs font-black">
    <div className="text-amber-500 text-sm tracking-widest">★★★★★</div>
    <span className="text-black font-black">4.9</span>
    <span className="text-neutral-500 font-normal">(1,420 reviews)</span>
  </div>
);`,
        codeHtml: `<div class="rating-stars">★★★★★ 4.9</div>`,
      },
    ],
    relatedComponents: ['testimonial-card', 'product-card'],
  },
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'data-display',
    description: 'Vertically stacked collapsible panels that expand on click to reveal detailed answers while hiding others.',
    purpose: 'Organize extensive question-and-answer pairs or deep documentation without vertical page bloating.',
    whatIsIt: 'A list of header bars with rotating chevrons that toggle expand/collapse state.',
    whatIsItUsedFor: 'FAQ sections, settings panels, lesson module breakdowns, and filtering accordions.',
    whereToUse: 'Pricing pages, help centers, and complex settings.',
    advantages: [
      'Drastically reduces page scroll height',
      'Allows users to scan headings and open only relevant questions',
      'Supports single-open or multi-open modes',
    ],
    difficulty: 'beginner',
    tags: ['Accordion', 'FAQ', 'Collapsible', 'Questions', 'Expand'],
    popular: true,
    dateAdded: '2026-01-22',
    variations: [
      {
        id: 'neo-accordion-item',
        name: 'Neo Accordion Panel',
        description: 'Interactive expanding question panel with rotating arrow.',
        codeReact: `export const AccordionPreview = () => {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="w-full max-w-sm bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] overflow-hidden">
      <div onClick={() => setOpen(!open)} className="p-4 flex justify-between items-center cursor-pointer select-none font-black text-xs">
        <span>Can I copy and use these components in commercial projects?</span>
        <span className="transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </div>
      {open && (
        <div className="p-4 bg-[#FAF7F2] border-t-2 border-black text-xs text-neutral-700 font-medium leading-relaxed">
          Yes! All VexoraMods components are 100% free and open-source under the MIT license.
        </div>
      )}
    </div>
  );
};`,
        codeHtml: `<div class="accordion">...</div>`,
      },
    ],
    relatedComponents: ['expandable-card', 'tabs'],
  },
  {
    id: 'list-group',
    name: 'List Group',
    category: 'data-display',
    description: 'Vertical stack of linked or action items with dividing borders, icons, and trailing badges or chevrons.',
    purpose: 'Display sequential items like notifications, settings options, or file lists in a clean structured column.',
    whatIsIt: 'An ordered list container with divided rows and hover highlights.',
    whatIsItUsedFor: 'Notification drawers, account menu options, file listings, and playlist queues.',
    whereToUse: 'Sidebars, card bodies, and drawer menus.',
    advantages: [
      'Clean border separation prevents row ambiguity',
      'Trailing action icons (chevrons, delete) invite interaction',
      'High density allows reading 10+ items comfortably',
    ],
    difficulty: 'beginner',
    tags: ['List Group', 'Rows', 'Menu', 'Stack', 'Items'],
    popular: false,
    dateAdded: '2026-01-22',
    variations: [
      {
        id: 'neo-list-group',
        name: 'Neo Action List Group',
        description: '3 divided rows with icons, bold titles, and right chevrons.',
        codeReact: `export const ListGroupPreview = () => (
  <div className="w-full max-w-xs bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] overflow-hidden divide-y-2 divide-black text-xs font-black">
    <div className="p-3 flex items-center justify-between hover:bg-neutral-50 cursor-pointer">
      <div className="flex items-center gap-2"><span className="font-mono text-neutral-400">•</span><span>Notifications</span></div>
      <span className="px-1.5 py-0.5 bg-[#FACC15] text-[10px] rounded border border-black">3</span>
    </div>
    <div className="p-3 flex items-center justify-between hover:bg-neutral-50 cursor-pointer">
      <div className="flex items-center gap-2"><span className="font-mono text-neutral-400">•</span><span>Security & 2FA</span></div>
      <span>›</span>
    </div>
    <div className="p-3 flex items-center justify-between hover:bg-neutral-50 cursor-pointer">
      <div className="flex items-center gap-2"><span className="font-mono text-neutral-400">•</span><span>Billing Methods</span></div>
      <span>›</span>
    </div>
  </div>
);`,
        codeHtml: `<div class="list-group">...</div>`,
      },
    ],
    relatedComponents: ['dropdown-menu', 'data-table'],
  },
  {
    id: 'empty-state',
    name: 'Empty State',
    category: 'data-display',
    description: 'Friendly illustration and instructional callout displayed when a list, table, or search returns zero results.',
    purpose: 'Prevent dead ends and guide the user on what action to take when data is empty.',
    whatIsIt: 'A centered card with an empty state illustration, friendly message, and primary CTA button.',
    whatIsItUsedFor: 'Empty shopping cart, zero search results, no saved favorites yet, and empty inbox.',
    whereToUse: 'Anywhere a data query or collection could return zero items.',
    advantages: [
      'Turns a disappointing dead end into a helpful action prompt',
      'Clear explanation of why no records appear',
      'Single-click CTA restarts the journey',
    ],
    difficulty: 'beginner',
    tags: ['Empty State', 'Zero Results', 'Placeholder', 'Callout', 'No Data'],
    popular: true,
    dateAdded: '2026-01-23',
    variations: [
      {
        id: 'neo-empty-state',
        name: 'Neo Empty State Card',
        description: 'Illustration box with "No Favorites Found" and explore button.',
        codeReact: `export const EmptyStatePreview = () => (
  <div className="max-w-xs p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] text-center space-y-3">
    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF7F2] border-2 border-black flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
      ⭐
    </div>
    <h4 className="font-black text-sm text-black">No Favorites Saved Yet</h4>
    <p className="text-xs text-neutral-600">Click the star icon on any component to save it to your personal learning collection.</p>
    <button className="px-4 py-2 bg-[#FACC15] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition cursor-pointer">
      Browse Components
    </button>
  </div>
);`,
        codeHtml: `<div class="empty-state">...</div>`,
      },
    ],
    relatedComponents: ['basic-card', 'primary-button'],
  },
  {
    id: 'skeleton-loader',
    name: 'Skeleton Loader',
    category: 'data-display',
    description: 'Pulsing placeholder wireframe that mimics the exact layout of upcoming content while data is loading asynchronously.',
    purpose: 'Reduce perceived waiting time and eliminate jarring layout shifts as data arrives.',
    whatIsIt: 'Shimmering gray shapes matching cards, text paragraphs, and avatars.',
    whatIsItUsedFor: 'Initial page load states, feed loading, image fetches, and table row streaming.',
    whereToUse: 'Any container awaiting API data.',
    advantages: [
      'Far superior user perception compared to a generic spinning wheel',
      'Pre-allocates exact dimensions, eliminating Cumulative Layout Shift (CLS)',
      'Smoothly fades into real content upon data arrival',
    ],
    difficulty: 'intermediate',
    tags: ['Skeleton', 'Loader', 'Shimmer', 'Wireframe', 'Placeholder'],
    popular: true,
    dateAdded: '2026-01-23',
    variations: [
      {
        id: 'skeleton-card-preview',
        name: 'Skeleton Card Shimmer',
        description: 'Pulsing avatar circle and title bars simulating a loading profile card.',
        codeReact: `export const SkeletonLoaderPreview = () => (
  <div className="max-w-xs p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] space-y-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-neutral-200 border border-neutral-300"></div>
      <div className="space-y-1.5 flex-1">
        <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-2.5 bg-neutral-100 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-1.5">
      <div className="h-2.5 bg-neutral-100 rounded w-full"></div>
      <div className="h-2.5 bg-neutral-100 rounded w-5/6"></div>
    </div>
  </div>
);`,
        codeHtml: `<div class="skeleton-loader">...</div>`,
      },
    ],
    relatedComponents: ['loading-spinner', 'basic-card'],
  },
];
