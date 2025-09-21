import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import {
  HealthPayload,
  IncidentPayload,
  TelemetryEvent,
  TelemetryHealthAlert,
  TelemetryIncident
} from '../types';
import { isIncidentActive, sortIncidents } from '../utils/telemetry';

const MAX_EVENT_HISTORY = 50;

const clampEvents = (events: TelemetryEvent[]) => events.slice(0, MAX_EVENT_HISTORY);

const computeActiveIncidentId = (events: TelemetryEvent[]) => {
  const incidents = events.filter(
    (event): event is TelemetryIncident => event.kind === 'incident' && isIncidentActive(event)
  );

  if (incidents.length === 0) {
    return null;
  }

  const [topIncident] = sortIncidents(incidents);
  return topIncident?.id ?? null;
};

interface TelemetryState {
  events: TelemetryEvent[];
  lastHealthCheck: TelemetryHealthAlert | null;
  activeIncidentId: string | null;

  reportIncident: (payload: IncidentPayload) => TelemetryIncident;
  reportHealth: (payload: HealthPayload) => TelemetryHealthAlert;
  acknowledgeIncident: (incidentId: string) => void;
  resolveIncident: (incidentId: string, note?: string) => TelemetryIncident | null;
  clearResolved: () => void;
  getActiveIncident: () => TelemetryIncident | null;
  getOpenIncidents: (limit?: number) => TelemetryIncident[];
}

export const useTelemetryStore = create<TelemetryState>()(
  persist(
    (set, get) => ({
      events: [],
      lastHealthCheck: null,
      activeIncidentId: null,

      reportIncident: (payload) => {
        let createdIncident: TelemetryIncident | null = null;

        set((state) => {
          const timestamp = new Date().toISOString();
          const status = payload.status ?? 'open';

          createdIncident = {
            id: uuid(),
            kind: 'incident',
            severity: payload.severity,
            message: payload.message,
            detail: payload.detail,
            source: payload.source,
            context: payload.context,
            createdAt: timestamp,
            status,
            resolutionNote: payload.resolutionNote,
            acknowledgedAt:
              status === 'acknowledged' || status === 'resolved' ? timestamp : undefined,
            resolvedAt: status === 'resolved' ? timestamp : undefined
          };

          const events = clampEvents([createdIncident!, ...state.events]);

          return {
            events,
            activeIncidentId: computeActiveIncidentId(events)
          };
        });

        return createdIncident!;
      },

      reportHealth: (payload) => {
        let createdHealth: TelemetryHealthAlert | null = null;

        set((state) => {
          createdHealth = {
            id: uuid(),
            kind: 'health',
            severity: payload.severity,
            message: payload.message,
            detail: payload.detail,
            source: payload.source,
            context: payload.context,
            metrics: payload.metrics,
            durationMs: payload.durationMs,
            createdAt: new Date().toISOString()
          };

          const events = clampEvents([createdHealth!, ...state.events]);

          return {
            events,
            lastHealthCheck: createdHealth!,
            activeIncidentId: computeActiveIncidentId(events)
          };
        });

        return createdHealth!;
      },

      acknowledgeIncident: (incidentId) => {
        set((state) => {
          let updated = false;

          const events = state.events.map((event) => {
            if (event.kind === 'incident' && event.id === incidentId && event.status === 'open') {
              updated = true;
              return {
                ...event,
                status: 'acknowledged',
                acknowledgedAt: new Date().toISOString()
              } satisfies TelemetryIncident;
            }

            return event;
          });

          if (!updated) {
            return state;
          }

          return {
            events,
            activeIncidentId: computeActiveIncidentId(events)
          };
        });
      },

      resolveIncident: (incidentId, note) => {
        let resolvedIncident: TelemetryIncident | null = null;

        set((state) => {
          let changed = false;

          const events = state.events.map((event) => {
            if (event.kind === 'incident' && event.id === incidentId && event.status !== 'resolved') {
              changed = true;
              const resolvedAt = new Date().toISOString();

              resolvedIncident = {
                ...event,
                status: 'resolved',
                resolvedAt,
                acknowledgedAt: event.acknowledgedAt ?? resolvedAt,
                resolutionNote: note ?? event.resolutionNote
              } satisfies TelemetryIncident;

              return resolvedIncident;
            }

            return event;
          });

          if (!changed) {
            return state;
          }

          return {
            events,
            activeIncidentId: computeActiveIncidentId(events)
          };
        });

        return resolvedIncident;
      },

      clearResolved: () => {
        set((state) => {
          const events = state.events.filter(
            (event) => event.kind !== 'incident' || event.status !== 'resolved'
          );

          return {
            events,
            activeIncidentId: computeActiveIncidentId(events)
          };
        });
      },

      getActiveIncident: () => {
        const { events, activeIncidentId } = get();
        if (!activeIncidentId) {
          return null;
        }

        const incident = events.find(
          (event): event is TelemetryIncident => event.kind === 'incident' && event.id === activeIncidentId
        );

        if (incident) {
          return incident;
        }

        const fallback = sortIncidents(
          events.filter(
            (event): event is TelemetryIncident => event.kind === 'incident' && isIncidentActive(event)
          )
        );

        return fallback[0] ?? null;
      },

      getOpenIncidents: (limit) => {
        const { events } = get();
        const open = sortIncidents(
          events.filter(
            (event): event is TelemetryIncident => event.kind === 'incident' && isIncidentActive(event)
          )
        );

        return typeof limit === 'number' ? open.slice(0, limit) : open;
      }
    }),
    {
      name: 'mas-telemetry-store',
      partialize: (state) => ({
        events: state.events,
        lastHealthCheck: state.lastHealthCheck,
        activeIncidentId: state.activeIncidentId
      })
    }
  )
);
