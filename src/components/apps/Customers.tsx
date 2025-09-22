import React, { useState, useRef } from 'react';
import { Users, Star, Gift, Search, Mail } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';
import { SearchModal } from '../ui/SearchModal';

const customerSegments = [
  { id: 'vip', name: 'VIP Guests', members: 58, growth: '+12%' },
  { id: 'loyalty', name: 'Loyalty Members', members: 624, growth: '+4%' },
  { id: 'lapsing', name: 'Lapsing (30d)', members: 87, growth: '-8%' }
];

const customers = [
  {
    id: 'cust-001',
    name: 'Avery Bennett',
    email: 'avery@bennett.co',
    visits: 18,
    lifetimeSpend: 1245.5,
    loyalty: 320,
    status: 'VIP'
  },
  {
    id: 'cust-002',
    name: 'Jordan Lee',
    email: 'jordanlee@email.com',
    visits: 6,
    lifetimeSpend: 284.2,
    loyalty: 120,
    status: 'Member'
  }
];

export const Customers: React.FC = () => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const handleCustomerSelect = (customer: any) => {
    console.log('Selected customer:', customer);
    // In a real app, this would navigate to customer details or open a customer profile
  };

  return (
    <MotionWrapper type="page" className="p-6">
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="heading-md">Customers & Loyalty</h1>
          <p className="body-md text-muted">Understand your guests, rewards, store credits, and trends.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            ref={searchButtonRef}
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <Search size={16} />
            Search Guests
          </Button>
          <Button size="sm" className="gap-2">
            <Users size={16} />
            Add Customer
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {customerSegments.map((segment) => (
          <Card key={segment.id} className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="body-sm font-medium text-ink">{segment.name}</p>
              <span className="body-xs text-success">{segment.growth}</span>
            </div>
            <p className="text-3xl font-semibold text-ink">{segment.members}</p>
            <p className="body-sm text-muted">Active members</p>
          </Card>
        ))}
      </section>

      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary-600">
            <Star size={18} />
            <h2 className="heading-xs">Top Loyalty Guests</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Mail size={16} />
              Send Campaign
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Gift size={16} />
              Issue Reward
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-line/80">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface-100/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Visits</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Lifetime Spend</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Points</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-surface-100/70 transition-colors">
                  <td className="px-4 py-3 body-sm font-medium text-ink">{customer.name}</td>
                  <td className="px-4 py-3 body-sm text-muted">{customer.email}</td>
                  <td className="px-4 py-3 body-sm text-muted">{customer.visits}</td>
                  <td className="px-4 py-3 body-sm font-semibold text-ink">${customer.lifetimeSpend.toFixed(2)}</td>
                  <td className="px-4 py-3 body-sm text-muted">{customer.loyalty}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center justify-end rounded-full px-3 py-1 text-xs font-semibold ${
                        customer.status === 'VIP'
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-surface-200 text-muted'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>

    {/* Search Modal */}
    <SearchModal
      isOpen={isSearchModalOpen}
      onClose={() => setIsSearchModalOpen(false)}
      onCustomerSelect={handleCustomerSelect}
      triggerRef={searchButtonRef}
    />
  </MotionWrapper>
);
};
