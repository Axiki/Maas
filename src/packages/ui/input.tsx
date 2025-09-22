import React from 'react';
import { cn } from '@mas/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  error?: string | boolean;
  success?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
};

const variantClasses = {
  default: 'bg-surface-100/80 border-line',
  filled: 'bg-surface-200/60 border-transparent',
  outlined: 'bg-transparent border-line'
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    leadingIcon,
    trailingIcon,
    error,
    success,
    inputSize = 'md',
    variant = 'default',
    type = 'text',
    ...props
  }, ref) => (
    <div className={cn('relative flex items-center', className)}>
      {leadingIcon ? (
        <span className={cn(
          'pointer-events-none absolute inset-y-0 left-3 flex items-center',
          error ? 'text-danger' : success ? 'text-success' : 'text-muted'
        )}>
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-lg border transition-all duration-200 focus:outline-none',
          sizeClasses[inputSize as keyof typeof sizeClasses],
          variantClasses[variant],
          Boolean(leadingIcon) && 'pl-9',
          Boolean(trailingIcon) && 'pr-10',
          // Focus states
          'focus:border-primary-300 focus:ring-2 focus:ring-primary-500/10',
          // Error states
          error && 'border-danger/60 focus:border-danger focus:ring-danger/20',
          // Success states
          success && !error && 'border-success/60 focus:border-success focus:ring-success/20',
          // Disabled states
          props.disabled && 'opacity-60 cursor-not-allowed bg-surface-200/40'
        )}
        {...props}
      />
      {trailingIcon ? (
        <span className={cn(
          'pointer-events-none absolute inset-y-0 right-3 flex items-center',
          error ? 'text-danger' : success ? 'text-success' : 'text-muted'
        )}>
          {trailingIcon}
        </span>
      ) : null}
    </div>
  )
);

Input.displayName = 'Input';

export default Input;
