import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { StatusPill, StatusPillProps, StatusTone } from './StatusPill';

interface ExpiryStatusPillProps extends Omit<StatusPillProps, 'tone' | 'icon'> {
  daysUntilExpiry: number;
  fefoOrder?: number;
}

const pluralise = (value: number) => `${Math.abs(value)} day${Math.abs(value) === 1 ? '' : 's'}`;

export const ExpiryStatusPill: React.FC<ExpiryStatusPillProps> = ({
  daysUntilExpiry,
  fefoOrder,
  className = '',
  ...props
}) => {
  let tone: StatusTone = 'info';
  let label: string;
  let icon = <CheckCircle size={14} />;

  if (daysUntilExpiry < 0) {
    tone = 'danger';
    icon = <AlertTriangle size={14} />;
    label = `Expired ${pluralise(daysUntilExpiry)} ago`;
  } else if (daysUntilExpiry === 0) {
    tone = 'danger';
    icon = <AlertTriangle size={14} />;
    label = 'Expires today';
  } else if (daysUntilExpiry <= 3) {
    tone = 'danger';
    icon = <AlertTriangle size={14} />;
    label = `Expires in ${pluralise(daysUntilExpiry)}`;
  } else if (daysUntilExpiry <= 7) {
    tone = 'warning';
    icon = <Clock size={14} />;
    label = `${pluralise(daysUntilExpiry)} remaining`;
  } else if (daysUntilExpiry <= 21) {
    tone = 'info';
    icon = <Clock size={14} />;
    label = `${pluralise(daysUntilExpiry)} remaining`;
  } else {
    tone = 'success';
    icon = <CheckCircle size={14} />;
    label = 'Fresh stock';
  }

  const fefoText = fefoOrder ? `FEFO #${fefoOrder}` : '';
  const text = fefoText ? `${fefoText} · ${label}` : label;

  return (
    <StatusPill tone={tone} icon={icon} className={className} {...props}>
      {text}
    </StatusPill>
  );
};
