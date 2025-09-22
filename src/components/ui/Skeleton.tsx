import React from 'react';
import { cn } from '@mas/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, shimmer = true, ...props }) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-lg bg-surface-200/80',
      shimmer && 'after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:animate-[shimmer_1.6s_infinite]',
      className
    )}
    {...props}
  />
);

export default Skeleton;
