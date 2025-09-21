import React from 'react';
import { cn } from '@mas/utils';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseControlClasses =
  'w-full rounded-lg border border-line bg-surface-200/60 px-3 py-2.5 text-sm text-ink shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 placeholder:text-muted/70 disabled:cursor-not-allowed disabled:opacity-70';

export const FormField: React.FC<DivProps> = ({ className, ...props }) => (
  <div className={cn('space-y-2', className)} {...props} />
);

export const FormLabel = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium text-ink', className)}
      {...props}
    >
      {children}
    </label>
  )
);

FormLabel.displayName = 'FormLabel';

export const FormInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(baseControlClasses, className)}
      {...props}
    />
  )
);

FormInput.displayName = 'FormInput';

export const FormSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(baseControlClasses, 'appearance-none pr-10', className)}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-muted"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
);

FormSelect.displayName = 'FormSelect';

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(baseControlClasses, 'resize-none leading-relaxed', className)}
      {...props}
    />
  )
);

FormTextarea.displayName = 'FormTextarea';

export const FormHelperText: React.FC<DivProps> = ({ className, children, ...props }) => (
  <p className={cn('text-xs text-muted', className)} {...props}>
    {children}
  </p>
);

