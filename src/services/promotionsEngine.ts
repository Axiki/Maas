import { CartItem, Customer } from '../types';

export type PromotionChannel = 'pos' | 'online' | 'kiosk' | 'delivery' | 'any';
export type PromotionType = 'percentage' | 'fixed' | 'bxgy' | 'bundle';
export type PromotionScope = 'item' | 'cart';

export interface PromotionDefinition {
  id: string;
  name: string;
  description?: string;
  type: PromotionType;
  stackable: boolean;
  scope?: PromotionScope;
  priority?: number;
  channels?: PromotionChannel[];
  startAt?: string | Date;
  endAt?: string | Date;
  maxApplications?: number;
  constraints?: {
    minQuantity?: number;
    minSpend?: number;
    productIds?: string[];
    orderTypes?: Array<'dine-in' | 'takeaway' | 'delivery'>;
    customerIds?: string[];
  };
  reward: {
    percentage?: number;
    amount?: number;
    buyQuantity?: number;
    getQuantity?: number;
    bundlePrice?: number;
  };
}

export interface PromotionItemDetail {
  itemId: string;
  itemName: string;
  promotionId: string;
  promotionName: string;
  savings: number;
  quantity: number;
  stackable: boolean;
  type: PromotionType;
}

export interface AppliedPromotion {
  id: string;
  name: string;
  description?: string;
  stackable: boolean;
  type: PromotionType;
  savings: number;
  reason: string;
  details: PromotionItemDetail[];
}

export interface PromotionEvaluation {
  appliedPromotions: AppliedPromotion[];
  totalSavings: number;
  itemAdjustments: Record<string, number>;
  itemBreakdown: Record<string, PromotionItemDetail[]>;
}

export interface PromotionEngineInput {
  promotions: PromotionDefinition[];
  cart: {
    items: CartItem[];
    customer?: Customer | null;
    orderType: 'dine-in' | 'takeaway' | 'delivery';
  };
  channel?: PromotionChannel;
  now?: Date;
}

interface ItemSnapshot {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  baseTotal: number;
}

interface ItemState {
  remainingTotal: number;
}

interface PromotionComputation {
  totalSavings: number;
  itemSavings: Map<string, number>;
  breakdown: PromotionItemDetail[];
  reason: string;
}

const toDate = (value: string | Date | undefined): Date | undefined => {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
};

const roundCurrency = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const isChannelEnabled = (definition: PromotionDefinition, channel: PromotionChannel): boolean => {
  if (!definition.channels || definition.channels.length === 0) {
    return true;
  }
  if (definition.channels.includes('any')) {
    return true;
  }
  return definition.channels.includes(channel);
};

const matchesOrderType = (
  definition: PromotionDefinition,
  orderType: 'dine-in' | 'takeaway' | 'delivery'
): boolean => {
  const allowed = definition.constraints?.orderTypes;
  if (!allowed || allowed.length === 0) {
    return true;
  }
  return allowed.includes(orderType);
};

const matchesCustomer = (definition: PromotionDefinition, customer?: Customer | null): boolean => {
  const allowedCustomers = definition.constraints?.customerIds;
  if (!allowedCustomers || allowedCustomers.length === 0) {
    return true;
  }
  if (!customer) {
    return false;
  }
  return allowedCustomers.includes(customer.id);
};

const getEligibleItemIds = (
  definition: PromotionDefinition,
  snapshots: Map<string, ItemSnapshot>,
  states: Map<string, ItemState>,
  lockedItems: Set<string>
): string[] => {
  const productFilter = definition.constraints?.productIds;
  const eligible: string[] = [];
  for (const [itemId, snapshot] of snapshots.entries()) {
    if (lockedItems.has(itemId)) {
      continue;
    }
    if (productFilter && productFilter.length > 0 && !productFilter.includes(snapshot.productId)) {
      continue;
    }
    const state = states.get(itemId);
    if (!state || state.remainingTotal <= 0) {
      continue;
    }
    eligible.push(itemId);
  }
  return eligible;
};

const distributeDiscount = (
  totalDiscount: number,
  itemIds: string[],
  states: Map<string, ItemState>
): Map<string, number> => {
  const allocations = new Map<string, number>();
  if (totalDiscount <= 0) {
    return allocations;
  }
  const availableTotals = itemIds.map((id) => Math.max(states.get(id)?.remainingTotal ?? 0, 0));
  const totalAvailable = availableTotals.reduce((sum, value) => sum + value, 0);
  if (totalAvailable <= 0) {
    return allocations;
  }

  let remainingDiscount = roundCurrency(totalDiscount);
  itemIds.forEach((itemId, index) => {
    const state = states.get(itemId);
    if (!state) {
      return;
    }
    const available = Math.max(state.remainingTotal, 0);
    if (available <= 0) {
      allocations.set(itemId, 0);
      return;
    }
    let share = roundCurrency((totalDiscount * available) / totalAvailable);
    share = Math.min(share, available, remainingDiscount);
    if (index === itemIds.length - 1) {
      share = Math.min(remainingDiscount, available);
    }
    share = roundCurrency(share);
    allocations.set(itemId, share);
    remainingDiscount = roundCurrency(remainingDiscount - share);
  });

  if (remainingDiscount > 0) {
    for (const itemId of itemIds) {
      if (remainingDiscount <= 0) {
        break;
      }
      const state = states.get(itemId);
      if (!state) {
        continue;
      }
      const current = allocations.get(itemId) ?? 0;
      const capacity = Math.max(state.remainingTotal - current, 0);
      if (capacity <= 0) {
        continue;
      }
      const addition = Math.min(capacity, remainingDiscount);
      if (addition <= 0) {
        continue;
      }
      const updated = roundCurrency(current + addition);
      allocations.set(itemId, updated);
      remainingDiscount = roundCurrency(remainingDiscount - addition);
    }
  }

  return allocations;
};

const computePercentagePromotion = (
  definition: PromotionDefinition,
  eligibleIds: string[],
  snapshots: Map<string, ItemSnapshot>,
  states: Map<string, ItemState>
): PromotionComputation | null => {
  const percentage = definition.reward.percentage;
  if (!percentage || percentage <= 0) {
    return null;
  }
  const totalBase = eligibleIds.reduce((sum, itemId) => sum + (snapshots.get(itemId)?.baseTotal ?? 0), 0);
  if (totalBase <= 0) {
    return null;
  }
  if (definition.constraints?.minSpend && totalBase < definition.constraints.minSpend) {
    return null;
  }
  const totalQuantity = eligibleIds.reduce((sum, itemId) => sum + (snapshots.get(itemId)?.quantity ?? 0), 0);
  if (definition.constraints?.minQuantity && totalQuantity < definition.constraints.minQuantity) {
    return null;
  }
  const baseAmount = eligibleIds.reduce((sum, itemId) => sum + Math.max(states.get(itemId)?.remainingTotal ?? 0, 0), 0);
  if (baseAmount <= 0) {
    return null;
  }
  const discountValue = roundCurrency((baseAmount * percentage) / 100);
  if (discountValue <= 0) {
    return null;
  }
  const allocations = distributeDiscount(discountValue, eligibleIds, states);
  let appliedTotal = 0;
  const breakdown: PromotionItemDetail[] = [];
  for (const [itemId, amount] of allocations.entries()) {
    if (amount <= 0) {
      continue;
    }
    appliedTotal += amount;
    const snapshot = snapshots.get(itemId);
    if (!snapshot) {
      continue;
    }
    breakdown.push({
      itemId,
      itemName: snapshot.name,
      promotionId: definition.id,
      promotionName: definition.name,
      savings: amount,
      quantity: snapshot.quantity,
      stackable: definition.stackable,
      type: definition.type,
    });
  }
  appliedTotal = roundCurrency(appliedTotal);
  if (appliedTotal <= 0) {
    return null;
  }
  const reason = `${definition.name} (${percentage}% off)`;
  return {
    totalSavings: appliedTotal,
    itemSavings: allocations,
    breakdown,
    reason,
  };
};

const computeFixedPromotion = (
  definition: PromotionDefinition,
  eligibleIds: string[],
  snapshots: Map<string, ItemSnapshot>,
  states: Map<string, ItemState>
): PromotionComputation | null => {
  const amount = definition.reward.amount;
  if (!amount || amount <= 0) {
    return null;
  }
  const totalBase = eligibleIds.reduce((sum, itemId) => sum + (snapshots.get(itemId)?.baseTotal ?? 0), 0);
  if (totalBase <= 0) {
    return null;
  }
  if (definition.constraints?.minSpend && totalBase < definition.constraints.minSpend) {
    return null;
  }
  const baseAmount = eligibleIds.reduce((sum, itemId) => sum + Math.max(states.get(itemId)?.remainingTotal ?? 0, 0), 0);
  if (baseAmount <= 0) {
    return null;
  }
  const discountValue = roundCurrency(Math.min(amount, baseAmount));
  if (discountValue <= 0) {
    return null;
  }
  const allocations = distributeDiscount(discountValue, eligibleIds, states);
  let appliedTotal = 0;
  const breakdown: PromotionItemDetail[] = [];
  for (const [itemId, value] of allocations.entries()) {
    if (value <= 0) {
      continue;
    }
    appliedTotal += value;
    const snapshot = snapshots.get(itemId);
    if (!snapshot) {
      continue;
    }
    breakdown.push({
      itemId,
      itemName: snapshot.name,
      promotionId: definition.id,
      promotionName: definition.name,
      savings: value,
      quantity: snapshot.quantity,
      stackable: definition.stackable,
      type: definition.type,
    });
  }
  appliedTotal = roundCurrency(appliedTotal);
  if (appliedTotal <= 0) {
    return null;
  }
  const reason = `${definition.name} (-$${appliedTotal.toFixed(2)})`;
  return {
    totalSavings: appliedTotal,
    itemSavings: allocations,
    breakdown,
    reason,
  };
};

const computeBxGyPromotion = (
  definition: PromotionDefinition,
  eligibleIds: string[],
  snapshots: Map<string, ItemSnapshot>,
  states: Map<string, ItemState>
): PromotionComputation | null => {
  const buyQuantity = definition.reward.buyQuantity;
  const getQuantity = definition.reward.getQuantity;
  if (!buyQuantity || !getQuantity || buyQuantity <= 0 || getQuantity <= 0) {
    return null;
  }
  if (!definition.constraints?.productIds || definition.constraints.productIds.length === 0) {
    return null;
  }
  let totalSavings = 0;
  const allocations = new Map<string, number>();
  const breakdown: PromotionItemDetail[] = [];
  for (const itemId of eligibleIds) {
    const snapshot = snapshots.get(itemId);
    const state = states.get(itemId);
    if (!snapshot || !state) {
      continue;
    }
    const totalQuantity = snapshot.quantity;
    if (totalQuantity < buyQuantity + getQuantity) {
      continue;
    }
    const groupSize = buyQuantity + getQuantity;
    let groups = Math.floor(totalQuantity / groupSize);
    if (definition.maxApplications) {
      groups = Math.min(groups, definition.maxApplications);
    }
    if (groups <= 0) {
      continue;
    }
    const freeUnits = groups * getQuantity;
    const potentialDiscount = roundCurrency(snapshot.unitPrice * freeUnits);
    if (potentialDiscount <= 0) {
      continue;
    }
    const discount = roundCurrency(Math.min(potentialDiscount, state.remainingTotal));
    if (discount <= 0) {
      continue;
    }
    allocations.set(itemId, discount);
    totalSavings += discount;
    breakdown.push({
      itemId,
      itemName: snapshot.name,
      promotionId: definition.id,
      promotionName: definition.name,
      savings: discount,
      quantity: freeUnits,
      stackable: definition.stackable,
      type: definition.type,
    });
  }
  totalSavings = roundCurrency(totalSavings);
  if (totalSavings <= 0) {
    return null;
  }
  const reason = `${definition.name} (Buy ${buyQuantity} Get ${getQuantity})`;
  return {
    totalSavings,
    itemSavings: allocations,
    breakdown,
    reason,
  };
};

const computeBundlePromotion = (
  definition: PromotionDefinition,
  eligibleIds: string[],
  snapshots: Map<string, ItemSnapshot>,
  states: Map<string, ItemState>
): PromotionComputation | null => {
  const bundlePrice = definition.reward.bundlePrice;
  if (bundlePrice === undefined) {
    return null;
  }
  const requiredProducts = definition.constraints?.productIds;
  if (!requiredProducts || requiredProducts.length === 0) {
    return null;
  }
  const involvedSnapshots = requiredProducts
    .map((productId) => Array.from(snapshots.values()).find((snapshot) => snapshot.productId === productId))
    .filter((snapshot): snapshot is ItemSnapshot => Boolean(snapshot));
  if (involvedSnapshots.length !== requiredProducts.length) {
    return null;
  }
  const bundleCount = Math.min(...involvedSnapshots.map((snapshot) => Math.floor(snapshot.quantity)));
  if (bundleCount <= 0) {
    return null;
  }
  const limitedBundleCount = definition.maxApplications
    ? Math.min(bundleCount, definition.maxApplications)
    : bundleCount;
  if (limitedBundleCount <= 0) {
    return null;
  }
  const basePrice = involvedSnapshots.reduce((sum, snapshot) => sum + snapshot.unitPrice, 0);
  const discountPerBundle = roundCurrency(basePrice - bundlePrice);
  if (discountPerBundle <= 0) {
    return null;
  }
  const totalDiscount = roundCurrency(discountPerBundle * limitedBundleCount);
  if (totalDiscount <= 0) {
    return null;
  }
  const appliedIds = eligibleIds.filter((id) => {
    const snapshot = snapshots.get(id);
    return snapshot ? requiredProducts.includes(snapshot.productId) : false;
  });
  if (appliedIds.length === 0) {
    return null;
  }
  const allocations = distributeDiscount(totalDiscount, appliedIds, states);
  let appliedTotal = 0;
  const breakdown: PromotionItemDetail[] = [];
  for (const [itemId, value] of allocations.entries()) {
    if (value <= 0) {
      continue;
    }
    appliedTotal += value;
    const snapshot = snapshots.get(itemId);
    if (!snapshot) {
      continue;
    }
    breakdown.push({
      itemId,
      itemName: snapshot.name,
      promotionId: definition.id,
      promotionName: definition.name,
      savings: value,
      quantity: snapshot.quantity,
      stackable: definition.stackable,
      type: definition.type,
    });
  }
  appliedTotal = roundCurrency(appliedTotal);
  if (appliedTotal <= 0) {
    return null;
  }
  const reason = `${definition.name} (Bundle)`;
  return {
    totalSavings: appliedTotal,
    itemSavings: allocations,
    breakdown,
    reason,
  };
};

const computePromotion = (
  definition: PromotionDefinition,
  snapshots: Map<string, ItemSnapshot>,
  states: Map<string, ItemState>,
  lockedItems: Set<string>
): PromotionComputation | null => {
  const eligibleIds = getEligibleItemIds(definition, snapshots, states, lockedItems);
  if (eligibleIds.length === 0) {
    return null;
  }
  switch (definition.type) {
    case 'percentage':
      return computePercentagePromotion(definition, eligibleIds, snapshots, states);
    case 'fixed':
      return computeFixedPromotion(definition, eligibleIds, snapshots, states);
    case 'bxgy':
      return computeBxGyPromotion(definition, eligibleIds, snapshots, states);
    case 'bundle':
      return computeBundlePromotion(definition, eligibleIds, snapshots, states);
    default:
      return null;
  }
};

const convertMapToRecord = (map: Map<string, number>): Record<string, number> => {
  const record: Record<string, number> = {};
  for (const [key, value] of map.entries()) {
    if (value > 0) {
      record[key] = roundCurrency(value);
    }
  }
  return record;
};

const convertBreakdownToRecord = (map: Map<string, PromotionItemDetail[]>): Record<string, PromotionItemDetail[]> => {
  const record: Record<string, PromotionItemDetail[]> = {};
  for (const [key, list] of map.entries()) {
    if (list.length > 0) {
      record[key] = list.map((entry) => ({ ...entry, savings: roundCurrency(entry.savings) }));
    }
  }
  return record;
};

export const evaluatePromotions = ({
  promotions,
  cart,
  channel = 'pos',
  now = new Date(),
}: PromotionEngineInput): PromotionEvaluation => {
  if (promotions.length === 0 || cart.items.length === 0) {
    return {
      appliedPromotions: [],
      totalSavings: 0,
      itemAdjustments: {},
      itemBreakdown: {},
    };
  }

  const { items, customer, orderType } = cart;
  const snapshots = new Map<string, ItemSnapshot>();
  const states = new Map<string, ItemState>();

  for (const item of items) {
    const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
    const unitPrice = item.price + modifierTotal;
    const baseTotal = roundCurrency(Math.max(unitPrice * item.quantity - item.discount, 0));
    snapshots.set(item.id, {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice,
      baseTotal,
    });
    states.set(item.id, {
      remainingTotal: baseTotal,
    });
  }

  const lockedItems = new Set<string>();
  const itemAdjustments = new Map<string, number>();
  const itemBreakdown = new Map<string, PromotionItemDetail[]>();
  const appliedPromotions: AppliedPromotion[] = [];

  const applicablePromotions = promotions.filter((definition) => {
    if (!isChannelEnabled(definition, channel)) {
      return false;
    }
    if (!matchesOrderType(definition, orderType)) {
      return false;
    }
    if (!matchesCustomer(definition, customer)) {
      return false;
    }
    const startAt = toDate(definition.startAt);
    if (startAt && now < startAt) {
      return false;
    }
    const endAt = toDate(definition.endAt);
    if (endAt && now > endAt) {
      return false;
    }
    return true;
  });

  const sortedPromotions = applicablePromotions
    .map((definition, index) => ({ definition, index }))
    .sort((a, b) => {
      const priorityA = a.definition.priority ?? 100;
      const priorityB = b.definition.priority ?? 100;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      if (a.definition.stackable !== b.definition.stackable) {
        return a.definition.stackable ? 1 : -1;
      }
      return a.index - b.index;
    })
    .map(({ definition }) => definition);

  let totalSavings = 0;

  for (const definition of sortedPromotions) {
    const result = computePromotion(definition, snapshots, states, lockedItems);
    if (!result || result.totalSavings <= 0) {
      continue;
    }
    const details: PromotionItemDetail[] = [];
    for (const [itemId, discount] of result.itemSavings.entries()) {
      if (discount <= 0) {
        continue;
      }
      const state = states.get(itemId);
      const snapshot = snapshots.get(itemId);
      if (!state || !snapshot) {
        continue;
      }
      const updatedRemaining = roundCurrency(Math.max(state.remainingTotal - discount, 0));
      state.remainingTotal = updatedRemaining;
      const accumulated = roundCurrency((itemAdjustments.get(itemId) ?? 0) + discount);
      itemAdjustments.set(itemId, accumulated);
      const existingBreakdown = itemBreakdown.get(itemId) ?? [];
      const breakdownEntry = result.breakdown.find((entry) => entry.itemId === itemId);
      if (breakdownEntry) {
        existingBreakdown.push({
          ...breakdownEntry,
          savings: roundCurrency(breakdownEntry.savings),
        });
        details.push({
          ...breakdownEntry,
          savings: roundCurrency(breakdownEntry.savings),
        });
      } else {
        const entry: PromotionItemDetail = {
          itemId,
          itemName: snapshot.name,
          promotionId: definition.id,
          promotionName: definition.name,
          savings: roundCurrency(discount),
          quantity: snapshot.quantity,
          stackable: definition.stackable,
          type: definition.type,
        };
        existingBreakdown.push(entry);
        details.push(entry);
      }
      itemBreakdown.set(itemId, existingBreakdown);
      if (!definition.stackable) {
        lockedItems.add(itemId);
      }
    }
    if (details.length === 0) {
      continue;
    }
    const appliedSavings = roundCurrency(details.reduce((sum, entry) => sum + entry.savings, 0));
    if (appliedSavings <= 0) {
      continue;
    }
    totalSavings = roundCurrency(totalSavings + appliedSavings);
    appliedPromotions.push({
      id: definition.id,
      name: definition.name,
      description: definition.description,
      stackable: definition.stackable,
      type: definition.type,
      savings: appliedSavings,
      reason: result.reason,
      details,
    });
  }

  return {
    appliedPromotions,
    totalSavings: roundCurrency(totalSavings),
    itemAdjustments: convertMapToRecord(itemAdjustments),
    itemBreakdown: convertBreakdownToRecord(itemBreakdown),
  };
};
