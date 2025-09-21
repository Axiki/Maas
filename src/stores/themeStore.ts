import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TenantSettings } from '../types';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface PaperShaderState {
  enabled: boolean;
  intensity: number;
  animationSpeed: number;
  surfaces: Array<'background' | 'cards'>;
}

interface ThemeState {
  mode: ThemeMode;
  systemMode: 'light' | 'dark';
  resolvedMode: 'light' | 'dark';
  paperShader: PaperShaderState;
  setMode: (mode: ThemeMode) => void;
  setSystemMode: (mode: 'light' | 'dark') => void;
  updatePaperShader: (settings: Partial<PaperShaderState>) => void;
  applyTenantSettings: (settings?: TenantSettings) => void;
}

const defaultPaperShader: PaperShaderState = {
  enabled: true,
  intensity: 0.5,
  animationSpeed: 1,
  surfaces: ['background', 'cards'],
};

const detectSystemMode = (fallback: 'light' | 'dark' = 'light'): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return fallback;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'auto',
      systemMode: 'light',
      resolvedMode: 'light',
      paperShader: defaultPaperShader,

      setMode: (mode) => {
        set((state) => ({
          mode,
          resolvedMode: mode === 'auto' ? state.systemMode : mode,
        }));
      },

      setSystemMode: (mode) => {
        set((state) => ({
          systemMode: mode,
          resolvedMode: state.mode === 'auto' ? mode : state.resolvedMode,
        }));
      },

      updatePaperShader: (settings) => {
        set((state) => ({
          paperShader: {
            ...state.paperShader,
            ...settings,
            intensity:
              settings.intensity !== undefined
                ? Math.min(1, Math.max(0, settings.intensity))
                : state.paperShader.intensity,
            animationSpeed:
              settings.animationSpeed !== undefined
                ? Math.max(0, settings.animationSpeed)
                : state.paperShader.animationSpeed,
            surfaces:
              settings.surfaces !== undefined && settings.surfaces.length > 0
                ? settings.surfaces
                : state.paperShader.surfaces,
          },
        }));
      },

      applyTenantSettings: (settings) => {
        if (!settings) return;

        set((state) => {
          const nextMode = settings.theme ?? state.mode;
          const nextResolvedMode = nextMode === 'auto' ? state.systemMode : nextMode;

          const tenantShader = settings.paperShader;
          const nextPaperShader: PaperShaderState = tenantShader
            ? {
                enabled: tenantShader.enabled ?? state.paperShader.enabled,
                intensity:
                  tenantShader.intensity !== undefined
                    ? Math.min(1, Math.max(0, tenantShader.intensity))
                    : state.paperShader.intensity,
                animationSpeed:
                  tenantShader.animationSpeed !== undefined
                    ? Math.max(0, tenantShader.animationSpeed)
                    : state.paperShader.animationSpeed,
                surfaces:
                  tenantShader.surfaces && tenantShader.surfaces.length > 0
                    ? tenantShader.surfaces
                    : state.paperShader.surfaces,
              }
            : state.paperShader;

          // Use JSON.stringify for deep comparison to avoid infinite loops
          const currentState = JSON.stringify({
            mode: state.mode,
            resolvedMode: state.resolvedMode,
            paperShader: state.paperShader,
          });

          const nextState = JSON.stringify({
            mode: nextMode,
            resolvedMode: nextResolvedMode,
            paperShader: nextPaperShader,
          });

          // Only update if state actually changed
          if (currentState === nextState) {
            return {} as Partial<ThemeState>;
          }

          return {
            mode: nextMode,
            resolvedMode: nextResolvedMode,
            paperShader: nextPaperShader,
          };
        });
      },
    }),
    {
      name: 'mas-theme-store',
      partialize: (state) => ({
        mode: state.mode,
        paperShader: state.paperShader,
      }),
    }
  )
);

const hydrateResolvedMode = (modeOverride?: ThemeMode) => {
  const { mode: currentMode, systemMode: currentSystemMode } = useThemeStore.getState();
  const mode = modeOverride ?? currentMode;
  const systemMode = detectSystemMode(currentSystemMode);
  const resolvedMode = mode === 'auto' ? systemMode : mode;

  useThemeStore.setState(
    { systemMode, resolvedMode },
    false,
    'theme/hydrate-resolved-mode'
  );
};

useThemeStore.persist?.onFinishHydration?.((state) => {
  hydrateResolvedMode(state?.mode);
});

if (useThemeStore.persist?.hasHydrated?.()) {
  hydrateResolvedMode();
}

export const useTheme = () =>
  useThemeStore((state) => ({
    mode: state.mode,
    resolvedMode: state.resolvedMode,
    systemMode: state.systemMode,
    paperShader: state.paperShader,
  }));
