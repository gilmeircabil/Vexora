import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { HomePage } from '../pages/HomePage';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';

describe('Unified Hero & Platform Statistics Suite', () => {
  it('merges Hero and Platform Statistics into a single unified container card', () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <HomePage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    const mergedContainer = screen.getByTestId('hero-stats-unified-card');
    expect(mergedContainer).toBeInTheDocument();

    // Verify Hero content exists inside the merged container
    expect(mergedContainer).toContainElement(screen.getByTestId('mascot-speech-bubble'));
    expect(mergedContainer).toContainElement(screen.getByTestId('hero-experience-counter'));

    // Verify Platform Statistics heading and metrics exist inside the same container
    const statsHeading = screen.getByRole('heading', {
      name: /Built for scale, verified by community/i,
    });
    expect(mergedContainer).toContainElement(statsHeading);
  });
});
