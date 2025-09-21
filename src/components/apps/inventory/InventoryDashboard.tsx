import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@mas/ui';

import { MotionWrapper } from '../../ui/MotionWrapper';
import { ExpiryStatusPill, StatusPill, StockStatusPill } from '../../ui/status';
import { useInventoryStore } from '../../../stores/inventoryStore';
import { useAuthStore } from '../../../stores/authStore';
import { InventoryAlert, InventoryBatchWithMeta, InventoryCountStatus, InventoryMovementType } from '../../../types';

type InventoryTab = 'on-hand' | 'movements' | 'counts' | 'batches';

const tabOrder: Array<{ id: InventoryTab; label: string; description: string }> = [
  { id: 'on-hand', label: 'On hand', description: 'Snapshot of current availability' },
  { id: 'movements', label: 'Movements', description: 'Receipts, transfers, and waste' },
  { id: 'counts', label: 'Counts', description: 'Cycle counts and audits' },
  { id: 'batches', label: 'Batches', description: 'FEFO lots and expiry windows' }
];

const movementTone: Record<InventoryMovementType, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  receipt: 'success',
  transfer: 'info',
  adjustment: 'warning',
  sale: 'neutral',
  waste: 'danger'
};

const countTone: Record<InventoryCountStatus, 'info' | 'success' | 'warning'> = {
  scheduled: 'info',
  'in-progress': 'warning',
  completed: 'success'
};

const locale = 'en-US';

const formatQuantity = (value: number, fractionDigits = 0) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: fractionDigits }).format(value);

const formatDate = (value: string, pattern = 'MMM d, yyyy') => {
  try {
    return format(parseISO(value), pattern);
  } catch {
    return value;
  }
};

const buildAlertKey = (alert: InventoryAlert) =>
  `${alert.type}-${alert.sku}-${alert.lotCode ?? 'na'}`;

export const InventoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('on-hand');

  const items = useInventoryStore(state => state.items);
  const batches = useInventoryStore(state => state.batches);
  const movements = useInventoryStore(state => state.movements);
  const counts = useInventoryStore(state => state.counts);
  const getKpis = useInventoryStore(state => state.getKpis);
  const getAlerts = useInventoryStore(state => state.getAlerts);
  const getFefoQueue = useInventoryStore(state => state.getFefoQueue);
  const tenant = useAuthStore(state => state.tenant);

  const currencyCode = tenant?.settings.currency ?? 'USD';

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0
      }),
    [currencyCode]
  );

  const kpis = getKpis();
  const alerts = getAlerts();
  const fefoQueue = getFefoQueue();

  const itemBySku = useMemo(() => new Map(items.map(item => [item.sku, item])), [items]);
  const batchMetaByLot = useMemo(() => {
    const map = new Map<string, InventoryBatchWithMeta>();
    fefoQueue.forEach(batch => map.set(batch.lotCode, batch));
    return map;
  }, [fefoQueue]);

  const totalOnHand = items.reduce((sum, item) => sum + item.onHand, 0);
  const totalAvailable = items.reduce((sum, item) => sum + item.available, 0);

  const topFefo = fefoQueue.slice(0, 5);

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface-200/60 p-6 text-sm text-muted">
          All clear—no low stock or expiry risk in the next window.
        </div>
      ) : (
        alerts.map(alert => {
          const item = itemBySku.get(alert.sku);
          const batchMeta = alert.lotCode ? batchMetaByLot.get(alert.lotCode) : undefined;

          return (
            <div
              key={buildAlertKey(alert)}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface-100/90 p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink">
                  {alert.type === 'reorder'
                    ? item?.name ?? alert.name
                    : `${item?.name ?? alert.sku}`}
                </p>
                <p className="text-xs text-muted">
                  {alert.type === 'reorder'
                    ? `${item?.sku ?? alert.sku} • ${item?.supplier ?? 'Supplier TBD'}`
                    : `Lot ${alert.lotCode} • ${alert.sku}`}
                </p>
                <p className="text-sm text-muted">{alert.message}</p>
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                {alert.type === 'reorder' ? (
                  <StockStatusPill
                    available={alert.available ?? 0}
                    reorderPoint={alert.reorderPoint ?? item?.reorderPoint ?? 0}
                    parLevel={item?.parLevel ?? alert.reorderPoint ?? 1}
                    avgDailyUsage={item?.avgDailyUsage}
                  />
                ) : (
                  <ExpiryStatusPill
                    daysUntilExpiry={batchMeta?.daysUntilExpiry ?? alert.daysUntilExpiry ?? 0}
                    fefoOrder={batchMeta?.fefoOrder}
                  />
                )}

                {alert.type === 'reorder' ? (
                  <span className="text-xs text-muted font-tabular">
                    Available: {formatQuantity(alert.available ?? 0)} {item?.uom ?? ''} • Reorder at{' '}
                    {formatQuantity(alert.reorderPoint ?? item?.reorderPoint ?? 0)}
                  </span>
                ) : (
                  <span className="text-xs text-muted font-tabular">
                    Remaining: {formatQuantity(batchMeta?.remaining ?? 0)} {item?.uom ?? ''}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderOnHand = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-line/70 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className="py-3 pr-6 font-medium">
              Item
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              On hand
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              Allocated
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              Available
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              Coverage
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              Value
            </th>
            <th scope="col" className="py-3 font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {items.map(item => {
            const coverage = item.avgDailyUsage
              ? Math.max(item.available / item.avgDailyUsage, 0)
              : undefined;
            const formattedCoverage = coverage
              ? `${formatQuantity(coverage, coverage >= 5 ? 0 : 1)} d`
              : '—';

            return (
              <tr
                key={item.sku}
                className="transition-colors hover:bg-surface-200/60"
              >
                <td className="py-4 pr-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-ink">{item.name}</span>
                    <span className="text-xs text-muted">
                      {item.sku} • {item.category} • {item.uom}
                    </span>
                  </div>
                </td>
                <td className="py-4 pr-6 font-tabular">{formatQuantity(item.onHand)}</td>
                <td className="py-4 pr-6 font-tabular text-warning">
                  {formatQuantity(item.allocated)}
                </td>
                <td className="py-4 pr-6 font-tabular">{formatQuantity(item.available)}</td>
                <td className="py-4 pr-6 font-tabular text-muted">{formattedCoverage}</td>
                <td className="py-4 pr-6 font-tabular">
                  {currencyFormatter.format(item.onHand * item.cost)}
                </td>
                <td className="py-4">
                  <StockStatusPill
                    available={item.available}
                    reorderPoint={item.reorderPoint}
                    parLevel={item.parLevel}
                    avgDailyUsage={item.avgDailyUsage}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderMovements = () => (
    <div className="space-y-3">
      {movements.map(movement => {
        const typeTone = movementTone[movement.type];
        const item = itemBySku.get(movement.sku);

        const quantityClass = movement.quantity < 0 ? 'text-danger' : 'text-success';

        return (
          <div
            key={movement.id}
            className="flex flex-col gap-3 rounded-lg border border-line bg-surface-100/90 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-ink">{movement.reference}</p>
              <p className="text-xs text-muted">
                {item?.name ?? movement.sku} • {movement.sku}
              </p>
              <p className="text-xs text-muted">{formatDate(movement.createdAt, 'MMM d, yyyy • HH:mm')}</p>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={typeTone === 'neutral' ? 'neutral' : typeTone}>
                  {movement.type.replace('-', ' ')}
                </StatusPill>
                <span className={`font-semibold font-tabular ${quantityClass}`}>
                  {movement.quantity > 0 ? '+' : ''}
                  {formatQuantity(movement.quantity)} {movement.uom}
                </span>
              </div>
              <div className="text-xs text-muted">
                {movement.source ? `From ${movement.source}` : ''}
                {movement.destination ? ` → ${movement.destination}` : ''}
                {movement.note ? ` • ${movement.note}` : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCounts = () => (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {counts.map(count => (
        <Card key={count.id} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">{count.name}</p>
              <p className="text-xs text-muted">{formatDate(count.scheduledFor, 'MMM d, yyyy • HH:mm')}</p>
            </div>
            <StatusPill tone={countTone[count.status]}>{count.status.replace('-', ' ')}</StatusPill>
          </div>
          <div className="text-xs text-muted">
            Assigned to <span className="font-medium text-ink">{count.assignee}</span>
          </div>
          {typeof count.variance === 'number' && (
            <div className="text-xs font-medium font-tabular">
              Variance: <span className={count.variance >= 0 ? 'text-success' : 'text-danger'}>{count.variance > 0 ? '+' : ''}{count.variance}</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderBatches = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-line/70 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className="py-3 pr-6 font-medium">
              Lot
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              SKU
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              Supplier
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              Remaining
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              Received
            </th>
            <th scope="col" className="py-3 font-medium">
              Expiry
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {fefoQueue.map(batch => {
            const item = itemBySku.get(batch.sku);

            return (
              <tr key={batch.id} className="transition-colors hover:bg-surface-200/60">
                <td className="py-4 pr-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-ink">{batch.lotCode}</span>
                    <span className="text-xs text-muted">
                      FEFO order #{batch.fefoOrder}
                    </span>
                  </div>
                </td>
                <td className="py-4 pr-6 text-xs text-muted">{batch.sku}</td>
                <td className="py-4 pr-6 text-xs text-muted">{batch.supplier}</td>
                <td className="py-4 pr-6 font-tabular">
                  {formatQuantity(batch.remaining)} {item?.uom ?? ''}
                </td>
                <td className="py-4 pr-6 text-xs text-muted">{formatDate(batch.receivedAt)}</td>
                <td className="py-4">
                  <ExpiryStatusPill
                    daysUntilExpiry={batch.daysUntilExpiry}
                    fefoOrder={batch.fefoOrder}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink">Inventory command center</h1>
              <p className="text-muted">
                Track FEFO lots, watch reorder points, and keep every station stocked for service.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-surface-200/60 px-4 py-2 text-right">
              <p className="text-xs text-muted uppercase tracking-wide">Stock coverage</p>
              <p className="text-sm font-semibold text-ink font-tabular">
                {formatQuantity(totalAvailable)} available / {formatQuantity(totalOnHand)} on hand
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted">Total SKUs</p>
            <p className="text-3xl font-semibold text-ink font-tabular">{kpis.totalSkus}</p>
            <p className="text-xs text-muted">Across {items.length} tracked items</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted">On-hand value</p>
            <p className="text-3xl font-semibold text-ink font-tabular">
              {currencyFormatter.format(kpis.onHandValue)}
            </p>
            <p className="text-xs text-muted">Gross at cost for current stock</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted">Low stock</p>
            <p className="text-3xl font-semibold text-warning font-tabular">{kpis.lowStock}</p>
            <p className="text-xs text-muted">Below reorder threshold</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted">Near expiry</p>
            <p className="text-3xl font-semibold text-danger font-tabular">{kpis.nearExpiry}</p>
            <p className="text-xs text-muted">Lots within the critical window</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="space-y-4 xl:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">Live alerts</h2>
                <p className="text-sm text-muted">Reorder and expiry risk surfaced in real time.</p>
              </div>
              <StatusPill tone="warning">{alerts.length} open</StatusPill>
            </div>
            {renderAlerts()}
          </Card>

          <Card className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">FEFO queue</h2>
              <p className="text-sm text-muted">Next lots to pull across all prep stations.</p>
            </div>
            <div className="space-y-3">
              {topFefo.map(batch => {
                const item = itemBySku.get(batch.sku);

                return (
                  <div key={batch.id} className="rounded-lg border border-line/60 bg-surface-200/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{item?.name ?? batch.sku}</p>
                        <p className="text-xs text-muted">Lot {batch.lotCode} • {batch.sku}</p>
                      </div>
                      <ExpiryStatusPill
                        daysUntilExpiry={batch.daysUntilExpiry}
                        fefoOrder={batch.fefoOrder}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted font-tabular">
                      <span>Remaining {formatQuantity(batch.remaining)} {item?.uom ?? ''}</span>
                      <span>Received {formatDate(batch.receivedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">Inventory detail views</h2>
              <p className="text-sm text-muted">Switch between stock positions, recent movements, counts, and batch tracking.</p>
            </div>
            <div role="tablist" aria-label="Inventory detail views" className="flex flex-wrap gap-2">
              {tabOrder.map(tab => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`${tab.id}-tab`}
                    aria-controls={`${tab.id}-panel`}
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                      isActive
                        ? 'border-primary-500 bg-primary-500 text-white shadow'
                        : 'border-line bg-surface-200/70 text-muted hover:border-primary-200 hover:text-ink'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-2 rounded-full bg-surface-100 px-2 py-0.5 text-xs font-semibold text-muted">
                      {tab.id === 'on-hand'
                        ? items.length
                        : tab.id === 'movements'
                        ? movements.length
                        : tab.id === 'counts'
                        ? counts.length
                        : batches.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {tabOrder.map(tab => (
            <div
              key={tab.id}
              id={`${tab.id}-panel`}
              role="tabpanel"
              aria-labelledby={`${tab.id}-tab`}
              hidden={activeTab !== tab.id}
              className="space-y-4"
            >
              {tab.id === 'on-hand' && renderOnHand()}
              {tab.id === 'movements' && renderMovements()}
              {tab.id === 'counts' && renderCounts()}
              {tab.id === 'batches' && renderBatches()}
            </div>
          ))}
        </Card>
      </div>
    </MotionWrapper>
  );
};
