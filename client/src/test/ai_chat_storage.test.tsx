import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AiChatPage } from '../pages/ai/AiChatPage.js';
import { ToastProvider } from '../context/ToastContext.js';
import { AuthProvider } from '../context/AuthContext.js';
import { aiToolsApi } from '../services/aiToolsApi.js';

describe('AI Chat Cloud Storage & 12-Day Notice Frontend Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/ai/chat/sessions')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                sessions: [
                  {
                    id: 'session-cloud-1',
                    title: 'Cloud Architecture Q&A',
                    selectedModel: 'gemini-3.5-flash-lite',
                    messageCount: 2,
                    lastMessagePreview: 'MongoDB Atlas is great for scaling',
                    createdAt: Date.now() - 10000,
                    updatedAt: Date.now() - 5000,
                  },
                ],
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      }),
    );
  });

  it('renders the 12-day cloud storage notice banner in the sidebar', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiChatPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText(/12-Day Cloud Storage/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Inactive conversations are automatically cleared after 12 days/i),
    ).toBeInTheDocument();
  });

  it('renders the cross-device sync prompt when user is not authenticated', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiChatPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText(/Cross-Device Sync/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Sign in to save and access your conversations across your phone/i),
    ).toBeInTheDocument();
  });

  it('allows clicking "+ New Conversation" to add a draft chat in the sidebar', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiChatPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    const newChatBtns = screen.getAllByRole('button', { name: /new conversation/i });
    expect(newChatBtns.length).toBeGreaterThan(0);

    fireEvent.click(newChatBtns[0]!);
    expect(screen.getAllByText(/New Conversation/i).length).toBeGreaterThan(0);
  });

  it('calls aiToolsApi.listChatSessions when authenticated', async () => {
    const listSpy = vi.spyOn(aiToolsApi, 'listChatSessions').mockResolvedValue({
      success: true,
      data: {
        sessions: [
          {
            id: 'mock-1',
            title: 'Synched Chat',
            selectedModel: 'gemini-3.5-flash-lite',
            messageCount: 1,
            lastMessagePreview: 'Hello world',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
    });

    vi.spyOn(aiToolsApi, 'getChatSession').mockResolvedValue({
      success: true,
      data: {
        session: {
          id: 'mock-1',
          title: 'Synched Chat',
          selectedModel: 'gemini-3.5-flash-lite',
          messages: [
            {
              id: 'm1',
              role: 'user',
              content: 'Hello world',
              timestamp: Date.now(),
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
    });

    // Mock localStorage auth token so AuthProvider authenticates
    localStorage.setItem('tn_token', 'mock_jwt_token');

    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiChatPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalled();
    });

    // Clean up mock token
    localStorage.removeItem('tn_token');
  });
});
