// Core business entities
export interface Tenant {
  id: string;
  name: string;
  settings: TenantSettings;
}

export interface TenantSettings {
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  paperShader: {
    enabled: boolean;
    intensity: number;
    animationSpeed: number;
    surfaces: ('background' | 'cards')[];
  };
}

export interface Store {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeId: string;
  pin?: string;
  lastLogin?: Date;
}

export type UserRole = 'cashier' | 'waiter' | 'bartender' | 'supervisor' | 'manager' | 'owner';

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  sortOrder: number;
  color: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  taxRate: number;
  image?: string;
  barcode?: string;
  variants: ProductVariant[];
  modifierGroups: ModifierGroup[];
  isActive: boolean;
  stationTags: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  sku: string;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  modifiers: Modifier[];
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loyaltyPoints: number;
  storeCreditBalance: number;
}

export interface Order {
  id: string;
  storeId: string;
  userId: string;
  customerId?: string;
  type: 'dine-in' | 'takeaway' | 'delivery';
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled';
  tableNumber?: string;
  lines: OrderLine[];
  subtotal: number;
  tax: number;
  total: number;
  payments: Payment[];
  createdAt: Date;
  updatedAt: Date;
  offlineGuid?: string;
}

export interface OrderLine {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  modifiers: SelectedModifier[];
  notes?: string;
}

export interface SelectedModifier {
  modifierId: string;
  name: string;
  price: number;
}

export interface Payment {
  id: string;
  orderId: string;
  method: 'cash' | 'card' | 'wallet' | 'store-credit';
  amount: number;
  reference?: string;
  idempotencyKey: string;
  createdAt: Date;
}

export interface CartItem extends OrderLine {
  product: Product;
  variant?: ProductVariant;
}

export interface KdsTicket {
  id: string;
  orderId: string;
  stationTag: string;
  items: KdsItem[];
  status: 'new' | 'in-progress' | 'done';
  createdAt: Date;
  estimatedTime?: number;
}

export interface KdsItem {
  productName: string;
  variantName?: string;
  quantity: number;
  modifiers: string[];
  notes?: string;
}

// Inventory
export type StockLevel = 'critical' | 'low' | 'optimal' | 'overstock';
export type ExpiryStatus = 'expired' | 'expiring' | 'fresh';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  unitCost: number;
  currentQuantity: number;
  reorderPoint: number;
  parLevel: number;
  averageDailyUsage: number;
  coverageDays: number;
  lastUpdated: string;
  expiryDate: string;
  daysUntilExpiry: number;
  expiryStatus: ExpiryStatus;
  stockStatus: StockLevel;
  fefoBatch: string;
  fefoSequence: number;
  supplier: string;
  storageLocation: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  sku: string;
  type: 'receiving' | 'transfer' | 'adjustment' | 'waste';
  quantity: number;
  unit: string;
  reference: string;
  performedBy: string;
  timestamp: string;
  sourceOrDestination: string;
  notes?: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface InventoryCountSchedule {
  id: string;
  name: string;
  scheduledFor: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  countedBy: string[];
  variance: number;
  lastCounted?: string;
  focusAreas: string[];
}

export interface InventoryBatch {
  id: string;
  itemId: string;
  sku: string;
  batchNumber: string;
  supplier: string;
  receivedOn: string;
  expiryDate: string;
  daysUntilExpiry: number;
  quantity: number;
  unit: string;
  remainingUnits: number;
  fefoRank: number;
  status: ExpiryStatus;
  storageLocation: string;
}

export interface InventoryAlert {
  id: string;
  name: string;
  sku: string;
  stockStatus: StockLevel;
  expiryStatus: ExpiryStatus;
  currentQuantity: number;
  reorderPoint: number;
  daysUntilExpiry: number;
  fefoBatch: string;
  message: string;
}

// App routing
export interface AppConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  roles: UserRole[];
  isFavorite?: boolean;
  hasNotifications?: boolean;
  isPWA?: boolean;
}

// Motion and UI
export interface MotionPresets {
  routeTransition: {
    duration: number;
    ease: string;
  };
  itemStagger: {
    delay: number;
    duration: number;
  };
  pressScale: {
    scale: number;
    duration: number;
  };
}