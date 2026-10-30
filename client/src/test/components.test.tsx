import React, { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { Button } from '../components/common/Button.js';
import { CopyButton } from '../components/common/CopyButton.js';
import { Card } from '../components/common/Card.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { ToastProvider } from '../context/ToastContext.js';
import { TOOL_CATALOG } from '../tools/catalog.js';

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
});
