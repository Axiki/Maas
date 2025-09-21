import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useOfflineStore } from '../../stores/offlineStore';

export const StatusIndicator: React.FC = () => {
  const { isOnline } = useAuthStore();
  const { queuedOrders } = useOfflineStore();

  const getStatus = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: queuedOrders.length > 0 ? `Offline - ${queuedOrders.length} Queued` : 'Offline',
        color: 'text-warning bg-warning/10',
        pulse: true
      };
    }
    
    if (queuedOrders.length > 0) {
      return {
        icon: Clock,
        text: `Syncing - ${queuedOrders.length}`,
        color: 'text-primary-600 bg-primary-100',
        pulse: true
      };
    }

    return {
      icon: CheckCircle,
      text: 'Online',
      color: 'text-success bg-success/10',
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
        flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        ${status.color}
      `}
    >
      <motion.div
        animate={status.pulse ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon size={14} />
      </motion.div>
      <span className="hidden sm:block">{status.text}</span>
    </motion.div>
  );
};