import React from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@mas/ui';
import { cn } from '@mas/utils';
import { shallow } from 'zustand/shallow';
import { useTelemetryStore } from '../../stores/telemetryStore';
import {
  TELEMETRY_SEVERITY_ORDER,
  getIncidentStatusLabel,
  getSeverityLabel,
  isIncidentActive
} from '../../utils/telemetry';
import { TelemetryEvent, TelemetryIncident, TelemetrySeverity } from '../../types';

interface TelemetryLogProps {
  limit?: number;
  showHealth?: boolean;
  className?: string;
}

const severityBadgeClasses: Record<TelemetrySeverity, string> = {
  critical: 'bg-[#EE766D] text-white',
  warning:
    'bg-[rgba(238,118,109,0.12)] text-[#24242E] border border-[rgba(238,118,109,0.25)]',
  info: 'bg-[rgba(214,214,214,0.5)] text-[#24242E] border border-[rgba(36,36,46,0.18)]'
};

const statusBadgeClasses: Record<TelemetryIncident['status'], string> = {
  open: 'border border-dashed border-[#24242E] text-[#24242E]',
  acknowledged: 'bg-[rgba(214,214,214,0.5)] border border-[rgba(36,36,46,0.18)] text-[#24242E]',
  resolved: 'bg-[#D6D6D6] border border-[rgba(36,36,46,0.12)] text-[#24242E]'
};

const iconWrapperClasses: Record<'incident' | 'health', string> = {
  incident:
    'bg-[rgba(238,118,109,0.12)] text-[#EE766D] border border-[rgba(238,118,109,0.3)] shadow-[0_8px_18px_rgba(238,118,109,0.08)]',
  health: 'bg-[rgba(214,214,214,0.4)] text-[#24242E] border border-[rgba(36,36,46,0.2)]'
};

const incidentStatusWeight: Record<TelemetryIncident['status'], number> = {
  open: 3,
  acknowledged: 2,
  resolved: 1
};

const sortEvents = (a: TelemetryEvent, b: TelemetryEvent) => {
  if (a.kind === 'incident' && b.kind === 'incident') {
    const statusDelta = incidentStatusWeight[b.status] - incidentStatusWeight[a.status];
    if (statusDelta !== 0) {
      return statusDelta;
    }

    const severityDelta = TELEMETRY_SEVERITY_ORDER[b.severity] - TELEMETRY_SEVERITY_ORDER[a.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }
  } else if (a.kind === 'incident') {
    return -1;
  } else if (b.kind === 'incident') {
    return 1;
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

export const TelemetryLog: React.FC<TelemetryLogProps> = ({
  limit = 8,
  showHealth = true,
  className
}) => {
  const telemetry = useTelemetryStore(
    (state) => ({
      events: state.events,
      acknowledgeIncident: state.acknowledgeIncident,
      resolveIncident: state.resolveIncident
    }),
    shallow
  );

  const activeCount = React.useMemo(
    () =>
      telemetry.events.filter(
        (event): event is TelemetryIncident => event.kind === 'incident' && isIncidentActive(event)
      ).length,
    [telemetry.events]
  );

  const resolvedCount = React.useMemo(
    () =>
      telemetry.events.filter(
        (event): event is TelemetryIncident => event.kind === 'incident' && event.status === 'resolved'
      ).length,
    [telemetry.events]
  );

  const entries = React.useMemo(() => {
    const base = showHealth ? telemetry.events : telemetry.events.filter((event) => event.kind === 'incident');
    const sorted = [...base].sort(sortEvents);
    return limit ? sorted.slice(0, limit) : sorted;
  }, [telemetry.events, limit, showHealth]);

  const latestEntry = entries[0];

  const renderIncident = (incident: TelemetryIncident) => {
    return (
      <article
        key={incident.id}
        className="rounded-xl border border-[rgba(36,36,46,0.14)] bg-surface-100/80 p-4 shadow-[0_6px_18px_rgba(36,36,46,0.06)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold',
                iconWrapperClasses.incident
              )}
            >
              <AlertCircle size={18} />
            </span>
            <div className="space-y-1">
              <p className="font-semibold text-ink">{incident.message}</p>
              <p className="text-xs text-muted">
                {formatDistanceToNowStrict(new Date(incident.createdAt), { addSuffix: true })}
                {incident.source ? ` • ${incident.source}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                severityBadgeClasses[incident.severity]
              )}
            >
              {getSeverityLabel(incident.severity)}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide',
                statusBadgeClasses[incident.status]
              )}
            >
              {getIncidentStatusLabel(incident.status)}
            </span>
          </div>
        </div>

        {incident.detail && <p className="mt-3 text-sm text-muted">{incident.detail}</p>}

        {incident.resolutionNote && (
          <p className="mt-2 text-xs text-[#24242E]/70">
            <span className="font-semibold">Resolution:</span> {incident.resolutionNote}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#24242E]/65">
          {incident.acknowledgedAt && (
            <span>
              Acknowledged{' '}
              {formatDistanceToNowStrict(new Date(incident.acknowledgedAt), { addSuffix: true })}
            </span>
          )}
          {incident.resolvedAt && (
            <span>
              Resolved {formatDistanceToNowStrict(new Date(incident.resolvedAt), { addSuffix: true })}
            </span>
          )}
        </div>

        {incident.status !== 'resolved' && (
          <div className="mt-4 flex flex-wrap gap-2">
            {incident.status === 'open' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => telemetry.acknowledgeIncident(incident.id)}
              >
                Acknowledge
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => telemetry.resolveIncident(incident.id)}
            >
              Resolve
            </Button>
          </div>
        )}
      </article>
    );
  };

  const renderHealth = (alert: TelemetryEvent) => {
    if (alert.kind !== 'health') {
      return null;
    }

    return (
      <article
        key={alert.id}
        className="rounded-xl border border-[rgba(36,36,46,0.12)] bg-surface-100/70 p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold',
                iconWrapperClasses.health
              )}
            >
              <Activity size={18} />
            </span>
            <div className="space-y-1">
              <p className="font-semibold text-ink">{alert.message}</p>
              <p className="text-xs text-muted">
                {formatDistanceToNowStrict(new Date(alert.createdAt), { addSuffix: true })}
                {alert.source ? ` • ${alert.source}` : ''}
              </p>
            </div>
          </div>

          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
              severityBadgeClasses[alert.severity]
            )}
          >
            {getSeverityLabel(alert.severity)}
          </span>
        </div>

        {alert.detail && <p className="mt-3 text-sm text-muted">{alert.detail}</p>}

        {alert.metrics && (
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#24242E]/75 sm:grid-cols-2">
            {Object.entries(alert.metrics as Record<string, number>).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(36,36,46,0.12)] bg-surface-100/80 px-3 py-2"
              >
                <span className="text-[11px] uppercase tracking-wide text-[#24242E]/60">{key}</span>
                <span className="font-medium text-ink">{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {typeof alert.durationMs === 'number' && (
          <p className="mt-3 text-xs text-[#24242E]/65">
            Duration {Math.round(alert.durationMs / 1000)}s
          </p>
        )}
      </article>
    );
  };

  return (
    <section className={cn('space-y-4', className)} aria-live="polite">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Telemetry stream</p>
          <p className="text-xs text-muted">
            {entries.length > 0 && latestEntry
              ? `Updated ${formatDistanceToNowStrict(new Date(latestEntry.createdAt), {
                  addSuffix: true
                })}`
              : 'No signals yet'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#24242E]/70">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EE766D] px-2.5 py-1 text-white">
            <AlertCircle size={14} /> {activeCount} active
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(36,36,46,0.2)] px-2.5 py-1 text-[#24242E]/75">
            <CheckCircle2 size={14} /> {resolvedCount} resolved
          </span>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D6D6D6] bg-surface-100 p-6 text-center text-sm text-muted">
          No incidents or health alerts recorded yet. Telemetry updates will appear here instantly.
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((event) =>
            event.kind === 'incident' ? renderIncident(event) : renderHealth(event)
          )}
        </div>
      )}
    </section>
  );
};
