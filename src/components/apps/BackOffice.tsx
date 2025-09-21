import React from 'react';
import { Card, Button } from '@mas/ui';
import { useTheme } from '../../stores/themeStore';
import { mockDevices, type MockDevice } from '../../data/mockDevices';

const simulateDelay = (base = 450, variance = 300) =>
  new Promise<void>((resolve) => setTimeout(resolve, base + Math.random() * variance));

const formatLastSeen = (timestamp: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

const paperSurfaces: Array<'background' | 'cards'> = ['background', 'cards'];

export const BackOffice: React.FC = () => {
  const { mode, paperShader, setMode, updatePaperShader } = useTheme();
  const [devices, setDevices] = React.useState<MockDevice[]>(() =>
    mockDevices.map((device) => ({ ...device }))
  );
  const [connectionPending, setConnectionPending] = React.useState<Record<string, boolean>>({});
  const [activeTests, setActiveTests] = React.useState<Record<string, 'print' | 'drawer' | undefined>>({});

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

  const connectDevice = async (device: MockDevice) => {
    console.log(`[devices] connecting to ${device.name} (${device.id})`);
    await simulateDelay();
    console.log(`[devices] ${device.name} connected`);
  };

  const disconnectDevice = async (device: MockDevice) => {
    console.log(`[devices] disconnecting ${device.name} (${device.id})`);
    await simulateDelay();
    console.log(`[devices] ${device.name} disconnected`);
  };

  const runDeviceTest = async (device: MockDevice, action: 'print' | 'drawer') => {
    if (!device.connected) {
      console.warn(`[devices] skipped ${action} test for ${device.name} - device offline`);
      return;
    }

    const label = action === 'print' ? 'print receipt' : 'drawer cycle';
    console.log(`[devices] starting ${label} for ${device.name}`);
    await simulateDelay(520, 360);
    console.log(`[devices] completed ${label} for ${device.name}`);
  };

  const handleToggleConnection = async (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);
    if (!device) {
      return;
    }

    const nextConnected = !device.connected;
    setDevices((prev) =>
      prev.map((item) => (item.id === deviceId ? { ...item, connected: nextConnected } : item))
    );
    setConnectionPending((prev) => ({ ...prev, [deviceId]: true }));

    try {
      if (nextConnected) {
        await connectDevice({ ...device, connected: nextConnected });
      } else {
        await disconnectDevice({ ...device, connected: nextConnected });
      }

      const timestamp = new Date().toISOString();
      setDevices((prev) =>
        prev.map((item) => (item.id === deviceId ? { ...item, lastSeen: timestamp } : item))
      );
    } catch (error) {
      console.error('[devices] failed to update connection state', error);
      setDevices((prev) =>
        prev.map((item) => (item.id === deviceId ? { ...item, connected: device.connected } : item))
      );
    } finally {
      setConnectionPending((prev) => {
        const next = { ...prev };
        delete next[deviceId];
        return next;
      });
    }
  };

  const handleRunTest = async (deviceId: string, action: 'print' | 'drawer') => {
    const device = devices.find((item) => item.id === deviceId);
    if (!device || !device.connected) {
      console.warn(`[devices] cannot run ${action} on ${device?.name ?? deviceId} - offline`);
      return;
    }

    setActiveTests((prev) => ({ ...prev, [deviceId]: action }));
    try {
      await runDeviceTest(device, action);
    } finally {
      setActiveTests((prev) => ({ ...prev, [deviceId]: undefined }));
    }
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

        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Hardware Devices</h2>
            <p className="text-muted text-sm">
              Monitor printer and drawer connectivity. Use the quick actions to validate receipts or
              cycle peripherals before service.
            </p>
          </div>

          <div className="space-y-4">
            {devices.map((device) => {
              const connectionLoading = Boolean(connectionPending[device.id]);
              const currentTest = activeTests[device.id];
              const offline = !device.connected;

              return (
                <div
                  key={device.id}
                  className="rounded-xl border border-line bg-surface-100/70 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-ink">{device.name}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            device.connected
                              ? 'bg-success/10 text-success'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {device.connected ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-sm text-muted">
                        {device.type} • {device.location}
                      </p>
                      <p className="text-xs text-muted">
                        {device.model} · {device.ipAddress} · Last seen {formatLastSeen(device.lastSeen)}
                      </p>
                    </div>

                    <Button
                      variant={device.connected ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleConnection(device.id)}
                      disabled={connectionLoading}
                      aria-pressed={device.connected}
                      aria-busy={connectionLoading}
                    >
                      {connectionLoading
                        ? device.connected
                          ? 'Disconnecting…'
                          : 'Connecting…'
                        : device.connected
                        ? 'Disconnect'
                        : 'Connect'}
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {device.capabilities.includes('print') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunTest(device.id, 'print')}
                        disabled={offline || Boolean(currentTest) || connectionLoading}
                        aria-disabled={offline || Boolean(currentTest) || connectionLoading}
                      >
                        {currentTest === 'print' ? 'Running print test…' : 'Print test receipt'}
                      </Button>
                    )}

                    {device.capabilities.includes('drawer') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRunTest(device.id, 'drawer')}
                        disabled={offline || Boolean(currentTest) || connectionLoading}
                        aria-disabled={offline || Boolean(currentTest) || connectionLoading}
                      >
                        {currentTest === 'drawer' ? 'Cycling drawer…' : 'Cycle cash drawer'}
                      </Button>
                    )}

                    {device.capabilities.length === 0 && (
                      <span className="text-xs text-muted">
                        No remote actions available for this device.
                      </span>
                    )}

                    {offline && device.capabilities.length > 0 && (
                      <span className="text-xs font-medium text-warning">
                        Device offline — reconnect to run tests.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
