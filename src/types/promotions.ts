export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'archived';

export type PromotionRewardType = 'percentage' | 'amount' | 'bogo' | 'free-item';
export type PromotionApplyScope = 'entire-order' | 'category' | 'product';
export type PromotionOrderType = 'dine-in' | 'takeaway' | 'delivery';
export type PromotionWeekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface PromotionPreviewBadge {
  id: string;
  label: string;
  tone: 'discount' | 'reward' | 'info';
  description?: string;
}

export interface PromotionEligibility {
  minimumSubtotal?: number;
  minimumQuantity?: number;
  requiredProductIds?: string[];
  excludedProductIds?: string[];
  customerSegments: string[];
  orderTypes: PromotionOrderType[];
  storeScopes: string[];
  notes?: string;
}

export interface PromotionReward {
  type: PromotionRewardType;
  value?: number;
  buyQuantity?: number;
  getQuantity?: number;
  appliesTo: PromotionApplyScope;
  targetProductIds?: string[];
  targetCategoryIds?: string[];
  description?: string;
}

export interface PromotionScheduleWindow {
  id: string;
  days: PromotionWeekday[];
  startTime: string;
  endTime: string;
}

export interface PromotionSchedule {
  startDate?: string;
  endDate?: string;
  timezone: string;
  windows: PromotionScheduleWindow[];
  isAlwaysOn?: boolean;
}

export interface PromotionStacking {
  allowWithOtherCampaigns: boolean;
  stackWithSameCampaign: boolean;
  maxUsesPerOrder?: number;
  maxUsesPerCustomer?: number;
  blockedCampaignIds?: string[];
  notes?: string;
}

export interface PromotionRule {
  id: string;
  name: string;
  description?: string;
  eligibility: PromotionEligibility;
  reward: PromotionReward;
  schedule: PromotionSchedule;
  stacking: PromotionStacking;
}

export interface PromotionCampaign {
  id: string;
  name: string;
  type: 'order-discount' | 'item-discount' | 'combo' | 'loyalty';
  status: PromotionStatus;
  summary: string;
  priority: number;
  tags: string[];
  owner: string;
  lastUpdated: string;
  rules: PromotionRule[];
  previewBadges?: PromotionPreviewBadge[];
}
