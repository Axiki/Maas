import React from 'react';
import { Calculator, TrendingUp, Receipt } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';

const ledgers = [
  { id: 'daybook', name: 'Daybook', balance: '$12,845.30', status: 'Balanced' },
  { id: 'tax', name: 'Tax Payable', balance: '$2,180.90', status: 'Due Oct 15' }
];

const journalEntries = [
  { id: 'JE-409', memo: 'Cash Drawer Close — Sept 20', debit: '$3,245.00', credit: '$3,245.00' },
  { id: 'JE-410', memo: 'Tips Clearing — Sept 20', debit: '$1,210.80', credit: '$1,210.80' }
];

export const Accounting: React.FC = () => (
  <MotionWrapper type="page" className="p-6">
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="heading-md">Accounting Hub</h1>
          <p className="body-md text-muted">Daybook, tax, COGS snapshots, and exports ready for your accountant.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Receipt size={16} />
            Export to CSV
          </Button>
          <Button size="sm" className="gap-2">
            <Calculator size={16} />
            New Journal Entry
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ledgers.map((ledger) => (
          <Card key={ledger.id} className="p-5 space-y-2">
            <p className="body-xs text-muted uppercase tracking-wide">{ledger.name}</p>
            <p className="text-3xl font-semibold text-ink">{ledger.balance}</p>
            <p className="body-sm text-primary-600">{ledger.status}</p>
          </Card>
        ))}
      </section>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600">
            <TrendingUp size={18} />
            <h2 className="heading-xs">Recent Journal Entries</h2>
          </div>
          <Button variant="ghost" size="sm">View Ledger</Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-line/80">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface-100/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Entry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Memo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Debit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {journalEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-surface-100/70 transition-colors">
                  <td className="px-4 py-3 body-sm font-medium text-ink">{entry.id}</td>
                  <td className="px-4 py-3 body-sm text-muted">{entry.memo}</td>
                  <td className="px-4 py-3 body-sm font-semibold text-ink">{entry.debit}</td>
                  <td className="px-4 py-3 body-sm font-semibold text-ink">{entry.credit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </MotionWrapper>
);
