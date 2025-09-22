import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className,
  showHeader = true
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {showHeader && (
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 bg-surface-200 rounded',
                i === 0 ? 'w-48' : i === columns - 1 ? 'w-24' : 'w-32'
              )}
            />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  'h-4 bg-surface-200 rounded',
                  colIndex === 0 ? 'w-48' :
                  colIndex === columns - 1 ? 'w-24' : 'w-32'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
