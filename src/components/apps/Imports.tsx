import React from 'react';
import { Upload, FileCog, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button, Input } from '@mas/ui';
import { FormField } from '../ui/FormField';
import { useToast } from '../../providers/UXProvider';
import Skeleton from '../ui/Skeleton';

const templates = [
  { id: 'products', name: 'Products & Variants', columns: 18, updated: 'Sep 20, 2025' },
  { id: 'customers', name: 'Customers & Loyalty', columns: 12, updated: 'Sep 15, 2025' },
  { id: 'inventory', name: 'Stock Count', columns: 10, updated: 'Sep 18, 2025' }
];

const recentImports = [
  { id: 'IMPORT-204', template: 'Products & Variants', status: 'Completed', rows: 128, issues: 3 },
  { id: 'IMPORT-205', template: 'Stock Count', status: 'Needs Review', rows: 64, issues: 6 }
];

const statusStyles: Record<string, string> = {
  Completed: 'bg-success/10 text-success',
  'Needs Review': 'bg-warning/10 text-warning'
};

export const Imports: React.FC = () => {
  const { showToast } = useToast();

  const handleDryRun = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showToast({
      tone: 'info',
      title: 'Dry run started',
      description: 'We are validating your CSV. You will be notified when the check completes.'
    });
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="heading-md">Data Imports</h1>
            <p className="body-md text-muted">
              Upload CSV templates, validate in a dry-run, and commit changes confidently.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FileCog size={16} />
              Download Template
            </Button>
            <Button size="sm" className="gap-2">
              <Upload size={16} />
              Upload CSV
            </Button>
          </div>
        </header>

        <Card className="space-y-5 p-6">
          <div>
            <h2 className="heading-xs">Start a dry run</h2>
            <p className="body-sm text-muted">
              Point to your CSV and we&apos;ll validate rows without committing changes yet.
            </p>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleDryRun}>
            <FormField label="Template" htmlFor="import-template" helper="Select the template that matches your file." required>
              <Input
                id="import-template"
                list="template-suggestions"
                placeholder="Products & Variants"
                required
              />
              <datalist id="template-suggestions">
                {templates.map((template) => (
                  <option key={template.id} value={template.name} />
                ))}
              </datalist>
            </FormField>

            <FormField label="Notification email" htmlFor="import-email" helper="We&apos;ll email the validation report." required>
              <Input
                id="import-email"
                type="email"
                placeholder="you@company.com"
                required
              />
            </FormField>

            <div className="md:col-span-2">
              <Button type="submit" size="md" className="gap-2">
                <Upload size={16} />
                Run validation
              </Button>
            </div>
          </form>
        </Card>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-5 space-y-2">
              <p className="body-sm font-medium text-ink">{template.name}</p>
              <p className="body-sm text-muted">{template.columns} columns • Updated {template.updated}</p>
              <Button variant="ghost" size="sm" className="w-full">
                Preview Template
              </Button>
            </Card>
          ))}
        </section>

        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="heading-xs">Recent Imports</h2>
            <Button variant="ghost" size="sm">
              View History
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-line/80">
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-surface-100/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Import</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Template</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Rows</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Issues</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {recentImports.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface-100/70">
                    <td className="px-4 py-3 body-sm font-medium text-ink">{item.id}</td>
                    <td className="px-4 py-3 body-sm text-muted">{item.template}</td>
                    <td className="px-4 py-3 body-sm text-muted">{item.rows}</td>
                    <td className="px-4 py-3 body-sm text-warning">{item.issues}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center justify-end gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                      >
                        {item.status === 'Completed' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="heading-xs mb-3">Upcoming import jobs</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-20 rounded-2xl" />
            ))}
          </div>
        </Card>
      </div>
    </MotionWrapper>
  );
};
