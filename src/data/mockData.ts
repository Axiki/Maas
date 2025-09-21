import {
  Product,
  Category,
  Customer,
  User,
  Store,
  Tenant,
  ProductVariantSummary,
  PriceList,
  SalesChannel,
} from '../types';

export const mockTenant: Tenant = {
  id: 'tenant-1',
  name: 'Bella Vista Restaurant',
  settings: {
    currency: 'USD',
    timezone: 'America/New_York',
    theme: 'light',
    paperShader: {
      enabled: true,
      intensity: 0.5,
      animationSpeed: 1.0,
      surfaces: ['background', 'cards']
    }
  }
};

export const mockStore: Store = {
  id: 'store-1',
  tenantId: 'tenant-1',
  name: 'Main Location',
  address: '123 Restaurant St, City, ST 12345',
  phone: '(555) 123-4567'
};

export const mockUser: User = {
  id: 'user-1',
  email: 'manager@bellavista.com',
  name: 'Sarah Johnson',
  role: 'manager',
  storeId: 'store-1',
  pin: '1234'
};

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Appetizers',
    sortOrder: 1,
    color: '#E44343'
  },
  {
    id: 'cat-2',
    name: 'Main Courses',
    sortOrder: 2,
    color: '#148A3B'
  },
  {
    id: 'cat-3',
    name: 'Desserts',
    sortOrder: 3,
    color: '#C48A0A'
  },
  {
    id: 'cat-4',
    name: 'Beverages',
    sortOrder: 4,
    color: '#B21E1E'
  },
  {
    id: 'cat-5',
    name: 'Salads',
    sortOrder: 5,
    color: '#2D7D32'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    categoryId: 'cat-1',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan and croutons',
    price: 12.99,
    cost: 4.50,
    taxRate: 8.5,
    image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
    barcode: '123456789',
    variants: [],
    modifierGroups: [],
    isActive: true,
    stationTags: ['cold-prep']
  },
  {
    id: 'prod-2',
    categoryId: 'cat-2',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with seasonal vegetables',
    price: 24.99,
    cost: 8.75,
    taxRate: 8.5,
    image: 'https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=400',
    variants: [
      { id: 'var-1', name: 'Regular', price: 24.99, sku: 'SALMON-REG' },
      { id: 'var-2', name: 'Large', price: 29.99, sku: 'SALMON-LG' }
    ],
    modifierGroups: [
      {
        id: 'mod-grp-1',
        name: 'Temperature',
        required: true,
        maxSelections: 1,
        modifiers: [
          { id: 'mod-1', name: 'Medium Rare', price: 0 },
          { id: 'mod-2', name: 'Medium', price: 0 },
          { id: 'mod-3', name: 'Well Done', price: 0 }
        ]
      }
    ],
    isActive: true,
    stationTags: ['grill']
  },
  {
    id: 'prod-3',
    categoryId: 'cat-2',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella and basil',
    price: 18.99,
    cost: 6.25,
    taxRate: 8.5,
    image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400',
    variants: [
      { id: 'var-3', name: '12 inch', price: 18.99, sku: 'PIZZA-12' },
      { id: 'var-4', name: '16 inch', price: 24.99, sku: 'PIZZA-16' }
    ],
    modifierGroups: [],
    isActive: true,
    stationTags: ['pizza']
  },
  {
    id: 'prod-4',
    categoryId: 'cat-3',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with ganache',
    price: 8.99,
    cost: 2.50,
    taxRate: 8.5,
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
    variants: [],
    modifierGroups: [],
    isActive: true,
    stationTags: ['dessert']
  },
  {
    id: 'prod-5',
    categoryId: 'cat-4',
    name: 'House Wine',
    description: 'Red or white wine selection',
    price: 7.99,
    cost: 2.25,
    taxRate: 8.5,
    variants: [
      { id: 'var-5', name: 'Red', price: 7.99, sku: 'WINE-RED' },
      { id: 'var-6', name: 'White', price: 7.99, sku: 'WINE-WHITE' },
      { id: 'var-7', name: 'Rosé', price: 8.99, sku: 'WINE-ROSE' }
    ],
    modifierGroups: [],
    isActive: true,
    stationTags: ['bar']
  },
  {
    id: 'prod-6',
    categoryId: 'cat-1',
    name: 'Buffalo Wings',
    description: 'Spicy chicken wings with ranch dressing',
    price: 14.99,
    cost: 5.25,
    taxRate: 8.5,
    image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400',
    variants: [],
    modifierGroups: [
      {
        id: 'mod-grp-2',
        name: 'Heat Level',
        required: true,
        maxSelections: 1,
        modifiers: [
          { id: 'mod-4', name: 'Mild', price: 0 },
          { id: 'mod-5', name: 'Medium', price: 0 },
          { id: 'mod-6', name: 'Hot', price: 0 },
          { id: 'mod-7', name: 'Extra Hot', price: 1.00 }
        ]
      }
    ],
    isActive: true,
    stationTags: ['fryer']
  },
  {
    id: 'prod-7',
    categoryId: 'cat-5',
    name: 'Garden Salad',
    description: 'Mixed greens with seasonal vegetables',
    price: 9.99,
    cost: 3.25,
    taxRate: 8.5,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    variants: [],
    modifierGroups: [
      {
        id: 'mod-grp-3',
        name: 'Dressing',
        required: false,
        maxSelections: 2,
        modifiers: [
          { id: 'mod-8', name: 'Ranch', price: 0 },
          { id: 'mod-9', name: 'Italian', price: 0 },
          { id: 'mod-10', name: 'Caesar', price: 0 },
          { id: 'mod-11', name: 'Balsamic', price: 0.50 }
        ]
      }
    ],
    isActive: true,
    stationTags: ['cold-prep']
  },
  {
    id: 'prod-8',
    categoryId: 'cat-2',
    name: 'Ribeye Steak',
    description: '12oz ribeye steak cooked to perfection',
    price: 32.99,
    cost: 12.50,
    taxRate: 8.5,
    image: 'https://images.pexels.com/photos/299348/pexels-photo-299348.jpeg?auto=compress&cs=tinysrgb&w=400',
    variants: [],
    modifierGroups: [
      {
        id: 'mod-grp-4',
        name: 'Temperature',
        required: true,
        maxSelections: 1,
        modifiers: [
          { id: 'mod-12', name: 'Rare', price: 0 },
          { id: 'mod-13', name: 'Medium Rare', price: 0 },
          { id: 'mod-14', name: 'Medium', price: 0 },
          { id: 'mod-15', name: 'Medium Well', price: 0 },
          { id: 'mod-16', name: 'Well Done', price: 0 }
        ]
      },
      {
        id: 'mod-grp-5',
        name: 'Side',
        required: true,
        maxSelections: 1,
        modifiers: [
          { id: 'mod-17', name: 'Mashed Potatoes', price: 0 },
          { id: 'mod-18', name: 'Baked Potato', price: 0 },
          { id: 'mod-19', name: 'Rice Pilaf', price: 0 },
          { id: 'mod-20', name: 'Grilled Vegetables', price: 2.00 }
        ]
      }
    ],
    isActive: true,
    stationTags: ['grill']
  }
];

const productUpdateSeeds = [
  '2024-08-12T14:30:00Z',
  '2024-08-09T11:15:00Z',
  '2024-08-07T18:20:00Z',
  '2024-08-05T09:45:00Z',
  '2024-08-03T16:10:00Z',
  '2024-08-01T13:25:00Z',
];

const determineChannels = (tags: string[]): SalesChannel[] => {
  const channels = new Set<SalesChannel>(['dine-in', 'takeaway']);

  if (tags.some((tag) => ['pizza', 'delivery', 'grill'].includes(tag))) {
    channels.add('delivery');
  }

  if (tags.includes('bar')) {
    channels.add('happy-hour');
  }

  return Array.from(channels);
};

export const mockProductVariants: ProductVariantSummary[] = mockProducts.flatMap((product, index) => {
  const updatedAt = productUpdateSeeds[index % productUpdateSeeds.length];
  const channels = determineChannels(product.stationTags);

  if (product.variants.length === 0) {
    const price = Number(product.price.toFixed(2));
    const cost = Number(product.cost.toFixed(2));
    const margin = price
      ? Number((((price - cost) / price) * 100).toFixed(1))
      : 0;

    return [
      {
        id: `${product.id}-base`,
        productId: product.id,
        productName: product.name,
        variantName: 'Base Price',
        sku: product.barcode ?? `${product.id}-BASE`,
        price,
        cost,
        margin,
        isActive: product.isActive,
        isPrimary: true,
        channels,
        lastUpdated: updatedAt,
      },
    ];
  }

  return product.variants.map((variant, variantIndex) => {
    const price = Number(variant.price.toFixed(2));
    const cost = Number(product.cost.toFixed(2));
    const margin = price
      ? Number((((price - cost) / price) * 100).toFixed(1))
      : 0;

    return {
      id: variant.id,
      productId: product.id,
      productName: product.name,
      variantName: variant.name,
      sku: variant.sku,
      price,
      cost,
      margin,
      isActive: product.isActive,
      isPrimary: variantIndex === 0,
      channels,
      lastUpdated: updatedAt,
    };
  });
});

export const mockPriceLists: PriceList[] = [
  {
    id: 'pl-1',
    name: 'Main Dining Room',
    channel: 'dine-in',
    locations: ['store-1'],
    currency: 'USD',
    status: 'active',
    isDefault: true,
    updatedAt: '2024-08-12T15:45:00Z',
    items: mockProductVariants.map((variant) => ({
      productId: variant.productId,
      variantId: variant.id,
      price: variant.price,
      isOverride: false,
    })),
  },
  {
    id: 'pl-2',
    name: 'Delivery Platforms',
    channel: 'delivery',
    locations: ['store-1'],
    currency: 'USD',
    status: 'active',
    schedule: {
      start: '2024-08-01T00:00:00Z',
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    updatedAt: '2024-08-09T10:00:00Z',
    items: mockProductVariants
      .filter((variant) => variant.channels.includes('delivery'))
      .map((variant) => ({
        productId: variant.productId,
        variantId: variant.id,
        price: Number((variant.price + 1.5).toFixed(2)),
        compareAtPrice: variant.price,
        isOverride: true,
      })),
  },
  {
    id: 'pl-3',
    name: 'Happy Hour Specials',
    channel: 'happy-hour',
    locations: ['store-1'],
    currency: 'USD',
    status: 'scheduled',
    schedule: {
      start: '2024-08-15T16:00:00Z',
      end: '2024-08-15T19:00:00Z',
      daysOfWeek: ['Thu', 'Fri'],
      timeWindow: {
        start: '16:00',
        end: '19:00',
      },
    },
    updatedAt: '2024-08-05T09:30:00Z',
    items: [
      {
        productId: 'prod-5',
        variantId: 'var-5',
        price: 6.5,
        compareAtPrice: 7.99,
        isOverride: true,
      },
      {
        productId: 'prod-1',
        variantId: 'prod-1-base',
        price: 10.5,
        compareAtPrice: 12.99,
        isOverride: true,
      },
      {
        productId: 'prod-6',
        variantId: 'prod-6-base',
        price: 12.99,
        compareAtPrice: 14.99,
        isOverride: true,
      },
    ],
  },
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Smith',
    phone: '555-0101',
    email: 'john.smith@email.com',
    loyaltyPoints: 1250,
    storeCreditBalance: 15.50
  },
  {
    id: 'cust-2',
    name: 'Emily Davis',
    phone: '555-0102',
    email: 'emily.davis@email.com',
    loyaltyPoints: 750,
    storeCreditBalance: 0
  },
  {
    id: 'cust-3',
    name: 'Michael Johnson',
    phone: '555-0103',
    loyaltyPoints: 2100,
    storeCreditBalance: 25.00
  }
];