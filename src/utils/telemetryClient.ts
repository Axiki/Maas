import {
  HealthPayload,
  IncidentPayload,
  TelemetryHealthAlert,
  TelemetryIncident
} from '../types';
import { useTelemetryStore } from '../stores/telemetryStore';

class TelemetryClient {
  reportIncident(payload: IncidentPayload): TelemetryIncident {
    return useTelemetryStore.getState().reportIncident(payload);
  }

  reportHealth(payload: HealthPayload): TelemetryHealthAlert {
    return useTelemetryStore.getState().reportHealth(payload);
  }

  acknowledgeIncident(incidentId: string) {
    useTelemetryStore.getState().acknowledgeIncident(incidentId);
  }

  resolveIncident(incidentId: string, note?: string): TelemetryIncident | null {
    return useTelemetryStore.getState().resolveIncident(incidentId, note);
  }

  clearResolved() {
    useTelemetryStore.getState().clearResolved();
  }

  getActiveIncident(): TelemetryIncident | null {
    return useTelemetryStore.getState().getActiveIncident();
  }

  getOpenIncidents(limit?: number): TelemetryIncident[] {
    return useTelemetryStore.getState().getOpenIncidents(limit);
  }
}

export const telemetryClient = new TelemetryClient();
