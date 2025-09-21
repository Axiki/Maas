import { ApiResponse, ObservabilityAlert, TelemetrySnapshot } from '../types';

const formatIncidentId = (timestamp: Date) => {
  const iso = timestamp.toISOString().replace(/[-:]/g, '').split('.')[0];
  return `INC-${iso}`;
};

const buildAlerts = (incidentId: string, timestamp: Date): ObservabilityAlert[] => {
  const minutesSinceLastSync = 18;
  return [
    {
      id: 'alert-sync-critical',
      title: 'Orders are blocked from syncing',
      message: 'Offline orders have exceeded the sync retry threshold and require manual review.',
      severity: 'critical',
      type: 'sync',
      incidentId,
      createdAt: new Date(timestamp.getTime() - 1000 * 60 * 5).toISOString(),
      scopes: ['portal', 'backoffice', 'global'],
      metadata: {
        queuedOrders: 12,
        retryAttempts: 5,
        ageMinutes: minutesSinceLastSync,
      },
    },
    {
      id: 'alert-api-warning',
      title: 'Menu catalog sync latency rising',
      message: 'Upstream catalog service latency is elevated but requests are still completing.',
      severity: 'warning',
      type: 'performance',
      createdAt: new Date(timestamp.getTime() - 1000 * 60 * 12).toISOString(),
      scopes: ['backoffice'],
      metadata: {
        p95LatencyMs: 2200,
        previousBaselineMs: 650,
      },
    },
  ];
};

export const buildMockTelemetryResponse = (): ApiResponse<TelemetrySnapshot> => {
  const fetchedAt = new Date();
  const incidentId = formatIncidentId(fetchedAt);
  const alerts = buildAlerts(incidentId, fetchedAt);

  const snapshot: TelemetrySnapshot = {
    fetchedAt: fetchedAt.toISOString(),
    alerts,
    syncHealth: {
      status: 'degraded',
      summary: '12 offline orders remain in queue and last successful sync was 18 minutes ago.',
      pendingItems: 12,
      lastSuccessfulSync: new Date(fetchedAt.getTime() - 1000 * 60 * 18).toISOString(),
      impactedStores: ['store-1'],
    },
  };

  return {
    data: snapshot,
    incidentId,
    meta: {
      correlationId: `telemetry-${fetchedAt.getTime()}`,
      fallbackIncidentId: incidentId,
      source: 'mock-observability',
    },
  };
};
