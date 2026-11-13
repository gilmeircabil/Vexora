import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserSubscription {
  plan: 'free' | 'pro' | 'premium';
  status: string;
  billingInterval?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface UserCredits {
  dailyAllowance: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyAllowance: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  reservedCredits: number;
  totalAvailable: number;
  nextDailyResetUtc?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  role: 'user' | 'admin';
  educationRole?: 'student' | 'teacher' | 'educator';
  emailVerified?: boolean;
  accountStatus?: string;
  subscription?: UserSubscription;
  credits?: UserCredits;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: (redirectTo?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updated: Partial<UserProfile>) => void;
}

export function normalizeAvatarUrl(url?: string): string | undefined {
  if (!url) return url;
  return url
    .replace(/^https:\/\/pub-[^/]+\.r2\.dev\/assets\//, '/api/design-assets/files/')
    .replace(/^https:\/\/pub-[^/]+\.r2\.dev\/thumbs\//, '/api/design-assets/files/thumbs/');
}

export function sanitizeUserProfile(user: UserProfile | null): UserProfile | null {
  if (!user) return null;
  return {
    ...user,
    avatarUrl: normalizeAvatarUrl(user.avatarUrl),
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('tn_user');
      return saved ? sanitizeUserProfile(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tn_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const tryRefreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.accessToken) {
          localStorage.setItem('tn_token', data.data.accessToken);
          localStorage.setItem('tn_has_session', 'true');
          if (data.data.user) {
            const sanitized = sanitizeUserProfile(data.data.user);
            localStorage.setItem('tn_user', JSON.stringify(sanitized));
            setUser(sanitized);
          }
          setToken(data.data.accessToken);
          return true;
        } else {
          localStorage.removeItem('tn_has_session');
        }
      } else {
        localStorage.removeItem('tn_has_session');
      }
    } catch {
      // Refresh failed or network offline
    }
    return false;
  }, []);

  const fetchCurrentUser = useCallback(
    async (authToken: string) => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Guard: don't overwrite if user was logged out while request was in-flight
            if (localStorage.getItem('tn_token')) {
              const sanitized = sanitizeUserProfile(data.data);
              localStorage.setItem('tn_user', JSON.stringify(sanitized));
              setUser(sanitized);
            }
            return;
          }
        }

        // Access token might be expired; attempt silent refresh via 7-day cookie
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          localStorage.removeItem('tn_token');
          localStorage.removeItem('tn_user');
          localStorage.removeItem('tn_has_session');
          setToken(null);
          setUser(null);
        }
      } catch {
        // Offline or network error - keep token if available
      } finally {
        setIsLoading(false);
      }
    },
    [tryRefreshToken],
  );

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      // Only probe for refresh if a session was previously active in this browser
      const hasSession = localStorage.getItem('tn_has_session') === 'true';
      if (hasSession) {
        tryRefreshToken().finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }
  }, [token, fetchCurrentUser, tryRefreshToken]);

  const login = (newToken: string, newUser: UserProfile) => {
    const sanitized = sanitizeUserProfile(newUser);
    localStorage.setItem('tn_token', newToken);
    localStorage.setItem('tn_has_session', 'true');
    localStorage.setItem('tn_user', JSON.stringify(sanitized));
    setToken(newToken);
    setUser(sanitized);
  };

  const logout = async (redirectTo: string = '/login') => {
    try {
      const activeToken = token || localStorage.getItem('tn_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : undefined,
      });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('tn_token');
    localStorage.removeItem('tn_user');
    localStorage.removeItem('tn_has_session');
    setToken(null);
    setUser(null);

    // Redirect to login page
    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname === redirectTo) {
          window.location.reload();
        } else {
          window.location.href = redirectTo;
        }
      } catch {
        // Fallback for non-browser/test environments
      }
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const updateUser = useCallback((updated: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = sanitizeUserProfile({ ...prev, ...updated })!;
      try {
        localStorage.setItem('tn_user', JSON.stringify(next));
      } catch {
        // Fallback in case of quota or serialization issues
      }
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
