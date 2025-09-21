import { create } from 'zustand';
import localforage from 'localforage';
import {
  Order,
  Product,
  Category,
  PricingSnapshot,
  TaxRule
} from '../types';

const RETENTION_WINDOW_HOURS = 72;
const RETENTION_WINDOW_MS = RETENTION_WINDOW_HOURS * 60 * 60 * 1000;

interface CachedPayload<T> {
  data: T;
  cachedAt: string;
}

export interface SyncConflictResolution {
  id: string;
  orderId: string;
  offlineGuid?: string;
  conflictWith?: string;
  resolution: 'duplicate-discarded' | 'offline-guid-duplicate' | 'manual-review';
  resolvedAt: string;
  notes?: string;
}

export interface SyncLogEntry {
  id: string;
  startedAt: string;
  completedAt: string;
  status: 'success' | 'partial' | 'failed' | 'skipped';
  processed: number;
  synced: number;
  conflicts: SyncConflictResolution[];
  message?: string;
  error?: string;
}

interface SyncedOrderRecord {
  orderId: string;
  offlineGuid?: string;
  syncedAt: string;
}

interface OfflineState {
  isOffline: boolean;
  queuedOrders: Order[];
  cachedProducts: Product[];
  cachedCategories: Category[];
  cachedPricing: PricingSnapshot[];
  cachedTaxes: TaxRule[];
  syncLogs: SyncLogEntry[];
  conflictHistory: SyncConflictResolution[];
  lastSyncTime: Date | null;
  retentionWindowHours: number;

  setOfflineStatus: (status: boolean) => void;
  queueOrder: (order: Order) => Promise<void>;
  cacheData: (payload: {
    products: Product[];
    categories: Category[];
    pricing?: PricingSnapshot[];
    taxes?: TaxRule[];
    syncedAt?: Date;
  }) => Promise<void>;
  syncQueuedOrders: () => Promise<void>;
  loadCachedData: () => Promise<void>;
}

const ordersStore = localforage.createInstance({
  name: 'MAS',
  storeName: 'orders'
});

const productsStore = localforage.createInstance({
  name: 'MAS',
  storeName: 'products'
});

const categoriesStore = localforage.createInstance({
  name: 'MAS',
  storeName: 'categories'
});

const pricingStore = localforage.createInstance({
  name: 'MAS',
  storeName: 'pricing'
});

const taxesStore = localforage.createInstance({
  name: 'MAS',
  storeName: 'taxes'
});

const syncStore = localforage.createInstance({
  name: 'MAS',
  storeName: 'sync'
});

const createLogId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const toIsoString = (value: Date) => value.toISOString();

const wrapWithTimestamp = <T>(data: T): CachedPayload<T> => ({
  data,
  cachedAt: new Date().toISOString()
});

const unwrapCachedPayload = <T>(value: T | CachedPayload<T> | null): { data: T | null; cachedAt?: string } => {
  if (!value) {
    return { data: null };
  }

  if (typeof value === 'object' && 'data' in value && 'cachedAt' in value) {
    const payload = value as CachedPayload<T>;
    return { data: payload.data, cachedAt: payload.cachedAt };
  }

  return { data: value as T };
};

const parseDate = (value: Date | string | undefined | null): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeOrder = (order: Order): Order => {
  const createdAt = parseDate(order.createdAt) ?? new Date();
  const updatedAt = parseDate(order.updatedAt) ?? createdAt;

  return {
    ...order,
    createdAt,
    updatedAt
  };
};

const reviveOrders = (orders: Order[] | null | undefined): Order[] => {
  if (!orders) return [];
  return orders.map(normalizeOrder);
};

const pruneOrdersByRetention = (orders: Order[]): Order[] => {
  const cutoff = Date.now() - RETENTION_WINDOW_MS;
  return orders.filter((order) => {
    const reference = parseDate(order.updatedAt) ?? parseDate(order.createdAt);
    if (!reference) return false;
    return reference.getTime() >= cutoff;
  });
};

const isExpired = (cachedAt?: string) => {
  if (!cachedAt) return false;
  const cachedTime = new Date(cachedAt).getTime();
  if (Number.isNaN(cachedTime)) return false;
  return Date.now() - cachedTime > RETENTION_WINDOW_MS;
};

const pruneByTimestamp = <T>(items: T[], getTimestamp: (item: T) => string | undefined): T[] => {
  const cutoff = Date.now() - RETENTION_WINDOW_MS;
  return items.filter((item) => {
    const timestamp = getTimestamp(item);
    if (!timestamp) return true;
    const time = new Date(timestamp).getTime();
    if (Number.isNaN(time)) return true;
    return time >= cutoff;
  });
};

const composeMessage = (synced: number, conflicts: number) => {
  const parts: string[] = [];
  if (synced > 0) {
    parts.push(`${synced} order${synced === 1 ? '' : 's'} synced`);
  }
  if (conflicts > 0) {
    parts.push(`${conflicts} conflict${conflicts === 1 ? '' : 's'} detected`);
  }
  return parts.join('. ') || 'No queued orders were processed.';
};

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOffline: !navigator.onLine,
  queuedOrders: [],
  cachedProducts: [],
  cachedCategories: [],
  cachedPricing: [],
  cachedTaxes: [],
  syncLogs: [],
  conflictHistory: [],
  lastSyncTime: null,
  retentionWindowHours: RETENTION_WINDOW_HOURS,

  setOfflineStatus: (status) => {
    set({ isOffline: !status });
    if (status) {
      void get().syncQueuedOrders();
    }
  },

  queueOrder: async (order) => {
    const state = get();
    const normalizedQueue = pruneOrdersByRetention(reviveOrders(state.queuedOrders));
    const normalizedOrder = normalizeOrder(order);
    const newQueue = [...normalizedQueue, normalizedOrder];

    set({ queuedOrders: newQueue });
    await ordersStore.setItem('queuedOrders', wrapWithTimestamp(newQueue));
  },

  cacheData: async ({
    products,
    categories,
    pricing = [],
    taxes = [],
    syncedAt = new Date()
  }) => {
    set({
      cachedProducts: products,
      cachedCategories: categories,
      cachedPricing: pricing,
      cachedTaxes: taxes,
      lastSyncTime: syncedAt
    });

    const timestamp = toIsoString(syncedAt);

    await Promise.all([
      productsStore.setItem('products', wrapWithTimestamp(products)),
      categoriesStore.setItem('categories', wrapWithTimestamp(categories)),
      pricingStore.setItem('pricing', wrapWithTimestamp(pricing)),
      taxesStore.setItem('taxes', wrapWithTimestamp(taxes)),
      ordersStore.setItem('lastSyncTime', timestamp)
    ]);
  },

  syncQueuedOrders: async () => {
    const initialState = get();
    const normalizedQueue = pruneOrdersByRetention(reviveOrders(initialState.queuedOrders));

    if (normalizedQueue.length !== initialState.queuedOrders.length) {
      set({ queuedOrders: normalizedQueue });
      await ordersStore.setItem('queuedOrders', wrapWithTimestamp(normalizedQueue));
    }

    const stateAfterPrune = get();
    const existingLogs = pruneByTimestamp(stateAfterPrune.syncLogs, (entry) => entry.completedAt ?? entry.startedAt);
    const existingConflicts = pruneByTimestamp(stateAfterPrune.conflictHistory, (entry) => entry.resolvedAt);

    const startTime = new Date();
    const startIso = startTime.toISOString();
    const logId = createLogId();

    if (normalizedQueue.length === 0) {
      const message = initialState.queuedOrders.length > 0
        ? 'Removed expired queued orders before syncing.'
        : 'No queued orders to sync.';

      const logEntry: SyncLogEntry = {
        id: logId,
        startedAt: startIso,
        completedAt: new Date().toISOString(),
        status: 'skipped',
        processed: initialState.queuedOrders.length,
        synced: 0,
        conflicts: [],
        message
      };

      const updatedLogs = [...existingLogs, logEntry];

      set({
        syncLogs: updatedLogs,
        conflictHistory: existingConflicts,
        queuedOrders: normalizedQueue
      });

      await Promise.all([
        syncStore.setItem('syncLogs', updatedLogs),
        syncStore.setItem('conflictHistory', existingConflicts)
      ]);

      return;
    }

    try {
      const historyFromStore = (await syncStore.getItem<SyncedOrderRecord[]>('syncedOrdersHistory')) ?? [];
      const trimmedHistory = pruneByTimestamp(historyFromStore, (record) => record.syncedAt);
      const nowIso = new Date().toISOString();

      const conflicts: SyncConflictResolution[] = [];
      const syncedOrders: Order[] = [];
      const updatedHistory = [...trimmedHistory];

      normalizedQueue.forEach((order) => {
        const conflictMatch = updatedHistory.find((record) => {
          if (record.orderId === order.id) return true;
          if (order.offlineGuid && record.offlineGuid) {
            return record.offlineGuid === order.offlineGuid;
          }
          return false;
        });

        if (conflictMatch) {
          const resolution: SyncConflictResolution = {
            id: createLogId(),
            orderId: order.id,
            offlineGuid: order.offlineGuid,
            conflictWith: conflictMatch.orderId,
            resolution: conflictMatch.orderId === order.id ? 'duplicate-discarded' : 'offline-guid-duplicate',
            resolvedAt: nowIso,
            notes: conflictMatch.orderId === order.id
              ? 'Order with matching ID already synced; discarding duplicate.'
              : 'Order with matching offline GUID already synced; preventing duplicate capture.'
          };

          conflicts.push(resolution);
        } else {
          syncedOrders.push(order);
          updatedHistory.push({
            orderId: order.id,
            offlineGuid: order.offlineGuid,
            syncedAt: nowIso
          });
        }
      });

      if (syncedOrders.length > 0) {
        // In a production build this would be an API call.
        console.log('Syncing queued orders:', syncedOrders);
      }

      const completionIso = new Date().toISOString();
      const status: SyncLogEntry['status'] = syncedOrders.length === 0
        ? 'skipped'
        : (conflicts.length > 0 ? 'partial' : 'success');

      const logEntry: SyncLogEntry = {
        id: logId,
        startedAt: startIso,
        completedAt: completionIso,
        status,
        processed: normalizedQueue.length,
        synced: syncedOrders.length,
        conflicts,
        message: composeMessage(syncedOrders.length, conflicts.length)
      };

      const updatedLogs = [...existingLogs, logEntry];
      const updatedConflicts = [...existingConflicts, ...conflicts];

      set({
        queuedOrders: [],
        syncLogs: updatedLogs,
        conflictHistory: updatedConflicts
      });

      await Promise.all([
        ordersStore.removeItem('queuedOrders'),
        syncStore.setItem('syncedOrdersHistory', updatedHistory),
        syncStore.setItem('syncLogs', updatedLogs),
        syncStore.setItem('conflictHistory', updatedConflicts)
      ]);
    } catch (error) {
      console.error('Failed to sync orders:', error);
      const completionIso = new Date().toISOString();
      const logEntry: SyncLogEntry = {
        id: logId,
        startedAt: startIso,
        completedAt: completionIso,
        status: 'failed',
        processed: normalizedQueue.length,
        synced: 0,
        conflicts: [],
        message: 'Failed to sync queued orders.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      const updatedLogs = [...existingLogs, logEntry];

      set({
        queuedOrders: normalizedQueue,
        syncLogs: updatedLogs,
        conflictHistory: existingConflicts
      });

      await Promise.all([
        ordersStore.setItem('queuedOrders', wrapWithTimestamp(normalizedQueue)),
        syncStore.setItem('syncLogs', updatedLogs),
        syncStore.setItem('conflictHistory', existingConflicts)
      ]);
    }
  },

  loadCachedData: async () => {
    try {
      const [
        productsRaw,
        categoriesRaw,
        lastSync,
        queuedOrdersRaw,
        pricingRaw,
        taxesRaw,
        syncLogsRaw,
        conflictHistoryRaw,
        syncedHistoryRaw
      ] = await Promise.all([
        productsStore.getItem<CachedPayload<Product[]> | Product[]>('products'),
        categoriesStore.getItem<CachedPayload<Category[]> | Category[]>('categories'),
        ordersStore.getItem<string>('lastSyncTime'),
        ordersStore.getItem<CachedPayload<Order[]> | Order[]>('queuedOrders'),
        pricingStore.getItem<CachedPayload<PricingSnapshot[]> | PricingSnapshot[]>('pricing'),
        taxesStore.getItem<CachedPayload<TaxRule[]> | TaxRule[]>('taxes'),
        syncStore.getItem<SyncLogEntry[]>('syncLogs'),
        syncStore.getItem<SyncConflictResolution[]>('conflictHistory'),
        syncStore.getItem<SyncedOrderRecord[]>('syncedOrdersHistory')
      ]);

      const productsPayload = unwrapCachedPayload(productsRaw);
      const categoriesPayload = unwrapCachedPayload(categoriesRaw);
      const pricingPayload = unwrapCachedPayload(pricingRaw);
      const taxesPayload = unwrapCachedPayload(taxesRaw);
      const queuedPayload = unwrapCachedPayload(queuedOrdersRaw);

      const products = isExpired(productsPayload.cachedAt) ? [] : (productsPayload.data ?? []);
      if (products.length === 0 && productsPayload.cachedAt && isExpired(productsPayload.cachedAt)) {
        await productsStore.removeItem('products');
      }

      const categories = isExpired(categoriesPayload.cachedAt) ? [] : (categoriesPayload.data ?? []);
      if (categories.length === 0 && categoriesPayload.cachedAt && isExpired(categoriesPayload.cachedAt)) {
        await categoriesStore.removeItem('categories');
      }

      const pricing = isExpired(pricingPayload.cachedAt) ? [] : (pricingPayload.data ?? []);
      if (pricing.length === 0 && pricingPayload.cachedAt && isExpired(pricingPayload.cachedAt)) {
        await pricingStore.removeItem('pricing');
      }

      const taxes = isExpired(taxesPayload.cachedAt) ? [] : (taxesPayload.data ?? []);
      if (taxes.length === 0 && taxesPayload.cachedAt && isExpired(taxesPayload.cachedAt)) {
        await taxesStore.removeItem('taxes');
      }

      let queuedOrders = queuedPayload.data ? reviveOrders(queuedPayload.data) : [];
      const queueExpired = isExpired(queuedPayload.cachedAt);
      if (queueExpired) {
        queuedOrders = [];
        await ordersStore.removeItem('queuedOrders');
      } else if (queuedOrders.length > 0) {
        const prunedQueue = pruneOrdersByRetention(queuedOrders);
        if (prunedQueue.length !== queuedOrders.length) {
          queuedOrders = prunedQueue;
          await ordersStore.setItem('queuedOrders', wrapWithTimestamp(queuedOrders));
        }
      }

      let lastSyncTime = lastSync ? new Date(lastSync) : null;
      if (lastSyncTime && Date.now() - lastSyncTime.getTime() > RETENTION_WINDOW_MS) {
        lastSyncTime = null;
        await ordersStore.removeItem('lastSyncTime');
      }

      const syncLogs = pruneByTimestamp(syncLogsRaw ?? [], (entry) => entry.completedAt ?? entry.startedAt);
      if ((syncLogsRaw?.length ?? 0) !== syncLogs.length) {
        await syncStore.setItem('syncLogs', syncLogs);
      }

      const conflictHistory = pruneByTimestamp(conflictHistoryRaw ?? [], (entry) => entry.resolvedAt);
      if ((conflictHistoryRaw?.length ?? 0) !== conflictHistory.length) {
        await syncStore.setItem('conflictHistory', conflictHistory);
      }

      if (syncedHistoryRaw) {
        const trimmedHistory = pruneByTimestamp(syncedHistoryRaw, (entry) => entry.syncedAt);
        if (trimmedHistory.length !== syncedHistoryRaw.length) {
          await syncStore.setItem('syncedOrdersHistory', trimmedHistory);
        }
      }

      set({
        cachedProducts: products,
        cachedCategories: categories,
        cachedPricing: pricing,
        cachedTaxes: taxes,
        queuedOrders,
        lastSyncTime,
        syncLogs,
        conflictHistory
      });
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }
}));
