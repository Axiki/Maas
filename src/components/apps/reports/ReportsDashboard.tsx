import React, { useCallback, useId, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Calendar,
  CreditCard,
  Download,
  FileText,
  LineChart,
  Truck
} from 'lucide-react';
import { MotionWrapper } from '../../ui/MotionWrapper';
import { Button, Card } from '@mas/ui';
import {
  inventoryTrends,
  periodRanges,
  purchasingTrends,
  reportInsights,
  salesTrends,
  type ReportPeriod
} from '../../../data/mockReports';

const palette = {
  coral: '#EE766D',
  charcoal: '#24242E',
  mist: '#D6D6D6'
} as const;

const periodOptions: { label: string; value: ReportPeriod }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' }
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1
});

type ChangeDescriptor = {
  direction: 'up' | 'down' | 'flat';
  label: string;
};

const describeChange = (current?: number, previous?: number): ChangeDescriptor => {
  if (current === undefined || previous === undefined || previous === 0) {
    return {
      direction: 'flat',
      label: 'vs. prior unavailable'
    };
  }

  const delta = ((current - previous) / Math.abs(previous)) * 100;

  if (Math.abs(delta) < 0.1) {
    return {
      direction: 'flat',
      label: 'No change vs. prior'
    };
  }

  return {
    direction: delta > 0 ? 'up' : 'down',
    label: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}% vs. prior`
  };
};

const changeClassNames: Record<ChangeDescriptor['direction'], string> = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-muted'
};

const changeIconMap: Record<ChangeDescriptor['direction'], React.ReactNode> = {
  up: <ArrowUpRight size={16} aria-hidden="true" />,
  down: <ArrowDownRight size={16} aria-hidden="true" />,
  flat: <span aria-hidden="true" className="text-muted">—</span>
};

interface ChartPlaceholderProps {
  data: number[];
  color: string;
  label: string;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ data, color, label }) => {
  const gradientId = useId();

  if (data.length <= 1) {
    return (
      <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-line bg-surface-200 text-sm text-muted">
        Add more data points to render the {label.toLowerCase()} chart.
      </div>
    );
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const normalizedPoints = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return { x, y };
  });

  const points = normalizedPoints.map(point => `${point.x},${point.y}`).join(' ');

  return (
    <div className="mt-6 h-48 rounded-xl border border-dashed border-line bg-gradient-to-br from-surface-100 to-surface-200">
      <svg
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id={`${gradientId}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.24" />
            <stop offset="100%" stopColor={color} stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <polygon
          fill={`url(#${gradientId}-fill)`}
          points={`0,100 ${points} 100,100`}
        />
        <polyline fill="none" points={points} stroke={color} strokeWidth={1.8} />
        {normalizedPoints.map((point, index) => (
          <circle
            key={`${label}-${index}`}
            cx={point.x}
            cy={point.y}
            fill={color}
            r={1.6}
          />
        ))}
      </svg>
      <div className="sr-only">{label} trend placeholder chart</div>
    </div>
  );
};

const impactClassNames: Record<'positive' | 'neutral' | 'warning', string> = {
  positive: 'bg-success/10 text-success',
  neutral: 'bg-muted/10 text-muted',
  warning: 'bg-[#EE766D]/10 text-[#EE766D]'
};

export const ReportsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('monthly');

  const salesData = salesTrends[selectedPeriod];
  const inventoryData = inventoryTrends[selectedPeriod];
  const purchasingData = purchasingTrends[selectedPeriod];

  const latestSales = salesData[salesData.length - 1];
  const previousSales = salesData[salesData.length - 2];
  const latestInventory = inventoryData[inventoryData.length - 1];
  const previousInventory = inventoryData[inventoryData.length - 2];
  const latestPurchasing = purchasingData[purchasingData.length - 1];
  const previousPurchasing = purchasingData[purchasingData.length - 2];

  const kpiCards = useMemo(
    () => [
      {
        id: 'revenue',
        title: 'Net Revenue',
        value: currencyFormatter.format(latestSales?.revenue ?? 0),
        change: describeChange(latestSales?.revenue, previousSales?.revenue),
        icon: <LineChart size={18} aria-hidden="true" />,
        subtitle: `${numberFormatter.format(latestSales?.orders ?? 0)} orders · margin ${
          latestSales ? percentFormatter.format(latestSales.margin) : '—'
        }`,
        accent: palette.coral
      },
      {
        id: 'avg-order',
        title: 'Average Order Value',
        value: currencyFormatter.format(latestSales?.avgOrderValue ?? 0),
        change: describeChange(latestSales?.avgOrderValue, previousSales?.avgOrderValue),
        icon: <CreditCard size={18} aria-hidden="true" />,
        subtitle: 'Ticket size trend',
        accent: palette.mist
      },
      {
        id: 'inventory',
        title: 'Inventory On Hand',
        value: numberFormatter.format(latestInventory?.onHand ?? 0),
        change: describeChange(latestInventory?.onHand, previousInventory?.onHand),
        icon: <Boxes size={18} aria-hidden="true" />,
        subtitle: `Turnover ${latestInventory ? latestInventory.turnover.toFixed(2) : '—'}x`,
        accent: palette.charcoal
      },
      {
        id: 'spend',
        title: 'Supplier Spend',
        value:
          selectedPeriod === 'quarterly'
            ? compactCurrencyFormatter.format(latestPurchasing?.spend ?? 0)
            : currencyFormatter.format(latestPurchasing?.spend ?? 0),
        change: describeChange(latestPurchasing?.spend, previousPurchasing?.spend),
        icon: <Truck size={18} aria-hidden="true" />,
        subtitle: `${numberFormatter.format(latestPurchasing?.deliveries ?? 0)} deliveries · ${
          latestPurchasing ? percentFormatter.format(latestPurchasing.fillRate) : '—'
        } fill rate`,
        accent: palette.mist
      }
    ],
    [latestInventory, latestPurchasing, latestSales, previousInventory, previousPurchasing, previousSales, selectedPeriod]
  );

  const handleExport = useCallback(
    (format: 'csv' | 'pdf') => {
      console.info('[ReportsDashboard] export triggered', {
        format,
        period: selectedPeriod,
        payload: {
          sales: salesData,
          inventory: inventoryData,
          purchasing: purchasingData
        }
      });
    },
    [inventoryData, purchasingData, salesData, selectedPeriod]
  );

  const insights = reportInsights[selectedPeriod];

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold leading-tight text-ink">Reports &amp; Analytics</h1>
            <p className="text-sm text-muted md:text-base">
              Monitor sales velocity, inventory posture, and purchasing efficiency across your business.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm text-muted">
              <Calendar size={16} aria-hidden="true" className="text-muted" />
              <span>{periodRanges[selectedPeriod]}</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="bg-[#24242E] text-white hover:bg-[#24242E]/90 focus-visible:ring-[#24242E]/40"
              onClick={() => handleExport('csv')}
            >
              <Download size={16} aria-hidden="true" />
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[#24242E] text-[#24242E] hover:bg-[#D6D6D6]/40 focus-visible:ring-[#EE766D]/30 dark:border-[#D6D6D6] dark:text-[#D6D6D6]"
              onClick={() => handleExport('pdf')}
            >
              <FileText size={16} aria-hidden="true" />
              Export PDF
            </Button>
          </div>
        </header>

        <section aria-label="Period filters" className="flex flex-wrap gap-2">
          {periodOptions.map(option => {
            const isActive = option.value === selectedPeriod;
            return (
              <Button
                key={option.value}
                size="sm"
                variant={isActive ? 'primary' : 'ghost'}
                aria-pressed={isActive}
                onClick={() => setSelectedPeriod(option.value)}
                className={
                  isActive
                    ? 'bg-[#EE766D] text-white hover:bg-[#EE766D]/90 focus-visible:ring-[#EE766D]/40'
                    : 'text-muted hover:text-ink'
                }
              >
                {option.label}
              </Button>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map(card => (
            <Card key={card.id} className="h-full border border-line bg-surface-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">{card.title}</p>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-2xl font-semibold text-ink font-tabular">{card.value}</span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${changeClassNames[card.change.direction]}`}>
                      {changeIconMap[card.change.direction]}
                      {card.change.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted">{card.subtitle}</p>
                </div>
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${card.accent}1a`, color: card.accent }}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Sales performance</h2>
                <p className="text-sm text-muted">Revenue, orders, and margin for the selected period.</p>
              </div>
            </div>
            <ChartPlaceholder
              data={salesData.map(point => point.revenue)}
              color={palette.coral}
              label="Sales"
            />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-[#D6D6D6]/20 p-4 shadow-sm dark:bg-[#24242E]/60">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: palette.coral }} />
                  Revenue
                </div>
                <p className="mt-2 text-xl font-semibold text-ink font-tabular">
                  {currencyFormatter.format(latestSales?.revenue ?? 0)}
                </p>
                <p className={`text-xs ${changeClassNames[describeChange(latestSales?.revenue, previousSales?.revenue).direction]}`}>
                  {describeChange(latestSales?.revenue, previousSales?.revenue).label}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-[#D6D6D6]/20 p-4 shadow-sm dark:bg-[#24242E]/60">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: palette.charcoal }} />
                  Orders
                </div>
                <p className="mt-2 text-xl font-semibold text-ink font-tabular">
                  {numberFormatter.format(latestSales?.orders ?? 0)}
                </p>
                <p className={`text-xs ${changeClassNames[describeChange(latestSales?.orders, previousSales?.orders).direction]}`}>
                  {describeChange(latestSales?.orders, previousSales?.orders).label}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-[#D6D6D6]/20 p-4 shadow-sm dark:bg-[#24242E]/60">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: palette.mist }} />
                  Avg. order value
                </div>
                <p className="mt-2 text-xl font-semibold text-ink font-tabular">
                  {currencyFormatter.format(latestSales?.avgOrderValue ?? 0)}
                </p>
                <p className={`text-xs ${changeClassNames[describeChange(latestSales?.avgOrderValue, previousSales?.avgOrderValue).direction]}`}>
                  {describeChange(latestSales?.avgOrderValue, previousSales?.avgOrderValue).label}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Inventory &amp; purchasing</h2>
                <p className="text-sm text-muted">Snapshot of stock position and supplier performance.</p>
              </div>
            </div>
            <ChartPlaceholder
              data={inventoryData.map(point => point.onHand)}
              color={palette.charcoal}
              label="Inventory"
            />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-[#D6D6D6]/20 p-4 shadow-sm dark:bg-[#24242E]/60">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted">
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: palette.charcoal }} />
                    On hand units
                  </span>
                  <span>{periodOptions.find(option => option.value === selectedPeriod)?.label}</span>
                </div>
                <p className="mt-2 text-xl font-semibold text-ink font-tabular">
                  {numberFormatter.format(latestInventory?.onHand ?? 0)}
                </p>
                <p className={`text-xs ${changeClassNames[describeChange(latestInventory?.onHand, previousInventory?.onHand).direction]}`}>
                  {describeChange(latestInventory?.onHand, previousInventory?.onHand).label}
                </p>
                <p className="mt-2 text-xs text-muted">
                  Turnover {latestInventory ? latestInventory.turnover.toFixed(2) : '—'}x · Stockouts {latestInventory?.stockouts ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-[#D6D6D6]/20 p-4 shadow-sm dark:bg-[#24242E]/60">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted">
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: palette.coral }} />
                    Supplier spend
                  </span>
                  <span>{periodOptions.find(option => option.value === selectedPeriod)?.label}</span>
                </div>
                <p className="mt-2 text-xl font-semibold text-ink font-tabular">
                  {currencyFormatter.format(latestPurchasing?.spend ?? 0)}
                </p>
                <p className={`text-xs ${changeClassNames[describeChange(latestPurchasing?.spend, previousPurchasing?.spend).direction]}`}>
                  {describeChange(latestPurchasing?.spend, previousPurchasing?.spend).label}
                </p>
                <p className="mt-2 text-xs text-muted">
                  Lead time {latestPurchasing ? `${latestPurchasing.leadTime.toFixed(1)} days` : '—'} · Fill rate {percentFormatter.format(latestPurchasing?.fillRate ?? 0)}
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-ink">Operational insights</h2>
            <p className="mt-1 text-sm text-muted">
              Key takeaways generated from the selected reporting window.
            </p>
            <ul className="mt-6 space-y-4">
              {insights.map(insight => (
                <li key={insight.title} className="rounded-xl border border-line bg-surface-100/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                      <span>{insight.category}</span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${impactClassNames[insight.impact]}`}>
                      {insight.impact === 'warning' ? 'Action needed' : insight.impact === 'positive' ? 'On track' : 'Monitor'}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-ink">{insight.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{insight.detail}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-ink">Data coverage</h2>
            <p className="mt-1 text-sm text-muted">
              Export includes all metrics shown plus line-item detail, ready for deeper analysis once backend endpoints are wired.
            </p>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Sales entries</dt>
                <dd className="font-semibold text-ink">{salesData.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Inventory samples</dt>
                <dd className="font-semibold text-ink">{inventoryData.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Purchasing updates</dt>
                <dd className="font-semibold text-ink">{purchasingData.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Current period</dt>
                <dd className="font-semibold text-ink">{periodRanges[selectedPeriod]}</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-lg border border-dashed border-line bg-surface-200 p-4 text-xs text-muted">
              Export handlers currently log payloads to the console. Hook into reporting APIs to stream CSV/PDF data.
            </div>
          </Card>
        </section>
      </div>
    </MotionWrapper>
  );
};
