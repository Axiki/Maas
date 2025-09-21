import React from 'react';
import { Link } from 'react-router-dom';

const navigationLinks = [
  { label: 'Suite Launcher', to: '/portal' },
  { label: 'Point of Sale', to: '/pos' },
  { label: 'Back Office', to: '/backoffice' },
  { label: 'Reports', to: '/reports' },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20 border-t border-line bg-surface-100/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-base font-semibold text-ink">Maas Platform</p>
          <p className="text-sm text-muted">
            Operational tools crafted for hospitality teams. Stay connected and in control from floor to back office.
          </p>
          <p className="text-xs text-muted/80">© {currentYear} Maas. All rights reserved.</p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-4 text-sm font-medium md:justify-end">
          {navigationLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-2 py-1 text-muted transition-colors duration-200 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dust"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
