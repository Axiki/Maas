import React, { useState } from 'react';
import { Card, Button } from '@mas/ui';
import { X } from 'lucide-react';
import { useTheme } from '../../stores/themeStore';
import { useDiscountStore } from '../../stores/discountStore';
import { UserRole } from '../../types';

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

const paperSurfaces: Array<'background' | 'cards'> = ['background', 'cards'];

const roleOrder: UserRole[] = [
  'cashier',
  'waiter',
  'bartender',
  'supervisor',
  'manager',
  'owner'
];

export const BackOffice: React.FC = () => {
  const { mode, paperShader, setMode, updatePaperShader } = useTheme();
  const [newReason, setNewReason] = useState('');
  const { rules, updateRule, reasons, addReason, removeReason } = useDiscountStore(
    (state) => ({
      rules: state.rules,
      updateRule: state.updateRule,
      reasons: state.reasons,
      addReason: state.addReason,
      removeReason: state.removeReason
    })
  );

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

        <Card className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Discount Governance</h2>
            <p className="text-muted text-sm">
              Tune percentage limits for each role and curate the reasons available when staff
              request overrides in POS.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Self approval</th>
                  <th className="py-2 pr-4 font-medium">With approval</th>
                  <th className="py-2 font-medium">Approvers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {roleOrder.map((role) => {
                  const rule = rules[role];
                  return (
                    <tr key={role} className="align-top">
                      <td className="py-3 pr-4 font-medium capitalize text-ink">{role}</td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={rule.maxSelfDiscountPercent}
                          onChange={(event) => {
                            const value = parseFloat(event.target.value);
                            updateRule(role, {
                              maxSelfDiscountPercent: Number.isNaN(value) ? 0 : value
                            });
                          }}
                          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="mt-1 text-xs text-muted">
                          Percent allowed without approval for this role.
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={rule.maxManagerDiscountPercent}
                          onChange={(event) => {
                            const value = parseFloat(event.target.value);
                            updateRule(role, {
                              maxManagerDiscountPercent: Number.isNaN(value) ? 0 : value
                            });
                          }}
                          className="w-full rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="mt-1 text-xs text-muted">
                          Maximum override even with approval.
                        </p>
                      </td>
                      <td className="py-3 text-sm text-muted capitalize">
                        {rule.approvalRoles.length
                          ? rule.approvalRoles
                              .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
                              .join(', ')
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">Discount reasons</h3>
              <p className="text-xs text-muted">
                These labels appear in the POS modal when a team member applies a discount.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {reasons.length === 0 && (
                <span className="text-xs text-muted">No reasons configured yet.</span>
              )}
              {reasons.map((reason) => (
                <span
                  key={reason}
                  className="group inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-600"
                >
                  {reason}
                  <button
                    type="button"
                    onClick={() => removeReason(reason)}
                    className="text-primary-500 transition-colors hover:text-danger"
                    aria-label={`Remove ${reason}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={newReason}
                onChange={(event) => setNewReason(event.target.value)}
                placeholder="Add a new approval reason"
                className="flex-1 rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                variant="primary"
                onClick={() => {
                  const trimmed = newReason.trim();
                  if (!trimmed) {
                    return;
                  }
                  addReason(trimmed);
                  setNewReason('');
                }}
                disabled={!newReason.trim()}
              >
                Add reason
              </Button>
            </div>
          </div>
        </Card>

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
