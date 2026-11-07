import { WebsiteLayoutItem } from './types.js';

export const WEBSITE_LAYOUTS: WebsiteLayoutItem[] = [
  {
    id: 'landing-page',
    name: 'Landing Page Layout',
    description: 'High-converting single-page marketing architecture designed to guide visitors smoothly from hero headline through social proof, features, and call-to-action.',
    useCase: 'Product launches, marketing campaigns, software promotions, and lead generation.',
    bestFor: 'Startups, digital products, app downloads, and marketing teams.',
    features: [
      'Sticky navigation bar with primary CTA',
      'Hero section with dynamic headline, subtitle, and action buttons',
      'Logo cloud / Social proof ticker',
      '3-4 key benefit and feature blocks',
      'Customer testimonial quotes or review grid',
      'High-impact final CTA banner and structured footer',
    ],
    codeReact: `export const LandingPageLayout = () => (
  <div className="min-h-screen bg-white">
    <Navbar />
    <HeroSection />
    <SocialProofLogos />
    <FeatureGrid />
    <TestimonialsSection />
    <CallToActionBanner />
    <Footer />
  </div>
);`,
    codeHtml: `<header class="navbar">...</header>
<main>
  <section class="hero">...</section>
  <section class="logos">...</section>
  <section class="features">...</section>
  <section class="testimonials">...</section>
  <section class="cta">...</section>
</main>
<footer class="footer">...</footer>`,
    tags: ['Marketing', 'High-Converting', 'Hero', 'Features', 'Testimonials'],
  },
  {
    id: 'saas-website',
    name: 'SaaS Website Layout',
    description: 'Modern software product layout showcasing interactive interactive product demos, feature deep dives, integrations, security compliance, and pricing tiers.',
    useCase: 'B2B and B2C cloud software applications, developer platforms, and enterprise tooling.',
    bestFor: 'Software-as-a-Service businesses, API providers, and productivity suites.',
    features: [
      'Interactive product screenshot or mock UI hero preview',
      'Feature tab navigation with live animated preview panels',
      'Interactive integrations logo wall (Slack, GitHub, Figma, etc.)',
      'Interactive interactive ROI calculator or metrics showcase',
      'Pricing tiers preview and enterprise security badge section',
    ],
    codeReact: `export const SaasWebsiteLayout = () => (
  <div className="bg-slate-950 text-white min-h-screen">
    <SaasNavbar />
    <ProductPreviewHero />
    <InteractiveFeatureTabs />
    <IntegrationsWall />
    <PricingOverview />
    <EnterpriseSecurityBanner />
    <SaasFooter />
  </div>
);`,
    codeHtml: `<nav class="saas-nav">...</nav>
<section class="saas-hero">
  <div class="product-mockup">...</div>
</section>
<section class="interactive-features">...</section>
<section class="integrations">...</section>`,
    tags: ['SaaS', 'B2B', 'Tech', 'Product Tour', 'Pricing'],
  },
  {
    id: 'portfolio-website',
    name: 'Portfolio Website Layout',
    description: 'Visual showcase layout tailored for designers, developers, photographers, and creatives to display case studies, skills, and contact opportunities.',
    useCase: 'Creative freelancer showcases, job hunting, agency client acquisition, and personal branding.',
    bestFor: 'Frontend developers, UI/UX designers, creative directors, and photographers.',
    features: [
      'Bold typographic introduction stating specialty and availability',
      'Filterable project gallery (Web, Mobile, Branding, Open Source)',
      'Rich case study preview cards with tags and live demo links',
      'Skills and technology stack badges',
      'Interactive contact inquiry form or direct Calendly booking',
    ],
    codeReact: `export const PortfolioWebsiteLayout = () => (
  <div className="max-w-6xl mx-auto px-6 py-12">
    <header className="flex justify-between items-center py-6">Logo & Status</header>
    <HeroIntro name="Alex Dev" role="Senior UI Engineer" />
    <ProjectFilterBar />
    <CaseStudyGrid />
    <TechStackSection />
    <ContactInquiry />
  </div>
);`,
    codeHtml: `<div class="portfolio-container">
  <header>...</header>
  <section class="intro">...</section>
  <section class="projects-grid">...</section>
  <section class="contact">...</section>
</div>`,
    tags: ['Portfolio', 'Case Studies', 'Freelance', 'Design', 'Creative'],
  },
  {
    id: 'blog-layout',
    name: 'Blog & Editorial Layout',
    description: 'Content-first publishing architecture optimized for readability, featured articles, topic tag filters, reading time indicators, and author profiles.',
    useCase: 'Technical engineering blogs, digital magazines, news publications, and company updates.',
    bestFor: 'Content creators, publication platforms, tech companies, and educators.',
    features: [
      'Featured hero story with large cover image and summary',
      'Topic category filter pills (Engineering, Design, Tutorials)',
      'Two-column layout: main article stream + trending sidebar',
      'Estimated reading time and publish date metadata',
      'Newsletter subscription callout card',
    ],
    codeReact: `export const BlogLayout = () => (
  <div className="bg-[#FAF7F2] min-h-screen">
    <BlogHeader />
    <div className="max-w-7xl mx-auto px-4 py-8">
      <FeaturedPostHero />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 space-y-8"><PostFeed /></div>
        <aside><TrendingTopics /><NewsletterCard /></aside>
      </div>
    </div>
  </div>
);`,
    codeHtml: `<div class="blog-wrapper">
  <header class="blog-nav">...</header>
  <article class="featured-post">...</article>
  <div class="blog-columns">
    <main class="post-list">...</main>
    <aside class="sidebar">...</aside>
  </div>
</div>`,
    tags: ['Blog', 'Editorial', 'Publishing', 'Articles', 'Newsletter'],
  },
  {
    id: 'documentation-layout',
    name: 'Documentation Layout',
    description: 'Technical knowledge base featuring a three-column layout: collapsible left sidebar navigation, central Markdown documentation with code blocks, and right table of contents.',
    useCase: 'Developer API docs, open-source library guides, software manuals, and product wikis.',
    bestFor: 'Developers, developer tool teams, libraries, and technical writers.',
    features: [
      'Left sticky sidebar with search and hierarchical page links',
      'Central reader column with heading anchors and copyable code blocks',
      'Right table of contents tracking current scroll position (On this page)',
      'Quick feedback widget (Was this page helpful? Yes/No)',
      'Previous / Next page navigation footer buttons',
    ],
    codeReact: `export const DocumentationLayout = () => (
  <div className="flex min-h-screen bg-white">
    <DocSidebar className="w-64 border-r hidden md:block" />
    <main className="flex-1 max-w-4xl px-8 py-10">
      <Breadcrumbs />
      <MarkdownContent />
      <PrevNextLinks />
    </main>
    <TableOfContents className="w-56 border-l hidden lg:block" />
  </div>
);`,
    codeHtml: `<div class="docs-container">
  <aside class="docs-nav">...</aside>
  <main class="docs-article">...</main>
  <aside class="docs-toc">...</aside>
</div>`,
    tags: ['Documentation', 'Docs', 'API', 'Code Blocks', 'Table of Contents'],
  },
  {
    id: 'ecommerce-layout',
    name: 'E-commerce Storefront Layout',
    description: 'Retail and merchandise catalog with multi-facet filters (price, category, rating, size), product cards with quick-add buttons, cart drawer, and badges.',
    useCase: 'Online retail stores, digital product marketplaces, apparel brands, and hardware sales.',
    bestFor: 'Direct-to-consumer brands, digital assets shops, and merchants.',
    features: [
      'Top announcement banner for sales and free shipping thresholds',
      'Filter sidebar with checkboxes, price sliders, and sort dropdowns',
      'Responsive product grid with hover image switches and discount badges',
      'Quick view modal and slide-out shopping cart drawer',
      'Customer reviews rating stars and wishlist toggle icons',
    ],
    codeReact: `export const EcommerceLayout = () => (
  <div className="min-h-screen bg-white">
    <PromoBanner />
    <StoreHeader cartCount={3} />
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      <FilterSidebar className="w-64" />
      <ProductCatalogGrid className="flex-1" />
    </div>
  </div>
);`,
    codeHtml: `<div class="storefront">
  <div class="promo-bar">...</div>
  <header class="store-nav">...</header>
  <div class="shop-grid">
    <aside class="filters">...</aside>
    <main class="products">...</main>
  </div>
</div>`,
    tags: ['E-commerce', 'Shop', 'Products', 'Filters', 'Cart'],
  },
  {
    id: 'agency-website',
    name: 'Agency Website Layout',
    description: 'Bold, client-focused layout presenting creative capabilities, team credentials, awards, high-impact video reels, and client consultation funnels.',
    useCase: 'Design agencies, software development consultancies, marketing firms, and video production studios.',
    bestFor: 'Agencies, consultancies, design studios, and creative collectives.',
    features: [
      'Full-bleed hero typography with video reel preview',
      'Services list with interactive hover preview images',
      'Selected client portfolio highlights with awards won',
      'Client logos grid and trusted partner endorsements',
      'Project kickoff inquiry form with budget selectors',
    ],
    codeReact: `export const AgencyWebsiteLayout = () => (
  <div className="bg-black text-white min-h-screen">
    <AgencyNav />
    <FullBleedHero />
    <CapabilitiesSection />
    <FeaturedClientWorks />
    <ClientReviewsSlider />
    <ProjectInquiryForm />
  </div>
);`,
    codeHtml: `<div class="agency-site">
  <header>...</header>
  <section class="agency-hero">...</section>
  <section class="services">...</section>
  <section class="work">...</section>
</div>`,
    tags: ['Agency', 'Creative', 'Consulting', 'Bold', 'Services'],
  },
  {
    id: 'personal-website',
    name: 'Personal Website Layout',
    description: 'Authentic personal bio and digital garden layout combining biography, current interests, reading lists, latest posts, and contact links.',
    useCase: 'Personal domain homepages, digital gardens, independent researchers, and indie hackers.',
    bestFor: 'Solopreneurs, writers, researchers, students, and engineers.',
    features: [
      'Profile avatar with status indicator (Available for hire / building)',
      'Short engaging personal bio and journey timeline',
      'Current focus & currently reading widget',
      'Recent projects, essays, and podcast episodes',
      'Direct social media links and RSS feed subscribe button',
    ],
    codeReact: `export const PersonalWebsiteLayout = () => (
  <div className="max-w-2xl mx-auto px-6 py-16 font-sans">
    <ProfileHeader avatarUrl="/avatar.jpg" status="Building VexoraMods" />
    <BioParagraph />
    <CurrentFocusCard />
    <RecentWritingsList />
    <SocialLinksRow />
  </div>
);`,
    codeHtml: `<div class="personal-homepage">
  <header class="bio-header">...</header>
  <section class="bio-content">...</section>
  <section class="now-widget">...</section>
</div>`,
    tags: ['Personal', 'Bio', 'Digital Garden', 'Indie', 'Minimal'],
  },
  {
    id: 'educational-website',
    name: 'Educational Website Layout',
    description: 'Learning portal structured around course curricula, learning paths, video player integration, interactive quizzes, and student progress bars.',
    useCase: 'Online learning academies, university course portals, coding bootcamps, and tutorial hubs.',
    bestFor: 'Educators, course creators, schools, and tutorial platforms.',
    features: [
      'Searchable course directory by difficulty level and topic',
      'Course curriculum breakdown with module checklists',
      'Student progress tracker (e.g. 64% Completed)',
      'Instructor bios and certificate of completion badges',
      'Student discussion forum and community Q&A preview',
    ],
    codeReact: `export const EducationalWebsiteLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <EduHeader />
    <HeroLearningSearch />
    <LearningPathsSection />
    <PopularCoursesGrid />
    <StudentTestimonials />
  </div>
);`,
    codeHtml: `<div class="edu-portal">
  <header>...</header>
  <section class="course-finder">...</section>
  <section class="learning-paths">...</section>
</div>`,
    tags: ['Education', 'Courses', 'Learning', 'Curriculum', 'Study'],
  },
  {
    id: 'community-website',
    name: 'Community Website Layout',
    description: 'Engagement-centric platform for community discussions, member directories, upcoming events, leaderboard rankings, and shared resources.',
    useCase: 'Developer communities, open-source forums, hobbyist guilds, and membership associations.',
    bestFor: 'Community managers, developer relations, DAOs, and clubs.',
    features: [
      'Community banner with member counter and join invitation',
      'Top active discussions thread with upvote buttons',
      'Upcoming virtual events and meetups calendar card',
      'Top contributors leaderboard with badges',
      'Community guidelines and welcome resource links',
    ],
    codeReact: `export const CommunityWebsiteLayout = () => (
  <div className="min-h-screen bg-stone-50">
    <CommunityNavbar />
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <CommunitySidebar className="lg:col-span-1" />
      <DiscussionStream className="lg:col-span-2" />
      <LeaderboardWidget className="lg:col-span-1" />
    </div>
  </div>
);`,
    codeHtml: `<div class="community-hub">
  <header>...</header>
  <div class="community-grid">
    <aside class="channels">...</aside>
    <main class="discussions">...</main>
    <aside class="leaderboard">...</aside>
  </div>
</div>`,
    tags: ['Community', 'Forum', 'Leaderboard', 'Discussions', 'Events'],
  },
  {
    id: 'authentication-layout',
    name: 'Authentication Layout',
    description: 'Split-screen or centered authentication experience with branded visual storytelling on one side and a clean, accessible login/signup form on the other.',
    useCase: 'Login, registration, password recovery, SSO, and two-factor authentication gates.',
    bestFor: 'All web applications requiring user accounts.',
    features: [
      'Two-column split view (Marketing visual on left, form on right)',
      'Social OAuth buttons (Google, GitHub, Apple)',
      'Dividing "Or continue with email" separator',
      'Floating label inputs with show/hide password toggle',
      'Clear terms of service agreement disclaimer and footer help link',
    ],
    codeReact: `export const AuthenticationLayout = () => (
  <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
    <div className="hidden lg:flex flex-col justify-between p-12 bg-neutral-900 text-white">
      <BrandLogo />
      <TestimonialQuote />
      <FooterCopyright />
    </div>
    <div className="flex items-center justify-center p-8 bg-white">
      <div className="w-full max-w-md space-y-6">
        <AuthFormHeader />
        <SocialAuthButtons />
        <LoginForm />
      </div>
    </div>
  </div>
);`,
    codeHtml: `<div class="auth-split-layout">
  <div class="auth-visual-panel">...</div>
  <div class="auth-form-panel">
    <form class="auth-form">...</form>
  </div>
</div>`,
    tags: ['Auth', 'Login', 'Signup', 'Split Screen', 'Form'],
  },
  {
    id: 'pricing-page-layout',
    name: 'Pricing Page Layout',
    description: 'Strategic pricing table architecture featuring billing frequency toggles (Monthly / Annual), tiered plan cards, feature comparison matrix, and FAQ accordion.',
    useCase: 'Subscription SaaS products, membership plans, service tiers, and software licenses.',
    bestFor: 'SaaS platforms, memberships, digital service agencies.',
    features: [
      'Billing frequency switch (Monthly vs Annual with discount badge)',
      '3-4 tiered plan cards (Hobby, Pro, Team, Enterprise)',
      'Highlighted "Most Popular" or "Best Value" central plan card',
      'Feature-by-feature comparison checklist matrix',
      'Frequently asked questions (FAQ) collapsible accordions',
    ],
    codeReact: `export const PricingPageLayout = () => (
  <div className="py-20 px-4 bg-slate-50 min-h-screen">
    <PricingHeader />
    <BillingCycleToggle />
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
      <PricingCard tier="Starter" price="$0" />
      <PricingCard tier="Pro" price="$29" isPopular />
      <PricingCard tier="Enterprise" price="Custom" />
    </div>
    <FeatureComparisonMatrix />
    <PricingFaqSection />
  </div>
);`,
    codeHtml: `<div class="pricing-page">
  <div class="pricing-header">...</div>
  <div class="billing-toggle">...</div>
  <div class="pricing-cards">...</div>
  <div class="faq-section">...</div>
</div>`,
    tags: ['Pricing', 'Tiers', 'Comparison', 'FAQ', 'SaaS'],
  },
];
