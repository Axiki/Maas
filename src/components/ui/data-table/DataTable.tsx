import React from 'react';
import { cn } from '@mas/utils';

export type DataTableAlignment = 'left' | 'center' | 'right';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  accessor?: keyof T;
  cell?: (row: T) => React.ReactNode;
  align?: DataTableAlignment;
  width?: string | number;
  headerClassName?: string;
  cellClassName?: string;
}

const defaultGetRowId = <T,>(_: T, index: number) => index.toString();

export interface DataTableProps<T> extends React.TableHTMLAttributes<HTMLTableElement> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  getRowId?: (row: T, index: number) => string;
  zebra?: boolean;
  stickyHeader?: boolean;
  emptyState?: React.ReactNode;
  maxBodyHeight?: number | string;
  scrollContainerClassName?: string;
  bodyClassName?: string;
}

export const DataTable = <T,>({
  data,
  columns,
  getRowId = defaultGetRowId,
  zebra = true,
  stickyHeader = true,
  emptyState,
  className,
  maxBodyHeight,
  scrollContainerClassName,
  bodyClassName,
  ...props
}: DataTableProps<T>) => {
  const scrollAreaStyle = React.useMemo(() => {
    if (!maxBodyHeight) {
      return undefined;
    }

    if (typeof maxBodyHeight === 'number') {
      return { maxHeight: `${maxBodyHeight}px` } as React.CSSProperties;
    }

    return { maxHeight: maxBodyHeight } as React.CSSProperties;
  }, [maxBodyHeight]);

  return (
    <div className="overflow-hidden rounded-xl border border-line/60 bg-surface-100 shadow-card">
      <div className={cn('relative', scrollContainerClassName)}>
        <div
          className={cn('overflow-x-auto', maxBodyHeight && 'overflow-y-auto')}
          style={scrollAreaStyle}
        >
          <table
            className={cn(
              'min-w-full border-separate border-spacing-0 text-left text-sm text-ink',
              className
            )}
            {...props}
          >
            <thead
              className={cn(
                'text-xs font-semibold uppercase tracking-wide text-ink-70',
                stickyHeader &&
                  'sticky top-0 z-20 bg-surface-200/95 backdrop-blur supports-[backdrop-filter]:bg-surface-200/80 shadow-sm'
              )}
            >
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    style={
                      column.width
                        ? {
                            width:
                              typeof column.width === 'number'
                                ? `${column.width}px`
                                : column.width
                          }
                        : undefined
                    }
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-70',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.headerClassName
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={cn('divide-y divide-line/60', bodyClassName)}>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-sm text-muted"
                  >
                    {emptyState ?? 'No records found.'}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const rowId = getRowId(row, index);

                  return (
                    <tr
                      key={rowId}
                      className={cn(
                        'transition-colors focus-within:bg-surface-200/70 hover:bg-surface-200/50',
                        zebra
                          ? 'odd:bg-surface-100 even:bg-surface-200/30'
                          : 'bg-surface-100'
                      )}
                    >
                      {columns.map((column) => {
                        const cellContent = column.cell
                          ? column.cell(row)
                          : column.accessor
                            ? ((row[column.accessor] as React.ReactNode) ?? null)
                            : null;

                        return (
                          <td
                            key={`${rowId}-${column.key}`}
                            className={cn(
                              'px-4 py-3 align-middle text-sm text-ink',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                              column.cellClassName
                            )}
                          >
                            {cellContent ?? <span className="text-muted">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

DataTable.displayName = 'DataTable';
