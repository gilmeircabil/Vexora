import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';

// Helper component to test AuthContext logout
const LogoutConsumer: React.FC<{ customRedirect?: string }> = ({ customRedirect }) => {
  const { user, token, isAuthenticated, logout, login } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="username">{user?.username || 'none'}</span>
      <span data-testid="token">{token || 'none'}</span>
      <button
        onClick={() =>
          login('mock-access-token', {
            id: '123',
            username: 'testuser',
            name: 'Test User',
            role: 'user',
          })
        }
      >
        Sign In Mock
      </button>
      <button onClick={() => (customRedirect ? logout(customRedirect) : logout())}>Log Out</button>
    </div>
  );
};

describe('AuthContext Sign Out & Redirect Suite', () => {
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

    // Mock fetch for auth calls
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/logout') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: '123', username: 'testuser', name: 'Test User', role: 'user' },
          }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: async () => ({ success: false }),
      });
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('redirects to /login and clears stored auth credentials on sign out', async () => {
    localStorage.setItem('tn_token', 'initial-token');
    localStorage.setItem('tn_has_session', 'true');

    render(
      <AuthProvider>
        <LogoutConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      // Allow initial fetchCurrentUser if triggered
    });

    // Verify localStorage has tokens before logout
    expect(localStorage.getItem('tn_token')).toBe('initial-token');

    // Trigger logout
    await act(async () => {
      screen.getByText('Log Out').click();
    });

    // Check credentials cleared
    expect(localStorage.getItem('tn_token')).toBeNull();
    expect(localStorage.getItem('tn_has_session')).toBeNull();

    // Verify redirected to /login
    expect(window.location.href).toBe('/login');
  });

  it('reloads if already on /login when logout is triggered', async () => {
    // Update the mock location for this test
    window.location.pathname = '/login';
    window.location.href = 'http://localhost/login';

    render(
      <AuthProvider>
        <LogoutConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText('Log Out').click();
    });

    expect(window.location.reload).toHaveBeenCalled();
  });

  it('clicking Sign Out in Header navigates to /login', async () => {
    localStorage.setItem('tn_token', 'valid-user-token');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Header />
        </MemoryRouter>
      </AuthProvider>,
    );

    // Wait for user to be populated via mock /api/auth/me
    await act(async () => {
      await Promise.resolve();
    });

    // Open profile menu by clicking avatar button
    const avatarButton = await screen.findByRole('button', { name: /user account menu/i });
    fireEvent.click(avatarButton);

    // Find and click the Sign Out button
    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    // Credentials removed and redirected to /login
    expect(localStorage.getItem('tn_token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('mobile dropbar button opens drawer with user profile prominently displayed at the top', async () => {
    localStorage.setItem('tn_token', 'valid-user-token');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Header />
        </MemoryRouter>
      </AuthProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Mobile dropbar toggle button
    const mobileDropbar = await screen.findByRole('button', { name: /toggle navigation menu/i });
    expect(mobileDropbar).toBeInTheDocument();

    // Drawer is closed initially
    expect(screen.queryByText('@testuser')).not.toBeInTheDocument();

    // Click mobile dropbar
    fireEvent.click(mobileDropbar);

    // Profile card is rendered in drawer
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();

    // Sign out from mobile drawer
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    });

    expect(localStorage.getItem('tn_token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});