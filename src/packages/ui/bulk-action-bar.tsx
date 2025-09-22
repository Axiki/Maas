import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MoreHorizontal } from 'lucide-react';
import { cn } from '@mas/utils';
import { Button } from './button';
import { SplitButton, SplitButtonOption } from './split-button';

export interface BulkAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  disabled?: boolean;
}

export interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  primaryAction?: BulkAction;
  secondaryActions?: BulkAction[];
  splitActions?: SplitButtonOption[];
  className?: string;
  sticky?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onClearSelection,
  primaryAction,
  secondaryActions = [],
  splitActions = [],
  className,
  sticky = true
}) => {
  if (selectedCount === 0) return null;

  const positionClasses = sticky
    ? 'sticky bottom-0 z-40'
    : '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'border-t border-line bg-surface-100/95 backdrop-blur-sm',
          positionClasses,
          className
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-primary-100 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {selectedCount} of {totalCount} selected
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8 w-8 p-0"
                aria-label="Clear selection"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Secondary Actions */}
              {secondaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="hidden sm:flex"
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}

              {/* Split Actions (if provided) */}
              {splitActions.length > 0 && (
                <SplitButton
                  primaryAction={{
                    label: 'Actions',
                    onClick: () => {
                      // Handle bulk actions - could open dropdown or modal
                      console.log('Bulk actions clicked - functionality to be implemented');
                    },
                    icon: <MoreHorizontal size={16} />
                  }}
                  options={splitActions}
                  variant="outline"
                  size="sm"
                />
              )}

              {/* Primary Action */}
              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'primary'}
                  size="sm"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                >
                  {primaryAction.icon}
                  <span className="ml-2">{primaryAction.label}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

BulkActionBar.displayName = 'BulkActionBar';
