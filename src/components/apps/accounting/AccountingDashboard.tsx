import React, { useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgePercent,
  Banknote,
  BarChart3,
  BookOpenCheck,
  FileDown,
  Minus,
  PiggyBank
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { MotionWrapper } from '../../ui/MotionWrapper';
import { mockAccountingReports, TrendSnapshot } from '../../../data/mockReports';
import { useAuthStore } from '../../../stores/authStore';
import { cn } from '@mas/utils';

const statusTokenMap = {
  'on-track': {
    label: 'On track',
    className: 'text-success bg-success/10'
  },
  'due-soon': {
    label: 'Due soon',
    className: 'text-warning bg-warning/10'
  },
  overdue: {
    label: 'Overdue',
    className: 'text-danger bg-danger/10'
  }
} as const;

interface TrendIndicatorProps {
  trend: TrendSnapshot;
  invert?: boolean;
  percentFormatter: Intl.NumberFormat;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend, invert = false, percentFormatter }) => {
  const adjustedChange = invert ? trend.change * -1 : trend.change;
  const isPositive = adjustedChange > 0;
  const isNegative = adjustedChange < 0;

  const Icon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus;
  const toneClass = isPositive
    ? 'text-success bg-success/10'
    : isNegative
    ? 'text-danger bg-danger/10'
    : 'text-muted bg-muted/10';

  const sign = isPositive ? '+' : isNegative ? '−' : '';

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
          toneClass
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
        <span>
          {sign}
          {percentFormatter.format(Math.abs(trend.change))}
        </span>
      </span>
      <span className="text-xs text-muted uppercase tracking-wide">{trend.label}</span>
    </div>
  );
};

export const AccountingDashboard: React.FC = () => {
  const { tenant } = useAuthStore();
  const { daybook, tax, cash, profitAndLoss, generatedAt } = mockAccountingReports;
  const taxStatusToken = statusTokenMap[tax.status];

  const currencyCode = tenant?.settings.currency ?? 'USD';

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
    [currencyCode]
  );

  const percentFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }),
    []
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
    []
  );

  const filingDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long'
      }),
    []
  );

  const lastGenerated = useMemo(() => new Date(generatedAt), [generatedAt]);

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted text-sm">
              <PiggyBank className="h-4 w-4 text-primary-500" aria-hidden />
              <span className="uppercase tracking-wide">Accounting</span>
            </div>
            <h1 className="text-3xl font-semibold text-ink">Accounting Overview</h1>
            <p className="max-w-2xl text-sm text-muted">
              Reconciled figures sourced from the shared reporting mocks keep Daybook, tax, cash, and profit snapshots in sync
              across modules.
            </p>
            <p className="text-xs text-muted">
              Last generated {dateFormatter.format(lastGenerated)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" disabled className="min-w-[9rem]">
              <FileDown className="h-4 w-4" aria-hidden />
              Export CSV
            </Button>
            <Button variant="outline" disabled className="min-w-[9rem]">
              <FileDown className="h-4 w-4" aria-hidden />
              Export XLSX
            </Button>
            <span className="text-xs text-muted">Exports will unlock once endpoints are live.</span>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-primary-100 p-2">
                  <BookOpenCheck className="h-5 w-5 text-primary-600" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-ink">Daybook</h2>
                  <p className="text-sm text-muted">{daybook.period} register summary</p>
                </div>
              </div>
              <TrendIndicator trend={daybook.trend} percentFormatter={percentFormatter} />
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div className="space-y-1">
                <dt className="text-muted">Gross sales</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(daybook.grossSales)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Returns</dt>
                <dd className="text-lg font-medium text-danger">
                  −{currencyFormatter.format(Math.abs(daybook.returns))}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Tips</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(daybook.tips)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Service charges</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(daybook.serviceCharges)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Tax collected</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(daybook.taxes)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Net sales</dt>
                <dd className="text-lg font-semibold text-primary-600">{currencyFormatter.format(daybook.netSales)}</dd>
              </div>
            </dl>

            <div className="rounded-lg bg-surface-200/70 p-4 text-xs text-muted">
              Daybook totals reconcile with the reporting workspace to keep daily closes aligned with Z-reports and tax exports.
            </div>
          </Card>

          <Card className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-primary-100 p-2">
                  <BadgePercent className="h-5 w-5 text-primary-600" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-ink">Tax payable</h2>
                  <p className="text-sm text-muted">Prepared for next filing window</p>
                </div>
              </div>
              <TrendIndicator trend={tax.trend} invert percentFormatter={percentFormatter} />
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <dt className="text-muted">Collected</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(tax.collected)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Remitted</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(tax.remitted)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Outstanding</dt>
                <dd className="text-lg font-semibold text-primary-600">{currencyFormatter.format(tax.outstanding)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Next filing</dt>
                <dd className="text-base font-medium text-ink">
                  {filingDateFormatter.format(new Date(tax.nextFilingDate))}
                </dd>
              </div>
            </dl>

            <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-200/70 p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Banknote className="h-4 w-4 text-primary-500" aria-hidden />
                <span>Sales tax ready for submission.</span>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
                  taxStatusToken.className
                )}
              >
                {taxStatusToken.label}
              </span>
            </div>
          </Card>

          <Card className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-primary-100 p-2">
                  <PiggyBank className="h-5 w-5 text-primary-600" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-ink">Cash movement</h2>
                  <p className="text-sm text-muted">Drawer &amp; safe reconciliation</p>
                </div>
              </div>
              <TrendIndicator trend={cash.trend} percentFormatter={percentFormatter} />
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <dt className="text-muted">Opening float</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(cash.openingFloat)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Cash sales</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(cash.cashSales)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Pay-outs</dt>
                <dd className="text-lg font-medium text-danger">
                  −{currencyFormatter.format(Math.abs(cash.payouts))}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Deposits</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(cash.deposits)}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-surface-200/70 p-4 text-sm">
              <div className="flex flex-col">
                <span className="text-muted">Closing float</span>
                <span className="text-lg font-semibold text-primary-600">{currencyFormatter.format(cash.closingFloat)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-muted">Variance</span>
                <span className="text-lg font-semibold text-warning">
                  {cash.variance >= 0 ? '+' : '−'}
                  {currencyFormatter.format(Math.abs(cash.variance))}
                </span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-primary-100 p-2">
                  <BarChart3 className="h-5 w-5 text-primary-600" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-ink">Mini P&amp;L</h2>
                  <p className="text-sm text-muted">Operational profitability snapshot</p>
                </div>
              </div>
              <TrendIndicator trend={profitAndLoss.trend} percentFormatter={percentFormatter} />
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <dt className="text-muted">Revenue</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(profitAndLoss.revenue)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">COGS</dt>
                <dd className="text-lg font-medium text-danger">
                  −{currencyFormatter.format(Math.abs(profitAndLoss.costOfGoodsSold))}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Gross profit</dt>
                <dd className="text-lg font-medium text-ink">{currencyFormatter.format(profitAndLoss.grossProfit)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted">Operating expenses</dt>
                <dd className="text-lg font-medium text-danger">
                  −{currencyFormatter.format(Math.abs(profitAndLoss.operatingExpenses))}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-surface-200/70 p-4">
              <div className="flex flex-col">
                <span className="text-muted text-sm">Net income</span>
                <span className="text-2xl font-semibold text-primary-600">
                  {currencyFormatter.format(profitAndLoss.netIncome)}
                </span>
              </div>
              <div className="flex flex-col items-end text-sm text-muted">
                <span>Margin</span>
                <span className="text-base font-medium text-success">
                  {percentFormatter.format(profitAndLoss.margin)}
                </span>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </MotionWrapper>
  );
};

export default AccountingDashboard;
