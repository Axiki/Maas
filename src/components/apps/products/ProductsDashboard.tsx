import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import { TableToolbar } from '../../ui/TableToolbar';
import { DataTable, type DataTableColumn } from '../../ui/DataTable';
import {
  mockCategories,
  mockProducts,
  mockProductVariants,
  mockPriceLists,
  mockTenant,
} from '../../../data/mockData';
import type { Product, PriceList, ProductVariantSummary } from '../../../types';
import { cn } from '../../../utils';

type TabKey = 'items' | 'modifiers' | 'price-lists';

type ItemRow = {
  id: string;
  name: string;
  categoryName: string;
  sku: string;
  variants: number;
  modifiers: number;
  basePrice: number;
  margin: number;
  status: 'Active' | 'Inactive';
  lastUpdated: string;
  stations: string[];
};

type ModifierRow = {
  id: string;
  groupName: string;
  products: string[];
  options: number;
  minPrice: number;
  maxPrice: number;
  required: boolean;
  maxSelections: number;
  lastUpdated: string;
};

type PriceListRow = PriceList & {
  itemCount: number;
  overrideCount: number;
};

interface ProductsDashboardContextValue {
  items: ItemRow[];
  modifiers: ModifierRow[];
  priceLists: PriceListRow[];
  searchTerms: Record<TabKey, string>;
  activeTab: TabKey;
  setSearchTerm: (tab: TabKey, value: string) => void;
  formatCurrency: (value: number) => string;
}

const ProductsDashboardContext = React.createContext<ProductsDashboardContextValue | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useProductsDashboard = () => {
  const context = React.useContext(ProductsDashboardContext);

  if (!context) {
    throw new Error('useProductsDashboard must be used within ProductsDashboardContext');
  }

  return context;
};

const TABS: Array<{
  key: TabKey;
  label: string;
  route: string;
  description: string;
}> = [
  { key: 'items', label: 'Items', route: 'items', description: 'Menu items and variants' },
  { key: 'modifiers', label: 'Modifiers', route: 'modifiers', description: 'Modifier groups and options' },
  { key: 'price-lists', label: 'Price Lists', route: 'price-lists', description: 'Channel-specific pricing' },
];

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const DATE_RANGE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const actionLabelMap: Record<TabKey, string> = {
  items: 'New item',
  modifiers: 'New modifier set',
  'price-lists': 'New price list',
};

const placeholderMap: Record<TabKey, string> = {
  items: 'Search items, categories, or SKUs…',
  modifiers: 'Search modifier groups or products…',
  'price-lists': 'Search price lists or channels…',
};

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return DATE_FORMATTER.format(date);
};

const formatDateRange = (start?: string, end?: string) => {
  if (!start && !end) {
    return 'Always on';
  }

  const startDate = start ? DATE_RANGE_FORMATTER.format(new Date(start)) : undefined;
  const endDate = end ? DATE_RANGE_FORMATTER.format(new Date(end)) : undefined;

  if (startDate && endDate) {
    return `${startDate} – ${endDate}`;
  }

  return startDate ?? endDate ?? 'Always on';
};

const joinDays = (days?: string[]) => {
  if (!days || days.length === 0) {
    return 'Every day';
  }

  if (days.length === 7) {
    return 'Every day';
  }

  return days.join(' · ');
};

export const ProductsDashboard: React.FC = () => {
  const location = useLocation();
  const [searchTerms, setSearchTerms] = React.useState<Record<TabKey, string>>({
    items: '',
    modifiers: '',
    'price-lists': '',
  });

  const activeTab = React.useMemo<TabKey>(() => {
    const lastSegment = location.pathname.split('/').filter(Boolean).pop();
    const match = TABS.find((tab) => tab.route === lastSegment);
    return match?.key ?? 'items';
  }, [location.pathname]);

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: mockTenant.settings.currency,
      }),
    [],
  );

  const formatCurrency = React.useCallback(
    (value: number) => currencyFormatter.format(value),
    [currencyFormatter],
  );

  const handleSearchChange = React.useCallback((tab: TabKey, value: string) => {
    setSearchTerms((prev) => ({
      ...prev,
      [tab]: value,
    }));
  }, []);

  const categoryLookup = React.useMemo(() => {
    const map = new Map<string, string>();
    mockCategories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, []);

  const productVariantLookup = React.useMemo(() => {
    const map = new Map<string, ProductVariantSummary>();
    mockProductVariants.forEach((variant) => {
      if (variant.isPrimary && !map.has(variant.productId)) {
        map.set(variant.productId, variant);
      }
    });
    return map;
  }, []);

  const productUpdatedLookup = React.useMemo(() => {
    const map = new Map<string, string>();
    mockProductVariants.forEach((variant) => {
      const existing = map.get(variant.productId);
      if (!existing || new Date(variant.lastUpdated) > new Date(existing)) {
        map.set(variant.productId, variant.lastUpdated);
      }
    });
    return map;
  }, []);

  const items = React.useMemo<ItemRow[]>(() => {
    return mockProducts.map((product: Product) => {
      const primaryVariant = productVariantLookup.get(product.id);
      const sku = primaryVariant?.sku ?? product.barcode ?? '—';
      const variants = Math.max(product.variants.length, 1);
      const modifiers = product.modifierGroups.reduce(
        (total, group) => total + group.modifiers.length,
        0,
      );
      const margin = product.price
        ? Number((((product.price - product.cost) / product.price) * 100).toFixed(1))
        : 0;
      const lastUpdated = productUpdatedLookup.get(product.id) ?? new Date().toISOString();

      return {
        id: product.id,
        name: product.name,
        categoryName: categoryLookup.get(product.categoryId) ?? 'Uncategorized',
        sku,
        variants,
        modifiers,
        basePrice: product.price,
        margin,
        status: product.isActive ? 'Active' : 'Inactive',
        lastUpdated,
        stations: product.stationTags,
      };
    });
  }, [categoryLookup, productVariantLookup, productUpdatedLookup]);

  const modifiers = React.useMemo<ModifierRow[]>(() => {
    const grouped = new Map<string, ModifierRow>();

    mockProducts.forEach((product) => {
      product.modifierGroups.forEach((group) => {
        const existing = grouped.get(group.id);
        const minPrice = group.modifiers.reduce(
          (min, modifier) => Math.min(min, modifier.price),
          Number.POSITIVE_INFINITY,
        );
        const maxPrice = group.modifiers.reduce(
          (max, modifier) => Math.max(max, modifier.price),
          0,
        );
        const updatedAt = productUpdatedLookup.get(product.id) ?? new Date().toISOString();

        if (existing) {
          const uniqueProducts = new Set(existing.products.concat(product.name));
          grouped.set(group.id, {
            ...existing,
            products: Array.from(uniqueProducts),
            minPrice: Math.min(existing.minPrice, minPrice === Number.POSITIVE_INFINITY ? 0 : minPrice),
            maxPrice: Math.max(existing.maxPrice, maxPrice),
            lastUpdated:
              new Date(updatedAt) > new Date(existing.lastUpdated)
                ? updatedAt
                : existing.lastUpdated,
          });
        } else {
          grouped.set(group.id, {
            id: group.id,
            groupName: group.name,
            products: [product.name],
            options: group.modifiers.length,
            minPrice: minPrice === Number.POSITIVE_INFINITY ? 0 : minPrice,
            maxPrice,
            required: group.required,
            maxSelections: group.maxSelections,
            lastUpdated: updatedAt,
          });
        }
      });
    });

    return Array.from(grouped.values()).sort((a, b) => a.groupName.localeCompare(b.groupName));
  }, [productUpdatedLookup]);

  const priceListRows = React.useMemo<PriceListRow[]>(() => {
    return mockPriceLists.map((list) => ({
      ...list,
      itemCount: list.items.length,
      overrideCount: list.items.filter((item) => item.isOverride).length,
    }));
  }, []);

  const tabCounts = React.useMemo(
    () => ({
      items: items.length,
      modifiers: modifiers.length,
      'price-lists': priceListRows.length,
    }),
    [items.length, modifiers.length, priceListRows.length],
  );

  const contextValue = React.useMemo<ProductsDashboardContextValue>(
    () => ({
      items,
      modifiers,
      priceLists: priceListRows,
      searchTerms,
      activeTab,
      setSearchTerm: handleSearchChange,
      formatCurrency,
    }),
    [items, modifiers, priceListRows, searchTerms, activeTab, handleSearchChange, formatCurrency],
  );

  const actions = React.useMemo(() => {
    const label = actionLabelMap[activeTab];

    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-100 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary-500 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
        >
          <Filter size={16} aria-hidden="true" />
          Filters
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
        >
          <Plus size={16} aria-hidden="true" />
          {label}
        </button>
      </div>
    );
  }, [activeTab]);

  return (
    <ProductsDashboardContext.Provider value={contextValue}>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex h-full flex-col gap-6 p-6"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-ink">Product Catalog</h1>
              <p className="text-sm text-muted">
                Organize your menu, fine-tune modifiers, and manage pricing across every channel.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <div className="rounded-lg bg-surface-200 px-3 py-1.5 font-medium text-ink">
                {tabCounts.items} items
              </div>
              <div className="rounded-lg bg-surface-200 px-3 py-1.5 font-medium text-ink">
                {tabCounts.modifiers} modifier sets
              </div>
              <div className="rounded-lg bg-surface-200 px-3 py-1.5 font-medium text-ink">
                {tabCounts['price-lists']} price lists
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Product catalog sections">
            {TABS.map((tab) => (
              <NavLink
                key={tab.key}
                to={tab.route}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200',
                    isActive || activeTab === tab.key
                      ? 'border-primary-500 bg-primary-100 text-primary-700'
                      : 'border-transparent bg-surface-200 text-muted hover:text-ink',
                  )
                }
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-semibold text-ink">
                  {tabCounts[tab.key]}
                </span>
              </NavLink>
            ))}
          </nav>

          <TableToolbar
            searchValue={searchTerms[activeTab]}
            onSearchChange={(value) => handleSearchChange(activeTab, value)}
            placeholder={placeholderMap[activeTab]}
            actions={actions}
          />
        </div>

        <div className="flex-1">
          <Outlet />
        </div>
      </motion.section>
    </ProductsDashboardContext.Provider>
  );
};

const useFilteredItems = () => {
  const { items, searchTerms, formatCurrency } = useProductsDashboard();
  const searchTerm = searchTerms.items.trim().toLowerCase();

  const filteredItems = React.useMemo(() => {
    if (!searchTerm) {
      return items;
    }

    return items.filter((item) => {
      const haystack = [
        item.name,
        item.categoryName,
        item.sku,
        item.status,
        item.stations.join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchTerm);
    });
  }, [items, searchTerm]);

  const columns = React.useMemo<Array<DataTableColumn<ItemRow>>>(() => {
    return [
      {
        header: 'Item',
        render: (item) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">{item.name}</span>
            <span className="text-xs text-muted">{item.categoryName}</span>
          </div>
        ),
        className: 'min-w-[200px]',
      },
      {
        header: 'SKU',
        render: (item) => (
          <span className="font-tabular text-sm text-ink/80">{item.sku}</span>
        ),
      },
      {
        header: 'Variants',
        align: 'center',
        render: (item) => (
          <span className="font-semibold text-ink">{item.variants}</span>
        ),
      },
      {
        header: 'Modifiers',
        align: 'center',
        render: (item) => (
          <span className="font-semibold text-ink">{item.modifiers}</span>
        ),
      },
      {
        header: 'Base price',
        render: (item) => (
          <span className="font-tabular text-sm text-ink">{formatCurrency(item.basePrice)}</span>
        ),
      },
      {
        header: 'Margin',
        render: (item) => (
          <span className={cn('font-semibold', item.margin >= 60 ? 'text-success' : 'text-ink')}>
            {item.margin}%
          </span>
        ),
      },
      {
        header: 'Status',
        render: (item) => (
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
              item.status === 'Active'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-surface-200 text-muted',
            )}
          >
            <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
            {item.status}
          </span>
        ),
      },
      {
        header: 'Updated',
        render: (item) => (
          <div className="flex flex-col">
            <span className="text-sm text-ink">{formatDateTime(item.lastUpdated)}</span>
            <span className="text-xs text-muted">{item.stations.join(', ') || '—'}</span>
          </div>
        ),
      },
    ];
  }, [formatCurrency]);

  return { filteredItems, columns };
};

const useFilteredModifiers = () => {
  const { modifiers, searchTerms, formatCurrency } = useProductsDashboard();
  const searchTerm = searchTerms.modifiers.trim().toLowerCase();

  const filteredModifiers = React.useMemo(() => {
    if (!searchTerm) {
      return modifiers;
    }

    return modifiers.filter((modifier) => {
      const haystack = [modifier.groupName, modifier.products.join(' ')].join(' ').toLowerCase();
      return haystack.includes(searchTerm);
    });
  }, [modifiers, searchTerm]);

  const columns = React.useMemo<Array<DataTableColumn<ModifierRow>>>(() => {
    return [
      {
        header: 'Modifier group',
        render: (modifier) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">{modifier.groupName}</span>
            <span className="text-xs text-muted">{modifier.products.join(', ')}</span>
          </div>
        ),
        className: 'min-w-[220px]',
      },
      {
        header: 'Options',
        align: 'center',
        render: (modifier) => (
          <span className="font-semibold text-ink">{modifier.options}</span>
        ),
      },
      {
        header: 'Price range',
        render: (modifier) => (
          <span className="font-tabular text-sm text-ink">
            {modifier.minPrice === modifier.maxPrice
              ? modifier.minPrice === 0
                ? 'Included'
                : formatCurrency(modifier.minPrice)
              : `${formatCurrency(modifier.minPrice)} – ${formatCurrency(modifier.maxPrice)}`}
          </span>
        ),
      },
      {
        header: 'Rules',
        render: (modifier) => (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-full bg-surface-200 px-2 py-0.5 font-medium text-ink">
              Max {modifier.maxSelections}
            </span>
            <span className="rounded-full bg-surface-200 px-2 py-0.5 font-medium text-ink">
              {modifier.required ? 'Required' : 'Optional'}
            </span>
          </div>
        ),
      },
      {
        header: 'Updated',
        render: (modifier) => (
          <span className="text-sm text-ink">{formatDateTime(modifier.lastUpdated)}</span>
        ),
      },
    ];
  }, [formatCurrency]);

  return { filteredModifiers, columns };
};

const useFilteredPriceLists = () => {
  const { priceLists, searchTerms } = useProductsDashboard();
  const searchTerm = searchTerms['price-lists'].trim().toLowerCase();

  const filteredPriceLists = React.useMemo(() => {
    if (!searchTerm) {
      return priceLists;
    }

    return priceLists.filter((list) => {
      const haystack = [
        list.name,
        list.channel,
        list.locations.join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchTerm);
    });
  }, [priceLists, searchTerm]);

  const columns = React.useMemo<Array<DataTableColumn<PriceListRow>>>(() => {
    return [
      {
        header: 'Price list',
        render: (list) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">{list.name}</span>
            <span className="text-xs uppercase tracking-wide text-muted">{list.channel}</span>
          </div>
        ),
        className: 'min-w-[220px]',
      },
      {
        header: 'Locations',
        render: (list) => (
          <div className="flex flex-wrap gap-2">
            {list.locations.map((location) => (
              <span
                key={location}
                className="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-ink"
              >
                {location}
              </span>
            ))}
          </div>
        ),
      },
      {
        header: 'Items',
        align: 'center',
        render: (list) => (
          <div className="flex flex-col items-center">
            <span className="font-semibold text-ink">{list.itemCount}</span>
            {list.overrideCount > 0 ? (
              <span className="text-xs text-muted">{list.overrideCount} overrides</span>
            ) : null}
          </div>
        ),
      },
      {
        header: 'Schedule',
        render: (list) => (
          <div className="flex flex-col text-sm text-ink">
            <span>{formatDateRange(list.schedule?.start, list.schedule?.end)}</span>
            <span className="text-xs text-muted">{joinDays(list.schedule?.daysOfWeek)}</span>
          </div>
        ),
      },
      {
        header: 'Status',
        render: (list) => (
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
              list.status === 'active'
                ? 'bg-primary-100 text-primary-700'
                : list.status === 'scheduled'
                  ? 'bg-surface-200 text-ink'
                  : 'bg-surface-200 text-muted',
            )}
          >
            <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
            {list.status.replace('-', ' ')}
          </span>
        ),
      },
      {
        header: 'Last updated',
        render: (list) => (
          <span className="text-sm text-ink">{formatDateTime(list.updatedAt)}</span>
        ),
      },
    ];
  }, []);

  return { filteredPriceLists, columns };
};
export const ProductsItemsRoute: React.FC = () => {
  const { filteredItems, columns } = useFilteredItems();

  return (
    <DataTable
      data={filteredItems}
      columns={columns}
      getRowId={(item) => item.id}
      emptyState={{
        title: 'No items found',
        description: 'Try adjusting your search or create a new menu item.',
      }}
    />
  );
};

export const ProductsModifiersRoute: React.FC = () => {
  const { filteredModifiers, columns } = useFilteredModifiers();

  return (
    <DataTable
      data={filteredModifiers}
      columns={columns}
      getRowId={(modifier) => modifier.id}
      emptyState={{
        title: 'No modifier groups found',
        description: 'Search again or create a new modifier set for your items.',
      }}
    />
  );
};

export const ProductsPriceListsRoute: React.FC = () => {
  const { filteredPriceLists, columns } = useFilteredPriceLists();

  return (
    <DataTable
      data={filteredPriceLists}
      columns={columns}
      getRowId={(list) => list.id}
      emptyState={{
        title: 'No price lists match your filters',
        description: 'Adjust your search or create a new price list for a channel.',
      }}
    />
  );
};
