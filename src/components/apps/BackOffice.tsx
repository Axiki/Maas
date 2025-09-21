import React from 'react';
import { Card, Button } from '@mas/ui';
import { useTheme } from '../../stores/themeStore';
import { useAuditTrailStore } from '../../stores/auditTrailStore';

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

const paperSurfaces: Array<'background' | 'cards'> = ['background', 'cards'];

export const BackOffice: React.FC = () => {
  const { mode, paperShader, setMode, updatePaperShader } = useTheme();
  const { entries } = useAuditTrailStore();
  const recentEntries = entries.slice(0, 5);

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
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink">Grain intensity</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={paperShader.intensity}
                  onChange={(event) =>
                    updatePaperShader({ intensity: parseFloat(event.target.value) })
                  }
                  className="w-full accent-primary-500"
                />
                <span className="text-xs text-muted">{paperShader.intensity.toFixed(2)}</span>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink">Animation speed</span>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={paperShader.animationSpeed}
                  onChange={(event) =>
                    updatePaperShader({ animationSpeed: parseFloat(event.target.value) })
                  }
                  className="w-full accent-primary-500"
                />
                <span className="text-xs text-muted">{paperShader.animationSpeed.toFixed(1)}x</span>
              </label>
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

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Audit Trail</h2>
              <p className="text-muted text-sm">
                Track high-risk overrides requiring approval so supervisors can reconcile activity.
              </p>
            </div>
            <span className="text-xs font-medium text-muted">
              {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
            </span>
          </div>

          {recentEntries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-surface-200/60 p-6 text-center">
              <p className="text-sm text-muted">No approvals recorded yet.</p>
              <p className="text-xs text-muted mt-1">
                Overrides approved at POS will appear here with actor, approver, and timestamp.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-line divide-y divide-line overflow-hidden bg-surface-200/60">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {entry.metadata.discountPercent.toFixed(1)}% discount override
                      </p>
                      <p className="text-xs text-muted">
                        Requested by {entry.actor?.name ?? 'Unknown user'} •{' '}
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase ${
                        entry.status === 'approved' ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="font-medium text-ink/80">
                      Item ID: <span className="font-mono text-ink">{entry.target.id}</span>
                    </span>
                    {entry.approver && (
                      <span>
                        Approved by {entry.approver.name} ({entry.approver.role})
                      </span>
                    )}
                    {entry.metadata.reason && (
                      <span className="text-danger">Reason: {entry.metadata.reason}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
