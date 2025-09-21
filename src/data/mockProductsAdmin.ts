export type ProductLifecycleStatus = 'active' | 'draft' | 'archived';
export type ModifierGroupStatus = 'active' | 'draft' | 'retired';
export type PriceListStatus = 'live' | 'scheduled' | 'expired';

export interface ProductAdminItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  status: ProductLifecycleStatus;
  lastUpdated: string;
  location: string;
  tags: string[];
  salesChannel: 'dine-in' | 'takeaway' | 'delivery' | 'all';
}

export interface ProductAdminModifierGroup {
  id: string;
  name: string;
  status: ModifierGroupStatus;
  required: boolean;
  options: number;
  itemsAttached: number;
  appliesTo: string[];
  lastUpdated: string;
}

export interface ProductAdminPriceList {
  id: string;
  name: string;
  status: PriceListStatus;
  currency: string;
  items: number;
  locations: string[];
  channels: Array<'dine-in' | 'takeaway' | 'delivery' | 'marketplace'>;
  effectiveFrom: string;
  effectiveTo?: string;
  lastSynced: string;
}

export const mockProductItems: ProductAdminItem[] = [
  {
    id: 'item-001',
    name: 'Heritage Burger',
    sku: 'BRG-001',
    category: 'Mains',
    price: 16.5,
    cost: 5.25,
    status: 'active',
    lastUpdated: '2024-10-04T15:20:00Z',
    location: 'Main Dining',
    tags: ['Signature', 'Beef'],
    salesChannel: 'all'
  },
  {
    id: 'item-002',
    name: 'Blackened Salmon',
    sku: 'SEA-104',
    category: 'Mains',
    price: 24.0,
    cost: 8.75,
    status: 'active',
    lastUpdated: '2024-10-03T12:05:00Z',
    location: 'Chef Specials',
    tags: ['Seafood', 'Dinner'],
    salesChannel: 'dine-in'
  },
  {
    id: 'item-003',
    name: 'Truffle Fries',
    sku: 'APP-208',
    category: 'Shareables',
    price: 9.5,
    cost: 2.85,
    status: 'active',
    lastUpdated: '2024-10-01T19:44:00Z',
    location: 'Bar Bites',
    tags: ['Vegetarian'],
    salesChannel: 'all'
  },
  {
    id: 'item-004',
    name: 'Seasonal Greens Salad',
    sku: 'SAL-011',
    category: 'Greens',
    price: 13.0,
    cost: 4.1,
    status: 'active',
    lastUpdated: '2024-09-30T08:15:00Z',
    location: 'Main Dining',
    tags: ['Gluten Free', 'Lunch'],
    salesChannel: 'takeaway'
  },
  {
    id: 'item-005',
    name: 'Forest Mushroom Risotto',
    sku: 'ENT-903',
    category: 'Mains',
    price: 21.5,
    cost: 6.9,
    status: 'draft',
    lastUpdated: '2024-10-05T10:30:00Z',
    location: 'Chef Lab',
    tags: ['Vegetarian'],
    salesChannel: 'dine-in'
  },
  {
    id: 'item-006',
    name: 'Citrus Olive Oil Cake',
    sku: 'DES-304',
    category: 'Desserts',
    price: 8.5,
    cost: 2.4,
    status: 'active',
    lastUpdated: '2024-09-29T18:40:00Z',
    location: 'Pastry',
    tags: ['Baked'],
    salesChannel: 'all'
  },
  {
    id: 'item-007',
    name: 'Cold Brew Growler',
    sku: 'BEV-712',
    category: 'Beverages',
    price: 18.0,
    cost: 4.5,
    status: 'active',
    lastUpdated: '2024-10-02T07:50:00Z',
    location: 'Cafe Window',
    tags: ['Takeaway'],
    salesChannel: 'takeaway'
  },
  {
    id: 'item-008',
    name: 'Korean Fried Cauliflower',
    sku: 'APP-315',
    category: 'Shareables',
    price: 11.5,
    cost: 3.9,
    status: 'active',
    lastUpdated: '2024-09-28T14:12:00Z',
    location: 'Bar Bites',
    tags: ['Spicy', 'Vegan'],
    salesChannel: 'all'
  },
  {
    id: 'item-009',
    name: 'Charred Octopus',
    sku: 'SEA-118',
    category: 'Small Plates',
    price: 17.0,
    cost: 6.2,
    status: 'draft',
    lastUpdated: '2024-10-04T09:25:00Z',
    location: 'Chef Specials',
    tags: ['Seafood'],
    salesChannel: 'dine-in'
  },
  {
    id: 'item-010',
    name: 'Ancient Grain Bowl',
    sku: 'SAL-020',
    category: 'Greens',
    price: 15.5,
    cost: 5.1,
    status: 'active',
    lastUpdated: '2024-10-01T11:33:00Z',
    location: 'Main Dining',
    tags: ['Vegan', 'Lunch'],
    salesChannel: 'delivery'
  },
  {
    id: 'item-011',
    name: 'Tableside Guacamole',
    sku: 'APP-119',
    category: 'Shareables',
    price: 12.0,
    cost: 3.75,
    status: 'archived',
    lastUpdated: '2024-08-19T17:05:00Z',
    location: 'Seasonal Archive',
    tags: ['Summer'],
    salesChannel: 'dine-in'
  },
  {
    id: 'item-012',
    name: 'Nitro Espresso Martini',
    sku: 'BEV-745',
    category: 'Beverages',
    price: 13.0,
    cost: 3.6,
    status: 'active',
    lastUpdated: '2024-09-26T21:48:00Z',
    location: 'Bar Program',
    tags: ['Cocktail'],
    salesChannel: 'dine-in'
  }
];

export const mockProductModifierGroups: ProductAdminModifierGroup[] = [
  {
    id: 'mod-001',
    name: 'Protein Upgrades',
    status: 'active',
    required: false,
    options: 5,
    itemsAttached: 7,
    appliesTo: ['Heritage Burger', 'Ancient Grain Bowl'],
    lastUpdated: '2024-09-30T09:10:00Z'
  },
  {
    id: 'mod-002',
    name: 'Cooking Temperature',
    status: 'active',
    required: true,
    options: 4,
    itemsAttached: 5,
    appliesTo: ['Blackened Salmon', 'Charred Octopus'],
    lastUpdated: '2024-09-27T13:28:00Z'
  },
  {
    id: 'mod-003',
    name: 'Side Selections',
    status: 'draft',
    required: true,
    options: 6,
    itemsAttached: 9,
    appliesTo: ['Heritage Burger', 'Forest Mushroom Risotto'],
    lastUpdated: '2024-10-03T16:42:00Z'
  },
  {
    id: 'mod-004',
    name: 'Allergy Flags',
    status: 'active',
    required: false,
    options: 8,
    itemsAttached: 12,
    appliesTo: ['Seasonal Greens Salad', 'Ancient Grain Bowl'],
    lastUpdated: '2024-09-22T07:55:00Z'
  },
  {
    id: 'mod-005',
    name: 'Spice Scale',
    status: 'active',
    required: true,
    options: 5,
    itemsAttached: 6,
    appliesTo: ['Korean Fried Cauliflower', 'Truffle Fries'],
    lastUpdated: '2024-10-01T18:05:00Z'
  },
  {
    id: 'mod-006',
    name: 'Milk Alternatives',
    status: 'retired',
    required: false,
    options: 4,
    itemsAttached: 3,
    appliesTo: ['Cold Brew Growler'],
    lastUpdated: '2024-08-15T10:00:00Z'
  }
];

export const mockProductPriceLists: ProductAdminPriceList[] = [
  {
    id: 'price-001',
    name: 'Main Dining 2024',
    status: 'live',
    currency: 'USD',
    items: 86,
    locations: ['Main Dining Room'],
    channels: ['dine-in'],
    effectiveFrom: '2024-01-10T00:00:00Z',
    lastSynced: '2024-10-05T06:45:00Z'
  },
  {
    id: 'price-002',
    name: 'Delivery Aggregators',
    status: 'live',
    currency: 'USD',
    items: 54,
    locations: ['Central Kitchen'],
    channels: ['delivery', 'marketplace'],
    effectiveFrom: '2024-03-01T00:00:00Z',
    lastSynced: '2024-10-04T22:10:00Z'
  },
  {
    id: 'price-003',
    name: 'Seasonal Patio',
    status: 'scheduled',
    currency: 'USD',
    items: 32,
    locations: ['Rooftop Patio'],
    channels: ['dine-in'],
    effectiveFrom: '2024-11-15T00:00:00Z',
    effectiveTo: '2025-03-15T00:00:00Z',
    lastSynced: '2024-10-02T14:00:00Z'
  },
  {
    id: 'price-004',
    name: 'Café Daytime',
    status: 'live',
    currency: 'USD',
    items: 41,
    locations: ['Cafe Window'],
    channels: ['takeaway'],
    effectiveFrom: '2024-02-20T00:00:00Z',
    lastSynced: '2024-10-03T08:20:00Z'
  },
  {
    id: 'price-005',
    name: 'Holiday Markets',
    status: 'expired',
    currency: 'USD',
    items: 27,
    locations: ['Pop-up Stand'],
    channels: ['marketplace'],
    effectiveFrom: '2023-11-05T00:00:00Z',
    effectiveTo: '2024-01-02T00:00:00Z',
    lastSynced: '2024-07-12T16:18:00Z'
  }
];

export const mockProductsAdmin = {
  items: mockProductItems,
  modifierGroups: mockProductModifierGroups,
  priceLists: mockProductPriceLists
};
