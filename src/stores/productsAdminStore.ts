import { create } from 'zustand';
import {
  mockProductItems,
  mockProductModifierGroups,
  mockProductPriceLists,
  ProductAdminItem,
  ProductAdminModifierGroup,
  ProductAdminPriceList
} from '../data/mockProductsAdmin';

interface ProductsAdminState {
  items: ProductAdminItem[];
  modifiers: ProductAdminModifierGroup[];
  priceLists: ProductAdminPriceList[];
  isLoading: boolean;
  lastSyncedAt: string | null;
  initialize: () => void;
  refresh: () => void;
}

const loadMockDataset = () => ({
  items: mockProductItems,
  modifiers: mockProductModifierGroups,
  priceLists: mockProductPriceLists
});

export const useProductsAdminStore = create<ProductsAdminState>((set, get) => ({
  items: [],
  modifiers: [],
  priceLists: [],
  isLoading: true,
  lastSyncedAt: null,
  initialize: () => {
    const { items, modifiers, priceLists } = get();
    if (items.length || modifiers.length || priceLists.length) {
      set({ isLoading: false });
      return;
    }

    const dataset = loadMockDataset();
    set({
      ...dataset,
      isLoading: false,
      lastSyncedAt: new Date().toISOString()
    });
  },
  refresh: () => {
    set({ isLoading: true });
    const dataset = loadMockDataset();
    set({
      ...dataset,
      isLoading: false,
      lastSyncedAt: new Date().toISOString()
    });
  }
}));
