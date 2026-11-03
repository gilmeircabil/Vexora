import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  MaintenanceConfigData,
  DEFAULT_MAINTENANCE_DATA,
  RouteLockStatus,
  getRouteLockStatus,
} from '../config/pageLocks';
import { platformApi } from '../services/platformApi';
import { adminDonationApi } from '../services/adminDonationApi';

interface MaintenanceContextType {
  maintenance: MaintenanceConfigData;
  isLoading: boolean;
  refresh: () => Promise<void>;
  saveMaintenanceConfig: (
    data: Partial<MaintenanceConfigData>,
  ) => Promise<{ success: boolean; error?: string }>;
  checkRouteLock: (pathname: string) => RouteLockStatus;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [maintenance, setMaintenance] = useState<MaintenanceConfigData>(DEFAULT_MAINTENANCE_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMaintenance = useCallback(async () => {
    try {
      const res = await platformApi.getMaintenance();
      if (res?.success && res.data) {
        setMaintenance({
          global: Boolean(res.data.global),
          title: res.data.title || DEFAULT_MAINTENANCE_DATA.title,
          message: res.data.message || DEFAULT_MAINTENANCE_DATA.message,
          estimatedReturn: res.data.estimatedReturn || '',
          pages: {
            ...DEFAULT_MAINTENANCE_DATA.pages,
            ...(res.data.pages || {}),
          },
        });
      }
    } catch {
      // Fallback silently to defaults
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const saveMaintenanceConfig = useCallback(async (data: Partial<MaintenanceConfigData>) => {
    try {
      const res = await adminDonationApi.updateMaintenance(data);
      if (res?.success && res.data) {
        setMaintenance({
          global: Boolean(res.data.global),
          title: res.data.title || DEFAULT_MAINTENANCE_DATA.title,
          message: res.data.message || DEFAULT_MAINTENANCE_DATA.message,
          estimatedReturn: res.data.estimatedReturn || '',
          pages: {
            ...DEFAULT_MAINTENANCE_DATA.pages,
            ...(res.data.pages || {}),
          },
        });
        return { success: true };
      }
      return { success: false, error: res?.error || 'Failed to update maintenance settings' };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error updating maintenance settings',
      };
    }
  }, []);

  const checkRouteLock = useCallback(
    (pathname: string): RouteLockStatus => {
      return getRouteLockStatus(pathname, maintenance);
    },
    [maintenance],
  );

  const value = useMemo(
    () => ({
      maintenance,
      isLoading,
      refresh: fetchMaintenance,
      saveMaintenanceConfig,
      checkRouteLock,
    }),
    [maintenance, isLoading, fetchMaintenance, saveMaintenanceConfig, checkRouteLock],
  );

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
};

export function useMaintenance(): MaintenanceContextType {
  const context = useContext(MaintenanceContext);
  if (!context) {
    return {
      maintenance: DEFAULT_MAINTENANCE_DATA,
      isLoading: false,
      refresh: async () => {},
      saveMaintenanceConfig: async () => ({ success: true }),
      checkRouteLock: (pathname: string) => getRouteLockStatus(pathname, DEFAULT_MAINTENANCE_DATA),
    };
  }
  return context;
}
