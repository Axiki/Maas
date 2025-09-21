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
import { PageContainer } from '../layout/PageContainer';
import { PortalHero } from './PortalHero';

const MotionCard = motion(Card);

export const Portal: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const gridRef = useRef<HTMLDivElement>(null);

  const availableApps = useMemo(() => {
    if (!user) {
      return [];
    }

    return getAvailableApps(user.role);
  }, [user]);

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
    <MotionWrapper type="page" className="py-8 sm:py-10 lg:py-12">
      <PageContainer>
        <div className="space-y-10 sm:space-y-12 lg:space-y-14">
          <PortalHero
            userName={user?.name}
            tenantName={tenant?.name}
            role={user?.role}
            appsCount={availableApps.length}
            onCtaClick={() => handleAppClick('/pos')}
          />

          <div className="space-y-8 sm:space-y-10">
            <div
              ref={gridRef}
              className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4 xl:gap-8"
            >
              {availableApps.map((app) => {
                const iconKey = app.icon as keyof typeof LucideIcons;
                const IconComponent = LucideIcons[iconKey] ?? LucideIcons.Package;

                return (
                  <MotionCard
                    key={app.id}
                    whileHover={{ scale: 1.02, boxShadow: theme.elevation.modal }}
                    whileTap={{ scale: 0.98 }}
                    padding
                    className="group cursor-pointer border-line/70 shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-md"
                    onClick={() => handleAppClick(app.route)}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-lg bg-primary-100 p-3 transition-colors group-hover:bg-primary-500">
                        <IconComponent
                          size={24}
                          className="text-primary-600 transition-colors group-hover:text-white"
                        />
                      </div>

                      {app.hasNotifications && <div className="h-2 w-2 animate-pulse rounded-full bg-danger" />}

                      {app.isPWA && (
                        <div className="rounded bg-surface-200 px-2 py-1 text-xs font-medium text-muted">
                          PWA
                        </div>
                      )}
                    </div>

                    <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary-600">
                      {app.name}
                    </h3>

                    <p className="text-sm leading-relaxed text-muted">{app.description}</p>
                  </MotionCard>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-7 md:gap-7 lg:grid-cols-3 lg:gap-8">
              <Card className="h-full">
                <h3 className="mb-4 font-semibold">Today&apos;s Summary</h3>
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

              <Card className="h-full">
                <h3 className="mb-4 font-semibold">Quick Stats</h3>
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

              <Card className="h-full">
                <h3 className="mb-4 font-semibold">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-muted">Order #1234 completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    <span className="text-muted">Table 5 needs attention</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary-500" />
                    <span className="text-muted">New reservation added</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </MotionWrapper>
  );
};
