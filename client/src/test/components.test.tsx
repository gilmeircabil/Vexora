import React, { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { Button } from '../components/common/Button.js';
import { CopyButton } from '../components/common/CopyButton.js';
import { Card } from '../components/common/Card.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { BrandLogo } from '../components/common/BrandLogo.js';
import { ToastProvider } from '../context/ToastContext.js';
import { TOOL_CATALOG } from '../tools/catalog.js';
import { useFullscreenMode } from '../features/education/shared/useFullscreenMode.js';

describe('Common UI Components', () => {
  it('renders Button with variants and handles click events', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Click Me
      </Button>,
    );

    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading spinner and disables Button when isLoading is true', () => {
    render(<Button isLoading>Processing</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('renders Card with content and custom class', () => {
    render(<Card className="test-card">Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders CopyButton and triggers clipboard write', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <ToastProvider>
        <CopyButton value="secret-payload" label="Copy Payload" />
      </ToastProvider>,
    );

    const btn = screen.getByRole('button', { name: /copy payload/i });
    await act(async () => {
      fireEvent.click(btn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('secret-payload');
  });

  it('renders ToolCard linking to tool route with category and tagline', () => {
    const tool = TOOL_CATALOG[0]!;
    render(
      <BrowserRouter>
        <ToolCard tool={tool} />
      </BrowserRouter>,
    );

    expect(screen.getByText(tool.name)).toBeInTheDocument();
    expect(screen.getByText(tool.tagline)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', `/tools/${tool.slug}`);
  });

  it('renders BrandLogo with high-contrast accent emblem badge and dark icon', () => {
    render(<BrandLogo size="md" showTagline />);
    const emblem = screen.getByTestId('brand-emblem');
    expect(emblem).toBeInTheDocument();
    expect(emblem.className).toMatch(/bg-\[var\(--theme-yellow\)\]|bg-\[var\(--theme-dirty-white\)\]/);
    expect(emblem).toHaveClass('text-[var(--theme-canvas)]');
    expect(screen.getByText('Vexora')).toBeInTheDocument();
    expect(screen.getByText('Mods')).toBeInTheDocument();
    expect(screen.getByTestId('brand-beta-badge')).toHaveTextContent(/beta/i);
    expect(screen.getByText('Everything You Need. One Platform. Free.')).toBeInTheDocument();
  });

  describe('useFullscreenMode Hook', () => {
    it('initializes with isFullscreen false and responds to toggleFullscreen', async () => {
      const requestFullscreenMock = vi.fn().mockResolvedValue(undefined);
      const exitFullscreenMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(document.documentElement, 'requestFullscreen', {
        value: requestFullscreenMock,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, 'exitFullscreen', {
        value: exitFullscreenMock,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useFullscreenMode());
      expect(result.current.isFullscreen).toBe(false);

      await act(async () => {
        result.current.toggleFullscreen();
      });

      expect(requestFullscreenMock).toHaveBeenCalled();
      expect(result.current.isFullscreen).toBe(true);

      // Simulate fullscreenchange event to exit
      await act(async () => {
        // Mock document.fullscreenElement as null
        Object.defineProperty(document, 'fullscreenElement', {
          value: null,
          writable: true,
          configurable: true,
        });
        document.dispatchEvent(new Event('fullscreenchange'));
      });

      expect(result.current.isFullscreen).toBe(false);
    });
  });
});
