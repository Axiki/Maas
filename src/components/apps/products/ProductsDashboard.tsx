import React, { useEffect, useMemo, useState } from 'react';
import {
  ListChecks,
  Package,
  RefreshCcw,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { cn } from '@mas/utils';
import { MotionWrapper } from '../../ui/MotionWrapper';
import {
  DataTable,
  DataTableColumn,
  DataTablePagination
} from '../../ui/data-table';
import { useProductsAdminStore } from '../../../stores/productsAdminStore';
import {
  ProductAdminItem,
  ProductAdminModifierGroup,
  ProductAdminPriceList,
  ProductLifecycleStatus,
  ModifierGroupStatus,
  PriceListStatus
} from '../../../data/mockProductsAdmin';

const toneClasses: Record<
  'primary' | 'success' | 'warning' | 'neutral' | 'danger',
  string
> = {
  primary:
    'border-primary-200 bg-primary-100 text-primary-600 dark:bg-primary-200/20',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  neutral: 'border-line bg-surface-200 text-muted',
  danger: 'border-danger/20 bg-danger/10 text-danger'
};

const renderStatusPill = (
  label: string,
  tone: 'primary' | 'success' | 'warning' | 'neutral' | 'danger'
) => (
  <span
    className={cn(
      'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
      toneClasses[tone]
    )}
  >
    {label}
  </span>
);

const lifecyclePill = (status: ProductLifecycleStatus) => {
  switch (status) {
    case 'active':
      return renderStatusPill('Active', 'success');
    case 'draft':
      return renderStatusPill('Draft', 'warning');
    case 'archived':
      return renderStatusPill('Archived', 'neutral');
    default:
      return renderStatusPill(status, 'neutral');
  }
};

const modifierStatusPill = (status: ModifierGroupStatus) => {
  switch (status) {
    case 'active':
      return renderStatusPill('Active', 'success');
    case 'draft':
      return renderStatusPill('Draft', 'warning');
    case 'retired':
      return renderStatusPill('Retired', 'neutral');
    default:
      return renderStatusPill(status, 'neutral');
  }
};

const priceListStatusPill = (status: PriceListStatus) => {
  switch (status) {
    case 'live':
      return renderStatusPill('Live', 'success');
    case 'scheduled':
      return renderStatusPill('Scheduled', 'primary');
    case 'expired':
      return renderStatusPill('Expired', 'danger');
    default:
      return renderStatusPill(status, 'neutral');
  }
};

const formatCurrency = (value: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value);
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
};

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
};

const toTitleCase = (value: string) =>
  value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

type TabKey = 'items' | 'modifiers' | 'priceLists';

const tabs: Array<{ id: TabKey; label: string; description: string }> = [
  {
    id: 'items',
    label: 'Items',
    description: 'Catalog items, pricing and gross margin tracking'
  },
  {
    id: 'modifiers',
    label: 'Modifiers',
    description: 'Modifier groups, required rules and menu attachments'
  },
  {
    id: 'priceLists',
    label: 'Price Lists',
    description: 'Location-specific price schedules and sync status'
  }
];

const searchPlaceholders: Record<TabKey, string> = {
  items: 'Search items, SKUs, tags or locations…',
  modifiers: 'Search modifier groups or attached items…',
  priceLists: 'Search price lists, channels or locations…'
};

const pageSizeOptions: Record<TabKey, number[]> = {
  items: [5, 8, 12],
  modifiers: [5, 8, 12],
  priceLists: [5, 8, 12]
};

export const ProductsDashboard: React.FC = () => {
  const {
    items,
    modifiers,
    priceLists,
    isLoading,
    lastSyncedAt,
    initialize,
    refresh
  } = useProductsAdminStore();
  const [activeTab, setActiveTab] = useState<TabKey>('items');
  const [searchTerms, setSearchTerms] = useState<Record<TabKey, string>>({
    items: '',
    modifiers: '',
    priceLists: ''
  });
  const [page, setPage] = useState<Record<TabKey, number>>({
    items: 1,
    modifiers: 1,
    priceLists: 1
  });
  const [pageSize, setPageSize] = useState<Record<TabKey, number>>({
    items: 8,
    modifiers: 8,
    priceLists: 8
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  const filteredItems = useMemo(() => {
    const term = searchTerms.items.trim().toLowerCase();
    if (!term) {
      return items;
    }

    return items.filter((item) => {
      const haystack = [
        item.name,
        item.sku,
        item.category,
        item.location,
        item.status,
        item.salesChannel
      ]
        .join(' ')
        .toLowerCase();

      const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(term));
      return haystack.includes(term) || tagMatch;
    });
  }, [items, searchTerms.items]);

  const filteredModifiers = useMemo(() => {
    const term = searchTerms.modifiers.trim().toLowerCase();
    if (!term) {
      return modifiers;
    }

    return modifiers.filter((group) => {
      const haystack = [
        group.name,
        group.status,
        group.required ? 'required' : 'optional',
        ...group.appliesTo
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [modifiers, searchTerms.modifiers]);

  const filteredPriceLists = useMemo(() => {
    const term = searchTerms.priceLists.trim().toLowerCase();
    if (!term) {
      return priceLists;
    }

    return priceLists.filter((list) => {
      const haystack = [
        list.name,
        list.status,
        list.currency,
        ...list.channels,
        ...list.locations
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [priceLists, searchTerms.priceLists]);

  const itemsTotalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize.items));
  const modifiersTotalPages = Math.max(
    1,
    Math.ceil(filteredModifiers.length / pageSize.modifiers)
  );
  const priceListsTotalPages = Math.max(
    1,
    Math.ceil(filteredPriceLists.length / pageSize.priceLists)
  );

  const currentItemsPage = Math.min(page.items, itemsTotalPages);
  const currentModifiersPage = Math.min(page.modifiers, modifiersTotalPages);
  const currentPriceListsPage = Math.min(page.priceLists, priceListsTotalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentItemsPage - 1) * pageSize.items;
    return filteredItems.slice(startIndex, startIndex + pageSize.items);
  }, [filteredItems, currentItemsPage, pageSize.items]);

  const paginatedModifiers = useMemo(() => {
    const startIndex = (currentModifiersPage - 1) * pageSize.modifiers;
    return filteredModifiers.slice(startIndex, startIndex + pageSize.modifiers);
  }, [filteredModifiers, currentModifiersPage, pageSize.modifiers]);

  const paginatedPriceLists = useMemo(() => {
    const startIndex = (currentPriceListsPage - 1) * pageSize.priceLists;
    return filteredPriceLists.slice(startIndex, startIndex + pageSize.priceLists);
  }, [filteredPriceLists, currentPriceListsPage, pageSize.priceLists]);

  const tabCounts: Record<TabKey, number> = {
    items: filteredItems.length,
    modifiers: filteredModifiers.length,
    priceLists: filteredPriceLists.length
  };

  const handleSearchChange = (tab: TabKey, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [tab]: value }));
    setPage((prev) => ({ ...prev, [tab]: 1 }));
  };

  const handlePageChange = (tab: TabKey, nextPage: number) => {
    setPage((prev) => ({ ...prev, [tab]: nextPage }));
  };

  const handlePageSizeChange = (tab: TabKey, size: number) => {
    setPageSize((prev) => ({ ...prev, [tab]: size }));
    setPage((prev) => ({ ...prev, [tab]: 1 }));
  };

  const activeItems = useMemo(
    () => items.filter((item) => item.status === 'active').length,
    [items]
  );
  const draftItems = useMemo(
    () => items.filter((item) => item.status === 'draft').length,
    [items]
  );
  const activeModifiers = useMemo(
    () => modifiers.filter((group) => group.status === 'active').length,
    [modifiers]
  );
  const requiredModifiers = useMemo(
    () => modifiers.filter((group) => group.required).length,
    [modifiers]
  );
  const livePriceLists = useMemo(
    () => priceLists.filter((list) => list.status === 'live').length,
    [priceLists]
  );
  const scheduledPriceLists = useMemo(
    () => priceLists.filter((list) => list.status === 'scheduled').length,
    [priceLists]
  );

  const summaryCards = [
    {
      id: 'catalog',
      label: 'Catalog Items',
      value: items.length,
      meta: `${activeItems} active • ${draftItems} draft`,
      icon: Package
    },
    {
      id: 'modifiers',
      label: 'Modifier Groups',
      value: modifiers.length,
      meta: `${requiredModifiers} required • ${activeModifiers} active`,
      icon: SlidersHorizontal
    },
    {
      id: 'prices',
      label: 'Price Lists',
      value: priceLists.length,
      meta: `${livePriceLists} live • ${scheduledPriceLists} scheduled`,
      icon: ListChecks
    }
  ];

  const itemColumns = useMemo<DataTableColumn<ProductAdminItem>[]>(
    () => [
      {
        key: 'item',
        header: 'Item',
        width: '28%',
        cell: (item) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">{item.name}</span>
            <span className="text-xs text-muted">
              {item.sku} • {item.category}
            </span>
          </div>
        )
      },
      {
        key: 'tags',
        header: 'Tags',
        cell: (item) => (
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={`${item.id}-${tag}`}
                className="inline-flex items-center rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-muted">+{item.tags.length - 3} more</span>
            )}
          </div>
        )
      },
      {
        key: 'channel',
        header: 'Channel',
        cell: (item) => (
          <span className="text-sm font-medium text-ink">
            {item.salesChannel === 'all'
              ? 'All Channels'
              : toTitleCase(item.salesChannel)}
          </span>
        )
      },
      {
        key: 'price',
        header: 'Price',
        align: 'right',
        width: 120,
        cell: (item) => (
          <span className="font-semibold text-ink">
            {formatCurrency(item.price)}
          </span>
        )
      },
      {
        key: 'margin',
        header: 'Margin',
        align: 'right',
        width: 120,
        cell: (item) => {
          const grossMargin = Math.max(item.price - item.cost, 0);
          const marginPct = item.price > 0 ? (grossMargin / item.price) * 100 : 0;
          return (
            <div className="text-right">
              <p className="font-semibold text-ink">{formatCurrency(grossMargin)}</p>
              <p className="text-xs text-muted">{marginPct.toFixed(0)}% GM</p>
            </div>
          );
        }
      },
      {
        key: 'status',
        header: 'Status',
        align: 'right',
        width: 120,
        cell: (item) => lifecyclePill(item.status)
      },
      {
        key: 'updated',
        header: 'Updated',
        align: 'right',
        width: 180,
        cell: (item) => (
          <div className="text-right">
            <p className="font-medium text-ink">{formatDate(item.lastUpdated)}</p>
            <p className="text-xs text-muted">{item.location}</p>
          </div>
        )
      }
    ],
    []
  );

  const modifierColumns = useMemo<DataTableColumn<ProductAdminModifierGroup>[]>(
    () => [
      {
        key: 'group',
        header: 'Modifier Group',
        width: '30%',
        cell: (group) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">{group.name}</span>
            <span className="text-xs text-muted">
              {group.required ? 'Required' : 'Optional'} • {group.options} options
            </span>
          </div>
        )
      },
      {
        key: 'appliesTo',
        header: 'Attached To',
        cell: (group) => (
          <div className="flex flex-wrap gap-2">
            {group.appliesTo.slice(0, 3).map((item) => (
              <span
                key={`${group.id}-${item}`}
                className="inline-flex items-center rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-muted"
              >
                {item}
              </span>
            ))}
            {group.appliesTo.length > 3 && (
              <span className="text-xs text-muted">+{group.appliesTo.length - 3} more</span>
            )}
          </div>
        )
      },
      {
        key: 'itemsAttached',
        header: 'Items',
        align: 'right',
        width: 100,
        cell: (group) => (
          <div className="text-right">
            <p className="font-semibold text-ink">{group.itemsAttached}</p>
            <p className="text-xs text-muted">linked</p>
          </div>
        )
      },
      {
        key: 'status',
        header: 'Status',
        align: 'right',
        width: 120,
        cell: (group) => modifierStatusPill(group.status)
      },
      {
        key: 'updated',
        header: 'Updated',
        align: 'right',
        width: 200,
        cell: (group) => (
          <div className="text-right">
            <p className="font-medium text-ink">{formatDate(group.lastUpdated)}</p>
            <p className="text-xs text-muted">Last edit</p>
          </div>
        )
      }
    ],
    []
  );

  const priceListColumns = useMemo<DataTableColumn<ProductAdminPriceList>[]>(
    () => [
      {
        key: 'list',
        header: 'Price List',
        width: '30%',
        cell: (list) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">{list.name}</span>
            <span className="text-xs text-muted">{list.locations.join(', ')}</span>
          </div>
        )
      },
      {
        key: 'channels',
        header: 'Channels',
        cell: (list) => (
          <div className="flex flex-wrap gap-2">
            {list.channels.map((channel) => (
              <span
                key={`${list.id}-${channel}`}
                className="inline-flex items-center rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-muted"
              >
                {toTitleCase(channel)}
              </span>
            ))}
          </div>
        )
      },
      {
        key: 'items',
        header: 'Items',
        align: 'right',
        width: 100,
        cell: (list) => (
          <div className="text-right">
            <p className="font-semibold text-ink">{list.items}</p>
            <p className="text-xs text-muted">listed</p>
          </div>
        )
      },
      {
        key: 'status',
        header: 'Status',
        align: 'right',
        width: 120,
        cell: (list) => priceListStatusPill(list.status)
      },
      {
        key: 'effective',
        header: 'Effective Dates',
        align: 'right',
        width: 220,
        cell: (list) => (
          <div className="text-right">
            <p className="font-medium text-ink">From {formatDate(list.effectiveFrom)}</p>
            <p className="text-xs text-muted">
              {list.effectiveTo ? `Until ${formatDate(list.effectiveTo)}` : 'Continuous'}
            </p>
          </div>
        )
      },
      {
        key: 'synced',
        header: 'Last Synced',
        align: 'right',
        width: 200,
        cell: (list) => (
          <div className="text-right">
            <p className="font-medium text-ink">{formatDateTime(list.lastSynced)}</p>
            <p className="text-xs text-muted">Most recent publish</p>
          </div>
        )
      }
    ],
    []
  );

  const lastSyncedLabel = lastSyncedAt ? formatDateTime(lastSyncedAt) : 'Not synced yet';

  const renderActiveTable = () => {
    switch (activeTab) {
      case 'items':
        return (
          <div className="space-y-3">
            <DataTable<ProductAdminItem>
              data={paginatedItems}
              columns={itemColumns}
              maxBodyHeight={420}
              emptyState={
                isLoading
                  ? 'Loading item catalog…'
                  : 'No items match your current filters.'
              }
            />
            <DataTablePagination
              page={currentItemsPage}
              pageSize={pageSize.items}
              totalItems={filteredItems.length}
              onPageChange={(value) => handlePageChange('items', value)}
              onPageSizeChange={(value) => handlePageSizeChange('items', value)}
              pageSizeOptions={pageSizeOptions.items}
              className="rounded-xl border border-line/60 bg-surface-100 shadow-card"
            />
          </div>
        );
      case 'modifiers':
        return (
          <div className="space-y-3">
            <DataTable<ProductAdminModifierGroup>
              data={paginatedModifiers}
              columns={modifierColumns}
              maxBodyHeight={420}
              emptyState={
                isLoading
                  ? 'Loading modifier groups…'
                  : 'No modifier groups match your filters.'
              }
            />
            <DataTablePagination
              page={currentModifiersPage}
              pageSize={pageSize.modifiers}
              totalItems={filteredModifiers.length}
              onPageChange={(value) => handlePageChange('modifiers', value)}
              onPageSizeChange={(value) => handlePageSizeChange('modifiers', value)}
              pageSizeOptions={pageSizeOptions.modifiers}
              className="rounded-xl border border-line/60 bg-surface-100 shadow-card"
            />
          </div>
        );
      case 'priceLists':
        return (
          <div className="space-y-3">
            <DataTable<ProductAdminPriceList>
              data={paginatedPriceLists}
              columns={priceListColumns}
              maxBodyHeight={420}
              emptyState={
                isLoading
                  ? 'Loading price lists…'
                  : 'No price lists match your filters.'
              }
            />
            <DataTablePagination
              page={currentPriceListsPage}
              pageSize={pageSize.priceLists}
              totalItems={filteredPriceLists.length}
              onPageChange={(value) => handlePageChange('priceLists', value)}
              onPageSizeChange={(value) => handlePageSizeChange('priceLists', value)}
              pageSizeOptions={pageSizeOptions.priceLists}
              className="rounded-xl border border-line/60 bg-surface-100 shadow-card"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
                Products Admin
              </p>
              <h1 className="text-3xl font-bold text-ink">Products Dashboard</h1>
            </div>
            <p className="max-w-2xl text-sm text-muted">
              Search and curate your menu catalog, manage modifier logic, and align price lists for
              every channel. Use the filters below to focus on specific menu segments.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Last synced {lastSyncedLabel}
            </span>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCcw size={16} />
              Refresh data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {summaryCards.map(({ id, label, value, meta, icon: Icon }) => (
            <Card key={id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary-100">
                  <Icon size={20} className="text-primary-600" />
                </div>
                {renderStatusPill(`${value} total`, 'primary')}
              </div>
              <div>
                <p className="text-sm font-medium text-muted uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-semibold text-ink">{value}</p>
              </div>
              <p className="text-xs text-muted">{meta}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-line/60 bg-surface-100 p-4 shadow-card">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                      isActive
                        ? 'border-primary-500 bg-primary-500 text-white shadow-card'
                        : 'border-transparent bg-surface-200 text-ink hover:bg-surface-200/70'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-semibold',
                        isActive ? 'bg-white/20 text-white' : 'bg-surface-100 text-muted'
                      )}
                    >
                      {tabCounts[tab.id]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="w-full lg:w-72">
              <div className="relative flex items-center">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 text-muted"
                />
                <input
                  type="search"
                  value={searchTerms[activeTab]}
                  onChange={(event) => handleSearchChange(activeTab, event.target.value)}
                  placeholder={searchPlaceholders[activeTab]}
                  className="w-full rounded-lg border border-line bg-surface-100 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-muted">{tabs.find((tab) => tab.id === activeTab)?.description}</p>
        </div>

        {renderActiveTable()}
      </div>
    </MotionWrapper>
  );
};
