import React, { useState } from 'react';
import { Card, Button } from '@mas/ui';
import { Download, FileText, BarChart2, ArrowUpRight, AlertTriangle, Minus } from 'lucide-react';
import {
  mockReportData,
  reportTabs,
  type ReportCategory,
  type Highlight
} from '../../../data/mockReports';

const impactIconMap: Record<Highlight['impact'], typeof ArrowUpRight> = {
  positive: ArrowUpRight,
  negative: AlertTriangle,
  neutral: Minus
};

const impactColorMap: Record<Highlight['impact'], string> = {
  positive: 'text-success',
  negative: 'text-danger',
  neutral: 'text-muted'
};

export const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportCategory>('sales');

  const dataset = mockReportData[activeTab];

  const handleExport = (type: 'csv' | 'pdf') => {
    console.info(`[ReportsDashboard] Preparing ${type.toUpperCase()} export for ${activeTab}`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-3xl font-bold text-ink">Reports Dashboard</h1>
          <p className="text-sm text-muted">
            Monitor KPIs and operational health across sales, inventory, purchasing, and loyalty.
            Visual summaries help you spot trends before they impact service.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4" aria-hidden />
            <span>Download CSV</span>
          </Button>
          <Button variant="primary" className="flex items-center gap-2" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4" aria-hidden />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Report categories">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-card'
                : 'bg-surface-200 text-muted hover:text-ink hover:bg-surface-100'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <section aria-labelledby="reports-kpi-heading">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 id="reports-kpi-heading" className="text-lg font-semibold text-ink">
                {dataset.title}
              </h2>
              <p className="text-xs text-muted">{dataset.period}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {dataset.kpis.map((kpi) => {
              const isPositive = kpi.change > 0;
              const isNegative = kpi.change < 0;
              return (
                <Card key={kpi.id} className="p-5 space-y-3">
                  <p className="text-sm text-muted">{kpi.label}</p>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-2xl font-semibold text-ink">{kpi.value}</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isPositive
                          ? 'bg-primary-100 text-primary-600'
                          : isNegative
                          ? 'bg-danger/10 text-danger'
                          : 'bg-surface-200 text-muted'
                      }`}
                    >
                      {kpi.change > 0 ? '+' : ''}
                      {kpi.change.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{kpi.context}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6" aria-labelledby="reports-trend-heading">
          <Card className="p-5 xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary-500" aria-hidden />
                <h2 id="reports-trend-heading" className="text-lg font-semibold text-ink">
                  Trend overview
                </h2>
              </div>
              <span className="text-xs text-muted">{dataset.period}</span>
            </div>
            <div
              role="img"
              aria-label={`${dataset.title} trend chart placeholder`}
              className="h-64 rounded-xl border border-dashed border-line bg-surface-100 flex items-center justify-center text-sm text-muted"
            >
              Visual chart integration coming soon
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              {dataset.trend.slice(-3).map((point) => (
                <div key={point.label} className="flex items-center gap-1">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary-500" aria-hidden />
                  <span className="font-medium text-ink">{point.value.toLocaleString()}</span>
                  <span>{point.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-4" aria-labelledby="reports-breakdown-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="reports-breakdown-heading" className="text-lg font-semibold text-ink">
                Key breakdown
              </h2>
              <span className="text-xs text-muted">Share of total</span>
            </div>
            <ul className="space-y-3">
              {dataset.breakdown.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{entry.name}</p>
                    <p className="text-xs text-muted">{entry.percentage}% of total</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{entry.value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <Card className="p-5" aria-labelledby="reports-highlights-heading">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 id="reports-highlights-heading" className="text-lg font-semibold text-ink">
              Recent highlights
            </h2>
            <span className="text-xs text-muted">Updated hourly</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {dataset.highlights.map((item) => {
              const Icon = impactIconMap[item.impact];
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-line/60 bg-surface-100 p-4 space-y-3 shadow-card"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full bg-surface-200 p-2 ${impactColorMap[item.impact]}`}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {item.impact === 'positive'
                        ? 'Positive'
                        : item.impact === 'negative'
                        ? 'Watchlist'
                        : 'Neutral'}
                    </p>
                  </div>
                  <h3 className="text-sm font-semibold text-ink leading-tight">{item.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsDashboard;
