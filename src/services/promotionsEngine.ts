import {
  AppliedPromotion,
  CartItem,
  IneligiblePromotion,
  Promotion,
  PromotionAmountRule,
  PromotionBxgyRule,
  PromotionBundleRule,
  PromotionEvaluationContext,
  PromotionEvaluationResult,
  PromotionPercentRule,
  PromotionQuantityCondition,
  PromotionRewardCondition,
  PromotionTarget,
  SelectedModifier
} from '../types';

type EligibilityResult = {
  eligible: boolean;
  reason?: string;
  detail?: string;
  suggestion?: string;
};

type UnitSlice = {
  itemId: string;
  unitPrice: number;
};

type AllocationResult = {
  allocations: Map<string, number>;
  totalDiscount: number;
};

type PromotionApplication = {
  applied: boolean;
  adjustments?: Map<string, number>;
  totalDiscount?: number;
  unitsConsumed?: Map<string, number>;
  summary?: string;
  reason?: string;
  detail?: string;
  suggestion?: string;
};

interface LineMeta {
  item: CartItem;
  netTotal: number;
  unitNet: number;
  quantity: number;
}

const roundCurrency = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const formatCurrency = (value: number): string => `$${roundCurrency(value).toFixed(2)}`;

const parseTimeToMinutes = (value?: string): number | undefined => {
  if (!value) return undefined;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined;
  return hours * 60 + minutes;
};

const matchesTarget = (item: CartItem, target: PromotionTarget): boolean => {
  switch (target.type) {
    case 'ORDER':
      return true;
    case 'CATEGORY':
      return target.categoryIds.includes(item.product.categoryId);
    case 'PRODUCT': {
      if (target.variantIds && item.variantId && target.variantIds.includes(item.variantId)) {
        return true;
      }
      if (target.productIds && target.productIds.includes(item.productId)) {
        return true;
      }
      return false;
    }
    default:
      return false;
  }
};

const matchesCondition = (item: CartItem, condition: PromotionQuantityCondition): boolean => {
  if (condition.variantId && condition.variantId !== item.variantId) {
    return false;
  }
  if (condition.productId && condition.productId !== item.productId) {
    return false;
  }
  if (condition.categoryId && condition.categoryId !== item.product.categoryId) {
    return false;
  }
  return true;
};

const collectUnits = (
  items: CartItem[],
  condition: PromotionQuantityCondition,
  lineMeta: Map<string, LineMeta>,
  unitAvailability: Map<string, number>,
  lineRemaining: Map<string, number>
): UnitSlice[] => {
  const units: UnitSlice[] = [];
  items.forEach((item) => {
    if (!matchesCondition(item, condition)) return;
    const meta = lineMeta.get(item.id);
    if (!meta) return;
    const remainingUnits = Math.min(unitAvailability.get(item.id) ?? meta.quantity, meta.quantity);
    if (remainingUnits <= 0) return;
    const remainingAmount = Math.max(lineRemaining.get(item.id) ?? meta.netTotal, 0);
    const unitPrice = remainingUnits > 0 ? remainingAmount / remainingUnits : 0;
    for (let idx = 0; idx < remainingUnits; idx += 1) {
      units.push({ itemId: item.id, unitPrice });
    }
  });
  units.sort((a, b) => b.unitPrice - a.unitPrice);
  return units;
};

const allocateDiscountAcrossUnits = (units: UnitSlice[], discountAmount: number): AllocationResult => {
  if (units.length === 0 || discountAmount <= 0) {
    return { allocations: new Map(), totalDiscount: 0 };
  }
  const allocations = new Map<string, number>();
  const baseTotal = units.reduce((sum, unit) => sum + unit.unitPrice, 0);
  if (baseTotal <= 0) {
    return { allocations: new Map(), totalDiscount: 0 };
  }
  const cappedDiscount = Math.min(discountAmount, baseTotal);
  let allocatedTotal = 0;

  units.forEach((unit, index) => {
    const share = unit.unitPrice / baseTotal;
    let amount = roundCurrency(cappedDiscount * share);
    const remaining = roundCurrency(cappedDiscount - allocatedTotal);
    if (index === units.length - 1) {
      amount = remaining;
    }
    if (amount > 0) {
      allocations.set(unit.itemId, roundCurrency((allocations.get(unit.itemId) ?? 0) + amount));
      allocatedTotal = roundCurrency(allocatedTotal + amount);
    }
  });

  return { allocations, totalDiscount: roundCurrency(allocatedTotal) };
};

const mergeAllocationMaps = (target: Map<string, number>, addition: Map<string, number>): void => {
  addition.forEach((value, key) => {
    target.set(key, roundCurrency((target.get(key) ?? 0) + value));
  });
};

const checkConstraints = (
  promotion: Promotion,
  context: PromotionEvaluationContext,
  orderSubtotal: number,
  now: Date
): EligibilityResult => {
  const { constraints } = promotion;
  if (!constraints) {
    return { eligible: true };
  }

  if (constraints.start) {
    const startDate = new Date(constraints.start);
    if (Number.isFinite(startDate.getTime()) && now < startDate) {
      return {
        eligible: false,
        reason: 'Not started yet',
        detail: `Starts on ${startDate.toLocaleDateString()}`,
        suggestion: `This deal activates on ${startDate.toLocaleDateString()}.`
      };
    }
  }

  if (constraints.end) {
    const endDate = new Date(constraints.end);
    if (Number.isFinite(endDate.getTime()) && now > endDate) {
      return {
        eligible: false,
        reason: 'Promotion expired',
        detail: `Ended on ${endDate.toLocaleDateString()}`
      };
    }
  }

  if (constraints.days && constraints.days.length > 0 && !constraints.days.includes(now.getDay())) {
    return {
      eligible: false,
      reason: 'Not available today',
      detail: 'This promotion runs on selected days only.'
    };
  }

  const startMinutes = parseTimeToMinutes(constraints.startTime);
  const endMinutes = parseTimeToMinutes(constraints.endTime);
  if (startMinutes !== undefined && endMinutes !== undefined) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      return {
        eligible: false,
        reason: 'Outside active hours',
        detail: `Available between ${constraints.startTime} and ${constraints.endTime}.`
      };
    }
  }

  if (constraints.stores && constraints.stores.length > 0) {
    if (!context.storeId) {
      return {
        eligible: false,
        reason: 'Select a register',
        detail: 'Choose a store to check location-based promotions.'
      };
    }
    if (!constraints.stores.includes(context.storeId)) {
      return {
        eligible: false,
        reason: 'Not available at this location',
        detail: 'This deal is limited to specific stores.'
      };
    }
  }

  if (constraints.orderTypes && !constraints.orderTypes.includes(context.orderType)) {
    return {
      eligible: false,
      reason: 'Order type not eligible',
      detail: 'Switch order type to unlock this promotion.'
    };
  }

  if (constraints.requiredCustomerTags && constraints.requiredCustomerTags.length > 0) {
    const tags = context.customer?.tags ?? [];
    const hasMatch = constraints.requiredCustomerTags.some((tag: string) => tags.includes(tag));
    if (!hasMatch) {
      return {
        eligible: false,
        reason: 'Customer not eligible',
        detail: 'Assign a customer with the required tag to apply this promotion.'
      };
    }
  }

  if (constraints.requiredCustomerGroups && constraints.requiredCustomerGroups.length > 0) {
    const groups = context.customer?.groups ?? [];
    const hasMatch = constraints.requiredCustomerGroups.some((group: string) => groups.includes(group));
    if (!hasMatch) {
      return {
        eligible: false,
        reason: 'Customer group required',
        detail: 'Link a customer from the eligible group to apply this promotion.'
      };
    }
  }

  if (constraints.requiredLoyaltyTier) {
    const tier = context.customer?.loyaltyTier;
    if (!tier || tier.toLowerCase() !== constraints.requiredLoyaltyTier.toLowerCase()) {
      return {
        eligible: false,
        reason: 'Loyalty tier required',
        detail: `Requires ${constraints.requiredLoyaltyTier} tier or higher.`
      };
    }
  }

  if (constraints.minSubtotal !== undefined && orderSubtotal + 0.001 < constraints.minSubtotal) {
    const difference = roundCurrency(constraints.minSubtotal - orderSubtotal);
    return {
      eligible: false,
      reason: 'Minimum subtotal not met',
      detail: `Requires at least ${formatCurrency(constraints.minSubtotal)} in eligible items.`,
      suggestion: `Spend ${formatCurrency(difference)} more to unlock ${promotion.name}.`
    };
  }

  if (constraints.maxSubtotal !== undefined && orderSubtotal - 0.001 > constraints.maxSubtotal) {
    return {
      eligible: false,
      reason: 'Subtotal exceeds limit',
      detail: `Valid up to ${formatCurrency(constraints.maxSubtotal)}.`
    };
  }

  return { eligible: true };
};

const applyPercentPromotion = (
  rule: PromotionPercentRule,
  items: CartItem[],
  lineMeta: Map<string, LineMeta>,
  lineRemaining: Map<string, number>,
  maxRedemptions?: number
): PromotionApplication => {
  const eligibleItems = items.filter((item) => matchesTarget(item, rule.target));
  if (eligibleItems.length === 0) {
    return {
      applied: false,
      reason: 'No matching items',
      detail: 'Add qualifying items to apply this promotion.'
    };
  }

  const availableTotal = eligibleItems.reduce((sum, item) => sum + Math.max(lineRemaining.get(item.id) ?? 0, 0), 0);
  if (availableTotal <= 0) {
    return {
      applied: false,
      reason: 'Items already discounted',
      detail: 'There is no remaining value to discount on these items.'
    };
  }

  const rawDiscount = roundCurrency((availableTotal * rule.value) / 100);
  const discountAmount = rule.capAmount ? Math.min(rawDiscount, rule.capAmount) : rawDiscount;
  if (discountAmount <= 0) {
    return { applied: false, reason: 'No discount value calculated' };
  }

  const allUnits: UnitSlice[] = [];
  eligibleItems.forEach((item) => {
    const meta = lineMeta.get(item.id);
    if (!meta || meta.quantity <= 0) return;
    const remainingAmount = Math.max(lineRemaining.get(item.id) ?? 0, 0);
    const unitPrice = meta.quantity > 0 ? remainingAmount / meta.quantity : 0;
    for (let idx = 0; idx < meta.quantity; idx += 1) {
      allUnits.push({ itemId: item.id, unitPrice });
    }
  });
  allUnits.sort((a, b) => b.unitPrice - a.unitPrice);
  const unitsToDiscount = typeof maxRedemptions === 'number' ? allUnits.slice(0, maxRedemptions) : allUnits;
  const allocation = allocateDiscountAcrossUnits(unitsToDiscount, discountAmount);

  if (allocation.totalDiscount <= 0) {
    return {
      applied: false,
      reason: 'No discount value calculated'
    };
  }

  return {
    applied: true,
    adjustments: allocation.allocations,
    totalDiscount: allocation.totalDiscount,
    summary: `${rule.value}% off`
  };
};

const applyAmountPromotion = (
  rule: PromotionAmountRule,
  items: CartItem[],
  lineMeta: Map<string, LineMeta>,
  lineRemaining: Map<string, number>,
  maxRedemptions?: number
): PromotionApplication => {
  const eligibleItems = items.filter((item) => matchesTarget(item, rule.target));
  if (eligibleItems.length === 0) {
    return {
      applied: false,
      reason: 'No matching items',
      detail: 'Add qualifying items to apply this promotion.'
    };
  }

  const availableTotal = eligibleItems.reduce((sum, item) => sum + Math.max(lineRemaining.get(item.id) ?? 0, 0), 0);
  if (availableTotal <= 0) {
    return {
      applied: false,
      reason: 'Items already discounted',
      detail: 'There is no remaining value to discount on these items.'
    };
  }

  const discountAmount = Math.min(rule.value, availableTotal);
  if (discountAmount <= 0) {
    return { applied: false, reason: 'No discount value calculated' };
  }

  const allUnits: UnitSlice[] = [];
  eligibleItems.forEach((item) => {
    const meta = lineMeta.get(item.id);
    if (!meta || meta.quantity <= 0) return;
    const remainingAmount = Math.max(lineRemaining.get(item.id) ?? 0, 0);
    const unitPrice = meta.quantity > 0 ? remainingAmount / meta.quantity : 0;
    for (let idx = 0; idx < meta.quantity; idx += 1) {
      allUnits.push({ itemId: item.id, unitPrice });
    }
  });
  allUnits.sort((a, b) => b.unitPrice - a.unitPrice);
  const unitsToDiscount = typeof maxRedemptions === 'number' ? allUnits.slice(0, maxRedemptions) : allUnits;
  const allocation = allocateDiscountAcrossUnits(unitsToDiscount, discountAmount);

  if (allocation.totalDiscount <= 0) {
    return { applied: false, reason: 'No discount value calculated' };
  }

  return {
    applied: true,
    adjustments: allocation.allocations,
    totalDiscount: allocation.totalDiscount,
    summary: `-${formatCurrency(discountAmount)}`
  };
};

const applyBundlePromotion = (
  rule: PromotionBundleRule,
  items: CartItem[],
  lineMeta: Map<string, LineMeta>,
  lineRemaining: Map<string, number>,
  unitAvailability: Map<string, number>,
  maxRedemptions?: number
): PromotionApplication => {
  if (rule.bundleItems.length === 0) {
    return { applied: false, reason: 'Bundle items not configured' };
  }

  const requirementUnits = rule.bundleItems.map((req: PromotionQuantityCondition) => ({
    requirement: req,
    units: collectUnits(items, req, lineMeta, unitAvailability, lineRemaining)
  }));

  const maxBundles = requirementUnits.reduce((limit: number, entry) => {
    const available = entry.units.length;
    const possible = Math.floor(available / entry.requirement.quantity);
    return Math.min(limit, possible);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(maxBundles) || maxBundles <= 0) {
    return {
      applied: false,
      reason: 'Missing bundle items',
      detail: 'Add the remaining bundle items to unlock this price.',
      suggestion: 'Add required bundle items to apply this deal.'
    };
  }

  const bundlesToApply = typeof maxRedemptions === 'number' ? Math.min(maxBundles, maxRedemptions) : maxBundles;
  const allocations = new Map<string, number>();
  const unitsConsumed = new Map<string, number>();
  let totalDiscount = 0;

  for (let bundleIndex = 0; bundleIndex < bundlesToApply; bundleIndex += 1) {
    const selectedUnits: UnitSlice[] = [];
    let canFulfill = true;

    requirementUnits.forEach((entry) => {
      if (!canFulfill) return;
      const take = entry.units.splice(0, entry.requirement.quantity);
      if (take.length < entry.requirement.quantity) {
        canFulfill = false;
        return;
      }
      selectedUnits.push(...take);
      take.forEach((unit: UnitSlice) => {
        unitsConsumed.set(unit.itemId, (unitsConsumed.get(unit.itemId) ?? 0) + 1);
      });
    });

    if (!canFulfill || selectedUnits.length === 0) {
      break;
    }

    const bundleValue = selectedUnits.reduce((sum, unit) => sum + unit.unitPrice, 0);
    const discountForBundle = roundCurrency(Math.max(bundleValue - rule.bundlePrice, 0));
    if (discountForBundle <= 0) {
      continue;
    }

    const allocation = allocateDiscountAcrossUnits(selectedUnits, discountForBundle);
    if (allocation.totalDiscount <= 0) {
      continue;
    }

    mergeAllocationMaps(allocations, allocation.allocations);
    totalDiscount = roundCurrency(totalDiscount + allocation.totalDiscount);
  }

  if (totalDiscount <= 0) {
    return {
      applied: false,
      reason: 'Bundle savings unavailable',
      detail: 'Bundle price is not lower than current cart total for the items.'
    };
  }

  return {
    applied: true,
    adjustments: allocations,
    totalDiscount,
    unitsConsumed,
    summary: `Bundle price ${formatCurrency(rule.bundlePrice)}`
  };
};

const resolveBxgyDiscount = (unitPrice: number, reward: PromotionRewardCondition): number => {
  const type = reward.rewardType ?? (reward.value !== undefined ? 'PRICE' : 'FREE');
  switch (type) {
    case 'PRICE':
      return Math.max(unitPrice - (reward.value ?? 0), 0);
    case 'PERCENT':
      return Math.max((unitPrice * (reward.value ?? 0)) / 100, 0);
    case 'AMOUNT':
      return Math.min(reward.value ?? 0, unitPrice);
    case 'FREE':
    default:
      return unitPrice;
  }
};

const applyBxgyPromotion = (
  rule: PromotionBxgyRule,
  items: CartItem[],
  lineMeta: Map<string, LineMeta>,
  lineRemaining: Map<string, number>,
  unitAvailability: Map<string, number>,
  maxRedemptions?: number
): PromotionApplication => {
  if (rule.buy.quantity <= 0 || rule.get.quantity <= 0) {
    return { applied: false, reason: 'Invalid quantities configured' };
  }

  const buyUnits = collectUnits(items, rule.buy, lineMeta, unitAvailability, lineRemaining);
  const rewardUnits = collectUnits(items, rule.get, lineMeta, unitAvailability, lineRemaining);

  if (buyUnits.length < rule.buy.quantity) {
    const missing = rule.buy.quantity - buyUnits.length;
    return {
      applied: false,
      reason: 'Buy quantity not met',
      detail: `Add ${missing} more qualifying item${missing !== 1 ? 's' : ''} to unlock this deal.`,
      suggestion: 'Add qualifying items to redeem the promotion.'
    };
  }

  const possibleGroups = Math.floor(buyUnits.length / rule.buy.quantity);
  const rewardGroups = Math.floor(rewardUnits.length / rule.get.quantity);
  const groups = Math.min(possibleGroups, rewardGroups);

  if (groups <= 0) {
    return {
      applied: false,
      reason: 'Reward items missing',
      detail: 'Add the reward item to the cart to redeem this promotion.'
    };
  }

  const redemptions = typeof maxRedemptions === 'number' ? Math.min(groups, maxRedemptions) : groups;
  const unitsToReward = rewardUnits.slice(0, redemptions * rule.get.quantity);
  const allocations = new Map<string, number>();
  const unitsConsumed = new Map<string, number>();
  let totalDiscount = 0;

  unitsToReward.forEach((unit) => {
    const availableAmount = Math.max(lineRemaining.get(unit.itemId) ?? 0, 0);
    if (availableAmount <= 0) {
      return;
    }
    const discount = roundCurrency(Math.min(resolveBxgyDiscount(unit.unitPrice, rule.get), availableAmount));
    if (discount <= 0) {
      return;
    }
    allocations.set(unit.itemId, roundCurrency((allocations.get(unit.itemId) ?? 0) + discount));
    unitsConsumed.set(unit.itemId, (unitsConsumed.get(unit.itemId) ?? 0) + 1);
    totalDiscount = roundCurrency(totalDiscount + discount);
  });

  if (totalDiscount <= 0) {
    return {
      applied: false,
      reason: 'No reward discount available',
      detail: 'Reward items already fully discounted.'
    };
  }

  return {
    applied: true,
    adjustments: allocations,
    totalDiscount,
    unitsConsumed,
    summary: 'Buy X Get Y applied'
  };
};

const applyPromotion = (
  promotion: Promotion,
  items: CartItem[],
  lineMeta: Map<string, LineMeta>,
  lineRemaining: Map<string, number>,
  unitAvailability: Map<string, number>
): PromotionApplication => {
  const maxRedemptions = promotion.constraints?.maxRedemptionsPerOrder;

  switch (promotion.rule.type) {
    case 'PERCENT':
      return applyPercentPromotion(promotion.rule, items, lineMeta, lineRemaining, maxRedemptions);
    case 'AMOUNT':
      return applyAmountPromotion(promotion.rule, items, lineMeta, lineRemaining, maxRedemptions);
    case 'BUNDLE':
      return applyBundlePromotion(
        promotion.rule,
        items,
        lineMeta,
        lineRemaining,
        unitAvailability,
        maxRedemptions
      );
    case 'BXGY':
      return applyBxgyPromotion(
        promotion.rule,
        items,
        lineMeta,
        lineRemaining,
        unitAvailability,
        maxRedemptions
      );
    default:
      return { applied: false, reason: 'Unsupported promotion type' };
  }
};

export const evaluatePromotions = (
  context: PromotionEvaluationContext
): PromotionEvaluationResult => {
  const items = context.items ?? [];
  const promotions = (context.promotions ?? []).filter((promotion: Promotion) => promotion.status === 'active');
  const now = context.now ?? new Date();

  const lineMeta = new Map<string, LineMeta>();
  const lineRemaining = new Map<string, number>();
  const unitAvailability = new Map<string, number>();

  items.forEach((item: CartItem) => {
    const modifierTotal = item.modifiers.reduce((sum: number, mod: SelectedModifier) => sum + mod.price, 0);
    const baseSubtotal = (item.price + modifierTotal) * item.quantity;
    const manualDiscount = item.discount ?? 0;
    const netTotal = Math.max(0, roundCurrency(baseSubtotal - manualDiscount));
    const unitNet = item.quantity > 0 ? netTotal / item.quantity : 0;

    const meta: LineMeta = {
      item,
      netTotal,
      unitNet,
      quantity: item.quantity
    };
    lineMeta.set(item.id, meta);
    lineRemaining.set(item.id, netTotal);
    unitAvailability.set(item.id, item.quantity);
  });

  const orderSubtotal =
    context.orderSubtotal ?? Array.from(lineMeta.values()).reduce((sum, meta) => sum + meta.netTotal, 0);

  const adjustments: Record<string, number> = {};
  const appliedPromotions: AppliedPromotion[] = [];
  const ineligiblePromotions: IneligiblePromotion[] = [];
  let totalDiscount = 0;
  let exclusiveApplied = false;

  const sortedPromotions = [...promotions].sort((a, b) => a.priority - b.priority);

  sortedPromotions.forEach((promotion) => {
    if (exclusiveApplied) {
      ineligiblePromotions.push({
        promotionId: promotion.id,
        name: promotion.name,
        reason: 'Blocked by another exclusive promotion',
        detail: 'Remove the existing deal to use this promotion.'
      });
      return;
    }

    const eligibility = checkConstraints(promotion, context, orderSubtotal, now);
    if (!eligibility.eligible) {
      ineligiblePromotions.push({
        promotionId: promotion.id,
        name: promotion.name,
        reason: eligibility.reason ?? 'Not eligible',
        detail: eligibility.detail,
        suggestion: eligibility.suggestion
      });
      return;
    }

    const application = applyPromotion(
      promotion,
      items,
      lineMeta,
      lineRemaining,
      unitAvailability
    );

    if (!application.applied || !application.adjustments || !application.totalDiscount) {
      ineligiblePromotions.push({
        promotionId: promotion.id,
        name: promotion.name,
        reason: application.reason ?? 'Not eligible',
        detail: application.detail,
        suggestion: application.suggestion
      });
      return;
    }

    application.adjustments.forEach((amount, itemId) => {
      if (amount <= 0) return;
      adjustments[itemId] = roundCurrency((adjustments[itemId] ?? 0) + amount);
      const currentRemaining = Math.max(lineRemaining.get(itemId) ?? 0, 0);
      lineRemaining.set(itemId, Math.max(0, roundCurrency(currentRemaining - amount)));
    });

    if (application.unitsConsumed) {
      application.unitsConsumed.forEach((units, itemId) => {
        const currentUnits = unitAvailability.get(itemId) ?? 0;
        unitAvailability.set(itemId, Math.max(0, currentUnits - units));
      });
    }

    totalDiscount = roundCurrency(totalDiscount + application.totalDiscount);
    appliedPromotions.push({
      promotionId: promotion.id,
      name: promotion.name,
      discount: application.totalDiscount,
      stackable: promotion.stackable,
      summary: application.summary
    });

    if (!promotion.stackable) {
      exclusiveApplied = true;
    }
  });

  return {
    adjustments,
    totalDiscount,
    appliedPromotions,
    ineligiblePromotions
  };
};

export default evaluatePromotions;
