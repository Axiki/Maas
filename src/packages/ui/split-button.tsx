import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@mas/utils';
import { Button, ButtonProps } from './button';

export interface SplitButtonOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface SplitButtonProps extends Omit<ButtonProps, 'children'> {
  primaryAction: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    loading?: boolean;
  };
  options: SplitButtonOption[];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  disabled?: boolean;
  className?: string;
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  primaryAction,
  options,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SplitButtonOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrimaryClick = () => {
    if (!disabled && !primaryAction.loading) {
      primaryAction.onClick();
    }
  };

  const handleOptionClick = (option: SplitButtonOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    // In a real implementation, this would trigger the option's action
    console.log('Selected option:', option.value);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn('relative inline-flex', className)} ref={dropdownRef}>
      {/* Primary Button */}
      <Button
        variant={variant}
        size={size}
        onClick={handlePrimaryClick}
        disabled={disabled || primaryAction.loading}
        isLoading={primaryAction.loading}
        className="rounded-r-none border-r-0"
      >
        {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
        {primaryAction.label}
      </Button>

      {/* Dropdown Toggle Button */}
      <Button
        variant={variant}
        size={size}
        onClick={handleDropdownToggle}
        disabled={disabled}
        className={cn(
          'rounded-l-none border-l-0 px-2',
          isOpen && 'bg-primary-600'
        )}
        aria-label="More options"
      >
        <ChevronDown
          size={16}
          className={cn(
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[200px] rounded-lg border border-line bg-surface-100 py-1 shadow-lg">
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option)}
              disabled={option.disabled}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                'hover:bg-surface-200 focus:bg-surface-200 focus:outline-none',
                option.disabled && 'opacity-50 cursor-not-allowed',
                option.destructive && 'text-danger hover:bg-danger/10 focus:bg-danger/10',
                selectedOption?.value === option.value && 'bg-primary-100 text-primary-700'
              )}
            >
              {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
              <span className="flex-1">{option.label}</span>
              {selectedOption?.value === option.value && (
                <Check size={16} className="flex-shrink-0 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

SplitButton.displayName = 'SplitButton';
