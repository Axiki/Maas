import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Check,
  Sparkles,
  Coffee,
  Utensils,
  ChefHat
} from 'lucide-react';
import { Button } from '@mas/ui';
import { Product } from '../../types';

interface ModifierGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple' | 'quantity';
  required: boolean;
  maxSelections?: number;
  modifiers: Modifier[];
}

interface Modifier {
  id: string;
  name: string;
  price: number;
  description?: string;
  icon?: string;
}

interface ProductModifiersProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product, modifiers: Record<string, any>) => void;
}

export const ProductModifiers: React.FC<ProductModifiersProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart
}) => {
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, any>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Mock modifier groups - in real app this would come from product data
  const modifierGroups: ModifierGroup[] = [
    {
      id: 'size',
      name: 'Size',
      type: 'single',
      required: true,
      modifiers: [
        { id: 'small', name: 'Small', price: 0, description: '8oz cup' },
        { id: 'medium', name: 'Medium', price: 0.50, description: '12oz cup' },
        { id: 'large', name: 'Large', price: 1.00, description: '16oz cup' }
      ]
    },
    {
      id: 'temperature',
      name: 'Temperature',
      type: 'single',
      required: true,
      modifiers: [
        { id: 'hot', name: 'Hot', price: 0, icon: '☕' },
        { id: 'iced', name: 'Iced', price: 0, icon: '🧊' }
      ]
    },
    {
      id: 'additions',
      name: 'Additions',
      type: 'multiple',
      required: false,
      maxSelections: 3,
      modifiers: [
        { id: 'extra-shot', name: 'Extra Shot', price: 1.50, icon: '☕' },
        { id: 'whipped-cream', name: 'Whipped Cream', price: 0.75, icon: '🍦' },
        { id: 'caramel-syrup', name: 'Caramel Syrup', price: 0.50, icon: '🍯' },
        { id: 'vanilla-syrup', name: 'Vanilla Syrup', price: 0.50, icon: '🍯' },
        { id: 'cinnamon', name: 'Cinnamon', price: 0.25, icon: '🌿' }
      ]
    },
    {
      id: 'special-instructions',
      name: 'Special Instructions',
      type: 'quantity',
      required: false,
      modifiers: [
        { id: 'light-ice', name: 'Light Ice', price: 0 },
        { id: 'no-foam', name: 'No Foam', price: 0 },
        { id: 'extra-hot', name: 'Extra Hot', price: 0 }
      ]
    }
  ];

  const handleModifierToggle = (groupId: string, modifierId: string, modifier: Modifier) => {
    const group = modifierGroups.find(g => g.id === groupId);
    if (!group) return;

    setSelectedModifiers(prev => {
      const currentSelections = prev[groupId] || [];

      if (group.type === 'single') {
        // Single selection - replace current selection
        return {
          ...prev,
          [groupId]: [{ ...modifier, quantity: 1 }]
        };
      } else if (group.type === 'multiple') {
        // Multiple selection - toggle
        const isSelected = currentSelections.some((m: any) => m.id === modifierId);
        if (isSelected) {
          return {
            ...prev,
            [groupId]: currentSelections.filter((m: any) => m.id !== modifierId)
          };
        } else {
          return {
            ...prev,
            [groupId]: [...currentSelections, { ...modifier, quantity: 1 }]
          };
        }
      } else if (group.type === 'quantity') {
        // Quantity selection - toggle with quantity
        const isSelected = currentSelections.some((m: any) => m.id === modifierId);
        if (isSelected) {
          return {
            ...prev,
            [groupId]: currentSelections.filter((m: any) => m.id !== modifierId)
          };
        } else {
          return {
            ...prev,
            [groupId]: [...currentSelections, { ...modifier, quantity: 1 }]
          };
        }
      }

      return prev;
    });
  };

  const handleQuantityChange = (groupId: string, modifierId: string, change: number) => {
    setSelectedModifiers(prev => {
      const currentSelections = prev[groupId] || [];
      return {
        ...prev,
        [groupId]: currentSelections.map((modifier: any) => {
          if (modifier.id === modifierId) {
            const newQuantity = Math.max(0, (modifier.quantity || 0) + change);
            return newQuantity === 0
              ? null
              : { ...modifier, quantity: newQuantity };
          }
          return modifier;
        }).filter(Boolean)
      };
    });
  };

  const calculateTotalPrice = () => {
    let total = product.price;

    Object.entries(selectedModifiers).forEach(([groupId, modifiers]) => {
      if (Array.isArray(modifiers)) {
        modifiers.forEach((modifier: any) => {
          total += modifier.price * (modifier.quantity || 1);
        });
      }
    });

    return total;
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedModifiers);
    onClose();
  };

  const getModifierIcon = (icon?: string) => {
    if (icon) return icon;
    return '✨';
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
          className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-line p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="aspect-square w-16 h-16 bg-surface-200 rounded-xl flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-2xl">🍽️</div>
                  )}
                </div>
                <div>
                  <h2 className="heading-md text-ink">{product.name}</h2>
                  <p className="body-sm text-muted">Customize your order</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {modifierGroups.map((group) => (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="heading-sm text-ink">{group.name}</h3>
                    {group.required && (
                      <span className="text-xs text-primary-600 font-medium">Required</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {group.modifiers.map((modifier) => {
                      const isSelected = selectedModifiers[group.id]?.some((m: any) => m.id === modifier.id);
                      const selectedModifier = selectedModifiers[group.id]?.find((m: any) => m.id === modifier.id);
                      const quantity = selectedModifier?.quantity || 0;

                      return (
                        <div
                          key={modifier.id}
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-line bg-surface-200 hover:bg-surface-300'
                          }`}
                          onClick={() => handleModifierToggle(group.id, modifier.id, modifier)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-lg">{getModifierIcon(modifier.icon)}</div>
                              <div>
                                <p className="font-medium text-sm">{modifier.name}</p>
                                {modifier.description && (
                                  <p className="text-xs text-muted">{modifier.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-primary-600">
                                {modifier.price > 0 ? `+$${modifier.price.toFixed(2)}` : 'Free'}
                              </span>

                              {group.type === 'quantity' && isSelected ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(group.id, modifier.id, -1);
                                    }}
                                    className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="w-8 text-center font-medium">{quantity}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(group.id, modifier.id, 1);
                                    }}
                                    className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-primary-500 bg-primary-500' : 'border-line'
                                }`}>
                                  {isSelected && <Check size={12} className="text-white" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-line p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted">Total Price</p>
                <p className="heading-lg text-primary-600">${calculateTotalPrice().toFixed(2)}</p>
              </div>
              <Button
                onClick={handleAddToCart}
                className="gap-2"
                size="lg"
              >
                <Plus size={16} />
                Add to Order
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
