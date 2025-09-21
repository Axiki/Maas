import React from 'react';
import { AlertTriangle, CheckCircle, TrendingDown, Warehouse } from 'lucide-react';
import { StatusPill, StatusPillProps, StatusTone } from './StatusPill';

interface StockStatusPillProps extends Omit<StatusPillProps, 'tone' | 'icon'> {
  available: number;
  reorderPoint: number;
  parLevel: number;
  avgDailyUsage?: number;
}

const formatCoverage = (available: number, avgDailyUsage?: number) => {
  if (!avgDailyUsage || avgDailyUsage <= 0) {
    return '';
  }

  const coverage = Math.max(available / avgDailyUsage, 0);
  if (!Number.isFinite(coverage)) {
    return '';
  }

  const rounded = coverage >= 5 ? Math.round(coverage) : Math.round(coverage * 10) / 10;
  return `${rounded}d cover`;
};

export const StockStatusPill: React.FC<StockStatusPillProps> = ({
  available,
  reorderPoint,
  parLevel,
  avgDailyUsage,
  className = '',
  ...props
}) => {
  let tone: StatusTone = 'success';
  let label = 'Stock healthy';
  let icon: React.ReactNode = <CheckCircle size={14} />;

  if (available <= 0) {
    tone = 'danger';
    label = 'Out of stock';
    icon = <AlertTriangle size={14} />;
  } else if (available <= reorderPoint) {
    tone = 'warning';
    label = 'Reorder now';
    icon = <AlertTriangle size={14} />;
  } else if (available < parLevel * 0.6) {
    tone = 'info';
    label = 'Below par';
    icon = <TrendingDown size={14} />;
  } else {
    tone = 'success';
    label = 'Stock healthy';
    icon = <Warehouse size={14} />;
  }

  const coverage = formatCoverage(available, avgDailyUsage);
  const text = coverage ? `${label} · ${coverage}` : label;

  return (
    <StatusPill tone={tone} icon={icon} className={className} {...props}>
      {text}
    </StatusPill>
  );
};
