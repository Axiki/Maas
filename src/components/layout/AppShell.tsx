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
    <div className="min-h-screen bg-bg-dust text-ink relative">
      {shouldRenderPaper && (
        <PaperShader
          intensity={paperShader.intensity}
          animationSpeed={paperShader.animationSpeed}
          surfaces={paperShader.surfaces}
        />
      )}

      <header className="sticky top-0 z-40 border-b border-[#D6D6D6]/10 bg-[#24242E]/95 backdrop-blur-md text-[#D6D6D6]">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {!isPortal && (
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileFocus={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => navigate('/portal')}
                variant="ghost"
                size="icon"
                className="rounded-xl bg-transparent text-[#D6D6D6] transition-colors duration-[var(--transition-item-duration)] ease-[var(--transition-route-ease)] hover:bg-[#EE766D] hover:text-[#24242E] focus-visible:ring-[#EE766D]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#24242E]"
              >
                <ArrowLeft size={20} />
              </MotionButton>
            )}

            <div className="flex items-center gap-3">
              {currentApp && (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EE766D]/15 text-[#EE766D] transition-colors duration-[var(--transition-item-duration)] ease-[var(--transition-route-ease)]">
                    <Grid3x3 size={20} />
                  </div>
                  <div>
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.48em] text-[#D6D6D6]/60">
                      MAS
                    </span>
                    <h1 className="text-base font-semibold text-[#D6D6D6] sm:text-lg">
                      {currentApp.name}
                    </h1>
                    <p className="text-xs text-[#D6D6D6]/70 sm:text-sm">{currentApp.description}</p>
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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EE766D]">
                  <span className="text-sm font-medium text-[#24242E]">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-[#D6D6D6]">{user.name}</p>
                  <p className="text-xs capitalize text-[#D6D6D6]/70">{user.role}</p>
                </div>
              </div>
            )}
          </div>
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
