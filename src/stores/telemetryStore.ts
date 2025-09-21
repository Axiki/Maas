import { create } from 'zustand';
import { fetchTelemetrySnapshot } from '../utils/telemetryClient';
import { logger } from '../utils/logger';
import type { ObservabilityAlert, SyncHealth } from '../types';

interface TelemetryState {
  alerts: ObservabilityAlert[];
  syncHealth: SyncHealth | null;
  isLoading: boolean;
  error?: string;
  lastFetchedAt?: string;
  activeIncidentId?: string;
  fetchTelemetry: (options?: { silent?: boolean }) => Promise<void>;
  acknowledgeAlert: (alertId: string) => void;
}

const resolveActiveIncidentId = (alerts: ObservabilityAlert[], fallback?: string) => {
  const critical = alerts.find((alert) => alert.severity === 'critical' && !alert.acknowledged);
  return critical?.incidentId ?? fallback;
};

export const useTelemetryStore = create<TelemetryState>((set) => ({
  alerts: [],
  syncHealth: null,
  isLoading: false,
  error: undefined,
  lastFetchedAt: undefined,
  activeIncidentId: undefined,
  fetchTelemetry: async (options) => {
    if (!options?.silent) {
      set({ isLoading: true, error: undefined });
    }

    try {
      const response = await fetchTelemetrySnapshot();
      const snapshot = logger.logApiResponse(response, 'Telemetry snapshot loaded', {
        alertCount: response.data.alerts.length,
        syncStatus: response.data.syncHealth.status,
      });

      const normalizedAlerts = snapshot.alerts.map((alert) => ({
        ...alert,
        acknowledged: alert.acknowledged ?? false,
      }));

      const activeIncidentId = resolveActiveIncidentId(
        normalizedAlerts,
        response.incidentId ?? response.meta?.fallbackIncidentId,
      );

      set({
        alerts: normalizedAlerts,
        syncHealth: snapshot.syncHealth,
        isLoading: false,
        error: undefined,
        lastFetchedAt: snapshot.fetchedAt,
        activeIncidentId,
      });
    } catch (error) {
      logger.error('Telemetry snapshot failed', { error });
      set({
        isLoading: false,
        error: 'Unable to load observability data.',
      });
    }
  },
  acknowledgeAlert: (alertId) => {
    set((state) => {
      const updatedAlerts = state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert,
      );

      const nextIncident = resolveActiveIncidentId(updatedAlerts, state.activeIncidentId);

      return {
        alerts: updatedAlerts,
        activeIncidentId: nextIncident,
      };
    });

    logger.info('Telemetry alert acknowledged', { alertId });
  },
}));
