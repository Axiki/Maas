import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, Phone, MessageCircle, CheckCircle, AlertCircle, Clock, Building2, ChevronUp } from 'lucide-react';
import { Button } from '@mas/ui';
import { useAuthStore } from '../../stores/authStore';

const footerLinks = [
  { label: 'Support', href: '/support', section: 'support' },
  { label: 'Documentation', href: '/support', section: 'docs' },
  { label: 'Status', href: '/support', section: 'status' },
  { label: 'Privacy', href: '/backoffice', section: 'legal' },
  { label: 'Terms', href: '/backoffice', section: 'legal' },
  { label: 'Security', href: '/backoffice', section: 'legal' },
];

const regulatoryLinks = [
  { label: 'PCI DSS Compliant', href: '#' },
  { label: 'SOC 2 Type II', href: '#' },
  { label: 'GDPR Ready', href: '#' },
  { label: 'HIPAA Eligible', href: '#' },
];

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // SLA Status - In real app, this would come from an API
  const slaStatus = {
    uptime: '99.9%',
    responseTime: '< 2s',
    status: 'operational' as const
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-line bg-surface-100/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-card">
                <span className="body-sm font-semibold tracking-wide">MAS</span>
              </div>
              <div>
                <h3 className="body-sm font-semibold text-ink">Modern Hospitality Suite</h3>
                <p className="body-xs text-muted">{tenant?.name ?? 'MAS HQ'}</p>
              </div>
            </div>
            <p className="body-sm text-muted mb-6 max-w-md">
              Real-time control across POS, back office, and guest experiences with a cohesive visual system.
              Built for hospitality excellence.
            </p>

            {/* SLA Status */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-success" />
                <span className="body-xs text-muted">Uptime {slaStatus.uptime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary-600" />
                <span className="body-xs text-muted">Response {slaStatus.responseTime}</span>
              </div>
              <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                slaStatus.status === 'operational'
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  slaStatus.status === 'operational' ? 'bg-success' : 'bg-warning'
                }`} />
                {slaStatus.status === 'operational' ? 'Operational' : 'Degraded'}
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('tel:+1-555-0123', '_self')}
                className="flex items-center gap-2"
              >
                <Phone size={16} />
                Call Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/backoffice')}
                className="flex items-center gap-2"
              >
                <MessageCircle size={16} />
                Live Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/backoffice')}
                className="flex items-center gap-2"
              >
                <HelpCircle size={16} />
                Help Center
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="body-sm font-semibold text-ink mb-4">Resources</h4>
            <nav className="space-y-3">
              {footerLinks.map((link) => (
                link.href.startsWith('/') ? (
                  <button
                    key={link.label}
                    onClick={() => navigate(link.href)}
                    className="block body-sm text-muted transition-colors hover:text-primary-600 text-left w-full"
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block body-sm text-muted transition-colors hover:text-primary-600"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </nav>
          </div>

          {/* Multi-tenant Info */}
          <div>
            <h4 className="body-sm font-semibold text-ink mb-4">Environment</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-muted" />
                <span className="body-sm text-muted">{tenant?.name ?? 'MAS HQ'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="body-xs text-muted">Production</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/backoffice')}
                className="text-xs"
              >
                Switch Tenant
              </Button>
            </div>

            {/* Regulatory Compliance */}
            <div className="mt-6">
              <h5 className="body-xs font-semibold text-ink mb-3">Compliance</h5>
              <div className="flex flex-wrap gap-2">
                {regulatoryLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="body-xs text-muted transition-colors hover:text-primary-600"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-line pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center text-xs text-muted md:text-left">
              © {year} MAS Technologies. All rights reserved. Licensed for hospitality use only.
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span>Version 2.1.4</span>
              <span>•</span>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:bg-primary-600"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.8
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUp size={20} />
      </motion.button>
    </footer>
  );
};
