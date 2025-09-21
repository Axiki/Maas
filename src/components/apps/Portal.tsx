import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as LucideIcons from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="type-heading-xl mb-2">Welcome back, {user?.name}</h2>
          <p className="type-body-lg text-muted">
            {tenant?.name} • {user?.role}
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableApps.map((app) => {
            const IconComponent = (LucideIcons as any)[app.icon] || LucideIcons.Package;

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
                    <div className="type-body-sm text-muted font-medium px-2 py-1 bg-surface-200 rounded">
                      PWA
                    </div>
                  )}
                </div>

                <h3 className="type-heading-sm mb-2 group-hover:text-primary-600 transition-colors">{app.name}</h3>

                <p className="type-body-md text-muted">{app.description}</p>
              </MotionCard>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="type-heading-xs mb-4">Today&apos;s Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="type-body-lg text-muted">Orders</span>
                <span className="type-body-lg font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="type-body-lg text-muted">Revenue</span>
                <span className="type-body-lg font-medium">$1,245.50</span>
              </div>
              <div className="flex justify-between">
                <span className="type-body-lg text-muted">Avg. Order</span>
                <span className="type-body-lg font-medium">$51.90</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="type-heading-xs mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="type-body-lg text-muted">Active Tables</span>
                <span className="type-body-lg font-medium">8/12</span>
              </div>
              <div className="flex justify-between">
                <span className="type-body-lg text-muted">Kitchen Queue</span>
                <span className="type-body-lg font-medium">3 tickets</span>
              </div>
              <div className="flex justify-between">
                <span className="type-body-lg text-muted">Low Stock Items</span>
                <span className="type-body-lg font-medium text-warning">5</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="type-heading-xs mb-4">Recent Activity</h3>
            <div className="space-y-3 type-body-md">
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
