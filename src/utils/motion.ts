import { theme } from '../config/theme';

export const routeTransitionTiming = {
  duration: theme.motion.routeTransition.duration,
  ease: theme.motion.routeTransition.ease,
} as const;

export const itemStaggerTiming = {
  delay: theme.motion.itemStagger.delay,
  duration: theme.motion.itemStagger.duration,
} as const;

export const pressScaleMotion = {
  scale: theme.motion.pressScale.scale,
  duration: theme.motion.pressScale.duration,
} as const;
