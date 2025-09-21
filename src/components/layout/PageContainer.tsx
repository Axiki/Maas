import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  contentClassName = 'space-y-6',
}) => {
  return (
    <div className={`px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {(title || subtitle || actions) && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title && <h1 className="text-2xl font-semibold text-ink">{title}</h1>}
              {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
            </div>
            {actions && (
              <div className="flex items-center gap-2 flex-wrap justify-end">{actions}</div>
            )}
          </div>
        )}

        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
};
