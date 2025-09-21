import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Search, Plus, Minus, Trash2, CreditCard, Clock, Wallet, DollarSign, X } from 'lucide-react';
import { MotionWrapper, AnimatedList } from '../ui/MotionWrapper';
import { useCartStore } from '../../stores/cartStore';
import { useOfflineStore } from '../../stores/offlineStore';
import { useAuthStore } from '../../stores/authStore';
import { Product, Category } from '../../types';
import { mockProducts, mockCategories } from '../../data/mockData';
import { v4 as uuidv4 } from 'uuid';

type TenderType = 'cash' | 'card' | 'wallet';

interface TenderEntry {
  id: string;
  method: TenderType;
  amount: number;
  reference?: string;
}

interface TenderModalState {
  type: TenderType;
  amount: string;
  reference: string;
}

export const POS: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products] = useState<Product[]>(mockProducts);
  const [categories] = useState<Category[]>(mockCategories);
  const [tenders, setTenders] = useState<TenderEntry[]>([]);
  const [tenderError, setTenderError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<TenderModalState | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const { 
    items, 
    subtotal, 
    tax, 
    total, 
    orderType,
    addItem, 
    updateItemQuantity, 
    removeItem,
    setOrderType 
  } = useCartStore();
  
  const { queueOrder } = useOfflineStore();
  const { user, store } = useAuthStore();

  const totalTendered = tenders.reduce((sum, tender) => sum + tender.amount, 0);
  const normalizedTotal = Number(total.toFixed(2));
  const balance = Number((normalizedTotal - totalTendered).toFixed(2));
  const remainingBalance = balance > 0 ? balance : 0;
  const overPayment = balance < 0 ? Math.abs(balance) : 0;
  const disableTenderButtons =
    items.length === 0 || normalizedTotal <= 0 || remainingBalance <= 0;
  const isPaymentComplete = Math.abs(balance) < 0.01 && tenders.length > 0;

  const getTenderLabel = (type: TenderType) => {
    switch (type) {
      case 'card':
        return 'Card';
      case 'wallet':
        return 'Wallet';
      default:
        return 'Cash';
    }
  };

  const getReferencePlaceholder = (type: TenderType) => {
    switch (type) {
      case 'card':
        return 'Last 4 digits or auth code';
      case 'wallet':
        return 'Wallet transaction ID';
      default:
        return 'Drawer / note (optional)';
    }
  };

  const getReferenceHelper = (type: TenderType) => {
    switch (type) {
      case 'card':
        return 'Required for reconciliation (e.g., last 4 digits or auth code).';
      case 'wallet':
        return 'Required wallet confirmation or transaction reference.';
      default:
        return 'Optional drawer note to track cash handling.';
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      setTenders([]);
      setTenderError(null);
      setModalState(null);
      setModalError(null);
    }
  }, [items.length]);

  const openTenderModal = (type: TenderType) => {
    if (items.length === 0 || normalizedTotal <= 0 || remainingBalance <= 0) {
      return;
    }

    setModalState({
      type,
      amount: remainingBalance > 0 ? remainingBalance.toFixed(2) : '',
      reference: ''
    });
    setModalError(null);
    setTenderError(null);
  };

  const closeTenderModal = () => {
    setModalState(null);
    setModalError(null);
  };

  const handleTenderSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalState) return;

    const rawAmount = parseFloat(modalState.amount);
    if (Number.isNaN(rawAmount)) {
      setModalError('Enter a valid payment amount.');
      return;
    }

    const normalizedAmount = Math.round(rawAmount * 100) / 100;
    if (normalizedAmount <= 0) {
      setModalError('Payment amount must be greater than zero.');
      return;
    }

    const currentRemaining = Number((normalizedTotal - totalTendered).toFixed(2));
    if (normalizedAmount - currentRemaining > 0.009) {
      setModalError('Amount exceeds the remaining balance.');
      return;
    }

    const trimmedReference = modalState.reference.trim();
    if (modalState.type !== 'cash' && trimmedReference.length === 0) {
      setModalError('A reference is required for this tender.');
      return;
    }

    const newTender: TenderEntry = {
      id: uuidv4(),
      method: modalState.type,
      amount: normalizedAmount,
      ...(trimmedReference ? { reference: trimmedReference } : {})
    };

    setTenders((prev) => [...prev, newTender]);
    setTenderError(null);
    closeTenderModal();
  };

  const handleRemoveTender = (id: string) => {
    setTenders((prev) => prev.filter((tender) => tender.id !== id));
    setTenderError(null);
  };

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

  const handleAddProduct = (product: Product) => {
    addItem(product);
  };

  const handleCheckout = async () => {
    if (items.length === 0 || !user || !store) return;

    if (tenders.length === 0) {
      setTenderError('Add at least one payment method before processing.');
      return;
    }

    if (Math.abs(balance) >= 0.01) {
      if (balance > 0) {
        setTenderError(`Remaining balance of $${balance.toFixed(2)} must be collected.`);
      } else {
        setTenderError('Payments exceed the order total. Adjust tender amounts.');
      }
      return;
    }

    const timestamp = Date.now();
    const orderId = `order-${timestamp}`;
    const now = new Date();
    const createdAt = new Date(now);
    const updatedAt = new Date(now);

    const payments = tenders.map((tender) => ({
      id: `payment-${tender.id}`,
      orderId,
      method: tender.method,
      amount: tender.amount,
      reference: tender.reference,
      idempotencyKey: `idem-${tender.id}`,
      createdAt: new Date(now)
    }));

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
      payments,
      createdAt,
      updatedAt,
      offlineGuid: `offline-${timestamp}`
    };

    try {
      await queueOrder(order);
      useCartStore.getState().clearCart();
      setTenders([]);
      setTenderError(null);
      setModalState(null);
      setModalError(null);

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
            <div className="mb-4 space-y-2">
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

            <div className="mb-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
                  <span>Payments</span>
                  <span className="text-primary-600">${totalTendered.toFixed(2)}</span>
                </div>
                {tenders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-line bg-surface-200 px-3 py-2 text-sm text-muted">
                    No payments recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tenders.map((tender) => (
                      <div
                        key={tender.id}
                        className="flex items-center justify-between rounded-lg border border-line bg-surface-200 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{getTenderLabel(tender.method)} Payment</p>
                          {tender.reference && (
                            <p className="text-xs text-muted">Ref: {tender.reference}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">${tender.amount.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTender(tender.id)}
                            className="rounded-full p-1 text-muted transition-colors hover:text-danger"
                            aria-label={`Remove ${getTenderLabel(tender.method)} payment`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className={`flex items-center justify-between text-sm font-medium ${
                    overPayment > 0 ? 'text-danger' : ''
                  }`}
                >
                  <span>{overPayment > 0 ? 'Over tendered' : 'Remaining balance'}</span>
                  <span>
                    ${overPayment > 0 ? overPayment.toFixed(2) : remainingBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => openTenderModal('cash')}
                  disabled={disableTenderButtons}
                  className="flex items-center justify-center gap-2 rounded-lg border border-line bg-surface-100 py-2 text-sm font-medium transition-colors hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <DollarSign size={16} />
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => openTenderModal('card')}
                  disabled={disableTenderButtons}
                  className="flex items-center justify-center gap-2 rounded-lg border border-line bg-surface-100 py-2 text-sm font-medium transition-colors hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CreditCard size={16} />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => openTenderModal('wallet')}
                  disabled={disableTenderButtons}
                  className="flex items-center justify-center gap-2 rounded-lg border border-line bg-surface-100 py-2 text-sm font-medium transition-colors hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Wallet size={16} />
                  Wallet
                </button>
              </div>

              {tenderError && (
                <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
                  {tenderError}
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={items.length === 0 || !isPaymentComplete}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
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

      {modalState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tender-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeTenderModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-line bg-surface-100 shadow-modal">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h4 id="tender-modal-title" className="text-base font-semibold">
                Record {getTenderLabel(modalState.type)} Payment
              </h4>
              <button
                type="button"
                onClick={closeTenderModal}
                className="rounded-full p-1 text-muted transition-colors hover:text-danger"
                aria-label="Close tender modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleTenderSubmit} className="space-y-4 px-4 py-4">
              <div>
                <label htmlFor="tender-amount" className="mb-1 block text-sm font-medium">
                  Amount
                </label>
                <input
                  id="tender-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={modalState.amount}
                  onChange={(event) => {
                    const value = event.target.value;
                    setModalState((prev) => (prev ? { ...prev, amount: value } : prev));
                    setModalError(null);
                  }}
                  className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <p className="text-xs text-muted">
                Remaining balance: ${remainingBalance.toFixed(2)}
              </p>

              <div>
                <label htmlFor="tender-reference" className="mb-1 block text-sm font-medium">
                  {modalState.type === 'cash' ? 'Reference (optional)' : 'Reference'}
                </label>
                <input
                  id="tender-reference"
                  name="reference"
                  type="text"
                  value={modalState.reference}
                  onChange={(event) => {
                    const value = event.target.value;
                    setModalState((prev) => (prev ? { ...prev, reference: value } : prev));
                    setModalError(null);
                  }}
                  placeholder={getReferencePlaceholder(modalState.type)}
                  className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...(modalState.type !== 'cash' ? { required: true } : {})}
                />
                <p className="mt-1 text-xs text-muted">{getReferenceHelper(modalState.type)}</p>
              </div>

              {modalError && (
                <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
                  {modalError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeTenderModal}
                  className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MotionWrapper>
  );
};
