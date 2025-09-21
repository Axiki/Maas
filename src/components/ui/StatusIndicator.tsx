import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Clock, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useOfflineStore } from '../../stores/offlineStore';
import { useTelemetryStore } from '../../stores/telemetryStore';

interface StatusConfig {
  icon: React.ComponentType<{ size?: number }>;
  text: string;
  detail?: string;
  color: string;
  pulse: boolean;
}

export const StatusIndicator: React.FC = () => {
  const { isOnline } = useAuthStore();
  const { queuedOrders } = useOfflineStore();
  const { syncHealth, alerts, activeIncidentId } = useTelemetryStore((state) => ({
    syncHealth: state.syncHealth,
    alerts: state.alerts,
    activeIncidentId: state.activeIncidentId,
  }));

  const criticalSyncAlert = alerts.find(
    (alert) => alert.type === 'sync' && alert.severity === 'critical' && !alert.acknowledged,
  );

  const degradedSyncAlert = alerts.find(
    (alert) => alert.type === 'sync' && alert.severity === 'warning' && !alert.acknowledged,
  );

  const getStatus = (): StatusConfig => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: queuedOrders.length > 0 ? `Offline - ${queuedOrders.length} Queued` : 'Offline',
        detail: queuedOrders.length > 0 ? 'Reconnect to resume syncing' : undefined,
        color: 'text-warning bg-warning/10 border border-warning/40',
        pulse: true
      };
    }

    if (criticalSyncAlert) {
      const queued = criticalSyncAlert.metadata?.queuedOrders as number | undefined;
      return {
        icon: AlertCircle,
        text: criticalSyncAlert.incidentId
          ? `Incident ${criticalSyncAlert.incidentId}`
          : 'Sync incident',
        detail: queued ? `${queued} orders awaiting upload` : criticalSyncAlert.title,
        color: 'text-danger bg-danger/10 border border-danger/40',
        pulse: true,
      };
    }

    if (syncHealth?.status === 'failed') {
      return {
        icon: AlertCircle,
        text: 'Sync failure',
        detail: activeIncidentId ? `Incident ${activeIncidentId}` : 'Manual recovery required',
        color: 'text-danger bg-danger/10 border border-danger/40',
        pulse: true,
      };
    }

    if (syncHealth?.status === 'degraded' || degradedSyncAlert) {
      const pending =
        syncHealth?.pendingItems ?? (degradedSyncAlert?.metadata?.queuedOrders as number | undefined);
      return {
        icon: AlertTriangle,
        text: 'Sync delay',
        detail:
          pending && pending > 0
            ? `${pending} orders pending`
            : syncHealth?.summary ?? degradedSyncAlert?.title,
        color: 'text-warning bg-warning/10 border border-warning/40',
        pulse: true,
      };
    }

    if (queuedOrders.length > 0) {
      return {
        icon: Clock,
        text: `Syncing - ${queuedOrders.length}`,
        detail: 'Processing offline queue',
        color: 'text-primary-600 bg-primary-100 border border-primary-200',
        pulse: true
      };
    }

    return {
      icon: CheckCircle,
      text: 'Online',
      detail: activeIncidentId ? `Monitoring ${activeIncidentId}` : undefined,
      color: 'text-success bg-success/10 border border-success/30',
      pulse: false
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent transition-colors duration-200
        ${status.color}
      `}
    >
      <motion.div
        animate={status.pulse ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon size={14} />
      </motion.div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold sm:text-sm">{status.text}</span>
        {status.detail && (
          <span className="hidden text-[11px] font-normal text-ink-70 sm:block">{status.detail}</span>
        )}
      </div>
    </motion.div>
  );
};