import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { routeTransitionTiming, itemStaggerTiming } from '../../utils/motion';

interface MotionWrapperProps {
  children: React.ReactNode;
  type?: 'page' | 'modal' | 'card' | 'list-item';
  className?: string;
  layoutId?: string;
  delay?: number;
  forceMotion?: boolean;
}

const variants = {
  page: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 }
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  },
  card: {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -12, scale: 0.98 }
  },
  'list-item': {
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -12 }
  }
};

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  type = 'page',
  className = '',
  layoutId,
  delay = 0,
  forceMotion = false
}) => {
  const variant = variants[type];
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion && !forceMotion;

  const transition = {
    duration: shouldReduceMotion ? 0 : routeTransitionTiming.duration,
    ease: routeTransitionTiming.ease,
    delay: shouldReduceMotion ? 0 : delay
  };

  return (
    <motion.div
      layoutId={layoutId}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={transition}
      className={className}
      whileTap={{ scale: type === 'card' ? 0.98 : 1 }}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedList: React.FC<{
  children: React.ReactNode[];
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <MotionWrapper
          key={index}
          type="list-item"
          delay={index * itemStaggerTiming.delay}
        >
          {child}
        </MotionWrapper>
      ))}
    </div>
  );
};

export const PageTransition: React.FC<{
  children: React.ReactNode;
  mode?: 'wait' | 'sync';
}> = ({ children, mode = 'wait' }) => {
  return (
    <AnimatePresence mode={mode}>
      {children}
    </AnimatePresence>
  );
};