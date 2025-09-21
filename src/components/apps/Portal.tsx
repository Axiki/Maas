import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as LucideIcons from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { useAuthStore } from '../../stores/authStore';
import { theme } from '../../config/theme';
import { Card } from '@mas/ui';
import {
  buildLauncherState,
  emptyLauncherState,
  LauncherApp,
  LauncherBadgeTone
} from '../../services/launcherService';
import { cn } from '../../utils/cn';

const MotionCard = motion(Card);

export const Portal: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const favoritesRef = useRef<HTMLDivElement>(null);
  const allAppsRef = useRef<HTMLDivElement>(null);
  const restrictedRef = useRef<HTMLDivElement>(null);

  const launcherState = useMemo(() => {
    if (!user) {
      return emptyLauncherState;
    }

    const tier = user.subscriptionTier ?? tenant?.subscriptionTier ?? 'core';
    const combinedFeatureFlags = new Set([
      ...(tenant?.featureFlags ?? []),
      ...(user.featureFlags ?? [])
    ]);

    return buildLauncherState({
      role: user.role,
      tier,
      permissions: user.permissions,
      favorites: user.favoriteApps,
      featureFlags: Array.from(combinedFeatureFlags)
    });
  }, [tenant, user]);

  const accessibleApps = launcherState.accessible;
  const favoriteApps = launcherState.favorites;
  const nonFavoriteAccessible = favoriteApps.length
    ? accessibleApps.filter(app => !app.isFavorite)
    : accessibleApps;
  const restrictedApps = launcherState.restricted;
  const summary = launcherState.summary;

  useEffect(() => {
    const animateGrid = (grid: HTMLDivElement | null) => {
      if (!grid) {
        return;
      }

      const cards = Array.from(grid.children);
      if (!cards.length) {
        return;
      }

      gsap.fromTo(
        cards,
        {
          y: 24,
          opacity: 0,
          scale: 0.95
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: theme.motion.itemStagger.duration,
          stagger: theme.motion.itemStagger.delay,
          ease: 'power2.out'
        }
      );
    };

    animateGrid(favoritesRef.current);
    animateGrid(allAppsRef.current);
    animateGrid(restrictedRef.current);
  }, [accessibleApps.length, favoriteApps.length, restrictedApps.length]);

  const badgeToneClasses: Record<LauncherBadgeTone, string> = {
    neutral: 'bg-surface-200 text-muted',
    info: 'bg-primary-100 text-primary-600',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger'
  };

  const renderAppCard = (app: LauncherApp) => {
    const IconComponent =
      (LucideIcons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[
        app.icon
      ] || LucideIcons.Package;

    return (
      <MotionCard
        key={app.id}
        whileHover={app.isAccessible ? { scale: 1.02, boxShadow: theme.elevation.modal } : undefined}
        whileTap={app.isAccessible ? { scale: 0.98 } : undefined}
        padding
        className={cn(
          'border-line/70 transition-all duration-200 group shadow-sm hover:shadow-md',
          app.isAccessible
            ? 'cursor-pointer hover:border-primary-200'
            : 'cursor-not-allowed opacity-75'
        )}
        onClick={() => {
          if (app.isAccessible) {
            handleAppClick(app.route);
          }
        }}
        aria-disabled={!app.isAccessible}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'p-3 rounded-lg bg-primary-100 transition-colors',
              app.isAccessible ? 'group-hover:bg-primary-500' : 'opacity-70'
            )}
          >
            <IconComponent
              size={24}
              className={cn(
                'transition-colors',
                app.isAccessible ? 'text-primary-600 group-hover:text-white' : 'text-muted'
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            {app.badge && (
              <span
                className={cn(
                  'text-xs font-medium px-2 py-1 rounded',
                  badgeToneClasses[app.badge.tone]
                )}
              >
                {app.badge.label}
              </span>
            )}

            {app.hasNotifications && <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />}

            {app.isPWA && (
              <div className="text-xs text-muted font-medium px-2 py-1 bg-surface-200 rounded">
                PWA
              </div>
            )}
          </div>
        </div>

        <h3
          className={cn(
            'font-semibold text-lg mb-2 transition-colors',
            app.isAccessible ? 'group-hover:text-primary-600' : 'text-ink-70'
          )}
        >
          {app.name}
        </h3>

        <p className="text-muted text-sm leading-relaxed">{app.description}</p>

        {!app.isAccessible && app.restrictionReasons.length > 0 && (
          <p className="text-xs text-muted mt-3">{app.restrictionReasons[0]}</p>
        )}
      </MotionCard>
    );
  };

  const handleAppClick = (route: string) => {
    navigate(route);
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h2>
            <p className="text-muted">
              {tenant?.name} • {user?.role}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted">
            <span>{summary.accessible} apps</span>
            <span aria-hidden="true">•</span>
            <span>{summary.favorites} favorites</span>
            {summary.restricted > 0 && (
              <>
                <span aria-hidden="true">•</span>
                <span>{summary.restricted} restricted</span>
              </>
            )}
          </div>
        </div>

        {favoriteApps.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Favorites</h3>
              <span className="text-sm text-muted">{favoriteApps.length}</span>
            </div>
            <div
              ref={favoritesRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {favoriteApps.map(renderAppCard)}
            </div>
          </section>
        )}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">All applications</h3>
            <span className="text-sm text-muted">{nonFavoriteAccessible.length}</span>
          </div>
          {nonFavoriteAccessible.length > 0 ? (
            <div
              ref={allAppsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {nonFavoriteAccessible.map(renderAppCard)}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-line/70 p-6 text-center text-sm text-muted">
              {favoriteApps.length
                ? 'All available apps are pinned as favorites.'
                : 'No applications available for your profile yet.'}
            </div>
          )}
        </section>

        {restrictedApps.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Restricted</h3>
              <span className="text-sm text-muted">{restrictedApps.length}</span>
            </div>
            <div
              ref={restrictedRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {restrictedApps.map(renderAppCard)}
            </div>
          </section>
        )}

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-semibold mb-4">Today&apos;s Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted">Orders</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Revenue</span>
                <span className="font-medium">$1,245.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Avg. Order</span>
                <span className="font-medium">$51.90</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted">Active Tables</span>
                <span className="font-medium">8/12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Kitchen Queue</span>
                <span className="font-medium">3 tickets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Low Stock Items</span>
                <span className="font-medium text-warning">5</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-muted">Order #1234 completed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-muted">Table 5 needs attention</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="text-muted">New reservation added</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MotionWrapper>
  );
};
