import { create } from 'zustand';
import {
  InventoryAlert,
  InventoryBatch,
  InventoryCountSchedule,
  InventoryItem,
  InventoryMovement
} from '../types';
import {
  mockInventoryBatches,
  mockInventoryCounts,
  mockInventoryMovements,
  mockInventoryOnHand
} from '../data/mockInventory';

interface InventoryState {
  onHand: InventoryItem[];
  movements: InventoryMovement[];
  counts: InventoryCountSchedule[];
  batches: InventoryBatch[];
  setOnHand: (items: InventoryItem[]) => void;
  setMovements: (movements: InventoryMovement[]) => void;
  setCounts: (counts: InventoryCountSchedule[]) => void;
  setBatches: (batches: InventoryBatch[]) => void;
  getLowStockAlerts: () => InventoryAlert[];
  refreshFefoOrdering: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  onHand: mockInventoryOnHand,
  movements: mockInventoryMovements,
  counts: mockInventoryCounts,
  batches: mockInventoryBatches,
  setOnHand: (items) => set({ onHand: items }),
  setMovements: (movements) => set({ movements }),
  setCounts: (counts) => set({ counts }),
  setBatches: (batches) => set({ batches }),
  getLowStockAlerts: () => {
    const { onHand } = get();

    return onHand
      .filter((item) => item.stockStatus === 'critical' || item.stockStatus === 'low' || item.expiryStatus !== 'fresh')
      .map<InventoryAlert>((item) => {
        let message = '';

        if (item.expiryStatus === 'expired') {
          message = 'Expired inventory requires disposal';
        } else if (item.expiryStatus === 'expiring') {
          const remaining = Math.max(item.daysUntilExpiry, 0);
          message = remaining === 0 ? 'Expires today' : `Expiring in ${remaining} day${remaining === 1 ? '' : 's'}`;
        } else if (item.stockStatus === 'critical') {
          message = 'Critical stock level reached';
        } else if (item.stockStatus === 'low') {
          message = 'Below par level';
        }

        if (!message) {
          message = 'Monitor inventory levels';
        }

        return {
          id: item.id,
          name: item.name,
          sku: item.sku,
          stockStatus: item.stockStatus,
          expiryStatus: item.expiryStatus,
          currentQuantity: item.currentQuantity,
          reorderPoint: item.reorderPoint,
          daysUntilExpiry: item.daysUntilExpiry,
          fefoBatch: item.fefoBatch,
          message
        };
      });
  },
  refreshFefoOrdering: () => {
    set((state) => ({
      batches: [...state.batches].sort((a, b) => {
        if (a.fefoRank === b.fefoRank) {
          return a.daysUntilExpiry - b.daysUntilExpiry;
        }
        return a.fefoRank - b.fefoRank;
      })
    }));
  }
}));
