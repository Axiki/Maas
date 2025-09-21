import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const tenant = useAuthStore((state) => state.tenant);
  const resolvedMode = useThemeStore((state) => state.resolvedMode);
  const paperShader = useThemeStore((state) => state.paperShader);
  const setSystemMode = useThemeStore((state) => state.setSystemMode);
  const applyTenantSettings = useThemeStore((state) => state.applyTenantSettings);
  const lastTenantSettings = useRef<string | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? 'dark' : 'light');
    };

    setSystemMode(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [setSystemMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedMode;
  }, [resolvedMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (paperShader.surfaces.includes('cards') && paperShader.enabled) {
      root.dataset.paperCards = 'true';
    } else {
      delete root.dataset.paperCards;
    }

    root.style.setProperty('--paper-card-opacity', (paperShader.intensity * 0.35).toFixed(3));
  }, [paperShader]);

  useEffect(() => {
    if (!tenant?.settings) {
      return;
    }

    const serialized = JSON.stringify(tenant.settings);
    if (serialized === lastTenantSettings.current) {
      return;
    }

    lastTenantSettings.current = serialized;
    applyTenantSettings(tenant.settings);
  }, [tenant?.settings, applyTenantSettings]);

  return <>{children}</>;
};
