import {
  Product,
  Category,
  Customer,
  User,
  Store,
  Tenant,
  Supplier,
  PurchaseOrder,
  GoodsReceipt
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

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Coastal Produce Cooperative',
    contactName: 'Miguel Santos',
    contactEmail: 'orders@coastalproduce.com',
    contactPhone: '(555) 210-4456',
    categories: ['Produce', 'Herbs'],
    leadTimeDays: 2,
    rating: 4.8,
    lastOrderDate: new Date('2024-07-08T10:15:00'),
    nextDeliveryDate: new Date('2024-07-12T08:30:00'),
    terms: 'Net 15',
    notes: 'Delivers Monday, Wednesday, Friday before 10am.'
  },
  {
    id: 'sup-2',
    name: 'Harbor Meats & Provisions',
    contactName: 'Lena Fischer',
    contactEmail: 'lfischer@harbormeats.com',
    contactPhone: '(555) 308-2299',
    categories: ['Proteins', 'Dairy'],
    leadTimeDays: 3,
    rating: 4.6,
    lastOrderDate: new Date('2024-07-05T14:45:00'),
    nextDeliveryDate: new Date('2024-07-13T07:45:00'),
    terms: 'Net 30',
    notes: 'Aging room specials every Thursday. Requires dock access.'
  },
  {
    id: 'sup-3',
    name: 'Bluewave Beverages',
    contactName: 'Aaron Patel',
    contactEmail: 'aaron.patel@bluewavebev.com',
    contactPhone: '(555) 410-7721',
    categories: ['Beverages', 'Mixers'],
    leadTimeDays: 5,
    rating: 4.4,
    lastOrderDate: new Date('2024-07-02T09:30:00'),
    nextDeliveryDate: new Date('2024-07-16T09:00:00'),
    terms: 'Net 45',
    notes: 'Offers palletized delivery; provide liftgate instructions when ordering.'
  }
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1001',
    supplierId: 'sup-1',
    reference: '1001',
    status: 'draft',
    expectedOn: new Date('2024-07-12'),
    createdAt: new Date('2024-07-10T11:20:00'),
    totalAmount: 482.4,
    currency: 'USD',
    lines: [
      {
        id: 'po-1001-line-1',
        productName: 'Heirloom Tomatoes (case)',
        quantityOrdered: 12,
        unitCost: 24.5,
        receivedQuantity: 0
      },
      {
        id: 'po-1001-line-2',
        productName: 'Living Basil Plants',
        quantityOrdered: 18,
        unitCost: 7.8,
        receivedQuantity: 0
      }
    ],
    notes: 'Confirm organic certification for basil plants.'
  },
  {
    id: 'po-1002',
    supplierId: 'sup-2',
    reference: '1002',
    status: 'sent',
    expectedOn: new Date('2024-07-14'),
    createdAt: new Date('2024-07-09T16:00:00'),
    totalAmount: 1285.75,
    currency: 'USD',
    lines: [
      {
        id: 'po-1002-line-1',
        productName: 'Prime Ribeye (14oz)',
        quantityOrdered: 24,
        unitCost: 28.5,
        receivedQuantity: 0
      },
      {
        id: 'po-1002-line-2',
        productName: 'Cultured Butter (2lb)',
        quantityOrdered: 12,
        unitCost: 6.25,
        receivedQuantity: 0
      }
    ],
    notes: 'Request vacuum-sealed packs with 14-day shelf life.'
  },
  {
    id: 'po-0999',
    supplierId: 'sup-3',
    reference: '0999',
    status: 'received',
    expectedOn: new Date('2024-07-09'),
    createdAt: new Date('2024-07-04T13:30:00'),
    totalAmount: 612.9,
    currency: 'USD',
    lines: [
      {
        id: 'po-0999-line-1',
        productName: 'Sparkling Water (24pk)',
        quantityOrdered: 10,
        unitCost: 12.5,
        receivedQuantity: 8,
        variance: -2
      },
      {
        id: 'po-0999-line-2',
        productName: 'Ginger Beer (case)',
        quantityOrdered: 6,
        unitCost: 18.75,
        receivedQuantity: 6,
        variance: 0
      }
    ],
    notes: 'Partial shortage on sparkling water noted in GRN-901.'
  }
];

export const mockGoodsReceipts: GoodsReceipt[] = [
  {
    id: 'grn-901',
    purchaseOrderId: 'po-0999',
    supplierId: 'sup-3',
    reference: 'GRN-901',
    status: 'reconciled',
    receivedAt: new Date('2024-07-09T17:45:00'),
    receivedBy: 'Sarah Johnson',
    notes: 'Short two cases of sparkling water pending credit.',
    items: [
      {
        id: 'grn-901-item-1',
        productName: 'Sparkling Water (24pk)',
        orderedQuantity: 10,
        receivedQuantity: 8,
        unitCost: 12.5
      },
      {
        id: 'grn-901-item-2',
        productName: 'Ginger Beer (case)',
        orderedQuantity: 6,
        receivedQuantity: 6,
        unitCost: 18.75
      }
    ]
  },
  {
    id: 'grn-902',
    purchaseOrderId: 'po-1002',
    supplierId: 'sup-2',
    reference: 'GRN-902',
    status: 'pending',
    receivedAt: new Date('2024-07-10T15:10:00'),
    receivedBy: 'Devin Carter',
    notes: 'Awaiting butcher verification before posting receipt.',
    items: [
      {
        id: 'grn-902-item-1',
        productName: 'Prime Ribeye (14oz)',
        orderedQuantity: 24,
        receivedQuantity: 0,
        unitCost: 28.5
      }
    ]
  }
];
