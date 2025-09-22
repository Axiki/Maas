import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'compact' | 'large';
  showAvatar?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  variant = 'default',
  showAvatar = false,
  lines = 3
}) => {
  const variants = {
    default: 'p-6',
    compact: 'p-4',
    large: 'p-8'
  };

  return (
    <div className={cn('bg-surface-100 border border-line rounded-xl animate-pulse', variants[variant], className)}>
      <div className="space-y-4">
        {showAvatar && (
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-surface-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-200 rounded w-3/4" />
              <div className="h-3 bg-surface-200 rounded w-1/2" />
            </div>
          </div>
        )}

        {!showAvatar && (
          <div className="h-6 bg-surface-200 rounded w-3/4" />
        )}

        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 bg-surface-200 rounded',
                i === lines - 1 ? 'w-2/3' : 'w-full'
              )}
            />
          ))}
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="h-8 bg-surface-200 rounded w-20" />
          <div className="h-8 bg-surface-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
};
