import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Server,
  Database,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Zap,
  Lock,
  Eye,
  Download,
  ExternalLink,
  FileText,
  Settings,
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  TrendingUp,
  Award,
  Users,
  HeadphonesIcon,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { cn } from '@mas/utils';

interface SystemMetric {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  status: 'operational' | 'degraded' | 'outage';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: string;
  responseTime: number;
  lastIncident?: string;
  description: string;
}

interface SecurityCertification {
  id: string;
  name: string;
  issuer: string;
  status: 'active' | 'pending' | 'expired';
  expiryDate: string;
  description: string;
  badgeUrl?: string;
}

interface SystemStatusProps {
  showRealTimeMetrics?: boolean;
  showSecurityCerts?: boolean;
  showApiDocs?: boolean;
  showSupportInfo?: boolean;
}

const systemMetrics: SystemMetric[] = [
  {
    id: 'uptime',
    name: 'System Uptime',
    value: 99.9,
    unit: '%',
    status: 'operational',
    trend: 'stable',
    description: 'Last 30 days'
  },
  {
    id: 'response-time',
    name: 'API Response Time',
    value: 145,
    unit: 'ms',
    status: 'operational',
    trend: 'down',
    description: 'Average global'
  },
  {
    id: 'throughput',
    name: 'Transaction Throughput',
    value: '2.4K',
    unit: '/min',
    status: 'operational',
    trend: 'up',
    description: 'Current rate'
  },
  {
    id: 'error-rate',
    name: 'Error Rate',
    value: 0.02,
    unit: '%',
    status: 'operational',
    trend: 'down',
    description: 'Last 24 hours'
  }
];

const serviceStatuses: ServiceStatus[] = [
  {
    id: 'api',
    name: 'REST API',
    status: 'operational',
    uptime: '99.98%',
    responseTime: 142,
    description: 'Core API endpoints'
  },
  {
    id: 'database',
    name: 'Database',
    status: 'operational',
    uptime: '99.99%',
    responseTime: 23,
    description: 'Primary database cluster'
  },
  {
    id: 'pos-integration',
    name: 'POS Integration',
    status: 'operational',
    uptime: '99.95%',
    responseTime: 189,
    description: 'Point of sale systems'
  },
  {
    id: 'payment-processing',
    name: 'Payment Processing',
    status: 'operational',
    uptime: '99.97%',
    responseTime: 234,
    description: 'Payment gateway'
  },
  {
    id: 'inventory-sync',
    name: 'Inventory Sync',
    status: 'degraded',
    uptime: '98.5%',
    responseTime: 567,
    lastIncident: '2 hours ago',
    description: 'Real-time inventory updates'
  },
  {
    id: 'reporting',
    name: 'Analytics & Reporting',
    status: 'operational',
    uptime: '99.9%',
    responseTime: 445,
    description: 'Business intelligence'
  }
];

const securityCertifications: SecurityCertification[] = [
  {
    id: 'pci-dss',
    name: 'PCI DSS Level 1',
    issuer: 'Payment Card Industry Security Standards Council',
    status: 'active',
    expiryDate: '2025-12-31',
    description: 'Highest level of payment card data security'
  },
  {
    id: 'soc2-type2',
    name: 'SOC 2 Type II',
    issuer: 'American Institute of CPAs',
    status: 'active',
    expiryDate: '2025-08-15',
    description: 'Security, availability, and confidentiality controls'
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    issuer: 'International Organization for Standardization',
    status: 'active',
    expiryDate: '2026-03-20',
    description: 'Information security management systems'
  },
  {
    id: 'gdpr',
    name: 'GDPR Compliance',
    issuer: 'European Union',
    status: 'active',
    expiryDate: 'Ongoing',
    description: 'General Data Protection Regulation compliance'
  }
];

const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/v1/orders',
    description: 'Retrieve orders with filtering and pagination',
    status: 'active'
  },
  {
    method: 'POST',
    path: '/api/v1/orders',
    description: 'Create new orders with validation',
    status: 'active'
  },
  {
    method: 'GET',
    path: '/api/v1/inventory',
    description: 'Real-time inventory levels and alerts',
    status: 'active'
  },
  {
    method: 'POST',
    path: '/api/v1/payments',
    description: 'Process payments with fraud detection',
    status: 'active'
  },
  {
    method: 'GET',
    path: '/api/v1/reports',
    description: 'Generate business intelligence reports',
    status: 'active'
  }
];

export const SystemStatus: React.FC<SystemStatusProps> = ({
  showRealTimeMetrics = true,
  showSecurityCerts = true,
  showApiDocs = true,
  showSupportInfo = true
}) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-success';
      case 'degraded':
        return 'text-warning';
      case 'outage':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle size={16} className="text-success" />;
      case 'degraded':
        return <AlertTriangle size={16} className="text-warning" />;
      case 'outage':
        return <XCircle size={16} className="text-danger" />;
      default:
        return <Activity size={16} className="text-muted" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">System Status & Documentation</h2>
          <p className="text-muted">Real-time system performance, security certifications, and technical documentation</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={cn(isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {systemMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-ink text-sm">{metric.name}</h3>
                <div className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  metric.status === 'operational' && 'bg-success/10 text-success',
                  metric.status === 'degraded' && 'bg-warning/10 text-warning',
                  metric.status === 'outage' && 'bg-danger/10 text-danger'
                )}>
                  {getStatusIcon(metric.status)}
                  {metric.status}
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-ink">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </span>
                <span className="text-sm text-muted">{metric.unit}</span>
              </div>

              <p className="text-xs text-muted">{metric.description}</p>

              <div className="flex items-center gap-1 mt-2">
                {metric.trend === 'up' && <TrendingUp size={12} className="text-success" />}
                {metric.trend === 'down' && <TrendingUp size={12} className="text-danger rotate-180" />}
                {metric.trend === 'stable' && <div className="w-3 h-0.5 bg-muted" />}
                <span className={cn(
                  'text-xs',
                  metric.trend === 'up' && 'text-success',
                  metric.trend === 'down' && 'text-danger',
                  metric.trend === 'stable' && 'text-muted'
                )}>
                  {metric.trend === 'up' && 'Improving'}
                  {metric.trend === 'down' && 'Degraded'}
                  {metric.trend === 'stable' && 'Stable'}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Service Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Server size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-ink">Service Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-muted">5 Operational</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-sm text-muted">1 Degraded</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {serviceStatuses.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 border border-line rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-ink">{service.name}</h4>
                  {getStatusIcon(service.status)}
                </div>
                <p className="text-sm text-muted mb-2">{service.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span>Uptime: {service.uptime}</span>
                  <span>Response: {service.responseTime}ms</span>
                </div>
                {service.lastIncident && (
                  <p className="text-xs text-warning mt-1">
                    Last incident: {service.lastIncident}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Security Certifications */}
      {showSecurityCerts && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={20} className="text-success" />
            <h3 className="text-lg font-semibold text-ink">Security & Compliance</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {securityCertifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-success/20 bg-success/5 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-ink">{cert.name}</h4>
                    <CheckCircle size={16} className="text-success" />
                  </div>
                  <p className="text-sm text-muted mb-1">{cert.issuer}</p>
                  <p className="text-xs text-muted">{cert.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-success">
                      {cert.status === 'active' ? 'Active' : cert.status}
                    </span>
                    <span className="text-xs text-muted">
                      Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye size={16} />
                  View
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* API Documentation */}
      {showApiDocs && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Database size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-ink">API Documentation</h3>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink size={16} />
              View Full Docs
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3">
              {apiEndpoints.map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-surface-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded',
                      endpoint.method === 'GET' && 'bg-success/10 text-success',
                      endpoint.method === 'POST' && 'bg-primary-100 text-primary-600',
                      endpoint.method === 'PUT' && 'bg-warning/10 text-warning',
                      endpoint.method === 'DELETE' && 'bg-danger/10 text-danger'
                    )}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-ink">{endpoint.path}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">
                      {endpoint.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      <FileText size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-4 border-t border-line">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">99.9%</div>
                  <div className="text-sm text-muted">API Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success mb-1">145ms</div>
                  <div className="text-sm text-muted">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ink mb-1">50+</div>
                  <div className="text-sm text-muted">Endpoints</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Support Information */}
      {showSupportInfo && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <HeadphonesIcon size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-ink">Support Channels</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-line rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Phone size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">Phone Support</h4>
                    <p className="text-sm text-muted">24/7 Priority Line</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink">1-800-MAS-HELP</p>
                  <p className="text-xs text-muted"><2 min avg wait</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-line rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <MessageCircle size={20} className="text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">Live Chat</h4>
                    <p className="text-sm text-muted">Instant Response</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-success">Available Now</p>
                  <p className="text-xs text-muted"><30 sec response</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-line rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-warning" />
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">Email Support</h4>
                    <p className="text-sm text-muted">Detailed Issues</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink">support@mas.com</p>
                  <p className="text-xs text-muted"><4 hours response</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award size={20} className="text-warning" />
              <h3 className="text-lg font-semibold text-ink">Service Level Agreements</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm font-medium text-success">System Uptime</span>
                <span className="font-bold text-success">99.9%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm font-medium text-success">Support Response</span>
                <span className="font-bold text-success"><2 hours</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm font-medium text-success">Data Recovery</span>
                <span className="font-bold text-success"><4 hours</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <span className="text-sm font-medium text-warning">Security Response</span>
                <span className="font-bold text-warning"><1 hour</span>
              </div>

              <div className="pt-4 border-t border-line">
                <p className="text-sm text-muted mb-3">Need more details?</p>
                <Button variant="outline" className="w-full">
                  <Download size={16} />
                  Download SLA Document
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
