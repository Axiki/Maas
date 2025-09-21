import { PromotionCampaign } from '../types/promotions';

export const mockPromotionCampaigns: PromotionCampaign[] = [
  {
    id: 'promo-happy-hour',
    name: 'Happy Hour Cocktails',
    type: 'item-discount',
    status: 'active',
    summary: '20% off the bar menu on weekdays between 4-6 PM to drive after-work visits.',
    priority: 1,
    tags: ['bar', 'happy-hour', 'upsell'],
    owner: 'Sarah Johnson',
    lastUpdated: '2024-08-18T10:00:00Z',
    previewBadges: [
      {
        id: 'badge-happy-hour',
        label: '20% Happy Hour',
        tone: 'discount',
        description: 'Weekday bar items between 4-6 PM'
      }
    ],
    rules: [
      {
        id: 'rule-happy-hour-1',
        name: 'Weekday Bar Discount',
        description: 'Applies a 20% discount to beverages in the bar category during afternoon windows.',
        eligibility: {
          minimumSubtotal: 15,
          customerSegments: ['all-guests'],
          orderTypes: ['dine-in', 'takeaway'],
          storeScopes: ['store-1'],
          requiredProductIds: [],
          excludedProductIds: ['prod-7'],
          notes: 'Excludes catering orders.'
        },
        reward: {
          type: 'percentage',
          value: 20,
          appliesTo: 'category',
          targetCategoryIds: ['cat-4'],
          description: 'Automatically apply 20% off qualifying beverages.'
        },
        schedule: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          timezone: 'America/New_York',
          isAlwaysOn: false,
          windows: [
            {
              id: 'window-weekday-evening',
              days: ['mon', 'tue', 'wed', 'thu', 'fri'],
              startTime: '16:00',
              endTime: '18:00'
            }
          ]
        },
        stacking: {
          allowWithOtherCampaigns: false,
          stackWithSameCampaign: false,
          maxUsesPerOrder: 1,
          maxUsesPerCustomer: 1,
          blockedCampaignIds: ['promo-dessert-bundle'],
          notes: 'Keeps bar promos exclusive during happy hour.'
        }
      }
    ]
  },
  {
    id: 'promo-dessert-bundle',
    name: 'Dessert Sampler BOGO',
    type: 'combo',
    status: 'scheduled',
    summary: 'Buy two desserts and receive a third free to increase sweet course attachment.',
    priority: 2,
    tags: ['dessert', 'loyalty'],
    owner: 'Nina Patel',
    lastUpdated: '2024-08-12T14:45:00Z',
    previewBadges: [
      {
        id: 'badge-dessert-bogo',
        label: 'Buy 2 Get 1 Dessert',
        tone: 'reward',
        description: 'Auto applied on dessert trio orders'
      }
    ],
    rules: [
      {
        id: 'rule-dessert-bogo-1',
        name: 'Weekend Dessert Bundle',
        description: 'Encourages dessert sharing on weekend dinner service.',
        eligibility: {
          minimumQuantity: 3,
          customerSegments: ['loyalty-members', 'dinner-guests'],
          orderTypes: ['dine-in'],
          storeScopes: ['store-1'],
          requiredProductIds: ['prod-4'],
          excludedProductIds: [],
          notes: 'Servers must mark loyalty ID when applied.'
        },
        reward: {
          type: 'bogo',
          buyQuantity: 2,
          getQuantity: 1,
          appliesTo: 'product',
          targetProductIds: ['prod-4'],
          description: 'Third dessert of equal or lesser value is free.'
        },
        schedule: {
          startDate: '2024-09-01',
          endDate: '2024-10-31',
          timezone: 'America/New_York',
          isAlwaysOn: false,
          windows: [
            {
              id: 'window-weekend-dinner',
              days: ['fri', 'sat'],
              startTime: '17:00',
              endTime: '22:00'
            }
          ]
        },
        stacking: {
          allowWithOtherCampaigns: true,
          stackWithSameCampaign: false,
          maxUsesPerOrder: 1,
          maxUsesPerCustomer: 2,
          blockedCampaignIds: [],
          notes: 'Can combine with lunch combo coupons.'
        }
      }
    ]
  },
  {
    id: 'promo-lunch-combo',
    name: 'Lunch Pair Savings',
    type: 'order-discount',
    status: 'draft',
    summary: 'Bundle salad and pizza for $4 off weekday lunch to boost midday traffic.',
    priority: 3,
    tags: ['lunch', 'bundle'],
    owner: 'Caleb Morris',
    lastUpdated: '2024-08-01T09:20:00Z',
    previewBadges: [
      {
        id: 'badge-lunch-combo',
        label: 'Lunch Combo -$4',
        tone: 'info',
        description: 'Weekday lunch pairing reward'
      }
    ],
    rules: [
      {
        id: 'rule-lunch-combo-1',
        name: 'Weekday Lunch Pair',
        description: 'Applies when a salad and pizza are both in the basket during lunch hours.',
        eligibility: {
          minimumSubtotal: 25,
          requiredProductIds: ['prod-1', 'prod-3'],
          excludedProductIds: [],
          customerSegments: ['all-guests'],
          orderTypes: ['dine-in', 'takeaway'],
          storeScopes: ['store-1'],
          notes: 'Intended for quick-service counter orders.'
        },
        reward: {
          type: 'amount',
          value: 4,
          appliesTo: 'entire-order',
          targetProductIds: ['prod-1', 'prod-3'],
          description: '$4 off when a qualifying salad and pizza are ordered together.'
        },
        schedule: {
          startDate: '2024-08-19',
          timezone: 'America/New_York',
          isAlwaysOn: false,
          windows: [
            {
              id: 'window-weekday-lunch',
              days: ['mon', 'tue', 'wed', 'thu', 'fri'],
              startTime: '11:00',
              endTime: '14:00'
            }
          ]
        },
        stacking: {
          allowWithOtherCampaigns: false,
          stackWithSameCampaign: false,
          maxUsesPerOrder: 1,
          blockedCampaignIds: ['promo-happy-hour'],
          notes: 'Should not overlap with happy hour pricing.'
        }
      }
    ]
  }
];
