import React from 'react';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export interface ImportSourceColumn {
  id: string;
  label: string;
  sample?: string;
}

export interface ImportTargetField {
  id: string;
  label: string;
  description?: string;
  example?: string;
  required?: boolean;
}

export interface ImportColumnMapperProps {
  sourceColumns: ImportSourceColumn[];
  targetFields: ImportTargetField[];
  mapping: Record<string, string | null>;
  errors?: Record<string, string | undefined>;
  onChange: (fieldId: string, columnId: string | null) => void;
  onAutoMap?: () => void;
}

export const ImportColumnMapper: React.FC<ImportColumnMapperProps> = ({
  errors,
  mapping,
  onAutoMap,
  onChange,
  sourceColumns,
  targetFields,
}) => {
  const hasErrors = errors && Object.values(errors).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Map columns to data fields</h3>
          <p className="text-sm text-muted">
            Pair each destination field with a column from your uploaded file. Required fields must be mapped
            before continuing.
          </p>
        </div>

        {onAutoMap && (
          <button
            type="button"
            onClick={onAutoMap}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-line bg-surface-100 px-4 py-2 text-sm font-medium text-ink hover:border-primary-200 hover:text-primary-600 transition"
          >
            <Sparkles className="h-4 w-4" />
            Auto match columns
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-line">
        <div className="hidden bg-surface-200 px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink/70 sm:grid sm:grid-cols-12">
          <span className="col-span-4">Destination field</span>
          <span className="col-span-4">Source column</span>
          <span className="col-span-4">Sample data</span>
        </div>

        <div className="divide-y divide-line/60">
          {targetFields.map((field) => {
            const selectedColumnId = mapping[field.id] ?? '';
            const selectedColumn = sourceColumns.find((column) => column.id === selectedColumnId);
            const error = errors?.[field.id];

            return (
              <div
                key={field.id}
                className="flex flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-12 sm:items-center"
              >
                <div className="sm:col-span-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-ink">{field.label}</p>
                    {field.required && (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-danger">
                        Required
                      </span>
                    )}
                    {!field.required && selectedColumn && (
                      <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                    )}
                  </div>
                  {field.description && <p className="mt-1 text-xs text-muted">{field.description}</p>}
                  {field.example && (
                    <p className="mt-1 text-xs text-muted">
                      Example: <span className="text-ink font-medium">{field.example}</span>
                    </p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label className="sr-only" htmlFor={`mapper-${field.id}`}>
                    Select column for {field.label}
                  </label>
                  <select
                    id={`mapper-${field.id}`}
                    value={selectedColumnId}
                    onChange={(event) => onChange(field.id, event.target.value || null)}
                    className={`w-full rounded-lg border bg-white/80 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      error ? 'border-danger/60 text-danger' : 'border-line'
                    }`}
                  >
                    <option value="">Select a column</option>
                    {sourceColumns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-lg bg-surface-100 p-3 text-xs text-muted sm:col-span-4">
                  {selectedColumn?.sample ? (
                    <>
                      <p className="font-medium text-ink">{selectedColumn.label}</p>
                      <p className="mt-1 text-xs text-muted">Sample: {selectedColumn.sample}</p>
                    </>
                  ) : (
                    <p className="text-muted">No sample available</p>
                  )}
                </div>

                {error && (
                  <div className="sm:col-span-12">
                    <div className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {hasErrors && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>Resolve the highlighted issues to continue.</span>
        </div>
      )}
    </div>
  );
};
