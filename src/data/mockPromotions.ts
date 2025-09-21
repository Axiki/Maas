import { PromotionCampaign } from '../types/promotions';

export const mockPromotionCampaigns: PromotionCampaign[] = [
  {
    id: 'promo-1',
    name: 'Weeknight Happy Hour',
    description: '20% off select appetizers and signature cocktails after 3pm.',
    status: 'active',
    reward: {
      type: 'percentage',
      value: 20,
      appliesTo: 'category',
      maxDiscount: 50
    },
    eligibility: {
      channels: ['pos', 'online'],
      audience: 'all',
      minimumSpend: 15,
      maximumRedemptions: 500,
      requiredTags: ['happy-hour'],
      excludedTags: ['catering'],
      includedProducts: ['cat-1', 'cat-4'],
      excludedProducts: []
    },
    schedule: {
      startDate: '2024-12-01',
      endDate: '2025-03-30',
      startTime: '15:00',
      endTime: '18:00',
      daysOfWeek: ['mon', 'tue', 'wed', 'thu'],
      timezone: 'America/New_York',
      isAllDay: false
    },
    stacking: {
      stackable: false,
      exclusivityLevel: 'category-exclusive',
      conflictsWith: ['promo-3'],
      priority: 80,
      notes: 'Cannot combine with bundle pricing on cocktails.'
    },
    metrics: {
      redemptionCount: 342,
      revenueImpact: 4200,
      lastTriggeredAt: '2025-01-13T17:42:00Z'
    },
    tags: ['evening', 'drinks'],
    lastEditedBy: 'Alex Morgan',
    updatedAt: '2025-01-12T20:15:00Z'
  },
  {
    id: 'promo-2',
    name: 'Loyalty Welcome Credit',
    description: 'Give new loyalty members $10 off their second visit.',
    status: 'scheduled',
    reward: {
      type: 'amount',
      value: 10,
      currency: 'USD',
      appliesTo: 'order'
    },
    eligibility: {
      channels: ['pos', 'delivery'],
      audience: 'loyalty',
      minimumSpend: 25,
      maximumRedemptions: 1000,
      requiredTags: ['loyalty'],
      excludedTags: [],
      includedProducts: [],
      excludedProducts: ['alcohol']
    },
    schedule: {
      startDate: '2025-02-01',
      endDate: '2025-06-30',
      startTime: '00:00',
      endTime: '23:59',
      daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      timezone: 'America/New_York',
      isAllDay: true
    },
    stacking: {
      stackable: true,
      exclusivityLevel: 'no-limit',
      conflictsWith: [],
      priority: 40,
      notes: 'Stackable with weekday spend boosters.'
    },
    metrics: {
      redemptionCount: 0,
      revenueImpact: 0,
    },
    tags: ['loyalty', 'customer-growth'],
    lastEditedBy: 'Priya Singh',
    updatedAt: '2025-01-08T16:20:00Z'
  },
  {
    id: 'promo-3',
    name: 'Brunch Bundle for Two',
    description: 'Bundle pricing on brunch entrée and mimosa pairing every weekend.',
    status: 'draft',
    reward: {
      type: 'bundle',
      bundlePrice: 45,
      productIds: ['brunch-plates', 'mimosa-kit'],
      minimumItems: 2
    },
    eligibility: {
      channels: ['pos', 'kiosk'],
      audience: 'all',
      maximumRedemptions: 300,
      requiredTags: ['brunch'],
      excludedTags: ['delivery-only'],
      includedProducts: ['brunch-plates', 'mimosa-kit'],
      excludedProducts: []
    },
    schedule: {
      startDate: '2025-01-18',
      endDate: '2025-05-25',
      startTime: '09:00',
      endTime: '14:00',
      daysOfWeek: ['sat', 'sun'],
      timezone: 'America/New_York',
      isAllDay: false
    },
    stacking: {
      stackable: false,
      exclusivityLevel: 'single-use',
      conflictsWith: ['promo-1'],
      priority: 95,
      notes: 'Exclusive on brunch menu to protect margins.'
    },
    metrics: {
      redemptionCount: 0,
      revenueImpact: 0,
    },
    tags: ['weekend', 'bundles'],
    lastEditedBy: 'Luis Fernández',
    updatedAt: '2025-01-10T14:05:00Z'
  }
];
