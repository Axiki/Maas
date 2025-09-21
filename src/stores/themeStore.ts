import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import {
  PaperShaderSettings,
  PaperShaderSurfaceSettings,
  PaperSurface,
  TenantSettings,
} from '../types';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type PaperShaderState = PaperShaderSettings;

export type PaperShaderUpdate = {
  enabled?: boolean;
  surfaces?: Partial<Record<PaperSurface, Partial<PaperShaderSurfaceSettings>>>;
};

interface ThemeState {
  mode: ThemeMode;
  systemMode: 'light' | 'dark';
  resolvedMode: 'light' | 'dark';
  paperShader: PaperShaderState;
  setMode: (mode: ThemeMode) => void;
  setSystemMode: (mode: 'light' | 'dark') => void;
  updatePaperShader: (settings: PaperShaderUpdate) => void;
  applyTenantSettings: (settings?: TenantSettings) => void;
}

const surfaceKeys: PaperSurface[] = ['background', 'cards'];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const clampNonNegative = (value: number) => Math.max(0, value);

const createDefaultPaperShader = (): PaperShaderState => ({
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
});

const clonePaperShader = (shader: PaperShaderState): PaperShaderState => ({
  enabled: shader.enabled,
  surfaces: surfaceKeys.reduce((acc, surface) => {
    acc[surface] = { ...shader.surfaces[surface] };
    return acc;
  }, {} as Record<PaperSurface, PaperShaderSurfaceSettings>),
});

const sanitizeSurface = (
  base: PaperShaderSurfaceSettings,
  patch?: Partial<PaperShaderSurfaceSettings>
): PaperShaderSurfaceSettings => ({
  enabled: patch?.enabled ?? base.enabled,
  intensity:
    patch?.intensity !== undefined ? clamp01(patch.intensity) : base.intensity,
  animationSpeed:
    patch?.animationSpeed !== undefined
      ? clampNonNegative(patch.animationSpeed)
      : base.animationSpeed,
});

type LegacyPaperShader = {
  enabled?: boolean;
  intensity?: number;
  animationSpeed?: number;
  surfaces?: PaperSurface[];
};

const isLegacyPaperShader = (value: unknown): value is LegacyPaperShader => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    'intensity' in candidate ||
    'animationSpeed' in candidate ||
    Array.isArray(candidate.surfaces)
  );
};

const normalizePaperShader = (
  value: unknown,
  base: PaperShaderState
): PaperShaderState => {
  if (!value || typeof value !== 'object') {
    return clonePaperShader(base);
  }

  if (isLegacyPaperShader(value)) {
    const legacy = value as LegacyPaperShader;
    const activeSurfaces =
      Array.isArray(legacy.surfaces) && legacy.surfaces.length > 0
        ? legacy.surfaces
        : surfaceKeys.filter((surface) => base.surfaces[surface].enabled);

    return {
      enabled: legacy.enabled ?? base.enabled,
      surfaces: surfaceKeys.reduce((acc, surface) => {
        const baseSurface = base.surfaces[surface];
        const intensityValue =
          legacy.intensity !== undefined
            ? surface === 'cards'
              ? clamp01(legacy.intensity * 0.7)
              : clamp01(legacy.intensity)
            : baseSurface.intensity;
        const animationValue =
          surface === 'cards'
            ? baseSurface.animationSpeed
            : legacy.animationSpeed !== undefined
              ? clampNonNegative(legacy.animationSpeed)
              : baseSurface.animationSpeed;

        const surfaceEnabled =
          legacy.enabled === false
            ? false
            : legacy.enabled === true
              ? activeSurfaces.includes(surface)
              : activeSurfaces.includes(surface)
                ? baseSurface.enabled
                : false;

        acc[surface] = {
          enabled: surfaceEnabled,
          intensity: intensityValue,
          animationSpeed: animationValue,
        };

        return acc;
      }, {} as Record<PaperSurface, PaperShaderSurfaceSettings>),
    };
  }

  const typed = value as PaperShaderUpdate;

  return {
    enabled: typed.enabled ?? base.enabled,
    surfaces: surfaceKeys.reduce((acc, surface) => {
      acc[surface] = sanitizeSurface(
        base.surfaces[surface],
        typed.surfaces?.[surface]
      );
      return acc;
    }, {} as Record<PaperSurface, PaperShaderSurfaceSettings>),
  };
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'auto',
      systemMode: 'light',
      resolvedMode: 'light',
      paperShader: createDefaultPaperShader(),

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
        set((state) => {
          const nextPaperShader = normalizePaperShader(
            settings,
            state.paperShader
          );

          const currentSerialized = JSON.stringify(state.paperShader);
          const nextSerialized = JSON.stringify(nextPaperShader);

          if (currentSerialized === nextSerialized) {
            return {} as Partial<ThemeState>;
          }

          return {
            paperShader: nextPaperShader,
          };
        });
      },

      applyTenantSettings: (settings) => {
        if (!settings) return;

        set((state) => {
          const nextMode = settings.theme ?? state.mode;
          const nextResolvedMode =
            nextMode === 'auto' ? state.systemMode : nextMode;

          const nextPaperShader = settings.paperShader
            ? normalizePaperShader(settings.paperShader, state.paperShader)
            : state.paperShader;

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
      version: 2,
      partialize: (state) => ({
        mode: state.mode,
        paperShader: state.paperShader,
      }),
      migrate: (persistedState) => {
        if (!persistedState) {
          return {
            mode: 'auto' as ThemeMode,
            paperShader: createDefaultPaperShader(),
          };
        }

        const stored = persistedState as Partial<ThemeState> & {
          paperShader?: unknown;
          mode?: ThemeMode;
        };

        const normalizedMode: ThemeMode = stored.mode ?? 'auto';

        return {
          ...stored,
          mode: normalizedMode,
          paperShader: normalizePaperShader(
            stored.paperShader,
            createDefaultPaperShader()
          ),
        };
      },
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
      setSystemMode: state.setSystemMode,
      updatePaperShader: state.updatePaperShader,
    }),
    shallow
  );
