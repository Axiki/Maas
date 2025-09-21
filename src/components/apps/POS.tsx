import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Search, Plus, Minus, Trash2, CreditCard, Clock, ShieldCheck, BadgePercent, Ban } from 'lucide-react';
import { MotionWrapper, AnimatedList } from '../ui/MotionWrapper';
import { useCartStore } from '../../stores/cartStore';
import { useOfflineStore } from '../../stores/offlineStore';
import { useAuthStore } from '../../stores/authStore';
import { Product, Category, RestrictedPosAction } from '../../types';
import { mockProducts, mockCategories } from '../../data/mockData';

export const POS: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products] = useState<Product[]>(mockProducts);
  const [categories] = useState<Category[]>(mockCategories);
  const gridRef = useRef<HTMLDivElement>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<RestrictedPosAction | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [authorizationMessage, setAuthorizationMessage] = useState<string | null>(null);

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
    applyDiscount,
    clearCart
  } = useCartStore();

  const { queueOrder } = useOfflineStore();
  const { user, store, verifyPin, requiresPinForAction, rolePermissions } = useAuthStore();

  const restrictedLabels: Record<RestrictedPosAction, string> = {
    'void-order': 'Void current order',
    'process-refund': 'Process refund',
    'manager-discount': 'Manager discount'
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

    const order = {
      id: `order-${Date.now()}`,
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
      payments: [],
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

  const resetPinState = () => {
    setPinInput('');
    setPinError('');
    setPendingAction(null);
    setIsVerifyingPin(false);
  };

  const handleRestrictedAction = (action: RestrictedPosAction) => {
    setAuthorizationMessage(null);
    if (requiresPinForAction(action)) {
      setPendingAction(action);
      setPinModalOpen(true);
      setPinInput('');
      setPinError('');
      return;
    }
    executeRestrictedAction(action);
  };

  const applyManagerDiscount = () => {
    const state = useCartStore.getState();
    if (state.items.length === 0) {
      setAuthorizationMessage('No items in the cart to discount.');
      return;
    }
    state.items.forEach((item) => {
      const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
      const gross = (item.price + modifierTotal) * item.quantity;
      const discountValue = Math.round(gross * 0.1 * 100) / 100;
      applyDiscount(item.id, discountValue);
    });
    setAuthorizationMessage('Manager discount applied (10% off each line).');
  };

  const executeRestrictedAction = (action: RestrictedPosAction) => {
    switch (action) {
      case 'void-order':
        clearCart();
        setAuthorizationMessage('Order cleared by authorized user.');
        break;
      case 'manager-discount':
        applyManagerDiscount();
        break;
      case 'process-refund':
        setAuthorizationMessage('Refund workflow initialized (demo).');
        break;
      default:
        setAuthorizationMessage('Action completed.');
    }
    resetPinState();
    setPinModalOpen(false);
  };

  const handlePinSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingAction) return;
    setIsVerifyingPin(true);
    setPinError('');
    const valid = await verifyPin(pinInput);
    setIsVerifyingPin(false);

    if (!valid) {
      setPinError('Invalid PIN. Please try again or request supervisor assistance.');
      return;
    }

    executeRestrictedAction(pendingAction);
  };

  const closePinModal = () => {
    setPinModalOpen(false);
    resetPinState();
  };

  return (
    <MotionWrapper type="page">
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Cart Sidebar */}
        <div className="w-80 bg-surface-100 border-r border-line flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-line">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Current Order</h3>
                {rolePermissions && (
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">
                    PIN required: {rolePermissions.requiresPin.length > 0 ? rolePermissions.requiresPin.length : '0'} actions
                  </p>
                )}
              </div>
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
            {authorizationMessage && (
              <div className="mb-3 rounded-lg border border-primary-200/60 bg-primary-100/40 px-3 py-2 text-xs text-primary-700">
                {authorizationMessage}
              </div>
            )}
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
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Process Payment
            </motion.button>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                onClick={() => handleRestrictedAction('manager-discount')}
                className="w-full rounded-lg border border-line bg-surface-200/70 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary-200 hover:text-primary-600"
              >
                <span className="inline-flex items-center gap-2">
                  <BadgePercent size={16} /> Manager Discount
                </span>
              </button>
              <button
                onClick={() => handleRestrictedAction('void-order')}
                className="w-full rounded-lg border border-line bg-surface-200/70 px-4 py-2 text-sm font-medium text-danger transition-colors hover:border-danger hover:bg-danger/10"
              >
                <span className="inline-flex items-center gap-2">
                  <Ban size={16} /> Void Order
                </span>
              </button>
              <button
                onClick={() => handleRestrictedAction('process-refund')}
                className="w-full rounded-lg border border-line bg-surface-200/70 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary-200 hover:text-primary-600"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} /> Start Refund
                </span>
              </button>
            </div>
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

      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-xl border border-line bg-surface-100 p-6 shadow-xl"
          >
            <div className="mb-4 space-y-1">
              <h3 className="text-lg font-semibold text-ink">PIN required</h3>
              <p className="text-sm text-muted">
                {pendingAction ? restrictedLabels[pendingAction] : 'Restricted action'} requires a supervisor PIN. PINs are stored as salted hashes.
              </p>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-ink">
                Enter PIN
                <input
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  value={pinInput}
                  onChange={(event) => setPinInput(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-line bg-surface-200/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>
              {pinError && <p className="text-sm text-danger">{pinError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closePinModal}
                  className="rounded-lg border border-line bg-surface-200/70 px-4 py-2 text-sm font-medium text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPin}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
                >
                  {isVerifyingPin ? 'Verifying…' : 'Authorize'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </MotionWrapper>
  );
};