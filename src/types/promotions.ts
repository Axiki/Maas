export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'expired';

export type PromotionChannel = 'pos' | 'online' | 'kiosk' | 'delivery';

export type PromotionAudience = 'all' | 'loyalty' | 'new-customers' | 'staff';

export type PromotionWeekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type PromotionRewardType = 'percentage' | 'amount' | 'bogo' | 'bundle';

export interface PercentageReward {
  type: 'percentage';
  value: number;
  appliesTo: 'order' | 'category' | 'items';
  maxDiscount?: number;
}

export interface AmountReward {
  type: 'amount';
  value: number;
  currency: string;
  appliesTo: 'order' | 'items';
}

export interface BogoReward {
  type: 'bogo';
  buyQuantity: number;
  getQuantity: number;
  productIds: string[];
  discountType: 'percentage' | 'amount';
  discountValue: number;
}

export interface BundleReward {
  type: 'bundle';
  bundlePrice: number;
  productIds: string[];
  minimumItems: number;
}

export type PromotionReward =
  | PercentageReward
  | AmountReward
  | BogoReward
  | BundleReward;

export interface PromotionEligibility {
  channels: PromotionChannel[];
  audience: PromotionAudience;
  minimumSpend?: number;
  maximumRedemptions?: number;
  requiredTags: string[];
  excludedTags: string[];
  includedProducts: string[];
  excludedProducts: string[];
}

export interface PromotionSchedule {
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek: PromotionWeekday[];
  timezone: string;
  isAllDay: boolean;
}

export interface PromotionStacking {
  stackable: boolean;
  exclusivityLevel: 'single-use' | 'category-exclusive' | 'no-limit';
  conflictsWith: string[];
  priority: number;
  notes?: string;
}

export interface PromotionPerformance {
  redemptionCount: number;
  revenueImpact: number;
  lastTriggeredAt?: string;
}

export interface PromotionCampaign {
  id: string;
  name: string;
  description: string;
  status: PromotionStatus;
  reward: PromotionReward;
  eligibility: PromotionEligibility;
  schedule: PromotionSchedule;
  stacking: PromotionStacking;
  metrics: PromotionPerformance;
  tags: string[];
  lastEditedBy: string;
  updatedAt: string;
}
