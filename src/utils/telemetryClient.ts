import { buildMockTelemetryResponse } from '../data/telemetry';
import type { ApiResponse, TelemetrySnapshot } from '../types';
import { logger } from './logger';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchTelemetrySnapshot = async (): Promise<ApiResponse<TelemetrySnapshot>> => {
  logger.debug('Telemetry snapshot request dispatched');

  await delay(180);

  const response = buildMockTelemetryResponse();

  logger.debug('Telemetry snapshot response received', {
    incidentId: response.incidentId ?? response.meta?.fallbackIncidentId,
    alertCount: response.data.alerts.length,
    syncStatus: response.data.syncHealth.status,
  });

  return response;
};
