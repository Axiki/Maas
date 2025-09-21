import { PromotionDefinition } from '../services/promotionsEngine';

export const mockPromotions: PromotionDefinition[] = [
  {
    id: 'promo-happy-hour',
    name: 'Happy Hour Appetizers',
    description: '10% off select starters during happy hour.',
    type: 'percentage',
    stackable: true,
    scope: 'item',
    priority: 5,
    channels: ['pos'],
    constraints: {
      productIds: ['prod-1', 'prod-6'],
      minQuantity: 1,
    },
    reward: {
      percentage: 10,
    },
  },
  {
    id: 'promo-salad-trio',
    name: 'Garden Salad Trio',
    description: 'Buy two Garden Salads and get the third on us.',
    type: 'bxgy',
    stackable: false,
    scope: 'item',
    priority: 2,
    channels: ['pos'],
    constraints: {
      productIds: ['prod-7'],
      minQuantity: 3,
    },
    reward: {
      buyQuantity: 2,
      getQuantity: 1,
    },
  },
  {
    id: 'promo-dinner-bundle',
    name: 'Dinner Bundle',
    description: 'Classic salad and pizza combo for a flat $28.',
    type: 'bundle',
    stackable: false,
    scope: 'cart',
    priority: 10,
    channels: ['pos'],
    constraints: {
      productIds: ['prod-1', 'prod-3'],
    },
    reward: {
      bundlePrice: 28,
    },
  },
];
