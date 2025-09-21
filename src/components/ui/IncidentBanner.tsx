import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, X } from 'lucide-react';
import { Button } from '@mas/ui';
import type { IncidentSeverity, ObservabilityAlert } from '../../types';

interface IncidentBannerProps {
  alerts: ObservabilityAlert[];
  onAcknowledge: (alertId: string) => void;
}

const severityStyles: Record<IncidentSeverity, { container: string; accent: string; pill: string; ring: string }> = {
  critical: {
    container: 'bg-danger/10 border-danger/40 text-danger',
    accent: 'bg-danger text-white',
    pill: 'bg-danger/20 text-danger',
    ring: 'focus-visible:ring-danger/40',
  },
  warning: {
    container: 'bg-warning/10 border-warning/40 text-warning',
    accent: 'bg-warning text-ink',
    pill: 'bg-warning/20 text-warning',
    ring: 'focus-visible:ring-warning/40',
  },
  info: {
    container: 'bg-primary-100 border-primary-200 text-primary-600',
    accent: 'bg-primary-500 text-white',
    pill: 'bg-primary-200 text-primary-600',
    ring: 'focus-visible:ring-primary-500/30',
  },
};

const formatTime = (isoDate: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch (error) {
    return '';
  }
};

export const IncidentBanner: React.FC<IncidentBannerProps> = ({ alerts, onAcknowledge }) => {
  if (!alerts.length) {
    return null;
  }

  return (
    <div aria-live="assertive" className="space-y-3" role="status">
      <AnimatePresence>
        {alerts.map((alert) => {
          const style = severityStyles[alert.severity];
          const incidentTime = formatTime(alert.createdAt);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className={`rounded-lg border shadow-card ${style.container}`}
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-2 ${style.accent}`} aria-hidden>
                    <AlertOctagon size={16} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold sm:text-base">{alert.title}</p>
                      {alert.incidentId && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${style.pill}`}>
                          Incident {alert.incidentId}
                        </span>
                      )}
                      {incidentTime && (
                        <span className="text-xs font-medium text-ink-70">{incidentTime}</span>
                      )}
                    </div>

                    <p className="text-sm text-ink-70 sm:text-base">{alert.message}</p>

                    {alert.metadata?.queuedOrders && (
                      <p className="text-xs font-medium text-ink-70">
                        {alert.metadata.queuedOrders as number} orders waiting for sync
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAcknowledge(alert.id)}
                  aria-label={`Acknowledge ${alert.title}`}
                  className={`self-end text-inherit hover:bg-transparent focus-visible:ring-2 focus-visible:ring-offset-0 ${style.ring}`}
                >
                  <X size={16} />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
