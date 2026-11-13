import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { ContactPage } from '../pages/ContactPage';
import { ToastProvider } from '../context/ToastContext';
import { supportChatApi } from '../services/supportChatApi';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'admin-1',
      name: 'System Administrator',
      username: 'systemadmin',
      email: 'admin@vexoramods.com',
      role: 'admin',
    },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

describe('Contact Support Chat Message Alignment Suite', () => {
  it('aligns sender messages on right and incoming messages on left in Admin Inbox mode', async () => {
    // Seed a mock thread with an incoming user message and an admin reply
    const thread = await supportChatApi.sendUserMessage({
      name: 'kikisubi die',
      email: 'kikisubi@example.com',
      subject: 'Inquiry',
      text: 'what happed to the systemkol',
    });
    await supportChatApi.sendAdminReply(
      thread._id,
      'its good now',
      'System Administrator'
    );

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/contact']}>
          <ContactPage />
        </MemoryRouter>
      </ToastProvider>
    );

    // Switch to Admin Inbox mode
    const switchButton = await screen.findByRole('button', { name: /Switch to Admin Inbox|Admin Inbox/i });
    if (!switchButton.textContent?.includes('Admin Inbox') || switchButton.textContent?.includes('Switch to')) {
      fireEvent.click(switchButton);
    }

    await waitFor(() => {
      expect(screen.getByText('what happed to the systemkol')).toBeInTheDocument();
      expect(screen.getByText('its good now')).toBeInTheDocument();
    });

    const userMessageEl = screen.getByText('what happed to the systemkol').closest('.flex.items-start');
    const adminMessageEl = screen.getByText('its good now').closest('.flex.items-start');

    // In Admin mode:
    // Admin's own message ("its good now") MUST be on the right (justify-end)
    expect(adminMessageEl?.className).toContain('justify-end');
    // Customer's message ("what happed...") MUST be on the left (not justify-end)
    expect(userMessageEl?.className).not.toContain('justify-end');
  });

  it('automatically scrolls the chat messages container to bottom when refreshing without scrolling the window', async () => {
    const scrollToMock = vi.fn();
    window.HTMLElement.prototype.scrollTo = scrollToMock;

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/contact']}>
          <ContactPage />
        </MemoryRouter>
      </ToastProvider>
    );

    const refreshButton = await screen.findByRole('button', { name: /Refresh Chat/i });
    scrollToMock.mockClear();
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(scrollToMock).toHaveBeenCalled();
    });
  });

  it('allows admin to delete a message in the chat thread', async () => {
    await supportChatApi.sendUserMessage({
      name: 'Test Customer',
      email: 'customer@example.com',
      subject: 'Test Subject',
      text: 'Message to be deleted by admin',
    });

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/contact']}>
          <ContactPage />
        </MemoryRouter>
      </ToastProvider>
    );

    // Switch to Admin Inbox mode so admin sees all threads
    const switchButton = await screen.findByRole('button', { name: /Switch to Admin Inbox|Admin Inbox/i });
    if (!switchButton.textContent?.includes('Admin Inbox') || switchButton.textContent?.includes('Switch to')) {
      fireEvent.click(switchButton);
    }

    const threadButton = await screen.findByRole('button', { name: /Test Customer/i });
    fireEvent.click(threadButton);

    await waitFor(() => {
      expect(screen.getByText('Message to be deleted by admin')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete message/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]!);

    await waitFor(() => {
      expect(screen.queryByText('Message to be deleted by admin')).not.toBeInTheDocument();
    });
  });
});
