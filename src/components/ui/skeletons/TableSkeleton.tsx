import React from 'react';
import { cn } from '@mas/utils';

export interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number;
  rows?: number;
  dense?: boolean;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  className,
  columns = 4,
  rows = 5,
  dense = false,
  showHeader = true,
  ...props
}) => {
  const columnTemplate = React.useMemo(
    () => ({ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }),
    [columns]
  );

  return (
    <div
      aria-hidden="true"
      className={cn('rounded-xl border border-line/60 bg-surface-100/60 p-4', className)}
      {...props}
    >
      <div className="space-y-3">
        {showHeader && (
          <div className="grid gap-3" style={columnTemplate}>
            {Array.from({ length: columns }).map((_, index) => (
              <div key={`header-${index}`} className="skeleton-surface h-3 rounded-md" />
            ))}
          </div>
        )}

        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid gap-3" style={columnTemplate}>
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <div
                  key={`cell-${rowIndex}-${columnIndex}`}
                  className={cn(
                    'skeleton-surface rounded-md',
                    dense ? 'h-3' : 'h-4',
                    columnIndex === 0 ? 'w-5/6' : 'w-full'
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
