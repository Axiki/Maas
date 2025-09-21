import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { MotionWrapper } from '../../ui/MotionWrapper';
import { cn } from '@mas/utils';

interface PortalHeroProps {
  className?: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: FeatureItem[] = [
  {
    title: 'Unified control',
    description:
      'Switch between MAS experiences without logging out and keep every tool in lockstep.',
    icon: LayoutDashboard,
  },
  {
    title: 'Live performance',
    description:
      'Monitor revenue, covers, and fulfilment pace with live telemetry surfaced at a glance.',
    icon: Sparkles,
  },
  {
    title: 'Operational assurance',
    description:
      'Granular roles with audit trails keep data secure while your teams collaborate in real time.',
    icon: ShieldCheck,
  },
];

export const PortalHero: React.FC<PortalHeroProps> = ({ className }) => {
  return (
    <MotionWrapper
      type="page"
      className={cn(
        'relative isolate overflow-hidden rounded-3xl border border-[#D6D6D6] bg-[#24242E] px-6 py-12 text-[#D6D6D6] shadow-card md:px-12',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#EE766D]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#EE766D]/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#D6D6D6]/40 bg-[#24242E] px-5 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#D6D6D6]/80">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EE766D] text-base font-semibold leading-none text-[#24242E]">
              MAS
            </span>
            <span>Management Suite</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Command the MAS portal with clarity.
            </h1>
            <p className="max-w-2xl text-base text-[#D6D6D6]/90 sm:text-lg">
              Navigate every MAS application with one secure doorway. Personalised shortcuts and shared context keep teams synced as service speeds up.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/pos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EE766D] px-6 py-3 text-base font-semibold text-[#24242E] transition-all duration-200 hover:bg-[#f28f86] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE766D]"
            >
              Launch POS
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <span className="text-sm text-[#D6D6D6]/80">
              Seamless switching keeps your front-of-house focused on the guest, not the menu.
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="flex h-full flex-col gap-3 rounded-2xl border border-[#D6D6D6]/30 bg-white/5 p-6 backdrop-blur-sm transition hover:border-[#EE766D]/60"
              >
                <div className="flex items-center gap-3 text-white">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EE766D]/15 text-[#EE766D]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
                <p className="text-sm text-[#D6D6D6]/85">{description}</p>
              </div>
            ))}

            <div className="rounded-2xl border border-dashed border-[#D6D6D6]/40 bg-[#24242E] p-6 text-sm text-[#D6D6D6]/80">
              <p className="font-medium uppercase tracking-[0.24em] text-[#EE766D]">What&apos;s inside</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed">
                <li>• Role-aware workspaces tailored for every MAS role.</li>
                <li>• Alerts and service insights surfaced in real time.</li>
                <li>• Lightning-fast navigation with consistent keyboard access.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
};
