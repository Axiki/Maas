import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { useAuthStore } from '../../stores/authStore';
import { getAvailableApps } from '../../config/apps';
import { theme } from '../../config/theme';
import { Card } from '@mas/ui';

const MotionCard = motion(Card);
const transitionEase = `cubic-bezier(${theme.motion.routeTransition.ease.join(',')})`;
const parsedTransitionEase = gsap.parseEase(transitionEase);
const hoverTransition = {
  duration: theme.motion.pressScale.duration,
  ease: theme.motion.routeTransition.ease,
};
const pressScale = theme.motion.pressScale.scale;
const tapScale = 1 - (pressScale - 1);

export const Portal: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const gridRef = useRef<HTMLDivElement>(null);

  const availableApps = useMemo(
    () => (user ? getAvailableApps(user.role) : []),
    [user]
  );

  useEffect(() => {
    if (!gridRef.current || typeof window === 'undefined') {
      return;
    }

    const cards = gridRef.current.children;
    if (!cards.length) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animateCards = () => {
      if (!cards.length) {
        return undefined;
      }

      if (mediaQuery.matches) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return undefined;
      }

      return gsap.fromTo(
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
          ease: parsedTransitionEase,
        }
      );
    };

    let animation = animateCards();

    const handlePreferenceChange = () => {
      if (animation) {
        animation.kill();
        animation = undefined;
      }

      animation = animateCards();
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handlePreferenceChange);
    } else {
      mediaQuery.addListener(handlePreferenceChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handlePreferenceChange);
      } else {
        mediaQuery.removeListener(handlePreferenceChange);
      }

      if (animation) {
        animation.kill();
      }
    };
  }, [availableApps]);

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
          {availableApps.map((app) => {
            const iconKey = (app.icon in LucideIcons ? app.icon : 'Package') as keyof typeof LucideIcons;
            const IconComponent = LucideIcons[iconKey] as React.ComponentType<LucideProps>;

            return (
              <MotionCard
                key={app.id}
                whileHover={{ scale: pressScale, boxShadow: theme.elevation.modal }}
                whileTap={{ scale: tapScale }}
                transition={hoverTransition}
                padding
                className="cursor-pointer border-line/70 hover:border-primary-200 transition-all duration-[var(--transition-item-duration)] ease-[var(--transition-route-ease)] group shadow-sm hover:shadow-md"
                onClick={() => handleAppClick(app.route)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary-100 group-hover:bg-primary-500 transition-colors duration-[var(--transition-item-duration)] ease-[var(--transition-route-ease)]">
                    <IconComponent
                      size={24}
                      className="text-primary-600 group-hover:text-white transition-colors duration-[var(--transition-item-duration)] ease-[var(--transition-route-ease)]"
                    />
                  </div>

                  {app.hasNotifications && <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />}

                  {app.isPWA && (
                    <div className="text-xs text-muted font-medium px-2 py-1 bg-surface-200 rounded">
                      PWA
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors duration-[var(--transition-item-duration)] ease-[var(--transition-route-ease)]">{app.name}</h3>

                <p className="text-muted text-sm leading-relaxed">{app.description}</p>
              </MotionCard>
            );
          })}
        </div>

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
