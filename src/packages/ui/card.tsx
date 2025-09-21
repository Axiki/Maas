import React from 'react';
import { cn } from '@mas/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, padding = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-line bg-surface-100 shadow-card paper-card',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';
