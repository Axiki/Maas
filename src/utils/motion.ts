import { theme } from '../config/theme';

type MotionToken = 'itemStagger' | 'routeTransition';

const timeVarMap: Record<MotionToken, { duration: string; delay?: string }> = {
  itemStagger: {
    duration: '--transition-item-duration',
    delay: '--transition-item-delay'
  },
  routeTransition: {
    duration: '--transition-route-duration'
  }
};

const easeVar = '--transition-route-ease';

const defaultEase = 'cubic-bezier(0.4, 0, 0.2, 1)';

const fallbackTiming: Record<MotionToken, { duration: number; delay: number; ease: string }> = {
  itemStagger: {
    duration: theme.motion.itemStagger.duration,
    delay: theme.motion.itemStagger.delay,
    ease: defaultEase
  },
  routeTransition: {
    duration: theme.motion.routeTransition.duration,
    delay: 0,
    ease: defaultEase
  }
};

const parseTimeValue = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.endsWith('ms')) {
    const numeric = Number.parseFloat(trimmed.replace('ms', ''));
    return Number.isFinite(numeric) ? numeric / 1000 : null;
  }

  if (trimmed.endsWith('s')) {
    const numeric = Number.parseFloat(trimmed.replace('s', ''));
    return Number.isFinite(numeric) ? numeric : null;
  }

  const numeric = Number.parseFloat(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
};

const getComputedVar = (variable: string) => {
  if (typeof window === 'undefined') return null;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable);
  return value.trim() || null;
};

export const shouldReduceMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getMotionTiming = (token: MotionToken) => {
  const timingVars = timeVarMap[token];
  const durationFromVar = parseTimeValue(getComputedVar(timingVars.duration));
  const delayVar = timingVars.delay ? parseTimeValue(getComputedVar(timingVars.delay)) : null;
  const easeFromVar = getComputedVar(easeVar);

  const fallback = fallbackTiming[token];

  return {
    duration: durationFromVar ?? fallback.duration,
    delay: delayVar ?? fallback.delay,
    ease: easeFromVar ?? fallback.ease
  };
};
