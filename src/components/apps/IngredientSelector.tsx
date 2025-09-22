import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Plus,
  Package,
  DollarSign,
  Check,
  AlertCircle
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { Input } from '../../packages/ui/input';
import { Select } from '../../packages/ui/select';
import { useToast } from '../../providers/UXProvider';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
}

interface IngredientSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIngredient: (ingredient: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
    totalCost: number;
  }) => void;
  existingIngredients?: string[];
}

const mockStockItems: StockItem[] = [
  {
    id: 'stock-1',
    name: 'All-Purpose Flour',
    sku: 'ING-001',
    category: 'Bakery',
    currentStock: 25,
    unit: 'kg',
    costPerUnit: 2.50,
    supplier: 'FreshCo Foods'
  },
  {
    id: 'stock-2',
    name: 'Free-Range Eggs',
    sku: 'ING-002',
    category: 'Dairy',
    currentStock: 120,
    unit: 'pieces',
    costPerUnit: 0.35,
    supplier: 'Farm Fresh'
  },
  {
    id: 'stock-3',
    name: 'Whole Milk',
    sku: 'ING-003',
    category: 'Dairy',
    currentStock: 50,
    unit: 'l',
    costPerUnit: 1.20,
    supplier: 'Dairy Plus'
  },
  {
    id: 'stock-4',
    name: 'Granulated Sugar',
    sku: 'ING-004',
    category: 'Pantry',
    currentStock: 30,
    unit: 'kg',
    costPerUnit: 1.80,
    supplier: 'Sweet Supply'
  },
  {
    id: 'stock-5',
    name: 'Unsalted Butter',
    sku: 'ING-005',
    category: 'Dairy',
    currentStock: 15,
    unit: 'kg',
    costPerUnit: 8.50,
    supplier: 'Premium Dairy'
  },
  {
    id: 'stock-6',
    name: 'Vanilla Extract',
    sku: 'ING-006',
    category: 'Pantry',
    currentStock: 8,
    unit: 'ml',
    costPerUnit: 0.15,
    supplier: 'Flavor Co'
  },
  {
    id: 'stock-7',
    name: 'Baking Powder',
    sku: 'ING-007',
    category: 'Pantry',
    currentStock: 12,
    unit: 'kg',
    costPerUnit: 4.20,
    supplier: 'Baking Essentials'
  },
  {
    id: 'stock-8',
    name: 'Sea Salt',
    sku: 'ING-008',
    category: 'Pantry',
    currentStock: 20,
    unit: 'kg',
    costPerUnit: 3.00,
    supplier: 'Salt Works'
  }
];

const categories = [
  { value: 'all', label: 'All Items' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'pantry', label: 'Pantry' },
  { value: 'produce', label: 'Produce' },
  { value: 'meat', label: 'Meat' },
  { value: 'spices', label: 'Spices' }
];

export const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  isOpen,
  onClose,
  onAddIngredient,
  existingIngredients = []
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  const filteredItems = mockStockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory;
    const notAlreadyAdded = !existingIngredients.includes(item.id);
    return matchesSearch && matchesCategory && notAlreadyAdded;
  });

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const item = mockStockItems.find(i => i.id === itemId);
    if (!item) return;

    if (quantity > item.currentStock) {
      showToast({
        title: 'Insufficient Stock',
        description: `Only ${item.currentStock} ${item.unit} available`,
        tone: 'warning',
        duration: 3000
      });
      return;
    }

    if (quantity <= 0) {
      selectedItems.delete(itemId);
      setSelectedItems(new Map(selectedItems));
      return;
    }

    setSelectedItems(prev => new Map(prev.set(itemId, quantity)));
  };

  const handleAddSelected = () => {
    selectedItems.forEach((quantity, itemId) => {
      const item = mockStockItems.find(i => i.id === itemId);
      if (item) {
        const totalCost = quantity * item.costPerUnit;
        onAddIngredient({
          id: item.id,
          name: item.name,
          quantity,
          unit: item.unit,
          costPerUnit: item.costPerUnit,
          totalCost
        });
      }
    });

    showToast({
      title: 'Ingredients Added',
      description: `Added ${selectedItems.size} ingredient${selectedItems.size !== 1 ? 's' : ''} to recipe`,
      tone: 'success',
      duration: 3000
    });

    onClose();
    setSelectedItems(new Map());
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const handleAddSingle = (item: StockItem) => {
    const quantity = 1;
    const totalCost = quantity * item.costPerUnit;

    onAddIngredient({
      id: item.id,
      name: item.name,
      quantity,
      unit: item.unit,
      costPerUnit: item.costPerUnit,
      totalCost
    });

    showToast({
      title: 'Ingredient Added',
      description: `${item.name} added to recipe`,
      tone: 'success',
      duration: 3000
    });

    onClose();
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
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-line bg-surface-100 shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line p-6">
            <div>
              <h2 className="heading-md">Select Ingredients</h2>
              <p className="body-sm text-muted">Choose ingredients from your current stock</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="border-b border-line p-6 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                <Input
                  type="text"
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                options={categories}
                className="w-48"
              />
            </div>

            {selectedItems.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <span className="body-sm font-medium text-primary-700">
                  {selectedItems.size} ingredient{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <Button size="sm" onClick={handleAddSelected}>
                  <Plus size={16} />
                  Add Selected
                </Button>
              </div>
            )}
          </div>

          {/* Stock Items Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p className="body-md">No ingredients found</p>
                <p className="body-sm">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const selectedQuantity = selectedItems.get(item.id) || 0;

                  return (
                    <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="body-sm font-medium text-ink">{item.name}</h3>
                          <p className="body-xs text-muted">SKU: {item.sku}</p>
                          {item.supplier && (
                            <p className="body-xs text-muted">Supplier: {item.supplier}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedQuantity > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                              <Check size={12} />
                              <span className="text-xs font-medium">{selectedQuantity}</span>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddSingle(item)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="body-xs text-muted">Available Stock</p>
                          <p className="body-sm font-medium">
                            {item.currentStock} {item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="body-xs text-muted">Cost per {item.unit}</p>
                          <p className="body-sm font-medium text-primary-600">
                            ${item.costPerUnit.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3">
                        <span className="body-xs text-muted">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, selectedQuantity - 1)}
                            disabled={selectedQuantity <= 0}
                          >
                            <X size={14} />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            max={item.currentStock}
                            value={selectedQuantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-20 text-center"
                            placeholder="0"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, selectedQuantity + 1)}
                            disabled={selectedQuantity >= item.currentStock}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        <span className="body-xs text-muted">max: {item.currentStock}</span>
                      </div>

                      {selectedQuantity > 0 && (
                        <div className="mt-3 pt-3 border-t border-line">
                          <div className="flex items-center justify-between">
                            <span className="body-xs text-muted">Total Cost:</span>
                            <span className="body-sm font-medium text-primary-600">
                              ${(selectedQuantity * item.costPerUnit).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-line p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted">
                <AlertCircle size={16} />
                <span className="body-xs">
                  {filteredItems.length} ingredient{filteredItems.length !== 1 ? 's' : ''} available
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {selectedItems.size > 0 && (
                  <Button onClick={handleAddSelected}>
                    Add {selectedItems.size} Ingredient{selectedItems.size !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
