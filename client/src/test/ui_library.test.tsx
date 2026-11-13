import React, { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { ALL_COMPONENTS, WEBSITE_LAYOUTS, DASHBOARD_LAYOUTS, DESIGN_STYLES } from '../features/ui-library/data/index.js';
import { UiLibraryFavoritesProvider, useUiLibraryFavorites } from '../features/ui-library/context/UiLibraryFavoritesContext.js';
import { UiLibraryLandingPage } from '../pages/ui-library/UiLibraryLandingPage.js';
import { UiComponentDetailPage } from '../pages/ui-library/UiComponentDetailPage.js';
import { Playground } from '../features/ui-library/components/Playground.js';
import { Header } from '../components/layout/Header.js';
import { AuthProvider } from '../context/AuthContext.js';

describe('VexoraMods UI Component Library & Design Learning Center', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. Data Catalog Completeness & Structure', () => {
    it('contains all 7 component categories and at least 100 components', () => {
      expect(ALL_COMPONENTS.length).toBeGreaterThanOrEqual(100);

      const categories = new Set(ALL_COMPONENTS.map((c) => c.category));
      expect(categories).toContain('navigation');
      expect(categories).toContain('buttons');
      expect(categories).toContain('cards');
      expect(categories).toContain('forms');
      expect(categories).toContain('data-display');
      expect(categories).toContain('feedback');
      expect(categories).toContain('advanced');
    });

    it('contains all 12 complete website layouts with descriptions and code', () => {
      expect(WEBSITE_LAYOUTS.length).toBe(12);
      const layoutIds = WEBSITE_LAYOUTS.map((l) => l.id);
      expect(layoutIds).toContain('landing-page');
      expect(layoutIds).toContain('saas-website');
      expect(layoutIds).toContain('portfolio-website');
      expect(layoutIds).toContain('blog-layout');
      expect(layoutIds).toContain('documentation-layout');
      expect(layoutIds).toContain('ecommerce-layout');
      expect(layoutIds).toContain('agency-website');
      expect(layoutIds).toContain('personal-website');
      expect(layoutIds).toContain('educational-website');
      expect(layoutIds).toContain('community-website');
      expect(layoutIds).toContain('authentication-layout');
      expect(layoutIds).toContain('pricing-page-layout');
    });

    it('contains all 11 dashboard layouts with layout types', () => {
      expect(DASHBOARD_LAYOUTS.length).toBe(11);
      const dashIds = DASHBOARD_LAYOUTS.map((d) => d.id);
      expect(dashIds).toContain('admin-dashboard');
      expect(dashIds).toContain('analytics-dashboard');
      expect(dashIds).toContain('financial-dashboard');
      expect(dashIds).toContain('crm-dashboard');
      expect(dashIds).toContain('project-management-dashboard');
      expect(dashIds).toContain('kanban-dashboard');
      expect(dashIds).toContain('minimal-dashboard');
      expect(dashIds).toContain('sidebar-dashboard');
      expect(dashIds).toContain('full-width-dashboard');
      expect(dashIds).toContain('three-column-dashboard');
      expect(dashIds).toContain('mobile-dashboard');
    });

    it('contains all 14 design styles with characteristics and palettes', () => {
      expect(DESIGN_STYLES.length).toBe(14);
      const styleIds = DESIGN_STYLES.map((s) => s.id);
      expect(styleIds).toContain('minimalism');
      expect(styleIds).toContain('glassmorphism');
      expect(styleIds).toContain('neumorphism');
      expect(styleIds).toContain('bento-grid');
      expect(styleIds).toContain('material-design');
      expect(styleIds).toContain('flat-design');
      expect(styleIds).toContain('brutalism');
      expect(styleIds).toContain('gradient-design');
      expect(styleIds).toContain('dark-ui');
      expect(styleIds).toContain('light-ui');
      expect(styleIds).toContain('editorial-design');
      expect(styleIds).toContain('modern-saas');
      expect(styleIds).toContain('soft-ui');
      expect(styleIds).toContain('retro-design');
    });

    it('every component has structured learning fields and at least one variation', () => {
      ALL_COMPONENTS.forEach((comp) => {
        expect(comp.id).toBeTruthy();
        expect(comp.name).toBeTruthy();
        expect(comp.whatIsIt).toBeTruthy();
        expect(comp.whatIsItUsedFor).toBeTruthy();
        expect(comp.whereToUse).toBeTruthy();
        expect(comp.advantages.length).toBeGreaterThan(0);
        expect(comp.variations.length).toBeGreaterThan(0);
        expect(comp.variations[0]?.codeReact).toBeTruthy();
        expect(comp.variations[0]?.codeHtml).toBeTruthy();
      });
    });
  });

  describe('2. Navigation Integration', () => {
    it('hides Header completely on /ui-library so no navbar or floating bar overlaps the workspace', () => {
      const { container } = render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/ui-library']}>
            <Header />
          </MemoryRouter>
        </AuthProvider>,
      );

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByRole('link', { name: 'Web Tool' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'How it works' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
    });
  });

  describe('3. UI Library Landing Page & Filtering', () => {
    it('renders the landing page hero, stats, and search bar', () => {
      render(
        <UiLibraryFavoritesProvider>
          <MemoryRouter initialEntries={['/ui-library']}>
            <UiLibraryLandingPage />
          </MemoryRouter>
        </UiLibraryFavoritesProvider>,
      );

      expect(screen.getByText(/UI COMPONENT LIBRARY & DESIGN LEARNING CENTER/i)).toBeInTheDocument();
      expect(screen.getByText(/Discover, Study & Preview Modern Web Design/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search components, layouts, design styles/i)).toBeInTheDocument();
    });

    it('filters components dynamically based on search query', () => {
      render(
        <UiLibraryFavoritesProvider>
          <MemoryRouter initialEntries={['/ui-library']}>
            <UiLibraryLandingPage />
          </MemoryRouter>
        </UiLibraryFavoritesProvider>,
      );

      const searchInput = screen.getByPlaceholderText(/Search components, layouts, design styles/i);
      fireEvent.change(searchInput, { target: { value: 'Bento Card' } });

      expect(screen.getByText('Bento Card')).toBeInTheDocument();
      expect(screen.queryByText('Command Palette (Pro)')).not.toBeInTheDocument();
    });

    it('switches between section tabs (Website Layouts, Dashboards, Design Styles, Playground)', () => {
      render(
        <UiLibraryFavoritesProvider>
          <MemoryRouter initialEntries={['/ui-library']}>
            <UiLibraryLandingPage />
          </MemoryRouter>
        </UiLibraryFavoritesProvider>,
      );

      // Click Website Layouts tab
      const webTab = screen.getByRole('button', { name: /2\. Website Layouts/i });
      fireEvent.click(webTab);
      expect(screen.getByRole('heading', { name: /Complete Website Layouts/i })).toBeInTheDocument();
      expect(screen.getByText('Landing Page Layout')).toBeInTheDocument();

      // Click Dashboard Layouts tab
      const dashTab = screen.getByRole('button', { name: /3\. Dashboard Layouts/i });
      fireEvent.click(dashTab);
      expect(screen.getByRole('heading', { name: /Full Dashboard Layouts/i })).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

      // Click Design Styles tab
      const styleTab = screen.getByRole('button', { name: /4\. Design Styles/i });
      fireEvent.click(styleTab);
      expect(screen.getByRole('heading', { name: /Design Styles Catalog/i })).toBeInTheDocument();
      expect(screen.getByText('Glassmorphism')).toBeInTheDocument();
    });
  });

  describe('4. Interactive Playground', () => {
    it('renders design controls, updates live code, and switches component types', () => {
      render(<Playground />);

      expect(screen.getByText(/Interactive Playground/i)).toBeInTheDocument();
      expect(screen.getByText(/Component Sandbox/i)).toBeInTheDocument();

      // Check default button label input
      const labelInput = screen.getByDisplayValue('Explore Component');
      expect(labelInput).toBeInTheDocument();

      // Change text and verify code updates
      fireEvent.change(labelInput, { target: { value: 'Click This Now' } });
      expect(screen.getAllByText(/Click This Now/).length).toBeGreaterThanOrEqual(1);

      // Switch to Card mode
      const cardTypeBtn = screen.getByRole('button', { name: /card/i });
      fireEvent.click(cardTypeBtn);
      expect(screen.getByText('Customized live in the VexoraMods UI Playground.')).toBeInTheDocument();

      // Test reset button
      const resetBtn = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetBtn);
      expect(screen.getByDisplayValue('Explore Component')).toBeInTheDocument();
    });
  });

  describe('5. Component Detail Page & Learning Guide', () => {
    it('renders detail page with responsive viewport switcher and learning guide', () => {
      render(
        <UiLibraryFavoritesProvider>
          <MemoryRouter initialEntries={['/ui-library/component/primary-button']}>
            <Routes>
              <Route path="/ui-library/component/:id" element={<UiComponentDetailPage />} />
            </Routes>
          </MemoryRouter>
        </UiLibraryFavoritesProvider>,
      );

      // Component title and badges
      expect(screen.getByRole('heading', { level: 1, name: /Primary Button/i })).toBeInTheDocument();
      expect(screen.getByText(/What is it\?/i)).toBeInTheDocument();
      expect(screen.getByText(/What is it used for\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Where should you use it\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Key Advantages/i)).toBeInTheDocument();

      // Viewport switcher buttons
      expect(screen.getByTitle(/Desktop View/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Tablet View/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Mobile View/i)).toBeInTheDocument();

      // Code block and tabs
      expect(screen.getByRole('button', { name: /react/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /html/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /css/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
    });

    it('toggles favorite status and persists to localStorage', () => {
      render(
        <UiLibraryFavoritesProvider>
          <MemoryRouter initialEntries={['/ui-library/component/primary-button']}>
            <Routes>
              <Route path="/ui-library/component/:id" element={<UiComponentDetailPage />} />
            </Routes>
          </MemoryRouter>
        </UiLibraryFavoritesProvider>,
      );

      const favBtn = screen.getByRole('button', { name: /add to favorites/i });
      fireEvent.click(favBtn);

      expect(screen.getByRole('button', { name: /favorited/i })).toBeInTheDocument();
      const rawStored = localStorage.getItem('vexoramods_ui_library_favorites');
      expect(rawStored).toContain('primary-button');
    });
  });
});
