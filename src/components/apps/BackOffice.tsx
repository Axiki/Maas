import React, { useId } from 'react';
import { Card, Button } from '@mas/ui';
import { useTheme } from '../../stores/themeStore';

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

const paperSurfaces: Array<'background' | 'cards'> = ['background', 'cards'];

export const BackOffice: React.FC = () => {
  const { mode, paperShader, setMode, updatePaperShader } = useTheme();
  const intensityId = useId();
  const speedId = useId();

  const toggleSurface = (surface: 'background' | 'cards') => {
    const set = new Set(paperShader.surfaces);
    if (set.has(surface)) {
      set.delete(surface);
    } else {
      set.add(surface);
    }
    const next = Array.from(set);
    updatePaperShader({ surfaces: next.length ? next : ['background'] });
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
                  Toggle the tactile grain layer and fine-tune its intensity and animation speed.
                </p>
              </div>
              <Button
                variant={paperShader.enabled ? 'primary' : 'outline'}
                onClick={() => updatePaperShader({ enabled: !paperShader.enabled })}
              >
                {paperShader.enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="form-field">
                <label htmlFor={intensityId} className="form-label">
                  Grain intensity
                </label>
                <input
                  id={intensityId}
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={paperShader.intensity}
                  onChange={(event) =>
                    updatePaperShader({ intensity: parseFloat(event.target.value) })
                  }
                  className="form-range"
                />
                <span className="form-helper text-right">
                  Current intensity: {paperShader.intensity.toFixed(2)}
                </span>
              </div>

              <div className="form-field">
                <label htmlFor={speedId} className="form-label">
                  Animation speed
                </label>
                <input
                  id={speedId}
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={paperShader.animationSpeed}
                  onChange={(event) =>
                    updatePaperShader({ animationSpeed: parseFloat(event.target.value) })
                  }
                  className="form-range"
                />
                <span className="form-helper text-right">
                  Playback speed: {paperShader.animationSpeed.toFixed(1)}x
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-ink mb-2">Apply shader to</h3>
              <div className="flex flex-wrap gap-2">
                {paperSurfaces.map((surface) => {
                  const active = paperShader.surfaces.includes(surface);
                  return (
                    <Button
                      key={surface}
                      variant={active ? 'primary' : 'outline'}
                      onClick={() => toggleSurface(surface)}
                    >
                      {surface === 'background' ? 'Background' : 'Cards'}
                    </Button>
                  );
                })}
              </div>
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
