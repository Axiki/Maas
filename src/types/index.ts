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

export interface CustomerVisit {
  date: string;
  storeId: string;
  orderId: string;
  channel: 'dine-in' | 'takeaway' | 'delivery';
  totalSpend: number;
  pointsEarned: number;
  pointsRedeemed?: number;
}

export interface LoyaltyExpiration {
  points: number;
  expiresOn: string;
}

export interface LoyaltyActivity {
  id: string;
  type: 'earn' | 'redeem' | 'adjust';
  points: number;
  balanceAfter: number;
  date: string;
  reference?: string;
  note?: string;
}

export interface LoyaltyAccount {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  lifetimePoints: number;
  pointsToNextReward: number;
  lastEarnedOn?: string;
  lastRedeemedOn?: string;
  expiring?: LoyaltyExpiration[];
  history: LoyaltyActivity[];
}

export interface StoreCreditLedgerEntry {
  id: string;
  type: 'issue' | 'redeem' | 'expire' | 'adjust';
  amount: number;
  balanceAfter: number;
  date: string;
  reference?: string;
  note?: string;
}

export interface StoreCreditAccount {
  id: string;
  balance: number;
  issuedOn: string;
  expiresOn?: string;
  lastUsedOn?: string;
  ledger: StoreCreditLedgerEntry[];
}

export type GiftCardStatus = 'active' | 'redeemed' | 'void';

export interface GiftCardTransaction {
  id: string;
  type: 'issue' | 'redeem' | 'refund' | 'adjust';
  amount: number;
  balanceAfter: number;
  date: string;
  reference?: string;
  note?: string;
}

export interface GiftCard {
  code: string;
  originalValue: number;
  balance: number;
  status: GiftCardStatus;
  issuedOn: string;
  expiresOn?: string;
  lastUsedOn?: string;
  purchaseStoreId: string;
  recipientName?: string;
  transactions: GiftCardTransaction[];
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  birthday?: string;
  tags?: string[];
  notes?: string;
  loyaltyPoints: number;
  storeCreditBalance: number;
  visits: CustomerVisit[];
  loyalty: LoyaltyAccount;
  storeCredits: StoreCreditAccount[];
  giftCards: GiftCard[];
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