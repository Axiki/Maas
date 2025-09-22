import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonGridProps {
  items?: number;
  variant?: 'cards' | 'stats' | 'charts';
  className?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  items = 6,
  variant = 'cards',
  className
}) => {
  const renderSkeletonItem = (index: number) => {
    switch (variant) {
      case 'stats':
        return (
          <div key={index} className="bg-surface-100 border border-line rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-surface-200 rounded w-20" />
                <div className="h-8 bg-surface-200 rounded w-16" />
              </div>
              <div className="h-8 w-8 bg-surface-200 rounded" />
            </div>
          </div>
        );

      case 'charts':
        return (
          <div key={index} className="bg-surface-100 border border-line rounded-xl p-6">
            <div className="h-4 bg-surface-200 rounded w-24 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 bg-surface-200 rounded"
                  style={{ width: `${Math.random() * 60 + 40}%` }}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div key={index} className="bg-surface-100 border border-line rounded-xl p-6">
            <div className="h-4 bg-surface-200 rounded w-3/4 mb-3" />
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-surface-200 rounded w-full" />
              <div className="h-3 bg-surface-200 rounded w-2/3" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-surface-200 rounded w-16" />
              <div className="h-8 bg-surface-200 rounded w-20" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn(
      'grid gap-6',
      items <= 2 ? 'grid-cols-1 md:grid-cols-2' :
      items <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' :
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      className
    )}>
      {Array.from({ length: items }).map((_, index) => renderSkeletonItem(index))}
    </div>
  );
};
