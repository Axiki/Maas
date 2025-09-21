import { create } from 'zustand';
import localforage from 'localforage';
import {
  Order,
  Payment,
  Product,
  Category,
  PricingRecord,
  TaxRateConfig
} from '../types';

const RETENTION_WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours
const MAX_LOG_ENTRIES = 50;
const MAX_SYNCED_GUIDS = 200;
const isNavigatorDefined = typeof navigator !== 'undefined';
const initialOnline = isNavigatorDefined ? navigator.onLine : true;

export interface CacheMetadata {
  catalogCachedAt: Date | null;
  pricingCachedAt: Date | null;
  taxCachedAt: Date | null;
}

export type SyncLogLevel = 'info' | 'success' | 'warning' | 'error';
export type SyncLogType = 'queue' | 'sync' | 'conflict' | 'maintenance';

export interface SyncLogEntry {
  id: string;
  type: SyncLogType;
  level: SyncLogLevel;
  message: string;
  orderId?: string;
  offlineGuid?: string;
  timestamp: Date;
}

export interface OfflineOrder extends Order {
  queuedAt: Date;
}

interface OfflineCachePayload {
  products: Product[];
  categories: Category[];
  pricing: PricingRecord[];
  taxes: TaxRateConfig[];
  cachedAt?: Date;
}

interface OfflineState {
  isOffline: boolean;
  isSyncing: boolean;
  queuedOrders: OfflineOrder[];
  cachedProducts: Product[];
  cachedCategories: Category[];
  cachedPricing: PricingRecord[];
  cachedTaxes: TaxRateConfig[];
  cacheMetadata: CacheMetadata;
  lastSyncTime: Date | null;
  syncLog: SyncLogEntry[];

  setOfflineStatus: (isOnline: boolean) => void;
  queueOrder: (order: Order) => Promise<void>;
  cacheCatalogSnapshot: (payload: OfflineCachePayload) => Promise<void>;
  syncQueuedOrders: () => Promise<void>;
  loadCachedData: () => Promise<void>;
}

type PersistedPayment = Omit<Payment, 'createdAt'> & { createdAt: string };
type PersistedOfflineOrder = Omit<OfflineOrder, 'createdAt' | 'updatedAt' | 'queuedAt' | 'payments'> & {
  createdAt: string;
  updatedAt: string;
  queuedAt: string;
  payments: PersistedPayment[];
};

type PersistedSyncLogEntry = Omit<SyncLogEntry, 'timestamp'> & { timestamp: string };

interface PersistedOfflineMetadata {
  catalogCachedAt: string | null;
  pricingCachedAt: string | null;
  taxCachedAt: string | null;
  lastSyncTime: string | null;
  syncedOrderGuids: string[];
  syncLog: PersistedSyncLogEntry[];
}

const defaultMetadata: PersistedOfflineMetadata = {
  catalogCachedAt: null,
  pricingCachedAt: null,
  taxCachedAt: null,
  lastSyncTime: null,
  syncedOrderGuids: [],
  syncLog: []
};

// Configure localforage stores
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

const metadataStore = localforage.createInstance({
  name: 'MAS',
  storeName: 'metadata'
});

const defaultCacheMetadata: CacheMetadata = {
  catalogCachedAt: null,
  pricingCachedAt: null,
  taxCachedAt: null
};

const createLogId = () => `log-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const ensureMetadata = async (): Promise<PersistedOfflineMetadata> => {
  const metadata = await metadataStore.getItem<PersistedOfflineMetadata>('offlineMetadata');
  if (!metadata) {
    return { ...defaultMetadata };
  }

  return {
    ...defaultMetadata,
    ...metadata,
    syncLog: metadata.syncLog ?? [],
    syncedOrderGuids: metadata.syncedOrderGuids ?? []
  };
};

const persistMetadata = async (metadata: PersistedOfflineMetadata) => {
  await metadataStore.setItem('offlineMetadata', metadata);
};

const toStateLog = (entry: PersistedSyncLogEntry): SyncLogEntry => ({
  ...entry,
  timestamp: new Date(entry.timestamp)
});

const hydrateMetadata = (metadata: PersistedOfflineMetadata) => ({
  cacheMetadata: {
    catalogCachedAt: metadata.catalogCachedAt ? new Date(metadata.catalogCachedAt) : null,
    pricingCachedAt: metadata.pricingCachedAt ? new Date(metadata.pricingCachedAt) : null,
    taxCachedAt: metadata.taxCachedAt ? new Date(metadata.taxCachedAt) : null
  } satisfies CacheMetadata,
  lastSyncTime: metadata.lastSyncTime ? new Date(metadata.lastSyncTime) : null,
  syncLog: metadata.syncLog.map(toStateLog)
});

const toPersistedOrder = (order: OfflineOrder): PersistedOfflineOrder => ({
  ...order,
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt.toISOString(),
  queuedAt: order.queuedAt.toISOString(),
  payments: order.payments.map((payment) => ({
    ...payment,
    createdAt: payment.createdAt.toISOString()
  }))
});

const toOfflineOrder = (order: PersistedOfflineOrder): OfflineOrder => ({
  ...order,
  createdAt: new Date(order.createdAt),
  updatedAt: new Date(order.updatedAt),
  queuedAt: new Date(order.queuedAt),
  payments: order.payments.map((payment) => ({
    ...payment,
    createdAt: new Date(payment.createdAt)
  }))
});

const isExpired = (isoTimestamp: string | null) => {
  if (!isoTimestamp) return true;
  const timestamp = new Date(isoTimestamp).getTime();
  if (Number.isNaN(timestamp)) return true;
  return Date.now() - timestamp > RETENTION_WINDOW_MS;
};

const splitQueueByRetention = (queue: PersistedOfflineOrder[]) => {
  const valid: PersistedOfflineOrder[] = [];
  const expired: PersistedOfflineOrder[] = [];

  queue.forEach((order) => {
    const queuedAt = new Date(order.queuedAt).getTime();
    if (Number.isNaN(queuedAt) || Date.now() - queuedAt > RETENTION_WINDOW_MS) {
      expired.push(order);
    } else {
      valid.push(order);
    }
  });

  return { valid, expired };
};

const pushLog = (
  metadata: PersistedOfflineMetadata,
  entry: Omit<SyncLogEntry, 'id' | 'timestamp'> & Partial<Pick<SyncLogEntry, 'timestamp'>>
) => {
  const logEntry: PersistedSyncLogEntry = {
    id: createLogId(),
    type: entry.type,
    level: entry.level ?? 'info',
    message: entry.message,
    orderId: entry.orderId,
    offlineGuid: entry.offlineGuid,
    timestamp: (entry.timestamp ?? new Date()).toISOString()
  };

  metadata.syncLog = [logEntry, ...metadata.syncLog].slice(0, MAX_LOG_ENTRIES);
  return logEntry;
};

const recordSyncedGuid = (metadata: PersistedOfflineMetadata, guid: string) => {
  metadata.syncedOrderGuids = [guid, ...metadata.syncedOrderGuids.filter((value) => value !== guid)].slice(
    0,
    MAX_SYNCED_GUIDS
  );
};

const offlineKeyFor = (order: { offlineGuid?: string; id: string }) => order.offlineGuid ?? order.id;

const simulateNetworkLatency = () => new Promise((resolve) => setTimeout(resolve, 20));

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOffline: !initialOnline,
  isSyncing: false,
  queuedOrders: [],
  cachedProducts: [],
  cachedCategories: [],
  cachedPricing: [],
  cachedTaxes: [],
  cacheMetadata: { ...defaultCacheMetadata },
  lastSyncTime: null,
  syncLog: [],

  setOfflineStatus: (isOnline) => {
    set({ isOffline: !isOnline });
    if (isOnline && !get().isSyncing) {
      void get().syncQueuedOrders();
    }
  },

  queueOrder: async (order) => {
    const queuedAt = new Date();
    const offlineOrder: OfflineOrder = {
      ...order,
      createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt),
      updatedAt: order.updatedAt instanceof Date ? order.updatedAt : new Date(order.updatedAt),
      payments: order.payments.map((payment) => ({
        ...payment,
        createdAt: payment.createdAt instanceof Date ? payment.createdAt : new Date(payment.createdAt)
      })),
      queuedAt
    };

    const persistedNewOrder = toPersistedOrder(offlineOrder);
    const existingQueue = (await ordersStore.getItem<PersistedOfflineOrder[]>('queuedOrders')) ?? [];
    const key = offlineKeyFor(order);
    const withoutDuplicate = existingQueue.filter((queued) => offlineKeyFor(queued) !== key);
    const mergedQueue = [...withoutDuplicate, persistedNewOrder];
    const { valid, expired } = splitQueueByRetention(mergedQueue);

    const metadata = await ensureMetadata();

    if (expired.length > 0) {
      pushLog(metadata, {
        type: 'maintenance',
        level: 'warning',
        message: `Pruned ${expired.length} expired queued order${expired.length === 1 ? '' : 's'} while enqueuing.`
      });
    }

    pushLog(metadata, {
      type: 'queue',
      level: 'info',
      message: `Queued order ${order.id} for offline sync.`,
      orderId: order.id,
      offlineGuid: key
    });

    await Promise.all([
      ordersStore.setItem('queuedOrders', valid),
      persistMetadata(metadata)
    ]);

    set({
      queuedOrders: valid.map(toOfflineOrder),
      ...hydrateMetadata(metadata)
    });

    if (!get().isOffline && !get().isSyncing) {
      void get().syncQueuedOrders();
    }
  },

  cacheCatalogSnapshot: async ({ products, categories, pricing, taxes, cachedAt }) => {
    const timestamp = (cachedAt ?? new Date()).toISOString();

    await Promise.all([
      productsStore.setItem('products', products),
      categoriesStore.setItem('categories', categories),
      pricingStore.setItem('pricing', pricing),
      taxesStore.setItem('taxes', taxes)
    ]);

    const metadata = await ensureMetadata();
    metadata.catalogCachedAt = timestamp;
    metadata.pricingCachedAt = timestamp;
    metadata.taxCachedAt = timestamp;

    pushLog(metadata, {
      type: 'maintenance',
      level: 'info',
      message: `Catalog cache refreshed (${products.length} products • ${pricing.length} price records • ${taxes.length} tax rules).`
    });

    await persistMetadata(metadata);

    set({
      cachedProducts: products,
      cachedCategories: categories,
      cachedPricing: pricing,
      cachedTaxes: taxes,
      ...hydrateMetadata(metadata)
    });
  },

  syncQueuedOrders: async () => {
    if (get().isOffline || get().isSyncing) {
      return;
    }

    set({ isSyncing: true });

    try {
      const [metadata, persistedQueue] = await Promise.all([
        ensureMetadata(),
        ordersStore.getItem<PersistedOfflineOrder[]>('queuedOrders')
      ]);

      const { valid, expired } = splitQueueByRetention(persistedQueue ?? []);

      if (expired.length > 0) {
        pushLog(metadata, {
          type: 'maintenance',
          level: 'warning',
          message: `Removed ${expired.length} expired queued order${expired.length === 1 ? '' : 's'} before sync.`
        });
      }

      const remainingQueue: PersistedOfflineOrder[] = [];
      const seenGuids = new Set<string>();
      let syncedCount = 0;
      let conflictCount = 0;

      for (const order of valid) {
        const guid = offlineKeyFor(order);

        if (seenGuids.has(guid)) {
          conflictCount += 1;
          pushLog(metadata, {
            type: 'conflict',
            level: 'warning',
            message: `Duplicate offline GUID ${guid} detected in queue. Keeping the most recent copy only.`,
            orderId: order.id,
            offlineGuid: guid
          });
          continue;
        }

        seenGuids.add(guid);

        if (metadata.syncedOrderGuids.includes(guid)) {
          conflictCount += 1;
          pushLog(metadata, {
            type: 'conflict',
            level: 'warning',
            message: `Order ${order.id} already reconciled upstream. Dropping local copy.`,
            orderId: order.id,
            offlineGuid: guid
          });
          continue;
        }

        // Simulate API reconciliation
        await simulateNetworkLatency();

        syncedCount += 1;
        recordSyncedGuid(metadata, guid);
        pushLog(metadata, {
          type: 'sync',
          level: 'success',
          message: `Order ${order.id} synced successfully.`,
          orderId: order.id,
          offlineGuid: guid
        });
      }

      if (syncedCount === 0 && conflictCount === 0 && valid.length === 0) {
        pushLog(metadata, {
          type: 'sync',
          level: 'info',
          message: 'Sync attempted with no queued orders.'
        });
      } else {
        pushLog(metadata, {
          type: 'sync',
          level: 'info',
          message: `Sync completed (${syncedCount} success${syncedCount === 1 ? '' : 'es'}, ${conflictCount} conflict${
            conflictCount === 1 ? '' : 's'
          }, ${remainingQueue.length} pending).`
        });
      }

      metadata.lastSyncTime = new Date().toISOString();

      await Promise.all([
        ordersStore.setItem('queuedOrders', remainingQueue),
        persistMetadata(metadata)
      ]);

      set({
        queuedOrders: remainingQueue.map(toOfflineOrder),
        isSyncing: false,
        ...hydrateMetadata(metadata)
      });
    } catch (error) {
      console.error('Failed to sync orders:', error);
      set({ isSyncing: false });

      const metadata = await ensureMetadata();
      pushLog(metadata, {
        type: 'sync',
        level: 'error',
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}.`
      });
      await persistMetadata(metadata);

      set((state) => ({
        ...state,
        ...hydrateMetadata(metadata)
      }));
    }
  },

  loadCachedData: async () => {
    try {
      const metadata = await ensureMetadata();
      let metadataChanged = false;

      let cachedProducts: Product[] = [];
      let cachedCategories: Category[] = [];
      if (!isExpired(metadata.catalogCachedAt)) {
        const [products, categories] = await Promise.all([
          productsStore.getItem<Product[]>('products'),
          categoriesStore.getItem<Category[]>('categories')
        ]);
        cachedProducts = products ?? [];
        cachedCategories = categories ?? [];
      } else {
        await Promise.all([
          productsStore.removeItem('products'),
          categoriesStore.removeItem('categories')
        ]);
        if (metadata.catalogCachedAt) {
          metadata.catalogCachedAt = null;
          metadataChanged = true;
        }
      }

      let cachedPricing: PricingRecord[] = [];
      if (!isExpired(metadata.pricingCachedAt)) {
        cachedPricing = (await pricingStore.getItem<PricingRecord[]>('pricing')) ?? [];
      } else {
        await pricingStore.removeItem('pricing');
        if (metadata.pricingCachedAt) {
          metadata.pricingCachedAt = null;
          metadataChanged = true;
        }
      }

      let cachedTaxes: TaxRateConfig[] = [];
      if (!isExpired(metadata.taxCachedAt)) {
        cachedTaxes = (await taxesStore.getItem<TaxRateConfig[]>('taxes')) ?? [];
      } else {
        await taxesStore.removeItem('taxes');
        if (metadata.taxCachedAt) {
          metadata.taxCachedAt = null;
          metadataChanged = true;
        }
      }

      const persistedQueue = (await ordersStore.getItem<PersistedOfflineOrder[]>('queuedOrders')) ?? [];
      const { valid, expired } = splitQueueByRetention(persistedQueue);

      if (expired.length > 0) {
        metadataChanged = true;
        pushLog(metadata, {
          type: 'maintenance',
          level: 'warning',
          message: `Removed ${expired.length} queued order${expired.length === 1 ? '' : 's'} outside the retention window.`
        });
      }

      if (metadataChanged || expired.length > 0) {
        await Promise.all([
          ordersStore.setItem('queuedOrders', valid),
          persistMetadata(metadata)
        ]);
      }

      set({
        cachedProducts,
        cachedCategories,
        cachedPricing,
        cachedTaxes,
        queuedOrders: valid.map(toOfflineOrder),
        ...hydrateMetadata(metadata)
      });
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }
}));
