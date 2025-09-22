import { AppConfig } from '../types';

export interface NavigationBranch {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  subItems?: NavigationBranch[];
}

// Core Operations Branch
const coreOperationsBranch: NavigationBranch = {
  id: 'core-operations',
  name: 'Operations',
  description: 'Core business operations',
  icon: 'ShoppingCart',
  route: '/pos',
  subItems: [
    {
      id: 'pos',
      name: 'Point of Sale',
      description: 'Process orders and payments',
      icon: 'ShoppingCart',
      route: '/pos'
    },
    {
      id: 'kds',
      name: 'Kitchen Display',
      description: 'Manage kitchen orders',
      icon: 'ChefHat',
      route: '/kds'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Reservations and scheduling',
      icon: 'Calendar',
      route: '/calendar'
    },
    {
      id: 'customers',
      name: 'Customers',
      description: 'Customer management and loyalty',
      icon: 'Users',
      route: '/customers'
    }
  ]
};

// Product Management Branch
const productManagementBranch: NavigationBranch = {
  id: 'product-management',
  name: 'Products',
  description: 'Product and inventory management',
  icon: 'Package',
  route: '/products',
  subItems: [
    {
      id: 'products',
      name: 'Product Catalog',
      description: 'Manage products and categories',
      icon: 'Package',
      route: '/products'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      description: 'Stock management and tracking',
      icon: 'Archive',
      route: '/inventory'
    },
    {
      id: 'purchasing',
      name: 'Purchasing',
      description: 'Suppliers and purchase orders',
      icon: 'Truck',
      route: '/purchasing'
    },
    {
      id: 'promotions',
      name: 'Promotions',
      description: 'Discounts and promotional rules',
      icon: 'Percent',
      route: '/promotions'
    }
  ]
};

// Business Intelligence Branch
const businessIntelligenceBranch: NavigationBranch = {
  id: 'business-intelligence',
  name: 'Analytics',
  description: 'Reports and business insights',
  icon: 'BarChart3',
  route: '/reports',
  subItems: [
    {
      id: 'reports',
      name: 'Reports',
      description: 'Sales and analytics reports',
      icon: 'BarChart3',
      route: '/reports'
    },
    {
      id: 'accounting',
      name: 'Accounting',
      description: 'Financial reporting and management',
      icon: 'DollarSign',
      route: '/accounting'
    }
  ]
};

// Administration Branch
const administrationBranch: NavigationBranch = {
  id: 'administration',
  name: 'Admin',
  description: 'Settings and administration',
  icon: 'Settings',
  route: '/backoffice',
  subItems: [
    {
      id: 'backoffice',
      name: 'Back Office',
      description: 'Settings and administration',
      icon: 'Settings',
      route: '/backoffice'
    },
    {
      id: 'devices',
      name: 'Devices',
      description: 'Manage registers and printers',
      icon: 'Monitor',
      route: '/devices'
    },
    {
      id: 'imports',
      name: 'Imports',
      description: 'Bulk CSV import with validation',
      icon: 'Upload',
      route: '/imports'
    }
  ]
};

// Development Branch
const developmentBranch: NavigationBranch = {
  id: 'development',
  name: 'Dev Tools',
  description: 'Development and testing tools',
  icon: 'Sparkles',
  route: '/ux-demo',
  subItems: [
    {
      id: 'ux-demo',
      name: 'UX Demo',
      description: 'Component showcase',
      icon: 'Sparkles',
      route: '/ux-demo'
    }
  ]
};

// Main navigation branches - ordered by priority
export const navigationBranches: NavigationBranch[] = [
  coreOperationsBranch,
  productManagementBranch,
  businessIntelligenceBranch,
  administrationBranch,
  developmentBranch
];

// Helper function to get branch by route
export const getBranchByRoute = (route: string): NavigationBranch | null => {
  for (const branch of navigationBranches) {
    if (branch.route === route) {
      return branch;
    }
    if (branch.subItems) {
      const subItem = branch.subItems.find(sub => sub.route === route);
      if (subItem) {
        return subItem;
      }
    }
  }
  return null;
};

// Helper function to get all available routes
export const getAllRoutes = (): string[] => {
  const routes: string[] = [];

  navigationBranches.forEach(branch => {
    routes.push(branch.route);
    if (branch.subItems) {
      branch.subItems.forEach(subItem => {
        routes.push(subItem.route);
      });
    }
  });

  return routes;
};

// Helper function to check if a route is a main branch route
export const isMainBranchRoute = (route: string): boolean => {
  return navigationBranches.some(branch => branch.route === route);
};

// Helper function to get sub-items for a branch
export const getBranchSubItems = (branchId: string): NavigationBranch[] => {
  const branch = navigationBranches.find(b => b.id === branchId);
  return branch?.subItems || [];
};
