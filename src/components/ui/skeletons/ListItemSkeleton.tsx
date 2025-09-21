import React from 'react';
import { cn } from '@mas/utils';

export interface ListItemSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  hasAvatar?: boolean;
  metaLines?: number;
  showTrailing?: boolean;
}

export const ListItemSkeleton: React.FC<ListItemSkeletonProps> = ({
  className,
  count = 4,
  hasAvatar = false,
  metaLines = 2,
  showTrailing = false,
  ...props
}) => {
  return (
    <div aria-hidden="true" className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: Math.max(count, 0) }).map((_, itemIndex) => (
        <div key={itemIndex} className="flex items-center gap-3">
          {hasAvatar && <div className="skeleton-surface h-10 w-10 rounded-full" />}

          <div className="flex-1 space-y-2">
            <div className="skeleton-surface h-3 w-3/5 rounded-md" />
            {Array.from({ length: Math.max(metaLines - 1, 0) }).map((_, metaIndex) => (
              <div
                key={metaIndex}
                className={cn(
                  'skeleton-surface h-3 rounded-md',
                  metaIndex === metaLines - 2 ? 'w-2/3' : 'w-4/5'
                )}
              />
            ))}
          </div>

          {showTrailing && <div className="skeleton-surface h-3 w-12 rounded-md" />}
        </div>
      ))}
    </div>
  );
};
