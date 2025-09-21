import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mas/ui';
import { MotionWrapper } from '../../ui/MotionWrapper';

interface PortalHeroProps {
  userName?: string;
  tenantName?: string;
  userRole?: string;
}

const HIGHLIGHTS = [
  {
    title: 'Front-of-house ready',
    description: 'Launch the POS in one tap and keep tables moving without breaking stride.',
  },
  {
    title: 'Shared context',
    description: 'Give every shift the same playbook with live updates across your venues.',
  },
  {
    title: 'Actionable insights',
    description: 'Start the day with real-time sales, labour, and inventory signals in view.',
  },
];

export const PortalHero: React.FC<PortalHeroProps> = ({ userName, tenantName, userRole }) => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const supportingCopyId = React.useId();

  const handleNavigateToPos = React.useCallback(() => {
    navigate('/pos');
  }, [navigate]);

  const containerClassName =
    'relative overflow-hidden rounded-3xl border border-line/70 bg-gradient-to-br from-primary-100/60 via-surface-100 to-surface-100 px-6 py-10 shadow-card sm:px-10 lg:px-14 lg:py-16';

  const getMotionProps = React.useCallback(
    (delay: number) =>
      prefersReducedMotion
        ? {}
        : {
            initial: { opacity: 0, y: 18 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.55, delay },
          },
    [prefersReducedMotion]
  );

  const WrapperComponent = prefersReducedMotion
    ? ({ children }: { children: React.ReactNode }) => <div className={containerClassName}>{children}</div>
    : ({ children }: { children: React.ReactNode }) => (
        <MotionWrapper type="card" className={containerClassName}>
          {children}
        </MotionWrapper>
      );

  const heroHeadline = tenantName
    ? `Run ${tenantName} with confidence.`
    : 'Your command center for modern hospitality.';

  const heroSubhead = tenantName || userRole
    ? [tenantName, userRole].filter(Boolean).join(' • ')
    : 'Hospitality operations platform';

  return (
    <section aria-labelledby="portal-hero-title" className="w-full">
      <WrapperComponent>
        <div className="absolute -right-32 -top-16 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" aria-hidden />
        <div className="absolute bottom-[-5rem] left-1/3 h-64 w-64 rounded-full bg-primary-200/40 blur-3xl" aria-hidden />

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-6 lg:max-w-2xl">
            <motion.div {...getMotionProps(0)}>
              <span className="inline-flex items-center gap-3 rounded-full bg-primary-100/80 px-4 py-2 text-sm font-medium text-primary-600 ring-1 ring-primary-200/70 backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-base font-semibold uppercase tracking-wide text-white">
                  MAS
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-500/80">Portal</span>
                  <span>Operations hub</span>
                </span>
              </span>
            </motion.div>

            <motion.p
              {...getMotionProps(0.06)}
              className="text-sm font-medium uppercase tracking-[0.32em] text-primary-600/90"
            >
              {heroSubhead}
            </motion.p>

            <motion.h1
              {...getMotionProps(0.12)}
              id="portal-hero-title"
              className="text-3xl font-semibold text-ink text-balance sm:text-4xl lg:text-5xl"
            >
              {heroHeadline}
            </motion.h1>

            <motion.p
              {...getMotionProps(0.2)}
              id={supportingCopyId}
              className="max-w-2xl text-base text-muted sm:text-lg"
            >
              {userName ? `Welcome back, ${userName}. ` : ''}
              Synchronise your guest experience, finance, and back-of-house routines from a single place. Launch tools,
              review shift notes, and get everyone aligned before the rush hits.
            </motion.p>

            <motion.div
              {...getMotionProps(0.28)}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                variant="primary"
                onClick={handleNavigateToPos}
                aria-describedby={supportingCopyId}
              >
                Launch POS
              </Button>

              <span className="text-sm text-muted">
                Keyboard friendly — hit Enter or Space to start taking orders.
              </span>
            </motion.div>
          </div>

          <motion.ul
            {...getMotionProps(0.36)}
            className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-sm"
          >
            {HIGHLIGHTS.map((item, index) => (
              <motion.li
                key={item.title}
                {...getMotionProps(0.4 + index * 0.04)}
                className="relative overflow-hidden rounded-2xl border border-line/70 bg-surface-100/80 p-4 shadow-sm"
              >
                <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/15 text-primary-600">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                </span>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-muted leading-relaxed">{item.description}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </WrapperComponent>
    </section>
  );
};
