import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import {
  BroadcastToastCard,
  BroadcastToastContainer,
} from '../components/notifications/BroadcastToastContainer.js';
import { BroadcastNotificationProvider } from '../context/BroadcastNotificationContext.js';
import { AuthProvider } from '../context/AuthContext.js';
import { announcementApi, type BroadcastAnnouncement } from '../services/announcementApi.js';

describe('Broadcast Notification System', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockAnnouncement: BroadcastAnnouncement = {
    _id: 'ann_123',
    title: 'Platform Maintenance Notice',
    message: 'We will be performing a quick database optimization in 15 minutes.',
    type: 'warning',
    status: 'active',
    publishedAt: new Date().toISOString(),
    createdByName: 'VexoraAdmin',
    viewCount: 10,
    dismissedCount: 2,
  };

  it('renders a broadcast toast card with correct Neo-Brutalist badge, title and message', () => {
    const handleDismiss = vi.fn();
    render(<BroadcastToastCard announcement={mockAnnouncement} onDismiss={handleDismiss} />);

    expect(screen.getByText('Notice')).toBeInTheDocument();
    expect(screen.getByText('Platform Maintenance Notice')).toBeInTheDocument();
    expect(
      screen.getByText(/We will be performing a quick database optimization/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/By VexoraAdmin/i)).toBeInTheDocument();

    const dismissBtn = screen.getByLabelText('Dismiss announcement');
    fireEvent.click(dismissBtn);
    expect(handleDismiss).toHaveBeenCalledWith('ann_123');
  });

  it('renders nothing when there are no active visible announcements', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <BroadcastNotificationProvider>
            <BroadcastToastContainer />
          </BroadcastNotificationProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(container.querySelector('[aria-label="Global broadcast announcements"]')).toBeNull();
  });

  it('suppresses broadcast announcements on lovelink routes (including recipient link)', async () => {
    vi.spyOn(announcementApi, 'getActive').mockResolvedValue({
      success: true,
      data: [mockAnnouncement],
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/lovelink/open/test-token']}>
        <AuthProvider>
          <BroadcastNotificationProvider>
            <BroadcastToastContainer />
          </BroadcastNotificationProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    // Give time for state updates
    await screen.findByText('Platform Maintenance Notice').catch(() => null);
    expect(container.querySelector('[aria-label="Global broadcast announcements"]')).toBeNull();
    expect(screen.queryByText('Platform Maintenance Notice')).toBeNull();
  });

  it('renders broadcast announcements on regular non-lovelink routes', async () => {
    vi.spyOn(announcementApi, 'getActive').mockResolvedValue({
      success: true,
      data: [mockAnnouncement],
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <BroadcastNotificationProvider>
            <BroadcastToastContainer />
          </BroadcastNotificationProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Platform Maintenance Notice')).toBeInTheDocument();
  });

  it('sends Authorization header using tn_token from localStorage for admin announcement APIs', async () => {
    localStorage.setItem('tn_token', 'test-admin-jwt-token');

    let capturedHeaders: any = null;
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      capturedHeaders = options?.headers;
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: { announcements: [], connectedLiveClients: 0 } }),
      });
    });

    try {
      await announcementApi.getAll();
      expect(capturedHeaders).toBeDefined();
      expect(capturedHeaders['Authorization']).toBe('Bearer test-admin-jwt-token');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
