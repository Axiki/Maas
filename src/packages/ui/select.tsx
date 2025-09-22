import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '@mas/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string | boolean;
  success?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base'
};

const variantClasses = {
  default: 'bg-surface-100/80 border-line',
  filled: 'bg-surface-200/60 border-transparent',
  outlined: 'bg-transparent border-line'
};

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  error,
  success,
  disabled = false,
  searchable = false,
  clearable = false,
  multiple = false,
  size = 'md',
  variant = 'default',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(value ? [value] : []);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const newValues = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];

      setSelectedValues(newValues);
      onChange?.(newValues.join(','));
    } else {
      setSelectedValues([option.value]);
      onChange?.(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = () => {
    setSelectedValues([]);
    onChange?.('');
    setSearchTerm('');
  };

  const getDisplayValue = () => {
    if (multiple) {
      const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));
      return selectedOptions.length > 0
        ? `${selectedOptions.length} selected`
        : placeholder;
    } else {
      const selectedOption = options.find(opt => opt.value === selectedValues[0]);
      return selectedOption?.label || placeholder;
    }
  };

  const isSelected = (optionValue: string) => {
    return multiple ? selectedValues.includes(optionValue) : selectedValues[0] === optionValue;
  };

  return (
    <div className={cn('relative', className)} ref={selectRef}>
      {/* Label */}
      {label && (
        <label className="mb-2 block text-sm font-medium text-ink">
          {label}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'relative w-full rounded-lg border text-left transition-all duration-200 focus:outline-none',
          sizeClasses[size],
          variantClasses[variant],
          // Focus states
          'focus:border-primary-300 focus:ring-2 focus:ring-primary-500/10',
          // Error states
          error && 'border-danger/60 focus:border-danger focus:ring-danger/20',
          // Success states
          success && !error && 'border-success/60 focus:border-success focus:ring-success/20',
          // Disabled states
          disabled && 'opacity-60 cursor-not-allowed bg-surface-200/40',
          isOpen && 'border-primary-300 ring-2 ring-primary-500/10'
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            'truncate',
            selectedValues.length === 0 && 'text-muted'
          )}>
            {getDisplayValue()}
          </span>
          <div className="flex items-center gap-1">
            {clearable && selectedValues.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-surface-200 rounded"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown
              size={16}
              className={cn(
                'transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-lg border border-line bg-surface-100 shadow-lg"
          >
            {/* Search */}
            {searchable && (
              <div className="border-b border-line p-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border-none focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors',
                      'hover:bg-surface-200 focus:bg-surface-200 focus:outline-none',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      isSelected(option.value) && 'bg-primary-100 text-primary-700'
                    )}
                  >
                    {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                    <span className="flex-1 text-left">{option.label}</span>
                    {isSelected(option.value) && (
                      <Check size={16} className="flex-shrink-0 text-primary-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Select.displayName = 'Select';
