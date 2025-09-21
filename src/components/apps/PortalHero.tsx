import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface PortalHeroProps {
  userName?: string;
  tenantName?: string;
  userRole?: string;
  appCount: number;
}

export const PortalHero: React.FC<PortalHeroProps> = ({
  userName,
  tenantName,
  userRole,
  appCount
}) => {
  const displayName = userName ?? 'there';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-surface-100 shadow-card">
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary-100/60 via-transparent to-surface-200"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-8 px-6 py-10 sm:px-8 lg:px-12 lg:py-12 md:flex-row md:items-center">
        <div className="flex-1 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-600">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Suite launcher</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Welcome back, {displayName}.
            </h1>
            <p className="text-base text-muted sm:text-lg">
              Everything you need to run operations lives here. Jump straight into the POS when the dinner rush starts or review today&apos;s numbers at a glance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            {tenantName && (
              <span className="font-medium text-ink">{tenantName}</span>
            )}
            {userRole && (
              <span className="rounded-full border border-line bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {userRole}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/pos"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-5 py-3 text-sm font-medium text-white shadow-card transition-colors duration-200 hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              Open POS
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <span className="text-sm text-muted sm:ml-2">Keyboard friendly — press Enter to launch.</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-3xl border border-line/70 bg-white/80 p-5 shadow-sm backdrop-blur md:w-72 lg:w-80">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Apps ready</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{appCount}</p>
            <p className="text-xs text-muted">Filtered to your current permissions.</p>
          </div>
          <div className="rounded-2xl border border-line/60 bg-surface-100/80 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary-500" aria-hidden="true" />
              <p className="text-sm font-semibold text-ink">Shift ready</p>
            </div>
            <p className="mt-1 text-xs text-muted">Device sync, offline queue, and payments all look good.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
