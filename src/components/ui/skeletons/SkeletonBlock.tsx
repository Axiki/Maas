import React from 'react';
import { cn } from '@mas/utils';

export interface SkeletonBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedClassName: Record<NonNullable<SkeletonBlockProps['rounded']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
};

export const SkeletonBlock = React.forwardRef<HTMLDivElement, SkeletonBlockProps>(
  ({ className, rounded = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden bg-surface-200 motion-safe:animate-pulse motion-reduce:animate-none motion-reduce:transition-none',
        roundedClassName[rounded],
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
);

SkeletonBlock.displayName = 'SkeletonBlock';
