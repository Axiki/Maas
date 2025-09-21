import { AppConfig } from '../types';

export const appConfigs: AppConfig[] = [
  {
    id: 'portal',
    name: 'Suite Launcher',
    description: 'Access all applications',
    icon: 'Grid3x3',
    route: '/portal',
    roles: ['cashier', 'waiter', 'bartender', 'supervisor', 'manager', 'owner'],
    tier: 'core',
    access: {
      requiresSubscription: 'core'
    },
    isFavorite: true
  },
  {
    id: 'pos',
    name: 'Point of Sale',
    description: 'Process orders and payments',
    icon: 'ShoppingCart',
    route: '/pos',
    roles: ['cashier', 'waiter', 'bartender', 'supervisor', 'manager', 'owner'],
    tier: 'core',
    access: {
      requiresSubscription: 'core'
    },
    isFavorite: true,
    isPWA: true
  },
  {
    id: 'kds',
    name: 'Kitchen Display',
    description: 'Manage kitchen orders',
    icon: 'Chef',
    route: '/kds',
    roles: ['supervisor', 'manager', 'owner'],
    tier: 'pro',
    access: {
      requiresSubscription: 'pro',
      requiredPermissions: ['kitchen:view'],
      restricted: true,
      restrictionLabel: 'Kitchen Ops'
    }
  },
  {
    id: 'products',
    name: 'Product Catalog',
    description: 'Manage products and categories',
    icon: 'Package',
    route: '/products',
    roles: ['manager', 'owner'],
    tier: 'pro',
    access: {
      requiresSubscription: 'pro',
      requiredPermissions: ['catalog:manage']
    }
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock management and tracking',
    icon: 'Archive',
    route: '/inventory',
    roles: ['manager', 'owner'],
    tier: 'pro',
    access: {
      requiresSubscription: 'pro',
      requiredPermissions: ['inventory:manage'],
      restricted: true,
      restrictionLabel: 'Inventory'
    }
  },
  {
    id: 'customers',
    name: 'Customers',
    description: 'Customer management and loyalty',
    icon: 'Users',
    route: '/customers',
    roles: ['cashier', 'waiter', 'bartender', 'supervisor', 'manager', 'owner'],
    tier: 'core',
    access: {
      requiresSubscription: 'core'
    }
  },
  {
    id: 'promotions',
    name: 'Promotions',
    description: 'Discounts and promotional rules',
    icon: 'Percent',
    route: '/promotions',
    roles: ['supervisor', 'manager', 'owner'],
    tier: 'pro',
    access: {
      requiresSubscription: 'pro',
      requiredPermissions: ['promotions:manage'],
      restricted: true,
      restrictionLabel: 'Marketing'
    }
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Sales and analytics reports',
    icon: 'BarChart3',
    route: '/reports',
    roles: ['supervisor', 'manager', 'owner'],
    tier: 'pro',
    access: {
      requiresSubscription: 'pro',
      requiredPermissions: ['reports:view'],
      restricted: true,
      restrictionLabel: 'Analytics'
    },
    hasNotifications: true
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Reservations and scheduling',
    icon: 'Calendar',
    route: '/calendar',
    roles: ['waiter', 'supervisor', 'manager', 'owner'],
    tier: 'pro',
    access: {
      requiresSubscription: 'pro',
      requiredPermissions: ['reservations:manage']
    },
    isNew: true
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Financial reporting and management',
    icon: 'DollarSign',
    route: '/accounting',
    roles: ['manager', 'owner'],
    tier: 'enterprise',
    access: {
      requiresSubscription: 'enterprise',
      requiredPermissions: ['finance:read'],
      restricted: true,
      restrictionLabel: 'Finance'
    }
  },
  {
    id: 'backoffice',
    name: 'Back Office',
    description: 'Settings and administration',
    icon: 'Settings',
    route: '/backoffice',
    roles: ['manager', 'owner'],
    tier: 'enterprise',
    access: {
      requiresSubscription: 'enterprise',
      requiredPermissions: ['settings:write'],
      restricted: true,
      restrictionLabel: 'Administration'
    }
  }
];
