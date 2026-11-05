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
  it('renders hero mascot on HomePage and clicking triggers celebrate state', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <ToastProvider>
              <MascotProvider>
                <HomePage />
              </MascotProvider>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>,
      );
    });

    const mascots = screen.getAllByRole('button', { name: /Vexora Squirrel Mascot/i });
    expect(mascots.length).toBeGreaterThan(0);
    const heroMascot = mascots[0];
    if (!heroMascot) {
      throw new Error('Hero mascot not found');
    }
    expect(heroMascot.getAttribute('data-state')).toBe('idle');

    // Hero speech bubble displays initial idle greeting
    const speechBubble = screen.getByTestId('mascot-speech-bubble');
    expect(speechBubble).toBeDefined();
    expect(speechBubble.textContent).toContain('Hi! Click me to high-five! 🌰');

    // Clicking mascot triggers celebrate state
    await act(async () => {
      fireEvent.click(heroMascot);
    });
    expect(heroMascot.getAttribute('data-state')).toBe('celebrate');
    expect(speechBubble.textContent).toContain('Woohoo! Sparkle power! 🌰✨');
  });

  it('renders floating mascot widget inside layout with MascotProvider', () => {
    render(
      <MascotProvider>
        <FloatingMascotWidget />
      </MascotProvider>,
    );

    expect(
      screen.getByRole('complementary', { name: /Interactive Mascot Companion/i }),
    ).toBeDefined();
  });
});
