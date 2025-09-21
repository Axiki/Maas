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
  tags?: string[];
  groups?: string[];
  loyaltyTier?: string;
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

// Promotions
export type PromotionType = 'PERCENT' | 'AMOUNT' | 'BXGY' | 'BUNDLE';

export type PromotionTarget =
  | { type: 'ORDER' }
  | { type: 'CATEGORY'; categoryIds: string[] }
  | { type: 'PRODUCT'; productIds?: string[]; variantIds?: string[] };

export interface PromotionQuantityCondition {
  productId?: string;
  variantId?: string;
  categoryId?: string;
  quantity: number;
}

export type PromotionRewardType = 'FREE' | 'PRICE' | 'PERCENT' | 'AMOUNT';

export interface PromotionRewardCondition extends PromotionQuantityCondition {
  rewardType?: PromotionRewardType;
  value?: number;
}

export interface PromotionPercentRule {
  type: 'PERCENT';
  target: PromotionTarget;
  value: number;
  capAmount?: number;
}

export interface PromotionAmountRule {
  type: 'AMOUNT';
  target: PromotionTarget;
  value: number;
}

export interface PromotionBxgyRule {
  type: 'BXGY';
  buy: PromotionQuantityCondition;
  get: PromotionRewardCondition;
}

export interface PromotionBundleRule {
  type: 'BUNDLE';
  bundleItems: PromotionQuantityCondition[];
  bundlePrice: number;
}

export type PromotionRule =
  | PromotionPercentRule
  | PromotionAmountRule
  | PromotionBxgyRule
  | PromotionBundleRule;

export interface PromotionConstraint {
  start?: string;
  end?: string;
  days?: number[];
  startTime?: string;
  endTime?: string;
  stores?: string[];
  orderTypes?: ('dine-in' | 'takeaway' | 'delivery')[];
  minSubtotal?: number;
  maxSubtotal?: number;
  requiredCustomerTags?: string[];
  requiredCustomerGroups?: string[];
  requiredLoyaltyTier?: string;
  maxRedemptionsPerOrder?: number;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  priority: number;
  stackable: boolean;
  status: 'active' | 'scheduled' | 'draft';
  rule: PromotionRule;
  constraints?: PromotionConstraint;
}

export interface AppliedPromotion {
  promotionId: string;
  name: string;
  discount: number;
  stackable: boolean;
  summary?: string;
}

export interface IneligiblePromotion {
  promotionId: string;
  name: string;
  reason: string;
  detail?: string;
  suggestion?: string;
}

export interface PromotionEvaluationContext {
  items: CartItem[];
  promotions: Promotion[];
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  customer?: Customer | null;
  storeId?: string;
  orderSubtotal?: number;
  now?: Date;
}

export interface PromotionEvaluationResult {
  adjustments: Record<string, number>;
  totalDiscount: number;
  appliedPromotions: AppliedPromotion[];
  ineligiblePromotions: IneligiblePromotion[];
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