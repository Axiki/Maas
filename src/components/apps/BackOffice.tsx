import React, { useCallback, useMemo } from 'react';
import { Card, Button } from '@mas/ui';
import { RefreshCw, AlertTriangle, Download, FileText } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from '../../stores/themeStore';
import { useOfflineStore } from '../../stores/offlineStore';

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' }
] as const;

const paperSurfaces: Array<'background' | 'cards'> = ['background', 'cards'];

const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
const EXPIRED_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 hours

const formatRelativeTime = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  return `${weeks} weeks ago`;
};

const formatDateTime = (date: Date) =>
  date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const toTitleCase = (value: string) =>
  value
    .split(/\s|-/)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export const BackOffice: React.FC = () => {
  const { mode, paperShader, setMode, updatePaperShader } = useTheme();
  const {
    queuedOrders,
    lastSyncTime,
    syncQueuedOrders,
    syncInProgress,
    lastSyncError,
    storageError,
    logEntries
  } = useOfflineStore(
    useShallow(state => ({
      queuedOrders: state.queuedOrders,
      lastSyncTime: state.lastSyncTime,
      syncQueuedOrders: state.syncQueuedOrders,
      syncInProgress: state.syncInProgress,
      lastSyncError: state.lastSyncError,
      storageError: state.storageError,
      logEntries: state.logEntries
    }))
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

  const warnings = useMemo(() => {
    const messages: Array<{ level: 'warning' | 'danger'; message: string }> = [];

    if (!lastSyncTime) {
      messages.push({ level: 'warning', message: 'No successful catalog sync recorded yet.' });
    } else {
      const ageMs = Date.now() - lastSyncTime.getTime();
      if (ageMs > EXPIRED_THRESHOLD_MS) {
        messages.push({
          level: 'danger',
          message: 'Offline cache is over 4 hours old. Refresh soon to avoid stale pricing.'
        });
      } else if (ageMs > STALE_THRESHOLD_MS) {
        messages.push({
          level: 'warning',
          message: 'Offline cache is over 1 hour old. Consider triggering a sync.'
        });
      }
    }

    if (storageError) {
      messages.push({ level: 'danger', message: `Storage error detected: ${storageError}` });
    }

    if (lastSyncError && lastSyncError !== storageError) {
      messages.push({ level: 'warning', message: `Last sync failed: ${lastSyncError}` });
    }

    return messages;
  }, [lastSyncTime, lastSyncError, storageError]);

  const syncStatus = useMemo(() => {
    if (syncInProgress) {
      return {
        label: 'Syncing',
        tone: 'text-primary-600',
        description: 'Processing queued orders now.'
      };
    }

    if (lastSyncError) {
      return {
        label: 'Needs attention',
        tone: 'text-danger',
        description: lastSyncError
      };
    }

    if (queuedOrders.length > 0) {
      return {
        label: 'Pending',
        tone: 'text-warning',
        description: 'Orders will sync once the connection stabilises.'
      };
    }

    return {
      label: 'Healthy',
      tone: 'text-success',
      description: 'Offline cache and orders are up to date.'
    };
  }, [syncInProgress, lastSyncError, queuedOrders.length]);

  const recentLogs = useMemo(() => logEntries.slice(0, 5), [logEntries]);

  const handleExport = useCallback(
    (format: 'json' | 'csv') => {
      if (logEntries.length === 0) return;

      const timestamp = new Date().toISOString().replace(/[:]/g, '-');
      const triggerDownload = (content: string, mime: string, extension: string) => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mas-offline-support-logs-${timestamp}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      if (format === 'json') {
        const payload = logEntries.map(entry => ({
          ...entry,
          timestamp: entry.timestamp.toISOString()
        }));
        triggerDownload(JSON.stringify(payload, null, 2), 'application/json', 'json');
        return;
      }

      const headers = ['timestamp', 'level', 'message', 'context'];
      const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
      const rows = logEntries.map(entry => [
        entry.timestamp.toISOString(),
        entry.level,
        entry.message,
        entry.context ? JSON.stringify(entry.context) : ''
      ]);
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => escapeCsv(String(cell))).join(','))
      ].join('\n');

      triggerDownload(csv, 'text/csv', 'csv');
    },
    [logEntries]
  );

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
              {themeModes.map(item => (
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
                  onChange={event =>
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
                  onChange={event =>
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
                {paperSurfaces.map(surface => {
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

          <Card className="space-y-6 lg:col-span-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Offline Sync & Diagnostics</h2>
                <p className="text-muted text-sm max-w-xl">
                  Monitor queued orders, cache freshness, and export support logs for troubleshooting
                  with our support team.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('json')}
                  disabled={logEntries.length === 0}
                >
                  <Download size={16} />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  disabled={logEntries.length === 0}
                >
                  <FileText size={16} />
                  Download CSV
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                <p className="text-sm font-medium text-ink">Queued Orders</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{queuedOrders.length}</p>
                <p className="text-xs text-muted">
                  Orders held offline until a successful sync completes.
                </p>
              </div>
              <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                <p className="text-sm font-medium text-ink">Last Catalog Sync</p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  {lastSyncTime ? formatRelativeTime(lastSyncTime) : 'Not recorded'}
                </p>
                {lastSyncTime && (
                  <p className="text-xs text-muted">{formatDateTime(lastSyncTime)}</p>
                )}
              </div>
              <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                <p className="text-sm font-medium text-ink">Sync Status</p>
                <p className={`mt-2 text-lg font-semibold ${syncStatus.tone}`}>
                  {syncStatus.label}
                </p>
                <p className="text-xs text-muted">{syncStatus.description}</p>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div
                    key={`${warning.message}-${index}`}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                      warning.level === 'danger'
                        ? 'border-danger/30 bg-danger/5 text-danger'
                        : 'border-warning/30 bg-warning/5 text-warning'
                    }`}
                    role="alert"
                  >
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{warning.message}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium text-ink">Queued order details</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => syncQueuedOrders()}
                  disabled={queuedOrders.length === 0 || syncInProgress}
                >
                  <RefreshCw
                    size={16}
                    className={syncInProgress ? 'animate-spin' : undefined}
                  />
                  {syncInProgress ? 'Syncing…' : 'Retry sync'}
                </Button>
              </div>

              <div className="rounded-lg border border-line overflow-hidden">
                <div className="hidden sm:grid sm:grid-cols-4 bg-surface-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  <span>Order</span>
                  <span>Type</span>
                  <span>Total</span>
                  <span>Created</span>
                </div>
                {queuedOrders.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted text-center">
                    Queue is empty. Orders will appear here when processed offline.
                  </p>
                ) : (
                  <div className="divide-y divide-line/60">
                    {queuedOrders.map(order => {
                      const createdAt =
                        order.createdAt instanceof Date
                          ? order.createdAt
                          : new Date(order.createdAt);

                      return (
                        <div
                          key={order.id}
                          className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-4"
                        >
                          <div>
                            <p className="font-medium text-primary-600">{order.id}</p>
                            <p className="text-xs text-muted sm:hidden">
                              {toTitleCase(order.type)}
                            </p>
                          </div>
                          <div className="hidden sm:block text-sm text-muted">
                            {toTitleCase(order.type)}
                          </div>
                          <div className="font-medium text-ink">{formatCurrency(order.total)}</div>
                          <div className="text-xs text-muted">
                            <span className="block">{formatRelativeTime(createdAt)}</span>
                            <span className="block text-[11px] text-muted/80">
                              {formatDateTime(createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium text-ink">Recent support logs</h3>
                <span className="text-xs text-muted">
                  Showing {Math.min(recentLogs.length, 5)} of {logEntries.length}
                </span>
              </div>

              <div className="rounded-lg border border-line bg-surface-100">
                {recentLogs.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted text-center">
                    Support logs will populate automatically as offline events occur.
                  </p>
                ) : (
                  <div className="divide-y divide-line/60">
                    {recentLogs.map(entry => (
                      <div key={entry.id} className="px-4 py-3 text-sm">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span
                            className={`font-medium ${
                              entry.level === 'error'
                                ? 'text-danger'
                                : entry.level === 'warning'
                                  ? 'text-warning'
                                  : 'text-ink'
                            }`}
                          >
                            {entry.message}
                          </span>
                          <span className="text-xs text-muted">
                            {formatRelativeTime(entry.timestamp)}
                          </span>
                        </div>
                        {entry.context && (
                          <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-surface-200/60 p-2 text-xs text-muted">
                            {JSON.stringify(entry.context, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
            {[1, 2, 3].map(item => (
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

