import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { HomePage } from '../pages/HomePage';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';

describe('Platform Workspaces 3-Per-Row Highlight Grid Suite', () => {
  it('renders platform workspaces in a prominent 3-per-row grid with enlarged highlight sizing', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <HomePage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    const grid = screen.getByTestId('platform-workspaces-grid');
    expect(grid).toBeInTheDocument();
    // Verify 3 columns per row on desktop
    expect(grid.className).toContain('lg:grid-cols-3');
    expect(grid.className).not.toContain('lg:grid-cols-4');

    // Verify workspace cards are enlarged highlight cards
    const aiCard = screen.getByRole('link', { name: /^AI Chat/i });
    expect(aiCard.className).toMatch(/p-6|p-7|p-8/);
  });

  it('uses unified theme colors without rogue rose/pink clashing styles on LoveLink or any card', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <HomePage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    const lovelinkCard = screen.getByRole('link', { name: /LoveLink/i });
    // LoveLink should adhere to unified theme palette and not have rogue rose-500 classes
    expect(lovelinkCard.innerHTML).not.toContain('bg-rose-500');
    expect(lovelinkCard.innerHTML).not.toContain('text-rose-400');
    expect(lovelinkCard.innerHTML).toContain('group-hover:bg-[var(--theme-yellow)]');
  });

  it('assigns unique, semantic icons to Community and LoveLink', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <HomePage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    const communityCard = screen.getByRole('link', { name: /^Community/i });
    const lovelinkCard = screen.getByRole('link', { name: /^LoveLink/i });

    const communitySvg = communityCard.querySelector('svg');
    const lovelinkSvg = lovelinkCard.querySelector('svg');

    expect(communitySvg).toBeInTheDocument();
    expect(lovelinkSvg).toBeInTheDocument();
    // They must not have identical SVG paths
    expect(communitySvg?.innerHTML).not.toBe(lovelinkSvg?.innerHTML);
  });
});
