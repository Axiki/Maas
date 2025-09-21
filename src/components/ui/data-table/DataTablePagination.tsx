import React from 'react';
import { Button } from '@mas/ui';
import { cn } from '@mas/utils';

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
  className
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = totalItems === 0 ? 0 : Math.min(totalItems, safePage * pageSize);

  const handlePrevious = () => {
    if (safePage > 1) {
      onPageChange(safePage - 1);
    }
  };

  const handleNext = () => {
    if (safePage < totalPages) {
      onPageChange(safePage + 1);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-line/60 bg-surface-100 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between',
        className
      )}
    >
      <div className="text-muted">
        {totalItems > 0
          ? `Showing ${rangeStart}-${rangeEnd} of ${totalItems}`
          : 'No records to display'}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="hidden sm:inline">Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-9 rounded-lg border border-line bg-surface-100 px-2 text-sm text-ink focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={safePage <= 1}
            className="min-w-[72px]"
          >
            Previous
          </Button>

          <span className="text-sm font-medium text-ink">
            {safePage} <span className="text-muted">/ {totalPages}</span>
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={safePage >= totalPages}
            className="min-w-[72px]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

DataTablePagination.displayName = 'DataTablePagination';
