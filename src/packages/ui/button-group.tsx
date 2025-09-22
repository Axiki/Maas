import React from 'react';
import { cn } from '@mas/utils';

export interface ButtonGroupProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant = 'default',
  orientation = 'horizontal',
  className
}) => {
  const baseClasses = 'inline-flex';

  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  };

  const variantClasses = {
    default: '',
    outline: 'p-1 bg-surface-100 rounded-lg border border-line',
    ghost: 'p-1 rounded-lg'
  };

  const childrenCount = React.Children.count(children);

  return (
    <div
      className={cn(
        baseClasses,
        orientationClasses[orientation],
        variantClasses[variant],
        className
      )}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        // For horizontal layout, remove rounded corners for middle buttons
        const isFirst = index === 0;
        const isLast = index === childrenCount - 1;
        const isMiddle = !isFirst && !isLast;

        let additionalClasses = '';
        if (orientation === 'horizontal') {
          if (isFirst) additionalClasses = 'rounded-r-none';
          else if (isLast) additionalClasses = 'rounded-l-none border-l-0';
          else if (isMiddle) additionalClasses = 'rounded-none border-l-0';
        } else {
          if (isFirst) additionalClasses = 'rounded-b-none';
          else if (isLast) additionalClasses = 'rounded-t-none border-t-0';
          else if (isMiddle) additionalClasses = 'rounded-none border-t-0';
        }

        return React.cloneElement(child as React.ReactElement<any>, {
          className: cn(
            (child.props as any)?.className,
            additionalClasses
          )
        });
      })}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';
