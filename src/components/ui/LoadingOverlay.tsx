import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '../../utils/cn';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'progress';
  className?: string;
  blur?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  variant = 'spinner',
  className,
  blur = true
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed inset-0 z-[140] flex items-center justify-center',
            blur && 'backdrop-blur-sm bg-ink/20',
            !blur && 'bg-surface-100',
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-surface-100 border border-line rounded-2xl p-8 shadow-lg max-w-sm mx-4"
          >
            <div className="flex flex-col items-center space-y-4">
              {variant === 'spinner' && (
                <LoadingSpinner size="lg" />
              )}

              {variant === 'skeleton' && (
                <div className="space-y-3 w-full">
                  <div className="h-4 bg-surface-200 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-surface-200 rounded w-1/2 mx-auto" />
                  <div className="h-3 bg-surface-200 rounded w-2/3 mx-auto" />
                </div>
              )}

              {variant === 'progress' && (
                <div className="w-full space-y-2">
                  <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  </div>
                </div>
              )}

              <p className="text-sm text-muted text-center font-medium">
                {message}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
