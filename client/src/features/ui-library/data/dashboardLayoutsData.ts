import { DashboardLayoutItem } from './types.js';

export const DASHBOARD_LAYOUTS: DashboardLayoutItem[] = [
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    description: 'Comprehensive administrative control center with system overview metrics, recent activity feed, quick action shortcuts, and user permission management.',
    useCase: 'Platform moderation, backend user management, role assignments, and server health monitoring.',
    layoutType: 'Sidebar + Topbar + Multi-widget Grid',
    keyFeatures: [
      'KPI statistic summary cards with trend badges',
      'Recent user activity and security audit feed',
      'Quick action operational shortcuts',
      'System health and server latency monitors',
      'Data table with search, filter, and pagination',
    ],
    codeReact: `export const AdminDashboard = () => (
  <div className="flex h-screen bg-neutral-100">
    <aside className="w-64 bg-neutral-900 text-white p-4">Sidebar</aside>
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between">Header</header>
      <main className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* KPI Cards & Table */}
      </main>
    </div>
  </div>
);`,
    codeHtml: `<div class="admin-layout">
  <aside class="sidebar">...</aside>
  <div class="main-wrapper">
    <header class="topbar">...</header>
    <main class="content-grid">...</main>
  </div>
</div>`,
    tags: ['Admin', 'Enterprise', 'Management', 'Multi-widget'],
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Data-intensive telemetry console featuring time-series charts, retention heatmaps, geographic traffic maps, and conversion funnels.',
    useCase: 'Product metrics, web traffic tracking, marketing campaign performance, and user retention analysis.',
    layoutType: 'Dense Grid with Dynamic Time Range Switcher',
    keyFeatures: [
      'Interactive time range filter (7D, 30D, 90D, 1Y)',
      'Time-series line graphs with hover tooltips',
      'Categorical bar charts comparing acquisition channels',
      'Doughnut chart for device and browser split',
      'Live visitor counter and active user sparkline',
    ],
    codeReact: `export const AnalyticsDashboard = () => (
  <div className="p-6 space-y-6 bg-slate-900 text-slate-100 min-h-screen">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Analytics Overview</h1>
      <TimeRangeSelector />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricsCard />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LineChartCard />
      <BarChartCard />
    </div>
  </div>
);`,
    codeHtml: `<div class="analytics-dashboard">
  <div class="dashboard-header">...</div>
  <div class="charts-grid">...</div>
</div>`,
    tags: ['Analytics', 'Charts', 'Data Visualization', 'Metrics'],
  },
  {
    id: 'financial-dashboard',
    name: 'Financial Dashboard',
    description: 'High-security financial overview tracking cash flow, MRR/ARR trajectories, expense breakdowns, transaction logs, and invoice statuses.',
    useCase: 'Fintech portals, corporate accounting, subscription SaaS revenue tracking, and personal wealth portfolios.',
    layoutType: 'Balance Card + Cash Flow Grid + Transaction Stream',
    keyFeatures: [
      'Account balance and liquid asset cards',
      'Income vs. Expenses area chart',
      'Recent transactions list with categorization tags',
      'Invoice status trackers (Paid, Pending, Overdue)',
      'Budget progress bars and spending alerts',
    ],
    codeReact: `export const FinancialDashboard = () => (
  <div className="min-h-screen bg-stone-50 p-6 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BalanceCard amount="$124,590.00" change="+12.4%" />
      <RevenueCard amount="$34,200.00" change="+8.1%" />
      <ExpenseCard amount="$11,400.00" change="-3.2%" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
        <CashFlowChart />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <RecentTransactions />
      </div>
    </div>
  </div>
);`,
    codeHtml: `<div class="finance-dashboard">
  <div class="kpi-row">...</div>
  <div class="financial-tables">...</div>
</div>`,
    tags: ['Finance', 'Fintech', 'Revenue', 'Transactions', 'MRR'],
  },
  {
    id: 'crm-dashboard',
    name: 'CRM Dashboard',
    description: 'Customer relationship management dashboard with sales deal pipelines, lead conversion stages, interaction history, and client contacts.',
    useCase: 'Sales pipelines, customer success tracking, deal negotiation stages, and client communication logs.',
    layoutType: 'Sales Funnel Pipeline + Deal Stage Board + Contact List',
    keyFeatures: [
      'Deal pipeline stages (Lead, Contacted, Proposal, Won)',
      'Sales team leaderboard and quota completion gauges',
      'Recent customer communications and follow-up reminders',
      'High-value client quick directory with direct email action',
    ],
    codeReact: `export const CrmDashboard = () => (
  <div className="p-6 bg-slate-50 min-h-screen">
    <h1 className="text-2xl font-bold mb-6">CRM Pipeline & Deal Flow</h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <PipelineStage stage="New Leads (24)" value="$48,000" />
      <PipelineStage stage="Qualified (12)" value="$64,000" />
      <PipelineStage stage="Proposal (6)" value="$120,000" />
      <PipelineStage stage="Won (18)" value="$240,000" />
    </div>
  </div>
);`,
    codeHtml: `<div class="crm-pipeline">
  <div class="pipeline-columns">...</div>
</div>`,
    tags: ['CRM', 'Sales', 'Pipeline', 'Customers', 'Leads'],
  },
  {
    id: 'project-management-dashboard',
    name: 'Project Management Dashboard',
    description: 'Collaborative task and sprint tracking dashboard with milestone progress, team workload balance, Gantt timeline snapshots, and deadline alerts.',
    useCase: 'Agile sprints, cross-functional engineering roadmaps, client deliverables, and agency campaign execution.',
    layoutType: 'Sprint Overview + Milestone Progress + Team Workload',
    keyFeatures: [
      'Sprint velocity and burndown indicator',
      'Milestone completion percentages with visual progress bars',
      'Upcoming critical deadlines with urgency indicators',
      'Team member assigned task distribution avatars',
    ],
    codeReact: `export const ProjectManagementDashboard = () => (
  <div className="p-6 bg-neutral-50 min-h-screen space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold">Q4 Product Roadmap & Sprint 14</h1>
      <TeamAvatars />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TaskStatusCard status="In Progress" count={14} />
      <TaskStatusCard status="Under Review" count={6} />
      <TaskStatusCard status="Completed" count={38} />
    </div>
  </div>
);`,
    codeHtml: `<div class="pm-dashboard">
  <div class="sprint-header">...</div>
  <div class="roadmap-grid">...</div>
</div>`,
    tags: ['Project Management', 'Agile', 'Sprint', 'Tasks', 'Roadmap'],
  },
  {
    id: 'kanban-dashboard',
    name: 'Kanban Dashboard',
    description: 'Full-height visual workflow board with draggable card columns, tag filters, priority indicators, and assignee avatars.',
    useCase: 'DevOps issue tracking, content editorial calendars, hiring applicant pipelines, and personal productivity.',
    layoutType: 'Horizontal Multi-column Kanban Board with Sticky Header',
    keyFeatures: [
      'Multi-column layout (Backlog, To Do, In Progress, QA, Done)',
      'Card chips with priority (Urgent, High, Low)',
      'Assignee avatars and comment count badges',
      'Quick "Add Task" button at the bottom of each column',
    ],
    codeReact: `export const KanbanDashboard = () => (
  <div className="h-screen flex flex-col bg-slate-100">
    <header className="p-4 bg-white border-b font-bold">Engineering Board</header>
    <div className="flex-1 overflow-x-auto p-4 flex gap-4">
      <KanbanColumn title="Backlog (4)" />
      <KanbanColumn title="In Progress (2)" />
      <KanbanColumn title="Review (3)" />
      <KanbanColumn title="Done (12)" />
    </div>
  </div>
);`,
    codeHtml: `<div class="kanban-board">
  <div class="kanban-column">...</div>
</div>`,
    tags: ['Kanban', 'Agile', 'Columns', 'Workflow', 'Productivity'],
  },
  {
    id: 'minimal-dashboard',
    name: 'Minimal Dashboard',
    description: 'Distraction-free dashboard focusing solely on the top 3-4 essential metrics with expansive breathing room and restrained typography.',
    useCase: 'Executive high-level summaries, focus mode writing statistics, and personal habit counters.',
    layoutType: 'Clean Centered Single-Column / Minimalist Grid',
    keyFeatures: [
      'Huge high-impact typography for core numbers',
      'Zero unnecessary borders or saturated shadows',
      'Subtle monochrome or single-tint visual accents',
      'Clean single-glance status verification',
    ],
    codeReact: `export const MinimalDashboard = () => (
  <div className="max-w-5xl mx-auto py-12 px-6 space-y-12 bg-white min-h-screen">
    <h1 className="text-3xl font-light text-neutral-900">Today's Pulse</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t pt-8">
      <div><p className="text-neutral-500 text-sm">Active MRR</p><p className="text-4xl font-bold mt-2">$42,900</p></div>
      <div><p className="text-neutral-500 text-sm">Signups</p><p className="text-4xl font-bold mt-2">+318</p></div>
      <div><p className="text-neutral-500 text-sm">Server Uptime</p><p className="text-4xl font-bold mt-2">99.99%</p></div>
    </div>
  </div>
);`,
    codeHtml: `<div class="minimal-dashboard">
  <h1>Today's Pulse</h1>
  <div class="metrics-row">...</div>
</div>`,
    tags: ['Minimal', 'Executive', 'Clean', 'Distraction-Free'],
  },
  {
    id: 'sidebar-dashboard',
    name: 'Sidebar Dashboard',
    description: 'The classic modern web application layout: persistent collapsible navigation on the left with nested groups, and scrollable content on the right.',
    useCase: 'SaaS platforms, cloud console managers, database editors, and developer tooling.',
    layoutType: 'Fixed/Collapsible Vertical Sidebar + Scrollable Viewport',
    keyFeatures: [
      'Persistent brand header with project switcher',
      'Nested navigation links with active state indicator',
      'Bottom account profile widget with quick sign-out',
      'Responsive hamburger collapse on mobile devices',
    ],
    codeReact: `export const SidebarDashboard = () => (
  <div className="flex h-screen bg-slate-50">
    <aside className="w-64 bg-white border-r p-4 flex flex-col justify-between">
      <nav className="space-y-1">Navigation Items</nav>
      <div className="border-t pt-4">User Profile</div>
    </aside>
    <main className="flex-1 overflow-y-auto p-8">Content Area</main>
  </div>
);`,
    codeHtml: `<div class="sidebar-layout">
  <aside>...</aside>
  <main>...</main>
</div>`,
    tags: ['Sidebar', 'Classic', 'Navigation', 'SaaS Standard'],
  },
  {
    id: 'full-width-dashboard',
    name: 'Full-Width Dashboard',
    description: 'Edge-to-edge layout utilizing the full horizontal monitor width with top navigation and high-density multi-column data modules.',
    useCase: 'Trading terminals, network topology visualizers, security operations centers (SOC), and large data monitors.',
    layoutType: 'Sticky Top Navigation + 100vw Dense Grid',
    keyFeatures: [
      'Maximizes 1440p and 4K ultra-wide monitor utility',
      'Multi-column financial tickers or live telemetry streams',
      'Flexible modular card sizing across 6 or 12 grid tracks',
      'Real-time data stream refresh indicators',
    ],
    codeReact: `export const FullWidthDashboard = () => (
  <div className="w-full min-h-screen bg-neutral-950 text-white">
    <nav className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between">Top Bar</nav>
    <div className="p-6 grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-8 bg-neutral-900 p-4 rounded-xl border border-neutral-800">Chart</div>
      <div className="col-span-12 lg:col-span-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800">Feed</div>
    </div>
  </div>
);`,
    codeHtml: `<div class="fullwidth-layout">
  <nav class="fullwidth-nav">...</nav>
  <div class="dense-grid">...</div>
</div>`,
    tags: ['Full-Width', 'Ultra-Wide', 'Trading', 'High Density'],
  },
  {
    id: 'three-column-dashboard',
    name: 'Three-Column Dashboard',
    description: 'Sophisticated tri-panel architecture: left navigation, center primary content/list, and right contextual inspector/action drawer.',
    useCase: 'Email clients (Gmail, Superhuman), messaging apps (Slack), CRM deal inspectors, and file management suites.',
    layoutType: 'Navigation + Main Content + Detail/Inspector Drawer',
    keyFeatures: [
      'Left panel: folder or workspace hierarchy',
      'Center panel: message list, items, or table',
      'Right panel: active item preview, metadata inspector, and actions',
      'Independent scrollbars for each column',
    ],
    codeReact: `export const ThreeColumnDashboard = () => (
  <div className="flex h-screen overflow-hidden bg-white">
    <div className="w-56 border-r p-4">Folders</div>
    <div className="w-80 border-r overflow-y-auto">Item List</div>
    <div className="flex-1 p-6 overflow-y-auto">Detail Inspector</div>
  </div>
);`,
    codeHtml: `<div class="three-column-layout">
  <div class="column-left">...</div>
  <div class="column-center">...</div>
  <div class="column-right">...</div>
</div>`,
    tags: ['Three-Column', 'Inspector', 'Email', 'Messaging', 'Master-Detail'],
  },
  {
    id: 'mobile-dashboard',
    name: 'Mobile Dashboard',
    description: 'Compact touch-first dashboard optimized for mobile phone viewports, featuring bottom navigation tabs, swipeable cards, and collapsible accordions.',
    useCase: 'Mobile banking apps, fitness trackers, on-the-go notifications, and responsive web apps (PWAs).',
    layoutType: 'Vertical Touch-Scroll + Bottom Fixed Tab Bar',
    keyFeatures: [
      'Fixed bottom navigation with 4-5 touch-friendly icons',
      'Horizontal swipeable metric pill carousels',
      'Quick action circle buttons for primary user tasks',
      'Pull-to-refresh and collapsible search bars',
    ],
    codeReact: `export const MobileDashboard = () => (
  <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col justify-between">
    <div className="p-4 space-y-4">
      <header className="flex justify-between items-center">Profile & Alerts</header>
      <div className="flex gap-3 overflow-x-auto pb-2">Swipeable Metric Cards</div>
      <div className="bg-white p-4 rounded-2xl shadow-sm">Recent Activity</div>
    </div>
    <nav className="sticky bottom-0 bg-white border-t p-3 flex justify-around">Bottom Tabs</nav>
  </div>
);`,
    codeHtml: `<div class="mobile-dashboard">
  <div class="mobile-content">...</div>
  <nav class="bottom-tab-bar">...</nav>
</div>`,
    tags: ['Mobile', 'PWA', 'Touch-First', 'Bottom Navigation'],
  },
];
