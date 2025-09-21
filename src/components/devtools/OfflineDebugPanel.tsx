import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { X, Database, ClipboardList, Activity } from 'lucide-react';
import { useOfflineStore, SyncLogEntry } from '../../stores/offlineStore';

interface OfflineDebugPanelProps {
  open: boolean;
  onClose: () => void;
}

const formatRelative = (value?: Date | null) => {
  if (!value) return '—';
  try {
    return formatDistanceToNow(value, { addSuffix: true });
  } catch {
    return value.toLocaleString();
  }
};

const formatAbsolute = (value?: Date | null) => {
  if (!value) return '—';
  return value.toLocaleString();
};

const logBadgeStyles: Record<SyncLogEntry['level'], string> = {
  info: 'bg-surface-200 text-muted',
  success: 'bg-primary-100 text-primary-600',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-danger/10 text-danger'
};

export const OfflineDebugPanel: React.FC<OfflineDebugPanelProps> = ({ open, onClose }) => {
  const {
    isOffline,
    isSyncing,
    queuedOrders,
    cachedProducts,
    cachedCategories,
    cachedPricing,
    cachedTaxes,
    cacheMetadata,
    lastSyncTime,
    syncLog
  } = useOfflineStore((state) => ({
    isOffline: state.isOffline,
    isSyncing: state.isSyncing,
    queuedOrders: state.queuedOrders,
    cachedProducts: state.cachedProducts,
    cachedCategories: state.cachedCategories,
    cachedPricing: state.cachedPricing,
    cachedTaxes: state.cachedTaxes,
    cacheMetadata: state.cacheMetadata,
    lastSyncTime: state.lastSyncTime,
    syncLog: state.syncLog
  }));

  const sortedQueue = [...queuedOrders].sort(
    (a, b) => b.queuedAt.getTime() - a.queuedAt.getTime()
  );
  const recentLogs = syncLog.slice(0, 10);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed top-20 right-4 z-50 w-[min(28rem,calc(100vw-2rem))]"
        >
          <div className="bg-surface-100/95 backdrop-blur-lg border border-line rounded-2xl shadow-modal overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b border-line">
              <div>
                <p className="text-sm font-semibold text-ink">Offline Debug</p>
                <p className="text-xs text-muted">
                  Inspect cached catalog data, order queue, and sync activity.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-200 transition-colors"
                aria-label="Close offline debug panel"
              >
                <X size={16} />
              </button>
            </header>

            <div className="px-4 py-3 space-y-4 text-xs text-ink">
              <section>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${
                      isOffline ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}
                  >
                    {isOffline ? 'Offline' : 'Online'}
                  </span>
                  <span className="px-2 py-1 rounded-full font-medium bg-primary-100 text-primary-600">
                    Queue {sortedQueue.length}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${
                      isSyncing ? 'bg-primary-100 text-primary-600' : 'bg-surface-200 text-muted'
                    }`}
                  >
                    {isSyncing ? 'Syncing…' : 'Idle'}
                  </span>
                  <span className="px-2 py-1 rounded-full font-medium bg-surface-200 text-muted">
                    Retention 72h
                  </span>
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <Database size={14} /> Cache metadata
                </div>
                <div className="space-y-2">
                  {[{
                    label: 'Catalog',
                    timestamp: cacheMetadata.catalogCachedAt,
                    detail: `${cachedProducts.length} products • ${cachedCategories.length} categories`
                  }, {
                    label: 'Pricing',
                    timestamp: cacheMetadata.pricingCachedAt,
                    detail: `${cachedPricing.length} price records`
                  }, {
                    label: 'Tax',
                    timestamp: cacheMetadata.taxCachedAt,
                    detail: `${cachedTaxes.length} tax rules`
                  }, {
                    label: 'Last sync',
                    timestamp: lastSyncTime,
                    detail: isSyncing ? 'Sync in progress' : 'Last successful reconciliation'
                  }].map(({ label, timestamp, detail }) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-3 rounded-lg bg-surface-200 px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-semibold text-ink">{label}</p>
                        <p className="text-[11px] text-muted">{detail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{formatRelative(timestamp)}</p>
                        <p className="text-[11px] text-muted">{formatAbsolute(timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <ClipboardList size={14} /> Queued orders
                </div>
                <div className="bg-surface-200 rounded-lg p-3 max-h-44 overflow-y-auto space-y-3">
                  {sortedQueue.length === 0 ? (
                    <p className="text-muted text-xs">No orders waiting for sync.</p>
                  ) : (
                    sortedQueue.map((order) => (
                      <div key={order.id} className="border border-line/40 rounded-lg p-2 bg-surface-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-semibold text-ink">{order.id}</p>
                            <p className="text-[11px] text-muted">
                              Total ${order.total.toFixed(2)} • {order.lines.length} line
                              {order.lines.length === 1 ? '' : 's'}
                            </p>
                          </div>
                          <span className="text-[11px] text-muted">
                            {order.offlineGuid ?? '—'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted mt-1">
                          Queued {formatRelative(order.queuedAt)} ({formatAbsolute(order.queuedAt)})
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <Activity size={14} /> Sync log
                </div>
                <div className="bg-surface-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {recentLogs.length === 0 ? (
                    <p className="text-muted text-xs">Sync log will populate after offline activity.</p>
                  ) : (
                    recentLogs.map((entry) => (
                      <div key={entry.id} className="flex items-start justify-between gap-3 bg-surface-100 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs font-medium text-ink">{entry.message}</p>
                          <p className="text-[11px] text-muted">
                            {formatRelative(entry.timestamp)} ({formatAbsolute(entry.timestamp)})
                          </p>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${logBadgeStyles[entry.level]}`}>
                          {entry.type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
