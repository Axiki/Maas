import { create } from 'zustand';
import { CartItem, Product, ProductVariant, SelectedModifier, Customer } from '../types';
import {
  evaluatePromotions,
  PromotionDefinition,
  PromotionEvaluation,
} from '../services/promotionsEngine';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  tableNumber: string | null;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  subtotal: number;
  tax: number;
  total: number;
  promotionDefinitions: PromotionDefinition[];
  promotionEvaluation: PromotionEvaluation | null;

  addItem: (product: Product, variant?: ProductVariant, modifiers?: SelectedModifier[], quantity?: number) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  applyDiscount: (itemId: string, discount: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setTableNumber: (tableNumber: string | null) => void;
  setOrderType: (orderType: 'dine-in' | 'takeaway' | 'delivery') => void;
  setPromotionDefinitions: (promotions: PromotionDefinition[]) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  tableNumber: null,
  orderType: 'dine-in',
  subtotal: 0,
  tax: 0,
  total: 0,
  promotionDefinitions: [],
  promotionEvaluation: null,

  addItem: (product, variant, modifiers = [], quantity = 1) => {
    const state = get();
    const itemPrice = variant?.price || product.price;
    const modifierTotal = modifiers.reduce((sum, mod) => sum + mod.price, 0);
    const lineTotal = (itemPrice + modifierTotal) * quantity;
    const tax = lineTotal * (product.taxRate / 100);

    const newItem: CartItem = {
      id: uuidv4(),
      productId: product.id,
      variantId: variant?.id,
      quantity,
      price: itemPrice,
      discount: 0,
      tax,
      modifiers,
      product,
      variant
    };

    set({
      items: [...state.items, newItem]
    });
    
    get().calculateTotals();
  },

  updateItemQuantity: (itemId, quantity) => {
    const state = get();
    if (quantity <= 0) {
      state.removeItem(itemId);
      return;
    }

    const updatedItems = state.items.map(item => {
      if (item.id === itemId) {
        const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
        const lineTotal = (item.price + modifierTotal) * quantity;
        const tax = lineTotal * (item.product.taxRate / 100);
        
        return {
          ...item,
          quantity,
          tax
        };
      }
      return item;
    });

    set({ items: updatedItems });
    get().calculateTotals();
  },

  removeItem: (itemId) => {
    const state = get();
    set({
      items: state.items.filter(item => item.id !== itemId)
    });
    get().calculateTotals();
  },

  applyDiscount: (itemId, discount) => {
    const state = get();
    const updatedItems = state.items.map(item =>
      item.id === itemId ? { ...item, discount } : item
    );
    set({ items: updatedItems });
    get().calculateTotals();
  },

  setCustomer: (customer) => set({ customer }),
  setTableNumber: (tableNumber) => set({ tableNumber }),
  setOrderType: (orderType) => set({ orderType }),
  setPromotionDefinitions: (promotions) => {
    set({ promotionDefinitions: promotions });
    get().calculateTotals();
  },

  clearCart: () => set({
    items: [],
    customer: null,
    tableNumber: null,
    subtotal: 0,
    tax: 0,
    total: 0,
    promotionEvaluation: null,
  }),

  calculateTotals: () => {
    const {
      items,
      promotionDefinitions,
      customer,
      orderType,
    } = get();

    let subtotalBeforePromotions = 0;
    let subtotal = 0;
    let tax = 0;

    const promotionEvaluation = promotionDefinitions.length > 0
      ? evaluatePromotions({
          promotions: promotionDefinitions,
          cart: {
            items,
            customer,
            orderType,
          },
          channel: 'pos',
        })
      : null;

    const promotionAdjustments = promotionEvaluation?.itemAdjustments ?? {};

    items.forEach(item => {
      const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
      const baseLine = (item.price + modifierTotal) * item.quantity;
      const manualDiscount = item.discount;
      const promotionDiscount = promotionAdjustments[item.id] ?? 0;
      const netLine = Math.max(baseLine - manualDiscount - promotionDiscount, 0);
      const lineTax = netLine * (item.product.taxRate / 100);

      subtotalBeforePromotions += Math.max(baseLine - manualDiscount, 0);
      subtotal += netLine;
      tax += lineTax;
    });

    const normalizedEvaluation: PromotionEvaluation | null = promotionEvaluation
      ? {
          ...promotionEvaluation,
          totalSavings: Math.min(
            promotionEvaluation.totalSavings,
            Math.max(subtotalBeforePromotions, 0)
          ),
        }
      : null;

    set({
      subtotal,
      tax,
      total: subtotal + tax,
      promotionEvaluation: normalizedEvaluation,
    });
  }
}));