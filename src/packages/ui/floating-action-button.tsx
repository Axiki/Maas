import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@mas/utils';
import { Button } from './button';

export interface FABAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  disabled?: boolean;
}

export interface FloatingActionButtonProps {
  mainAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  };
  actions?: FABAction[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  mainAction,
  actions = [],
  position = 'bottom-right',
  size = 'md',
  className,
  showLabel = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 18,
    md: 20,
    lg: 24
  };

  const handleMainClick = () => {
    if (mainAction) {
      mainAction.onClick();
    } else if (actions.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const handleActionClick = (action: FABAction) => {
    action.onClick();
    setIsOpen(false);
  };

  if (!mainAction && actions.length === 0) {
    return null;
  }

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'mb-4 flex gap-3',
              isMobile ? 'flex-col-reverse' : 'flex-col'
            )}
          >
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 0, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Button
                  variant={action.variant || 'secondary'}
                  size="icon"
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                  className={cn(
                    'shadow-lg',
                    sizeClasses[size === 'lg' ? 'md' : 'sm'],
                    showLabel && 'px-4'
                  )}
                >
                  {action.icon}
                  {showLabel && (
                    <span className="ml-2 hidden sm:inline">{action.label}</span>
                  )}
                </Button>

                {/* Tooltip */}
                {showLabel && isMobile && (
                  <div className="absolute right-full mr-2 hidden rounded bg-ink px-2 py-1 text-xs text-white group-hover:block">
                    {action.label}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant={mainAction?.variant || 'primary'}
          size="icon"
          onClick={handleMainClick}
          className={cn(
            'shadow-xl transition-all duration-200 hover:scale-110',
            sizeClasses[size],
            isOpen && 'bg-primary-600'
          )}
          aria-label={mainAction?.label || 'Open actions'}
        >
          {mainAction?.icon || <Plus size={iconSizes[size]} />}
        </Button>
      </motion.div>
    </div>
  );
};

FloatingActionButton.displayName = 'FloatingActionButton';
