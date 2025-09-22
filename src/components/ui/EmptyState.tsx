import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24'
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeClasses[size],
        className
      )}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6 p-4 bg-surface-100 rounded-full"
        >
          <Icon size={size === 'sm' ? 32 : size === 'md' ? 48 : 64} className="text-muted" />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="space-y-3"
      >
        <h3 className={cn(
          'font-semibold text-ink',
          size === 'sm' ? 'heading-sm' : size === 'md' ? 'heading-md' : 'heading-lg'
        )}>
          {title}
        </h3>

        {description && (
          <p className={cn(
            'text-muted max-w-md',
            size === 'sm' ? 'body-sm' : 'body-md'
          )}>
            {description}
          </p>
        )}
      </motion.div>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-6"
        >
          <button
            onClick={action.onClick}
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium transition-colors',
              action.variant === 'secondary'
                ? 'border border-line bg-surface-100 text-ink hover:bg-surface-200'
                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-card'
            )}
          >
            {action.label}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
