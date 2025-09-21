import React from 'react';
import { cn } from '@mas/utils';
import { SkeletonBlock } from './SkeletonBlock';

export interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  hasHeader?: boolean;
  hasMedia?: boolean;
  footerLines?: number;
  density?: 'default' | 'compact';
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className,
  lines = 3,
  hasHeader = true,
  hasMedia = false,
  footerLines = 0,
  density = 'default',
  children,
  ...props
}) => {
  const bodyLines = Array.from({ length: lines });
  const footer = Array.from({ length: footerLines });
  const paddingClass = density === 'compact' ? 'p-4' : 'p-6';

  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-surface-100 shadow-card paper-card space-y-4',
        paddingClass,
        'motion-reduce:transition-none motion-reduce:shadow-none',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {hasHeader && (
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-5 w-2/5" />
          <SkeletonBlock className="h-4 w-12" rounded="full" />
        </div>
      )}

      {hasMedia && <SkeletonBlock className="h-40 w-full rounded-lg" rounded="lg" />}

      {lines > 0 && (
        <div className="space-y-3">
          {bodyLines.map((_, index) => (
            <SkeletonBlock
              key={index}
              className={cn('h-4', index === 0 ? 'w-5/6' : index === bodyLines.length - 1 ? 'w-2/3' : 'w-full')}
            />
          ))}
        </div>
      )}

      {children}

      {footerLines > 0 && (
        <div className="space-y-2 pt-2 border-t border-line/70">
          {footer.map((_, index) => (
            <SkeletonBlock key={index} className={cn('h-4', index % 2 === 0 ? 'w-3/4' : 'w-1/2')} />
          ))}
        </div>
      )}
    </div>
  );
};
