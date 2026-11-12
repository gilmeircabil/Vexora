import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { HomePage } from '../pages/HomePage.js';
import { CommunityPage } from '../pages/community/CommunityPage.js';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';

describe('Community Telemetry Strip Visibility', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (typeof url === 'string' && url.includes('/api/platform/home')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                statistics: {
                  totalMembers: 5,
                  publishedLearningPosts: 1,
                  totalSupporters: 0,
                  totalVerifiedDonations: 0,
                  totalDonationsAmount: 0,
                },
                topSupporter: null,
                config: { heroHeadline: '', heroDescription: '', featuredToolIds: [] },
                recentPosts: [],
                reviewsSummary: {
                  averageRating: 5,
                  totalApproved: 1,
                  distribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
                },
              },
            }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/donations/summary')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { totalAmount: 0, uniqueSupporters: 0, totalDonations: 0 },
            }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/donations/leaderboard')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { allTime: [], monthly: [], recent: [], calendarMonth: 'November 2026' },
            }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/reviews')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                averageRating: 5,
                totalApproved: 1,
                distribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
                recentReviews: [],
                reviews: [],
                pagination: { page: 1, limit: 3, total: 1, totalPages: 1 },
                summary: { averageRating: 5, totalApproved: 1, distribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 } },
              },
            }),
          };
        }
        return {
          ok: true,
          json: async () => ({ success: true, data: {} }),
        };
      }),
    );
  });

  it('does NOT render the community telemetry strip or harsh divider line on HomePage', async () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    // Wait for initial async state updates
    await waitFor(() => {
      expect(screen.queryByText('Community Members')).not.toBeInTheDocument();
      expect(screen.queryByText(/Published Tutorials/i)).not.toBeInTheDocument();
      expect(screen.queryByText('Community Supporters')).not.toBeInTheDocument();
      
      // Ensure harsh horizontal divider lines across sections and filters are removed
      const harshDividers = container.querySelectorAll('section.border-t-2.border-black, div.border-b-2.border-black.pb-6');
      expect(harshDividers.length).toBe(0);
    });
  });

  it('does NOT render the VexoraMods — All-in-One Platform pill badge on HomePage', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.queryByText(/VexoraMods — All-in-One Platform/i)).not.toBeInTheDocument();
  });

  it('does NOT render the Built for Everyone manifesto section on HomePage', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.queryByText(/Built for Everyone\. Free & Open Source Forever\./i)).not.toBeInTheDocument();
  });

  it('does NOT render the Study Space for Learners & Educators spotlight section on HomePage', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.queryByText(/Study Space for Learners & Educators/i)).not.toBeInTheDocument();
  });

  it('does NOT render the Design in VexoraMods Studio section on HomePage', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.queryByText(/Design in VexoraMods Studio/i)).not.toBeInTheDocument();
  });

  it('does NOT render the UI Component Library spotlight section on HomePage', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.queryByText(/UI Component Library & Design Center/i)).not.toBeInTheDocument();
  });

  it('does NOT render the Vexora Discover spotlight section on HomePage', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.queryByText(/Location-Based Business Discovery/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Popular Nearby Searches/i)).not.toBeInTheDocument();
  });

  it('renders the community telemetry strip ONLY on CommunityPage as a modern rounded card', async () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <CommunityPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Community Members')).toBeInTheDocument();
      expect(screen.getByText(/Published Tutorials/i)).toBeInTheDocument();
      expect(screen.getByText('Community Supporters')).toBeInTheDocument();
      expect(screen.getByText('Top Public Supporter')).toBeInTheDocument();

      // Ensure telemetry strip is a modern rounded card with shadow instead of harsh border-y lines
      const card = screen.getByText('Community Members').closest('.rounded-3xl, .rounded-2xl');
      expect(card).toBeInTheDocument();
      expect(card?.className).toMatch(/bg-\[var\(--theme-surface\)\]|bg-\[#1e293b\]/);
      expect(card).toHaveClass('border');
      expect(card).not.toHaveClass('border-y-2');
    });
  });
});
