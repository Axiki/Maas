import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState('today');
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data - in real app this would come from API
  const metrics: MetricCard[] = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '$12,847',
      change: 12.5,
      changeLabel: 'vs last period',
      icon: <DollarSign size={20} />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: 342,
      change: 8.2,
      changeLabel: 'vs last period',
      icon: <ShoppingCart size={20} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'customers',
      title: 'New Customers',
      value: 89,
      change: -2.1,
      changeLabel: 'vs last period',
      icon: <Users size={20} />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'avg-order',
      title: 'Avg Order Value',
      value: '$37.56',
      change: 4.3,
      changeLabel: 'vs last period',
      icon: <Target size={20} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const topProducts: ChartData[] = [
    { name: 'Cappuccino', value: 145, color: '#3B82F6' },
    { name: 'Croissant', value: 123, color: '#10B981' },
    { name: 'Caesar Salad', value: 98, color: '#F59E0B' },
    { name: 'Latte', value: 87, color: '#EF4444' },
    { name: 'Sandwich', value: 76, color: '#8B5CF6' }
  ];

  const salesByHour: ChartData[] = [
    { name: '6AM', value: 12, color: '#E5E7EB' },
    { name: '8AM', value: 45, color: '#3B82F6' },
    { name: '10AM', value: 78, color: '#3B82F6' },
    { name: '12PM', value: 123, color: '#10B981' },
    { name: '2PM', value: 98, color: '#10B981' },
    { name: '4PM', value: 156, color: '#F59E0B' },
    { name: '6PM', value: 189, color: '#EF4444' },
    { name: '8PM', value: 134, color: '#8B5CF6' }
  ];

  const customerSegments: ChartData[] = [
    { name: 'Regular', value: 45, color: '#10B981' },
    { name: 'VIP', value: 25, color: '#F59E0B' },
    { name: 'New', value: 20, color: '#3B82F6' },
    { name: 'Inactive', value: 10, color: '#EF4444' }
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    showToast({
      title: 'Data Refreshed',
      description: 'Analytics data has been updated',
      tone: 'success',
      duration: 2000
    });
  };

  const handleExport = () => {
    showToast({
      title: 'Export Started',
      description: 'Analytics report is being generated',
      tone: 'info',
      duration: 3000
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-7xl max-h-[95vh] rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-line p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h2 className="heading-sm text-ink">Analytics Dashboard</h2>
                  <p className="body-xs text-muted">Real-time business insights and performance metrics</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-line rounded-lg bg-surface-200 text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download size={14} />
                  Export
                </Button>
                <button
                  onClick={onClose}
                  className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[calc(100%-80px)] overflow-y-auto">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric) => (
                <motion.div
                  key={metric.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-surface-200 rounded-xl p-6 border border-line"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <div className={metric.color}>
                        {metric.icon}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change >= 0 ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-ink">{metric.value}</p>
                    <p className="text-xs text-muted">{metric.changeLabel}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales by Hour */}
              <div className="bg-surface-200 rounded-xl p-6 border border-line">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-sm text-ink">Sales by Hour</h3>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Clock size={16} />
                    Peak: 6-8 PM
                  </div>
                </div>
                <div className="space-y-3">
                  {salesByHour.map((hour, index) => (
                    <div key={hour.name} className="flex items-center gap-3">
                      <span className="w-8 text-xs text-muted">{hour.name}</span>
                      <div className="flex-1 bg-surface-300 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(hour.value / Math.max(...salesByHour.map(h => h.value))) * 100}%`,
                            backgroundColor: hour.color
                          }}
                        />
                      </div>
                      <span className="w-12 text-xs font-medium">{hour.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-surface-200 rounded-xl p-6 border border-line">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-sm text-ink">Top Products</h3>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Award size={16} />
                    Best Sellers
                  </div>
                </div>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <div className="w-full bg-surface-300 rounded-full h-2 mt-1">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(product.value / Math.max(...topProducts.map(p => p.value))) * 100}%`,
                              backgroundColor: product.color
                            }}
                          />
                        </div>
                      </div>
                      <span className="font-semibold text-sm">{product.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Segments */}
              <div className="bg-surface-200 rounded-xl p-6 border border-line">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-sm text-ink">Customer Segments</h3>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Users size={16} />
                    Distribution
                  </div>
                </div>
                <div className="space-y-4">
                  {customerSegments.map((segment) => (
                    <div key={segment.name} className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{segment.name}</span>
                          <span className="font-semibold text-sm">{segment.value}%</span>
                        </div>
                        <div className="w-full bg-surface-300 rounded-full h-2 mt-1">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${segment.value}%`,
                              backgroundColor: segment.color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="bg-surface-200 rounded-xl p-6 border border-line">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-sm text-ink">Performance Indicators</h3>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Activity size={16} />
                    KPIs
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-surface-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Order Accuracy</p>
                        <p className="text-xs text-muted">Orders fulfilled correctly</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">98.5%</p>
                      <p className="text-xs text-muted">+0.3%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Avg Service Time</p>
                        <p className="text-xs text-muted">Order to completion</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-blue-600">4.2m</p>
                      <p className="text-xs text-muted">-0.5m</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={20} className="text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">Customer Satisfaction</p>
                        <p className="text-xs text-muted">Based on feedback</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-orange-600">4.7/5</p>
                      <p className="text-xs text-muted">+0.1</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-300 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Inventory Turnover</p>
                        <p className="text-xs text-muted">Stock movement rate</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-purple-600">2.3x</p>
                      <p className="text-xs text-muted">+0.2x</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 p-6 bg-surface-200 rounded-xl border border-line">
              <h3 className="heading-sm text-ink mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="gap-2">
                  <Eye size={16} />
                  View Details
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download size={16} />
                  Export Report
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar size={16} />
                  Schedule Report
                </Button>
                <Button variant="outline" className="gap-2">
                  <BarChart3 size={16} />
                  Custom Report
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
