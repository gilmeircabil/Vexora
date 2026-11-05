import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

const TestAuthConsumer: React.FC = () => {
  const { user, token, isAuthenticated, isLoading, login, logout, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="loading-status">{isLoading ? 'loading' : 'ready'}</span>
      <span data-testid="username">{user?.username || 'none'}</span>
      <span data-testid="token">{token || 'none'}</span>
      <button
        onClick={() =>
          login('new-jwt-token', {
            id: 'u1',
            username: 'alice',
            name: 'Alice Wonder',
            role: 'user',
          })
        }
      >
        Trigger Login
      </button>
      <button onClick={() => updateUser({ name: 'Alice Updated' })}>Update Name</button>
      <button onClick={() => logout()}>Trigger Logout</button>
    </div>
  );
};

describe('AuthContext Session Persistence Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    // Mock window.location using vi.stubGlobal
    const mockLocation = {
      pathname: '/dashboard',
      href: 'http://localhost/dashboard',
      reload: vi.fn(),
      origin: 'http://localhost',
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      hash: '',
      search: '',
      ancestorOrigins: [],
      toString: () => 'http://localhost/dashboard',
      assign: vi.fn(),
      replace: vi.fn(),
    };

    vi.stubGlobal('location', mockLocation);

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'u1', username: 'alice', name: 'Alice Wonder', role: 'user' },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      });
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('restores cached user synchronously from localStorage so user is authenticated on initial tab load', () => {
    const cachedUser = { id: 'u1', username: 'alice', name: 'Alice Wonder', role: 'user' };
    localStorage.setItem('tn_token', 'cached-jwt-token');
    localStorage.setItem('tn_user', JSON.stringify(cachedUser));
    localStorage.setItem('tn_has_session', 'true');

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    // Synchronously before any network fetch resolves, user must be authenticated
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-in');
    expect(screen.getByTestId('username').textContent).toBe('alice');
    expect(screen.getByTestId('token').textContent).toBe('cached-jwt-token');
  });

  it('stores tn_user, tn_token, and tn_has_session in localStorage on login', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText('Trigger Login').click();
    });

    expect(localStorage.getItem('tn_token')).toBe('new-jwt-token');
    expect(localStorage.getItem('tn_has_session')).toBe('true');
    expect(JSON.parse(localStorage.getItem('tn_user') || '{}')).toMatchObject({
      id: 'u1',
      username: 'alice',
    });
  });

  it('clears tn_user from localStorage on logout', async () => {
    localStorage.setItem('tn_token', 'new-jwt-token');
    localStorage.setItem('tn_has_session', 'true');
    localStorage.setItem(
      'tn_user',
      JSON.stringify({ id: 'u1', username: 'alice', name: 'Alice', role: 'user' }),
    );

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    // Wait for initial mount revalidation to complete
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      screen.getByText('Trigger Logout').click();
    });

    expect(localStorage.getItem('tn_token')).toBeNull();
    expect(localStorage.getItem('tn_user')).toBeNull();
    expect(localStorage.getItem('tn_has_session')).toBeNull();
  });

  it('updates tn_user in localStorage when updateUser is called', async () => {
    localStorage.setItem('tn_token', 'new-jwt-token');
    localStorage.setItem(
      'tn_user',
      JSON.stringify({ id: 'u1', username: 'alice', name: 'Alice Wonder', role: 'user' }),
    );

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    // Wait for initial mount revalidation to complete
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      screen.getByText('Update Name').click();
    });

    const stored = JSON.parse(localStorage.getItem('tn_user') || '{}');
    expect(stored.name).toBe('Alice Updated');
  });

  it('silently refreshes expired access token on mount using cookie session and preserves login', async () => {
    localStorage.setItem('tn_token', 'expired-access-token');
    localStorage.setItem(
      'tn_user',
      JSON.stringify({ id: 'u1', username: 'alice', name: 'Alice Wonder', role: 'user' }),
    );
    localStorage.setItem('tn_has_session', 'true');

    // /api/auth/me returns 401 because token expired, but /api/auth/refresh returns new token
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({ success: false, error: 'Token expired' }),
        });
      }
      if (url === '/api/auth/refresh') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              accessToken: 'brand-new-refreshed-token',
              user: { id: 'u1', username: 'alice', name: 'Alice Wonder', role: 'user' },
            },
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    // Initial render is authenticated immediately from cached tn_user
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-in');

    // Wait for me -> 401 -> refresh -> 200 to complete
    await act(async () => {
      await Promise.resolve();
    });

    // Token updated to the brand new one
    expect(localStorage.getItem('tn_token')).toBe('brand-new-refreshed-token');
    expect(screen.getByTestId('token').textContent).toBe('brand-new-refreshed-token');
    expect(screen.getByTestId('auth-status').textContent).toBe('logged-in');
  });
});