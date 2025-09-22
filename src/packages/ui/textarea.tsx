import React from 'react';
import { cn } from '@mas/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | boolean;
  success?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
}

const resizeClasses = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize'
};

const variantClasses = {
  default: 'bg-surface-100/80 border-line',
  filled: 'bg-surface-200/60 border-transparent',
  outlined: 'bg-transparent border-line'
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    error,
    success,
    resize = 'vertical',
    variant = 'default',
    ...props
  }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:outline-none',
        'placeholder:text-muted',
        resizeClasses[resize],
        variantClasses[variant],
        // Focus states
        'focus:border-primary-300 focus:ring-2 focus:ring-primary-500/10',
        // Error states
        error && 'border-danger/60 focus:border-danger focus:ring-danger/20',
        // Success states
        success && !error && 'border-success/60 focus:border-success focus:ring-success/20',
        // Disabled states
        props.disabled && 'opacity-60 cursor-not-allowed bg-surface-200/40',
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

export default Textarea;
