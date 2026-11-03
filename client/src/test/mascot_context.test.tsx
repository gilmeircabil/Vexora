import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MascotProvider, useMascot } from '../context/MascotContext';

const TestConsumer: React.FC = () => {
  const { mood, isMinimized, setMood, setIsMinimized, triggerMood } = useMascot();
  return (
    <div>
      <span data-testid="mood">{mood}</span>
      <span data-testid="minimized">{isMinimized ? 'yes' : 'no'}</span>
      <button onClick={() => setMood('crunch')}>Set Crunch</button>
      <button onClick={() => triggerMood('celebrate', 50)}>Trigger Celebrate</button>
      <button onClick={() => setIsMinimized(true)}>Minimize</button>
    </div>
  );
};

describe('MascotContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('provides default state with idle mood and not minimized', () => {
    render(
      <MascotProvider>
        <TestConsumer />
      </MascotProvider>,
    );

    expect(screen.getByTestId('mood').textContent).toBe('idle');
    expect(screen.getByTestId('minimized').textContent).toBe('no');
  });

  it('updates mood via setMood', () => {
    render(
      <MascotProvider>
        <TestConsumer />
      </MascotProvider>,
    );

    act(() => {
      screen.getByText('Set Crunch').click();
    });

    expect(screen.getByTestId('mood').textContent).toBe('crunch');
  });

  it('triggers temporary mood and reverts after timer', () => {
    render(
      <MascotProvider>
        <TestConsumer />
      </MascotProvider>,
    );

    act(() => {
      screen.getByText('Trigger Celebrate').click();
    });

    expect(screen.getByTestId('mood').textContent).toBe('celebrate');

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(screen.getByTestId('mood').textContent).toBe('idle');
  });

  it('persists minimized state to localStorage', () => {
    render(
      <MascotProvider>
        <TestConsumer />
      </MascotProvider>,
    );

    act(() => {
      screen.getByText('Minimize').click();
    });

    expect(screen.getByTestId('minimized').textContent).toBe('yes');
    expect(localStorage.getItem('vexora_mascot_minimized')).toBe('true');
  });

  it('returns default fallback state when useMascot is called outside MascotProvider', () => {
    render(<TestConsumer />);
    expect(screen.getByTestId('mood').textContent).toBe('idle');
    expect(screen.getByTestId('minimized').textContent).toBe('no');
  });
});
