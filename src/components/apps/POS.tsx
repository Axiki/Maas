import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Clock,
  Banknote,
  Wallet,
  AlertTriangle,
  X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MotionWrapper, AnimatedList } from '../ui/MotionWrapper';
import { useCartStore } from '../../stores/cartStore';
import { useOfflineStore } from '../../stores/offlineStore';
import { useAuthStore } from '../../stores/authStore';
import { Product, Category, PaymentMethod } from '../../types';
import { mockProducts, mockCategories } from '../../data/mockData';

type TenderMethod = Extract<PaymentMethod, 'cash' | 'card' | 'wallet'>;

const tenderMethodDetails: Record<PaymentMethod, { label: string; icon: LucideIcon }> = {
  cash: { label: 'Cash', icon: Banknote },
  card: { label: 'Card', icon: CreditCard },
  wallet: { label: 'Wallet', icon: Wallet },
  'store-credit': { label: 'Store Credit', icon: Wallet }
};

const tenderMethods: TenderMethod[] = ['cash', 'card', 'wallet'];

interface PaymentModalState {
  method: TenderMethod;
  amount: string;
  reference: string;
}

const referenceFieldCopy: Record<TenderMethod, { label: string; placeholder: string }> = {
  cash: {
    label: 'Notes (optional)',
    placeholder: 'Drawer or cashier note'
  },
  card: {
    label: 'Reference',
    placeholder: 'Approval code or last 4 digits'
  },
  wallet: {
    label: 'Transaction Reference',
    placeholder: 'Wallet transaction ID'
  }
};

export const POS: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products] = useState<Product[]>(mockProducts);
  const [categories] = useState<Category[]>(mockCategories);
  const gridRef = useRef<HTMLDivElement>(null);
  const [paymentModal, setPaymentModal] = useState<PaymentModalState | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const {
    items,
    subtotal,
    tax,
    total,
    orderType,
    addItem,
    updateItemQuantity,
    removeItem,
    setOrderType,
    payments,
    addPayment,
    removePayment,
    clearPayments
  } = useCartStore();

  const { queueOrder, isOffline } = useOfflineStore();
  const { user, store } = useAuthStore();

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  // GSAP animation for product grid
  useEffect(() => {
    if (gridRef.current && filteredProducts.length > 0) {
      const productCards = gridRef.current.children;

      gsap.fromTo(productCards,
        { y: 12, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.15,
          stagger: 0.02,
          ease: "power2.out"
        }
      );
    }
  }, [filteredProducts]);

  useEffect(() => {
    if (items.length === 0 && payments.length > 0) {
      clearPayments();
    }
  }, [items.length, payments.length, clearPayments]);

  const hasItems = items.length > 0;
  const dueCents = Math.max(0, Math.round(total * 100));
  const paidCents = payments.reduce((sum, payment) => sum + Math.round(payment.amount * 100), 0);
  const remainingCentsRaw = dueCents - paidCents;
  const remainingCents = remainingCentsRaw > 0 ? remainingCentsRaw : 0;
  const paymentTotal = paidCents / 100;
  const balanceDue = remainingCents / 100;
  const changeDue = remainingCentsRaw < 0 ? Math.abs(remainingCentsRaw) / 100 : 0;
  const isFullyPaid = dueCents === 0 ? hasItems : paidCents >= dueCents;
  const canCheckout = hasItems && isFullyPaid;
  const canAddTenders = hasItems && remainingCents > 0;

  useEffect(() => {
    if (paymentModal && (!hasItems || remainingCents === 0)) {
      setPaymentModal(null);
      setModalError(null);
    }
  }, [paymentModal, hasItems, remainingCents]);

  useEffect(() => {
    if (!paymentModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPaymentModal(null);
        setModalError(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paymentModal]);

  const handleOpenPaymentModal = (method: TenderMethod) => {
    if (!canAddTenders) return;
    if (isOffline && method !== 'cash') return;

    const defaultAmount = remainingCents / 100;
    setPaymentModal({
      method,
      amount: defaultAmount > 0 ? defaultAmount.toFixed(2) : '',
      reference: ''
    });
    setModalError(null);
  };

  const handleClosePaymentModal = () => {
    setPaymentModal(null);
    setModalError(null);
  };

  const handleConfirmPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paymentModal) return;

    const parsedAmount = Number(paymentModal.amount);
    if (!Number.isFinite(parsedAmount)) {
      setModalError('Enter a valid amount.');
      return;
    }

    const cents = Math.round(parsedAmount * 100);
    if (cents <= 0) {
      setModalError('Amount must be greater than zero.');
      return;
    }

    if (paymentModal.method !== 'cash' && cents > remainingCents) {
      setModalError('Amount exceeds remaining balance.');
      return;
    }

    addPayment({
      method: paymentModal.method,
      amount: cents / 100,
      reference: paymentModal.reference
    });

    setPaymentModal(null);
    setModalError(null);
  };

  const updateModalField = <K extends keyof PaymentModalState>(
    field: K,
    value: PaymentModalState[K]
  ) => {
    setPaymentModal((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (modalError) {
      setModalError(null);
    }
  };

  const handleAddProduct = (product: Product) => {
    addItem(product);
  };

  const handleCheckout = async () => {
    if (!canCheckout || !user || !store) return;

    const orderId = `order-${Date.now()}`;
    const order = {
      id: orderId,
      storeId: store.id,
      userId: user.id,
      type: orderType,
      status: 'confirmed' as const,
      lines: items.map(item => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
        modifiers: item.modifiers
      })),
      subtotal,
      tax,
      total,
      payments: payments.map(payment => ({
        id: payment.id,
        orderId,
        method: payment.method,
        amount: payment.amount,
        reference: payment.reference,
        idempotencyKey: payment.idempotencyKey,
        createdAt: payment.createdAt
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      offlineGuid: `offline-${Date.now()}`
    };

    try {
      await queueOrder(order);
      // Clear cart after successful order
      useCartStore.getState().clearCart();
      
      // Show success feedback
      console.log('Order queued successfully:', order.id);
    } catch (error) {
      console.error('Failed to process order:', error);
    }
  };

  return (
    <MotionWrapper type="page">
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Cart Sidebar */}
        <div className="w-80 bg-surface-100 border-r border-line flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-line">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Current Order</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setOrderType('dine-in')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    orderType === 'dine-in' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-surface-200 text-muted hover:bg-surface-300'
                  }`}
                >
                  Dine In
                </button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    orderType === 'takeaway' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-surface-200 text-muted hover:bg-surface-300'
                  }`}
                >
                  Takeaway
                </button>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted">
                <div className="text-center">
                  <Clock size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No items in cart</p>
                </div>
              </div>
            ) : (
              <AnimatedList className="p-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-surface-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        {item.variant && (
                          <p className="text-xs text-muted">{item.variant.name}</p>
                        )}
                        <p className="text-sm font-medium text-primary-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center hover:bg-line transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center hover:bg-line transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </AnimatedList>
            )}
          </div>

          {/* Cart Totals & Checkout */}
          <div className="p-4 border-t border-line">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Payments</h4>
                  {payments.length > 0 && (
                    <span className="text-xs text-muted font-medium">
                      Paid ${paymentTotal.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tenderMethods.map((method) => {
                    const { label, icon: Icon } = tenderMethodDetails[method];
                    const isDisabled = !canAddTenders || (isOffline && method !== 'cash');

                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleOpenPaymentModal(method)}
                        disabled={isDisabled}
                        className="flex items-center gap-2 rounded-lg border border-line bg-surface-100 px-3 py-2 text-xs font-medium transition-colors hover:border-primary-200 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    );
                  })}
                </div>
                {isOffline && (
                  <p className="mt-2 flex items-start gap-2 text-xs text-warning">
                    <AlertTriangle size={14} className="mt-0.5" />
                    <span>Offline mode active. Card and wallet payments are unavailable.</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {payments.length === 0 ? (
                  <p className="text-xs text-muted">Add tenders to distribute the payment across methods.</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment) => {
                      const { label, icon: Icon } = tenderMethodDetails[payment.method];

                      return (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between rounded-lg bg-surface-200 px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-100 text-primary-600">
                              <Icon size={16} />
                            </span>
                            <div>
                              <p className="font-medium">{label}</p>
                              {payment.reference && (
                                <p className="text-xs text-muted">Ref: {payment.reference}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-primary-600 font-tabular">
                              ${payment.amount.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePayment(payment.id)}
                              className="p-1 text-muted transition-colors hover:text-danger"
                              aria-label={`Remove ${label} payment`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 rounded-lg bg-surface-200 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Paid</span>
                  <span className="font-medium font-tabular">${paymentTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={balanceDue > 0 ? 'text-warning font-semibold' : 'text-muted'}>
                    Balance
                  </span>
                  <span
                    className={`font-tabular ${balanceDue > 0 ? 'text-warning font-semibold' : ''}`}
                  >
                    ${balanceDue.toFixed(2)}
                  </span>
                </div>
                {changeDue > 0 && (
                  <div className="flex justify-between text-success font-semibold">
                    <span>Change Due</span>
                    <span className="font-tabular">${changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {!isFullyPaid && hasItems && (
                <p className="text-xs text-danger">Apply payments until the remaining balance is covered.</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={!canCheckout}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Process Payment
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Search & Categories */}
          <div className="p-4 border-b border-line">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-200 text-muted hover:bg-line'
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-200 text-muted hover:bg-line'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div 
              ref={gridRef}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddProduct(product)}
                  className="bg-surface-100 rounded-lg p-4 cursor-pointer border border-line hover:border-primary-200 transition-all group"
                >
                  <div className="aspect-square bg-surface-200 rounded-lg mb-3 flex items-center justify-center">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-4xl">🍽️</div>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h4>
                  
                  <p className="text-primary-600 font-semibold">
                    ${product.price.toFixed(2)}
                  </p>
                  
                  {product.variants.length > 0 && (
                    <p className="text-xs text-muted mt-1">
                      {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="flex items-center justify-center h-64 text-muted">
                <div className="text-center">
                  <Search size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No products found</p>
                  <p className="text-sm">Try adjusting your search or category filter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {paymentModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleClosePaymentModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-xl border border-line bg-surface-100 p-6 shadow-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="payment-modal-title" className="text-lg font-semibold">
                Record {tenderMethodDetails[paymentModal.method].label} Payment
              </h3>
              <button
                type="button"
                onClick={handleClosePaymentModal}
                className="p-1 text-muted transition-colors hover:text-danger"
                aria-label="Close payment modal"
              >
                <X size={18} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleConfirmPayment}>
              <div>
                <label htmlFor="payment-amount" className="mb-1 block text-sm font-medium">
                  Amount
                </label>
                <input
                  id="payment-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  max={paymentModal.method === 'cash' ? undefined : balanceDue.toFixed(2)}
                  value={paymentModal.amount}
                  onChange={(event) => updateModalField('amount', event.target.value)}
                  className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  autoFocus
                />
                {paymentModal.method === 'cash' ? (
                  <p className="mt-1 text-xs text-muted">
                    Remaining balance: ${balanceDue.toFixed(2)}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted">
                    Cannot exceed remaining balance (${balanceDue.toFixed(2)}).
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="payment-reference" className="mb-1 block text-sm font-medium">
                  {referenceFieldCopy[paymentModal.method].label}
                </label>
                <input
                  id="payment-reference"
                  type="text"
                  value={paymentModal.reference}
                  onChange={(event) => updateModalField('reference', event.target.value)}
                  placeholder={referenceFieldCopy[paymentModal.method].placeholder}
                  className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {modalError && <p className="text-sm text-danger">{modalError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClosePaymentModal}
                  className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </MotionWrapper>
  );
};
