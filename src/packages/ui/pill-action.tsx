import React from 'react';
import { cn } from '@mas/utils';
import { Button, ButtonProps } from './button';

export interface PillActionProps extends Omit<ButtonProps, 'size'> {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md';
  active?: boolean;
  className?: string;
}

export const PillAction: React.FC<PillActionProps> = ({
  children,
  size = 'sm',
  active = false,
  variant = 'ghost',
  className,
  ...props
}) => {
  const sizeClasses = {
    xs: 'h-6 px-2 text-xs',
    sm: 'h-7 px-3 text-xs',
    md: 'h-8 px-4 text-sm'
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn(
        'rounded-full font-medium transition-all duration-200',
        'hover:scale-105 active:scale-95',
        sizeClasses[size],
        active && 'bg-primary-100 text-primary-700 border-primary-200',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

PillAction.displayName = 'PillAction';

// Pill Action Group for multiple related pill actions
export interface PillActionGroupProps {
  children: React.ReactNode;
  className?: string;
  size?: PillActionProps['size'];
}

export const PillActionGroup: React.FC<PillActionGroupProps> = ({
  children,
  className,
  size = 'sm'
}) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child as React.ReactElement<PillActionProps>, {
          size
        });
      })}
    </div>
  );
};

PillActionGroup.displayName = 'PillActionGroup';
