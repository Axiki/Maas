import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, FileSpreadsheet, DollarSign, RefreshCcw } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';

const purchaseOrders = [
  {
    id: 'PO-4512',
    supplier: 'Urban Produce Co.',
    expected: 'Sep 22, 2025',
    status: 'Awaiting Delivery',
    total: '$1,245.00'
  },
  {
    id: 'PO-4513',
    supplier: 'Coastal Seafood Partners',
    expected: 'Sep 24, 2025',
    status: 'Partially Received',
    total: '$2,980.50'
  }
];

const invoices = [
  { id: 'INV-734', supplier: 'Dry Goods Collective', due: 'Sep 30, 2025', balance: '$864.20' },
  { id: 'INV-735', supplier: 'Urban Produce Co.', due: 'Oct 02, 2025', balance: '$1,112.64' }
];

export const Purchasing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MotionWrapper type="page" className="p-6">
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="heading-md">Purchasing</h1>
          <p className="body-md text-muted">Track suppliers, purchase orders, and goods received notes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <FileSpreadsheet size={16} />
            Import PO
          </Button>
          <Button size="sm" className="gap-2">
            <Truck size={16} />
            New Purchase Order
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-xs">Open Purchase Orders</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/purchasing')}>View All</Button>
          </div>
          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="rounded-xl border border-line/80 bg-surface-100 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="body-xs text-muted uppercase tracking-wide">{po.id}</p>
                    <p className="body-sm font-semibold text-ink">{po.supplier}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-600">
                    {po.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
                  <span>Expected {po.expected}</span>
                  <span className="text-ink font-semibold">{po.total}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-xs">Outstanding Invoices</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/accounting')}>Reconcile</Button>
          </div>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-lg border border-line/80 bg-white/80 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="body-xs text-muted uppercase tracking-wide">{invoice.id}</p>
                    <p className="body-sm font-medium text-ink">{invoice.supplier}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-warning">
                    <DollarSign size={14} />
                    Due {invoice.due}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">Balance {invoice.balance}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="heading-xs">Recent Goods Received Notes</h2>
          <Button variant="ghost" size="sm" className="gap-2">
            <RefreshCcw size={16} />
            Sync with Supplier
          </Button>
        </div>
        <div className="hidden overflow-hidden rounded-xl border border-line/80 lg:block">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface-100/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">GRN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Received</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Variance</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              <tr className="hover:bg-surface-100/70 transition-colors">
                <td className="px-4 py-3 body-sm font-medium text-ink">GRN-892</td>
                <td className="px-4 py-3 body-sm text-muted">Urban Produce Co.</td>
                <td className="px-4 py-3 body-sm text-muted">Sep 18, 2025</td>
                <td className="px-4 py-3 body-sm text-success">Matched</td>
                <td className="px-4 py-3 text-right body-sm font-semibold text-ink">$945.00</td>
              </tr>
              <tr className="hover:bg-surface-100/70 transition-colors">
                <td className="px-4 py-3 body-sm font-medium text-ink">GRN-893</td>
                <td className="px-4 py-3 body-sm text-muted">Coastal Seafood Partners</td>
                <td className="px-4 py-3 body-sm text-muted">Sep 19, 2025</td>
                <td className="px-4 py-3 body-sm text-warning">Short -2kg</td>
                <td className="px-4 py-3 text-right body-sm font-semibold text-ink">$1,742.80</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 lg:hidden">
          {[
            {
              id: 'GRN-892',
              supplier: 'Urban Produce Co.',
              received: 'Sep 18, 2025',
              variance: 'Matched',
              cost: '$945.00',
              tone: 'success'
            },
            {
              id: 'GRN-893',
              supplier: 'Coastal Seafood Partners',
              received: 'Sep 19, 2025',
              variance: 'Short -2kg',
              cost: '$1,742.80',
              tone: 'warning'
            }
          ].map((grn) => (
            <div key={grn.id} className="rounded-2xl border border-line/70 bg-surface-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="body-sm font-semibold text-ink">{grn.id}</p>
                <span className={grn.tone === 'success' ? 'body-xs font-semibold text-success' : 'body-xs font-semibold text-warning'}>
                  {grn.variance}
                </span>
              </div>
              <div className="mt-2 text-xs text-muted">
                <p>{grn.supplier}</p>
                <p>{grn.received}</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">{grn.cost}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </MotionWrapper>
  );
};
