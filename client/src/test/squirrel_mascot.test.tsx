import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SquirrelMascot } from '../components/mascot/SquirrelMascot';

describe('SquirrelMascot', () => {
  it('renders with default idle state and accessible aria label', () => {
    render(<SquirrelMascot />);
    const mascot = screen.getByRole('img', { name: /Vexora Squirrel Mascot/i });
    expect(mascot).toBeDefined();
    expect(mascot.getAttribute('data-state')).toBe('idle');
  });

  it('renders crunch state with red screen glare and typing paws', () => {
    const { container } = render(<SquirrelMascot state="crunch" />);
    const mascot = screen.getByRole('img', { name: /Vexora Squirrel Mascot/i });
    expect(mascot.getAttribute('data-state')).toBe('crunch');
    const glare = container.querySelector('.laptop-glare');
    expect(glare).not.toBeNull();
  });

  it('renders celebrate state with sparkles', () => {
    const { container } = render(<SquirrelMascot state="celebrate" />);
    const mascot = screen.getByRole('img', { name: /Vexora Squirrel Mascot/i });
    expect(mascot.getAttribute('data-state')).toBe('celebrate');
    const sparkles = container.querySelectorAll('.sparkle');
    expect(sparkles.length).toBeGreaterThan(0);
  });

  it('fires onClick callback when clicked', () => {
    const handleClick = vi.fn();
    render(<SquirrelMascot onClick={handleClick} />);
    const mascot = screen.getByRole('img', { name: /Vexora Squirrel Mascot/i });
    fireEvent.click(mascot);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom size and className', () => {
    render(<SquirrelMascot size={160} className="custom-squirrel" />);
    const mascot = screen.getByRole('img', { name: /Vexora Squirrel Mascot/i });
    expect(mascot.getAttribute('width')).toBe('160');
    expect(mascot.getAttribute('height')).toBe('160');
    expect(mascot.classList.contains('custom-squirrel')).toBe(true);
  });
});
