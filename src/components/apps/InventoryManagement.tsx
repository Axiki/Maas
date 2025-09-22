import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Search,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Download,
  RefreshCw,
  ShoppingCart,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Tag,
  Clock,
  MapPin
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  location: string;
  supplier: string;
  lastUpdated: Date;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock';
  reorderPoint: number;
  reorderQuantity: number;
  usageRate: number; // units per day
  daysUntilStockout: number;
}

interface InventoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Mock inventory data - in real app this would come from API
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Espresso Beans',
      sku: 'ESP-001',
      category: 'Beverages',
      currentStock: 25,
      minStock: 10,
      maxStock: 50,
      unit: 'kg',
      unitCost: 12.50,
      totalValue: 312.50,
      location: 'Storage Room A',
      supplier: 'Premium Coffee Co.',
      lastUpdated: new Date('2025-01-18'),
      status: 'in-stock',
      reorderPoint: 15,
      reorderQuantity: 25,
      usageRate: 2.5,
      daysUntilStockout: 10
    },
    {
      id: '2',
      name: 'Croissants',
      sku: 'PAST-002',
      category: 'Bakery',
      currentStock: 8,
      minStock: 20,
      maxStock: 100,
      unit: 'pieces',
      unitCost: 1.25,
      totalValue: 10.00,
      location: 'Kitchen Freezer',
      supplier: 'Fresh Bakery Ltd.',
      lastUpdated: new Date('2025-01-17'),
      status: 'low-stock',
      reorderPoint: 15,
      reorderQuantity: 50,
      usageRate: 12,
      daysUntilStockout: 1
    },
    {
      id: '3',
      name: 'Caesar Dressing',
      sku: 'SAUCE-003',
      category: 'Sauces',
      currentStock: 0,
      minStock: 5,
      maxStock: 20,
      unit: 'bottles',
      unitCost: 4.75,
      totalValue: 0,
      location: 'Pantry Shelf B',
      supplier: 'Gourmet Foods Inc.',
      lastUpdated: new Date('2025-01-15'),
      status: 'out-of-stock',
      reorderPoint: 3,
      reorderQuantity: 10,
      usageRate: 0.5,
      daysUntilStockout: 0
    },
    {
      id: '4',
      name: 'Coffee Cups',
      sku: 'SUP-004',
      category: 'Supplies',
      currentStock: 150,
      minStock: 50,
      maxStock: 200,
      unit: 'pieces',
      unitCost: 0.15,
      totalValue: 22.50,
      location: 'Storage Room B',
      supplier: 'Restaurant Supply Co.',
      lastUpdated: new Date('2025-01-19'),
      status: 'overstock',
      reorderPoint: 75,
      reorderQuantity: 100,
      usageRate: 25,
      daysUntilStockout: 6
    },
    {
      id: '5',
      name: 'Organic Milk',
      sku: 'DAIRY-005',
      category: 'Dairy',
      currentStock: 12,
      minStock: 10,
      maxStock: 30,
      unit: 'liters',
      unitCost: 2.80,
      totalValue: 33.60,
      location: 'Walk-in Cooler',
      supplier: 'Local Dairy Farm',
      lastUpdated: new Date('2025-01-18'),
      status: 'in-stock',
      reorderPoint: 8,
      reorderQuantity: 15,
      usageRate: 4,
      daysUntilStockout: 3
    }
  ]);

  const categories = ['all', 'Beverages', 'Bakery', 'Sauces', 'Supplies', 'Dairy', 'Produce', 'Meat', 'Cleaning'];
  const statuses = ['all', 'in-stock', 'low-stock', 'out-of-stock', 'overstock'];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock': return 'text-green-600 bg-green-100';
      case 'low-stock': return 'text-yellow-600 bg-yellow-100';
      case 'out-of-stock': return 'text-red-600 bg-red-100';
      case 'overstock': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock': return <CheckCircle size={16} className="text-green-600" />;
      case 'low-stock': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'out-of-stock': return <X size={16} className="text-red-600" />;
      case 'overstock': return <Package size={16} className="text-blue-600" />;
      default: return <Package size={16} className="text-gray-600" />;
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    showToast({
      title: 'Inventory Updated',
      description: 'Stock levels have been refreshed',
      tone: 'success',
      duration: 2000
    });
  };

  const handleExport = () => {
    showToast({
      title: 'Export Started',
      description: 'Inventory report is being generated',
      tone: 'info',
      duration: 3000
    });
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditItem(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));
      showToast({
        title: 'Item Deleted',
        description: 'Inventory item has been removed',
        tone: 'info',
        duration: 2000
      });
    }
  };

  const getTotalValue = () => {
    return inventoryItems.reduce((total, item) => total + item.totalValue, 0);
  };

  const getLowStockCount = () => {
    return inventoryItems.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
  };

  const getOutOfStockCount = () => {
    return inventoryItems.filter(item => item.status === 'out-of-stock').length;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-7xl max-h-[95vh] rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-line p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="heading-sm text-ink">Inventory Management</h2>
                  <p className="body-xs text-muted">Track stock levels, manage suppliers, and optimize inventory</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download size={14} />
                  Export
                </Button>
                <Button
                  onClick={() => setShowAddItem(true)}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Item
                </Button>
                <button
                  onClick={onClose}
                  className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[calc(100%-80px)] overflow-y-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Package size={20} className="text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{inventoryItems.length}</p>
                    <p className="text-xs text-muted">Total Items</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Active inventory items</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">${getTotalValue().toFixed(0)}</p>
                    <p className="text-xs text-muted">Total Value</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Inventory value</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <AlertTriangle size={20} className="text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{getLowStockCount()}</p>
                    <p className="text-xs text-muted">Low Stock</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Items need attention</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-red-100">
                    <X size={20} className="text-red-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{getOutOfStockCount()}</p>
                    <p className="text-xs text-muted">Out of Stock</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Items unavailable</p>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Inventory Table */}
            <div className="bg-surface-200 rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line">
                  <thead className="bg-surface-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredItems.map((item) => (
                      <motion.tr
                        key={item.id}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        className="hover:bg-surface-300 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-sm text-ink">{item.name}</div>
                            <div className="text-xs text-muted">{item.sku} • {item.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium">{item.currentStock} {item.unit}</div>
                            <div className="text-xs text-muted">
                              Min: {item.minStock} • Max: {item.maxStock}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium">${item.totalValue.toFixed(2)}</div>
                            <div className="text-xs text-muted">${item.unitCost.toFixed(2)} per {item.unit}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <MapPin size={14} />
                            {item.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-1 text-muted hover:text-primary-600 transition-colors"
                              title="Edit item"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-muted hover:text-red-600 transition-colors"
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredItems.length === 0 && (
                <div className="flex items-center justify-center py-12 text-muted">
                  <div className="text-center">
                    <Package size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No inventory items found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 p-6 bg-surface-200 rounded-xl border border-line">
              <h3 className="heading-sm text-ink mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="gap-2">
                  <ShoppingCart size={16} />
                  Create Order
                </Button>
                <Button variant="outline" className="gap-2">
                  <BarChart3 size={16} />
                  View Analytics
                </Button>
                <Button variant="outline" className="gap-2">
                  <Settings size={16} />
                  Manage Suppliers
                </Button>
                <Button variant="outline" className="gap-2">
                  <Tag size={16} />
                  Bulk Update
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
