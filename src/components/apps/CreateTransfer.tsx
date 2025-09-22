import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  Plus,
  X,
  Save,
  Eye,
  MapPin,
  Package,
  Calendar,
  User,
  Truck
} from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';
import { FormField } from '../ui/FormField';
import { Input } from '../../packages/ui/input';
import { Textarea } from '../../packages/ui/textarea';
import { Select } from '../../packages/ui/select';
import { Checkbox } from '../../packages/ui/checkbox';
import { useToast } from '../../providers/UXProvider';

interface TransferItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  available: number;
}

interface TransferFormData {
  fromStore: string;
  toStore: string;
  transferDate: string;
  expectedArrival: string;
  items: TransferItem[];
  notes: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requiresApproval: boolean;
}

const stores = [
  { value: 'flagship', label: 'Flagship Store' },
  { value: 'commissary', label: 'Commissary' },
  { value: 'downtown', label: 'Downtown Branch' },
  { value: 'mall', label: 'Mall Location' }
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const availableItems = [
  { id: 'item-1', productName: 'Smoked Brisket Sandwich', sku: 'FD-014', available: 45 },
  { id: 'item-2', productName: 'House Sourdough Loaf', sku: 'BK-001', available: 23 },
  { id: 'item-3', productName: 'Seasonal Citrus Tonic', sku: 'BR-021', available: 67 },
  { id: 'item-4', productName: 'Wood-Fired Margherita', sku: 'PZ-008', available: 12 }
];

export const CreateTransfer: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<TransferFormData>({
    fromStore: '',
    toStore: '',
    transferDate: '',
    expectedArrival: '',
    items: [],
    notes: '',
    priority: 'normal',
    requiresApproval: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate API call
    showToast({
      title: 'Transfer Created',
      description: `Transfer from ${formData.fromStore} to ${formData.toStore} has been created`,
      tone: 'success',
      duration: 5000
    });

    // Navigate back to inventory page
    navigate('/inventory');
  };

  const addItem = (item: typeof availableItems[0]) => {
    const newTransferItem: TransferItem = {
      id: item.id,
      productName: item.productName,
      sku: item.sku,
      quantity: 1,
      available: item.available
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newTransferItem]
    }));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const availableItemsForStore = formData.fromStore
    ? availableItems
    : [];

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-md">Create New Transfer</h1>
            <p className="body-md text-muted">Transfer inventory between stores with tracking and approval workflow.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/inventory')}>
            <X size={16} />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Transfer Details */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-primary-600">
              <ArrowRightLeft size={18} />
              <h2 className="heading-sm">Transfer Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="From Store" required>
                <Select
                  value={formData.fromStore}
                  onChange={(value) => setFormData(prev => ({ ...prev, fromStore: value }))}
                  placeholder="Select source store"
                  options={stores}
                />
              </FormField>

              <FormField label="To Store" required>
                <Select
                  value={formData.toStore}
                  onChange={(value) => setFormData(prev => ({ ...prev, toStore: value }))}
                  placeholder="Select destination store"
                  options={stores}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Transfer Date" required>
                <Input
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Expected Arrival" required>
                <Input
                  type="date"
                  value={formData.expectedArrival}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedArrival: e.target.value }))}
                  required
                />
              </FormField>
            </div>

            <FormField label="Priority">
              <Select
                value={formData.priority}
                onChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                options={priorities}
              />
            </FormField>

            <div className="flex items-center gap-4">
              <Checkbox
                checked={formData.requiresApproval}
                onChange={(checked) => setFormData(prev => ({ ...prev, requiresApproval: checked }))}
              />
              <span className="body-sm">Requires manager approval</span>
            </div>
          </Card>

          {/* Items to Transfer */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-600">
                <Package size={18} />
                <h2 className="heading-sm">Items to Transfer</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {/* Open item selector modal */}}
                disabled={!formData.fromStore}
              >
                <Plus size={16} />
                Add Items
              </Button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p className="body-md">No items added yet</p>
                <p className="body-sm">Select items from the source store to transfer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item) => (
                  <div key={item.id} className="border border-line rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="body-sm font-medium">{item.productName}</h3>
                        <p className="body-xs text-muted">SKU: {item.sku}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Quantity to Transfer" required>
                        <Input
                          type="number"
                          min="1"
                          max={item.available}
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          required
                        />
                      </FormField>

                      <FormField label="Available Stock">
                        <Input
                          type="number"
                          value={item.available}
                          disabled
                          className="bg-surface-100"
                        />
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available Items */}
            {formData.fromStore && availableItemsForStore.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="body-sm font-medium mb-3">Available Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableItemsForStore.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-line rounded-lg hover:bg-surface-100 cursor-pointer"
                      onClick={() => addItem(item)}
                    >
                      <div>
                        <p className="body-sm font-medium">{item.productName}</p>
                        <p className="body-xs text-muted">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="body-sm">Available: {item.available}</p>
                        <Plus size={16} className="text-primary-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-primary-600">
              <User size={18} />
              <h2 className="heading-sm">Additional Information</h2>
            </div>

            <FormField label="Transfer Notes">
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Special instructions or notes for this transfer..."
                rows={3}
              />
            </FormField>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
              Cancel
            </Button>
            <Button type="button" variant="outline">
              <Eye size={16} />
              Preview
            </Button>
            <Button type="submit">
              <Save size={16} />
              Create Transfer
            </Button>
          </div>
        </form>
      </div>
    </MotionWrapper>
  );
};
