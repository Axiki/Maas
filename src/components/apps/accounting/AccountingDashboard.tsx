import React from 'react';
import { ArrowDownRight, ArrowUpRight, Download, AlertTriangle } from 'lucide-react';
import { Card, Button } from '@mas/ui';
import {
  accountingDaybook,
  accountingExportOptions,
  cashMovementSummary,
  miniProfitAndLoss,
  taxPayableSummary,
  AccountingExportOption,
  ProfitAndLossHighlight,
} from '../../../data/mockAccounting';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

const trendTone = (value: number) => (value >= 0 ? 'success' : 'danger');

const trendCopy = (value: number) => {
  if (value === 0) {
    return 'flat vs. last period';
  }
  return `vs. last period`;
};

const highlightToneStyles: Record<ProfitAndLossHighlight['status'], string> = {
  success: 'bg-success/10 text-success border-success/40',
  warning: 'bg-warning/10 text-warning border-warning/40',
  danger: 'bg-danger/10 text-danger border-danger/40',
};

const alertToneStyles: Record<'warning' | 'danger', string> = {
  warning: 'border-warning/50 bg-warning/10 text-warning',
  danger: 'border-danger/60 bg-danger/10 text-danger',
};

const TrendIndicator: React.FC<{ value: number; label?: string }> = ({ value, label }) => {
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  const tone = trendTone(value);

  return (
    <div
      className={`flex items-center gap-1 text-sm font-medium ${
        tone === 'success' ? 'text-success' : 'text-danger'
      }`}
    >
      <Icon size={14} aria-hidden />
      <span>{formatPercent(Math.abs(value))}</span>
      <span className="text-muted font-normal">{label ?? trendCopy(value)}</span>
    </div>
  );
};

const handleExport = (option: AccountingExportOption) => {
  console.info(`Export requested`, option);
};

export const AccountingDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-primary-600">Finance</p>
            <h1 className="text-3xl font-bold text-ink">Accounting Overview</h1>
            <p className="text-muted max-w-2xl text-sm">
              Monitor daybook activity, tax exposure, liquidity and profit trends in real time. All
              metrics reconcile with scheduled reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Export controls">
            {accountingExportOptions.map((option) => (
              <Button
                key={option.id}
                variant="secondary"
                size="sm"
                className="rounded-lg border border-line/60 bg-surface-100 hover:border-primary-200"
                onClick={() => handleExport(option)}
                aria-label={`Export ${option.dataset} as ${option.format.toUpperCase()}`}
              >
                <Download size={14} aria-hidden />
                {option.label}
              </Button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="space-y-6 xl:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink">Daybook</h2>
                <p className="text-sm text-muted">
                  Journal entries posted on {shortDateFormatter.format(new Date(accountingDaybook.asOf))}.
                </p>
              </div>
              <div className="text-sm text-muted">
                <span className="font-medium text-ink">Net position</span>{' '}
                {formatCurrency(accountingDaybook.summary.netPosition)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Total debits</p>
                <p className="text-2xl font-semibold text-ink">{formatCurrency(accountingDaybook.summary.totalDebit)}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Total credits</p>
                <p className="text-2xl font-semibold text-ink">{formatCurrency(accountingDaybook.summary.totalCredit)}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface-200/60 p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted">Net</p>
                <p className="text-2xl font-semibold text-ink">{formatCurrency(accountingDaybook.summary.netPosition)}</p>
                <TrendIndicator value={accountingDaybook.summary.netTrend} label="vs. prior day" />
              </div>
            </div>

            {accountingDaybook.alerts.map((alert) => (
              <div
                key={alert.message}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${alertToneStyles[alert.type]}`}
              >
                <AlertTriangle size={16} className="mt-0.5" aria-hidden />
                <p>{alert.message}</p>
              </div>
            ))}

            <div className="space-y-3">
              {accountingDaybook.entries.map((entry) => {
                const isCredit = entry.credit > 0;
                const amount = isCredit ? entry.credit : entry.debit;

                return (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-line/70 bg-surface-100/80 p-4 transition hover:border-primary-200"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-ink">{entry.reference}</p>
                          <span className="text-xs text-muted">
                            {dateTimeFormatter.format(new Date(entry.postedAt))}
                          </span>
                        </div>
                        <p className="text-sm text-muted">{entry.description}</p>
                        <p className="text-xs text-muted">Counterparty · {entry.counterparty}</p>
                      </div>

                      <div className="flex flex-wrap items-end justify-end gap-6 text-right">
                        <div>
                          <p
                            className={`text-sm font-semibold ${isCredit ? 'text-success' : 'text-danger'}`}
                            aria-label={isCredit ? 'Credit amount' : 'Debit amount'}
                          >
                            {`${isCredit ? '+' : '-'}${formatCurrency(amount)}`}
                          </p>
                          <p className="text-xs text-muted">{isCredit ? 'Credit' : 'Debit'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">{formatCurrency(entry.balance)}</p>
                          <p className="text-xs text-muted">Running balance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-ink">Tax payable</h2>
                  <p className="text-sm text-muted">{taxPayableSummary.period}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted">Due</p>
                  <p className="text-sm font-semibold text-ink">
                    {shortDateFormatter.format(new Date(taxPayableSummary.dueDate))}
                  </p>
                  <TrendIndicator value={taxPayableSummary.change} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-line bg-surface-200/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Collected</p>
                  <p className="text-lg font-semibold text-ink">{formatCurrency(taxPayableSummary.collected)}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface-200/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Remitted</p>
                  <p className="text-lg font-semibold text-ink">{formatCurrency(taxPayableSummary.remitted)}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface-200/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Balance due</p>
                  <p className="text-lg font-semibold text-warning">{formatCurrency(taxPayableSummary.balanceDue)}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface-200/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Compliance score</p>
                  <p className="text-lg font-semibold text-success">{taxPayableSummary.complianceScore}%</p>
                </div>
              </div>
            </div>

            {taxPayableSummary.alerts.map((alert) => (
              <div
                key={alert.message}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${alertToneStyles[alert.type]}`}
              >
                <AlertTriangle size={16} className="mt-0.5" aria-hidden />
                <p>{alert.message}</p>
              </div>
            ))}
          </Card>

          <Card className="space-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-ink">Cash movement</h2>
                  <p className="text-sm text-muted">{cashMovementSummary.period}</p>
                </div>
                <TrendIndicator value={cashMovementSummary.trend} label="vs. prior week" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-line bg-surface-200/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Opening</p>
                  <p className="text-lg font-semibold text-ink">{formatCurrency(cashMovementSummary.openingBalance)}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface-200/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Closing</p>
                  <p className="text-lg font-semibold text-ink">{formatCurrency(cashMovementSummary.closingBalance)}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface-200/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Net change</p>
                  <p className={`text-lg font-semibold ${
                    cashMovementSummary.netChange >= 0 ? 'text-success' : 'text-danger'
                  }`}
                  >
                    {formatCurrency(cashMovementSummary.netChange)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-line/70 bg-surface-100/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted mb-2">Inflows</p>
                <ul className="space-y-2 text-sm">
                  {cashMovementSummary.inflows.map((stream) => (
                    <li key={stream.label} className="flex items-center justify-between">
                      <span className="text-muted">{stream.label}</span>
                      <span className="font-medium text-success">{formatCurrency(stream.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-line/70 bg-surface-100/80 p-4">
                <p className="text-xs uppercase tracking-wide text-muted mb-2">Outflows</p>
                <ul className="space-y-2 text-sm">
                  {cashMovementSummary.outflows.map((stream) => (
                    <li key={stream.label} className="flex items-center justify-between">
                      <span className="text-muted">{stream.label}</span>
                      <span className="font-medium text-danger">{formatCurrency(stream.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="space-y-6 xl:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink">Mini P&amp;L</h2>
                <p className="text-sm text-muted">{miniProfitAndLoss.period}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs uppercase tracking-wide text-muted">Net margin</p>
                <p className="text-xl font-semibold text-ink">{formatPercent(miniProfitAndLoss.margin)}</p>
                <TrendIndicator value={miniProfitAndLoss.marginTrend} label="vs. budget" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-line bg-surface-200/60 p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted">Revenue</p>
                <p className="text-2xl font-semibold text-ink">{formatCurrency(miniProfitAndLoss.revenue)}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface-200/60 p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted">COGS</p>
                <p className="text-2xl font-semibold text-danger">{formatCurrency(miniProfitAndLoss.costOfGoodsSold)}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface-200/60 p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted">Gross profit</p>
                <p className="text-2xl font-semibold text-ink">{formatCurrency(miniProfitAndLoss.grossProfit)}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface-200/60 p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted">Net income</p>
                <p className="text-2xl font-semibold text-success">{formatCurrency(miniProfitAndLoss.netIncome)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-line/70 bg-surface-100/80 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted">Operating snapshot</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Operating expenses</span>
                  <span className="font-medium text-danger">{formatCurrency(miniProfitAndLoss.operatingExpenses)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">EBITDA</span>
                  <span className="font-medium text-success">{formatCurrency(miniProfitAndLoss.ebitda)}</span>
                </div>
              </div>
              <div className="rounded-lg border border-line/70 bg-surface-100/80 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted">Cash profitability</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Gross margin</span>
                  <span className="font-medium text-ink">
                    {formatPercent(miniProfitAndLoss.grossProfit / miniProfitAndLoss.revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Expense ratio</span>
                  <span className="font-medium text-warning">
                    {formatPercent(miniProfitAndLoss.operatingExpenses / miniProfitAndLoss.revenue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {miniProfitAndLoss.highlights.map((highlight) => (
                <span
                  key={`${highlight.label}-${highlight.value}`}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${highlightToneStyles[highlight.status]}`}
                >
                  <span className="uppercase tracking-wide text-[10px] text-muted">{highlight.label}</span>
                  <span>{highlight.value}</span>
                </span>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AccountingDashboard;
