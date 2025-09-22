import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, PieChart, Download, CalendarRange, BarChart3, Brain } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';
import Skeleton from '../ui/Skeleton';
import { DateRangePicker } from '../ui/DateRangePicker';
import { useToast } from '../../providers/UXProvider';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdvancedAnalytics } from './AdvancedAnalytics';

const kpis = [
  { id: 'sales', label: 'Gross Sales', value: '$48,920', change: '+8.4%' },
  { id: 'cogs', label: 'Cost of Goods', value: '$18,240', change: '+3.1%' },
  { id: 'labor', label: 'Labor %', value: '23%', change: '-1.8%' }
];

const topItems = [
  { id: 'item-01', name: 'Smoked Brisket Sandwich', revenue: '$6,430', qty: 458 },
  { id: 'item-02', name: 'Seasonal Citrus Tonic', revenue: '$3,210', qty: 612 },
  { id: 'item-03', name: 'Wood-Fired Margherita', revenue: '$2,904', qty: 181 }
];

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdvancedAnalyticsOpen, setIsAdvancedAnalyticsOpen] = useState(false);
  const dateRangeButtonRef = useRef<HTMLButtonElement>(null);

  const handleDateRangeApply = (range: { startDate: Date; endDate: Date }) => {
    setSelectedDateRange(range);
    showToast({
      title: 'Date Range Updated',
      description: `Reports updated for ${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`,
      tone: 'success',
      duration: 3000
    });
  };

  const handleDateRangeClear = () => {
    setSelectedDateRange(null);
    showToast({
      title: 'Date Range Cleared',
      description: 'Reports reset to default period',
      tone: 'info',
      duration: 3000
    });
  };

  const handleExportDashboard = () => {
    // Simulate export functionality
    showToast({
      title: 'Export Started',
      description: 'Dashboard export will be downloaded shortly',
      tone: 'info',
      duration: 3000
    });

    // In a real app, this would trigger actual export
    setTimeout(() => {
      showToast({
        title: 'Export Complete',
        description: 'Dashboard exported successfully',
        tone: 'success',
        duration: 3000
      });
    }, 2000);
  };

  return (
    <MotionWrapper type="page" className="p-6">
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="heading-md">Reports & Analytics</h1>
          <p className="body-md text-muted">Performance insights across sales, labor, inventory and loyalty.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            ref={dateRangeButtonRef}
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsDateRangeOpen(true)}
          >
            <CalendarRange size={16} />
            {selectedDateRange
              ? `${selectedDateRange.startDate.toLocaleDateString()} - ${selectedDateRange.endDate.toLocaleDateString()}`
              : 'Last 30 Days'
            }
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsAnalyticsOpen(true)}
          >
            <BarChart3 size={16} />
            Analytics Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsAdvancedAnalyticsOpen(true)}
          >
            <Brain size={16} />
            Advanced Analytics
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={handleExportDashboard}
          >
            <Download size={16} />
            Export Dashboard
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="p-5 space-y-2">
            <p className="body-xs text-muted uppercase tracking-wide">{kpi.label}</p>
            <p className="text-3xl font-semibold text-ink">{kpi.value}</p>
            <p className="body-sm text-success">{kpi.change} vs previous period</p>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary-600">
            <BarChart2 size={18} />
            <h2 className="heading-xs">Daily Sales Trend</h2>
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary-600">
            <PieChart size={18} />
            <h2 className="heading-xs">Revenue by Channel</h2>
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </Card>
      </section>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="heading-xs">Top Performing Menu Items</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>View Menu Mix</Button>
        </div>
        <div className="hidden overflow-hidden rounded-xl border border-line/80 lg:block">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface-100/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Qty Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {topItems.map((item) => (
                <tr key={item.id} className="hover:bg-surface-100/70 transition-colors">
                  <td className="px-4 py-3 body-sm font-medium text-ink">{item.name}</td>
                  <td className="px-4 py-3 body-sm font-semibold text-ink">{item.revenue}</td>
                  <td className="px-4 py-3 body-sm text-muted">{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 lg:hidden">
          {topItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-line/70 bg-surface-100 px-4 py-3">
              <p className="body-sm font-semibold text-ink">{item.name}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted">
                <div>
                  <span className="uppercase tracking-wide">Revenue</span>
                  <p className="font-medium text-ink">{item.revenue}</p>
                </div>
                <div>
                  <span className="uppercase tracking-wide">Qty Sold</span>
                  <p className="font-medium text-ink">{item.qty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Date Range Picker */}
    <DateRangePicker
      isOpen={isDateRangeOpen}
      onClose={() => setIsDateRangeOpen(false)}
      onApplyRange={handleDateRangeApply}
      onClearRange={handleDateRangeClear}
      currentRange={selectedDateRange || undefined}
      triggerRef={dateRangeButtonRef}
    />

    {/* Analytics Dashboard */}
    <AnalyticsDashboard
      isOpen={isAnalyticsOpen}
      onClose={() => setIsAnalyticsOpen(false)}
    />

    {/* Advanced Analytics */}
    <AdvancedAnalytics
      isOpen={isAdvancedAnalyticsOpen}
      onClose={() => setIsAdvancedAnalyticsOpen(false)}
    />
  </MotionWrapper>
);
};
