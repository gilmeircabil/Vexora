import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { WindBackground } from '../components/common/WindBackground';

describe('WindBackground Component', () => {
  it('renders accessible background container with straight wind gust streaks', () => {
    render(<WindBackground />);
    const container = screen.getByTestId('wind-background');
    expect(container).toBeDefined();
    expect(container.getAttribute('aria-hidden')).toBe('true');
    const gusts = container.querySelectorAll('.wind-gust');
    expect(gusts.length).toBeGreaterThan(0);
  });
});
