import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MascotProvider, useMascot } from '../context/MascotContext';
import { FloatingMascotWidget } from '../components/mascot/FloatingMascotWidget';

const MoodController: React.FC = () => {
  const { setMood } = useMascot();
  return (
    <div>
      <button onClick={() => setMood('crunch')}>Make Crunch</button>
      <button onClick={() => setMood('celebrate')}>Make Celebrate</button>
    </div>
  );
};

describe('FloatingMascotWidget', () => {
  it('renders expanded widget with squirrel mascot and speech bubble', () => {
    render(
      <MascotProvider>
        <FloatingMascotWidget />
      </MascotProvider>
    );

    expect(screen.getByRole('img', { name: /Vexora Squirrel Mascot/i })).toBeDefined();
    expect(screen.getByTestId('mascot-speech-bubble')).toBeDefined();
  });

  it('can be minimized and restored via buttons', () => {
    render(
      <MascotProvider>
        <FloatingMascotWidget />
      </MascotProvider>
    );

    const minimizeBtn = screen.getByRole('button', { name: /Minimize mascot/i });
    fireEvent.click(minimizeBtn);

    // Full mascot should be hidden, collapsed pill button shown
    expect(screen.queryByRole('img', { name: /Vexora Squirrel Mascot/i })).toBeNull();
    const expandBtn = screen.getByRole('button', { name: /Expand mascot/i });
    expect(expandBtn).toBeDefined();

    // Click expand
    fireEvent.click(expandBtn);
    expect(screen.getByRole('img', { name: /Vexora Squirrel Mascot/i })).toBeDefined();
  });

  it('triggers celebration when mascot is clicked', () => {
    render(
      <MascotProvider>
        <FloatingMascotWidget />
      </MascotProvider>
    );

    const mascot = screen.getByRole('img', { name: /Vexora Squirrel Mascot/i });
    fireEvent.click(mascot);

    expect(mascot.getAttribute('data-state')).toBe('celebrate');
    expect(screen.getByText(/Sparkle power!/i)).toBeDefined();
  });

  it('updates speech text when mood is crunch', () => {
    render(
      <MascotProvider>
        <MoodController />
        <FloatingMascotWidget />
      </MascotProvider>
    );

    act(() => {
      screen.getByText('Make Crunch').click();
    });

    expect(screen.getByText(/Crunching code!/i)).toBeDefined();
  });
});
