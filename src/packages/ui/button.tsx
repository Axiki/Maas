import React from 'react';
import { cn } from '@mas/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'tertiary';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white shadow-card hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:bg-primary-500/50 disabled:text-white/70',
  secondary:
    'bg-surface-100 text-ink hover:bg-surface-200 border border-line focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:text-muted disabled:bg-surface-200/60',
  outline:
    'border border-line text-ink hover:border-primary-200 hover:text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:text-muted',
  ghost:
    'text-muted hover:text-ink hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-500/20 disabled:text-muted',
  destructive:
    'bg-danger text-white shadow-card hover:bg-danger/90 focus-visible:ring-2 focus-visible:ring-danger/40 disabled:bg-danger/60',
  link:
    'text-primary-600 underline underline-offset-4 hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:text-muted',
  tertiary:
    'bg-surface-200/50 text-ink hover:bg-surface-200 border border-transparent focus-visible:ring-2 focus-visible:ring-primary-500/20 disabled:text-muted disabled:bg-surface-200/30'
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', isLoading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        isLoading && 'relative text-transparent pointer-events-none',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className={cn('flex items-center gap-2', isLoading && 'invisible')}>{children}</span>
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
        </span>
      ) : null}
    </button>
  )
);

Button.displayName = 'Button';
