import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import {
  TenantSettings,
  PaperShaderSettings,
  PaperShaderSurface,
  PaperShaderSurfaceConfig,
  PaperShaderReducedMotionConfig,
} from '../types';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type PaperShaderState = PaperShaderSettings;

export type PaperShaderUpdate = Partial<Omit<PaperShaderState, 'surfaces' | 'reducedMotion'>> & {
  surfaces?: Partial<Record<PaperShaderSurface, Partial<PaperShaderSurfaceConfig>>>;
  reducedMotion?: Partial<PaperShaderReducedMotionConfig>;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const clampNonNegative = (value: number) => Math.max(0, value);

export const createDefaultPaperShader = (): PaperShaderState => ({
  enabled: true,
  surfaces: {
    background: {
      enabled: true,
      intensity: 0.5,
      animationSpeed: 1,
    },
    cards: {
      enabled: true,
      intensity: 0.35,
      animationSpeed: 0,
    },
  },
  reducedMotion: {
    mode: 'static',
    intensityMultiplier: 0.6,
  },
});

const defaultPaperShader = createDefaultPaperShader();

const mergePaperShaderState = (
  base: PaperShaderState,
  update?: PaperShaderUpdate | PaperShaderState
): PaperShaderState => {
  if (!update) {
    return base;
  }

  const { surfaces: surfaceUpdates, reducedMotion: reducedMotionUpdate, ...rest } =
    update as PaperShaderUpdate;

  const nextSurfaces: PaperShaderState['surfaces'] = {
    background: { ...base.surfaces.background },
    cards: { ...base.surfaces.cards },
  };

  if (surfaceUpdates) {
    (Object.keys(surfaceUpdates) as PaperShaderSurface[]).forEach((surface) => {
      const incoming = surfaceUpdates[surface];
      if (!incoming || !nextSurfaces[surface]) {
        return;
      }

      const currentSurface = nextSurfaces[surface];
      nextSurfaces[surface] = {
        ...currentSurface,
        ...incoming,
        enabled: incoming.enabled ?? currentSurface.enabled,
        intensity:
          incoming.intensity !== undefined
            ? clamp01(incoming.intensity)
            : currentSurface.intensity,
        animationSpeed:
          incoming.animationSpeed !== undefined
            ? clampNonNegative(incoming.animationSpeed)
            : currentSurface.animationSpeed,
      };
    });
  }

  const nextReducedMotion = reducedMotionUpdate
    ? {
        ...base.reducedMotion,
        ...reducedMotionUpdate,
        intensityMultiplier:
          reducedMotionUpdate.intensityMultiplier !== undefined
            ? clamp01(reducedMotionUpdate.intensityMultiplier)
            : base.reducedMotion.intensityMultiplier,
      }
    : base.reducedMotion;

  return {
    ...base,
    ...rest,
    enabled: rest.enabled ?? base.enabled,
    surfaces: nextSurfaces,
    reducedMotion: nextReducedMotion,
  };
};

interface ThemeState {
  mode: ThemeMode;
  systemMode: 'light' | 'dark';
  resolvedMode: 'light' | 'dark';
  paperShader: PaperShaderState;
  setMode: (mode: ThemeMode) => void;
  setSystemMode: (mode: 'light' | 'dark') => void;
  updatePaperShader: (settings: PaperShaderUpdate) => void;
  resetPaperShader: () => void;
  applyTenantSettings: (settings?: TenantSettings) => void;
}

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
          paperShader: mergePaperShaderState(state.paperShader, settings),
        }));
      },

      resetPaperShader: () => {
        set(() => ({
          paperShader: createDefaultPaperShader(),
        }));
      },

      applyTenantSettings: (settings) => {
        if (!settings) return;

        set((state) => {
          const nextMode = settings.theme ?? state.mode;
          const nextResolvedMode = nextMode === 'auto' ? state.systemMode : nextMode;

          const tenantShader = settings.paperShader;
          const nextPaperShader: PaperShaderState = tenantShader
            ? mergePaperShaderState(state.paperShader, tenantShader)
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
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState;
        }

        const incoming = persistedState as Partial<ThemeState> & {
          paperShader?: unknown;
        };

        return {
          ...currentState,
          ...incoming,
          paperShader: mergePaperShaderState(
            currentState.paperShader,
            incoming.paperShader as PaperShaderUpdate | PaperShaderState | undefined
          ),
        };
      },
      partialize: (state) => ({
        mode: state.mode,
        paperShader: state.paperShader,
      }),
    }
  )
);

export const useTheme = () =>
  useThemeStore(
    (state) => ({
      mode: state.mode,
      resolvedMode: state.resolvedMode,
      systemMode: state.systemMode,
      paperShader: state.paperShader,
      setMode: state.setMode,
      updatePaperShader: state.updatePaperShader,
      resetPaperShader: state.resetPaperShader,
    }),
    shallow
  );
