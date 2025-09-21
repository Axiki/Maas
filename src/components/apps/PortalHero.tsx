import React from 'react';
import { Button } from '@mas/ui';

interface PortalHeroProps {
  userName?: string;
  tenantName?: string;
  role?: string;
  appsCount: number;
  onCtaClick: () => void;
}

export const PortalHero: React.FC<PortalHeroProps> = ({
  userName,
  tenantName,
  role,
  appsCount,
  onCtaClick,
}) => {
  const roleLabel = role?.toLowerCase();

  return (
    <section className="overflow-hidden rounded-3xl border border-line/60 bg-surface-100/80 shadow-card">
      <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10 xl:p-12">
        <div className="max-w-3xl space-y-4 sm:space-y-6">
          <p className="text-sm font-medium uppercase tracking-wider text-primary-500">
            MAS Command Center
          </p>

          <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">
            Welcome back{userName ? `, ${userName}` : ''}.
          </h1>

          <p className="text-base text-muted sm:text-lg">
            {tenantName ? `You're managing ${tenantName}` : 'Manage your venue'}{' '}
            {roleLabel ? `as ${roleLabel}` : 'with confidence'}. Keep every operation aligned from one portal.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button size="lg" onClick={onCtaClick} className="w-full sm:w-auto">
              Launch POS workspace
            </Button>
            <span className="text-sm text-muted sm:text-base">
              {appsCount} connected app{appsCount === 1 ? '' : 's'} ready to explore
            </span>
          </div>
        </div>

        <dl className="grid w-full max-w-sm grid-cols-1 gap-4 sm:max-w-md sm:grid-cols-2">
          <div className="rounded-2xl border border-line/70 bg-surface-200/60 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Tenant</dt>
            <dd className="mt-2 text-lg font-semibold text-ink">{tenantName ?? 'Unassigned'}</dd>
          </div>

          <div className="rounded-2xl border border-line/70 bg-surface-200/60 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Role</dt>
            <dd className="mt-2 text-lg font-semibold text-ink">{role ?? 'Staff'}</dd>
          </div>

          <div className="rounded-2xl border border-line/70 bg-surface-200/60 p-4 sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Available apps</dt>
            <dd className="mt-2 flex items-baseline gap-2 text-2xl font-semibold text-primary-600">
              {appsCount}
              <span className="text-sm font-medium text-muted">curated experiences for your team</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
};
