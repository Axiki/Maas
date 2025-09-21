import React from 'react';
import { cn } from '../../utils';

export interface DataTableColumn<T> {
  header: string;
  key?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  getRowId?: (item: T, index: number) => string;
  emptyState?: {
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  onRowClick?: (item: T) => void;
  scrollContainerClassName?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  emptyState,
  onRowClick,
  scrollContainerClassName,
  className,
}: DataTableProps<T>) {
  const resolveRowId = React.useCallback(
    (item: T, index: number) => {
      if (getRowId) {
        return getRowId(item, index);
      }
      return `row-${index}`;
    },
    [getRowId]
  );

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-line/70 bg-surface-100 shadow-card',
        className
      )}
    >
      <div className={cn('max-h-[540px] overflow-auto', scrollContainerClassName)}>
        <table className="min-w-full border-collapse text-left" role="grid">
          <thead>
            <tr className="sticky top-0 z-20 bg-surface-200/95 text-xs uppercase tracking-wide text-muted">
              {columns.map((column, columnIndex) => (
                <th
                  key={`${column.header}-${columnIndex}`}
                  scope="col"
                  className={cn(
                    'border-b border-line/70 px-4 py-3 font-medium backdrop-blur',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.headerClassName
                  )}
                >
                  <span className="whitespace-nowrap">{column.header}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-muted"
                >
                  <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-200 text-muted">
                      <span className="text-lg" aria-hidden="true">
                        —
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-ink">{emptyState?.title ?? 'No results found'}</p>
                      {emptyState?.description ? (
                        <p className="mt-1 text-sm text-muted">{emptyState.description}</p>
                      ) : null}
                    </div>
                    {emptyState?.action}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={resolveRowId(item, rowIndex)}
                  className={cn(
                    'border-b border-line/60 text-sm text-ink transition-colors odd:bg-ink/5 even:bg-surface-100 hover:bg-primary-100/40',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column, columnIndex) => {
                    const cellContent = column.render
                      ? column.render(item)
                      : column.key
                        ? ((item as Record<string, unknown>)[column.key as string] as React.ReactNode)
                        : null;

                    return (
                      <td
                        key={`${resolveRowId(item, rowIndex)}-${columnIndex}`}
                        className={cn(
                          'px-4 py-4 align-middle text-sm text-ink/90',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.className
                        )}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
