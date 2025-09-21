import React, { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Search,
  PlusCircle,
  ClipboardList,
  PackageCheck,
  Phone,
  Mail,
  CalendarDays,
  Truck,
  X,
  CheckCircle2,
  Circle,
  Clock3
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { MotionWrapper } from '../../ui/MotionWrapper';
import {
  mockSuppliers,
  mockPurchaseOrders,
  mockGoodsReceipts
} from '../../../data/mockData';
import { Supplier, PurchaseOrderStatus, GoodsReceipt } from '../../../types';
import {
  FormField,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormHelperText
} from '../../forms';
import { cn } from '@mas/utils';

const purchaseOrderStatusLabel: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  received: 'Received'
};

const purchaseOrderStatusClasses: Record<PurchaseOrderStatus, string> = {
  draft: 'border border-line bg-surface-200 text-muted',
  sent: 'border border-primary-200 bg-primary-100 text-primary-600',
  received: 'border border-success/50 bg-success/10 text-success'
};

const receiptStatusClasses: Record<GoodsReceipt['status'], string> = {
  pending: 'border border-warning/40 bg-warning/10 text-warning',
  reconciled: 'border border-success/50 bg-success/10 text-success',
  received: 'border border-primary-200 bg-primary-100 text-primary-600'
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(value);

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(value);

const renderPurchaseOrderStatus = (status: PurchaseOrderStatus) => {
  const icon =
    status === 'received' ? (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ) : status === 'sent' ? (
      <Clock3 className="h-3.5 w-3.5" />
    ) : (
      <Circle className="h-3.5 w-3.5" />
    );

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize',
        purchaseOrderStatusClasses[status]
      )}
    >
      {icon}
      {purchaseOrderStatusLabel[status]}
    </span>
  );
};

const renderReceiptStatus = (status: GoodsReceipt['status']) => {
  const label = status === 'pending' ? 'Pending' : status === 'reconciled' ? 'Reconciled' : 'Received';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
        receiptStatusClasses[status]
      )}
    >
      {label}
    </span>
  );
};

export const PurchasingWorkspace: React.FC = () => {
  const [supplierQuery, setSupplierQuery] = useState('');
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);
  const [poStatusFilter, setPoStatusFilter] = useState<'all' | PurchaseOrderStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [poFormSupplierId, setPoFormSupplierId] = useState('');
  const [receiptFormPoId, setReceiptFormPoId] = useState('');

  const suppliersById = useMemo(() => new Map<string, Supplier>(mockSuppliers.map((supplier) => [supplier.id, supplier])), []);

  const eligibleReceiptOrders = useMemo(
    () => mockPurchaseOrders.filter((order) => order.status !== 'draft'),
    []
  );

  const defaultExpectedDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  }, []);

  const defaultReceiptDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filteredSuppliers = useMemo(() => {
    const query = supplierQuery.trim().toLowerCase();

    if (!query) {
      return mockSuppliers;
    }

    return mockSuppliers.filter((supplier) => {
      const inName = supplier.name.toLowerCase().includes(query);
      const inContact = supplier.contactName.toLowerCase().includes(query);
      const inCategory = supplier.categories.some((category) => category.toLowerCase().includes(query));
      return inName || inContact || inCategory;
    });
  }, [supplierQuery]);

  const filteredOrders = useMemo(() => {
    return mockPurchaseOrders.filter((order) => {
      const matchesStatus = poStatusFilter === 'all' || order.status === poStatusFilter;
      const matchesSupplier = !activeSupplierId || order.supplierId === activeSupplierId;
      return matchesStatus && matchesSupplier;
    });
  }, [activeSupplierId, poStatusFilter]);

  const filteredReceipts = useMemo(() => {
    return mockGoodsReceipts.filter((receipt) => !activeSupplierId || receipt.supplierId === activeSupplierId);
  }, [activeSupplierId]);

  const selectedReceiptOrder = useMemo(
    () => mockPurchaseOrders.find((order) => order.id === receiptFormPoId) ?? null,
    [receiptFormPoId]
  );

  const toggleSupplierFilter = (supplierId: string) => {
    setActiveSupplierId((current) => (current === supplierId ? null : supplierId));
  };

  const openCreateModal = (supplierId?: string) => {
    const fallbackSupplierId = supplierId ?? activeSupplierId ?? mockSuppliers[0]?.id ?? '';
    setPoFormSupplierId(fallbackSupplierId);
    setIsCreateModalOpen(true);
  };

  const openReceiptModal = (purchaseOrderId?: string) => {
    const supplierScopedOrders = activeSupplierId
      ? eligibleReceiptOrders.filter((order) => order.supplierId === activeSupplierId)
      : eligibleReceiptOrders;

    const fallbackPoId =
      purchaseOrderId ?? supplierScopedOrders[0]?.id ?? eligibleReceiptOrders[0]?.id ?? '';

    setReceiptFormPoId(fallbackPoId);
    setIsReceiptModalOpen(true);
  };

  const handleCreatePoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreateModalOpen(false);
  };

  const handleReceiptSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsReceiptModalOpen(false);
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Purchasing Workspace</h1>
          <p className="text-muted text-sm md:text-base">
            Coordinate supplier relationships, monitor purchase orders, and reconcile deliveries from a single surface.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Supplier Directory</h2>
                <Button variant="outline" size="sm" onClick={() => openCreateModal()}>
                  <PlusCircle className="h-4 w-4" />
                  New PO
                </Button>
              </div>
              <p className="text-sm text-muted">
                Quick access to contact details, lead times, and active order counts.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <FormInput
                value={supplierQuery}
                onChange={(event) => setSupplierQuery(event.target.value)}
                placeholder="Search by supplier, contact, or category"
                className="pl-9"
                aria-label="Search suppliers"
              />
            </div>

            {activeSupplierId && (
              <div className="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-100/50 px-3 py-2 text-xs text-primary-700">
                <span>
                  Filtering by{' '}
                  <strong>{suppliersById.get(activeSupplierId)?.name ?? 'supplier'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSupplierId(null)}
                  className="font-medium text-primary-600 underline-offset-2 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '520px' }}>
              {filteredSuppliers.map((supplier) => {
                const openOrders = mockPurchaseOrders.filter(
                  (order) => order.supplierId === supplier.id && order.status !== 'received'
                ).length;
                const isActive = supplier.id === activeSupplierId;

                return (
                  <button
                    key={supplier.id}
                    type="button"
                    onClick={() => toggleSupplierFilter(supplier.id)}
                    className={cn(
                      'w-full rounded-lg border border-line bg-surface-200/60 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                      isActive && 'border-primary-200 bg-primary-100/60 shadow-card'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{supplier.name}</p>
                        <p className="text-xs text-muted">Contact: {supplier.contactName}</p>
                      </div>
                      <span className="rounded-full bg-surface-100 px-2 py-1 text-xs font-medium text-muted">
                        {openOrders} open
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {supplier.contactPhone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate" title={supplier.contactEmail}>
                          {supplier.contactEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Next: {formatDate(supplier.nextDeliveryDate)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5" />
                        {supplier.leadTimeDays}-day lead
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1 text-[11px] text-muted">
                        {supplier.categories.map((category) => (
                          <span key={category} className="rounded-full bg-surface-100 px-2 py-0.5 uppercase tracking-wide">
                            {category}
                          </span>
                        ))}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          openCreateModal(supplier.id);
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Draft PO
                      </Button>
                    </div>
                  </button>
                );
              })}

              {filteredSuppliers.length === 0 && (
                <div className="rounded-lg border border-dashed border-line bg-surface-200/50 p-6 text-center text-sm text-muted">
                  No suppliers found. Try a different search term.
                </div>
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold">
                    <ClipboardList className="h-5 w-5 text-primary-600" />
                    Purchase Orders
                  </h2>
                  <p className="text-sm text-muted">
                    Track drafting, sent confirmations, and received goods in one queue.
                  </p>
                </div>

                <Button size="sm" onClick={() => openCreateModal()}>
                  <PlusCircle className="h-4 w-4" />
                  Create PO
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['all', 'draft', 'sent', 'received'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setPoStatusFilter(status)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                      poStatusFilter === status
                        ? 'border-primary-200 bg-primary-100 text-primary-700'
                        : 'border-line bg-surface-200 text-muted hover:border-primary-200 hover:text-primary-600'
                    )}
                  >
                    {status === 'all' ? 'All' : purchaseOrderStatusLabel[status]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '520px' }}>
              {filteredOrders.map((order) => {
                const supplier = suppliersById.get(order.supplierId);

                return (
                  <div
                    key={order.id}
                    className="rounded-lg border border-line bg-surface-200/60 p-4 transition-colors hover:border-primary-200"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">PO #{order.reference}</p>
                        <p className="text-xs text-muted">{supplier?.name ?? 'Supplier'}</p>
                      </div>
                      {renderPurchaseOrderStatus(order.status)}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted">
                      <div>
                        Created {formatDate(order.createdAt)}
                      </div>
                      <div className="text-right">
                        Due {formatDate(order.expectedOn)}
                      </div>
                      <div>
                        Lines: {order.lines.length}
                      </div>
                      <div className="text-right font-semibold text-ink">
                        {order.currency} {order.totalAmount.toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted">{order.notes}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => openReceiptModal(order.id)}
                        disabled={order.status === 'draft'}
                      >
                        <PackageCheck className="h-4 w-4" />
                        Log receipt
                      </Button>
                    </div>
                  </div>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="rounded-lg border border-dashed border-line bg-surface-200/50 p-6 text-center text-sm text-muted">
                  No purchase orders match the current filters.
                  <div className="mt-3">
                    <Button variant="outline" size="sm" onClick={() => openCreateModal(activeSupplierId ?? undefined)}>
                      <PlusCircle className="h-4 w-4" />
                      Draft a purchase order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <PackageCheck className="h-5 w-5 text-primary-600" />
                  Receiving (GRNs)
                </h2>
                <p className="text-sm text-muted">
                  Match deliveries against purchase orders and resolve variances.
                </p>
              </div>

              <Button size="sm" variant="secondary" onClick={() => openReceiptModal()}>
                <PackageCheck className="h-4 w-4" />
                Log receipt
              </Button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '520px' }}>
              {filteredReceipts.map((receipt) => {
                const supplier = suppliersById.get(receipt.supplierId);
                const order = mockPurchaseOrders.find((po) => po.id === receipt.purchaseOrderId);

                return (
                  <div
                    key={receipt.id}
                    className="rounded-lg border border-line bg-surface-200/60 p-4 transition-colors hover:border-primary-200"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">GRN {receipt.reference}</p>
                        <p className="text-xs text-muted">
                          PO #{order?.reference ?? receipt.purchaseOrderId} • {supplier?.name ?? 'Supplier'}
                        </p>
                        <p className="mt-2 text-xs text-muted">
                          Received {formatDateTime(receipt.receivedAt)} by {receipt.receivedBy}
                        </p>
                      </div>
                      {renderReceiptStatus(receipt.status)}
                    </div>

                    <div className="mt-3 space-y-2 rounded-lg border border-line bg-surface-100 p-3 text-xs text-muted">
                      {receipt.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3">
                          <span className="truncate font-medium text-ink">{item.productName}</span>
                          <span>
                            {item.receivedQuantity}/{item.orderedQuantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {receipt.notes && (
                      <p className="mt-3 text-xs text-warning">{receipt.notes}</p>
                    )}
                  </div>
                );
              })}

              {filteredReceipts.length === 0 && (
                <div className="rounded-lg border border-dashed border-line bg-surface-200/50 p-6 text-center text-sm text-muted">
                  No receipts logged for this supplier yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
            <MotionWrapper type="modal" className="w-full max-w-xl">
              <div className="rounded-lg border border-line bg-surface-100 p-6 shadow-modal">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Create purchase order</h3>
                    <p className="text-sm text-muted">
                      Draft a new purchase order and share it with your supplier once finalized.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-lg p-1 text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                    aria-label="Close create purchase order modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreatePoSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField>
                      <FormLabel htmlFor="po-supplier">Supplier</FormLabel>
                      <FormSelect
                        id="po-supplier"
                        required
                        value={poFormSupplierId}
                        onChange={(event) => setPoFormSupplierId(event.target.value)}
                      >
                        <option value="">Select a supplier</option>
                        {mockSuppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </FormSelect>
                      <FormHelperText>
                        Lead times and terms are applied from the supplier profile.
                      </FormHelperText>
                    </FormField>

                    <FormField>
                      <FormLabel htmlFor="po-expected">Expected delivery</FormLabel>
                      <FormInput id="po-expected" type="date" defaultValue={defaultExpectedDate} required />
                    </FormField>
                  </div>

                  <FormField>
                    <FormLabel htmlFor="po-reference">PO reference</FormLabel>
                    <FormInput
                      id="po-reference"
                      placeholder="Enter reference"
                      defaultValue={`10${mockPurchaseOrders.length + 1}`}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="po-notes">Notes for supplier</FormLabel>
                    <FormTextarea
                      id="po-notes"
                      rows={4}
                      placeholder="Add delivery instructions, pack sizes, or quality reminders."
                    />
                  </FormField>

                  <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save draft</Button>
                  </div>
                </form>
              </div>
            </MotionWrapper>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReceiptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
            <MotionWrapper type="modal" className="w-full max-w-2xl">
              <div className="rounded-lg border border-line bg-surface-100 p-6 shadow-modal">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Log goods receipt</h3>
                    <p className="text-sm text-muted">
                      Capture arrival details and reconcile received quantities against the purchase order.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReceiptModalOpen(false)}
                    className="rounded-lg p-1 text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                    aria-label="Close goods receipt modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleReceiptSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField>
                      <FormLabel htmlFor="receipt-po">Purchase order</FormLabel>
                      <FormSelect
                        id="receipt-po"
                        required
                        value={receiptFormPoId}
                        onChange={(event) => setReceiptFormPoId(event.target.value)}
                      >
                        <option value="">Select a purchase order</option>
                        {eligibleReceiptOrders.map((order) => (
                          <option key={order.id} value={order.id}>
                            {`PO #${order.reference} • ${purchaseOrderStatusLabel[order.status]}`}
                          </option>
                        ))}
                      </FormSelect>
                      <FormHelperText>
                        Only purchase orders that are sent or received can be reconciled.
                      </FormHelperText>
                    </FormField>

                    <FormField>
                      <FormLabel htmlFor="receipt-date">Receipt date</FormLabel>
                      <FormInput id="receipt-date" type="date" defaultValue={defaultReceiptDate} required />
                    </FormField>

                    <FormField>
                      <FormLabel htmlFor="receipt-reference">GRN reference</FormLabel>
                      <FormInput
                        id="receipt-reference"
                        placeholder="e.g. GRN-903"
                        defaultValue={`GRN-${mockGoodsReceipts.length + 901}`}
                      />
                    </FormField>

                    <FormField>
                      <FormLabel htmlFor="receipt-supplier">Supplier</FormLabel>
                      <FormInput
                        id="receipt-supplier"
                        value={selectedReceiptOrder ? suppliersById.get(selectedReceiptOrder.supplierId)?.name ?? '' : ''}
                        readOnly
                        placeholder="Select a purchase order"
                      />
                    </FormField>
                  </div>

                  <FormField>
                    <FormLabel htmlFor="receipt-notes">Receiving notes</FormLabel>
                    <FormTextarea
                      id="receipt-notes"
                      rows={4}
                      placeholder="Document temperature checks, quality holds, or shortages."
                    />
                  </FormField>

                  {selectedReceiptOrder && (
                    <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                      <p className="text-sm font-semibold text-ink">Order summary</p>
                      <div className="mt-3 space-y-2 text-xs text-muted">
                        {selectedReceiptOrder.lines.map((line) => (
                          <div key={line.id} className="flex items-center justify-between gap-3">
                            <span className="truncate font-medium text-ink">{line.productName}</span>
                            <span>
                              {line.receivedQuantity}/{line.quantityOrdered} @ {line.unitCost.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsReceiptModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Record receipt</Button>
                  </div>
                </form>
              </div>
            </MotionWrapper>
          </div>
        )}
      </AnimatePresence>
    </MotionWrapper>
  );
};

