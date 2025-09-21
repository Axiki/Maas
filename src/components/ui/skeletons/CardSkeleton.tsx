import React from 'react';
import { cn } from '@mas/utils';

export type SkeletonHeadingWidth = 'short' | 'default' | 'long';

const headingWidths: Record<SkeletonHeadingWidth, string> = {
  short: 'w-24',
  default: 'w-32',
  long: 'w-40'
};

export interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  footerLines?: number;
  showMedia?: boolean;
  mediaClassName?: string;
  headingWidth?: SkeletonHeadingWidth;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className,
  lines = 3,
  footerLines = 0,
  showMedia = false,
  mediaClassName,
  headingWidth = 'default',
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-xl border border-line/60 bg-surface-100/60 p-4 shadow-sm shadow-ink/5',
        className
      )}
      {...props}
    >
      <div className="space-y-4">
        {showMedia && (
          <div className={cn('skeleton-surface h-32 w-full rounded-lg', mediaClassName)} />
        )}

        <div className="space-y-2">
          <div className={cn('skeleton-surface h-4 rounded-md', headingWidths[headingWidth])} />
          <div className="skeleton-surface h-3 w-1/3 rounded-md" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: Math.max(lines, 0) }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'skeleton-surface h-3 rounded-md',
                index === lines - 1 ? 'w-5/6' : 'w-full'
              )}
            />
          ))}
        </div>

        {footerLines > 0 && (
          <div className="space-y-2 pt-2">
            {Array.from({ length: footerLines }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'skeleton-surface h-3 rounded-md',
                  index === footerLines - 1 ? 'w-1/2' : 'w-2/3'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
