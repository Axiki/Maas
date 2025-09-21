import React from 'react';
import { Card, Button } from '@mas/ui';
import { useTheme } from '../../stores/themeStore';
import { PaperSurface } from '../../types';

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

const paperSurfaces: Array<{ key: PaperSurface; label: string; description: string }> = [
  {
    key: 'background',
    label: 'Background',
    description: 'Covers the application shell and workspace backdrop.',
  },
  {
    key: 'cards',
    label: 'Cards & panels',
    description: 'Applies to card components, sheets, and floating surfaces.',
  },
];

export const BackOffice: React.FC = () => {
  const { mode, paperShader, setMode, updatePaperShader } = useTheme();
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);

    setReduceMotion(mediaQuery.matches);

    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if ('removeEventListener' in mediaQuery) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const toggleSurface = (surface: PaperSurface) => {
    const current = paperShader.surfaces[surface];
    updatePaperShader({
      surfaces: {
        [surface]: { enabled: !current.enabled },
      },
    });
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Paper Shader</h2>
                <p className="text-muted text-sm">
                  Tune tactile textures per surface. Animation speed of 0 keeps the layer static.
                </p>
              </div>
              <Button
                variant={paperShader.enabled ? 'primary' : 'outline'}
                onClick={() => updatePaperShader({ enabled: !paperShader.enabled })}
              >
                {paperShader.enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {reduceMotion && (
              <div className="rounded-lg border border-dashed border-primary-400/60 bg-primary-50/60 p-3 text-sm text-primary-700">
                Devices that prefer reduced motion render the shader as a static texture.
              </div>
            )}

            <div className="space-y-5">
              {paperSurfaces.map((surface) => {
                const surfaceState = paperShader.surfaces[surface.key];
                return (
                  <div
                    key={surface.key}
                    className={`rounded-lg border border-line/60 bg-surface-100/80 p-4 space-y-4 ${
                      paperShader.enabled ? '' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-ink">{surface.label}</h3>
                        <p className="text-sm text-muted">{surface.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={surfaceState.enabled ? 'primary' : 'outline'}
                        onClick={() => toggleSurface(surface.key)}
                      >
                        {surfaceState.enabled ? 'Active' : 'Hidden'}
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted">
                          Intensity
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={surfaceState.intensity}
                          onChange={(event) =>
                            updatePaperShader({
                              surfaces: {
                                [surface.key]: {
                                  intensity: parseFloat(event.target.value),
                                },
                              },
                            })
                          }
                          disabled={!surfaceState.enabled}
                          className="w-full accent-primary-500"
                        />
                        <span className="text-xs text-muted">
                          {surfaceState.intensity.toFixed(2)}
                        </span>
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted">
                          Animation speed
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={3}
                          step={0.1}
                          value={surfaceState.animationSpeed}
                          onChange={(event) =>
                            updatePaperShader({
                              surfaces: {
                                [surface.key]: {
                                  animationSpeed: parseFloat(event.target.value),
                                },
                              },
                            })
                          }
                          disabled={!surfaceState.enabled}
                          className="w-full accent-primary-500"
                        />
                        <span className="text-xs text-muted">
                          {surfaceState.animationSpeed.toFixed(1)}x
                          {surfaceState.animationSpeed === 0 ? ' · static' : ''}
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-line bg-surface-200/60 p-4 text-sm text-muted">
              Settings persist per tenant and sync to local storage instantly.
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
