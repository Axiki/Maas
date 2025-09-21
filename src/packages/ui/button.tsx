import React from 'react';
import { cn } from '@mas/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = 'Button';
