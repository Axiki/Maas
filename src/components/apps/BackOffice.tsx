import React from 'react';
import { Card, Button } from '@mas/ui';
import { useTheme, PaperShaderUpdate } from '../../stores/themeStore';
import type { PaperShaderSurface } from '../../types';

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

const shaderPresets: Array<{
  id: string;
  label: string;
  description: string;
  config: PaperShaderUpdate;
}> = [
  {
    id: 'subtle',
    label: 'Subtle Grain',
    description: 'Low-contrast texture suited for bright dining rooms.',
    config: {
      enabled: true,
      surfaces: {
        background: { intensity: 0.35, animationSpeed: 0.6, enabled: true },
        cards: { intensity: 0.18, animationSpeed: 0, enabled: true },
      },
      reducedMotion: { mode: 'static', intensityMultiplier: 0.45 },
    },
  },
  {
    id: 'signature',
    label: 'Signature',
    description: 'Balanced grain with gentle motion for most venues.',
    config: {
      enabled: true,
      surfaces: {
        background: { intensity: 0.55, animationSpeed: 1, enabled: true },
        cards: { intensity: 0.3, animationSpeed: 0.1, enabled: true },
      },
      reducedMotion: { mode: 'static', intensityMultiplier: 0.6 },
    },
  },
  {
    id: 'bold',
    label: 'Bold Texture',
    description: 'Higher grain for dim lounges and late-night service.',
    config: {
      enabled: true,
      surfaces: {
        background: { intensity: 0.72, animationSpeed: 1.35, enabled: true },
        cards: { intensity: 0.42, animationSpeed: 0.2, enabled: true },
      },
      reducedMotion: { mode: 'static', intensityMultiplier: 0.5 },
    },
  },
];

export const BackOffice: React.FC = () => {
  const { mode, paperShader, setMode, updatePaperShader, resetPaperShader } = useTheme();

  const backgroundSurface = paperShader.surfaces.background;
  const cardSurface = paperShader.surfaces.cards;

  const toggleSurface = (surface: PaperShaderSurface) => {
    updatePaperShader({
      surfaces: {
        [surface]: { enabled: !paperShader.surfaces[surface].enabled },
      },
    });
  };

  const handleIntensityChange = (surface: PaperShaderSurface, value: number) => {
    updatePaperShader({
      surfaces: {
        [surface]: { intensity: value },
      },
    });
  };

  const handleSpeedChange = (surface: PaperShaderSurface, value: number) => {
    updatePaperShader({
      surfaces: {
        [surface]: { animationSpeed: value },
      },
    });
  };

  const handlePreset = (config: PaperShaderUpdate) => {
    updatePaperShader(config);
  };

  const isPresetActive = (config: PaperShaderUpdate) => {
    const backgroundPreset = config.surfaces?.background;
    const cardsPreset = config.surfaces?.cards;
    const reducedPreset = config.reducedMotion;

    const enabledMatches =
      config.enabled === undefined || config.enabled === paperShader.enabled;

    const backgroundMatches =
      !backgroundPreset ||
      (backgroundPreset.enabled === undefined ||
        backgroundPreset.enabled === backgroundSurface.enabled) &&
        (backgroundPreset.intensity === undefined ||
          Math.abs(backgroundPreset.intensity - backgroundSurface.intensity) < 0.01) &&
        (backgroundPreset.animationSpeed === undefined ||
          Math.abs(backgroundPreset.animationSpeed - backgroundSurface.animationSpeed) < 0.05);

    const cardsMatches =
      !cardsPreset ||
      (cardsPreset.enabled === undefined || cardsPreset.enabled === cardSurface.enabled) &&
        (cardsPreset.intensity === undefined ||
          Math.abs(cardsPreset.intensity - cardSurface.intensity) < 0.01) &&
        (cardsPreset.animationSpeed === undefined ||
          Math.abs(cardsPreset.animationSpeed - cardSurface.animationSpeed) < 0.05);

    const reducedMatches =
      !reducedPreset ||
      (reducedPreset.mode === undefined || reducedPreset.mode === paperShader.reducedMotion.mode) &&
        (reducedPreset.intensityMultiplier === undefined ||
          Math.abs(
            reducedPreset.intensityMultiplier - paperShader.reducedMotion.intensityMultiplier
          ) < 0.01);

    return enabledMatches && backgroundMatches && cardsMatches && reducedMatches;
  };

  const handleReducedMotionMode = (mode: 'static' | 'disabled') => {
    updatePaperShader({ reducedMotion: { mode } });
  };

  const handleReducedMotionIntensity = (value: number) => {
    updatePaperShader({ reducedMotion: { intensityMultiplier: value } });
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Backoffice Settings</h1>
          <p className="text-muted max-w-2xl">
            Configure tenant appearance, theme behaviour, and paper shader presentation. These
            controls apply instantly across the suite for every user in this tenant.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Theme Mode</h2>
              <p className="text-muted text-sm">
                Choose how MAS adapts colours. Auto follows the system preference for each user.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {themeModes.map((item) => (
                <Button
                  key={item.id}
                  variant={mode === item.id ? 'primary' : 'outline'}
                  onClick={() => setMode(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="rounded-lg border border-line bg-surface-200/60 p-4">
              <p className="text-sm text-muted">
                Current mode: <span className="font-medium text-ink capitalize">{mode}</span>.
              </p>
            </div>
          </Card>

          <Card className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Paper Shader</h2>
                <p className="text-muted text-sm">
                  Toggle the tactile grain layer, tune per-surface intensity, and define motion
                  fallbacks. Updates apply instantly across the suite.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={resetPaperShader}>
                  Reset
                </Button>
                <Button
                  variant={paperShader.enabled ? 'primary' : 'outline'}
                  onClick={() => updatePaperShader({ enabled: !paperShader.enabled })}
                >
                  {paperShader.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-ink">Presets</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {shaderPresets.map((preset) => {
                  const active = isPresetActive(preset.config);
                  return (
                    <Button
                      key={preset.id}
                      variant={active ? 'primary' : 'secondary'}
                      className="h-auto w-full flex-col items-start justify-start gap-1 text-left"
                      onClick={() => handlePreset(preset.config)}
                    >
                      <span className="text-sm font-semibold">{preset.label}</span>
                      <span className="text-xs font-normal text-muted">{preset.description}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-line/70 bg-surface-200/40 p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Background</h3>
                    <p className="text-xs text-muted">
                      Full-viewport grain rendered beneath every screen.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={backgroundSurface.enabled ? 'primary' : 'outline'}
                    onClick={() => toggleSurface('background')}
                  >
                    {backgroundSurface.enabled ? 'Active' : 'Inactive'}
                  </Button>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-ink">Intensity</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={backgroundSurface.intensity}
                    onChange={(event) =>
                      handleIntensityChange('background', parseFloat(event.target.value))
                    }
                    className="w-full accent-primary-500"
                  />
                  <span className="text-[11px] text-muted tracking-wide">
                    {backgroundSurface.intensity.toFixed(2)}
                  </span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-ink">Animation speed</span>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={backgroundSurface.animationSpeed}
                    onChange={(event) =>
                      handleSpeedChange('background', parseFloat(event.target.value))
                    }
                    className="w-full accent-primary-500"
                  />
                  <span className="text-[11px] text-muted tracking-wide">
                    {backgroundSurface.animationSpeed.toFixed(2)}x
                  </span>
                </label>
              </div>

              <div className="rounded-lg border border-line/70 bg-surface-200/40 p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Cards & surfaces</h3>
                    <p className="text-xs text-muted">
                      Static grain for elevated cards, modals, and panels.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={cardSurface.enabled ? 'primary' : 'outline'}
                    onClick={() => toggleSurface('cards')}
                  >
                    {cardSurface.enabled ? 'Active' : 'Inactive'}
                  </Button>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-ink">Intensity</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={cardSurface.intensity}
                    onChange={(event) =>
                      handleIntensityChange('cards', parseFloat(event.target.value))
                    }
                    className="w-full accent-primary-500"
                  />
                  <span className="text-[11px] text-muted tracking-wide">
                    {cardSurface.intensity.toFixed(2)}
                  </span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-ink">Animation speed</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={cardSurface.animationSpeed}
                    onChange={(event) =>
                      handleSpeedChange('cards', parseFloat(event.target.value))
                    }
                    className="w-full accent-primary-500"
                  />
                  <span className="text-[11px] text-muted tracking-wide">
                    {cardSurface.animationSpeed.toFixed(2)}x
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-line/70 bg-surface-200/40 p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">Reduced motion fallback</h3>
                <p className="text-xs text-muted">
                  Honour <code className="font-mono text-[10px]">prefers-reduced-motion</code> by
                  swapping to a static grain or disabling the layer.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['static', 'disabled'] as const).map((modeOption) => (
                  <Button
                    key={modeOption}
                    size="sm"
                    variant={paperShader.reducedMotion.mode === modeOption ? 'primary' : 'outline'}
                    onClick={() => handleReducedMotionMode(modeOption)}
                  >
                    {modeOption === 'static' ? 'Static grain' : 'Turn off'}
                  </Button>
                ))}
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium text-ink">Static grain strength</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={paperShader.reducedMotion.intensityMultiplier}
                  onChange={(event) =>
                    handleReducedMotionIntensity(parseFloat(event.target.value))
                  }
                  className="w-full accent-primary-500"
                  disabled={paperShader.reducedMotion.mode === 'disabled'}
                />
                <span className="text-[11px] text-muted tracking-wide">
                  {paperShader.reducedMotion.intensityMultiplier.toFixed(2)}
                </span>
              </label>
            </div>
          </Card>
        </div>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          <p className="text-muted text-sm">
            Changes above update the experience instantly. Use this preview to confirm the contrast
            and motion feel right for your venue.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="paper-card p-4 space-y-3">
                <p className="text-sm text-muted uppercase tracking-wide">Sample Tile</p>
                <p className="font-semibold text-lg">Surface {item}</p>
                <p className="text-sm text-muted text-balance">
                  The paper shader adds subtle grain and fiber texture, keeping contrast within
                  accessible ranges.
                </p>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
