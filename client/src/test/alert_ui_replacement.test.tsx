import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { ToastProvider } from '../context/ToastContext';

describe('Global Alert UI Bridge Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('bridges window.alert calls to the styled toast alert UI', () => {
    render(
      <ToastProvider>
        <button
          onClick={() => {
            window.alert('Custom styled notification alert');
          }}
        >
          Trigger Alert
        </button>
      </ToastProvider>
    );

    const button = screen.getByRole('button', { name: 'Trigger Alert' });
    act(() => {
      button.click();
    });

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent('Custom styled notification alert');
  });

  it('renders styled error alert UI with proper accessibility attributes', () => {
    render(
      <ToastProvider>
        <button
          onClick={() => {
            window.alert('Important operation failed');
          }}
        >
          Fail Alert
        </button>
      </ToastProvider>
    );

    const button = screen.getByRole('button', { name: 'Fail Alert' });
    act(() => {
      button.click();
    });

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent('Important operation failed');
  });
});
