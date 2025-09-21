import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Grid3x3 } from 'lucide-react';
import { Button } from '@mas/ui';
import { StatusIndicator } from '../ui/StatusIndicator';
import { PaperShader } from '../ui/PaperShader';
import { PageTransition } from '../ui/MotionWrapper';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { appConfigs } from '../../config/apps';
import { ThemeModeToggle } from '../ui/ThemeModeToggle';
import { Footer } from './Footer';

const MotionButton = motion(Button);

export const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const paperShader = useThemeStore((state) => state.paperShader);

  const currentApp = appConfigs.find((app) => location.pathname.startsWith(app.route));
  const isPortal = location.pathname === '/portal' || location.pathname === '/';

  const shouldRenderPaper = paperShader.enabled && paperShader.surfaces.includes('background');

  return (
    <div className="relative flex min-h-screen flex-col bg-bg-dust text-ink">
      {shouldRenderPaper && (
        <PaperShader
          intensity={paperShader.intensity}
          animationSpeed={paperShader.animationSpeed}
          surfaces={paperShader.surfaces}
        />
      )}

      <header className="sticky top-0 z-40 border-b border-line bg-surface-100/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4">
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
                  <div className="rounded-lg bg-primary-100 p-2">
                    <Grid3x3 size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">{currentApp.name}</h1>
                    <p className="text-sm text-muted">{currentApp.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <StatusIndicator />
            <ThemeModeToggle />

            {user && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs capitalize text-muted">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
};
