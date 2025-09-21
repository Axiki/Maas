import React from 'react';
import { cn } from '@mas/utils';

type StatusPillTone = 'neutral' | 'warning' | 'critical' | 'positive';

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusPillTone;
  icon?: React.ReactNode;
}

const toneClasses: Record<StatusPillTone, string> = {
  neutral: 'bg-[#D6D6D6]/40 text-[#24242E] border border-[#D6D6D6]/60',
  warning: 'bg-[#EE766D]/15 text-[#EE766D] border border-[#EE766D]/40',
  critical: 'bg-[#EE766D] text-white border border-[#EE766D]',
  positive: 'bg-[#24242E] text-white border border-[#24242E]'
};

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ tone = 'neutral', icon, children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full transition-colors duration-200',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex items-center" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  )
);

StatusPill.displayName = 'StatusPill';
