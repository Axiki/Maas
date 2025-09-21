import assert from 'node:assert/strict';
import { evaluatePromotions } from '../src/services/promotionsEngine.js';
import { CartItem, IneligiblePromotion, Product, Promotion } from '../src/types/index.js';

const createProduct = (id: string, categoryId: string, price: number): Product => ({
  id,
  categoryId,
  name: id,
  description: '',
  price,
  cost: price / 2,
  taxRate: 8.5,
  image: undefined,
  barcode: undefined,
  variants: [],
  modifierGroups: [],
  isActive: true,
  stationTags: []
});

const createCartItem = (product: Product, quantity: number): CartItem => ({
  id: `${product.id}-${quantity}`,
  productId: product.id,
  variantId: undefined,
  quantity,
  price: product.price,
  discount: 0,
  tax: 0,
  modifiers: [],
  product,
  variant: undefined
});

const runStackableScenario = () => {
  const appetizer = createProduct('app', 'cat-app', 10);
  const entree = createProduct('entree', 'cat-main', 40);

  const percentPromo: Promotion = {
    id: 'promo-percent',
    name: '10% off appetizers',
    description: '',
    priority: 1,
    stackable: true,
    status: 'active',
    rule: {
      type: 'PERCENT',
      target: { type: 'CATEGORY', categoryIds: ['cat-app'] },
      value: 10
    },
    constraints: {}
  };

  const amountPromo: Promotion = {
    id: 'promo-amount',
    name: '$5 off $50+',
    description: '',
    priority: 2,
    stackable: true,
    status: 'active',
    rule: {
      type: 'AMOUNT',
      target: { type: 'ORDER' },
      value: 5
    },
    constraints: { minSubtotal: 50 }
  };

  const result = evaluatePromotions({
    items: [createCartItem(appetizer, 1), createCartItem(entree, 1)],
    promotions: [percentPromo, amountPromo],
    orderType: 'dine-in'
  });

  assert.equal(result.appliedPromotions.length, 2, 'Both stackable promotions should apply');
  assert.ok(Math.abs(result.totalDiscount - 6) < 0.01, 'Stackable promotions should total $6 discount');
};

const runExclusiveScenario = () => {
  const entree = createProduct('entree', 'cat-main', 45);
  const dessert = createProduct('dessert', 'cat-dessert', 12);

  const exclusivePromo: Promotion = {
    id: 'promo-exclusive',
    name: '$10 off dinner bundle',
    description: '',
    priority: 1,
    stackable: false,
    status: 'active',
    rule: {
      type: 'AMOUNT',
      target: { type: 'ORDER' },
      value: 10
    },
    constraints: { minSubtotal: 40 }
  };

  const percentPromo: Promotion = {
    id: 'promo-percent',
    name: 'Dessert 20% off',
    description: '',
    priority: 2,
    stackable: true,
    status: 'active',
    rule: {
      type: 'PERCENT',
      target: { type: 'CATEGORY', categoryIds: ['cat-dessert'] },
      value: 20
    },
    constraints: {}
  };

  const result = evaluatePromotions({
    items: [createCartItem(entree, 1), createCartItem(dessert, 1)],
    promotions: [exclusivePromo, percentPromo],
    orderType: 'dine-in'
  });

  assert.equal(result.appliedPromotions.length, 1, 'Only the exclusive promotion should apply');
  assert.equal(result.appliedPromotions[0]?.promotionId, 'promo-exclusive');
  const blocked = result.ineligiblePromotions.find((promo: IneligiblePromotion) => promo.promotionId === 'promo-percent');
  assert.equal(blocked?.reason, 'Blocked by another exclusive promotion');
};

const runMinimumSubtotalScenario = () => {
  const entree = createProduct('entree', 'cat-main', 20);

  const highThresholdPromo: Promotion = {
    id: 'promo-high',
    name: '$10 off $100+',
    description: '',
    priority: 1,
    stackable: true,
    status: 'active',
    rule: {
      type: 'AMOUNT',
      target: { type: 'ORDER' },
      value: 10
    },
    constraints: { minSubtotal: 100 }
  };

  const result = evaluatePromotions({
    items: [createCartItem(entree, 4)],
    promotions: [highThresholdPromo],
    orderType: 'dine-in'
  });

  assert.equal(result.appliedPromotions.length, 0);
  const [ineligible] = result.ineligiblePromotions;
  assert.equal(ineligible.reason, 'Minimum subtotal not met');
  assert.ok(ineligible.suggestion?.includes('Spend $20.00 more'));
};

runStackableScenario();
runExclusiveScenario();
runMinimumSubtotalScenario();

console.log('Promotion engine tests passed.');
