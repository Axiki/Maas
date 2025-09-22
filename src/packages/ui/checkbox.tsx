import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@mas/utils';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  disabled = false,
  error = false,
  size = 'md',
  className,
  children,
  id
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label
      className={cn(
        'flex items-center gap-3 cursor-pointer',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />

        <div
          className={cn(
            'rounded border-2 transition-all duration-200 flex items-center justify-center',
            sizeClasses[size],
            // Base styles
            'bg-surface-100 border-line',
            // Checked states
            checked && 'bg-primary-500 border-primary-500',
            // Error states
            error && !checked && 'border-danger/60',
            error && checked && 'bg-danger border-danger',
            // Focus states
            'focus-within:ring-2 focus-within:ring-primary-500/20',
            // Disabled states
            disabled && 'bg-surface-200/40 cursor-not-allowed'
          )}
        >
          <motion.div
            initial={false}
            animate={{ scale: checked ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check
              size={iconSizes[size]}
              className="text-white"
            />
          </motion.div>
        </div>
      </div>

      {children && (
        <span className={cn(
          'text-sm text-ink',
          disabled && 'text-muted'
        )}>
          {children}
        </span>
      )}
    </label>
  );
};

Checkbox.displayName = 'Checkbox';

// Checkbox Group for multiple related checkboxes
export interface CheckboxGroupProps {
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  value?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value = [],
  onChange,
  disabled = false,
  error = false,
  size = 'md',
  orientation = 'vertical',
  className
}) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...value, optionValue]
      : value.filter(v => v !== optionValue);

    onChange?.(newValues);
  };

  const orientationClasses = {
    vertical: 'flex-col space-y-3',
    horizontal: 'flex-row flex-wrap gap-6'
  };

  return (
    <div className={cn('flex', orientationClasses[orientation], className)}>
      {options.map((option) => (
        <Checkbox
          key={option.value}
          checked={value.includes(option.value)}
          onChange={(checked) => handleChange(option.value, checked)}
          disabled={disabled || option.disabled}
          error={error}
          size={size}
        >
          {option.label}
        </Checkbox>
      ))}
    </div>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';
