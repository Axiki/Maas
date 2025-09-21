import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Info,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { MotionWrapper } from '../../ui/MotionWrapper';
import { ImportUploadZone } from '../../ui/imports/ImportUploadZone';
import {
  ImportColumnMapper,
  ImportColumnMapperProps,
  ImportSourceColumn,
  ImportTargetField,
} from '../../ui/imports/ImportColumnMapper';

interface ValidationIssue {
  id: string;
  row: number;
  field: string;
  message: string;
  hint?: string;
  type: 'error' | 'warning';
}

interface ValidationResponse {
  summary: {
    totalRows: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
    lastUpdated: string;
  };
  issues: ValidationIssue[];
  samples: Array<{
    row: number;
    status: 'valid' | 'warning' | 'error';
    values: Record<string, string>;
    message?: string;
  }>;
}

const TARGET_FIELDS: ImportTargetField[] = [
  {
    id: 'name',
    label: 'Product name',
    description: 'Displayed name for menus and order screens.',
    example: 'House Salad',
    required: true,
  },
  {
    id: 'sku',
    label: 'SKU / PLU',
    description: 'Unique identifier used for reporting and kitchen routing.',
    example: 'HS-001',
    required: true,
  },
  {
    id: 'category',
    label: 'Category',
    description: 'Groups products for menus, taxes, and analytics.',
    example: 'Starters',
    required: true,
  },
  {
    id: 'price',
    label: 'Price',
    description: 'Base price before discounts.',
    example: '12.50',
    required: true,
  },
  {
    id: 'cost',
    label: 'Cost',
    description: 'Optional cost of goods for profit analysis.',
    example: '4.20',
  },
  {
    id: 'stock',
    label: 'On hand stock',
    description: 'Quantity available for tracking inventory.',
    example: '45',
  },
  {
    id: 'status',
    label: 'Status',
    description: 'Determines if the product is active in menus.',
    example: 'active',
  },
];

const SOURCE_COLUMNS: ImportSourceColumn[] = [
  { id: 'product_name', label: 'Product Name', sample: 'House Salad' },
  { id: 'plu', label: 'PLU', sample: 'HS-001' },
  { id: 'category_name', label: 'Category Name', sample: 'Starters' },
  { id: 'base_price', label: 'Base Price', sample: '12.50' },
  { id: 'cost_basis', label: 'Cost Basis', sample: '4.20' },
  { id: 'quantity_on_hand', label: 'Quantity On Hand', sample: '45' },
  { id: 'visibility', label: 'Visibility', sample: 'Active' },
];

const VALIDATION_MOCK: ValidationResponse = {
  summary: {
    totalRows: 120,
    passed: 112,
    failed: 5,
    warnings: 3,
    skipped: 0,
    lastUpdated: 'moments ago',
  },
  issues: [
    {
      id: 'row-18-price',
      row: 18,
      field: 'Price',
      message: 'Missing price value. Rows with empty prices cannot be imported.',
      hint: 'Verify the spreadsheet includes a numeric value for each product price.',
      type: 'error',
    },
    {
      id: 'row-42-stock',
      row: 42,
      field: 'On hand stock',
      message: 'Quantity appears unusually high (4,500 units).',
      hint: 'Confirm the value or adjust to the correct inventory count.',
      type: 'warning',
    },
    {
      id: 'row-87-category',
      row: 87,
      field: 'Category',
      message: 'Category “Seasonal Drinks” does not exist. It will be mapped to “Beverages”.',
      hint: 'Create the category before importing if this mapping is incorrect.',
      type: 'warning',
    },
  ],
  samples: [
    {
      row: 6,
      status: 'valid',
      values: {
        name: 'Garlic Knots',
        sku: 'GN-006',
        price: '5.00',
      },
      message: 'Ready to import.',
    },
    {
      row: 18,
      status: 'error',
      values: {
        name: 'Mushroom Risotto',
        sku: 'MR-018',
        price: '-',
      },
      message: 'Price missing. Row blocked until resolved.',
    },
    {
      row: 42,
      status: 'warning',
      values: {
        name: 'Holiday Blend Beans',
        sku: 'HB-042',
        price: '24.00',
      },
      message: 'Flagged for review due to high stock value.',
    },
  ],
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const createEmptyMapping = (fields: ImportTargetField[]): Record<string, string | null> => {
  return fields.reduce<Record<string, string | null>>((accumulator, field) => {
    accumulator[field.id] = null;
    return accumulator;
  }, {});
};

type StepId = 'upload' | 'mapping' | 'validation' | 'review';

const steps: Array<{ id: StepId; title: string; description: string }> = [
  { id: 'upload', title: 'Upload', description: 'Bring in your spreadsheet or CSV export.' },
  { id: 'mapping', title: 'Map columns', description: 'Connect spreadsheet columns to destination fields.' },
  { id: 'validation', title: 'Validate', description: 'Run data checks to catch potential issues.' },
  { id: 'review', title: 'Review', description: 'Confirm settings and start the import.' },
];

export const ImportWizard: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [mapping, setMapping] = React.useState<Record<string, string | null>>(() => createEmptyMapping(TARGET_FIELDS));
  const [validationStatus, setValidationStatus] = React.useState<'idle' | 'running' | 'succeeded'>('idle');
  const [validationState, setValidationState] = React.useState<ValidationResponse | null>(null);
  const [resolvedIssues, setResolvedIssues] = React.useState<Set<string>>(() => new Set());
  const [acknowledgeWarnings, setAcknowledgeWarnings] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importComplete, setImportComplete] = React.useState(false);

  const handleMappingChange: ImportColumnMapperProps['onChange'] = React.useCallback((fieldId, columnId) => {
    setMapping((previous) => ({ ...previous, [fieldId]: columnId }));
    setValidationStatus('idle');
    setValidationState(null);
    setResolvedIssues(new Set());
  }, []);

  const handleAutoMap = React.useCallback(() => {
    const aliases: Record<string, string[]> = {
      name: ['productname', 'itemname', 'menuitem'],
      sku: ['sku', 'plu', 'code'],
      category: ['category', 'department', 'group'],
      price: ['price', 'baseprice', 'amount'],
      cost: ['cost', 'cog', 'costbasis'],
      stock: ['stock', 'quantity', 'quantityonhand'],
      status: ['status', 'visibility', 'active'],
    };

    const normalizedColumns = SOURCE_COLUMNS.reduce<Record<string, string>>((accumulator, column) => {
      accumulator[normalize(column.label)] = column.id;
      return accumulator;
    }, {});

    setMapping((previous) => {
      const next = { ...previous };

      TARGET_FIELDS.forEach((field) => {
        if (next[field.id]) {
          return;
        }

        const candidates = [normalize(field.label), ...(aliases[field.id] ?? [])];
        const match = candidates.find((candidate) => normalizedColumns[candidate]);

        if (match) {
          next[field.id] = normalizedColumns[match];
        }
      });

      return next;
    });
  }, []);

  const resetWizardState = React.useCallback(() => {
    setActiveStep(0);
    setMapping(createEmptyMapping(TARGET_FIELDS));
    setValidationStatus('idle');
    setValidationState(null);
    setResolvedIssues(new Set());
    setAcknowledgeWarnings(false);
    setIsImporting(false);
    setImportComplete(false);
  }, []);

  const handleFileSelect = React.useCallback((selectedFile: File) => {
    const allowedExtensions = ['csv', 'xlsx'];
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      setUploadError('Unsupported file type. Upload a CSV or Excel file.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    setTimeout(() => {
      setFile(selectedFile);
      setIsUploading(false);
      resetWizardState();
      handleAutoMap();
    }, 600);
  }, [handleAutoMap, resetWizardState]);

  const handleRemoveFile = React.useCallback(() => {
    setFile(null);
    setUploadError(null);
    resetWizardState();
  }, [resetWizardState]);

  const runValidation = React.useCallback(() => {
    setValidationStatus('running');
    setResolvedIssues(new Set());

    setTimeout(() => {
      setValidationState(VALIDATION_MOCK);
      setValidationStatus('succeeded');
    }, 800);
  }, []);

  const handleResolveIssue = React.useCallback((issueId: string) => {
    setResolvedIssues((previous) => new Set(previous).add(issueId));
  }, []);

  const outstandingIssues = React.useMemo(() => {
    if (!validationState) {
      return [] as ValidationIssue[];
    }

    return validationState.issues.filter((issue) => !resolvedIssues.has(issue.id));
  }, [resolvedIssues, validationState]);

  const blockingIssues = React.useMemo(() => {
    return outstandingIssues.filter((issue) => issue.type === 'error');
  }, [outstandingIssues]);

  const outstandingWarnings = React.useMemo(() => {
    return outstandingIssues.filter((issue) => issue.type === 'warning');
  }, [outstandingIssues]);

  const mappingErrors = React.useMemo(() => {
    const errors: Record<string, string> = {};
    const assignments: Record<string, string> = {};
    const fieldById = TARGET_FIELDS.reduce<Record<string, ImportTargetField>>((accumulator, field) => {
      accumulator[field.id] = field;
      return accumulator;
    }, {});

    TARGET_FIELDS.forEach((field) => {
      const selectedColumn = mapping[field.id];

      if (field.required && !selectedColumn) {
        errors[field.id] = 'Map a source column before proceeding.';
        return;
      }

      if (selectedColumn) {
        if (assignments[selectedColumn]) {
          const conflictField = assignments[selectedColumn];
          errors[field.id] = `Already assigned to ${fieldById[conflictField].label}.`;
          errors[conflictField] = `Already assigned to ${field.label}.`;
        } else {
          assignments[selectedColumn] = field.id;
        }
      }
    });

    return errors;
  }, [mapping]);

  const requiredMapped = React.useMemo(() => {
    return TARGET_FIELDS.filter((field) => field.required).every((field) => Boolean(mapping[field.id]));
  }, [mapping]);

  const stepCompleted = React.useMemo(() => {
    return {
      upload: Boolean(file),
      mapping: Boolean(file) && requiredMapped && Object.keys(mappingErrors).length === 0,
      validation: validationStatus === 'succeeded' && blockingIssues.length === 0,
      review: importComplete,
    } satisfies Record<StepId, boolean>;
  }, [file, requiredMapped, mappingErrors, validationStatus, blockingIssues.length, importComplete]);

  const canGoNext = React.useMemo(() => {
    if (activeStep === 0) {
      return Boolean(file) && !isUploading;
    }

    if (activeStep === 1) {
      return stepCompleted.mapping;
    }

    if (activeStep === 2) {
      return validationStatus === 'succeeded' && blockingIssues.length === 0;
    }

    if (activeStep === 3) {
      if (importComplete) {
        return false;
      }

      if (outstandingWarnings.length > 0) {
        return acknowledgeWarnings && !isImporting;
      }

      return !isImporting;
    }

    return false;
  }, [activeStep, acknowledgeWarnings, blockingIssues.length, file, importComplete, isImporting, isUploading, outstandingWarnings.length, stepCompleted.mapping, validationStatus]);

  const handleBack = () => {
    setActiveStep((previous) => Math.max(previous - 1, 0));
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setIsImporting(true);
      setTimeout(() => {
        setIsImporting(false);
        setImportComplete(true);
      }, 1000);
      return;
    }

    setActiveStep((previous) => Math.min(previous + 1, steps.length - 1));
  };

  const primaryButtonLabel = React.useMemo(() => {
    if (activeStep === steps.length - 1) {
      if (importComplete) {
        return 'Import completed';
      }
      if (isImporting) {
        return 'Importing…';
      }
      return 'Start import';
    }

    return 'Next';
  }, [activeStep, importComplete, isImporting]);

  const renderStepper = () => (
    <div className="grid gap-4 md:grid-cols-4">
      {steps.map((step, index) => {
        const status = stepCompleted[step.id]
          ? 'complete'
          : index === activeStep
          ? 'current'
          : 'upcoming';

        return (
          <div
            key={step.id}
            className={`rounded-xl border px-4 py-3 transition-colors ${
              status === 'complete'
                ? 'border-success/40 bg-success/10'
                : status === 'current'
                ? 'border-primary-200 bg-primary-100/40'
                : 'border-line bg-surface-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                  status === 'complete'
                    ? 'border-success/40 bg-success text-white'
                    : status === 'current'
                    ? 'border-primary-200 bg-white text-primary-600'
                    : 'border-line bg-white text-muted'
                }`}
              >
                {status === 'complete' ? <Check className="h-5 w-5" /> : index + 1}
              </div>

              <div>
                <p className="text-sm font-semibold text-ink">{step.title}</p>
                <p className="text-xs text-muted">{step.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface-100/60 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-ink">Upload your data file</h2>
          <p className="text-sm text-muted">
            Accepts CSV or Excel exports from your catalog system. We never import data automatically without your
            confirmation.
          </p>
        </div>

        <ImportUploadZone
          file={file}
          error={uploadError ?? undefined}
          helperText="We recommend keeping file sizes under 10MB for faster validation."
          isUploading={isUploading}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-100/60 p-5">
          <h3 className="text-sm font-semibold text-ink">Tips for a clean import</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>• Remove summary rows or totals so we only import product lines.</li>
            <li>• Ensure column headers are on the first row of your file.</li>
            <li>• Dates and numbers should be formatted consistently.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-surface-100/60 p-5">
          <h3 className="text-sm font-semibold text-ink">Need a template?</h3>
          <p className="mt-2 text-sm text-muted">
            Download the import template to see required columns and sample data formatting.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-600 transition hover:bg-primary-100/50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Download template
          </button>
        </div>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="rounded-xl border border-line bg-surface-100/70 p-6">
      <ImportColumnMapper
        sourceColumns={SOURCE_COLUMNS}
        targetFields={TARGET_FIELDS}
        mapping={mapping}
        errors={mappingErrors}
        onChange={handleMappingChange}
        onAutoMap={handleAutoMap}
      />
    </div>
  );

  const renderValidationStep = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-100/70 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Validate data quality</h3>
          <p className="text-sm text-muted">
            We check required fields, number formatting, duplicates, and category availability before importing.
          </p>
        </div>

        <button
          type="button"
          onClick={runValidation}
          disabled={validationStatus === 'running'}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {validationStatus === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {validationStatus === 'idle' ? 'Run validation' : 'Re-run validation'}
        </button>
      </div>

      {validationStatus === 'idle' && !validationState && (
        <div className="rounded-xl border border-dashed border-line bg-surface-100/60 p-6 text-sm text-muted">
          Run validation to generate a quality report. We create a mock response in this demo so you can preview the workflow.
        </div>
      )}

      {validationStatus === 'running' && (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-100/70 p-5 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
          Checking column formats, required values, and duplicates...
        </div>
      )}

      {validationState && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-line bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total rows</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{validationState.summary.totalRows}</p>
            </div>
            <div className="rounded-lg border border-line bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Passed</p>
              <p className="mt-2 text-2xl font-semibold text-success">{validationState.summary.passed}</p>
            </div>
            <div className="rounded-lg border border-line bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Warnings</p>
              <p className="mt-2 text-2xl font-semibold text-warning">{validationState.summary.warnings}</p>
            </div>
            <div className="rounded-lg border border-line bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Blocked</p>
              <p className="mt-2 text-2xl font-semibold text-danger">{validationState.summary.failed}</p>
            </div>
          </div>

          {outstandingIssues.length > 0 ? (
            <div className="space-y-3">
              {outstandingIssues.map((issue) => {
                const isError = issue.type === 'error';
                return (
                  <div
                    key={issue.id}
                    className={`rounded-xl border px-4 py-3 ${
                      isError
                        ? 'border-danger/50 bg-danger/10 text-danger'
                        : 'border-warning/40 bg-warning/10 text-warning'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        {isError ? (
                          <AlertCircle className="mt-0.5 h-5 w-5" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-5 w-5" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-ink">Row {issue.row} • {issue.field}</p>
                          <p className="mt-1 text-sm">{issue.message}</p>
                          {issue.hint && <p className="mt-2 text-xs text-ink/80">{issue.hint}</p>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleResolveIssue(issue.id)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          isError
                            ? 'border-danger/40 text-danger hover:bg-danger/20'
                            : 'border-warning/40 text-warning hover:bg-warning/20'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark resolved
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="h-5 w-5" />
              No outstanding validation issues. You are ready to proceed.
            </div>
          )}

          <div className="rounded-xl border border-line overflow-hidden">
            <div className="bg-surface-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Sample rows
            </div>
            {validationState.samples.map((sample) => (
              <div
                key={sample.row}
                className="flex flex-col gap-3 border-t border-line/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">Row {sample.row}</p>
                  <p className="mt-1 text-xs text-muted">{sample.message}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted">
                  {Object.entries(sample.values).map(([key, value]) => (
                    <span key={key} className="rounded-full bg-surface-200 px-3 py-1 font-medium text-ink">
                      {key}: {value}
                    </span>
                  ))}
                </div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    sample.status === 'valid'
                      ? 'bg-success/10 text-success'
                      : sample.status === 'warning'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  {sample.status === 'valid' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : sample.status === 'warning' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {sample.status}
                </div>
              </div>
            ))}
          </div>

          {blockingIssues.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Resolve blocking errors before continuing. Adjust column mappings or update the source data, then re-run validation.
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface-100/70 p-6">
        <h3 className="text-lg font-semibold text-ink">Review import summary</h3>
        <p className="text-sm text-muted">Confirm everything looks good before we write data to your catalog.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">File selected</p>
            {file ? (
              <div className="mt-2 text-sm text-ink">
                <p className="font-semibold">{file.name}</p>
                <p className="text-muted">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">No file selected.</p>
            )}
          </div>

          <div className="rounded-lg border border-line bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Validation status</p>
            {validationStatus === 'succeeded' ? (
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" /> Ready for import
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">Run validation to confirm data quality.</p>
            )}
            {outstandingWarnings.length > 0 && (
              <p className="mt-2 text-xs text-warning">
                {outstandingWarnings.length} warning{outstandingWarnings.length === 1 ? '' : 's'} will be acknowledged.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Column mapping</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TARGET_FIELDS.map((field) => {
              const columnId = mapping[field.id];
              const column = SOURCE_COLUMNS.find((source) => source.id === columnId);

              return (
                <div key={field.id} className="rounded-lg border border-line bg-white/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{field.label}</p>
                  <p className="mt-1 text-sm font-medium text-ink">{column ? column.label : 'Not mapped'}</p>
                </div>
              );
            })}
          </div>
        </div>

        {outstandingWarnings.length > 0 && (
          <label className="mt-6 flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-warning">
            <input
              type="checkbox"
              checked={acknowledgeWarnings}
              onChange={(event) => setAcknowledgeWarnings(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-warning/60 text-warning focus:ring-warning"
            />
            <span>
              I understand that {outstandingWarnings.length} warning{outstandingWarnings.length === 1 ? '' : 's'} remain and want to
              continue with the import.
            </span>
          </label>
        )}

        {importComplete && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-success"
          >
            <CheckCircle2 className="h-5 w-5" /> Import complete. You can review newly created items in the product catalog.
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Data imports</p>
          <h1 className="text-3xl font-bold text-ink">Catalog import wizard</h1>
          <p className="text-muted">
            Step through the guided flow to upload a spreadsheet, map columns, validate quality, and review changes before
            writing to your workspace.
          </p>
        </div>

        {renderStepper()}

        <div className="rounded-2xl border border-line bg-surface-100/70 p-6">
          {activeStep === 0 && renderUploadStep()}
          {activeStep === 1 && renderMappingStep()}
          {activeStep === 2 && renderValidationStep()}
          {activeStep === 3 && renderReviewStep()}

          <div className="mt-8 flex flex-col gap-3 border-t border-line/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Info className="h-4 w-4" />
              {activeStep < 3 ? 'You can revisit previous steps at any time.' : 'Confirmed data is written to your catalog instantly.'}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={activeStep === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activeStep === steps.length - 1 ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {primaryButtonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
};
