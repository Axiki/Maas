import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sparkles, ArrowUpRight, ClipboardList, ShoppingBag, Users2, Package2, TrendingUp, Users, DollarSign, Clock, Target, Zap } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { PricingCalculator } from '../ui/PricingCalculator';
import { BrandMessaging } from '../ui/BrandMessaging';
import { TipReporting } from '../ui/TipReporting';
import { SystemStatus } from '../ui/SystemStatus';
import { useAuthStore } from '../../stores/authStore';
import { getAvailableApps } from '../../config/apps';
import { theme } from '../../config/theme';
import { Card, Button } from '@mas/ui';

const MotionCard = motion.create(Card);
const MotionQuickButton = motion.create('button');
const MotionAlert = motion.create('li');
const lucideIconLibrary = LucideIcons as unknown as Record<string, LucideIcon>;

export const Portal: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);

  const quickActions = useMemo(
    () => [
      {
        id: 'open-orders',
        label: 'Open POS Order',
        description: 'Jump into the POS and start capturing a ticket',
        icon: ShoppingBag,
        route: '/pos'
      },
      {
        id: 'schedule-count',
        label: 'Schedule Stock Count',
        description: 'Assign a cycle count to the inventory team',
        icon: ClipboardList,
        route: '/inventory'
      },
      {
        id: 'invite-user',
        label: 'Invite Teammate',
        description: 'Onboard staff with appropriate permissions',
        icon: Users2,
        route: '/backoffice'
      },
      {
        id: 'catalog-import',
        label: 'Import Catalog',
        description: 'Run the guided CSV import for new items',
        icon: Package2,
        route: '/imports'
      }
    ],
    []
  );

  const availableApps = useMemo(
    () => (user ? getAvailableApps(user.role) : []),
    [user]
  );

  // Usage metrics carousel data
  const usageMetrics = useMemo(
    () => [
      {
        id: 'peak-hours',
        title: 'Peak Hours Performance',
        value: '94%',
        description: 'Average efficiency during lunch rush',
        trend: 'up',
        color: 'success'
      },
      {
        id: 'staff-productivity',
        title: 'Staff Productivity',
        value: '87%',
        description: 'Orders processed per hour',
        trend: 'up',
        color: 'primary'
      },
      {
        id: 'customer-satisfaction',
        title: 'Customer Satisfaction',
        value: '4.8/5',
        description: 'Average rating this month',
        trend: 'up',
        color: 'success'
      },
      {
        id: 'inventory-turnover',
        title: 'Inventory Turnover',
        value: '2.3x',
        description: 'Stock turns per month',
        trend: 'down',
        color: 'warning'
      }
    ],
    []
  );

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children;

      gsap.fromTo(
        cards,
        { y: 24, opacity: 0, scale: 0.95 },
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

  // Carousel rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetricIndex((prevIndex) => (prevIndex + 1) % usageMetrics.length);
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [usageMetrics.length]);

  const handleAppClick = (route: string) => {
    navigate(route);
  };

  // Usage analytics pills data
  const usageAnalytics = useMemo(
    () => [
      {
        id: 'revenue',
        label: 'Revenue',
        value: '$18,420',
        change: '+12%',
        trend: 'up',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        id: 'orders',
        label: 'Orders',
        value: '248',
        change: '+8%',
        trend: 'up',
        icon: ShoppingBag,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      {
        id: 'customers',
        label: 'Customers',
        value: '156',
        change: '+15%',
        trend: 'up',
        icon: Users,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      {
        id: 'efficiency',
        label: 'Efficiency',
        value: '94%',
        change: '+2%',
        trend: 'up',
        icon: Target,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    ],
    []
  );



  // Animated counter component
  const AnimatedCounter: React.FC<{ value: string; duration?: number }> = ({ value, duration = 1 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

        // Extract number from value string
        const numericValue = parseInt(value.replace(/[^\d]/g, ''));
        const currentCount = Math.floor(progress * numericValue);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(numericValue);
        }
      };

      requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{count.toLocaleString()}</span>;
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          <Card className="relative overflow-hidden border border-line bg-surface-100/90 px-7 pb-9 pt-8 shadow-card sm:px-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-200/50 blur-3xl" />
            <div className="relative flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-card">
                  <Sparkles size={22} />
                </div>
                <div className="text-left">
                  <p className="body-xs uppercase tracking-[0.24em] text-muted">MAS Portal</p>
                  <p className="body-sm text-muted">{tenant?.name ?? 'Hospitality Operations'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="heading-lg text-balance">Command every venue from a single control room.</h2>
                <p className="body-md text-muted max-w-xl">
                  Launch applications, monitor performance, and act on insights without losing momentum. Everything stays in sync across teams.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Button size="lg" onClick={() => handleAppClick('/pos')} className="w-full sm:w-auto">
                  Enter POS
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleAppClick('/reports')}
                  className="w-full sm:w-auto"
                >
                  View reports
                  <ArrowUpRight size={18} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Usage Analytics Pills - Strict Vertical Layout */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
            {usageAnalytics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.id}
                  className="rounded-xl border border-line/70 bg-surface-100/90 p-6 transition-all duration-200 hover:border-primary-200 hover:bg-surface-100 min-h-[200px]"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.4,
                    ease: 'easeOut'
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex flex-col h-full items-center text-center gap-4">
                    {/* 1. Title - Top, small text, neutral color */}
                    <h3 className="text-sm font-medium text-gray-600">
                      {metric.label}
                    </h3>

                    {/* 2. Icon - Centered below title, in rounded background */}
                    <div className={`rounded-xl p-3 flex-shrink-0 ${metric.bgColor}`}>
                      <Icon size={24} className={metric.color} />
                    </div>

                    {/* 3. Main Number Total - Vertical Display */}
                    <div className="flex flex-col items-center gap-1 min-h-[3rem] justify-center">
                      {metric.id === 'revenue' && (
                        <span className="text-lg font-bold text-gray-900">$</span>
                      )}
                      <div className="flex flex-col items-center leading-none">
                        <AnimatedCounter value={metric.value} duration={1.5} />
                      </div>
                      {metric.id === 'efficiency' && (
                        <span className="text-lg font-bold text-gray-900">%</span>
                      )}
                    </div>

                    {/* 4. % Change - Bottom, small text, color-coded */}
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className={metric.color} />
                      <p className={`text-xs font-medium ${metric.color}`}>
                        {metric.change}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-4">
            <Card className="h-full space-y-4">
              <div className="flex items-center justify-between">
                <p className="body-sm font-medium text-ink">Today&apos;s pulse</p>
                <span className="body-xs text-muted">Last sync 2m ago</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-line bg-surface-100/80 p-4">
                  <p className="body-xs text-muted">Revenue</p>
                  <p className="heading-sm mt-2">$12.4K</p>
                  <p className="body-xs text-success mt-2">+12% vs yesterday</p>
                </div>
                <div className="rounded-lg border border-line bg-surface-100/80 p-4">
                  <p className="body-xs text-muted">Active staff</p>
                  <p className="heading-sm mt-2">18</p>
                  <p className="body-xs text-muted mt-2">3 on break</p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100">
                  <Sparkles size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="body-sm font-medium text-ink">Your next best action</p>
                  <p className="body-xs text-muted">Kitchen queue is peaking in 12 minutes</p>
                </div>
              </div>
              <Button variant="primary" size="md" onClick={() => handleAppClick('/kds')} className="w-full">
                Jump to Kitchen Display
              </Button>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="heading-sm text-ink">Applications</h3>
              <p className="body-sm text-muted">Choose the workspace you need right now.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleAppClick('/backoffice')} className="self-start sm:self-auto">
              Manage access
            </Button>
          </div>

          <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {availableApps.map((app) => {
              const IconComponent = lucideIconLibrary[app.icon] ?? LucideIcons.Package;

              return (
                <MotionCard
                  key={app.id}
                  whileHover={{ scale: 1.02, boxShadow: theme.elevation.modal }}
                  whileTap={{ scale: 0.98 }}
                  padding
                  className="group cursor-pointer border-line/70 bg-surface-100/90 transition-all duration-200 hover:border-primary-200 hover:bg-surface-100"
                  onClick={() => handleAppClick(app.route)}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-primary-100 p-3 transition-colors group-hover:bg-primary-500">
                      <IconComponent size={24} className="text-primary-600 transition-colors group-hover:text-white" />
                    </div>

                    <div className="flex items-center gap-2">
                      {app.hasNotifications && <div className="h-2.5 w-2.5 rounded-full bg-danger animate-pulse" />}

                      {app.isPWA && <span className="body-xs rounded border border-line px-2 py-1 text-muted">PWA</span>}
                    </div>
                  </div>

                  <h3 className="heading-xs mb-1 text-ink transition-colors group-hover:text-primary-600">
                    {app.name}
                  </h3>
                  <p className="body-sm text-muted">{app.description}</p>
                </MotionCard>
              );
            })}
          </div>
        </section>

        {/* Shortcut Tiles Section */}
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="heading-sm text-ink">My Day</h3>
              <p className="body-sm text-muted">Quick actions to start your most common workflows.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-line/70 bg-gradient-to-br from-primary-50 to-primary-100/50 p-6 transition-all duration-300 hover:border-primary-200 hover:shadow-lg"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAppClick('/pos')}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h4 className="heading-sm text-ink">Create Order</h4>
                    <p className="body-sm text-muted">Start a new POS order or resume an existing one</p>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-primary-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <div className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-primary-200/30 blur-2xl" />
            </motion.div>

            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-line/70 bg-gradient-to-br from-success/5 to-success/10 p-6 transition-all duration-300 hover:border-success/30 hover:shadow-lg"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAppClick('/inventory')}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success text-white shadow-lg">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h4 className="heading-sm text-ink">Schedule Count</h4>
                    <p className="body-sm text-muted">Plan inventory cycle counts for today or this week</p>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-success/60 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <div className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-success/20 blur-2xl" />
            </motion.div>

            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-line/70 bg-gradient-to-br from-warning/5 to-warning/10 p-6 transition-all duration-300 hover:border-warning/30 hover:shadow-lg"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAppClick('/purchasing')}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning text-white shadow-lg">
                    <Package2 size={24} />
                  </div>
                  <div>
                    <h4 className="heading-sm text-ink">Schedule PO</h4>
                    <p className="body-sm text-muted">Create purchase orders for low-stock items</p>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-warning/60 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <div className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-warning/20 blur-2xl" />
            </motion.div>
          </div>
        </section>

        {/* Usage Metrics Carousel */}
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="heading-sm text-ink">Performance Insights</h3>
              <p className="body-sm text-muted">Key metrics rotating every few seconds.</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-line/70 bg-surface-100/90 p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-h-[160px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMetricIndex}
                    className="absolute inset-0 flex items-center gap-6"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    exit={{
                      opacity: 0,
                      x: -50
                    }}
                    transition={{
                      duration: 0.5,
                      ease: 'easeInOut'
                    }}
                  >
                    {(() => {
                      const metric = usageMetrics[currentMetricIndex];
                      return (
                        <>
                          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl flex-shrink-0 ${
                            metric.color === 'success' ? 'bg-success/10' :
                            metric.color === 'warning' ? 'bg-warning/10' :
                            'bg-primary-100'
                          }`}>
                            <Target size={32} className={
                              metric.color === 'success' ? 'text-success' :
                              metric.color === 'warning' ? 'text-warning' :
                              'text-primary-600'
                            } />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="heading-sm text-ink mb-2 font-semibold">{metric.title}</h4>
                            <p className="body-sm text-muted mb-3 line-clamp-2">{metric.description}</p>
                            <div className="flex items-center gap-4">
                              <span className="heading-lg text-ink font-bold">{metric.value}</span>
                              <div className={`flex items-center gap-2 ${
                                metric.trend === 'up' ? 'text-success' : 'text-warning'
                              }`}>
                                <TrendingUp size={16} />
                                <span className="body-sm font-medium">
                                  {metric.trend === 'up' ? 'Improving' : 'Needs attention'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                {usageMetrics.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 w-10 rounded-full ${
                      index === currentMetricIndex ? 'bg-primary-500' : 'bg-line'
                    }`}
                    animate={{
                      backgroundColor: index === currentMetricIndex ? '#E44343' : '#D9D7D3'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Guided Onboarding Banner */}
        <section className="space-y-6">
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-primary-200/50 bg-gradient-to-r from-primary-50 to-primary-100/30 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="heading-sm text-ink mb-1">Welcome to MAS Portal!</h4>
                  <p className="body-sm text-muted">Get started with these quick tips to maximize your productivity.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  Skip
                </Button>
                <Button size="sm" onClick={() => handleAppClick('/backoffice')}>
                  Get Started
                </Button>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rounded-full bg-primary-200/20 blur-2xl" />
          </motion.div>
        </section>

        {/* Curated Personas Entry Points */}
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="heading-sm text-ink">Quick Access by Role</h3>
              <p className="body-sm text-muted">Tailored shortcuts based on your permissions.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              className="group rounded-xl border border-line/70 bg-surface-100/90 p-4 transition-all duration-200 hover:border-primary-200 hover:bg-surface-100"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                  <ShoppingBag size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="body-xs font-medium text-ink">For Servers</p>
                  <p className="body-xs text-muted">POS & Orders</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAppClick('/pos')}
                className="w-full justify-start text-left"
              >
                Open POS Terminal
              </Button>
            </motion.div>

            <motion.div
              className="group rounded-xl border border-line/70 bg-surface-100/90 p-4 transition-all duration-200 hover:border-success/40 hover:bg-surface-100"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                  <ClipboardList size={16} className="text-success" />
                </div>
                <div>
                  <p className="body-xs font-medium text-ink">For Managers</p>
                  <p className="body-xs text-muted">Inventory & Reports</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAppClick('/inventory')}
                className="w-full justify-start text-left"
              >
                View Stock Levels
              </Button>
            </motion.div>

            <motion.div
              className="group rounded-xl border border-line/70 bg-surface-100/90 p-4 transition-all duration-200 hover:border-warning/40 hover:bg-surface-100"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                  <Package2 size={16} className="text-warning" />
                </div>
                <div>
                  <p className="body-xs font-medium text-ink">For Purchasers</p>
                  <p className="body-xs text-muted">Suppliers & POs</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAppClick('/purchasing')}
                className="w-full justify-start text-left"
              >
                Manage Orders
              </Button>
            </motion.div>

            <motion.div
              className="group rounded-xl border border-line/70 bg-surface-100/90 p-4 transition-all duration-200 hover:border-danger/40 hover:bg-surface-100"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10">
                  <Users2 size={16} className="text-danger" />
                </div>
                <div>
                  <p className="body-xs font-medium text-ink">For Admins</p>
                  <p className="body-xs text-muted">Users & Settings</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAppClick('/backoffice')}
                className="w-full justify-start text-left"
              >
                Admin Panel
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="space-y-5 p-5">
            <h3 className="heading-xs text-ink font-semibold">Today's Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Orders</span>
                <span className="body-sm font-medium text-ink">248</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Revenue</span>
                <span className="body-sm font-medium text-ink">$18,420</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Avg. Ticket</span>
                <span className="body-sm font-medium text-ink">$74.27</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-5 p-5">
            <h3 className="heading-xs text-ink font-semibold">Operational Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Kitchen queue</span>
                <span className="body-sm font-medium text-warning">8 tickets</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Low stock</span>
                <span className="body-sm font-medium text-danger">5 items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Open approvals</span>
                <span className="body-sm font-medium text-ink">3</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-5 p-5 sm:col-span-2 xl:col-span-1">
            <h3 className="heading-xs text-ink font-semibold">Recent Activity</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 rounded-lg border border-line/60 bg-surface-100 p-4">
                <div className="h-2 w-2 rounded-full bg-success flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="body-sm text-ink">POS order ORD-2045 synced</p>
                  <p className="body-xs text-muted">2 minutes ago</p>
                </div>
              </li>
              <li className="flex items-center gap-4 rounded-lg border border-line/60 bg-surface-100 p-4">
                <div className="h-2 w-2 rounded-full bg-warning flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="body-sm text-ink">Purchase order PO-4513 partially received</p>
                  <p className="body-xs text-muted">12 minutes ago</p>
                </div>
              </li>
              <li className="flex items-center gap-4 rounded-lg border border-line/60 bg-surface-100 p-4">
                <div className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="body-sm text-ink">Reservation added for Harper Family</p>
                  <p className="body-xs text-muted">30 minutes ago</p>
                </div>
              </li>
            </ul>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="heading-xs text-ink">Quick actions</h3>
                <p className="body-sm text-muted">Top workflows your teams trigger most.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <MotionQuickButton
                    key={action.id}
                    type="button"
                    onClick={() => handleAppClick(action.route)}
                    className="group flex h-full flex-col items-start gap-2 rounded-2xl border border-line/70 bg-surface-100 px-4 py-4 text-left"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-500 group-hover:text-white">
                      <Icon size={18} />
                    </span>
                    <span className="heading-xs text-ink transition-colors group-hover:text-primary-600">{action.label}</span>
                    <span className="body-xs text-muted">{action.description}</span>
                  </MotionQuickButton>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="heading-xs text-ink">Alerts & approvals</h3>
                <p className="body-sm text-muted">Stay ahead of the items that need your attention.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleAppClick('/backoffice')}>
                View all
              </Button>
            </div>

            <ul className="space-y-3">
              <MotionAlert
                className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                layout
              >
                <p className="body-sm font-medium text-warning">PO approval needed</p>
                <p className="body-xs text-warning/90">PO-4514 waiting for finance sign-off</p>
              </MotionAlert>
              <MotionAlert
                className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                layout
                transition={{ delay: 0.05 }}
              >
                <p className="body-sm font-medium text-danger">Device attention</p>
                <p className="body-xs text-danger/90">Bar receipt printer reporting paper low</p>
              </MotionAlert>
              <MotionAlert
                className="rounded-xl border border-success/40 bg-success/10 px-4 py-3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                layout
                transition={{ delay: 0.1 }}
              >
                <p className="body-sm font-medium text-success">Loyalty campaign ready</p>
                <p className="body-xs text-success/90">“Harvest Brunch” promotion passes QA checks</p>
              </MotionAlert>
            </ul>
          </Card>
        </section>

        {/* Tip Reporting Section */}
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="heading-sm text-ink">Staff Management & Tips</h3>
              <p className="body-sm text-muted">Track tips, calculate payouts, and manage staff compensation</p>
            </div>
          </div>

          <TipReporting
            showPayoutCalculator={true}
            showAnalytics={true}
            showExport={true}
          />
        </section>

        {/* Brand Messaging Section */}
        <section className="space-y-6">
          <BrandMessaging
            variant="section"
            showTestimonials={true}
            showStats={true}
            showCta={true}
          />
        </section>

        {/* System Status Section */}
        <section className="space-y-6">
          <SystemStatus
            showRealTimeMetrics={true}
            showSecurityCerts={true}
            showApiDocs={true}
            showSupportInfo={true}
          />
        </section>

        {/* Pricing Calculator Section */}
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="heading-sm text-ink">Transparent Pricing</h3>
              <p className="body-sm text-muted">Choose the plan that fits your business needs</p>
            </div>
          </div>

          <PricingCalculator
            onSelectPlan={(plan) => {
              console.log('Selected plan:', plan);
              // In a real app, this would navigate to signup or show more details
            }}
            showCalculator={true}
          />
        </section>
      </div>
    </MotionWrapper>
  );
};
