import { create } from 'zustand';
import localforage from 'localforage';
import { Order, Product, Category } from '../types';

export type OfflineLogLevel = 'info' | 'warning' | 'error';

export interface OfflineLogEntry {
  id: string;
  timestamp: Date;
  level: OfflineLogLevel;
  message: string;
  context?: Record<string, unknown>;
}

interface OfflineState {
  isOffline: boolean;
  queuedOrders: Order[];
  cachedProducts: Product[];
  cachedCategories: Category[];
  lastSyncTime: Date | null;
  syncInProgress: boolean;
  lastSyncError: string | null;
  storageError: string | null;
  logEntries: OfflineLogEntry[];

  setOfflineStatus: (status: boolean) => void;
  queueOrder: (order: Order) => Promise<void>;
  cacheData: (products: Product[], categories: Category[]) => Promise<void>;
  syncQueuedOrders: () => Promise<void>;
  loadCachedData: () => Promise<void>;
}

const MAX_LOG_ENTRIES = 200;

// Configure localforage
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

export const useOfflineStore = create<OfflineState>((set, get) => {
  const recordLog = (
    level: OfflineLogLevel,
    message: string,
    context?: Record<string, unknown>
  ) => {
    const entry: OfflineLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date(),
      level,
      message,
      context
    };

    set(state => ({
      logEntries: [entry, ...state.logEntries].slice(0, MAX_LOG_ENTRIES)
    }));
  };

  const normalizeOrders = (orders: Order[] | null | undefined): Order[] =>
    (orders || []).map(order => ({
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt)
    }));

  return {
    isOffline: !navigator.onLine,
    queuedOrders: [],
    cachedProducts: [],
    cachedCategories: [],
    lastSyncTime: null,
    syncInProgress: false,
    lastSyncError: null,
    storageError: null,
    logEntries: [],

    setOfflineStatus: status => {
      set({ isOffline: !status });
      recordLog(status ? 'info' : 'warning', status ? 'Connection restored' : 'Connection lost', {
        online: status
      });

      if (status) {
        void get().syncQueuedOrders();
      }
    },

    queueOrder: async order => {
      const previousQueue = get().queuedOrders;
      const newQueue = [...previousQueue, order];

      set({ queuedOrders: newQueue, storageError: null });

      try {
        await ordersStore.setItem('queuedOrders', newQueue);
        recordLog('info', 'Order queued offline', {
          orderId: order.id,
          total: order.total,
          type: order.type
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to persist queued orders';
        set({ queuedOrders: previousQueue, storageError: message });
        recordLog('error', 'Failed to queue order', {
          orderId: order.id,
          message
        });
        throw error;
      }
    },

    cacheData: async (products, categories) => {
      const syncTime = new Date();

      set({
        cachedProducts: products,
        cachedCategories: categories,
        lastSyncTime: syncTime,
        storageError: null
      });

      try {
        await productsStore.setItem('products', products);
        await categoriesStore.setItem('categories', categories);
        await ordersStore.setItem('lastSyncTime', syncTime.toISOString());

        recordLog('info', 'Catalog cached locally', {
          products: products.length,
          categories: categories.length
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to cache catalog';
        set({ storageError: message });
        recordLog('error', 'Failed to cache catalog', { message });
        throw error;
      }
    },

    syncQueuedOrders: async () => {
      const { queuedOrders } = get();

      if (queuedOrders.length === 0) {
        recordLog('info', 'Sync attempted with empty queue');
        set({ lastSyncError: null });
        return;
      }

      set({ syncInProgress: true, lastSyncError: null });

      recordLog('info', 'Sync started', { count: queuedOrders.length });

      try {
        console.log('Syncing queued orders:', queuedOrders);

        await ordersStore.removeItem('queuedOrders');

        const syncTime = new Date();
        await ordersStore.setItem('lastSyncTime', syncTime.toISOString());

        set({
          queuedOrders: [],
          lastSyncTime: syncTime,
          storageError: null
        });

        recordLog('info', 'Sync completed', { count: queuedOrders.length });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sync orders';
        set({ lastSyncError: message, storageError: message });
        recordLog('error', 'Sync failed', { message });

        try {
          await ordersStore.setItem('queuedOrders', queuedOrders);
          recordLog('warning', 'Queued orders restored after sync failure', {
            count: queuedOrders.length
          });
        } catch (restoreError) {
          const restoreMessage =
            restoreError instanceof Error
              ? restoreError.message
              : 'Unable to restore queued orders';
          recordLog('error', 'Failed to restore queued orders after sync failure', {
            message: restoreMessage
          });
        }
      } finally {
        set({ syncInProgress: false });
      }
    },

    loadCachedData: async () => {
      try {
        const [products, categories, lastSync, queuedOrders] = await Promise.all([
          productsStore.getItem<Product[]>('products'),
          categoriesStore.getItem<Category[]>('categories'),
          ordersStore.getItem<string>('lastSyncTime'),
          ordersStore.getItem<Order[]>('queuedOrders')
        ]);

        const normalizedQueue = normalizeOrders(queuedOrders);

        set({
          cachedProducts: products || [],
          cachedCategories: categories || [],
          lastSyncTime: lastSync ? new Date(lastSync) : null,
          queuedOrders: normalizedQueue,
          storageError: null
        });

        recordLog('info', 'Offline cache loaded', {
          products: products?.length ?? 0,
          categories: categories?.length ?? 0,
          queuedOrders: normalizedQueue.length
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load cached data';
        set({ storageError: message });
        recordLog('error', 'Failed to load cached data', { message });
      }
    }
  };
});

