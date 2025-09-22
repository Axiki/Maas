import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  X,
  Upload,
  Save,
  Eye,
  Tag,
  DollarSign,
  Image as ImageIcon,
  BarChart3,
  Clock,
  MapPin,
  ChefHat,
  Utensils,
  Calculator
} from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';
import { FormField } from '../ui/FormField';
import { Input } from '../../packages/ui/input';
import { Textarea } from '../../packages/ui/textarea';
import { Select } from '../../packages/ui/select';
import { Checkbox } from '../../packages/ui/checkbox';
import { useToast } from '../../providers/UXProvider';
import { IngredientSelector } from './IngredientSelector';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  imageUrl?: string;
}

interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
}

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  cost: number;
  taxIncl: boolean;
  active: boolean;
  imageUrl?: string;
  stationTag?: string;
  variants: ProductVariant[];
  recipe?: {
    ingredients: RecipeIngredient[];
    totalCost: number;
    instructions: string;
    prepTime: number;
    cookTime: number;
    servings: number;
  };
}

const categories = [
  { value: 'bakery', label: 'Bakery', isFood: true },
  { value: 'kitchen', label: 'Kitchen', isFood: true },
  { value: 'beverages', label: 'Beverages', isFood: false },
  { value: 'bar', label: 'Bar', isFood: false }
];

const stationTags = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bar', label: 'Bar' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'prep', label: 'Prep' }
];

export const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    categoryId: '',
    basePrice: 0,
    cost: 0,
    taxIncl: false,
    active: true,
    variants: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate API call
    showToast({
      title: 'Product Created',
      description: `${formData.name} has been created successfully`,
      tone: 'success',
      duration: 5000
    });

    // Navigate back to products page
    navigate('/products');
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}`,
      name: '',
      sku: '',
      price: formData.basePrice,
      cost: formData.cost
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.id === id ? { ...v, ...updates } : v
      )
    }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== id)
    }));
  };

  // Recipe ingredient management functions
  const addIngredient = () => {
    const newIngredient: RecipeIngredient = {
      id: `ingredient-${Date.now()}`,
      name: '',
      quantity: 0,
      unit: 'g',
      costPerUnit: 0,
      totalCost: 0
    };
    setFormData(prev => ({
      ...prev,
      recipe: prev.recipe ? {
        ...prev.recipe,
        ingredients: [...prev.recipe.ingredients, newIngredient]
      } : undefined
    }));
  };

  const updateIngredient = (id: string, updates: Partial<RecipeIngredient>) => {
    setFormData(prev => ({
      ...prev,
      recipe: prev.recipe ? {
        ...prev.recipe,
        ingredients: prev.recipe.ingredients.map(ingredient =>
          ingredient.id === id ? { ...ingredient, ...updates } : ingredient
        )
      } : undefined
    }));
  };

  const removeIngredient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      recipe: prev.recipe ? {
        ...prev.recipe,
        ingredients: prev.recipe.ingredients.filter(ingredient => ingredient.id !== id)
      } : undefined
    }));
  };

  const handleAddIngredientFromStock = (ingredient: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
    totalCost: number;
  }) => {
    setFormData(prev => ({
      ...prev,
      recipe: prev.recipe ? {
        ...prev.recipe,
        ingredients: [...prev.recipe.ingredients, ingredient]
      } : undefined
    }));
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-md">Create New Product</h1>
            <p className="body-md text-muted">Add a new product to your catalog with variants, pricing, and routing.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/products')}>
            <X size={16} />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-primary-600">
              <Package size={18} />
              <h2 className="heading-sm">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Product Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </FormField>

              <FormField label="Category" required>
                <Select
                  value={formData.categoryId}
                  onChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  placeholder="Select category"
                  options={categories}
                />
              </FormField>
            </div>

            <FormField label="Description">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product description (optional)"
                rows={3}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Base Price" required>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="pl-10"
                    required
                  />
                </div>
              </FormField>

              <FormField label="Cost" required>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="pl-10"
                    required
                  />
                </div>
              </FormField>

              <FormField label="Station Tag">
                <Select
                  value={formData.stationTag || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, stationTag: value }))}
                  placeholder="Select station"
                  options={stationTags}
                />
              </FormField>
            </div>

            <div className="flex items-center gap-4">
              <Checkbox
                checked={formData.taxIncl}
                onChange={(checked) => setFormData(prev => ({ ...prev, taxIncl: checked }))}
              />
              <span className="body-sm">Price includes tax</span>
            </div>

            <div className="flex items-center gap-4">
              <Checkbox
                checked={formData.active}
                onChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <span className="body-sm">Product is active</span>
            </div>
          </Card>

          {/* Variants */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-600">
                <Tag size={18} />
                <h2 className="heading-sm">Variants</h2>
              </div>
              <Button type="button" variant="outline" onClick={addVariant}>
                <Plus size={16} />
                Add Variant
              </Button>
            </div>

            {formData.variants.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p className="body-md">No variants added yet</p>
                <p className="body-sm">Add variants for different sizes, colors, or options</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div key={variant.id} className="border border-line rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="body-sm font-medium">Variant {index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(variant.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Variant Name" required>
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                          placeholder="e.g., Small, Medium, Large"
                          required
                        />
                      </FormField>

                      <FormField label="SKU" required>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(variant.id, { sku: e.target.value })}
                          placeholder="Unique SKU"
                          required
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label="Price" required>
                        <div className="relative">
                          <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.price}
                            onChange={(e) => updateVariant(variant.id, { price: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            className="pl-10"
                            required
                          />
                        </div>
                      </FormField>

                      <FormField label="Cost" required>
                        <div className="relative">
                          <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.cost}
                            onChange={(e) => updateVariant(variant.id, { cost: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            className="pl-10"
                            required
                          />
                        </div>
                      </FormField>

                      <FormField label="Barcode">
                        <Input
                          value={variant.barcode || ''}
                          onChange={(e) => updateVariant(variant.id, { barcode: e.target.value })}
                          placeholder="Barcode (optional)"
                        />
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recipe Section - Only show for food categories */}
          {formData.categoryId && categories.find(cat => cat.value === formData.categoryId)?.isFood && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-primary-600">
                <ChefHat size={18} />
                <h2 className="heading-sm">Recipe</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Prep Time (minutes)">
                  <Input
                    type="number"
                    min="0"
                    value={formData.recipe?.prepTime || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recipe: prev.recipe ? { ...prev.recipe, prepTime: parseInt(e.target.value) || 0 } : undefined
                    }))}
                    placeholder="0"
                  />
                </FormField>

                <FormField label="Cook Time (minutes)">
                  <Input
                    type="number"
                    min="0"
                    value={formData.recipe?.cookTime || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recipe: prev.recipe ? { ...prev.recipe, cookTime: parseInt(e.target.value) || 0 } : undefined
                    }))}
                    placeholder="0"
                  />
                </FormField>

                <FormField label="Servings">
                  <Input
                    type="number"
                    min="1"
                    value={formData.recipe?.servings || 1}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recipe: prev.recipe ? { ...prev.recipe, servings: parseInt(e.target.value) || 1 } : undefined
                    }))}
                    placeholder="1"
                  />
                </FormField>
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="body-sm font-medium">Ingredients</h3>
                  <Button type="button" variant="outline" onClick={() => setIsIngredientModalOpen(true)}>
                    <Plus size={16} />
                    Add Ingredient
                  </Button>
                </div>

                {formData.recipe?.ingredients.length === 0 ? (
                  <div className="text-center py-8 text-muted">
                    <Utensils size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="body-md">No ingredients added yet</p>
                    <p className="body-sm">Add ingredients to calculate recipe cost</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.recipe.ingredients.map((ingredient, index) => (
                      <div key={ingredient.id} className="border border-line rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="body-sm font-medium">Ingredient {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(ingredient.id)}
                          >
                            <X size={16} />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="Ingredient Name" required>
                            <Input
                              value={ingredient.name}
                              onChange={(e) => updateIngredient(ingredient.id, { name: e.target.value })}
                              placeholder="e.g., Flour, Eggs, Milk"
                              required
                            />
                          </FormField>

                          <FormField label="Unit" required>
                            <Select
                              value={ingredient.unit}
                              onChange={(value) => updateIngredient(ingredient.id, { unit: value })}
                              options={[
                                { value: 'g', label: 'Grams (g)' },
                                { value: 'kg', label: 'Kilograms (kg)' },
                                { value: 'ml', label: 'Milliliters (ml)' },
                                { value: 'l', label: 'Liters (l)' },
                                { value: 'cups', label: 'Cups' },
                                { value: 'tbsp', label: 'Tablespoons' },
                                { value: 'tsp', label: 'Teaspoons' },
                                { value: 'pieces', label: 'Pieces' },
                                { value: 'slices', label: 'Slices' }
                              ]}
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField label="Quantity" required>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={ingredient.quantity}
                              onChange={(e) => updateIngredient(ingredient.id, { quantity: parseFloat(e.target.value) || 0 })}
                              placeholder="0"
                              required
                            />
                          </FormField>

                          <FormField label="Cost per Unit" required>
                            <div className="relative">
                              <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={ingredient.costPerUnit}
                                onChange={(e) => updateIngredient(ingredient.id, { costPerUnit: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                className="pl-10"
                                required
                              />
                            </div>
                          </FormField>

                          <FormField label="Total Cost">
                            <div className="relative">
                              <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                              <Input
                                type="number"
                                step="0.01"
                                value={ingredient.totalCost}
                                className="pl-10 bg-surface-100"
                                readOnly
                              />
                            </div>
                          </FormField>
                        </div>
                      </div>
                    ))}

                    {/* Recipe Cost Summary */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between p-4 bg-surface-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calculator size={18} className="text-primary-600" />
                          <span className="body-sm font-medium">Total Recipe Cost</span>
                        </div>
                        <span className="heading-sm text-primary-600">
                          ${formData.recipe.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <FormField label="Instructions">
                <Textarea
                  value={formData.recipe?.instructions || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recipe: prev.recipe ? { ...prev.recipe, instructions: e.target.value } : undefined
                  }))}
                  placeholder="Step-by-step cooking instructions..."
                  rows={4}
                />
              </FormField>
            </Card>
          )}

          {/* Images */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-primary-600">
              <ImageIcon size={18} />
              <h2 className="heading-sm">Images</h2>
            </div>

            <div className="border-2 border-dashed border-line rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto mb-4 text-muted" />
              <p className="body-md text-muted mb-2">Drop images here or click to browse</p>
              <p className="body-sm text-muted">PNG, JPG up to 5MB each</p>
              <Button type="button" variant="outline" className="mt-4">
                Choose Files
              </Button>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/products')}>
              Cancel
            </Button>
            <Button type="button" variant="outline">
              <Eye size={16} />
              Preview
            </Button>
            <Button type="submit">
              <Save size={16} />
              Create Product
            </Button>
          </div>
        </form>
      </div>

      {/* Ingredient Selector Modal */}
      <IngredientSelector
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onAddIngredient={handleAddIngredientFromStock}
        existingIngredients={formData.recipe?.ingredients.map(i => i.id) || []}
      />
    </MotionWrapper>
  );
};
