import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as LucideIcons from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { useAuthStore } from '../../stores/authStore';
import { getAvailableApps } from '../../config/apps';
import { theme } from '../../config/theme';
import { Card } from '@mas/ui';
import { useStoreHydration } from '../../hooks/useStoreHydration';
import { CardSkeleton, ListSkeleton, SkeletonBlock, TileSkeleton } from '../ui/skeletons';

const MotionCard = motion(Card);
type LucideIconComponent = (typeof LucideIcons)[keyof typeof LucideIcons];
const iconLibrary = LucideIcons as Record<string, LucideIconComponent>;

export const Portal: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const gridRef = useRef<HTMLDivElement>(null);
  const hasHydratedAuth = useStoreHydration(useAuthStore);

  const role = user?.role ?? null;
  const availableApps = useMemo(() => (role ? getAvailableApps(role) : []), [role]);
  const isLoading = !hasHydratedAuth;
  const tileSkeletons = useMemo(() => Array.from({ length: 6 }), []);

  useEffect(() => {
    if (gridRef.current && !isLoading && availableApps.length > 0) {
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
  }, [availableApps, isLoading]);

  const handleAppClick = (route: string) => {
    navigate(route);
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8" aria-busy={isLoading}>
          {isLoading ? (
            <div className="space-y-3">
              <span className="sr-only">Loading tenant overview</span>
              <SkeletonBlock className="h-9 w-1/2 max-w-sm" />
              <SkeletonBlock className="h-4 w-1/3 max-w-xs" />
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h2>
              <p className="text-muted">
                {tenant?.name} • {user?.role}
              </p>
            </>
          )}
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="sr-only">Loading available applications</span>
              {tileSkeletons.map((_, index) => (
                <TileSkeleton key={`tile-skeleton-${index}`} showBadge={index % 2 === 0} />
              ))}
            </>
          ) : (
            availableApps.map((app) => {
              const IconComponent = iconLibrary[app.icon] ?? LucideIcons.Package;

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

                    {app.hasNotifications && (
                      <div className="w-2 h-2 rounded-full bg-danger motion-safe:animate-pulse motion-reduce:animate-none" />
                    )}

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
            })
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6" aria-busy={isLoading}>
          {isLoading ? (
            <>
              <span className="sr-only">Loading operational highlights</span>
              <CardSkeleton lines={4} footerLines={0} />
              <CardSkeleton lines={4} footerLines={0} />
              <CardSkeleton lines={0} footerLines={0}>
                <ListSkeleton items={3} showStatusDot className="!space-y-3" />
              </CardSkeleton>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </MotionWrapper>
  );
};
