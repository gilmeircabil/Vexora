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
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tn_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
          return;
        }
      }
      // If token invalid, clear local storage
      localStorage.removeItem('tn_token');
      setToken(null);
      setUser(null);
    } catch {
      // Offline or network error - keep token if available
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('tn_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
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
    setToken(null);
    setUser(null);

    // Full page reload & redirect back to home page
    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname === '/') {
          window.location.reload();
        } else {
          window.location.href = '/';
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
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
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
