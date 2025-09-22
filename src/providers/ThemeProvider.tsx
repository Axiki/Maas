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

    if (import.meta.env.DEV) {
      const readRGB = (token: string) => {
        const value = getComputedStyle(root).getPropertyValue(token).trim();
        if (!value) return null;
        const parts = value.split(',').map((part) => Number(part.trim()));
        if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
        return parts as [number, number, number];
      };

      const luminance = ([r, g, b]: [number, number, number]) => {
        const toLinear = (channel: number) => {
          const c = channel / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
        return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
      };

      const contrastRatio = (a: [number, number, number], b: [number, number, number]) => {
        const lumA = luminance(a);
        const lumB = luminance(b);
        const bright = Math.max(lumA, lumB);
        const dark = Math.min(lumA, lumB);
        return (bright + 0.05) / (dark + 0.05);
      };

      const pairs: Array<[string, string, string]> = [
        ['--color-primary-500', '--color-surface-100', 'Primary on Surface'],
        ['--color-ink', '--color-bg-dust', 'Body on Background'],
        ['--color-success', '--color-surface-100', 'Success on Surface'],
        ['--color-warning', '--color-surface-100', 'Warning on Surface']
      ];

      pairs.forEach(([fgToken, bgToken, label]) => {
        const fg = readRGB(fgToken);
        const bg = readRGB(bgToken);
        if (!fg || !bg) return;
        const ratio = contrastRatio(fg, bg);
        if (ratio < 4.5) {
          console.warn(`[contrast] ${label} ratio ${ratio.toFixed(2)} is below WCAG AA (4.5). Consider adjusting tokens.`);
        }
      });
    }
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
