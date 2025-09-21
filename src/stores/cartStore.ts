import { create } from 'zustand';
import {
  CartItem,
  Product,
  ProductVariant,
  SelectedModifier,
  Customer,
  AuditActor
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from './authStore';
import { useAuditTrailStore } from './auditTrailStore';
import { getDiscountThresholdForRole, validateApprovalPin } from '../config/permissions';

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
    const cartItem = state.items.find(item => item.id === itemId);

    if (!cartItem) {
      return;
    }

    const normalizedDiscount = Math.max(0, discount);
    const modifierTotal = cartItem.modifiers.reduce((sum, mod) => sum + mod.price, 0);
    const lineValue = (cartItem.price + modifierTotal) * cartItem.quantity;

    if (lineValue <= 0) {
      return;
    }

    const discountPercent = (normalizedDiscount / lineValue) * 100;
    const { user } = useAuthStore.getState();
    const thresholds = getDiscountThresholdForRole(user?.role);
    const requiresApproval = discountPercent > thresholds.maxPercentageWithoutApproval;
    const exceedsMaximum = discountPercent > thresholds.maxPercentageWithApproval;
    const auditTrail = useAuditTrailStore.getState();

    const requestedBy: AuditActor | null = user
      ? { id: user.id, name: user.name, role: user.role }
      : null;

    if (exceedsMaximum) {
      if (typeof window !== 'undefined') {
        window.alert(
          `Discount exceeds the maximum allowed ${thresholds.maxPercentageWithApproval}% for this role.`
        );
      }

      auditTrail.logDiscountApproval({
        itemId,
        discountAmount: normalizedDiscount,
        discountPercent,
        status: 'rejected',
        requiresApproval,
        requestedBy,
        approver: null,
        reason: 'Requested discount exceeds configured maximum threshold.'
      });
      return;
    }

    let approver: AuditActor | null = null;

    if (requiresApproval) {
      if (typeof window === 'undefined') {
        auditTrail.logDiscountApproval({
          itemId,
          discountAmount: normalizedDiscount,
          discountPercent,
          status: 'rejected',
          requiresApproval,
          requestedBy,
          approver: null,
          reason: 'Approval prompt unavailable in this environment.'
        });
        return;
      }

      const promptMessage = `Manager approval required to apply a ${discountPercent.toFixed(
        1
      )}% discount. Enter ${thresholds.approvalRole} PIN:`;
      const pinInput = window.prompt(promptMessage);

      if (!pinInput) {
        auditTrail.logDiscountApproval({
          itemId,
          discountAmount: normalizedDiscount,
          discountPercent,
          status: 'rejected',
          requiresApproval,
          requestedBy,
          approver: null,
          reason: 'Approval cancelled before PIN entry.'
        });
        return;
      }

      const resolvedApprover = validateApprovalPin(pinInput.trim(), thresholds.approvalRole);

      if (!resolvedApprover) {
        if (typeof window !== 'undefined') {
          window.alert('Invalid approval PIN. Discount not applied.');
        }

        auditTrail.logDiscountApproval({
          itemId,
          discountAmount: normalizedDiscount,
          discountPercent,
          status: 'rejected',
          requiresApproval,
          requestedBy,
          approver: null,
          reason: 'Invalid approval PIN.'
        });
        return;
      }

      approver = resolvedApprover;
    }

    const cappedDiscount = Math.min(normalizedDiscount, lineValue);

    const updatedItems = state.items.map(item =>
      item.id === itemId ? { ...item, discount: cappedDiscount } : item
    );
    set({ items: updatedItems });
    get().calculateTotals();

    auditTrail.logDiscountApproval({
      itemId,
      discountAmount: cappedDiscount,
      discountPercent: (cappedDiscount / lineValue) * 100,
      status: 'approved',
      requiresApproval,
      requestedBy,
      approver
    });
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