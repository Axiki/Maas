import { create } from 'zustand';
import {
  AppliedPromotion,
  CartItem,
  Customer,
  IneligiblePromotion,
  Product,
  ProductVariant,
  Promotion,
  SelectedModifier
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { evaluatePromotions } from '../services/promotionsEngine';

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  tableNumber: string | null;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  subtotal: number;
  tax: number;
  total: number;
  promotions: Promotion[];
  promotionDiscountTotal: number;
  appliedPromotions: AppliedPromotion[];
  ineligiblePromotions: IneligiblePromotion[];
  storeId?: string;

  addItem: (product: Product, variant?: ProductVariant, modifiers?: SelectedModifier[], quantity?: number) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  applyDiscount: (itemId: string, discount: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setTableNumber: (tableNumber: string | null) => void;
  setOrderType: (orderType: 'dine-in' | 'takeaway' | 'delivery') => void;
  setPromotions: (promotions: Promotion[]) => void;
  setStoreId: (storeId?: string) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

const roundCurrency = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  tableNumber: null,
  orderType: 'dine-in',
  subtotal: 0,
  tax: 0,
  total: 0,
  promotions: [],
  promotionDiscountTotal: 0,
  appliedPromotions: [],
  ineligiblePromotions: [],
  storeId: undefined,

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
  setPromotions: (promotions) => {
    set({ promotions });
    get().calculateTotals();
  },
  setStoreId: (storeId) => {
    set({ storeId });
    get().calculateTotals();
  },

  clearCart: () => set({
    items: [],
    customer: null,
    tableNumber: null,
    subtotal: 0,
    tax: 0,
    total: 0,
    promotionDiscountTotal: 0,
    appliedPromotions: [],
    ineligiblePromotions: []
  }),

  calculateTotals: () => {
    const { items, promotions, orderType, customer, storeId } = get();

    if (items.length === 0) {
      set({
        subtotal: 0,
        tax: 0,
        total: 0,
        promotionDiscountTotal: 0,
        appliedPromotions: [],
        ineligiblePromotions: []
      });
      return;
    }

    const evaluation = evaluatePromotions({
      items,
      promotions,
      orderType,
      customer,
      storeId
    });

    let subtotal = 0;
    let tax = 0;

    items.forEach(item => {
      const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
      const baseLine = ((item.price + modifierTotal) * item.quantity) - (item.discount ?? 0);
      const promoDiscount = evaluation.adjustments[item.id] ?? 0;
      const lineSubtotal = Math.max(0, roundCurrency(baseLine - promoDiscount));
      const lineTax = roundCurrency(lineSubtotal * (item.product.taxRate / 100));

      subtotal += lineSubtotal;
      tax += lineTax;
    });

    const roundedSubtotal = roundCurrency(subtotal);
    const roundedTax = roundCurrency(tax);

    set({
      subtotal: roundedSubtotal,
      tax: roundedTax,
      total: roundCurrency(roundedSubtotal + roundedTax),
      promotionDiscountTotal: roundCurrency(evaluation.totalDiscount),
      appliedPromotions: evaluation.appliedPromotions,
      ineligiblePromotions: evaluation.ineligiblePromotions
    });
  }
}));
