import React from 'react';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const toneStyles: Record<StatusTone, string> = {
  neutral:
    'border-line/70 bg-surface-200/70 text-ink-70 dark:text-ink flex-shrink-0',
  info: 'border-primary-200 bg-primary-100 text-primary-600 flex-shrink-0',
  success: 'border-success/20 bg-success/10 text-success flex-shrink-0',
  warning: 'border-warning/30 bg-warning/10 text-warning flex-shrink-0',
  danger: 'border-danger/20 bg-danger/10 text-danger flex-shrink-0'
};

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  icon?: React.ReactNode;
  subtle?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  tone = 'neutral',
  icon,
  children,
  className = '',
  subtle = false,
  ...props
}) => {
  const baseTone = toneStyles[tone];
  const transparency = subtle ? 'bg-transparent border-transparent' : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${baseTone} ${transparency} ${className}`}
      {...props}
    >
      {icon ? <span className="flex items-center" aria-hidden>{icon}</span> : null}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};
