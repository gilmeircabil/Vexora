import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DashboardPage } from '../pages/DashboardPage.js';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';

describe('Dashboard Processing History Delete Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    localStorage.setItem('tn_token', 'test-jwt');
    localStorage.setItem(
      'tn_user',
      JSON.stringify({
        id: 'u-123',
        username: 'testuser',
        name: 'Test User',
        email: 'test@vexora.com',
        role: 'user',
      }),
    );
  });

  it('renders Delete button for each history item and allows deleting a single item', async () => {
    const mockJobs = [
      {
        _id: 'job-1',
        tool: 'AI-BACKGROUND-REMOVER',
        status: 'completed',
        inputMetadata: { originalName: 'photo1.jpg' },
        outputUrl: '/api/ai/download/result1.png',
        createdAt: '2026-11-01T20:59:00.000Z',
      },
      {
        _id: 'job-2',
        tool: 'AI-IMAGE-ENHANCER',
        status: 'completed',
        inputMetadata: { originalName: 'photo2.jpg' },
        outputUrl: '/api/ai/download/result2.png',
        createdAt: '2026-11-01T21:05:00.000Z',
      },
    ];

    const fetchMock = vi.fn().mockImplementation(async (url: string, options?: any) => {
      if (url.includes('/api/auth/me')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'u-123', username: 'testuser', name: 'Test User' },
          }),
        };
      }
      if (url.includes('/api/ai/history') && options?.method === 'DELETE') {
        return {
          ok: true,
          json: async () => ({ success: true, message: 'Deleted' }),
        };
      }
      if (url.includes('/api/ai/history')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { jobs: mockJobs },
          }),
        };
      }
      return { ok: true, json: async () => ({ success: true }) };
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <DashboardPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(await screen.findByText('Processing History')).toBeInTheDocument();
    expect(await screen.findByText('photo1.jpg')).toBeInTheDocument();
    expect(await screen.findByText('photo2.jpg')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2);

    // Click Delete on first item
    fireEvent.click(deleteButtons[0]!);

    await waitFor(() => {
      expect(screen.queryByText('photo1.jpg')).not.toBeInTheDocument();
      expect(screen.getByText('photo2.jpg')).toBeInTheDocument();
    });

    // Verify DELETE request was made
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/ai/history/job-1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('renders Clear All button and clears all processing history', async () => {
    const mockJobs = [
      {
        _id: 'job-1',
        tool: 'AI-BACKGROUND-REMOVER',
        status: 'completed',
        inputMetadata: { originalName: 'photo1.jpg' },
        outputUrl: '/api/ai/download/result1.png',
        createdAt: '2026-11-01T20:59:00.000Z',
      },
    ];

    const fetchMock = vi.fn().mockImplementation(async (url: string, options?: any) => {
      if (url.includes('/api/auth/me')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'u-123', username: 'testuser', name: 'Test User' },
          }),
        };
      }
      if (url.endsWith('/api/ai/history') && options?.method === 'DELETE') {
        return {
          ok: true,
          json: async () => ({ success: true, message: 'Cleared' }),
        };
      }
      if (url.includes('/api/ai/history')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { jobs: mockJobs },
          }),
        };
      }
      return { ok: true, json: async () => ({ success: true }) };
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <DashboardPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(await screen.findByText('Processing History')).toBeInTheDocument();
    expect(await screen.findByText('photo1.jpg')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /clear all/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.queryByText('photo1.jpg')).not.toBeInTheDocument();
      expect(screen.getByText(/No tools executed yet/i)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/ai\/history$/),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
