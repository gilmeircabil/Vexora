import React from 'react';
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { Header } from '../components/layout/Header.js';
import { Footer } from '../components/layout/Footer.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { BrandLogo } from '../components/common/BrandLogo.js';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';
import { LockedPageModal } from '../components/common/LockedPageModal.js';
import { AuthRequiredModal } from '../components/common/AuthRequiredModal.js';

describe('60-30-10 Gray (#2B2D31), Silver (#d9dadc), and Yellow (#ffc93c) Theme Suite', () => {
  it('defines centralized CSS variables for 60% gray (#2B2D31), 30% silver (#d9dadc), and 10% yellow (#ffc93c) in index.css', () => {
    const cssPath = path.resolve(__dirname, '../index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Centralized theme tokens
    expect(cssContent).toMatch(/--theme-canvas:\s*#2B2D31/i);
    expect(cssContent).toMatch(/--theme-silver:\s*#d9dadc/i);
    expect(cssContent).toMatch(/--theme-dirty-white:\s*#d9dadc/i);
    expect(cssContent).toMatch(/--theme-yellow:\s*#ffc93c/i);
    expect(cssContent).toMatch(/--theme-10-accent:\s*var\(--theme-yellow\)/i);
    expect(cssContent).toMatch(/--bg-page:\s*var\(--theme-canvas\)/i);
    expect(cssContent).toMatch(/--text-primary:\s*var\(--theme-silver\)|var\(--theme-dirty-white\)/i);
  });

  it('renders Card with centralized surface variable and gray border', () => {
    const { container } = render(<Card>Theme Card</Card>);
    const cardEl = container.firstChild as HTMLElement;
    expect(cardEl.className).toMatch(/bg-\[var\(--theme-surface\)\]|bg-theme-surface/);
    expect(cardEl.className).toMatch(/border-\[var\(--theme-gray-border\)\]|border-theme-gray/);
  });

  it('renders Header with soft black canvas background and gray border', () => {
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
    expect(headerEl?.className).toMatch(/bg-\[var\(--theme-canvas\)|bg-theme-canvas/);
    expect(headerEl?.className).toMatch(/border-\[var\(--theme-gray-border\)|border-theme-gray/);
  });

  it('renders BrandLogo and Buttons with theme variables for seamless retheming', () => {
    const { container: buttonContainer } = render(
      <Button variant="primary">Dirty White Primary</Button>,
    );
    const btn = buttonContainer.firstChild as HTMLElement;
    expect(btn.className).toMatch(/bg-\[var\(--theme-yellow\)\]|bg-\[var\(--theme-dirty-white\)\]|bg-theme-dirty-white/);

    const { container: logoContainer } = render(<BrandLogo size="md" />);
    const emblem = logoContainer.querySelector('[data-testid="brand-emblem"]');
    expect(emblem).toBeInTheDocument();
    expect(emblem?.className).toMatch(/bg-\[var\(--theme-yellow\)\]|bg-\[var\(--theme-dirty-white\)\]|bg-\[var\(--theme-surface-raised\)\]/);
  });

  it('renders modals and feature common components with centralized theme variables', () => {
    const { container: lockedContainer } = render(
      <BrowserRouter>
        <LockedPageModal title="Locked Feature" />
      </BrowserRouter>,
    );
    const lockedCard = lockedContainer.querySelector('.rounded-2xl, .rounded-3xl');
    expect(lockedCard?.className).toMatch(/var\(--theme-surface\)/);

    const { container: authContainer } = render(
      <BrowserRouter>
        <AuthRequiredModal pageTitle="Login Required" />
      </BrowserRouter>,
    );
    const authCard = authContainer.querySelector('.rounded-2xl, .rounded-3xl');
    expect(authCard?.className).toMatch(/var\(--theme-surface\)/);
  });

  it('ensures index.css specifies yellow button overrides for global action buttons', () => {
    const cssPath = path.resolve(__dirname, '../index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    expect(cssContent).toMatch(/button\[class\*="bg-\[var\(--theme-dirty-white\)\]"\].*var\(--theme-yellow\)/s);
  });
});
