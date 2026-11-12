import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { HomePage } from '../pages/HomePage.js';
import { Header } from '../components/layout/Header.js';
import { Footer } from '../components/layout/Footer.js';
import { AppLayout } from '../components/layout/AppLayout.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { ToolHeader } from '../components/common/ToolHeader.js';
import { Card } from '../components/common/Card.js';
import { ReviewCard } from '../components/reviews/ReviewCard.js';
import { Button } from '../components/common/Button.js';
import { BrandLogo } from '../components/common/BrandLogo.js';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';
import { MascotProvider } from '../context/MascotContext.js';
import { FavoritesProvider } from '../context/FavoritesContext.js';
import { TOOL_CATALOG } from '../tools/catalog.js';

describe('Modern Campus & Clean EdTech Design System Suite', () => {
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
                averageRating: 5.0,
                totalApproved: 12,
                distribution: { 5: 10, 4: 2, 3: 0, 2: 0, 1: 0 },
                recentReviews: [],
              },
            }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              config: {
                heroHeadline: 'A new standard of learning & tools',
                heroDescription:
                  'Discover 38+ free browser tools, full-screen AI chat, vector design studio, and dual-workspace study suite — completely open with zero paywalls.',
                featuredToolIds: [],
              },
              statistics: {
                totalMembers: 2300,
                activeMembers: 2300,
                publishedLearningPosts: 52,
                totalSupporters: 2300,
                totalDonationsAmount: 18000,
              },
              recentPosts: [],
            },
          }),
        };
      }),
    );
  });

  it('renders Header with clean edtech sticky navigation, collegiate navy structure and royal blue CTA pill', () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    const headerEl = container.querySelector('header');
    expect(headerEl).toBeInTheDocument();
    expect(headerEl?.className).toContain('sticky');
    expect(headerEl?.className).toContain('top-0');
    expect(headerEl?.className).toContain('z-40');
    // Subtle border instead of bright border
    expect(headerEl?.className).toMatch(/border-\[var\(--theme-gray-border\)|border-slate-800/);

    // Ratings CTA uses theme token
    const ctaButton = screen.getByRole('link', { name: /Ratings|Get In Touch/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton.className).toMatch(/bg-\[var\(--theme-dirty-white\)|bg-\[\#2563eb\]/);
  });

  it('renders BrandLogo with academic royal blue emblem and refined soft elevation', () => {
    const { container } = render(<BrandLogo size="md" />);
    const emblem = container.firstChild?.firstChild as HTMLElement;
    expect(emblem).toBeInTheDocument();
    expect(emblem.className).toMatch(/bg-\[var\(--theme-yellow\)|bg-\[var\(--theme-dirty-white\)|bg-\[var\(--theme-surface-raised\)|bg-\[\#2563eb\]/);
  });

  it('renders Button with Modern Campus primary royal blue and secondary clean slate variants', () => {
    const { rerender } = render(<Button variant="primary">Start Learning</Button>);
    const primaryBtn = screen.getByRole('button', { name: /Start Learning/i });
    expect(primaryBtn.className).toMatch(/bg-\[var\(--theme-dirty-white\)|bg-\[\#2563eb\]/);

    rerender(<Button variant="secondary">Browse Courses</Button>);
    const secondaryBtn = screen.getByRole('button', { name: /Browse Courses/i });
    expect(secondaryBtn.className).toMatch(/bg-\[var\(--theme-surface\)|bg-slate-800/);
    expect(secondaryBtn.className).toMatch(/border-\[var\(--theme-gray-border\)|border-slate-700/);
  });

  it('renders ToolCard with subtle edtech borders, soft elevation, and academic blue circular arrow chip', () => {
    const tool = TOOL_CATALOG[0]!;
    const { container } = render(
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <ToolCard tool={tool} />
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
    expect(card.className).toContain('rounded-2xl');
    expect(card.className).toMatch(/border-\[var\(--theme-gray-border\)|border-slate-800/);
    expect(card.className).toContain('shadow-sm');

    // Action arrow chip uses dirty-white / royal blue
    const arrowChip = card.querySelector('span.rounded-full');
    expect(arrowChip).toBeInTheDocument();
  });

  it('renders HomePage with Modern Campus / Clean EdTech aesthetic and real live data', async () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <MascotProvider>
              <BrowserRouter>
                <HomePage />
              </BrowserRouter>
            </MascotProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>,
    );

    // Hero title exists
    expect(
      await screen.findByRole('heading', { name: /A new standard of learning & tools/i }),
    ).toBeInTheDocument();

    // Live active members metric is rendered cleanly
    expect(screen.getByText('2.3k')).toBeInTheDocument();
    expect(screen.getByText(/active members/i)).toBeInTheDocument();

    // Verify bento spotlight cards exist with collegiate navy & royal blue
    const spotlightSection = container.querySelector('section.pt-6');
    expect(spotlightSection).toBeInTheDocument();
  });

  it('renders Card with Campus Dark Mode slate surface and subtle border', () => {
    const { container } = render(<Card>Card Content</Card>);
    const cardEl = container.firstChild as HTMLElement;
    expect(cardEl.className).toMatch(/bg-\[var\(--theme-surface\)|bg-\[\#1e293b\]/);
    expect(cardEl.className).toMatch(/border-\[var\(--theme-gray-border\)|border-slate-800/);
    expect(cardEl.className).not.toContain('border-black');
  });

  it('renders ReviewCard with Campus Dark Mode styling', () => {
    const mockReview = {
      _id: 'rev-1',
      userId: 'u1',
      userName: 'Alex Smith',
      rating: 5,
      comment: 'Super fast tools!',
      isApproved: true,
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    };
    const { container } = render(<ReviewCard review={mockReview} />);
    const cardEl = container.firstChild as HTMLElement;
    expect(cardEl.className).toMatch(/bg-\[var\(--theme-surface\)|bg-\[\#1e293b\]/);
    expect(cardEl.className).toMatch(/border-\[var\(--theme-gray-border\)|border-slate-800/);
    expect(cardEl.className).not.toContain('border-black');
  });

  it('renders ToolHeader with academic theme styling', () => {
    const mockTool = TOOL_CATALOG[0]!;
    const { container } = render(
      <BrowserRouter>
        <ToolHeader tool={mockTool} />
      </BrowserRouter>
    );
    expect(container.innerHTML).not.toContain('bg-[#d2ee48]');
    expect(container.innerHTML).not.toContain('border-2 border-black');
  });
});
