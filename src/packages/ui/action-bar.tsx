import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@mas/utils';
import { Button } from './button';
import { SplitButton, SplitButtonOption } from './split-button';
import { ButtonGroup } from './button-group';

export interface ActionBarAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'tertiary';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export interface ActionBarProps {
  actions: ActionBarAction[];
  layout?: 'horizontal' | 'vertical' | 'responsive';
  align?: 'start' | 'center' | 'end' | 'between' | 'around';
  splitActions?: SplitButtonOption[];
  className?: string;
  sticky?: boolean;
  elevated?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  actions,
  layout = 'horizontal',
  align = 'start',
  splitActions = [],
  className,
  sticky = false,
  elevated = false
}) => {
  const layoutClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
    responsive: 'flex-col sm:flex-row'
  };

  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  const primaryActions = actions.filter(action => action.variant === 'primary' || action.variant === 'destructive');
  const secondaryActions = actions.filter(action => action.variant !== 'primary' && action.variant !== 'destructive');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 p-4',
        layoutClasses[layout],
        alignClasses[align],
        sticky && 'sticky bottom-0 z-40 bg-surface-100/95 backdrop-blur-sm border-t border-line',
        elevated && 'bg-surface-100/80 backdrop-blur-sm border border-line rounded-lg shadow-lg',
        className
      )}
    >
      {/* Split Actions (if provided) */}
      {splitActions.length > 0 && (
        <SplitButton
          primaryAction={{
            label: 'Actions',
            onClick: () => {
              // Handle action bar action - could open dropdown or modal
              console.log('Action bar clicked - functionality to be implemented');
            },
          }}
          options={splitActions}
          variant="outline"
          size="md"
        />
      )}

      {/* Button Groups */}
      {secondaryActions.length > 0 && (
        <ButtonGroup variant="outline">
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={action.size || 'md'}
              onClick={action.onClick}
              disabled={action.disabled}
              isLoading={action.loading}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </ButtonGroup>
      )}

      {/* Primary Actions */}
      {primaryActions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'primary'}
          size={action.size || 'md'}
          onClick={action.onClick}
          disabled={action.disabled}
          isLoading={action.loading}
        >
          {action.icon}
          <span className="ml-2">{action.label}</span>
        </Button>
      ))}
    </motion.div>
  );
};

ActionBar.displayName = 'ActionBar';
