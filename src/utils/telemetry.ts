import { TelemetryIncident, TelemetrySeverity } from '../types';

export const TELEMETRY_PALETTE = Object.freeze({
  accent: '#EE766D',
  base: '#24242E',
  neutral: '#D6D6D6'
});

export const TELEMETRY_SEVERITY_ORDER: Record<TelemetrySeverity, number> = {
  critical: 3,
  warning: 2,
  info: 1
};

export const getSeverityLabel = (severity: TelemetrySeverity) => {
  switch (severity) {
    case 'critical':
      return 'Critical';
    case 'warning':
      return 'Warning';
    default:
      return 'Info';
  }
};

export const getIncidentStatusLabel = (status: TelemetryIncident['status']) => {
  switch (status) {
    case 'acknowledged':
      return 'Acknowledged';
    case 'resolved':
      return 'Resolved';
    default:
      return 'Open';
  }
};

export const sortIncidents = <T extends { severity: TelemetrySeverity; createdAt: string }>(
  incidents: T[]
) => {
  return [...incidents].sort((a, b) => {
    const severityDelta =
      TELEMETRY_SEVERITY_ORDER[b.severity] - TELEMETRY_SEVERITY_ORDER[a.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const isIncidentActive = (incident: TelemetryIncident) =>
  incident.status === 'open' || incident.status === 'acknowledged';
