import {
  InventoryBatch,
  InventoryCount,
  InventoryItem,
  InventoryMovement
} from '../types';

export const mockInventoryItems: InventoryItem[] = [
  {
    sku: 'ING-ESP-001',
    name: 'Espresso Beans — House Blend',
    category: 'Beverages',
    uom: 'kg',
    supplier: 'Peak Roastery',
    parLevel: 45,
    reorderPoint: 18,
    onHand: 36,
    allocated: 6,
    available: 30,
    avgDailyUsage: 4.2,
    cost: 12.5,
    lastMovementAt: '2025-03-18T14:30:00Z',
    lastCountAt: '2025-03-01T09:15:00Z',
    fefoEnabled: true,
    batches: ['batch-espresso-1', 'batch-espresso-2']
  },
  {
    sku: 'DAIR-WHM-004',
    name: 'Whole Milk 2L (6 pack)',
    category: 'Dairy',
    uom: 'case',
    supplier: 'EverFresh Dairy Co.',
    parLevel: 32,
    reorderPoint: 14,
    onHand: 18,
    allocated: 5,
    available: 13,
    avgDailyUsage: 5,
    cost: 22.5,
    lastMovementAt: '2025-03-19T07:50:00Z',
    lastCountAt: '2025-03-15T08:00:00Z',
    fefoEnabled: true,
    batches: ['batch-milk-1', 'batch-milk-2']
  },
  {
    sku: 'BAR-CTR-009',
    name: 'Citrus Syrup Concentrate',
    category: 'Bar Prep',
    uom: 'bottle',
    supplier: 'SunState Provisions',
    parLevel: 24,
    reorderPoint: 8,
    onHand: 11,
    allocated: 1,
    available: 10,
    avgDailyUsage: 1.8,
    cost: 6.2,
    lastMovementAt: '2025-03-17T17:05:00Z',
    lastCountAt: '2025-03-12T10:20:00Z',
    fefoEnabled: false,
    batches: ['batch-citrus-1']
  },
  {
    sku: 'PRT-STK-002',
    name: 'Striploin Steak (Sous-vide)',
    category: 'Proteins',
    uom: 'vac-pack',
    supplier: 'Heritage Farms',
    parLevel: 28,
    reorderPoint: 12,
    onHand: 14,
    allocated: 4,
    available: 10,
    avgDailyUsage: 3.5,
    cost: 18.4,
    lastMovementAt: '2025-03-20T12:10:00Z',
    lastCountAt: '2025-03-10T11:45:00Z',
    fefoEnabled: true,
    batches: ['batch-steak-1', 'batch-steak-2']
  },
  {
    sku: 'PRO-MIX-007',
    name: 'Mixed Greens (2lb clamshell)',
    category: 'Produce',
    uom: 'case',
    supplier: 'Urban Harvest',
    parLevel: 20,
    reorderPoint: 10,
    onHand: 9,
    allocated: 3,
    available: 6,
    avgDailyUsage: 2.8,
    cost: 9.75,
    lastMovementAt: '2025-03-21T06:40:00Z',
    lastCountAt: '2025-03-18T07:30:00Z',
    fefoEnabled: true,
    batches: ['batch-greens-1', 'batch-greens-2']
  }
];

export const mockInventoryBatches: InventoryBatch[] = [
  {
    id: 'batch-espresso-1',
    sku: 'ING-ESP-001',
    lotCode: 'ESP-2501A',
    supplier: 'Peak Roastery',
    receivedAt: '2025-02-10T09:00:00Z',
    expiryDate: '2025-08-15T00:00:00Z',
    quantity: 20,
    remaining: 14,
    fefoOrder: 1
  },
  {
    id: 'batch-espresso-2',
    sku: 'ING-ESP-001',
    lotCode: 'ESP-2502B',
    supplier: 'Peak Roastery',
    receivedAt: '2025-03-12T09:00:00Z',
    expiryDate: '2025-10-12T00:00:00Z',
    quantity: 18,
    remaining: 16,
    fefoOrder: 2
  },
  {
    id: 'batch-milk-1',
    sku: 'DAIR-WHM-004',
    lotCode: 'WHM-2409C',
    supplier: 'EverFresh Dairy Co.',
    receivedAt: '2025-03-14T05:30:00Z',
    expiryDate: '2025-03-30T00:00:00Z',
    quantity: 12,
    remaining: 4,
    fefoOrder: 1
  },
  {
    id: 'batch-milk-2',
    sku: 'DAIR-WHM-004',
    lotCode: 'WHM-2409D',
    supplier: 'EverFresh Dairy Co.',
    receivedAt: '2025-03-18T05:30:00Z',
    expiryDate: '2025-04-04T00:00:00Z',
    quantity: 12,
    remaining: 9,
    fefoOrder: 2
  },
  {
    id: 'batch-citrus-1',
    sku: 'BAR-CTR-009',
    lotCode: 'CTR-2501',
    supplier: 'SunState Provisions',
    receivedAt: '2025-01-22T11:00:00Z',
    expiryDate: '2025-05-30T00:00:00Z',
    quantity: 24,
    remaining: 10,
    fefoOrder: 1
  },
  {
    id: 'batch-steak-1',
    sku: 'PRT-STK-002',
    lotCode: 'STK-2501',
    supplier: 'Heritage Farms',
    receivedAt: '2025-03-02T08:00:00Z',
    expiryDate: '2025-03-28T00:00:00Z',
    quantity: 10,
    remaining: 4,
    fefoOrder: 1
  },
  {
    id: 'batch-steak-2',
    sku: 'PRT-STK-002',
    lotCode: 'STK-2502',
    supplier: 'Heritage Farms',
    receivedAt: '2025-03-15T08:00:00Z',
    expiryDate: '2025-04-20T00:00:00Z',
    quantity: 8,
    remaining: 6,
    fefoOrder: 2
  },
  {
    id: 'batch-greens-1',
    sku: 'PRO-MIX-007',
    lotCode: 'GRN-2508',
    supplier: 'Urban Harvest',
    receivedAt: '2025-03-10T06:15:00Z',
    expiryDate: '2025-03-18T00:00:00Z',
    quantity: 10,
    remaining: 2,
    fefoOrder: 1
  },
  {
    id: 'batch-greens-2',
    sku: 'PRO-MIX-007',
    lotCode: 'GRN-2509',
    supplier: 'Urban Harvest',
    receivedAt: '2025-03-18T06:15:00Z',
    expiryDate: '2025-03-25T00:00:00Z',
    quantity: 8,
    remaining: 4,
    fefoOrder: 2
  }
];

export const mockInventoryMovements: InventoryMovement[] = [
  {
    id: 'move-001',
    sku: 'ING-ESP-001',
    type: 'receipt',
    reference: 'PO-4521',
    quantity: 18,
    uom: 'kg',
    createdAt: '2025-03-15T10:30:00Z',
    source: 'Peak Roastery'
  },
  {
    id: 'move-002',
    sku: 'DAIR-WHM-004',
    type: 'transfer',
    reference: 'TR-1098',
    quantity: -4,
    uom: 'case',
    createdAt: '2025-03-18T12:45:00Z',
    source: 'Main Cooler',
    destination: 'Cafe Front'
  },
  {
    id: 'move-003',
    sku: 'PRT-STK-002',
    type: 'waste',
    reference: 'WS-334',
    quantity: -2,
    uom: 'vac-pack',
    createdAt: '2025-03-19T19:10:00Z',
    note: 'Expired lot STK-2501'
  },
  {
    id: 'move-004',
    sku: 'BAR-CTR-009',
    type: 'adjustment',
    reference: 'ADJ-775',
    quantity: 1,
    uom: 'bottle',
    createdAt: '2025-03-16T08:20:00Z',
    note: 'Line check variance correction'
  },
  {
    id: 'move-005',
    sku: 'PRO-MIX-007',
    type: 'sale',
    reference: 'POS-88321',
    quantity: -6,
    uom: 'case',
    createdAt: '2025-03-20T21:15:00Z'
  }
];

export const mockInventoryCounts: InventoryCount[] = [
  {
    id: 'count-001',
    name: 'Weekly Line Check — Bar',
    scheduledFor: '2025-03-22T07:00:00Z',
    status: 'scheduled',
    assignee: 'Jordan (Bar Lead)'
  },
  {
    id: 'count-002',
    name: 'Freezer Cycle Count',
    scheduledFor: '2025-03-21T09:30:00Z',
    status: 'in-progress',
    assignee: 'Priya (Sous Chef)',
    variance: -1
  },
  {
    id: 'count-003',
    name: 'Produce Spot Check',
    scheduledFor: '2025-03-19T06:45:00Z',
    status: 'completed',
    assignee: 'Alex (Inventory)',
    variance: 2
  }
];
