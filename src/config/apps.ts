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
    description: 'Prioritize and bump kitchen tickets in real time',
    icon: 'UtensilsCrossed',
    route: '/kds',
    roles: ['supervisor', 'manager', 'owner'],
    heroImage: 'https://images.pexels.com/photos/5531556/pexels-photo-5531556.jpeg?auto=compress&cs=tinysrgb&w=640',
    heroImageAlt: 'Chef plating dishes beneath a kitchen display screen',
    heroAccent: '#EE766D'
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
    id: 'backoffice',
    name: 'Back Office',
    description: 'Settings and administration',
    icon: 'Settings',
    route: '/backoffice',
    roles: ['manager', 'owner']
  }
];

export const getAvailableApps = (userRole: UserRole): AppConfig[] => {
  return appConfigs.filter(app => app.roles.includes(userRole));
};