import React from 'react';
import { Monitor, Printer, Wifi, RefreshCw, Plus } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';
import { useDialog, useToast } from '../../providers/UXProvider';

const registers = [
  { id: 'reg-01', name: 'Front Counter', store: 'Flagship', status: 'Online', version: '2.3.1' },
  { id: 'reg-02', name: 'Bar POS', store: 'Flagship', status: 'Attention', version: '2.3.1' }
];

const printers = [
  { id: 'print-01', name: 'Kitchen Printer', location: 'Kitchen', status: 'Online' },
  { id: 'print-02', name: 'Bar Receipt Printer', location: 'Bar', status: 'Paper Low' }
];

export const Devices: React.FC = () => {
  const { confirm } = useDialog();
  const { showToast } = useToast();

  const handleDiagnostics = async () => {
    const approved = await confirm({
      title: 'Run diagnostics now?',
      description: 'All paired devices will be pinged. Printing may pause for a few seconds.',
      confirmLabel: 'Run diagnostics'
    });

    if (approved) {
      showToast({
        tone: 'info',
        title: 'Diagnostics started',
        description: 'We will notify you when the results are ready.',
        duration: 6000
      });
    }
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="heading-md">Devices & Diagnostics</h1>
            <p className="body-md text-muted">Registers, printers, scanners, and connection health at a glance.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDiagnostics}>
              <RefreshCw size={16} />
              Run Diagnostics
            </Button>
            <Button size="sm" className="gap-2">
              <Plus size={16} />
              Pair Device
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-600">
                <Monitor size={18} />
                <h2 className="heading-xs">Registered Terminals</h2>
              </div>
              <Button variant="ghost" size="sm">Manage</Button>
            </div>
            <ul className="space-y-3">
              {registers.map((register) => (
                <li key={register.id} className="rounded-lg border border-line/70 bg-surface-100 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="body-sm font-semibold text-ink">{register.name}</p>
                      <p className="body-xs text-muted">{register.store}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        register.status === 'Online'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      <Wifi size={14} />
                      {register.status}
                    </span>
                  </div>
                  <p className="mt-2 body-xs text-muted">Running MAS POS {register.version}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-600">
                <Printer size={18} />
                <h2 className="heading-xs">Printers</h2>
              </div>
              <Button variant="ghost" size="sm">Test Print</Button>
            </div>
            <ul className="space-y-3">
              {printers.map((printer) => (
                <li key={printer.id} className="rounded-lg border border-line/70 bg-surface-100 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="body-sm font-semibold text-ink">{printer.name}</p>
                      <p className="body-xs text-muted">{printer.location}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        printer.status === 'Online'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {printer.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </MotionWrapper>
  );
};
