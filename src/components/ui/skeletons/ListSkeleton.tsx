import React from 'react';
import { cn } from '@mas/utils';
import { SkeletonBlock } from './SkeletonBlock';

export interface ListSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: number;
  showStatusDot?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  className,
  items = 3,
  showStatusDot = false,
  ...props
}) => (
  <div className={cn('space-y-3', className)} aria-hidden="true" {...props}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          {showStatusDot && <SkeletonBlock className="h-2.5 w-2.5" rounded="full" />}
          <SkeletonBlock className="h-4 flex-1 max-w-[60%]" />
        </div>
        <SkeletonBlock className="h-4 w-12" />
      </div>
    ))}
  </div>
);
