import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'Status', to: '/status' },
  { label: 'Changelog', to: '/changelog' },
  { label: 'Support', to: '/support' },
];

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-30 border-t border-line bg-surface-100/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-ink">MAS Suite</p>
          <p className="text-xs text-muted">Modern operations for restaurants &amp; retail.</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs sm:justify-end" aria-label="Footer">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-muted transition-colors hover:text-primary-600 focus-visible:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-center text-xs text-muted sm:text-right">&copy; {year} MAS Systems. All rights reserved.</p>
      </div>
    </footer>
  );
};
