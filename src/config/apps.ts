import { AppConfig, UserRole } from '../types';

export const appConfigs: AppConfig[] = [
  {
    id: 'portal',
    name: 'Suite Launcher',
    description: 'Access all applications',
    icon: 'Grid3x3',
    route: '/portal',
    roles: ['cashier', 'waiter', 'bartender', 'supervisor', 'manager', 'owner'],
    tier: 'core'
  },
  {
    id: 'pos',
    name: 'Point of Sale',
    description: 'Process orders and payments',
    icon: 'ShoppingCart',
    route: '/pos',
    roles: ['cashier', 'waiter', 'bartender', 'supervisor', 'manager', 'owner'],
    tier: 'core',
    permissions: ['orders:manage'],
    featureFlags: ['pwa-ready'],
    isPWA: true
  },
  {
    id: 'kds',
    name: 'Kitchen Display',
    description: 'Manage kitchen orders',
    icon: 'Chef',
    route: '/kds',
    roles: ['supervisor', 'manager', 'owner'],
    tier: 'plus',
    permissions: ['kitchen:manage'],
    featureFlags: ['kitchen-suite']
  },
  {
    id: 'products',
    name: 'Product Catalog',
    description: 'Manage products and categories',
    icon: 'Package',
    route: '/products',
    roles: ['manager', 'owner'],
    tier: 'plus',
    permissions: ['catalog:manage']
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock management and tracking',
    icon: 'Archive',
    route: '/inventory',
    roles: ['manager', 'owner'],
    tier: 'plus',
    permissions: ['inventory:manage']
  },
  {
    id: 'customers',
    name: 'Customers',
    description: 'Customer management and loyalty',
    icon: 'Users',
    route: '/customers',
    roles: ['cashier', 'waiter', 'bartender', 'supervisor', 'manager', 'owner'],
    tier: 'core',
    permissions: ['customers:manage']
  },
  {
    id: 'promotions',
    name: 'Promotions',
    description: 'Discounts and promotional rules',
    icon: 'Percent',
    route: '/promotions',
    roles: ['supervisor', 'manager', 'owner'],
    tier: 'plus',
    permissions: ['promotions:manage']
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Sales and analytics reports',
    icon: 'BarChart3',
    route: '/reports',
    roles: ['supervisor', 'manager', 'owner'],
    tier: 'premium',
    permissions: ['reports:view'],
    featureFlags: ['preview:analytics-v2']
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Reservations and scheduling',
    icon: 'Calendar',
    route: '/calendar',
    roles: ['waiter', 'supervisor', 'manager', 'owner'],
    tier: 'plus',
    permissions: ['calendar:manage'],
    featureFlags: ['beta:calendar']
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Financial reporting and management',
    icon: 'DollarSign',
    route: '/accounting',
    roles: ['manager', 'owner'],
    tier: 'premium',
    permissions: ['accounting:view']
  },
  {
    id: 'backoffice',
    name: 'Back Office',
    description: 'Settings and administration',
    icon: 'Settings',
    route: '/backoffice',
    roles: ['manager', 'owner'],
    tier: 'premium',
    permissions: ['settings:manage'],
    featureFlags: ['preview:operations']
  }
];

export const getAvailableApps = (userRole: UserRole): AppConfig[] => {
  return appConfigs.filter(app => app.roles.includes(userRole));
};