import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MascotProvider } from '../context/MascotContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { HomePage } from '../pages/HomePage';
import { FloatingMascotWidget } from '../components/mascot/FloatingMascotWidget';

vi.mock('../components/common/ScrollToTop', () => ({
  ScrollToTop: () => null,
}));

describe('Mascot Integration', () => {
  it('renders hero mascot on HomePage and typing in search triggers crunch state', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <ToastProvider>
            <MascotProvider>
              <HomePage />
            </MascotProvider>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const mascots = screen.getAllByRole('img', { name: /Vexora Squirrel Mascot/i });
    expect(mascots.length).toBeGreaterThan(0);
    const heroMascot = mascots[0];
    expect(heroMascot.getAttribute('data-state')).toBe('idle');

    // Type in search bar
    const searchInput = screen.getByRole('textbox', {
      name: /Search all tools by name, description, or keyword/i,
    });
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'pdf' } });
    });

    // Mascot should now be in crunch state
    expect(heroMascot.getAttribute('data-state')).toBe('crunch');
  });

  it('renders floating mascot widget inside layout with MascotProvider', () => {
    render(
      <MascotProvider>
        <FloatingMascotWidget />
      </MascotProvider>
    );

    expect(screen.getByRole('complementary', { name: /Interactive Mascot Companion/i })).toBeDefined();
  });
});
