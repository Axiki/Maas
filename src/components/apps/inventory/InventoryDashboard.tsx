import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Layers, Package, Timer } from 'lucide-react';
import { Card, StatusPill } from '@mas/ui';
import { MotionWrapper } from '../../ui/MotionWrapper';
import { useInventoryStore } from '../../../stores/inventoryStore';
import type {
  ExpiryStatus,
  InventoryBatch,
  InventoryCountSchedule,
  InventoryMovement,
  StockLevel
} from '../../../types';

type InventoryTab = 'on-hand' | 'movements' | 'counts' | 'batches';

type TabConfig = {
  id: InventoryTab;
  label: string;
  description: string;
};

type Kpi = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: 'neutral' | 'warning' | 'critical' | 'positive';
  icon: LucideIcon;
};

const tabs: TabConfig[] = [
  { id: 'on-hand', label: 'On Hand', description: 'Snapshot of current availability and coverage' },
  { id: 'movements', label: 'Movements', description: 'Receiving, transfers, adjustments, and waste' },
  { id: 'counts', label: 'Counts', description: 'Cycle counts and reconciliations' },
  { id: 'batches', label: 'Batches', description: 'FEFO queue with remaining quantities' }
];

const toneIconWrapper: Record<Kpi['tone'], string> = {
  neutral: 'bg-[#D6D6D6]/60 text-[#24242E]',
  warning: 'bg-[#EE766D]/15 text-[#EE766D]',
  critical: 'bg-[#EE766D] text-white',
  positive: 'bg-[#24242E] text-white'
};

const formatDate = (value: string) => format(new Date(value), 'MMM d, yyyy');

const getStockTone = (status: StockLevel): 'neutral' | 'warning' | 'critical' | 'positive' => {
  switch (status) {
    case 'critical':
      return 'critical';
    case 'low':
      return 'warning';
    case 'optimal':
      return 'positive';
    case 'overstock':
      return 'neutral';
    default:
      return 'neutral';
  }
};

const getStockLabel = (status: StockLevel) => {
  switch (status) {
    case 'critical':
      return 'Critical Stock';
    case 'low':
      return 'Low Stock';
    case 'optimal':
      return 'On Target';
    case 'overstock':
      return 'Overstock';
    default:
      return status;
  }
};

const getExpiryTone = (status: ExpiryStatus): 'neutral' | 'warning' | 'critical' | 'positive' => {
  switch (status) {
    case 'expired':
      return 'critical';
    case 'expiring':
      return 'warning';
    case 'fresh':
    default:
      return 'positive';
  }
};

const getExpiryLabel = (status: ExpiryStatus, days: number) => {
  if (status === 'expired') {
    return 'Expired';
  }

  if (status === 'expiring') {
    if (days <= 0) {
      return 'Expires Today';
    }
    return `Expiring in ${days}d`;
  }

  return 'Fresh';
};

const getMovementTone = (type: InventoryMovement['type']): 'neutral' | 'warning' | 'critical' | 'positive' => {
  switch (type) {
    case 'receiving':
      return 'positive';
    case 'transfer':
      return 'neutral';
    case 'adjustment':
      return 'warning';
    case 'waste':
      return 'critical';
    default:
      return 'neutral';
  }
};

const getMovementLabel = (type: InventoryMovement['type']) => {
  switch (type) {
    case 'receiving':
      return 'Receiving';
    case 'transfer':
      return 'Transfer';
    case 'adjustment':
      return 'Adjustment';
    case 'waste':
      return 'Waste';
    default:
      return type;
  }
};

const getCountTone = (
  status: InventoryCountSchedule['status']
): 'neutral' | 'warning' | 'critical' | 'positive' => {
  switch (status) {
    case 'completed':
      return 'positive';
    case 'in-progress':
      return 'warning';
    case 'scheduled':
    default:
      return 'neutral';
  }
};

const getCountLabel = (status: InventoryCountSchedule['status']) => {
  switch (status) {
    case 'completed':
      return 'Reconciled';
    case 'in-progress':
      return 'In Progress';
    case 'scheduled':
    default:
      return 'Scheduled';
  }
};

const varianceTone = (value: number) => {
  if (value > 0) {
    return 'text-[#EE766D]';
  }
  if (value < 0) {
    return 'text-[#24242E]';
  }
  return 'text-[#24242E]';
};

export const InventoryDashboard: React.FC = () => {
  const onHand = useInventoryStore((state) => state.onHand);
  const movements = useInventoryStore((state) => state.movements);
  const counts = useInventoryStore((state) => state.counts);
  const batches = useInventoryStore((state) => state.batches);
  const getLowStockAlerts = useInventoryStore((state) => state.getLowStockAlerts);
  const refreshFefoOrdering = useInventoryStore((state) => state.refreshFefoOrdering);

  const [activeTab, setActiveTab] = useState<InventoryTab>('on-hand');

  useEffect(() => {
    refreshFefoOrdering();
  }, [refreshFefoOrdering]);

  const lowStockAlerts = getLowStockAlerts();

  const fefoQueue = useMemo<InventoryBatch[]>(() => {
    return [...batches].sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry).slice(0, 4);
  }, [batches]);

  const kpis = useMemo<Kpi[]>(() => {
    const currency = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });

    const totalValue = onHand.reduce((sum, item) => sum + item.currentQuantity * item.unitCost, 0);
    const lowStockCount = onHand.filter((item) => item.stockStatus === 'low' || item.stockStatus === 'critical').length;
    const expiringSoon = onHand.filter((item) => item.expiryStatus !== 'fresh').length;
    const averageCoverage = onHand.length
      ? onHand.reduce((sum, item) => sum + item.coverageDays, 0) / onHand.length
      : 0;

    return [
      {
        id: 'value',
        label: 'On-hand Value',
        value: currency.format(totalValue),
        helper: 'Based on current unit cost',
        tone: 'positive',
        icon: Package
      },
      {
        id: 'low-stock',
        label: 'Low Stock Items',
        value: `${lowStockCount}`,
        helper: 'Items below reorder or par thresholds',
        tone: lowStockCount > 0 ? 'warning' : 'positive',
        icon: AlertTriangle
      },
      {
        id: 'expiring',
        label: 'Expiring / Expired',
        value: `${expiringSoon}`,
        helper: 'Monitor FEFO queue closely',
        tone: expiringSoon > 0 ? 'warning' : 'positive',
        icon: Timer
      },
      {
        id: 'coverage',
        label: 'Average Coverage',
        value: `${averageCoverage.toFixed(1)} days`,
        helper: 'Weighted by daily usage',
        tone: averageCoverage < 3 ? 'warning' : 'neutral',
        icon: Layers
      }
    ];
  }, [onHand]);

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#24242E]">Inventory Control</h1>
            <p className="text-muted max-w-2xl">
              Monitor low stock signals, FEFO readiness, and recent movements across your venues. Data refreshes every
              15 minutes from store-level counts.
            </p>
          </div>
          <StatusPill tone="neutral">FEFO Prioritised</StatusPill>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.id} className="bg-surface-100 shadow-card border-line/70">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">{kpi.label}</p>
                    <p className="text-2xl font-semibold text-[#24242E] mt-3">{kpi.value}</p>
                    <p className="text-xs text-muted mt-2">{kpi.helper}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${toneIconWrapper[kpi.tone]}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#24242E]">Low stock & expiry alerts</h2>
                <p className="text-sm text-muted">
                  Focus on the next FEFO pulls and resolve stock gaps before service.
                </p>
              </div>
              <StatusPill tone={lowStockAlerts.length > 0 ? 'warning' : 'positive'}>
                {lowStockAlerts.length > 0 ? `${lowStockAlerts.length} Alerts` : 'All Clear'}
              </StatusPill>
            </div>

            <div className="space-y-3">
              {lowStockAlerts.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#D6D6D6] bg-surface-100/70 p-6 text-center">
                  <p className="text-sm text-muted">No items require attention right now.</p>
                </div>
              )}

              {lowStockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border border-line/70 bg-surface-100 p-4 flex flex-wrap items-start justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-sm text-[#24242E]">{alert.name}</p>
                    <p className="text-xs text-muted mt-1">
                      SKU {alert.sku} • Batch {alert.fefoBatch}
                    </p>
                    <p className="text-xs text-muted mt-2">{alert.message}</p>
                    <p className="text-xs text-muted mt-2">
                      On hand {alert.currentQuantity} • Reorder point {alert.reorderPoint}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusPill tone={getStockTone(alert.stockStatus)}>{getStockLabel(alert.stockStatus)}</StatusPill>
                    <StatusPill tone={getExpiryTone(alert.expiryStatus)}>
                      {getExpiryLabel(alert.expiryStatus, alert.daysUntilExpiry)}
                    </StatusPill>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#24242E]">Upcoming FEFO pulls</h2>
                <p className="text-sm text-muted">Oldest batches queued for production or disposal.</p>
              </div>
              <StatusPill tone="neutral">Top {fefoQueue.length}</StatusPill>
            </div>

            <div className="space-y-3">
              {fefoQueue.map((batch) => (
                <div key={batch.id} className="rounded-lg border border-line/60 bg-surface-100/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#24242E]">{batch.batchNumber}</p>
                      <p className="text-xs text-muted">
                        {batch.sku} • {batch.storageLocation}
                      </p>
                      <p className="text-xs text-muted mt-2">Received {formatDate(batch.receivedOn)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusPill tone={getExpiryTone(batch.status)}>
                        {getExpiryLabel(batch.status, batch.daysUntilExpiry)}
                      </StatusPill>
                      <StatusPill tone="neutral">FEFO #{batch.fefoRank}</StatusPill>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span>Remaining {batch.remainingUnits} {batch.unit}</span>
                    <span>Supplier • {batch.supplier}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="px-6 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#24242E]">Inventory activity</h2>
                <p className="text-sm text-muted">Drill into detail by selecting a stream.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE766D]/40 ${
                      activeTab === tab.id
                        ? 'bg-[#24242E] text-white'
                        : 'bg-surface-100 text-muted hover:text-[#24242E] hover:border-[#D6D6D6]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted mt-3">{tabs.find((tab) => tab.id === activeTab)?.description}</p>
          </div>

          <div className="mt-6 border-t border-line bg-surface-100/70">
            {activeTab === 'on-hand' && (
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-line/70">
                      <th className="py-3 px-6 font-medium">Item</th>
                      <th className="py-3 px-6 font-medium">Availability</th>
                      <th className="py-3 px-6 font-medium">Stock</th>
                      <th className="py-3 px-6 font-medium">Expiry</th>
                      <th className="py-3 px-6 font-medium">Coverage</th>
                      <th className="py-3 px-6 font-medium">Last update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {onHand.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-200/50">
                        <td className="py-4 px-6 align-top">
                          <p className="text-sm font-semibold text-[#24242E]">{item.name}</p>
                          <p className="text-xs text-muted">SKU {item.sku} • {item.storageLocation}</p>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <p className="font-semibold text-sm text-[#24242E]">
                            {item.currentQuantity} {item.unit}
                          </p>
                          <p className="text-xs text-muted">Par {item.parLevel}</p>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <StatusPill tone={getStockTone(item.stockStatus)}>{getStockLabel(item.stockStatus)}</StatusPill>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <StatusPill tone={getExpiryTone(item.expiryStatus)}>
                            {getExpiryLabel(item.expiryStatus, item.daysUntilExpiry)}
                          </StatusPill>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <p className="font-tabular font-semibold text-sm text-[#24242E]">
                            {item.coverageDays.toFixed(1)} days
                          </p>
                          <p className="text-xs text-muted">Usage {item.averageDailyUsage.toFixed(1)}/{item.unit}</p>
                        </td>
                        <td className="py-4 px-6 align-top text-xs text-muted">{formatDate(item.lastUpdated)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'movements' && (
              <div className="space-y-3 p-6">
                {movements.map((movement) => (
                  <div key={movement.id} className="rounded-lg border border-line/70 bg-surface-100 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusPill tone={getMovementTone(movement.type)}>
                            {getMovementLabel(movement.type)}
                          </StatusPill>
                          <span className="text-sm font-semibold text-[#24242E]">
                            {movement.quantity} {movement.unit}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#24242E]">{movement.reference}</p>
                        <p className="text-xs text-muted">{movement.notes}</p>
                      </div>
                      <div className="text-right text-xs text-muted space-y-1">
                        <p className="font-semibold text-sm text-[#24242E]">{formatDate(movement.timestamp)}</p>
                        <p>{movement.performedBy}</p>
                        <p>{movement.batchNumber ? `Batch ${movement.batchNumber}` : movement.sourceOrDestination}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'counts' && (
              <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                {counts.map((count) => (
                  <div key={count.id} className="rounded-lg border border-line/70 bg-surface-100 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#24242E]">{count.name}</p>
                        <p className="text-xs text-muted">Scheduled {formatDate(count.scheduledFor)}</p>
                      </div>
                      <StatusPill tone={getCountTone(count.status)}>{getCountLabel(count.status)}</StatusPill>
                    </div>
                    <div className="text-xs text-muted space-y-1">
                      <p>Team • {count.countedBy.join(', ')}</p>
                      <p>Last counted • {formatDate(count.lastCounted ?? count.scheduledFor)}</p>
                      <p>Focus • {count.focusAreas.join(', ')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Variance</span>
                      <span className={`font-tabular text-sm font-semibold ${varianceTone(count.variance)}`}>
                        {count.variance > 0 ? '+' : ''}{count.variance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'batches' && (
              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-line/70">
                      <th className="py-3 px-6 font-medium">Batch</th>
                      <th className="py-3 px-6 font-medium">Item</th>
                      <th className="py-3 px-6 font-medium">Received</th>
                      <th className="py-3 px-6 font-medium">Expiry</th>
                      <th className="py-3 px-6 font-medium">Remaining</th>
                      <th className="py-3 px-6 font-medium">FEFO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {batches.map((batch) => {
                      const item = onHand.find((entry) => entry.id === batch.itemId);
                      return (
                        <tr key={batch.id} className="hover:bg-surface-200/50">
                          <td className="py-4 px-6 align-top">
                            <p className="text-sm font-semibold text-[#24242E]">{batch.batchNumber}</p>
                            <p className="text-xs text-muted">{batch.sku} • {batch.storageLocation}</p>
                          </td>
                          <td className="py-4 px-6 align-top">
                            <p className="text-sm text-[#24242E]">{item?.name ?? '—'}</p>
                            <p className="text-xs text-muted">Supplier • {batch.supplier}</p>
                          </td>
                          <td className="py-4 px-6 align-top text-xs text-muted">{formatDate(batch.receivedOn)}</td>
                          <td className="py-4 px-6 align-top">
                            <StatusPill tone={getExpiryTone(batch.status)}>
                              {getExpiryLabel(batch.status, batch.daysUntilExpiry)}
                            </StatusPill>
                          </td>
                          <td className="py-4 px-6 align-top">
                            <p className="font-tabular text-sm font-semibold text-[#24242E]">
                              {batch.remainingUnits}/{batch.quantity} {batch.unit}
                            </p>
                          </td>
                          <td className="py-4 px-6 align-top">
                            <StatusPill tone="neutral">Rank #{batch.fefoRank}</StatusPill>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </MotionWrapper>
  );
};
