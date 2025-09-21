import React from 'react';

const footerLinks = [
  {
    label: 'Support',
    href: '/support'
  },
  {
    label: 'Status',
    href: '/status'
  },
  {
    label: 'Docs',
    href: '/docs'
  }
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface-100/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-tight text-ink">MAS Suite</p>
            <p className="text-sm text-muted">
              Hospitality & retail operations, orchestrated.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center gap-4 text-sm font-medium">
            {footerLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-ink transition-colors hover:text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-line/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">&copy; {currentYear} MAS Technologies. All rights reserved.</p>
          <p className="text-xs text-muted">
            Built with resilient systems, accessible interfaces, and the MAS design language.
          </p>
        </div>
      </div>
    </footer>
  );
};
