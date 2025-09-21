import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as LucideIcons from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MotionWrapper } from '../ui/MotionWrapper';
import { useAuthStore } from '../../stores/authStore';
import { getAvailableApps } from '../../config/apps';
import { theme } from '../../config/theme';
import { Button, Card } from '@mas/ui';
import { usePortalMetrics } from '../../hooks/usePortalMetrics';

const MotionCard = motion(Card);

export const Portal: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const gridRef = useRef<HTMLDivElement>(null);
  const {
    metrics,
    isLoading: isMetricsLoading,
    isRefreshing: isMetricsRefreshing,
    error: metricsError,
    lastUpdated,
    refresh: refreshMetrics,
    refreshInterval,
    setRefreshInterval,
    isOffline
  } = usePortalMetrics();

  const userRole = user?.role;
  const availableApps = useMemo(
    () => (userRole ? getAvailableApps(userRole) : []),
    [userRole]
  );

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children;

      gsap.fromTo(
        cards,
        {
          y: 24,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: theme.motion.itemStagger.duration,
          stagger: theme.motion.itemStagger.delay,
          ease: 'power2.out',
        }
      );
    }
  }, [availableApps]);

  const handleAppClick = (route: string) => {
    navigate(route);
  };

  const currencyFormatter = useMemo(() => {
    const currency = tenant?.settings?.currency ?? 'USD';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    });
  }, [tenant?.settings?.currency]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) {
      return 'Waiting for first sync';
    }

    return `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`;
  }, [lastUpdated]);

  const renderMetricValue = (value: string, emphasis?: 'warning' | 'success') => {
    if (isMetricsLoading && !metricsError && !isOffline) {
      return <span className="inline-flex h-5 w-16 animate-pulse rounded bg-surface-200" aria-hidden="true" />;
    }

    if (metricsError && !isOffline) {
      return <span className="font-medium text-muted">--</span>;
    }

    let valueClass = 'font-medium';

    if (emphasis === 'warning') {
      valueClass += ' text-warning';
    }

    if (emphasis === 'success') {
      valueClass += ' text-success';
    }

    return <span className={valueClass}>{value}</span>;
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h2>
          <p className="text-muted">
            {tenant?.name} • {user?.role}
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableApps.map((app) => {
            const iconLibrary = LucideIcons as Record<
              string,
              React.ComponentType<{ size?: number; className?: string }>
            >;
            const IconComponent = iconLibrary[app.icon] || LucideIcons.Package;

            return (
              <MotionCard
                key={app.id}
                whileHover={{ scale: 1.02, boxShadow: theme.elevation.modal }}
                whileTap={{ scale: 0.98 }}
                padding
                className="cursor-pointer border-line/70 hover:border-primary-200 transition-all duration-200 group shadow-sm hover:shadow-md"
                onClick={() => handleAppClick(app.route)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary-100 group-hover:bg-primary-500 transition-colors">
                    <IconComponent size={24} className="text-primary-600 group-hover:text-white transition-colors" />
                  </div>

                  {app.hasNotifications && <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />}

                  {app.isPWA && (
                    <div className="text-xs text-muted font-medium px-2 py-1 bg-surface-200 rounded">
                      PWA
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">{app.name}</h3>

                <p className="text-muted text-sm leading-relaxed">{app.description}</p>
              </MotionCard>
            );
          })}
        </div>

        <div className="mt-12 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">Operational Metrics</h3>
              <div className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
                <LucideIcons.Clock className="h-4 w-4" aria-hidden="true" />
                <span>{lastUpdatedLabel}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="portal-refresh-interval" className="text-sm text-muted">
                  Auto refresh
                </label>
                <select
                  id="portal-refresh-interval"
                  className="h-10 rounded-md border border-line bg-surface-100 px-3 text-sm text-ink focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  value={refreshInterval ?? 'off'}
                  onChange={(event) => {
                    const { value } = event.target;

                    if (value === 'off') {
                      setRefreshInterval(null);
                    } else {
                      const parsedValue = Number(value);
                      setRefreshInterval(Number.isNaN(parsedValue) ? null : parsedValue);
                    }
                  }}
                >
                  <option value="off">Off</option>
                  <option value={30_000}>30 seconds</option>
                  <option value={60_000}>1 minute</option>
                  <option value={300_000}>5 minutes</option>
                </select>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="justify-center"
                onClick={() => {
                  void refreshMetrics();
                }}
                disabled={isOffline || isMetricsLoading || isMetricsRefreshing}
              >
                {isMetricsLoading || isMetricsRefreshing ? (
                  <LucideIcons.Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LucideIcons.RefreshCcw className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{isMetricsLoading || isMetricsRefreshing ? 'Refreshing…' : 'Refresh now'}</span>
              </Button>
            </div>
          </div>

          {metricsError && !isOffline && (
            <div
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              {metricsError}
            </div>
          )}

          {isOffline && (
            <div
              role="status"
              className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning"
            >
              Offline mode active. Metrics will sync when connection is restored.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" aria-busy={isMetricsLoading}>
            <Card aria-live="polite">
              <h3 className="font-semibold mb-4">Today&apos;s Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">Orders</span>
                  {renderMetricValue(metrics.summary.orders.toLocaleString())}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Revenue</span>
                  {renderMetricValue(currencyFormatter.format(metrics.summary.revenue))}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Avg. Order</span>
                  {renderMetricValue(currencyFormatter.format(metrics.summary.averageOrderValue))}
                </div>
              </div>
            </Card>

            <Card aria-live="polite">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">Active Tables</span>
                  {renderMetricValue(`${metrics.quickStats.activeTables}/${metrics.quickStats.totalTables}`)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Kitchen Queue</span>
                  {renderMetricValue(
                    `${metrics.quickStats.kitchenQueue} ${metrics.quickStats.kitchenQueue === 1 ? 'ticket' : 'tickets'}`
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Low Stock Items</span>
                  {renderMetricValue(
                    metrics.quickStats.lowStockItems.toString(),
                    metrics.quickStats.lowStockItems > 0 ? 'warning' : 'success'
                  )}
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
      </div>
    </MotionWrapper>
  );
};
