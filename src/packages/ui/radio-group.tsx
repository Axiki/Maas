import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@mas/utils';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  disabled = false,
  error = false,
  size = 'md',
  orientation = 'vertical',
  className
}) => {
  const handleChange = (optionValue: string) => {
    if (!disabled) {
      onChange?.(optionValue);
    }
  };

  const orientationClasses = {
    vertical: 'flex-col space-y-3',
    horizontal: 'flex-row flex-wrap gap-6'
  };

  return (
    <div className={cn('flex', orientationClasses[orientation], className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex items-start gap-3 cursor-pointer',
            (disabled || option.disabled) && 'cursor-not-allowed opacity-60'
          )}
        >
          <div className="relative flex-shrink-0">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled || option.disabled}
              className="sr-only"
            />

            <div
              className={cn(
                'rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                sizeClasses[size],
                // Base styles
                'bg-surface-100 border-line',
                // Checked states
                value === option.value && 'bg-primary-500 border-primary-500',
                // Error states
                error && value !== option.value && 'border-danger/60',
                error && value === option.value && 'bg-danger border-danger',
                // Focus states
                'focus-within:ring-2 focus-within:ring-primary-500/20',
                // Disabled states
                (disabled || option.disabled) && 'bg-surface-200/40 cursor-not-allowed'
              )}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: value === option.value ? 1 : 0,
                  opacity: value === option.value ? 1 : 0
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(
                  'rounded-full bg-white',
                  size === 'sm' && 'h-2 w-2',
                  size === 'md' && 'h-2.5 w-2.5',
                  size === 'lg' && 'h-3 w-3'
                )}
              />
            </div>
          </div>

          <div className="flex-1">
            <span className={cn(
              'text-sm font-medium text-ink',
              (disabled || option.disabled) && 'text-muted'
            )}>
              {option.label}
            </span>
            {option.description && (
              <p className={cn(
                'text-xs text-muted mt-1',
                (disabled || option.disabled) && 'text-muted/70'
              )}>
                {option.description}
              </p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';
