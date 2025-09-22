import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Search, Plus, Minus, Trash2, CreditCard, Clock, Sparkles, X, Eye, ShoppingCart, MapPin, Scan, User } from 'lucide-react';
import { MotionWrapper, AnimatedList } from '../ui/MotionWrapper';
import { useCartStore } from '../../stores/cartStore';
import { useOfflineStore } from '../../stores/offlineStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../providers/UXProvider';
import { Product, Category, PromotionPreviewBadge } from '../../types';
import { mockProducts, mockCategories } from '../../data/mockData';
import { cn } from '@mas/utils';
import { TableManagement } from './TableManagement';
import { BarcodeScanner } from './BarcodeScanner';
import { ProductModifiers } from './ProductModifiers';
import { CustomerManagement } from './CustomerManagement';

const badgeToneClasses: Record<PromotionPreviewBadge['tone'], string> = {
  discount: 'bg-primary-100 text-primary-600 border border-primary-200',
  reward: 'bg-success/10 text-success border border-success/40',
  info: 'bg-surface-200 text-ink border border-line'
};

const badgeIconToneClasses: Record<PromotionPreviewBadge['tone'], string> = {
  discount: 'text-primary-600',
  reward: 'text-success',
  info: 'text-muted'
};

const CART_BREAKPOINT = 1024;

export const POS: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products] = useState<Product[]>(mockProducts);
  const [categories] = useState<Category[]>(mockCategories);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isCartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isTableManagementOpen, setIsTableManagementOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, any>>({});
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [isCustomerManagementOpen, setIsCustomerManagementOpen] = useState(false);
  
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
  const { showToast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      setCartOpen(window.innerWidth >= CART_BREAKPOINT);
    };

    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    return () => {};
  }, []);

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

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowModifierModal(true);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Quick adding product:', product.name);
    console.log('Current cart items before:', items.length);
    addItem(product);
    console.log('Item added to cart');
    console.log('Current cart items after:', items.length);

    // Show visual feedback
    const button = e.currentTarget as HTMLElement;
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);

    // Force cart update
    setCartOpen(window.innerWidth >= CART_BREAKPOINT);
  };

  const handleModalAdd = () => {
    if (selectedProduct) {
      console.log('Adding product from modal:', selectedProduct.name);
      console.log('Current cart items before modal add:', items.length);
      addItem(selectedProduct);
      console.log('Product added from modal');
      console.log('Current cart items after modal add:', items.length);
      setIsProductModalOpen(false);

      // Show visual feedback
      const button = document.querySelector('[aria-label="Add to Order"]') as HTMLElement;
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
      }
    }
  };

  const handleModifierAddToCart = (product: Product, modifiers: Record<string, any>) => {
    console.log('Adding product with modifiers:', product.name, modifiers);
    // In a real app, you'd create a modified product with the selected modifiers
    // For now, we'll just add the base product
    addItem(product);
    showToast({
      title: 'Product Added',
      description: `${product.name} with customizations added to order`,
      tone: 'success',
      duration: 2000
    });
  };

  const renderCartItems = () => {
    if (items.length === 0) {
      return (
        <div className="flex h-full items-center justify-center px-6 py-10 text-muted">
          <div className="text-center">
            <Clock size={48} className="mx-auto mb-3 opacity-50" />
            <p>No items in cart</p>
            <p className="body-xs text-muted">Use the catalog to add items to this ticket.</p>
          </div>
        </div>
      );
    }

    return (
      <AnimatedList className="space-y-3 px-4 py-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border border-line/60 bg-surface-200 p-3"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-ink">{item.product.name}</h4>
                  {item.variant && <p className="text-xs text-muted">{item.variant.name}</p>}
                  <p className="text-sm font-medium text-primary-600">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-muted transition-colors hover:text-danger"
                  aria-label={`Remove ${item.product.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-100 transition-colors hover:bg-line"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-9 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-100 transition-colors hover:bg-line"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </AnimatedList>
    );
  };

  const renderTotals = () => (
    <>
      <div className="space-y-2 pb-4">
        <div className="flex justify-between text-sm text-ink">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-ink">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-ink">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCheckout}
        disabled={items.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CreditCard size={18} />
        Process Payment
      </motion.button>
    </>
  );

  const renderCartContent = () => (
    <>
      <div className="border-b border-line px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-ink">Current order</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType('dine-in')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                orderType === 'dine-in'
                  ? 'bg-primary-500 text-white shadow-card'
                  : 'bg-surface-200 text-muted hover:bg-surface-300'
              )}
            >
              Dine In
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                orderType === 'takeaway'
                  ? 'bg-primary-500 text-white shadow-card'
                  : 'bg-surface-200 text-muted hover:bg-surface-300'
              )}
            >
              Takeaway
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{renderCartItems()}</div>
      <div className="border-t border-line px-4 py-4">{renderTotals()}</div>
    </>
  );

  const handleCheckout = () => {
    if (items.length === 0 || !user || !store) return;

    // Create order object
    const order = {
      id: `order-${Date.now()}`,
      items: items,
      subtotal: subtotal,
      tax: tax,
      total: total,
      orderType: orderType,
      status: 'pending',
      createdAt: new Date(),
      tableNumber: orderType === 'dine-in' ? 'TBD' : null,
      customerName: 'Walk-in Customer'
    };

    // Store order in localStorage for now (in real app, this would go to backend)
    const existingOrders = JSON.parse(localStorage.getItem('pos-orders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('pos-orders', JSON.stringify(existingOrders));

    // Show success message
    showToast({
      title: 'Order Created',
      description: `Order #${order.id.slice(-6)} created successfully`,
      tone: 'success',
      duration: 3000
    });

    // Clear cart
    items.forEach(item => removeItem(item.id));

    // Navigate to payment page
    window.location.href = '/payment';
  };

  return (
    <MotionWrapper type="page">
      <div className="flex h-[calc(100vh-var(--app-header-height))]">
        {/* Cart Sidebar */}
        <div className="hidden h-full w-96 flex-col border-r border-line bg-surface-100 lg:flex">
          {renderCartContent()}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:py-4">
            <div className="flex flex-col">
              <span className="body-xs uppercase tracking-[0.16em] text-muted">POS Station</span>
              <h2 className="heading-xs text-ink">{store?.name ?? 'Register'} • {orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBarcodeScannerOpen(true)}
                className="rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm font-medium hover:bg-surface-200 transition-colors"
              >
                <Scan size={16} className="inline mr-2" />
                Scan
              </button>
              <button
                type="button"
                onClick={() => setIsCustomerManagementOpen(true)}
                className="rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm font-medium hover:bg-surface-200 transition-colors"
              >
                <User size={16} className="inline mr-2" />
                Customers
              </button>
              {orderType === 'dine-in' && (
                <button
                  type="button"
                  onClick={() => setIsTableManagementOpen(true)}
                  className="rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm font-medium hover:bg-surface-200 transition-colors"
                >
                  <MapPin size={16} className="inline mr-2" />
                  Tables
                </button>
              )}
              <div className="hidden lg:block">
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm font-medium"
                >
                  View order ({items.length})
                </button>
              </div>
            </div>
          </div>
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
                  onClick={() => handleProductClick(product)}
                  className="bg-surface-100 rounded-lg p-4 cursor-pointer border border-line hover:border-primary-200 transition-all group relative"
                >
                  <div className="aspect-square bg-surface-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-4xl">🍽️</div>
                    )}

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => handleQuickAdd(product, e)}
                      className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary-600 hover:scale-110 shadow-lg"
                      aria-label={`Quick add ${product.name}`}
                    >
                      <Plus size={16} />
                    </button>

                    {/* Promotion Badges */}
                    {product.promotionBadges?.length ? (
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {product.promotionBadges.map((badge) => (
                          <span
                            key={badge.id}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                              badgeToneClasses[badge.tone]
                            }`}
                          >
                            <Sparkles size={10} className={badgeIconToneClasses[badge.tone]} />
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
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
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="p-1 text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary-600"
                      aria-label={`View ${product.name} details`}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
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

      {/* Mobile Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          >
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t border-line bg-surface-100"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div>
                  <p className="heading-xs text-ink">Current order</p>
                  <p className="body-xs text-muted">{items.length} item{items.length === 1 ? '' : 's'}</p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-line p-2 text-muted"
                  onClick={() => setCartOpen(false)}
                  aria-label="Close order drawer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {renderCartItems()}
              </div>
              <div className="border-t border-line px-4 py-4">
                {renderTotals()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {isProductModalOpen && selectedProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsProductModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-line p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="aspect-square w-16 h-16 bg-surface-200 rounded-xl flex items-center justify-center">
                      {selectedProduct.image ? (
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="text-2xl">🍽️</div>
                      )}
                    </div>
                    <div>
                      <h2 className="heading-md text-ink">{selectedProduct.name}</h2>
                      <p className="body-sm text-muted">
                        ${selectedProduct.price.toFixed(2)}
                        {selectedProduct.variants.length > 0 && (
                          <span> • {selectedProduct.variants.length} variant{selectedProduct.variants.length !== 1 ? 's' : ''}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="space-y-4">
                    <div className="aspect-square bg-surface-200 rounded-xl overflow-hidden">
                      {selectedProduct.image ? (
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    {selectedProduct.promotionBadges?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.promotionBadges.map((badge) => (
                          <span
                            key={badge.id}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                              badgeToneClasses[badge.tone]
                            }`}
                          >
                            <Sparkles size={14} className={badgeIconToneClasses[badge.tone]} />
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="heading-sm mb-3">Product Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="body-sm text-muted">Price</span>
                          <span className="body-sm font-semibold text-primary-600">
                            ${selectedProduct.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="body-sm text-muted">Category</span>
                          <span className="body-sm text-ink">
                            {categories.find(c => c.id === selectedProduct.categoryId)?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="body-sm text-muted">Status</span>
                          <span className={`body-sm font-semibold ${
                            selectedProduct.isActive ? 'text-success' : 'text-danger'
                          }`}>
                            {selectedProduct.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div>
                      <h3 className="heading-sm mb-3">Add to Order</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const existingItem = items.find(item => item.productId === selectedProduct.id);
                              if (existingItem) {
                                updateItemQuantity(existingItem.id, existingItem.quantity - 1);
                              }
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-200 transition-colors hover:bg-line"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {items.find(item => item.productId === selectedProduct.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => addItem(selectedProduct)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white transition-colors hover:bg-primary-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={handleModalAdd}
                          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 font-medium text-white transition-colors hover:bg-primary-600"
                          aria-label="Add to Order"
                        >
                          <ShoppingCart size={16} />
                          Add to Order
                        </button>
                      </div>
                    </div>

                    {/* Variants */}
                    {selectedProduct.variants.length > 0 && (
                      <div>
                        <h3 className="heading-sm mb-3">Available Options</h3>
                        <div className="space-y-2">
                          {selectedProduct.variants.map((variant) => (
                            <div key={variant.id} className="flex items-center justify-between p-3 rounded-lg border border-line">
                              <div>
                                <p className="body-sm font-medium">{variant.name}</p>
                                <p className="body-xs text-muted">
                                  ${variant.price.toFixed(2)}
                                  {variant.price !== selectedProduct.price && (
                                    <span className="ml-2">
                                      ({variant.price > selectedProduct.price ? '+' : ''}${Math.abs(variant.price - selectedProduct.price).toFixed(2)})
                                    </span>
                                  )}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  addItem(selectedProduct, variant);
                                  setIsProductModalOpen(false);
                                }}
                                className="flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                              >
                                <Plus size={14} />
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Management Modal */}
      <AnimatePresence>
        {isTableManagementOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTableManagementOpen(false)}
          >
            <motion.div
              className="w-full h-full max-w-7xl"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-surface-100 rounded-t-2xl h-full overflow-hidden border border-line">
                <div className="flex items-center justify-between border-b border-line px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsTableManagementOpen(false)}
                      className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <div>
                      <h2 className="heading-sm text-ink">Table Management</h2>
                      <p className="body-xs text-muted">Manage dining areas and table assignments</p>
                    </div>
                  </div>
                </div>
                <div className="h-[calc(100%-80px)] overflow-y-auto">
                  <TableManagement
                    onTableSelect={(table) => {
                      setOrderType('dine-in');
                      setIsTableManagementOpen(false);
                    }}
                    onClose={() => setIsTableManagementOpen(false)}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScanResult={(barcode, product) => {
          if (product) {
            addItem(product);
            setIsBarcodeScannerOpen(false);
          }
        }}
        onProductFound={(product) => {
          addItem(product);
          setIsBarcodeScannerOpen(false);
        }}
      />

      {/* Product Modifiers Modal */}
      {selectedProduct && (
        <ProductModifiers
          isOpen={showModifierModal}
          onClose={() => setShowModifierModal(false)}
          product={selectedProduct}
          onAddToCart={handleModifierAddToCart}
        />
      )}
    </MotionWrapper>
  );
};
