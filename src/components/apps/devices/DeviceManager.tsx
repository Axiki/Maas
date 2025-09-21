import React, { useCallback, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  type LucideIcon,
  Printer,
  CreditCard,
  MonitorSmartphone,
  Archive,
  WifiOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { MotionWrapper } from '../../ui/MotionWrapper';
import { StatusIndicator } from '../../ui/StatusIndicator';
import { useAuthStore } from '../../../stores/authStore';

type DeviceStatus = 'online' | 'offline' | 'testing' | 'error';
type DeviceActionType = 'printer-test' | 'open-drawer' | 'ping';

interface DeviceAction {
  type: DeviceActionType;
}

interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  ipAddress: string;
  icon: LucideIcon;
  status: DeviceStatus;
  lastChecked: Date | null;
  lastResult: string;
  actions: DeviceAction[];
}

interface DiagnosticLog {
  id: string;
  deviceId: string;
  deviceName: string;
  action: DeviceActionType;
  success: boolean;
  timestamp: Date;
  message: string;
}

const actionMessages: Record<DeviceActionType, {
  label: string;
  running: string;
  success: string;
  failure: string;
}> = {
  'printer-test': {
    label: 'Run Test Print',
    running: 'Sending sample receipt…',
    success: 'Receipt printed successfully.',
    failure: 'Printer did not respond to the test print.'
  },
  'open-drawer': {
    label: 'Open Cash Drawer',
    running: 'Triggering drawer release…',
    success: 'Cash drawer opened successfully.',
    failure: 'Drawer failed to respond to the open command.'
  },
  ping: {
    label: 'Check Status',
    running: 'Pinging device…',
    success: 'Device responded within acceptable latency.',
    failure: 'No response from device during ping test.'
  }
};

const actionIcons: Record<DeviceActionType, LucideIcon> = {
  'printer-test': Printer,
  'open-drawer': Archive,
  ping: RefreshCcw
};

const statusConfig: Record<DeviceStatus, {
  label: string;
  classes: string;
  icon: LucideIcon;
  iconClass?: string;
}> = {
  online: {
    label: 'Online',
    classes: 'bg-[#EE766D]/10 text-[#EE766D]',
    icon: CheckCircle2
  },
  offline: {
    label: 'Offline',
    classes: 'bg-[#D6D6D6] text-[#24242E]',
    icon: WifiOff
  },
  testing: {
    label: 'Running diagnostics',
    classes: 'bg-[#EE766D]/15 text-[#24242E]',
    icon: Loader2,
    iconClass: 'animate-spin'
  },
  error: {
    label: 'Needs attention',
    classes: 'bg-[#EE766D]/20 text-[#EE766D]',
    icon: AlertCircle
  }
};

const LOG_LIMIT = 12;

const createInitialDevices = (): Device[] => [
  {
    id: 'printer-front',
    name: 'Front Counter Printer',
    type: 'Thermal Receipt Printer',
    location: 'Front Counter',
    ipAddress: '10.0.0.24',
    icon: Printer,
    status: 'online',
    lastChecked: new Date(Date.now() - 1000 * 60 * 8),
    lastResult: 'Last test print succeeded.',
    actions: [
      { type: 'printer-test' },
      { type: 'ping' }
    ]
  },
  {
    id: 'printer-kitchen',
    name: 'Kitchen Printer',
    type: 'Impact Kitchen Printer',
    location: 'Kitchen Expo Line',
    ipAddress: '10.0.0.31',
    icon: Printer,
    status: 'online',
    lastChecked: new Date(Date.now() - 1000 * 60 * 15),
    lastResult: 'Responding normally.',
    actions: [
      { type: 'printer-test' },
      { type: 'ping' }
    ]
  },
  {
    id: 'drawer-main',
    name: 'Cash Drawer A',
    type: 'Bluetooth Cash Drawer',
    location: 'POS Station 1',
    ipAddress: 'BT-4C:12:9A',
    icon: Archive,
    status: 'online',
    lastChecked: new Date(Date.now() - 1000 * 60 * 30),
    lastResult: 'Drawer opened without errors.',
    actions: [
      { type: 'open-drawer' },
      { type: 'ping' }
    ]
  },
  {
    id: 'terminal',
    name: 'Payment Terminal',
    type: 'NFC Payment Reader',
    location: 'POS Station 1',
    ipAddress: '10.0.0.18',
    icon: CreditCard,
    status: 'online',
    lastChecked: new Date(Date.now() - 1000 * 60 * 5),
    lastResult: 'Chip and tap payments verified.',
    actions: [
      { type: 'ping' }
    ]
  },
  {
    id: 'tablet',
    name: 'Table Service Tablet',
    type: 'Android Tablet',
    location: 'Dining Room',
    ipAddress: '10.0.0.45',
    icon: MonitorSmartphone,
    status: 'online',
    lastChecked: new Date(Date.now() - 1000 * 60 * 12),
    lastResult: 'Last sync completed.',
    actions: [
      { type: 'ping' }
    ]
  }
];

export const DeviceManager: React.FC = () => {
  const { isOnline } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>(() => createInitialDevices());
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);

  const runDeviceAction = useCallback(
    async (deviceId: string, actionType: DeviceActionType) => {
      const device = devices.find((item) => item.id === deviceId);
      if (!device) return;

      if (!isOnline) {
        const offlineMessage = 'Diagnostics are unavailable while offline.';
        const timestamp = new Date();

        setDevices((prev) =>
          prev.map((entry) =>
            entry.id === deviceId
              ? {
                  ...entry,
                  status: 'offline',
                  lastChecked: timestamp,
                  lastResult: offlineMessage
                }
              : entry
          )
        );

        setLogs((prev) =>
          [
            {
              id: `${deviceId}-${timestamp.getTime()}`,
              deviceId,
              deviceName: device.name,
              action: actionType,
              success: false,
              timestamp,
              message: offlineMessage
            },
            ...prev
          ].slice(0, LOG_LIMIT)
        );
        return;
      }

      const runningMessage = actionMessages[actionType].running;

      setDevices((prev) =>
        prev.map((entry) =>
          entry.id === deviceId
            ? {
                ...entry,
                status: 'testing',
                lastResult: runningMessage
              }
            : entry
        )
      );

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const succeeded = Math.random() > 0.1;
        const resultStatus: DeviceStatus = succeeded ? 'online' : 'error';
        const message = succeeded
          ? actionMessages[actionType].success
          : actionMessages[actionType].failure;
        const completedAt = new Date();

        setDevices((prev) =>
          prev.map((entry) =>
            entry.id === deviceId
              ? {
                  ...entry,
                  status: resultStatus,
                  lastChecked: completedAt,
                  lastResult: message
                }
              : entry
          )
        );

        setLogs((prev) =>
          [
            {
              id: `${deviceId}-${completedAt.getTime()}`,
              deviceId,
              deviceName: device.name,
              action: actionType,
              success: succeeded,
              timestamp: completedAt,
              message
            },
            ...prev
          ].slice(0, LOG_LIMIT)
        );
      } catch {
        const failureMessage = 'Unexpected error while running diagnostics.';
        const failureTime = new Date();

        setDevices((prev) =>
          prev.map((entry) =>
            entry.id === deviceId
              ? {
                  ...entry,
                  status: 'error',
                  lastChecked: failureTime,
                  lastResult: failureMessage
                }
              : entry
          )
        );

        setLogs((prev) =>
          [
            {
              id: `${deviceId}-${failureTime.getTime()}`,
              deviceId,
              deviceName: device.name,
              action: actionType,
              success: false,
              timestamp: failureTime,
              message: failureMessage
            },
            ...prev
          ].slice(0, LOG_LIMIT)
        );
      }
    },
    [devices, isOnline]
  );

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#24242E]">Device Manager</h1>
            <p className="text-sm text-muted">
              Monitor device connectivity, review diagnostics, and trigger quick hardware tests.
            </p>
          </div>
          <StatusIndicator />
        </div>

        {!isOnline && (
          <Card className="border border-[#EE766D]/50 bg-[#EE766D]/10 text-[#24242E]">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-[#EE766D]/20 p-2 text-[#EE766D]">
                <WifiOff size={18} />
              </div>
              <div>
                <p className="font-semibold">You&apos;re currently offline</p>
                <p className="text-sm text-[#24242E]/80">
                  Device diagnostics will resume automatically when the connection is restored.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            {devices.map((device) => {
              const effectiveStatus: DeviceStatus = !isOnline
                ? device.status === 'error' || device.status === 'testing'
                  ? device.status
                  : 'offline'
                : device.status;
              const status = statusConfig[effectiveStatus];
              const StatusIcon = status.icon;
              const DeviceIcon = device.icon;
              const busy = effectiveStatus === 'testing';

              return (
                <MotionWrapper key={device.id} type="card">
                  <Card className="h-full border border-[#D6D6D6] bg-surface-100">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-xl bg-[#EE766D]/15 p-3 text-[#EE766D]">
                            <DeviceIcon size={24} />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-[#24242E]">{device.name}</h2>
                            <p className="text-sm text-muted">
                              {device.type} • {device.location}
                            </p>
                            <p className="text-xs text-[#24242E]/60">{device.ipAddress}</p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-sm font-medium ${status.classes}`}
                        >
                          <StatusIcon size={14} className={status.iconClass} />
                          {status.label}
                        </span>
                      </div>

                      <div className="grid gap-4 rounded-lg border border-[#D6D6D6]/60 bg-white/60 p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#24242E]/60">Last diagnostic</p>
                          <p className="text-sm font-medium text-[#24242E]">
                            {device.lastChecked
                              ? formatDistanceToNow(device.lastChecked, { addSuffix: true })
                              : 'Not yet run'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#24242E]/60">Latest result</p>
                          <p className="text-sm text-[#24242E]/80">{device.lastResult}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {device.actions.map((action) => {
                          const ActionIcon = actionIcons[action.type];
                          const label = actionMessages[action.type].label;
                          const disabled = busy || !isOnline;
                          const isPrimaryAction = action.type !== 'ping';
                          const buttonClasses = isPrimaryAction
                            ? 'bg-[#EE766D] text-white hover:bg-[#d75e54] focus-visible:ring-[#EE766D]/50 disabled:bg-[#EE766D]/50 disabled:text-white/80'
                            : 'border-[#D6D6D6] text-[#24242E] hover:bg-[#D6D6D6]/40 focus-visible:ring-[#EE766D]/40 disabled:opacity-60';

                          return (
                            <Button
                              key={`${device.id}-${action.type}`}
                              variant={isPrimaryAction ? 'primary' : 'secondary'}
                              size="sm"
                              className={buttonClasses}
                              disabled={disabled}
                              onClick={() => runDeviceAction(device.id, action.type)}
                              title={!isOnline ? 'Reconnect to run diagnostics' : undefined}
                            >
                              <ActionIcon size={16} />
                              {label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </MotionWrapper>
              );
            })}
          </div>

          <Card className="h-full border border-[#D6D6D6] bg-surface-100">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#24242E]">Diagnostics Log</h2>
                <p className="text-sm text-muted">Track the latest hardware checks and actions.</p>
              </div>

              <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-2">
                {logs.length === 0 ? (
                  <p className="text-sm text-[#24242E]/70">
                    No diagnostics have been run yet. Start a test to see updates here.
                  </p>
                ) : (
                  logs.map((log) => {
                    const Icon = log.success ? CheckCircle2 : AlertCircle;
                    const iconClasses = log.success
                      ? 'bg-[#EE766D]/20 text-[#EE766D]'
                      : 'bg-[#D6D6D6] text-[#24242E]';

                    return (
                      <div key={log.id} className="flex gap-3 rounded-lg border border-[#D6D6D6]/60 bg-white/70 p-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClasses}`}>
                          <Icon size={18} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[#24242E]">
                            {actionMessages[log.action].label}
                          </p>
                          <p className="text-xs text-muted">
                            {log.deviceName} • {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                          </p>
                          <p className="text-sm text-[#24242E]/80">{log.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MotionWrapper>
  );
};
