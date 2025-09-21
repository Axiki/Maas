import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Button } from '@mas/ui';
import { useTheme } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

const paperSurfaces: Array<'background' | 'cards'> = ['background', 'cards'];

export const BackOffice: React.FC = () => {
  const { mode, paperShader, setMode, updatePaperShader } = useTheme();
  const { user, updateUser, hasPermission } = useAuthStore();
  const securityProfile = user?.security ?? {};
  const [twoFactorStage, setTwoFactorStage] = useState<'idle' | 'verify'>('idle');
  const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(''));
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  const canManageSecurity = hasPermission('backoffice.manageSecurity');
  const canConfigureTwoFactor = hasPermission('backoffice.configureTwoFactor');
  const twoFactorEnabled = Boolean(securityProfile.twoFactorEnabled);

  useEffect(() => {
    if (twoFactorEnabled) {
      setTwoFactorStage('idle');
      setVerificationCode(Array(6).fill(''));
      setTwoFactorError(null);
      setIsVerifying(false);
    }
  }, [twoFactorEnabled]);

  const lastVerifiedLabel = useMemo(() => {
    if (!securityProfile.twoFactorVerifiedAt) {
      return null;
    }

    try {
      return new Date(securityProfile.twoFactorVerifiedAt).toLocaleString();
    } catch (error) {
      console.warn('Unable to format verification timestamp', error);
      return securityProfile.twoFactorVerifiedAt;
    }
  }, [securityProfile.twoFactorVerifiedAt]);

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

  const resetVerificationState = () => {
    setVerificationCode(Array(6).fill(''));
    setTwoFactorError(null);
    setIsVerifying(false);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) {
      return;
    }

    setVerificationCode((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && codeRefs.current[index + 1]) {
      codeRefs.current[index + 1]?.focus();
    }

    if (!value && codeRefs.current[index - 1]) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleStartSetup = () => {
    if (!canConfigureTwoFactor) return;
    resetVerificationState();
    setTwoFactorStage('verify');
  };

  const handleCancelSetup = () => {
    resetVerificationState();
    setTwoFactorStage('idle');
  };

  const handleConfirmTwoFactor = () => {
    if (!canConfigureTwoFactor) return;

    const code = verificationCode.join('');
    if (code.length < 6) {
      setTwoFactorError('Enter the six-digit code from your authenticator app.');
      return;
    }

    setIsVerifying(true);

    window.setTimeout(() => {
      updateUser({
        security: {
          ...securityProfile,
          twoFactorEnabled: true,
          twoFactorVerifiedAt: new Date().toISOString(),
        },
      });
      resetVerificationState();
      setTwoFactorStage('idle');
    }, 600);
  };

  const handleDisableTwoFactor = () => {
    if (!canConfigureTwoFactor) return;

    updateUser({
      security: {
        ...securityProfile,
        twoFactorEnabled: false,
        twoFactorVerifiedAt: undefined,
      },
    });
    resetVerificationState();
    setTwoFactorStage('idle');
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Security Controls</h2>
              <p className="text-muted text-sm">
                Manage PIN prompts and two-factor verification requirements for sensitive flows.
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                twoFactorEnabled ? 'bg-primary-100 text-primary-700' : 'bg-surface-200 text-muted'
              }`}
            >
              {twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
            </span>
          </div>

          {!canManageSecurity && (
            <div className="rounded-lg border border-dashed border-line bg-surface-200/60 px-4 py-3 text-sm text-muted">
              You can review these settings, but changes require supervisor approval.
            </div>
          )}

          <div className="rounded-lg border border-line bg-surface-200/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">POS PIN approvals</h3>
                <p className="text-xs text-muted">
                  Restricted actions such as payment processing prompt for a manager PIN.
                </p>
              </div>
              <span className="text-xs font-medium text-primary-600">
                {securityProfile.pinHash ? 'Configured' : 'Not configured'}
              </span>
            </div>
            <p className="text-xs text-muted">
              PINs are stored as one-way hashes in this sandbox while awaiting live credential vault integration.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface-200/60 p-4 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">Two-factor authentication</h3>
                <p className="text-xs text-muted">
                  Require a time-based code when signing in to BackOffice on new devices.
                </p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  twoFactorEnabled ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-muted'
                }`}
              >
                {twoFactorEnabled ? 'Active' : 'Inactive'}
              </span>
            </div>

            {twoFactorStage === 'verify' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  Scan the QR code with your authenticator app and enter the six-digit code to finish setup.
                </p>
                <div className="flex justify-center gap-2">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        codeRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleCodeChange(index, event.target.value)}
                      className="h-12 w-10 rounded-lg border border-line bg-surface-100 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>
                {twoFactorError && (
                  <p className="text-xs text-danger text-center">{twoFactorError}</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" onClick={handleCancelSetup} disabled={isVerifying}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirmTwoFactor}
                    disabled={isVerifying || !canConfigureTwoFactor}
                  >
                    {isVerifying ? 'Verifying…' : 'Complete setup'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted">
                  {twoFactorEnabled
                    ? lastVerifiedLabel
                      ? `Last verified on ${lastVerifiedLabel}.`
                      : 'Two-factor is active for this account.'
                    : 'Boost account security by pairing an authenticator app.'}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={twoFactorEnabled ? 'outline' : 'primary'}
                    onClick={twoFactorEnabled ? handleDisableTwoFactor : handleStartSetup}
                    disabled={!canConfigureTwoFactor}
                  >
                    {twoFactorEnabled ? 'Disable 2FA' : 'Start setup'}
                  </Button>
                  {!canConfigureTwoFactor && (
                    <p className="text-xs text-muted">
                      Ask a manager to adjust two-factor requirements.
                    </p>
                  )}
                </div>
              </div>
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
