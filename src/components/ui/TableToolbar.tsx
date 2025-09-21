import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils';

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchValue,
  onSearchChange,
  placeholder = 'Search',
  actions,
  className,
}) => {
  const inputId = React.useId();

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <label
        htmlFor={inputId}
        className="flex w-full max-w-lg items-center gap-2 rounded-lg border border-line bg-surface-100 px-3 py-2 text-sm shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200"
      >
        <Search size={18} className="text-muted" aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="w-full border-none bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          aria-label={placeholder}
        />
      </label>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
};
