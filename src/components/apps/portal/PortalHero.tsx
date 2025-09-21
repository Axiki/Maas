import React, { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mas/ui';
import { cn } from '@mas/utils';
import { Grid3x3, Check } from 'lucide-react';
import { theme } from '../../../../config/theme';

const MotionButton = motion(Button);

const features = [
  {
    title: 'Role-aware launcher',
    description:
      'Tiles light up with live state and badges so every role jumps into the right workflow immediately.'
  },
  {
    title: 'One-tap POS entry',
    description:
      'Resume held tables, tabs, and orders with offline sync the moment you open the MAS POS.'
  },
  {
    title: 'Shift continuity',
    description:
      'Hand off to kitchen, backoffice, or devices without losing the context your guests depend on.'
  }
] as const;

export type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

export const PageContainer: React.FC<PageContainerProps> = ({ className, children, ...props }) => (
  <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...props}>
    {children}
  </div>
);

export const PortalHero: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const baseTransition = useMemo(
    () => ({
      duration: shouldReduceMotion ? 0 : theme.motion.routeTransition.duration,
      ease: theme.motion.routeTransition.ease
    }),
    [shouldReduceMotion]
  );

  const itemTiming = useMemo(
    () => ({
      duration: shouldReduceMotion ? 0 : theme.motion.itemStagger.duration,
      delayStep: shouldReduceMotion ? 0 : theme.motion.itemStagger.delay
    }),
    [shouldReduceMotion]
  );

  const handleCTA = useCallback(() => {
    navigate('/pos');
  }, [navigate]);

  return (
    <motion.section
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={baseTransition}
      className="relative overflow-hidden rounded-3xl border border-[#D6D6D6]/20 bg-[#24242E] px-6 py-10 text-[#D6D6D6] shadow-card sm:px-10 sm:py-14"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(238,118,109,0.18),_transparent_55%)]"
      />

      <div className="relative z-10 flex flex-col items-center gap-10 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div className="flex max-w-2xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={baseTransition}
            className="flex items-center justify-center"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-[#EE766D]/30 bg-[#EE766D]/15 px-4 py-2 text-sm font-semibold text-[#EE766D] shadow-[0_10px_30px_rgba(36,36,46,0.25)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EE766D]/20 text-[#EE766D]">
                <Grid3x3 className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span className="uppercase tracking-wide text-xs text-[#D6D6D6]">MAS Suite</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={baseTransition}
            className="text-balance text-4xl font-semibold leading-tight text-[#D6D6D6] sm:text-5xl"
          >
            Your command center for every service window
          </motion.h1>

          <motion.p
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={baseTransition}
            className="text-balance text-base text-[#D6D6D6]/80 sm:text-lg"
          >
            Launch straight into the MAS apps that keep guests happy and teams coordinated. Real-time status, offline resilience,
            and context follow you wherever you go.
          </motion.p>

          <MotionButton
            type="button"
            variant="primary"
            onClick={handleCTA}
            className="!border-transparent !bg-[#EE766D] !text-[#24242E] !shadow-[0_16px_48px_rgba(238,118,109,0.35)] hover:!bg-[#f48a82] hover:!text-[#24242E] focus-visible:!ring-[#EE766D]/45 focus-visible:!ring-offset-2 focus-visible:!ring-offset-[#24242E] active:!bg-[#e55e53]"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            transition={{
              duration: shouldReduceMotion ? 0 : theme.motion.pressScale.duration,
              ease: theme.motion.routeTransition.ease
            }}
          >
            Open POS
          </MotionButton>
        </div>

        <motion.ul
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={baseTransition}
          className="grid w-full max-w-md gap-4 text-left"
        >
          {features.map((feature, index) => (
            <motion.li
              key={feature.title}
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: itemTiming.duration,
                delay: itemTiming.delayStep * index,
                ease: theme.motion.routeTransition.ease
              }}
              className="flex gap-4 rounded-2xl border border-[#D6D6D6]/15 bg-[#24242E]/40 p-4"
            >
              <span className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EE766D]/20 text-[#EE766D] ring-1 ring-inset ring-[#EE766D]/30">
                <Check className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#D6D6D6]">{feature.title}</h3>
                <p className="text-sm text-[#D6D6D6]/75">{feature.description}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.section>
  );
};
