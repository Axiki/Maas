import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Clock,
  Percent,
  Lock,
  BadgeCheck,
  AlertTriangle
} from 'lucide-react';
import { MotionWrapper, AnimatedList } from '../ui/MotionWrapper';
import { useCartStore } from '../../stores/cartStore';
import { useOfflineStore } from '../../stores/offlineStore';
import { useAuthStore } from '../../stores/authStore';
import { useDiscountStore } from '../../stores/discountStore';
import { useAuditTrailStore } from '../../stores/auditTrailStore';
import { validateApprovalPin } from '../../config/permissions';
import { Product, Category, UserRole } from '../../types';
import { mockProducts, mockCategories } from '../../data/mockData';

export const POS: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products] = useState<Product[]>(mockProducts);
  const [categories] = useState<Category[]>(mockCategories);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeDiscountItemId, setActiveDiscountItemId] = useState<string | null>(null);
  const [discountPercentInput, setDiscountPercentInput] = useState<string>('0');
  const [discountReasonInput, setDiscountReasonInput] = useState<string>('');
  const [managerPinInput, setManagerPinInput] = useState<string>('');
  const [discountError, setDiscountError] = useState<string | null>(null);
  
  const {
    items,
    subtotal,
    tax,
    total,
    orderType,
    addItem,
    updateItemQuantity,
    removeItem,
    applyDiscount,
    setOrderType
  } = useCartStore();

  const { queueOrder } = useOfflineStore();
  const { user, store } = useAuthStore();
  const discountRules = useDiscountStore((state) => state.rules);
  const discountReasons = useDiscountStore((state) => state.reasons);
  const logApproval = useAuditTrailStore((state) => state.logApproval);

  const userRole: UserRole = (user?.role as UserRole) ?? 'cashier';
  const discountRule = discountRules[userRole] ?? discountRules.cashier;
  const activeDiscountItem = useMemo(
    () => items.find((item) => item.id === activeDiscountItemId) ?? null,
    [items, activeDiscountItemId]
  );
  const parsedPercent = useMemo(() => {
    const value = parseFloat(discountPercentInput);
    return Number.isNaN(value) ? 0 : value;
  }, [discountPercentInput]);
  const cappedPercentForPreview = useMemo(() => {
    const bounded = Math.min(Math.max(parsedPercent, 0), 100);
    return Number.isFinite(bounded) ? bounded : 0;
  }, [parsedPercent]);
  const discountAmountPreview = useMemo(() => {
    if (!activeDiscountItem) {
      return 0;
    }
    const modifierTotal = activeDiscountItem.modifiers.reduce(
      (sum, mod) => sum + mod.price,
      0
    );
    const lineBase =
      (activeDiscountItem.price + modifierTotal) * activeDiscountItem.quantity;
    return parseFloat(((lineBase * cappedPercentForPreview) / 100).toFixed(2));
  }, [activeDiscountItem, cappedPercentForPreview]);
  const requiresApproval =
    cappedPercentForPreview > discountRule.maxSelfDiscountPercent &&
    !discountRule.approvalRoles.includes(userRole);
  const exceedsManagerCap =
    cappedPercentForPreview > discountRule.maxManagerDiscountPercent;
  const canSelfApprove = discountRule.approvalRoles.includes(userRole);
  const approvalRolesLabel = useMemo(
    () =>
      discountRule.approvalRoles
        .map((role) => role.charAt(0).toUpperCase() + role.slice(1))
        .join(', '),
    [discountRule.approvalRoles]
  );

  const openDiscountModal = (itemId: string) => {
    const targetItem = items.find((item) => item.id === itemId);
    setActiveDiscountItemId(itemId);
    setDiscountPercentInput(
      targetItem?.discountPercent ? targetItem.discountPercent.toString() : '0'
    );
    setDiscountReasonInput(
      targetItem?.discountReason ?? discountReasons[0] ?? ''
    );
    setManagerPinInput('');
    setDiscountError(null);
  };

  const closeDiscountModal = () => {
    setActiveDiscountItemId(null);
    setDiscountPercentInput('0');
    setDiscountReasonInput('');
    setManagerPinInput('');
    setDiscountError(null);
  };

  const handleDiscountSubmit = () => {
    if (!activeDiscountItem) {
      return;
    }

    const sanitizedPercent = Math.min(Math.max(parsedPercent, 0), 100);
    const trimmedReason = discountReasonInput.trim();

    if (sanitizedPercent > discountRule.maxManagerDiscountPercent) {
      setDiscountError(
        `Discounts above ${discountRule.maxManagerDiscountPercent}% require policy review.`
      );
      return;
    }

    if (sanitizedPercent > 0 && !trimmedReason) {
      setDiscountError('Please provide a reason for this discount.');
      return;
    }

    let approverRole: UserRole | null = null;

    if (sanitizedPercent > discountRule.maxSelfDiscountPercent) {
      if (canSelfApprove) {
        approverRole = userRole;
      } else {
        if (!managerPinInput.trim()) {
          setDiscountError('Manager PIN approval is required for this discount.');
          return;
        }

        const validatedRole = validateApprovalPin(
          managerPinInput,
          discountRule.approvalRoles
        );

        if (!validatedRole) {
          setDiscountError('Invalid manager PIN. Please try again.');
          return;
        }

        approverRole = validatedRole;
      }
    }

    const modifierTotal = activeDiscountItem.modifiers.reduce(
      (sum, mod) => sum + mod.price,
      0
    );
    const lineBase =
      (activeDiscountItem.price + modifierTotal) * activeDiscountItem.quantity;
    const discountAmount = parseFloat(
      ((lineBase * sanitizedPercent) / 100).toFixed(2)
    );

    applyDiscount(activeDiscountItem.id, discountAmount, {
      percent: sanitizedPercent,
      reason: trimmedReason || undefined,
      approvedBy: approverRole
    });

    if (approverRole) {
      logApproval({
        cartItemId: activeDiscountItem.id,
        productName: activeDiscountItem.product.name,
        discountPercent: sanitizedPercent,
        discountAmount,
        reason: trimmedReason || 'Unspecified',
        requestedByRole: userRole,
        requestedByUserId: user?.id,
        requestedByUserName: user?.name,
        storeId: store?.id,
        approvedByRole: approverRole
      });
    }

    closeDiscountModal();
  };

  const handleRemoveDiscount = () => {
    if (!activeDiscountItem) {
      return;
    }
    applyDiscount(activeDiscountItem.id, 0, {
      percent: 0,
      reason: undefined,
      approvedBy: null
    });
    closeDiscountModal();
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
        discountPercent: item.discountPercent,
        discountReason: item.discountReason,
        discountApprovedByRole: item.discountApprovedByRole,
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
                {items.map((item) => {
                  const modifierTotal = item.modifiers.reduce(
                    (sum, mod) => sum + mod.price,
                    0
                  );
                  const lineBase = (item.price + modifierTotal) * item.quantity;
                  const netTotal = lineBase - item.discount;

                  return (
                    <div key={item.id} className="bg-surface-200 rounded-lg p-3 space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-ink truncate">
                            {item.product.name}
                          </h4>
                          {item.variant && (
                            <p className="text-xs text-muted">{item.variant.name}</p>
                          )}
                          <p className="text-xs text-muted mt-1">
                            Base: ${lineBase.toFixed(2)} · Net: ${netTotal.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-muted hover:text-danger transition-colors"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.discount > 0 && (
                        <div className="rounded-md border border-primary-200/70 bg-primary-500/5 px-3 py-2 text-xs space-y-1">
                          <div className="flex items-center justify-between text-primary-600 font-semibold">
                            <span>-{item.discountPercent.toFixed(2)}%</span>
                            <span>-${item.discount.toFixed(2)}</span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-muted">
                            <span className="truncate flex-1">
                              {item.discountReason ?? 'No reason provided'}
                            </span>
                            {item.discountApprovedByRole && (
                              <span className="flex items-center gap-1 text-primary-600">
                                <BadgeCheck size={12} />
                                <span className="capitalize">
                                  {item.discountApprovedByRole}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center hover:bg-line transition-colors"
                            aria-label={`Decrease ${item.product.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center hover:bg-line transition-colors"
                            aria-label={`Increase ${item.product.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => openDiscountModal(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary-200 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Percent size={14} />
                          <span className="hidden sm:inline">Discount</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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
      <AnimatePresence>
        {activeDiscountItem && (
          <motion.div
            key="discount-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4"
            onClick={closeDiscountModal}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-md rounded-2xl border border-line bg-surface-100 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="discount-dialog-title"
            >
              <div className="space-y-5">
                <div>
                  <h3
                    id="discount-dialog-title"
                    className="text-lg font-semibold text-ink"
                  >
                    Apply discount
                  </h3>
                  <p className="text-sm text-muted">
                    {activeDiscountItem.product.name} · Quantity {activeDiscountItem.quantity}
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink flex items-center gap-2">
                      <Percent size={16} />
                      Discount percentage
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={discountPercentInput}
                      onChange={(event) => {
                        setDiscountPercentInput(event.target.value);
                        setDiscountError(null);
                      }}
                      className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-muted">
                      Up to {discountRule.maxSelfDiscountPercent}% without approval. Manager
                      override up to {discountRule.maxManagerDiscountPercent}%.
                    </p>
                  </label>

                  {exceedsManagerCap && (
                    <div className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
                      <AlertTriangle size={14} />
                      <span>
                        Exceeds maximum allowed discount of {discountRule.maxManagerDiscountPercent}%.
                      </span>
                    </div>
                  )}

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Reason</span>
                    <input
                      type="text"
                      list="discount-reasons"
                      placeholder="Type or select a reason"
                      value={discountReasonInput}
                      onChange={(event) => {
                        setDiscountReasonInput(event.target.value);
                        setDiscountError(null);
                      }}
                      className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <datalist id="discount-reasons">
                      {discountReasons.map((reason) => (
                        <option key={reason} value={reason} />
                      ))}
                    </datalist>
                  </label>

                  <div className="flex items-center justify-between rounded-lg border border-line bg-surface-200/60 px-3 py-2 text-sm">
                    <span className="text-muted">Projected discount</span>
                    <span className="font-semibold text-primary-600">
                      -${discountAmountPreview.toFixed(2)}
                    </span>
                  </div>

                  {requiresApproval && (
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-ink flex items-center gap-2">
                        <Lock size={16} />
                        Manager PIN
                      </span>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="\\d*"
                        maxLength={6}
                        value={managerPinInput}
                        onChange={(event) => {
                          setManagerPinInput(event.target.value);
                          setDiscountError(null);
                        }}
                        className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter approval PIN"
                      />
                      <p className="text-xs text-muted">
                        Approval required from {approvalRolesLabel || 'manager'} for discounts above {discountRule.maxSelfDiscountPercent}%.
                      </p>
                    </label>
                  )}
                </div>

                {discountError && (
                  <div className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
                    <AlertTriangle size={14} />
                    <span>{discountError}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleRemoveDiscount}
                    disabled={!activeDiscountItem.discount}
                    className="w-full rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-danger hover:text-danger disabled:opacity-60 sm:w-auto"
                  >
                    Remove discount
                  </button>
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={closeDiscountModal}
                      className="flex-1 rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink sm:flex-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDiscountSubmit}
                      disabled={exceedsManagerCap}
                      className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-60 sm:flex-none"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionWrapper>
  );
};