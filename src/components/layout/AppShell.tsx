import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@mas/ui';
import { cn } from '@mas/utils';
import { StatusIndicator } from '../ui/StatusIndicator';
import { PaperShader } from '../ui/PaperShader';
import { PageTransition } from '../ui/MotionWrapper';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { appConfigs, getAvailableApps } from '../../config/apps';
import { ThemeModeToggle } from '../ui/ThemeModeToggle';

const MotionButton = motion(Button);

type IconComponent = React.ComponentType<{ className?: string; size?: number }>;

const iconLibrary = LucideIcons as Record<string, IconComponent>;
const DefaultIcon = LucideIcons.Grid3x3 as IconComponent;

export const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const paperShader = useThemeStore((state) => state.paperShader);

  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const navId = React.useId();

  const availableApps = React.useMemo(
    () => (user ? getAvailableApps(user.role) : appConfigs),
    [user]
  );

  const normalizedPath = location.pathname === '/' ? '/portal' : location.pathname;
  const currentApp = appConfigs.find((app) => normalizedPath.startsWith(app.route));
  const isPortal = normalizedPath === '/portal';
  const CurrentIcon = currentApp ? iconLibrary[currentApp.icon] ?? DefaultIcon : null;

  React.useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!isNavOpen || typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNavOpen]);

  const shouldRenderPaper = paperShader.enabled && paperShader.surfaces.includes('background');

  return (
    <div className="min-h-screen bg-bg-dust text-ink relative">
      {shouldRenderPaper && (
        <PaperShader
          intensity={paperShader.intensity}
          animationSpeed={paperShader.animationSpeed}
          surfaces={paperShader.surfaces}
        />
      )}

      <header className="bg-surface-100/80 backdrop-blur-sm border-b border-line sticky top-0 z-40">
        <div className="px-4 py-4 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {!isPortal && (
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/portal')}
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                >
                  <ArrowLeft size={20} />
                </MotionButton>
              )}

              <div className="flex items-center gap-3">
                {currentApp && (
                  <>
                    <div className="p-2 rounded-lg bg-primary-100">
                      {CurrentIcon && (
                        <CurrentIcon size={20} className="text-primary-600" />
                      )}
                    </div>
                    <div>
                      <h1 className="font-semibold text-lg">{currentApp.name}</h1>
                      <p className="text-sm text-muted">{currentApp.description}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="sm:hidden rounded-full"
                aria-expanded={isNavOpen}
                aria-controls={navId}
                onClick={() => setIsNavOpen((prev) => !prev)}
              >
                <span className="sr-only">Toggle application navigation</span>
                {isNavOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
              <StatusIndicator />
              <ThemeModeToggle />

              {user && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted capitalize">{user.role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <nav
            id={navId}
            aria-label="Application navigation"
            className={cn(
              'sm:mt-4',
              isNavOpen ? 'mt-3' : 'hidden',
              'sm:block'
            )}
          >
            <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {availableApps.map((app) => {
                const Icon = iconLibrary[app.icon] ?? DefaultIcon;
                const isActive =
                  normalizedPath === app.route || normalizedPath.startsWith(`${app.route}/`);

                return (
                  <li key={app.id}>
                    <Link
                      to={app.route}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                        isActive
                          ? 'bg-primary-500 text-white border-primary-500 shadow-card'
                          : 'bg-surface-100/60 text-ink-70 hover:text-ink hover:bg-surface-200 border-line/60 hover:border-primary-200'
                      )}
                      onClick={() => setIsNavOpen(false)}
                    >
                      <Icon size={16} className={cn(isActive ? 'text-white' : 'text-primary-600')} />
                      <span>{app.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
};
