import { AppConfig, UserRole } from '../types';

export const appConfigs: AppConfig[] = [
  {
    id: 'portal',
    name: 'Suite Launcher',
    description: 'Access all applications',
    icon: 'Grid3x3',
    route: '/portal',
    roles: ['cashier', 'waiter', 'bartender', 'supervisor', 'manager', 'owner']
  },
  {
    id: 'pos',
    name: 'Point of Sale',
    description: 'Process orders and payments',
    icon: 'ShoppingCart',
    route: '/pos',
    roles: ['cashier', 'waiter', 'bartender', 'supervisor', 'manager', 'owner'],
    isPWA: true
  },
  {
    id: 'kds',
    name: 'Kitchen Display',
    description: 'Manage kitchen orders',
    icon: 'Chef',
    route: '/kds',
    roles: ['supervisor', 'manager', 'owner']
  },
  {
    id: 'products',
    name: 'Product Catalog',
    description: 'Manage products and categories',
    icon: 'Package',
    route: '/products',
    roles: ['manager', 'owner']
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock management and tracking',
    icon: 'Archive',
    route: '/inventory',
    roles: ['manager', 'owner']
  },
  {
    id: 'purchasing',
    name: 'Purchasing',
    description: 'Suppliers, purchase orders, and goods received notes',
    icon: 'Truck',
    route: '/purchasing',
    roles: ['manager', 'owner']
  },
  {
    id: 'customers',
    name: 'Customers',
    description: 'Customer management and loyalty',
    icon: 'Users',
    route: '/customers',
    roles: ['cashier', 'waiter', 'bartender', 'supervisor', 'manager', 'owner']
  },
  {
    id: 'promotions',
    name: 'Promotions',
    description: 'Discounts and promotional rules',
    icon: 'Percent',
    route: '/promotions',
    roles: ['supervisor', 'manager', 'owner']
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Sales and analytics reports',
    icon: 'BarChart3',
    route: '/reports',
    roles: ['supervisor', 'manager', 'owner']
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Reservations and scheduling',
    icon: 'Calendar',
    route: '/calendar',
    roles: ['waiter', 'supervisor', 'manager', 'owner']
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Financial reporting and management',
    icon: 'DollarSign',
    route: '/accounting',
    roles: ['manager', 'owner']
  },
  {
    id: 'imports',
    name: 'Imports',
    description: 'Bulk CSV import with validation',
    icon: 'Upload',
    route: '/imports',
    roles: ['manager', 'owner']
  },
  {
    id: 'backoffice',
    name: 'Back Office',
    description: 'Settings and administration',
    icon: 'Settings',
    route: '/backoffice',
    roles: ['manager', 'owner']
  },
  {
    id: 'devices',
    name: 'Devices',
    description: 'Manage registers, printers, and diagnostics',
    icon: 'Monitor',
    route: '/devices',
    roles: ['supervisor', 'manager', 'owner']
  },
  {
    id: 'ux-demo',
    name: 'UX Demo',
    description: 'Showcase of UX polish components',
    icon: 'Sparkles',
    route: '/ux-demo',
    roles: ['manager', 'owner']
  }
];

export const getAvailableApps = (userRole: UserRole): AppConfig[] => {
  return appConfigs.filter(app => app.roles.includes(userRole));
};
