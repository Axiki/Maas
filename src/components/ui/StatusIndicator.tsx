import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useOfflineStore } from '../../stores/offlineStore';

interface StatusIndicatorProps {
  debugEnabled?: boolean;
  onToggleDebug?: () => void;
  debugOpen?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  debugEnabled = false,
  onToggleDebug,
  debugOpen = false
}) => {
  const { isOnline } = useAuthStore();
  const { isOffline, isSyncing, queuedOrders, lastSyncTime } = useOfflineStore((state) => ({
    isOffline: state.isOffline,
    isSyncing: state.isSyncing,
    queuedOrders: state.queuedOrders,
    lastSyncTime: state.lastSyncTime
  }));

  const queueCount = queuedOrders.length;
  const offline = isOffline || !isOnline;

  let status = {
    icon: Wifi,
    text: 'Online',
    color: 'text-success bg-success/10',
    pulse: false
  } as const;

  if (offline) {
    status = {
      icon: WifiOff,
      text: queueCount > 0 ? `Offline • ${queueCount} queued` : 'Offline',
      color: 'text-warning bg-warning/10',
      pulse: true
    } as const;
  } else if (isSyncing) {
    status = {
      icon: Clock,
      text: queueCount > 0 ? `Syncing • ${queueCount}` : 'Syncing',
      color: 'text-primary-600 bg-primary-100',
      pulse: true
    } as const;
  } else if (queueCount > 0) {
    status = {
      icon: Clock,
      text: `Queued • ${queueCount}`,
      color: 'text-primary-600 bg-primary-100',
      pulse: false
    } as const;
  }

  const Icon = status.icon;
  const lastSyncLabel = lastSyncTime
    ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  const indicator = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      aria-live="polite"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}
    >
      <motion.div
        animate={status.pulse ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 2.2, repeat: status.pulse ? Infinity : 0 }}
        className="flex items-center justify-center"
      >
        <Icon size={14} />
      </motion.div>
      <span className="hidden sm:block">{status.text}</span>
      {debugEnabled && (
        <span className="uppercase text-[10px] tracking-wide text-muted hidden sm:block">Dev</span>
      )}
    </motion.div>
  );

  return (
    <div className="relative flex flex-col items-end">
      {debugEnabled ? (
        <button
          type="button"
          onClick={onToggleDebug}
          aria-pressed={debugOpen}
          className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 rounded-full ${
            debugOpen ? 'ring-2 ring-primary-500/60' : ''
          }`}
        >
          {indicator}
        </button>
      ) : (
        indicator
      )}
      <span className="text-[10px] text-muted mt-1 hidden xl:block">
        Last sync: {lastSyncLabel}
      </span>
    </div>
  );
};