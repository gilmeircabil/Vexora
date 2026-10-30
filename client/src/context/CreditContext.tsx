import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.js';

export interface CreditBalanceData {
  dailyAllowance: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyAllowance: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  reservedCredits: number;
  totalAvailable: number;
  nextDailyResetUtc: string;
}

interface CreditContextType {
  balance: CreditBalanceData | null;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<CreditBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshBalance = useCallback(async () => {
    if (!token) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/credits/balance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBalance(data.data);
        }
      }
    } catch {
      // Ignore network error
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshBalance();
    } else {
      setBalance(null);
    }
  }, [isAuthenticated, refreshBalance]);

  return (
    <CreditContext.Provider
      value={{
        balance,
        isLoading,
        refreshBalance,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
};

export function useCredits() {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}
