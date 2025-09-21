import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as LucideIcons from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { useAuthStore } from '../../stores/authStore';
import { getLauncherApps, splitLauncherApps } from '../../services/launcherService';
import { theme } from '../../config/theme';
import { Card } from '@mas/ui';

const MotionCard = motion(Card);
type LucideIconComponent = React.ComponentType<{ size?: number; className?: string }>;
const lucideIconMap = LucideIcons as Record<string, LucideIconComponent>;
const fallbackIcon = LucideIcons.Package as LucideIconComponent;

export const Portal: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const gridRef = useRef<HTMLDivElement>(null);

  const launcherApps = useMemo(() => {
    if (!user) {
      return [];
    }

    return getLauncherApps({
      role: user.role,
      permissions: user.permissions,
      favorites: user.favoriteApps,
      subscriptionTier: tenant?.subscriptionTier ?? 'core',
      includeRestricted: true
    });
  }, [
    tenant?.subscriptionTier,
    user,
    user?.favoriteApps,
    user?.permissions,
    user?.role
  ]);

  const { favorites, regular, restricted } = useMemo(
    () => splitLauncherApps(launcherApps),
    [launcherApps]
  );

  const accessibleApps = useMemo(() => [...favorites, ...regular], [favorites, regular]);

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
  }, [accessibleApps]);

  const handleAppClick = (route: string) => {
    navigate(route);
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
          {accessibleApps.map((app) => {
            const IconComponent = lucideIconMap[app.icon] ?? fallbackIcon;

            return (
              <MotionCard
                key={app.id}
                whileHover={{ scale: 1.02, boxShadow: theme.elevation.modal }}
                whileTap={{ scale: 0.98 }}
                padding
                className="cursor-pointer border-line/70 hover:border-primary-200 transition-all duration-200 group shadow-sm hover:shadow-md"
                onClick={() => handleAppClick(app.route)}
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="p-3 rounded-lg bg-primary-100 group-hover:bg-primary-500 transition-colors">
                    <IconComponent size={24} className="text-primary-600 group-hover:text-white transition-colors" />
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {app.badges.map((badge) => (
                      <span
                        key={`${app.id}-${badge.type}-${badge.label}`}
                        className="text-xs font-medium px-2 py-1 rounded bg-surface-200 text-foreground/70 border border-line/60"
                      >
                        {badge.label}
                      </span>
                    ))}
                    {app.hasNotifications && <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />}
                    {app.isFavorite && <LucideIcons.Star size={16} className="text-primary-500" />}
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">{app.name}</h3>

                <p className="text-muted text-sm leading-relaxed">{app.description}</p>
              </MotionCard>
            );
          })}
        </div>

        {restricted.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground/80">
              <LucideIcons.Lock size={16} />
              Restricted Access
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restricted.map((app) => {
                const IconComponent = lucideIconMap[app.icon] ?? fallbackIcon;

                return (
                  <Card
                    key={app.id}
                    padding
                    className="border-dashed border-line bg-surface-200/60 text-foreground/60 cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="p-3 rounded-lg bg-surface-200">
                        <IconComponent size={24} className="text-muted" />
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        {app.badges.map((badge) => (
                          <span
                            key={`${app.id}-restricted-${badge.type}-${badge.label}`}
                            className="text-xs font-medium px-2 py-1 rounded border border-dashed border-line/60 text-muted"
                          >
                            {badge.label}
                          </span>
                        ))}
                        <LucideIcons.ShieldAlert size={16} className="text-muted" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{app.name}</h3>
                    <p className="text-muted text-sm leading-relaxed">{app.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
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
