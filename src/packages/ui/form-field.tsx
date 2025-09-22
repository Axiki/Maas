import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@mas/utils';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface FormFieldProps {
  label?: string;
  children: React.ReactNode;
  error?: string | boolean;
  success?: boolean;
  required?: boolean;
  help?: string;
  description?: string;
  className?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  success,
  required,
  help,
  description,
  className,
  labelClassName,
  size = 'md'
}) => {
  const showError = error && typeof error === 'string';
  const showSuccess = success && !error;
  const showHelp = help || description;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {label && (
        <label className={cn(
          'flex items-center gap-2 font-medium text-ink',
          sizeClasses[size],
          labelClassName
        )}>
          {label}
          {required && <span className="text-danger">*</span>}
          {showSuccess && <CheckCircle size={16} className="text-success" />}
          {showError && <AlertCircle size={16} className="text-danger" />}
        </label>
      )}

      {/* Field */}
      <div className="relative">
        {children}

        {/* Error Message */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex items-start gap-2"
            >
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-danger" />
              <span className="text-xs text-danger">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && !showError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex items-center gap-2"
            >
              <CheckCircle size={14} className="flex-shrink-0 text-success" />
              <span className="text-xs text-success">Looks good!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help/Description Text */}
        {showHelp && !showError && (
          <div className="mt-2 flex items-start gap-2">
            {help && <Info size={14} className="mt-0.5 flex-shrink-0 text-muted" />}
            <span className={cn(
              'text-xs text-muted',
              help ? 'text-primary-600' : ''
            )}>
              {help || description}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

FormField.displayName = 'FormField';
