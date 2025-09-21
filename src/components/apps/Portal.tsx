import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as LucideIcons from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { PortalHero } from './portal/PortalHero';
import { useAuthStore } from '../../stores/authStore';
import { getAvailableApps } from '../../config/apps';
import { theme } from '../../config/theme';
import { Card } from '@mas/ui';

const MotionCard = motion(Card);

export const Portal: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const gridRef = useRef<HTMLDivElement>(null);

  const availableApps = user ? getAvailableApps(user.role) : [];

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

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:gap-12">
        <PortalHero userName={user?.name} tenantName={tenant?.name} userRole={user?.role} />

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Apps &amp; workflows</h2>
            <p className="text-sm text-muted">
              Jump into the tools your team uses every shift.
            </p>
          </div>

          <div ref={gridRef} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {availableApps.map((app) => {
              const IconComponent = (LucideIcons as any)[app.icon] || LucideIcons.Package;

              return (
                <MotionCard
                  key={app.id}
                  whileHover={{ scale: 1.02, boxShadow: theme.elevation.modal }}
                  whileTap={{ scale: 0.98 }}
                  padding
                  className="cursor-pointer border-line/70 transition-all duration-200 group shadow-sm hover:shadow-md hover:border-primary-200"
                  onClick={() => handleAppClick(app.route)}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-primary-100 p-3 transition-colors group-hover:bg-primary-500">
                      <IconComponent size={24} className="transition-colors text-primary-600 group-hover:text-white" />
                    </div>

                    {app.hasNotifications && <div className="h-2 w-2 rounded-full bg-danger animate-pulse" />}

                    {app.isPWA && (
                      <div className="rounded px-2 py-1 text-xs font-medium text-muted bg-surface-200">
                        PWA
                      </div>
                    )}
                  </div>

                  <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary-600">{app.name}</h3>

                  <p className="text-sm leading-relaxed text-muted">{app.description}</p>
                </MotionCard>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
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
