import React from 'react';
import { cn } from '@mas/utils';

type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

export const PageContainer: React.FC<PageContainerProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};
