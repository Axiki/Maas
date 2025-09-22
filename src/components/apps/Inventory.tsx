import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, ArrowUpRight, ClipboardCheck, CalendarClock } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';

const stockSummary = [
  { id: 'on-hand', label: 'On Hand', value: '1,284', delta: '+6.2%', tone: 'success' },
  { id: 'committed', label: 'Committed', value: '312', delta: '-2.4%', tone: 'muted' },
  { id: 'backorder', label: 'Backorder', value: '58', delta: '+1.1%', tone: 'warning' }
];

const pendingMovements = [
  { id: 'move-001', type: 'Transfer', ref: 'TRF-204', store: 'Flagship → Commissary', status: 'In Transit', eta: 'Today 3:45 PM' },
  { id: 'move-002', type: 'Count', ref: 'CNT-109', store: 'Flagship', status: 'Scheduled', eta: 'Tomorrow 8:00 AM' }
];

const lowStock = [
  { sku: 'FD-014', product: 'Smoked Brisket Sandwich', onHand: 8, par: 24 },
  { sku: 'BR-021', product: 'Seasonal Citrus Tonic', onHand: 0, par: 36 }
];

const toneClass: Record<string, string> = {
  success: 'text-success',
  muted: 'text-muted',
  warning: 'text-warning'
};

export const Inventory: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MotionWrapper type="page" className="p-6">
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="heading-md">Inventory Overview</h1>
          <p className="body-md text-muted">Track on-hand, transfers, counts, and low stock alerts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ClipboardCheck size={16} />
            Start Stock Count
          </Button>
          <Button size="sm" className="gap-2" onClick={() => navigate('/inventory/transfer')}>
            <Boxes size={16} />
            New Transfer
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stockSummary.map((card) => (
          <Card key={card.id} className="p-5 space-y-2">
            <p className="body-xs text-muted uppercase tracking-wide">{card.label}</p>
            <p className="text-3xl font-semibold text-ink">{card.value}</p>
            <p className={`body-sm font-medium ${toneClass[card.tone]}`}>{card.delta} vs last week</p>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="heading-xs">Pending Movements</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>View All</Button>
          </div>
          <div className="space-y-3">
            {pendingMovements.map((movement) => (
              <div key={movement.id} className="rounded-xl border border-line/70 bg-surface-100 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="body-xs text-muted uppercase tracking-wide">{movement.type}</p>
                    <p className="body-sm font-semibold text-ink">{movement.ref}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-600">
                    <ArrowUpRight size={14} />
                    {movement.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
                  <span>{movement.store}</span>
                  <span className="inline-flex items-center gap-1 text-ink">
                    <CalendarClock size={14} />
                    {movement.eta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-xs">Low & Out-of-Stock</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/purchasing')}>Reorder</Button>
          </div>
          <ul className="space-y-2">
            {lowStock.map((item) => (
              <li key={item.sku} className="rounded-lg border border-line/70 bg-surface-100 px-4 py-2">
                <p className="body-sm font-medium text-ink">{item.product}</p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>SKU {item.sku}</span>
                  <span>
                    On-hand {item.onHand} / Par {item.par}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  </MotionWrapper>
  );
};
