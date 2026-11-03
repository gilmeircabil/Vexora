import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
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
    render(
      <BroadcastToastCard
        announcement={mockAnnouncement}
        onDismiss={handleDismiss}
      />,
    );

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
      <AuthProvider>
        <BroadcastNotificationProvider>
          <BroadcastToastContainer />
        </BroadcastNotificationProvider>
      </AuthProvider>,
    );

    expect(container.querySelector('[aria-label="Global broadcast announcements"]')).toBeNull();
  });

  it('sends Authorization header using tn_token from localStorage for admin announcement APIs', async () => {
    localStorage.setItem('tn_token', 'test-admin-jwt-token');

    let capturedHeaders: any = null;
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      capturedHeaders = options?.headers;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { announcements: [], connectedLiveClients: 0 } }),
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
