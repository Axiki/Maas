import React from 'react';
import { cn } from '@mas/utils';
import { SkeletonBlock } from './SkeletonBlock';

export interface TileSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showBadge?: boolean;
}

export const TileSkeleton: React.FC<TileSkeletonProps> = ({ className, showBadge = false, ...props }) => (
  <div
    className={cn(
      'rounded-lg border border-line/70 bg-surface-100 p-6 shadow-card paper-card space-y-4',
      'motion-reduce:transition-none motion-reduce:shadow-none',
      className
    )}
    aria-hidden="true"
    {...props}
  >
    <div className="flex items-start justify-between gap-4">
      <SkeletonBlock className="h-12 w-12 bg-primary-100/60" rounded="lg" />
      {showBadge ? <SkeletonBlock className="h-4 w-10" rounded="full" /> : <SkeletonBlock className="h-4 w-6" rounded="full" />}
    </div>
    <SkeletonBlock className="h-5 w-3/4" />
    <SkeletonBlock className="h-4 w-full" />
    <SkeletonBlock className="h-4 w-5/6" />
  </div>
);
