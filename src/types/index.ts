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

// Inventory domain
export type InventoryMovementType =
  | 'receipt'
  | 'transfer'
  | 'adjustment'
  | 'sale'
  | 'waste';

export type InventoryBatchStatus = 'healthy' | 'warning' | 'critical';

export type InventoryCountStatus = 'scheduled' | 'in-progress' | 'completed';

export type InventoryAlertType = 'reorder' | 'expiry';

export type InventoryAlertSeverity = 'warning' | 'danger';

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  uom: string;
  supplier: string;
  parLevel: number;
  reorderPoint: number;
  onHand: number;
  allocated: number;
  available: number;
  avgDailyUsage: number;
  cost: number;
  lastMovementAt: string;
  lastCountAt: string;
  fefoEnabled: boolean;
  batches: string[];
}

export interface InventoryBatch {
  id: string;
  sku: string;
  lotCode: string;
  supplier: string;
  receivedAt: string;
  expiryDate: string;
  quantity: number;
  remaining: number;
  fefoOrder: number;
}

export interface InventoryBatchWithMeta extends InventoryBatch {
  daysUntilExpiry: number;
  status: InventoryBatchStatus;
}

export interface InventoryMovement {
  id: string;
  sku: string;
  type: InventoryMovementType;
  reference: string;
  quantity: number;
  uom: string;
  createdAt: string;
  source?: string;
  destination?: string;
  note?: string;
}

export interface InventoryCount {
  id: string;
  name: string;
  scheduledFor: string;
  status: InventoryCountStatus;
  assignee: string;
  variance?: number;
}

export interface InventoryAlert {
  sku: string;
  name: string;
  type: InventoryAlertType;
  severity: InventoryAlertSeverity;
  message: string;
  available?: number;
  reorderPoint?: number;
  lotCode?: string;
  daysUntilExpiry?: number;
}

export interface InventoryKpis {
  totalSkus: number;
  onHandValue: number;
  lowStock: number;
  nearExpiry: number;
}