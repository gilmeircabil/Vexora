import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router';
import {
  TOOL_CATALOG,
  UNIFIED_CATEGORIES,
  isAiPoweredTool,
  getUnifiedCategory,
  getToolRoute,
  getRequiredModel,
} from '../tools/catalog.js';
import { AppLayout } from '../components/layout/AppLayout.js';
import { Header } from '../components/layout/Header.js';
import { Footer } from '../components/layout/Footer.js';
import { HomePage } from '../pages/HomePage.js';
import { HowItWorksPage } from '../pages/HowItWorksPage.js';
import { PrivacyPage } from '../pages/PrivacyPage.js';
import { TermsPage } from '../pages/TermsPage.js';
import { LicensesPage } from '../pages/LicensesPage.js';
import { ContactPage } from '../pages/ContactPage.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { supportChatApi } from '../services/supportChatApi.js';
import { ToolsDirectoryPage } from '../pages/ToolsDirectoryPage.js';
import { ReviewsPage } from '../pages/ReviewsPage.js';
import { CommunityPage } from '../pages/community/CommunityPage.js';
import { LearningHubPage } from '../pages/learning/LearningHubPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';
import { MaintenanceProvider } from '../context/MaintenanceContext.js';
import { FavoritesProvider } from '../context/FavoritesContext.js';

describe('VexoraMods Unified Platform Restructuring Suite', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (typeof url === 'string' && url.includes('/api/reviews/summary')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                averageRating: 0,
                totalApproved: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                recentReviews: [],
              },
            }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/reviews')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                reviews: [
                  {
                    _id: 'rev-101',
                    userId: 'u-1',
                    userName: 'Maya Lin',
                    userAvatar: '',
                    rating: 5,
                    comment: 'Studio and PDF tools saved me hours!',
                    createdAt: '2026-10-30T12:00:00.000Z',
                    updatedAt: '2026-10-30T12:00:00.000Z',
                  },
                ],
                pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
                summary: {
                  averageRating: 5.0,
                  totalApproved: 1,
                  distribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
                },
              },
            }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/auth/me')) {
          const savedUser = localStorage.getItem('tn_user');
          if (savedUser) {
            return {
              ok: true,
              json: async () => ({
                success: true,
                data: JSON.parse(savedUser),
              }),
            };
          }
        }
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              items: [],
              total: 0,
              totalAmount: 1500,
              uniqueSupporters: 4,
              totalDonations: 6,
              allTime: [
                {
                  displayName: 'Alex Builder',
                  totalAmount: 1000,
                  donationCount: 3,
                  isAnonymous: false,
                },
              ],
              monthly: [],
              recent: [],
              service: { nodeBackend: 'online' },
              readyTools: {},
            },
          }),
        };
      }),
    );
  });

  it('unifies all standard and AI-powered tools into TOOL_CATALOG with required metadata', () => {
    expect(TOOL_CATALOG.length).toBeGreaterThanOrEqual(38);
    const aiTools = TOOL_CATALOG.filter((t) => isAiPoweredTool(t));
    expect(aiTools.length).toBeGreaterThanOrEqual(5);

    for (const tool of TOOL_CATALOG) {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(getUnifiedCategory(tool)).toBeTruthy();
      expect(getToolRoute(tool)).toMatch(/^\/(tools|ai-tools)\//);
      expect(getRequiredModel(tool)).toBeTruthy();
    }

    expect(UNIFIED_CATEGORIES).toEqual([
      'Image',
      'PDF',
      'Text',
      'Developer',
      'Productivity',
      'Media',
      'Design',
    ]);
  });

  it('renders Header with app name linking to Home and primary navigation (Web Tool, How it works, Contact) without Categories', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy as any;

    const homeLogoLink = screen.getByLabelText('VexoraMods Home');
    expect(homeLogoLink).toHaveAttribute('href', '/');
    fireEvent.click(homeLogoLink);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });

    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Web Tool' })).toHaveAttribute('href', '/tools');
    expect(screen.getByRole('link', { name: 'How it works' })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
    expect(screen.queryByRole('link', { name: 'Categories' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
    expect(screen.queryByText('Developer Hub')).not.toBeInTheDocument();
  });

  it('hides Header completely and does NOT render a Back to Home button on the 8 workspace routes', () => {
    const workspacePaths = [
      '/ai-tools/chat',
      '/studio',
      '/ui-library',
      '/learning',
      '/study',
      '/discover',
      '/community',
      '/lovelink',
    ];

    for (const path of workspacePaths) {
      const { container, unmount } = render(
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={[path]}>
              <Header />
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>,
      );

      expect(container.querySelector('header')).toBeNull();
      expect(screen.queryByRole('link', { name: 'Web Tool' })).not.toBeInTheDocument();
      unmount();
    }

    const { unmount: unmountLayout } = render(
      <ToastProvider>
        <AuthProvider>
          <MaintenanceProvider>
            <FavoritesProvider>
              <MemoryRouter initialEntries={['/community']}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/community" element={<div>Community Content</div>} />
                  </Route>
                </Routes>
              </MemoryRouter>
            </FavoritesProvider>
          </MaintenanceProvider>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.queryByTestId('workspace-back-home')).not.toBeInTheDocument();
    expect(screen.queryByTestId('workspace-fab-header')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Web Tool' })).not.toBeInTheDocument();
    unmountLayout();
  });

  it('renders dedicated HowItWorksPage with 3-step pipeline, workspace breakdown, and FAQ', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HowItWorksPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(
      screen.getByRole('heading', { name: /How VexoraMods Works/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Choose a Tool or Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Compute Locally on Your Device/i)).toBeInTheDocument();
    expect(screen.getByText(/Export, Save, or Share Instantly/i)).toBeInTheDocument();
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
  });

  it('allows unauthenticated guests to access /tools and /how-it-works without Sign In Required modal', async () => {
    localStorage.clear();

    const { unmount } = render(
      <ToastProvider>
        <AuthProvider>
          <MaintenanceProvider>
            <FavoritesProvider>
              <MemoryRouter initialEntries={['/tools']}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/tools" element={<ToolsDirectoryPage />} />
                  </Route>
                </Routes>
              </MemoryRouter>
            </FavoritesProvider>
          </MaintenanceProvider>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText('Browse All 43 Tools')).toBeInTheDocument();
    expect(screen.queryByText('Sign In Required')).not.toBeInTheDocument();
    unmount();

    render(
      <ToastProvider>
        <AuthProvider>
          <MaintenanceProvider>
            <FavoritesProvider>
              <MemoryRouter initialEntries={['/how-it-works']}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                  </Route>
                </Routes>
              </MemoryRouter>
            </FavoritesProvider>
          </MaintenanceProvider>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByRole('heading', { name: /How VexoraMods Works/i })).toBeInTheDocument();
    expect(screen.queryByText('Sign In Required')).not.toBeInTheDocument();
  });

  it('renders the 8-item Platform Workspaces card grid on HomePage under the Hero section', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    const statsHeading = screen.getByRole('heading', {
      name: /Built for scale, verified by community/i,
    });
    const workspacesHeading = screen.getByRole('heading', {
      name: /Explore Our Platform Workspaces/i,
    });
    expect(workspacesHeading).toBeInTheDocument();
    const grid = screen.getByTestId('platform-workspaces-grid');
    expect(grid).toBeInTheDocument();
    expect(
      Boolean(statsHeading.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
    expect(within(grid).getByRole('link', { name: /^AI Chat/i })).toHaveAttribute('href', '/ai-chat');
    expect(within(grid).getByRole('link', { name: /^Studio/i })).toHaveAttribute('href', '/studio');
    expect(within(grid).getByRole('link', { name: /^UI Library/i })).toHaveAttribute('href', '/ui-library');
    expect(within(grid).getByRole('link', { name: /^Learning Hub/i })).toHaveAttribute('href', '/learning');
    expect(within(grid).getByRole('link', { name: /^Study Space/i })).toHaveAttribute('href', '/study');
    expect(within(grid).getByRole('link', { name: /^Discover/i })).toHaveAttribute('href', '/discover');
    expect(within(grid).getByRole('link', { name: /^Community/i })).toHaveAttribute('href', '/community');
    expect(within(grid).getByRole('link', { name: /^LoveLink/i })).toHaveAttribute('href', '/lovelink');
  });

  it('does NOT render the flagship spotlight bento section or landmark tools on HomePage', () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.queryByText(/We developed landmark tools/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/WHO WE ARE/i)).not.toBeInTheDocument();
    expect(container.querySelector('#how-it-works')).not.toBeInTheDocument();
  });

  it('replaces Homepage Contact section with Ratings & Reviews section, zero-review state, Write a Review modal, and View All Reviews link', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    // Contact section is removed from homepage
    expect(screen.queryByText(/Contact & Feedback/i)).not.toBeInTheDocument();

    // Ratings & Reviews section is present
    expect(screen.getByText('What People Say About VexoraMods')).toBeInTheDocument();
    expect(
      screen.getByText('Your feedback helps us improve and build better tools for everyone.'),
    ).toBeInTheDocument();

    // Wait for zero-review state
    await waitFor(() => {
      expect(screen.getByText('Be the first to review VexoraMods.')).toBeInTheDocument();
    });
    expect(screen.getByTestId('homepage-average-rating')).toHaveTextContent('0.0');

    // View All Reviews link points to /reviews
    const viewAllLink = screen.getByRole('link', { name: /View All Reviews/i });
    expect(viewAllLink).toHaveAttribute('href', '/reviews');

    // Write a Review opens the review modal
    const writeButtons = screen.getAllByRole('button', { name: /Write a Review/i });
    fireEvent.click(writeButtons[0]!);
    expect(screen.getByText('Write a Review for VexoraMods')).toBeInTheDocument();
  });

  it('renders public ReviewsPage with approved reviews and rating distribution', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ReviewsPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText('What People Say About VexoraMods')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Maya Lin')).toBeInTheDocument();
      expect(screen.getByText(/Studio and PDF tools saved me hours!/i)).toBeInTheDocument();
    });
  });

  it('renders Footer with About, All Tools, Studio, Learning Hub, Community, Reviews, Privacy Policy, and Terms of Use', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Footer />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'All Tools' })).toHaveAttribute('href', '/tools');
    expect(screen.getByRole('link', { name: 'Studio' })).toHaveAttribute('href', '/studio');
    expect(screen.getByRole('link', { name: 'Learning Hub' })).toHaveAttribute('href', '/learning');
    expect(screen.getByRole('link', { name: 'Community' })).toHaveAttribute('href', '/community');
    expect(screen.getByRole('link', { name: 'Reviews' })).toHaveAttribute('href', '/reviews');
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy',
    );
    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'Licenses' })).toHaveAttribute('href', '/licenses');
  });

  it('renders remade PrivacyPage, TermsPage, and LicensesPage with legal switcher tabs and complete platform information', () => {
    const { unmount: unmountPrivacy } = render(
      <BrowserRouter>
        <PrivacyPage />
      </BrowserRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /Privacy Policy & Data Architecture/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('legal-nav-tabs')).toBeInTheDocument();
    expect(screen.getByText(/Vexora AI Chat & Neural Utilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Vexora Discover & Geolocation Privacy/i)).toBeInTheDocument();
    unmountPrivacy();

    const { unmount: unmountTerms } = render(
      <BrowserRouter>
        <TermsPage />
      </BrowserRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /Terms of Use & Platform Agreement/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('legal-nav-tabs')).toBeInTheDocument();
    expect(screen.getByText(/Public Web Tools vs\. Authenticated Workspaces/i)).toBeInTheDocument();
    expect(screen.getByText(/Learning Hub, Community & LoveLink Standards/i)).toBeInTheDocument();
    unmountTerms();

    render(
      <BrowserRouter>
        <LicensesPage />
      </BrowserRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /Open Source Licenses & Attributions/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('legal-nav-tabs')).toBeInTheDocument();
    expect(screen.getByText(/Fabric\.js/i)).toBeInTheDocument();
    expect(screen.getByText(/Commercial Use/i)).toBeInTheDocument();
  });

  it('removes All Tools directory from HomePage and renders it on dedicated ToolsDirectoryPage (/tools) with search, category filters, and AI tool badges', () => {
    const { unmount } = render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    // Verify All Tools Directory is NOT on HomePage
    expect(screen.queryByText('Browse All 43 Tools')).not.toBeInTheDocument();
    unmount();

    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ToolsDirectoryPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    // Verify tools directory is present on ToolsDirectoryPage
    expect(screen.getByText('Browse All 43 Tools')).toBeInTheDocument();
    expect(screen.getByText('AI Background Remover')).toBeInTheDocument();
    expect(screen.getByText('PDF Merger')).toBeInTheDocument();

    // Search for tools
    const searchInput = screen.getByPlaceholderText(/Search all/i);
    fireEvent.change(searchInput, { target: { value: 'PDF' } });

    // Filter to PDF category
    const pdfBtn = screen.getAllByRole('button', { name: /PDF/i })[0]!;
    fireEvent.click(pdfBtn);
    expect(screen.getByText('PDF Merger')).toBeInTheDocument();
  });

  it('renders unified CommunityPage combining Support donation form and Supporter Leaderboard', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <CommunityPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText('Support VexoraMods')).toBeInTheDocument();
    expect(screen.getByText('Supporter Leaderboard')).toBeInTheDocument();
    expect(screen.getByText(/Make my donation anonymous/i)).toBeInTheDocument();
  });

  it('renders LearningHubPage with topic categories in Categories & Topics and post creation CTA', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <LearningHubPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText(/Learn, Teach & Build Together/i)).toBeInTheDocument();
    expect(screen.getByText('Write a Post / Tutorial')).toBeInTheDocument();

    // Topics view contains multidisciplinary domains and topics
    fireEvent.click(screen.getByRole('button', { name: /Categories & Topics/i }));
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('AI and Machine Learning')).toBeInTheDocument();
  });

  it('renders LearningHubPage with all 8 primary marketplace & community areas and open multidisciplinary topics', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <LearningHubPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    // 8 primary navigation areas
    expect(screen.getByRole('button', { name: /Explore/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Free Learning/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Paid Learning/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Categories & Topics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Creator Profiles/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish Learning/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /My Library/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Creator Dashboard/i })).toBeInTheDocument();

    // Open multidisciplinary topics beyond programming under Categories & Topics
    fireEvent.click(screen.getByRole('button', { name: /Categories & Topics/i }));
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Photography')).toBeInTheDocument();
    expect(screen.getByText('Cooking')).toBeInTheDocument();
  });

  it('renders RegisterPage with Confirm Password, show/hide controls, password requirements, and Turnstile widget', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <RegisterPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    const confirmInput = screen.getByLabelText(/^Confirm Password$/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
    expect(confirmInput.type).toBe('password');

    // Toggle show password
    const showBtn = screen.getByRole('button', { name: 'Show password' });
    fireEvent.click(showBtn);
    expect(passwordInput.type).toBe('text');

    // Type mismatched passwords and verify live validation message
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPassword' } });
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    expect(submitBtn).toBeDisabled();

    // Fix confirmPassword to match
    fireEvent.change(confirmInput, { target: { value: 'StrongPassword123' } });
    expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument();
    expect(screen.getByText('Cloudflare Turnstile')).toBeInTheDocument();
  }, 15000);

  it('renders LoginPage with show/hide password toggle, Forgot password link, and Turnstile widget', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const showBtn = screen.getByRole('button', { name: 'Show password' });
    fireEvent.click(showBtn);
    expect(passwordInput.type).toBe('text');

    expect(screen.getByRole('link', { name: /Forgot password\?/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.getByText('Cloudflare Turnstile')).toBeInTheDocument();
  }, 15000);

  it('requires login or registration to access ContactPage (/contact) and supports two-way User-to-Admin live support chat when authenticated', async () => {
    localStorage.clear();

    const { unmount: unmountGuest } = render(
      <ToastProvider>
        <AuthProvider>
          <MaintenanceProvider>
            <FavoritesProvider>
              <MemoryRouter initialEntries={['/contact']}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/contact" element={<ContactPage />} />
                  </Route>
                </Routes>
              </MemoryRouter>
            </FavoritesProvider>
          </MaintenanceProvider>
        </AuthProvider>
      </ToastProvider>,
    );

    // Unauthenticated guest on /contact must see Sign In Required modal with Login and Register links
    expect(await screen.findByText(/Sign In Required/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In to Proceed/i })).toHaveAttribute(
      'href',
      '/login?redirect=%2Fcontact',
    );
    expect(screen.getByRole('link', { name: /Create Free Account/i })).toHaveAttribute(
      'href',
      '/register?redirect=%2Fcontact',
    );
    expect(screen.getByTestId('page-transition-stage')).toHaveClass('pointer-events-none');
    unmountGuest();

    // Authenticate user and render /contact
    localStorage.setItem('tn_token', 'test-user-jwt');
    localStorage.setItem(
      'tn_user',
      JSON.stringify({
        id: 'user-1',
        username: 'alex',
        name: 'Alex Rivera',
        email: 'alex@example.com',
        role: 'user',
      }),
    );

    const { unmount } = render(
      <ToastProvider>
        <AuthProvider>
          <MaintenanceProvider>
            <FavoritesProvider>
              <MemoryRouter initialEntries={['/contact']}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/contact" element={<ContactPage />} />
                  </Route>
                </Routes>
              </MemoryRouter>
            </FavoritesProvider>
          </MaintenanceProvider>
        </AuthProvider>
      </ToastProvider>,
    );

    const chatContainer = await screen.findByTestId('contact-admin-chat');
    expect(chatContainer).toBeInTheDocument();
    expect(screen.queryByText(/Sign In Required/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('contact-rate-limit-badge')).toHaveTextContent(/5\/5 left • 15m/i);

    // Authenticated user sends a chat message directly without guest Name/Email inputs
    expect(screen.queryByPlaceholderText(/Your Name/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Write a message to Admin/i), {
      target: { value: 'Hello Admin, can I request a new SVG export preset?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Hello Admin, can I request a new SVG export preset?'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('contact-rate-limit-badge')).toHaveTextContent(/4\/5 left • 15m/i);
      expect(screen.getByRole('button', { name: /Wait \d+s/i })).toBeDisabled();
    });

    // Verify Admin can view the thread and reply via supportChatApi, and the reply appears in the thread
    const threads = await supportChatApi.getAllThreadsForAdmin();
    expect(threads.length).toBeGreaterThanOrEqual(1);
    const activeThread = threads[0]!;
    expect(activeThread.email).toBe('alex@example.com');

    await supportChatApi.sendAdminReply(
      activeThread._id,
      'Hi Alex! Yes, we can add custom SVG export presets in the next Studio update.',
      'Vexora Admin',
    );

    fireEvent.click(screen.getByRole('button', { name: /Refresh Chat/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Hi Alex! Yes, we can add custom SVG export presets in the next Studio update.',
        ),
      ).toBeInTheDocument();
    });

    unmount();
  });

  it('applies smooth page transition stage and top golden progress bar on route changes in AppLayout', () => {
    const { unmount } = render(
      <ToastProvider>
        <AuthProvider>
          <MaintenanceProvider>
            <FavoritesProvider>
              <MemoryRouter initialEntries={['/']}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<div>Home View</div>} />
                    <Route path="/how-it-works" element={<div>How It Works View</div>} />
                  </Route>
                </Routes>
              </MemoryRouter>
            </FavoritesProvider>
          </MaintenanceProvider>
        </AuthProvider>
      </ToastProvider>,
    );

    const progressBar = screen.getByTestId('route-transition-progress');
    expect(progressBar).toBeInTheDocument();

    const initialStage = screen.getByTestId('page-transition-stage');
    expect(initialStage).toHaveClass('page-transition-enter');
    expect(initialStage).toHaveAttribute('data-route-key', '/');

    // Click "How it works" link in Header to navigate to /how-it-works
    fireEvent.click(screen.getByRole('link', { name: 'How it works' }));

    const nextStage = screen.getByTestId('page-transition-stage');
    expect(nextStage).toHaveClass('page-transition-enter');
    expect(nextStage).toHaveAttribute('data-route-key', '/how-it-works');
    expect(screen.getByText('How It Works View')).toBeInTheDocument();

    unmount();
  });

  it('renders streamlined minimal AdminDashboardPage with only essential controls and no bulky simulated preview clutter', async () => {
    localStorage.clear();
    localStorage.setItem('tn_token', 'test-admin-jwt');
    localStorage.setItem(
      'tn_user',
      JSON.stringify({
        id: 'admin-1',
        username: 'admin',
        name: 'Vexora Admin',
        email: 'admin@vexoramods.com',
        role: 'admin',
      }),
    );

    const { unmount } = render(
      <ToastProvider>
        <AuthProvider>
          <MaintenanceProvider>
            <FavoritesProvider>
              <MemoryRouter initialEntries={['/admin']}>
                <AdminDashboardPage />
              </MemoryRouter>
            </FavoritesProvider>
          </MaintenanceProvider>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(await screen.findByTestId('admin-console-minimal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Admin Console/i })).toBeInTheDocument();

    // Bulky simulated preview cards and redundant contact inquiry sections should NOT exist
    expect(screen.queryByText(/Live Toast Preview \(User Screen\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Live Visitor Modal Preview/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Submitted Contact Inquiries/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Platform Command Center/i)).not.toBeInTheDocument();

    // Essential tabs exist and switch cleanly
    expect(screen.getByRole('button', { name: /Support Chat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Broadcast/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Maintenance/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Users/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Support Chat/i }));
    expect(screen.getByTestId('admin-support-chat-inbox')).toBeInTheDocument();

    unmount();
  });
});
