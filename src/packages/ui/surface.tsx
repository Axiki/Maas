import React from 'react';
import { cn } from '@mas/utils';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, children, elevated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-line bg-surface-100',
        elevated && 'shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Surface.displayName = 'Surface';
