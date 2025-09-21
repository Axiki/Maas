import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { theme } from '../../config/theme';
import { useGlobalLoading } from '../../stores/loadingStore';

export const LoadingOverlay: React.FC = () => {
  const { isLoading, message } = useGlobalLoading();
  const prefersReducedMotion = useReducedMotion();
  const headline = message ?? 'Preparing your experience…';

  const overlayTransition = React.useMemo(
    () => ({
      duration: theme.motion.routeTransition.duration,
      ease: theme.motion.routeTransition.ease
    }),
    []
  );

  const panelInitial = React.useMemo(
    () => ({
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.96,
      y: prefersReducedMotion ? 0 : 12
    }),
    [prefersReducedMotion]
  );

  const panelExit = React.useMemo(
    () => ({
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.96,
      y: prefersReducedMotion ? 0 : -12
    }),
    [prefersReducedMotion]
  );

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          role="status"
          aria-live="polite"
          aria-label={headline}
        >
          <motion.div
            className="rounded-2xl border border-line/60 bg-surface-100/95 p-6 shadow-modal"
            initial={panelInitial}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={panelExit}
            transition={overlayTransition}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-6 w-6 text-primary-500 motion-safe:animate-spin motion-reduce:animate-none" />
              <p className="text-sm font-medium text-ink">{headline}</p>
              <p className="text-xs text-muted">
                Please wait while we synchronise your data.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
