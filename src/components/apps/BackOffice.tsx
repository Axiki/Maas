import React, { useMemo, useState } from 'react';
import { Card, Button } from '@mas/ui';
import { ShieldCheck, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import { useTheme } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { RestrictedPosAction } from '../../types';

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

const paperSurfaces: Array<'background' | 'cards'> = ['background', 'cards'];

export const BackOffice: React.FC = () => {
  const { mode, paperShader, setMode, updatePaperShader } = useTheme();
  const {
    mfa,
    beginMfaEnrollment,
    cancelMfaEnrollment,
    verifyMfaCode,
    rotateRecoveryCodes,
    clearMfa,
    rolePermissions,
    user
  } = useAuthStore();
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [codesRotatedAt, setCodesRotatedAt] = useState<string | null>(null);

  const actionLabels: Record<RestrictedPosAction, string> = useMemo(
    () => ({
      'void-order': 'Void current order',
      'process-refund': 'Process refund',
      'manager-discount': 'Manager discount'
    }),
    []
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

  const handleVerifyMfa = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = verifyMfaCode(verificationCode);
    setVerificationStatus(success ? 'success' : 'error');
    if (success) {
      setVerificationCode('');
      setCodesRotatedAt(null);
    }
  };

  const handleRotateCodes = () => {
    rotateRecoveryCodes();
    setCodesRotatedAt(new Date().toISOString());
  };

  const resetMfa = () => {
    clearMfa();
    setVerificationCode('');
    setVerificationStatus('idle');
    setCodesRotatedAt(null);
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
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Account Security</h2>
              <p className="text-muted text-sm">
                Configure multi-factor authentication and review which POS actions require a manager PIN.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-surface-200/60 px-4 py-2 text-sm">
              <p className="text-muted">MFA status: <span className="font-medium text-ink capitalize">{mfa.status}</span></p>
              {mfa.lastVerifiedAt && (
                <p className="text-[11px] text-muted mt-1">Verified {new Date(mfa.lastVerifiedAt).toLocaleString()}</p>
              )}
            </div>
          </div>

          {mfa.status === 'disabled' && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={beginMfaEnrollment} className="inline-flex items-center gap-2">
                <ShieldCheck size={16} /> Enable 2FA
              </Button>
              <div className="rounded-lg border border-line bg-surface-200/50 px-4 py-3 text-sm text-muted">
                Once enabled, you will receive a temporary secret, verification codes, and recovery codes to print or store in a password manager.
              </div>
            </div>
          )}

          {mfa.status === 'pending' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                    <KeyRound size={16} /> Temporary secret
                  </h3>
                  <p className="mt-2 rounded-lg border border-dashed border-primary-200 bg-primary-100/40 px-3 py-2 font-mono text-sm tracking-wide text-primary-700">
                    {mfa.temporarySecret}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Enter this secret into your authenticator app and compare the rolling codes below.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Temporary codes</h3>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm font-medium text-ink">
                    {(mfa.previewCodes ?? []).map((code) => (
                      <span key={code} className="rounded-lg border border-line bg-surface-100 py-2 font-mono">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <form onSubmit={handleVerifyMfa} className="space-y-3">
                  <label className="block text-sm font-medium text-ink">
                    Verification code
                    <input
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value)}
                      inputMode="numeric"
                      maxLength={6}
                      className="mt-2 w-full rounded-lg border border-line bg-surface-200/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter 6-digit code"
                    />
                  </label>
                  {verificationStatus === 'error' && (
                    <p className="flex items-center gap-2 text-sm text-danger">
                      <AlertCircle size={16} /> Code did not match. Try again within the 30s window.
                    </p>
                  )}
                  {verificationStatus === 'success' && (
                    <p className="flex items-center gap-2 text-sm text-success">
                      <ShieldCheck size={16} /> Code accepted. MFA is now active.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button type="submit" className="flex-1">Confirm setup</Button>
                    <Button type="button" variant="outline" onClick={cancelMfaEnrollment}>
                      Cancel
                    </Button>
                  </div>
                </form>
                <div className="rounded-lg border border-line bg-surface-200/60 p-4 text-sm text-muted">
                  <p className="font-medium text-ink mb-2">Recovery codes</p>
                  <ul className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {mfa.recoveryCodes.map((code) => (
                      <li key={code} className="rounded border border-dashed border-line px-2 py-1 text-center">
                        {code}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted">
                    Store these safely. Each code can be used once if you lose access to your authenticator.
                  </p>
                </div>
              </div>
            </div>
          )}

          {mfa.status === 'verified' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="rounded-lg border border-line bg-surface-100 p-4">
                  <p className="text-sm font-medium text-ink">Authenticator secret</p>
                  <p className="mt-2 font-mono text-sm tracking-wide text-muted break-all">
                    {mfa.temporarySecret}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Keep this secret offline. Regenerate from your identity provider if compromised.
                  </p>
                </div>
                <div className="rounded-lg border border-line bg-surface-100 p-4">
                  <p className="text-sm font-medium text-ink">Rolling codes (preview)</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm font-semibold text-ink">
                    {(mfa.previewCodes ?? []).map((code) => (
                      <span key={code} className="rounded-lg border border-line bg-surface-200 py-2 font-mono">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-line bg-surface-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">Recovery codes</p>
                    <Button variant="outline" size="sm" onClick={handleRotateCodes} className="inline-flex items-center gap-1">
                      <RefreshCw size={14} /> Rotate
                    </Button>
                  </div>
                  <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                    {mfa.recoveryCodes.map((code) => (
                      <li key={code} className="rounded border border-dashed border-line px-2 py-1 text-center">
                        {code}
                      </li>
                    ))}
                  </ul>
                  {codesRotatedAt && (
                    <p className="mt-2 text-[11px] text-muted">New codes generated {new Date(codesRotatedAt).toLocaleString()}.</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={resetMfa}>Disable 2FA</Button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-line bg-surface-200/60 p-4">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <ShieldCheck size={16} /> POS override policy
            </h3>
            <p className="mt-2 text-xs text-muted">
              Role: <span className="font-medium text-ink capitalize">{user?.role ?? 'unknown'}</span>. The following actions require a stored PIN hash for override:
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-ink md:grid-cols-2">
              {(rolePermissions?.requiresPin ?? []).length === 0 ? (
                <li className="rounded border border-line bg-surface-100 px-3 py-2 text-muted">
                  No PIN overrides are required for this role.
                </li>
              ) : (
                rolePermissions!.requiresPin.map((action) => (
                  <li key={action} className="rounded border border-line bg-surface-100 px-3 py-2">
                    {actionLabels[action]}
                  </li>
                ))
              )}
            </ul>
            {rolePermissions && rolePermissions.permittedWithoutPin.length > 0 && (
              <p className="mt-3 text-xs text-muted">
                Allowed without PIN: {rolePermissions.permittedWithoutPin.map((action) => actionLabels[action]).join(', ')}
              </p>
            )}
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
