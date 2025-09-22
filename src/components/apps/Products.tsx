 import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, Tags, Layers, PackageSearch, MoreHorizontal } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';
import { FilterDropdown } from '../ui/FilterDropdown';

const products = [
  {
    id: 'prod-001',
    name: 'House Sourdough Loaf',
    sku: 'BK-001',
    category: 'Bakery',
    price: 6.5,
    status: 'Active',
    stock: 48
  },
  {
    id: 'prod-002',
    name: 'Smoked Brisket Sandwich',
    sku: 'FD-014',
    category: 'Kitchen',
    price: 14,
    status: 'Active',
    stock: 22
  },
  {
    id: 'prod-003',
    name: 'Seasonal Citrus Tonic',
    sku: 'BR-021',
    category: 'Beverage',
    price: 5,
    status: '86ed',
    stock: 0
  }
];

const categories = [
  { id: 'bakery', label: 'Bakery', products: 24 },
  { id: 'kitchen', label: 'Kitchen', products: 54 },
  { id: 'bar', label: 'Beverages', products: 31 }
];

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const filterSections = [
    {
      id: 'category',
      title: 'Category',
      type: 'checkbox' as const,
      options: [
        { id: 'bakery', label: 'Bakery', count: 24 },
        { id: 'kitchen', label: 'Kitchen', count: 54 },
        { id: 'beverages', label: 'Beverages', count: 31 },
        { id: 'bar', label: 'Bar', count: 18 }
      ]
    },
    {
      id: 'status',
      title: 'Status',
      type: 'radio' as const,
      options: [
        { id: 'active', label: 'Active', count: 127 },
        { id: 'inactive', label: 'Inactive', count: 5 }
      ]
    },
    {
      id: 'stock',
      title: 'Stock Level',
      type: 'checkbox' as const,
      options: [
        { id: 'in-stock', label: 'In Stock', count: 89 },
        { id: 'low-stock', label: 'Low Stock', count: 28 },
        { id: 'out-of-stock', label: 'Out of Stock', count: 15 }
      ]
    }
  ];

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    console.log('Applied filters:', newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    console.log('Cleared all filters');
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, filterValue) => {
      if (Array.isArray(filterValue)) {
        return count + filterValue.length;
      }
      return count + (filterValue ? 1 : 0);
    }, 0);
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="heading-md">Product Catalog</h1>
            <p className="body-md text-muted">Manage every item, variant, price and routing.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              ref={filterButtonRef}
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={16} />
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
            <Button size="sm" className="gap-2" onClick={() => navigate('/products/create')}>
              <Plus size={16} />
              New Product
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary-600">
              <Tags size={18} />
              <h2 className="heading-xs">Categories</h2>
            </div>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center justify-between rounded-lg border border-line/60 bg-surface-100 px-3 py-2">
                  <span className="body-sm text-ink">{category.label}</span>
                  <span className="body-xs text-muted">{category.products} items</span>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/products')}>Manage Categories</Button>
          </Card>

          <Card className="p-5 space-y-3 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2 text-primary-600">
                <Layers size={18} />
                <h2 className="heading-xs">Products</h2>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                <PackageSearch size={16} />
                Bulk Actions
              </Button>
            </div>

            <div className="hidden overflow-hidden rounded-xl border border-line/80 lg:block">
              <table className="min-w-full divide-y divide-line">
                <thead className="bg-surface-100/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/80 bg-white/60">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-100/70 transition-colors">
                      <td className="px-4 py-3">
                        <p className="body-sm font-medium text-ink">{product.name}</p>
                      </td>
                      <td className="px-4 py-3 body-sm text-muted">{product.sku}</td>
                      <td className="px-4 py-3 body-sm text-muted">{product.category}</td>
                      <td className="px-4 py-3 body-sm font-semibold text-ink">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 body-sm text-muted">{product.stock}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center justify-end gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                            product.status === 'Active'
                              ? 'bg-success/10 text-success'
                              : 'bg-danger/10 text-danger'
                          }`}
                        >
                          {product.status}
                          <MoreHorizontal size={14} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 lg:hidden">
              {products.map((product) => (
                <div key={product.id} className="rounded-2xl border border-line/70 bg-surface-100 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="body-sm font-semibold text-ink">{product.name}</p>
                      <p className="body-xs text-muted">{product.category}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        product.status === 'Active'
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                    <div>
                      <span className="uppercase tracking-wide">SKU</span>
                      <p className="font-medium text-ink">{product.sku}</p>
                    </div>
                    <div>
                      <span className="uppercase tracking-wide">Price</span>
                      <p className="font-medium text-ink">${product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="uppercase tracking-wide">Stock</span>
                      <p className="font-medium text-ink">{product.stock}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>

      {/* Filter Dropdown */}
      <FilterDropdown
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        sections={filterSections}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        activeFilterCount={getActiveFilterCount()}
        triggerRef={filterButtonRef}
      />
    </MotionWrapper>
  );
};
