import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Clock, CheckCircle } from 'lucide-react';
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
        color: 'bg-[#EE766D]/15 text-[#EE766D] border-[#EE766D]/30',
        pulse: true,
      };
    }

    if (queuedOrders.length > 0) {
      return {
        icon: Clock,
        text: `Syncing - ${queuedOrders.length}`,
        color: 'bg-[#EE766D]/15 text-[#EE766D] border-[#EE766D]/30',
        pulse: true,
      };
    }

    return {
      icon: CheckCircle,
      text: 'Online',
      color: 'bg-[#D6D6D6]/10 text-[#D6D6D6] border-[#D6D6D6]/20',
      pulse: false,
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <motion.div
      role="status"
      tabIndex={0}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileFocus={{ scale: 1.02 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-[var(--transition-item-duration)] ease-[var(--transition-route-ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE766D]/40 ${status.color}`}
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