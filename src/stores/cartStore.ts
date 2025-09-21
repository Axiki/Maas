import { create } from 'zustand';
import { CartItem, Product, ProductVariant, SelectedModifier, Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  tableNumber: string | null;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  subtotal: number;
  tax: number;
  total: number;
  
  addItem: (product: Product, variant?: ProductVariant, modifiers?: SelectedModifier[], quantity?: number) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  applyDiscount: (itemId: string, discount: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setTableNumber: (tableNumber: string | null) => void;
  setOrderType: (orderType: 'dine-in' | 'takeaway' | 'delivery') => void;
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

  clearCart: () => set({
    items: [],
    customer: null,
    tableNumber: null,
    subtotal: 0,
    tax: 0,
    total: 0
  }),

  calculateTotals: () => {
    const { items } = get();
    let subtotal = 0;
    let tax = 0;

    items.forEach(item => {
      const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
      const lineSubtotal = ((item.price + modifierTotal) * item.quantity) - item.discount;
      const lineTax = lineSubtotal * (item.product.taxRate / 100);
      
      subtotal += lineSubtotal;
      tax += lineTax;
    });

    set({
      subtotal,
      tax,
      total: subtotal + tax
    });
  }
}));