import { create } from 'zustand';
import { differenceInCalendarDays, parseISO } from 'date-fns';

import {
  InventoryAlert,
  InventoryBatch,
  InventoryBatchStatus,
  InventoryBatchWithMeta,
  InventoryCount,
  InventoryItem,
  InventoryKpis,
  InventoryMovement
} from '../types';
import {
  mockInventoryBatches,
  mockInventoryCounts,
  mockInventoryItems,
  mockInventoryMovements
} from '../data/mockInventory';

interface InventoryState {
  items: InventoryItem[];
  batches: InventoryBatch[];
  movements: InventoryMovement[];
  counts: InventoryCount[];
  getKpis: () => InventoryKpis;
  getAlerts: () => InventoryAlert[];
  getFefoQueue: (sku?: string) => InventoryBatchWithMeta[];
}

const computeBatchMeta = (batch: InventoryBatch): InventoryBatchWithMeta => {
  const today = new Date();
  const expiry = parseISO(batch.expiryDate);
  const daysUntilExpiry = differenceInCalendarDays(expiry, today);

  let status: InventoryBatchStatus;
  if (daysUntilExpiry < 0 || daysUntilExpiry <= 2) {
    status = 'critical';
  } else if (daysUntilExpiry <= 7) {
    status = 'warning';
  } else {
    status = 'healthy';
  }

  return {
    ...batch,
    daysUntilExpiry,
    status
  };
};

const computeKpis = (items: InventoryItem[], batches: InventoryBatch[]) => {
  const totalSkus = items.length;
  const onHandValue = items.reduce((sum, item) => sum + item.onHand * item.cost, 0);
  const lowStock = items.filter(item => item.available <= item.reorderPoint).length;

  const nearExpiry = batches
    .map(computeBatchMeta)
    .filter(batch => batch.status !== 'healthy').length;

  const kpis: InventoryKpis = {
    totalSkus,
    onHandValue,
    lowStock,
    nearExpiry
  };

  return kpis;
};

const computeAlerts = (
  items: InventoryItem[],
  batches: InventoryBatch[]
): InventoryAlert[] => {
  const alerts: InventoryAlert[] = [];

  items.forEach(item => {
    if (item.available <= item.reorderPoint) {
      alerts.push({
        sku: item.sku,
        name: item.name,
        type: 'reorder',
        severity: item.available <= 0 ? 'danger' : 'warning',
        available: item.available,
        reorderPoint: item.reorderPoint,
        message:
          item.available <= 0
            ? 'Allocate emergency stock or adjust recipe until replenished.'
            : 'Forecast will breach par within the next service. Plan a PO now.'
      });
    }
  });

  batches
    .map(computeBatchMeta)
    .filter(batch => batch.status !== 'healthy')
    .forEach(batch => {
      alerts.push({
        sku: batch.sku,
        name: batch.lotCode,
        type: 'expiry',
        severity: batch.status === 'critical' ? 'danger' : 'warning',
        lotCode: batch.lotCode,
        daysUntilExpiry: batch.daysUntilExpiry,
        message:
          batch.daysUntilExpiry < 0
            ? 'Batch expired—quarantine stock and trigger a waste record.'
            : 'Schedule FEFO pulls to burn through this lot before service.'
      });
    });

  return alerts;
};

export const useInventoryStore = create<InventoryState>((_set, get) => ({
  items: mockInventoryItems,
  batches: mockInventoryBatches,
  movements: mockInventoryMovements,
  counts: mockInventoryCounts,
  getKpis: () => {
    const { items, batches } = get();
    return computeKpis(items, batches);
  },
  getAlerts: () => {
    const { items, batches } = get();
    return computeAlerts(items, batches);
  },
  getFefoQueue: (sku?: string) => {
    const { batches } = get();
    const relevant = sku ? batches.filter(batch => batch.sku === sku) : batches;

    return relevant
      .map(computeBatchMeta)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry || a.fefoOrder - b.fefoOrder);
  }
}));
