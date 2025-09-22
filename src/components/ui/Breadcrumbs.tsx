import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@mas/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2 text-sm text-muted', className)}>
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 ? <ChevronRight size={14} className="text-line" /> : null}
          {item.href && !item.current ? (
            <a href={item.href} className="transition-colors hover:text-primary-600">
              {item.label}
            </a>
          ) : (
            <span className={item.current ? 'text-ink font-medium' : 'text-muted'}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
