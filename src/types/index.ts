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

// Observability & telemetry
export type IncidentSeverity = 'info' | 'warning' | 'critical';

export type ObservabilityScope = 'portal' | 'backoffice' | 'pos' | 'global';

export interface ObservabilityAlert {
  id: string;
  title: string;
  message: string;
  severity: IncidentSeverity;
  type: 'sync' | 'availability' | 'performance' | 'data';
  incidentId?: string;
  createdAt: string;
  acknowledged?: boolean;
  scopes: ObservabilityScope[];
  metadata?: Record<string, unknown>;
}

export interface SyncHealth {
  status: 'healthy' | 'degraded' | 'failed';
  summary: string;
  pendingItems?: number;
  lastSuccessfulSync?: string;
  impactedStores?: string[];
}

export interface TelemetrySnapshot {
  fetchedAt: string;
  alerts: ObservabilityAlert[];
  syncHealth: SyncHealth;
}

export interface ApiResponseMeta {
  correlationId?: string;
  fallbackIncidentId?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  incidentId?: string;
  meta?: ApiResponseMeta;
}