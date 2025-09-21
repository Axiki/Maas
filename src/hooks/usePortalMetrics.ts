import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchPortalMetrics,
  getPortalMetricsSnapshot,
  PortalMetrics
} from '../data/mockPortalAnalytics';
import { useOfflineStore } from '../stores/offlineStore';

const DEFAULT_REFRESH_MS = 60_000;

type LoadTrigger = 'initial' | 'manual' | 'interval';

export interface UsePortalMetricsOptions {
  autoRefreshMs?: number | null;
}

export interface UsePortalMetricsResult {
  metrics: PortalMetrics;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  refreshInterval: number | null;
  setRefreshInterval: (interval: number | null) => void;
  isOffline: boolean;
}

export const usePortalMetrics = (
  options: UsePortalMetricsOptions = {}
): UsePortalMetricsResult => {
  const { autoRefreshMs } = options;
  const initialInterval =
    autoRefreshMs === undefined ? DEFAULT_REFRESH_MS : autoRefreshMs;

  const isOffline = useOfflineStore((state) => state.isOffline);
  const lastSyncTime = useOfflineStore((state) => state.lastSyncTime);

  const [metrics, setMetrics] = useState<PortalMetrics>(() => getPortalMetricsSnapshot());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshIntervalState] = useState<number | null>(
    initialInterval
  );

  const controllerRef = useRef<AbortController | null>(null);
  const previousOfflineRef = useRef<boolean>(isOffline);

  const loadMetrics = useCallback(
    async (trigger: LoadTrigger = 'manual') => {
      const setPending = trigger === 'initial' ? setIsLoading : setIsRefreshing;
      setPending(true);

      if (isOffline) {
        setPending(false);
        setError('Offline mode: showing cached metrics.');
        setLastUpdated((prev) => {
          if (!lastSyncTime) {
            return prev;
          }

          if (!prev) {
            return lastSyncTime;
          }

          return prev > lastSyncTime ? prev : lastSyncTime;
        });
        return;
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const data = await fetchPortalMetrics({ signal: controller.signal });
        setMetrics(data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }

        setError('Unable to load portal metrics.');
      } finally {
        setPending(false);
      }
    },
    [isOffline, lastSyncTime]
  );

  const refresh = useCallback(() => loadMetrics('manual'), [loadMetrics]);

  useEffect(() => {
    void loadMetrics('initial');

    return () => {
      controllerRef.current?.abort();
    };
  }, [loadMetrics]);

  useEffect(() => {
    if (previousOfflineRef.current && !isOffline) {
      void refresh();
    }

    previousOfflineRef.current = isOffline;
  }, [isOffline, refresh]);

  useEffect(() => {
    if (isOffline) {
      controllerRef.current?.abort();
      setIsLoading(false);
      setIsRefreshing(false);
      setError('Offline mode: showing cached metrics.');
      setLastUpdated((prev) => {
        if (!lastSyncTime) {
          return prev;
        }

        if (!prev) {
          return lastSyncTime;
        }

        return prev > lastSyncTime ? prev : lastSyncTime;
      });
    }
  }, [isOffline, lastSyncTime]);

  useEffect(() => {
    if (refreshInterval === null || refreshInterval <= 0 || isOffline) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const id = window.setInterval(() => {
      void loadMetrics('interval');
    }, refreshInterval);

    return () => {
      window.clearInterval(id);
    };
  }, [refreshInterval, isOffline, loadMetrics]);

  useEffect(() => {
    if (autoRefreshMs !== undefined) {
      setRefreshIntervalState(autoRefreshMs);
    }
  }, [autoRefreshMs]);

  const updateRefreshInterval = useCallback((interval: number | null) => {
    setRefreshIntervalState(interval);
  }, []);

  return {
    metrics,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    refreshInterval,
    setRefreshInterval: updateRefreshInterval,
    isOffline
  };
};
