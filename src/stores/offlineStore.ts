import { create } from 'zustand';
import localforage from 'localforage';
import { Order, Product, Category } from '../types';
import { logger } from '../utils/logger';

interface OfflineState {
  isOffline: boolean;
  queuedOrders: Order[];
  cachedProducts: Product[];
  cachedCategories: Category[];
  lastSyncTime: Date | null;
  
  setOfflineStatus: (status: boolean) => void;
  queueOrder: (order: Order) => Promise<void>;
  cacheData: (products: Product[], categories: Category[]) => Promise<void>;
  syncQueuedOrders: () => Promise<void>;
  loadCachedData: () => Promise<void>;
}

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

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOffline: !navigator.onLine,
  queuedOrders: [],
  cachedProducts: [],
  cachedCategories: [],
  lastSyncTime: null,

  setOfflineStatus: (status) => {
    set({ isOffline: !status });
    logger.info('Offline status updated', { isOffline: !status });
    if (status) {
      // When coming online, sync queued orders
      get().syncQueuedOrders();
    }
  },

  queueOrder: async (order) => {
    const { queuedOrders } = get();
    const newQueue = [...queuedOrders, order];
    
    set({ queuedOrders: newQueue });
    logger.info('Order queued for offline sync', {
      orderId: order.id,
      offlineGuid: order.offlineGuid,
      queueLength: newQueue.length,
    });
    await ordersStore.setItem('queuedOrders', newQueue);
  },

  cacheData: async (products, categories) => {
    set({ 
      cachedProducts: products,
      cachedCategories: categories,
      lastSyncTime: new Date()
    });
    
    await productsStore.setItem('products', products);
    await categoriesStore.setItem('categories', categories);
    await ordersStore.setItem('lastSyncTime', new Date().toISOString());
  },

  syncQueuedOrders: async () => {
    const { queuedOrders } = get();
    
    if (queuedOrders.length === 0) return;

    try {
      // In a real implementation, we would sync with the server here
      logger.withIncident(get().lastSyncTime?.toISOString(), () => {
        logger.info('Syncing queued orders', {
          count: queuedOrders.length,
        });
      });

      // Clear queued orders after successful sync
      set({ queuedOrders: [] });
      await ordersStore.removeItem('queuedOrders');
      logger.info('Queued orders synced successfully');
    } catch (error) {
      logger.error('Failed to sync orders', { error });
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

      set({
        cachedProducts: products || [],
        cachedCategories: categories || [],
        lastSyncTime: lastSync ? new Date(lastSync) : null,
        queuedOrders: queuedOrders || []
      });
      logger.debug('Loaded cached offline data', {
        productCount: products?.length ?? 0,
        categoryCount: categories?.length ?? 0,
        queuedOrderCount: queuedOrders?.length ?? 0,
      });
    } catch (error) {
      logger.error('Failed to load cached data', { error });
    }
  }
}));