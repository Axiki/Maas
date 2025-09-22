import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Menu, X, Search, Bell, BellDot, Building2, ChevronDown, Sun, Moon } from 'lucide-react';
import { cn } from '@mas/utils';
import { StatusIndicator } from '../ui/StatusIndicator';
import { PaperShader } from '../ui/PaperShader';
import { PageTransition } from '../ui/MotionWrapper';
import { ThemeModeToggle } from '../ui/ThemeModeToggle';
import { Breadcrumbs, BreadcrumbItem } from '../ui/Breadcrumbs';
import { UserDropdown } from '../ui/UserDropdown';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { appConfigs, getAvailableApps } from '../../config/apps';
import { Footer } from './Footer';
import type { Tenant } from '../../types';

const iconLibrary = LucideIcons as unknown as Record<string, LucideIcon>;

type NotificationTone = 'success' | 'warning' | 'info' | 'alert';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  status: NotificationTone;
  route?: string;
  isUnread: boolean;
}

interface CommandPaletteEntry {
  id: string;
  label: string;
  description?: string;
  icon: string;
  onSelect: () => void;
  badge?: string;
  category?: 'app' | 'action' | 'help' | 'recent';
  shortcut?: string;
}

const fallbackTenantOptions: Tenant[] = [
  {
    id: 'mas-hq',
    name: 'MAS HQ',
    settings: {
      currency: 'USD',
      timezone: 'America/New_York',
      theme: 'auto',
      paperShader: {
        enabled: true,
        intensity: 0.45,
        animationSpeed: 1,
        surfaces: ['background', 'cards']
      }
    }
  },
  {
    id: 'mas-downtown',
    name: 'MAS Downtown',
    settings: {
      currency: 'USD',
      timezone: 'America/Chicago',
      theme: 'auto',
      paperShader: {
        enabled: true,
        intensity: 0.35,
        animationSpeed: 0.8,
        surfaces: ['background', 'cards']
      }
    }
  },
  {
    id: 'mas-airport',
    name: 'MAS Airport',
    settings: {
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      theme: 'dark',
      paperShader: {
        enabled: false,
        intensity: 0.3,
        animationSpeed: 0.6,
        surfaces: ['cards']
      }
    }
  }
];

const notificationToneStyles: Record<NotificationTone, string> = {
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-primary-200 bg-primary-100 text-primary-700',
  alert: 'border-danger/30 bg-danger/10 text-danger'
};

const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Settlement completed',
    description: 'Daily settlement for Store 12 is ready to review.',
    time: '2m ago',
    status: 'success',
    route: '/reports',
    isUnread: true
  },
  {
    id: 'notif-2',
    title: 'Offline register',
    description: 'Register 3 went offline at 09:42. Check connectivity.',
    time: '14m ago',
    status: 'alert',
    route: '/devices',
    isUnread: true
  },
  {
    id: 'notif-3',
    title: 'Purchase order pending',
    description: 'PO #104 for FreshCo vendors needs approval.',
    time: '1h ago',
    status: 'warning',
    route: '/purchasing',
    isUnread: false
  },
  {
    id: 'notif-4',
    title: 'Recipe cost updated',
    description: 'Inventory automatically recalculated Margarita mix costs.',
    time: 'Yesterday',
    status: 'info',
    route: '/inventory',
    isUnread: false
  }
];

const buildBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return [{ label: 'Portal', href: '/portal', current: true }];
  }

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const config = appConfigs.find((app) => app.route === href);
    return {
      label: config?.name ?? segment.replace(/-/g, ' '),
      href,
      current: index === segments.length - 1
    };
  });

  return [
    { label: 'Portal', href: '/portal', current: false },
    ...crumbs.map((crumb) => ({
      label: crumb.label,
      href: crumb.current ? undefined : crumb.href,
      current: crumb.current
    }))
  ];
};

export const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const paperShader = useThemeStore((state) => state.paperShader);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isTenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  // Tenant switching functionality
  const handleTenantSwitch = useCallback((newTenant: Tenant) => {
    // In a real app, this would update the auth store
    console.log('Switching to tenant:', newTenant.name);
    setTenantMenuOpen(false);
    // For now, just log the action - in real implementation would dispatch to auth store
  }, []);

  // Notification management
  const handleNotificationClick = useCallback((notification: NotificationItem) => {
    if (notification.route) {
      navigate(notification.route);
      setNotificationsOpen(false);
      // Mark as read
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, isUnread: false } : n
        )
      );
    }
  }, [navigate]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  }, []);

  const unreadCount = useMemo(() =>
    notifications.filter(n => n.isUnread).length,
    [notifications]
  );

  const navItems = useMemo(() => (user ? getAvailableApps(user.role) : appConfigs), [user]);
  const currentApp = useMemo(
    () => navItems.find((entry) => location.pathname.startsWith(entry.route)),
    [navItems, location.pathname]
  );
  const breadcrumbs = useMemo(() => buildBreadcrumbs(location.pathname), [location.pathname]);
  const shouldRenderPaper = paperShader.enabled && paperShader.surfaces.includes('background');

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Command palette functionality
  const commandPaletteEntries: CommandPaletteEntry[] = useMemo(() => [
    // Apps
    ...navItems.map((item) => ({
      id: `app-${item.id}`,
      label: item.name,
      description: item.description,
      icon: item.icon,
      category: 'app' as const,
      shortcut: item.shortcut,
      onSelect: () => navigate(item.route)
    })),
    // Quick actions
    {
      id: 'action-new-order',
      label: 'New Order',
      description: 'Create a new sales order',
      icon: 'ShoppingCart',
      category: 'action' as const,
      shortcut: 'Ctrl+N',
      onSelect: () => navigate('/pos')
    },
    {
      id: 'action-new-product',
      label: 'New Product',
      description: 'Add a new product to inventory',
      icon: 'Package',
      category: 'action' as const,
      onSelect: () => navigate('/products')
    },
    {
      id: 'action-new-customer',
      label: 'New Customer',
      description: 'Add a new customer',
      icon: 'UserPlus',
      category: 'action' as const,
      onSelect: () => navigate('/customers')
    },
    {
      id: 'action-reports',
      label: 'View Reports',
      description: 'Access sales and analytics reports',
      icon: 'BarChart3',
      category: 'action' as const,
      onSelect: () => navigate('/reports')
    },
    // Help
    {
      id: 'help-shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: 'Keyboard',
      category: 'help' as const,
      onSelect: () => {
        // Could open a help modal
        console.log('Show keyboard shortcuts');
      }
    },
    {
      id: 'help-support',
      label: 'Support',
      description: 'Get help and contact support',
      icon: 'HelpCircle',
      category: 'help' as const,
      onSelect: () => {
        // Could open support modal
        console.log('Open support');
      }
    }
  ], [navItems, navigate]);

  const filteredCommands = useMemo(() => {
    if (!commandQuery.trim()) {
      return commandPaletteEntries;
    }

    const query = commandQuery.toLowerCase();
    return commandPaletteEntries.filter((entry) =>
      entry.label.toLowerCase().includes(query) ||
      entry.description?.toLowerCase().includes(query)
    );
  }, [commandPaletteEntries, commandQuery]);

  const handleCommandSelect = useCallback((entry: CommandPaletteEntry) => {
    entry.onSelect();
    setCommandPaletteOpen(false);
    setCommandQuery('');
    setSelectedCommandIndex(0);
  }, []);

  const handleCommandKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCommandIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCommandIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedCommandIndex]) {
        handleCommandSelect(filteredCommands[selectedCommandIndex]);
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
      setCommandQuery('');
      setSelectedCommandIndex(0);
    }
  }, [filteredCommands, selectedCommandIndex, handleCommandSelect]);

  useEffect(() => {
    setSelectedCommandIndex(0);
  }, [commandQuery]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Command palette (Ctrl/Cmd + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        commandInputRef.current?.focus();
      }

      // Notifications (Ctrl/Cmd + N)
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        setNotificationsOpen(prev => !prev);
      }

      // Tenant switcher (Ctrl/Cmd + T)
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        setTenantMenuOpen(prev => !prev);
      }

      // Mobile navigation (Ctrl/Cmd + M)
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        setMobileNavOpen(prev => !prev);
      }

      // Escape to close all modals
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setNotificationsOpen(false);
        setTenantMenuOpen(false);
        setMobileNavOpen(false);
        setCommandQuery('');
        setSelectedCommandIndex(0);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isCommandPaletteOpen && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [isCommandPaletteOpen]);

  return (
    <div className="relative flex min-h-screen bg-bg-dust text-ink">
      {shouldRenderPaper && (
        <PaperShader
          intensity={paperShader.intensity}
          animationSpeed={paperShader.animationSpeed}
          surfaces={paperShader.surfaces}
        />
      )}

      <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center border-r border-line bg-surface-100/80 px-3 py-6 backdrop-blur lg:flex">
        <button
          type="button"
          aria-label="Return to portal"
          onClick={() => navigate('/portal')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-card transition-transform hover:scale-105"
        >
          <span className="text-sm font-semibold">MAS</span>
        </button>

        <nav className="mt-6 flex flex-1 flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = iconLibrary[item.icon] ?? LucideIcons.Package;
            const active = currentApp?.id === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                aria-label={item.name}
                onClick={() => navigate(item.route)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl border border-transparent text-muted transition-colors',
                  active
                    ? 'border-primary-200 bg-primary-100 text-primary-600 shadow-card'
                    : 'hover:border-line/80 hover:bg-surface-200/80 hover:text-ink'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <Icon size={22} />
              </motion.button>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-4">
          <ThemeModeToggle />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-surface-100/80 backdrop-blur">
          <div className="flex items-center justify-between gap-2 px-3 py-3 lg:px-8 lg:gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                className="flex-shrink-0 rounded-lg border border-line bg-surface-100 p-2.5 text-muted hover:bg-surface-200/70 transition-colors lg:hidden"
                aria-label="Open navigation"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu size={20} />
              </button>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="body-xs uppercase tracking-[0.18em] text-muted">MAS Suite</span>
                <span className="heading-sm text-ink truncate">{currentApp?.name ?? 'Portal'}</span>
                {currentApp?.description ? (
                  <span className="body-xs text-muted hidden max-w-sm truncate sm:block">
                    {currentApp.description}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <StatusIndicator />

              <div className="relative">
                <button
                  type="button"
                  aria-label="Open command palette"
                  className="btn-icon"
                  onClick={() => setCommandPaletteOpen(true)}
                >
                  <Search size={18} />
                </button>
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-label={`Open notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                  className="btn-icon"
                  onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                >
                  {unreadCount > 0 ? <BellDot size={18} /> : <Bell size={18} />}
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-xs font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>

              <div className="hidden h-7 border-l border-line/80 lg:block" />

              <div className="relative">
                <button
                  type="button"
                  aria-label="Switch tenant"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-surface-200/70"
                  onClick={() => setTenantMenuOpen(!isTenantMenuOpen)}
                >
                  <Building2 size={18} className="text-muted shrink-0" />
                  <div className="hidden md:block">
                    <p className="body-sm font-semibold text-ink">{tenant?.name ?? 'MAS HQ'}</p>
                    <p className="body-xs text-muted">Production</p>
                  </div>
                  <ChevronDown size={14} className="text-muted hidden md:block" />
                </button>
              </div>

              {user ? (
                <div className="relative">
                  <button
                    ref={userButtonRef}
                    type="button"
                    aria-label="Open user menu"
                    className="flex items-center gap-2 rounded-full border border-line/70 bg-surface-100/90 px-2 py-1 transition-colors hover:bg-surface-200/70"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="hidden text-left sm:block">
                      <p className="body-sm font-semibold text-ink">{user.name}</p>
                      <p className="body-xs text-muted capitalize">{user.role}</p>
                    </div>
                    <ChevronDown size={14} className="text-muted hidden sm:block" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="px-4 pb-3 lg:px-8">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </header>

        <main className="flex-1 px-3 pb-12 pt-6 lg:px-8 overflow-x-hidden">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        <Footer />
      </div>

      <AnimatePresence>
        {isMobileNavOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
          >
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-surface-100/95 px-6 pb-10 pt-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="heading-xs text-ink">Applications</p>
                <button
                  type="button"
                  className="rounded-full border border-line p-2 text-muted"
                  aria-label="Close navigation"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {navItems.map((item) => {
                  const Icon = iconLibrary[item.icon] ?? LucideIcons.Package;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="flex items-center gap-3 rounded-2xl border border-line/70 bg-surface-100 px-4 py-4 text-left text-sm font-medium transition-colors hover:border-primary-200 hover:text-primary-600 min-h-[60px]"
                      onClick={() => navigate(item.route)}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                        <Icon size={20} />
                      </span>
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isCommandPaletteOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 pt-[15vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-xl rounded-2xl border border-line bg-surface-100/95 shadow-2xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-line p-4">
                <Search size={18} className="text-muted" />
                <input
                  ref={commandInputRef}
                  type="text"
                  placeholder="Search for apps, actions, or help..."
                  className="w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-lg border border-line px-2 py-1 text-xs font-semibold text-muted"
                  onClick={() => setCommandPaletteOpen(false)}
                >
                  ESC
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted">
                    <Search size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No results found for "{commandQuery}"</p>
                    <p className="text-xs mt-1">Try searching for apps, actions, or help</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCommands.map((entry, index) => {
                      const Icon = iconLibrary[entry.icon] ?? LucideIcons.Package;
                      const isSelected = index === selectedCommandIndex;

                      return (
                        <button
                          key={entry.id}
                          type="button"
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                            isSelected
                              ? 'bg-primary-100 text-primary-700'
                              : 'hover:bg-surface-200/70'
                          )}
                          onClick={() => handleCommandSelect(entry)}
                        >
                          <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            isSelected ? 'bg-primary-200' : 'bg-surface-200'
                          )}>
                            <Icon size={18} className={isSelected ? 'text-primary-600' : 'text-muted'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'font-medium truncate',
                              isSelected ? 'text-primary-700' : 'text-ink'
                            )}>
                              {entry.label}
                            </p>
                            {entry.description && (
                              <p className={cn(
                                'text-sm truncate',
                                isSelected ? 'text-primary-600' : 'text-muted'
                              )}>
                                {entry.description}
                              </p>
                            )}
                          </div>
                          {entry.shortcut && (
                            <div className="flex items-center gap-1">
                              <kbd className="rounded border border-line bg-surface-100 px-1.5 py-0.5 text-xs font-mono">
                                {entry.shortcut}
                              </kbd>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isNotificationsOpen ? (
          <motion.div
            className="fixed right-4 top-20 z-50 w-full max-w-sm rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          >
            <div className="border-b border-line p-4">
              <h3 className="heading-xs">Notifications</h3>
              <p className="body-sm text-muted">You have {notifications.filter(n => n.isUnread).length} unread messages.</p>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface-200/70',
                    item.isUnread ? '' : 'opacity-60'
                  )}
                  onClick={() => handleNotificationClick(item)}
                  aria-label={`View notification: ${item.title}`}
                >
                  <div className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', item.isUnread ? 'bg-primary-500' : 'bg-muted/40')} />
                  <div className="flex-1 min-w-0">
                    <p className="body-sm font-semibold text-ink truncate">{item.title}</p>
                    <p className="body-xs text-muted truncate">{item.description}</p>
                  </div>
                  <p className="body-xs shrink-0 text-muted/80">{item.time}</p>
                </button>
              ))}
            </div>
            <div className="border-t border-line p-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn-subtle w-full mb-2"
                  onClick={handleMarkAllRead}
                  aria-label="Mark all notifications as read"
                >
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                className="btn-subtle w-full"
                onClick={() => {
                  navigate('/notifications');
                  setNotificationsOpen(false);
                }}
                aria-label="View all notifications"
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isTenantMenuOpen ? (
          <motion.div
            className="fixed right-4 top-20 z-50 w-full max-w-xs rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          >
            <div className="border-b border-line p-4">
              <h3 className="heading-xs">Switch Tenant</h3>
              <p className="body-sm text-muted">Select a location to manage.</p>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {fallbackTenantOptions.map((item) => (
                <button
                  key={item.id}
                  type='button'
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface-200/70',
                    tenant?.id === item.id ? 'font-semibold text-primary-600' : ''
                  )}
                  onClick={() => handleTenantSwitch(item)}
                  aria-label={`Switch to ${item.name} tenant`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-200">
                    <Building2 size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="body-sm text-ink">{item.name}</p>
                    <p className="body-xs text-muted">{item.id}</p>
                  </div>
                  {tenant?.id === item.id && <LucideIcons.Check size={18} className='text-primary-500'/>}
                </button>
              ))}
            </div>
            <div className="border-t border-line p-2">
              <button
                type='button'
                className='btn-subtle w-full'
                onClick={() => {
                  navigate('/backoffice');
                  setTenantMenuOpen(false);
                }}
                aria-label="Manage tenants and settings"
              >
                Manage tenants
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* User Dropdown */}
      <UserDropdown
        isOpen={isUserDropdownOpen}
        onClose={() => setIsUserDropdownOpen(false)}
        triggerRef={userButtonRef}
      />
    </div>
  );
};
