import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type MascotMood = 'idle' | 'crunch' | 'celebrate';

export interface MascotContextType {
  mood: MascotMood;
  isMinimized: boolean;
  setMood: (mood: MascotMood) => void;
  setIsMinimized: (minimized: boolean) => void;
  triggerMood: (mood: MascotMood, durationMs?: number) => void;
}

const STORAGE_KEY = 'vexora_mascot_minimized';

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export const MascotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMood] = useState<MascotMood>('idle');
  const [isMinimized, setIsMinimizedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setIsMinimized = useCallback((minimized: boolean) => {
    setIsMinimizedState(minimized);
    try {
      localStorage.setItem(STORAGE_KEY, minimized ? 'true' : 'false');
    } catch {
      // ignore in restricted environments
    }
  }, []);

  const triggerMood = useCallback((temporaryMood: MascotMood, durationMs = 3000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setMood(temporaryMood);
    timerRef.current = setTimeout(() => {
      setMood('idle');
      timerRef.current = null;
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <MascotContext.Provider
      value={{
        mood,
        isMinimized,
        setMood,
        setIsMinimized,
        triggerMood,
      }}
    >
      {children}
    </MascotContext.Provider>
  );
};

export const useMascot = (): MascotContextType => {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error('useMascot must be used within a MascotProvider');
  }
  return context;
};
