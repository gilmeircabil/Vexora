import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import {
  TOOL_CATALOG,
  UNIFIED_CATEGORIES,
  isAiPoweredTool,
  getUnifiedCategory,
  getToolRoute,
  getRequiredModel,
} from '../tools/catalog.js';
import { Header } from '../components/layout/Header.js';
import { Footer } from '../components/layout/Footer.js';
import { HomePage } from '../pages/HomePage.js';
import { ReviewsPage } from '../pages/ReviewsPage.js';
import { ToolsDirectoryPage } from '../pages/ToolsDirectoryPage.js';
import { CommunityPage } from '../pages/community/CommunityPage.js';
import { LearningHubPage } from '../pages/learning/LearningHubPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';

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

  it('renders Header with app name linking to Home and primary navigation (All Tools, Studio, Learning Hub, Community)', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    const homeLogoLink = screen.getByLabelText('VexoraMods Home');
    expect(homeLogoLink).toHaveAttribute('href', '/');
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.getByText('All Tools')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
    expect(screen.getByText('Learning Hub')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.queryByText('Developer Hub')).not.toBeInTheDocument();
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

  it('renders Unified All Tools Directory with search, category filters, and AI tool badges', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ToolsDirectoryPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText('All Tools Directory')).toBeInTheDocument();
    expect(screen.getByText('AI Background Remover')).toBeInTheDocument();
    expect(screen.getByText('AI Document OCR')).toBeInTheDocument();
    expect(screen.getByText('PDF Merger')).toBeInTheDocument();

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

  it(
    'renders RegisterPage with Confirm Password, show/hide controls, password requirements, and Turnstile widget',
    () => {
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
});
