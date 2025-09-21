import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePromotions, PromotionDefinition } from '../promotionsEngine';
import { CartItem, Product } from '../../types';

const createProduct = (overrides: Partial<Product>): Product => ({
  id: overrides.id ?? 'prod-test',
  categoryId: overrides.categoryId ?? 'cat-test',
  name: overrides.name ?? 'Test Product',
  description: overrides.description ?? '',
  price: overrides.price ?? 10,
  cost: overrides.cost ?? 5,
  taxRate: overrides.taxRate ?? 8,
  image: overrides.image,
  barcode: overrides.barcode,
  variants: overrides.variants ?? [],
  modifierGroups: overrides.modifierGroups ?? [],
  isActive: overrides.isActive ?? true,
  stationTags: overrides.stationTags ?? [],
});

const createCartItem = (
  id: string,
  product: Product,
  quantity: number,
  priceOverride?: number
): CartItem => ({
  id,
  productId: product.id,
  variantId: undefined,
  quantity,
  price: priceOverride ?? product.price,
  discount: 0,
  tax: 0,
  modifiers: [],
  product,
});

const assertApproxEqual = (actual: number, expected: number, tolerance = 0.01) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`
  );
};

describe('promotionsEngine', () => {
  it('applies stackable promotions cumulatively', () => {
    const productA = createProduct({ id: 'prod-a', name: 'Pasta', price: 20 });
    const productB = createProduct({ id: 'prod-b', name: 'Soup', price: 15 });

    const items: CartItem[] = [
      createCartItem('item-a', productA, 1),
      createCartItem('item-b', productB, 1),
    ];

    const promotions: PromotionDefinition[] = [
      {
        id: 'percent-10',
        name: '10% Off Everything',
        type: 'percentage',
        stackable: true,
        reward: { percentage: 10 },
        channels: ['pos'],
      },
      {
        id: 'cart-5',
        name: '$5 Off Orders $30+',
        type: 'fixed',
        stackable: true,
        scope: 'cart',
        reward: { amount: 5 },
        constraints: { minSpend: 30 },
        channels: ['pos'],
      },
    ];

    const evaluation = evaluatePromotions({
      promotions,
      cart: { items, orderType: 'dine-in' },
      channel: 'pos',
    });

    assert.strictEqual(evaluation.appliedPromotions.length, 2);
    assertApproxEqual(evaluation.totalSavings, 8.5);
    assert.ok((evaluation.itemAdjustments['item-a'] ?? 0) > 0);
    assert.ok((evaluation.itemAdjustments['item-b'] ?? 0) > 0);
  });

  it('prefers non-stackable promotion when it yields greater savings', () => {
    const product = createProduct({ id: 'prod-c', name: 'Steak', price: 20 });
    const items: CartItem[] = [createCartItem('item-c', product, 2)];

    const promotions: PromotionDefinition[] = [
      {
        id: 'stack-10',
        name: 'Member 10% Off',
        type: 'percentage',
        stackable: true,
        reward: { percentage: 10 },
        constraints: { productIds: ['prod-c'] },
        channels: ['pos'],
        priority: 5,
      },
      {
        id: 'vip-half',
        name: 'VIP Half Off',
        type: 'percentage',
        stackable: false,
        reward: { percentage: 50 },
        constraints: { productIds: ['prod-c'] },
        channels: ['pos'],
        priority: 1,
      },
    ];

    const evaluation = evaluatePromotions({
      promotions,
      cart: { items, orderType: 'dine-in' },
      channel: 'pos',
    });

    assert.strictEqual(evaluation.appliedPromotions.length, 1);
    assert.strictEqual(evaluation.appliedPromotions[0].id, 'vip-half');
    assertApproxEqual(evaluation.totalSavings, 20);
    assertApproxEqual(evaluation.itemAdjustments['item-c'] ?? 0, 20);
  });

  it('calculates buy X get Y promotions correctly', () => {
    const product = createProduct({ id: 'prod-d', name: 'Dessert', price: 8 });
    const items: CartItem[] = [createCartItem('item-d', product, 3)];

    const promotions: PromotionDefinition[] = [
      {
        id: 'bxgy',
        name: 'Buy 2 Get 1 Dessert',
        type: 'bxgy',
        stackable: false,
        reward: { buyQuantity: 2, getQuantity: 1 },
        constraints: { productIds: ['prod-d'] },
        channels: ['pos'],
      },
    ];

    const evaluation = evaluatePromotions({
      promotions,
      cart: { items, orderType: 'dine-in' },
      channel: 'pos',
    });

    assert.strictEqual(evaluation.appliedPromotions.length, 1);
    assertApproxEqual(evaluation.totalSavings, 8);
    assertApproxEqual(evaluation.itemAdjustments['item-d'] ?? 0, 8);
  });
});
