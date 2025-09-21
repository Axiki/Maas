import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import { Activity, AlertCircle, CheckCircle, Clock, WifiOff } from 'lucide-react';
import { shallow } from 'zustand/shallow';
import { useAuthStore } from '../../stores/authStore';
import { useOfflineStore } from '../../stores/offlineStore';
import { useTelemetryStore } from '../../stores/telemetryStore';
import {
  getIncidentStatusLabel,
  getSeverityLabel,
  isIncidentActive,
  sortIncidents
} from '../../utils/telemetry';
import { TelemetryHealthAlert, TelemetryIncident } from '../../types';

type StatusType = 'offline' | 'syncing' | 'incident' | 'health' | 'online';

interface StatusConfig {
  type: StatusType;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  message: string;
  classes: string;
  pulse: boolean;
  severity?: TelemetryIncident['severity'];
  tooltipIncidents?: TelemetryIncident[];
  healthAlert?: TelemetryHealthAlert | null;
}

const severityClasses: Record<'critical' | 'warning' | 'info', string> = {
  critical:
    'text-[#EE766D] bg-[rgba(238,118,109,0.16)] border border-[rgba(238,118,109,0.45)] shadow-[0_10px_30px_rgba(238,118,109,0.12)]',
  warning: 'text-[#EE766D] bg-[rgba(238,118,109,0.08)] border border-[rgba(238,118,109,0.25)]',
  info: 'text-[#24242E] bg-[rgba(214,214,214,0.55)] border border-[rgba(36,36,46,0.18)]'
};

const offlineClasses =
  'text-[#24242E] bg-[rgba(36,36,46,0.12)] border border-[rgba(36,36,46,0.22)]';
const syncingClasses =
  'text-[#24242E] bg-[rgba(214,214,214,0.4)] border border-[rgba(36,36,46,0.2)]';
const onlineClasses =
  'text-[#24242E] bg-[rgba(214,214,214,0.3)] border border-[rgba(36,36,46,0.18)]';

const indicatorBaseClasses =
  'relative flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EE766D]/40';

export const StatusIndicator: React.FC = () => {
  const { isOnline } = useAuthStore();
  const { queuedOrders } = useOfflineStore();
  const telemetryState = useTelemetryStore(
    (state) => ({
      events: state.events,
      activeIncidentId: state.activeIncidentId,
      lastHealthCheck: state.lastHealthCheck
    }),
    shallow
  );

  const openIncidents = React.useMemo(
    () =>
      telemetryState.events.filter(
        (event): event is TelemetryIncident =>
          event.kind === 'incident' && isIncidentActive(event)
      ),
    [telemetryState.events]
  );

  const sortedOpenIncidents = React.useMemo(
    () => sortIncidents(openIncidents),
    [openIncidents]
  );

  const activeIncident = React.useMemo(() => {
    if (sortedOpenIncidents.length === 0) {
      return null;
    }

    if (!telemetryState.activeIncidentId) {
      return sortedOpenIncidents[0];
    }

    return (
      sortedOpenIncidents.find(
        (incident) => incident.id === telemetryState.activeIncidentId
      ) ?? sortedOpenIncidents[0]
    );
  }, [sortedOpenIncidents, telemetryState.activeIncidentId]);

  const healthAlert = React.useMemo(() => {
    const alert = telemetryState.lastHealthCheck;
    if (!alert || alert.severity === 'info') {
      return null;
    }
    return alert;
  }, [telemetryState.lastHealthCheck]);

  const queuedCount = queuedOrders.length;
  const openIncidentCount = openIncidents.length;
  const tooltipIncidents = React.useMemo(
    () => sortedOpenIncidents.slice(0, 3),
    [sortedOpenIncidents]
  );

  const [isTooltipOpen, setTooltipOpen] = React.useState(false);
  const tooltipId = React.useId();

  React.useEffect(() => {
    if (!activeIncident && !healthAlert) {
      setTooltipOpen(false);
    }
  }, [activeIncident, healthAlert]);

  let status: StatusConfig;

  if (!isOnline) {
    const text = queuedCount > 0 ? `Offline · ${queuedCount} queued` : 'Offline';
    status = {
      type: 'offline',
      icon: WifiOff,
      label: 'Offline',
      message: text,
      classes: offlineClasses,
      pulse: true
    };
  } else if (queuedCount > 0) {
    status = {
      type: 'syncing',
      icon: Clock,
      label: 'Syncing',
      message: `${queuedCount} queued`,
      classes: syncingClasses,
      pulse: true
    };
  } else if (activeIncident) {
    status = {
      type: 'incident',
      icon: AlertCircle,
      label: `${getSeverityLabel(activeIncident.severity)} incident`,
      message: activeIncident.message,
      classes: severityClasses[activeIncident.severity],
      pulse: true,
      severity: activeIncident.severity,
      tooltipIncidents,
      healthAlert: null
    };
  } else if (healthAlert) {
    status = {
      type: 'health',
      icon: Activity,
      label: `${getSeverityLabel(healthAlert.severity)} health`,
      message: healthAlert.message,
      classes: severityClasses[healthAlert.severity],
      pulse: false,
      severity: healthAlert.severity,
      tooltipIncidents: [],
      healthAlert
    };
  } else {
    status = {
      type: 'online',
      icon: CheckCircle,
      label: 'Operational',
      message: 'Systems nominal',
      classes: onlineClasses,
      pulse: false,
      tooltipIncidents: [],
      healthAlert: null
    };
  }

  const Icon = status.icon;
  const isInteractive = status.type === 'incident' || status.type === 'health';

  const ariaLabel = `${status.label}. ${status.message}`;

  const toggleTooltip = () => {
    if (!isInteractive) {
      return;
    }
    setTooltipOpen((previous) => !previous);
  };

  const openTooltip = () => {
    if (isInteractive) {
      setTooltipOpen(true);
    }
  };

  const closeTooltip = () => {
    if (isInteractive) {
      setTooltipOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeTooltip();
      event.currentTarget.blur();
    }
  };

  const iconMotion = {
    animate: status.pulse ? { scale: [1, 1.08, 1] } : {},
    transition: { duration: 2, repeat: Infinity }
  } as const;

  const renderContent = (
    <>
      <motion.div {...iconMotion}>
        <Icon size={14} />
      </motion.div>
      <span className="hidden sm:inline text-sm font-medium">{status.label}</span>
      {(status.type === 'offline' || status.type === 'syncing') && (
        <span className="hidden md:inline text-xs text-[#24242E]/70">{status.message}</span>
      )}
      {status.type === 'incident' && (
        <>
          <span className="hidden md:inline max-w-[200px] truncate text-xs text-[#24242E]/80">
            {status.message}
          </span>
          {openIncidentCount > 1 && (
            <span className="hidden sm:inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EE766D] px-1.5 text-[11px] font-semibold text-white">
              {openIncidentCount}
            </span>
          )}
        </>
      )}
      {status.type === 'health' && (
        <span className="hidden md:inline max-w-[200px] truncate text-xs text-[#24242E]/75">
          {status.message}
        </span>
      )}
    </>
  );

  return (
    <div className="relative" role="status" aria-live="polite">
      {isInteractive ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={openTooltip}
            onFocus={openTooltip}
            onMouseLeave={closeTooltip}
            onBlur={closeTooltip}
            onClick={toggleTooltip}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel}
            aria-expanded={isTooltipOpen}
            aria-controls={isTooltipOpen ? tooltipId : undefined}
            aria-describedby={isTooltipOpen ? tooltipId : undefined}
            className={`${indicatorBaseClasses} ${status.classes}`}
          >
            {renderContent}
          </motion.button>
          <AnimatePresence>
            {isTooltipOpen && (
              <motion.div
                key="status-tooltip"
                id={tooltipId}
                role="tooltip"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                onMouseEnter={openTooltip}
                onMouseLeave={closeTooltip}
                className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-[rgba(36,36,46,0.16)] bg-surface-100/95 p-4 text-left shadow-card backdrop-blur-sm"
              >
                {status.type === 'incident' && status.tooltipIncidents && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">Active incidents</p>
                      <span className="text-xs font-medium uppercase tracking-wide text-[#24242E]/60">
                        {getSeverityLabel(status.severity ?? 'info')}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {status.tooltipIncidents.map((incident) => (
                        <li
                          key={incident.id}
                          className="rounded-lg border border-[rgba(36,36,46,0.14)] bg-surface-100/80 p-3"
                        >
                          <p className="text-sm font-medium text-ink">{incident.message}</p>
                          {incident.source && (
                            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#24242E]/55">
                              {incident.source}
                            </p>
                          )}
                          {incident.detail && (
                            <p className="mt-1 text-xs text-muted">{incident.detail}</p>
                          )}
                          <div className="mt-2 flex items-center justify-between text-[11px] text-[#24242E]/65">
                            <span>{getIncidentStatusLabel(incident.status)}</span>
                            <span>
                              {formatDistanceToNowStrict(new Date(incident.createdAt), {
                                addSuffix: true
                              })}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {openIncidentCount > (status.tooltipIncidents?.length ?? 0) && (
                      <p className="text-xs text-[#24242E]/60">
                        +{openIncidentCount - (status.tooltipIncidents?.length ?? 0)} additional incidents tracked
                      </p>
                    )}
                  </div>
                )}

                {status.type === 'health' && status.healthAlert && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">Service health</p>
                      <span className="text-xs font-medium uppercase tracking-wide text-[#24242E]/60">
                        {getSeverityLabel(status.healthAlert.severity)}
                      </span>
                    </div>
                    {status.healthAlert.source && (
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[#24242E]/55">
                        {status.healthAlert.source}
                      </p>
                    )}
                    {status.healthAlert.detail && (
                      <p className="text-sm text-muted">{status.healthAlert.detail}</p>
                    )}
                    <p className="text-xs text-[#24242E]/70">
                      Updated {formatDistanceToNowStrict(new Date(status.healthAlert.createdAt), {
                        addSuffix: true
                      })}
                    </p>
                    {status.healthAlert.metrics && (
                      <div className="rounded-lg border border-[rgba(36,36,46,0.14)] bg-surface-100/80 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#24242E]/60">
                          Metrics
                        </p>
                        <dl className="mt-2 grid grid-cols-1 gap-2 text-xs text-[#24242E]/75">
                          {Object.entries(status.healthAlert.metrics as Record<string, number>).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between gap-4">
                              <dt className="capitalize text-[11px] text-[#24242E]/65">{key}</dt>
                              <dd className="font-medium text-ink">{value.toLocaleString()}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                    {typeof status.healthAlert.durationMs === 'number' && (
                      <p className="text-xs text-[#24242E]/70">
                        Duration {Math.round(status.healthAlert.durationMs / 1000)}s
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${indicatorBaseClasses} ${status.classes}`}
          aria-label={ariaLabel}
        >
          {renderContent}
        </motion.div>
      )}
    </div>
  );
};