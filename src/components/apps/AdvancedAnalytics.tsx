import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Users,
  DollarSign,
  ShoppingCart,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Settings,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  description: string;
  trend: number[];
  prediction?: number;
  confidence?: number;
}

interface PredictiveInsight {
  id: string;
  type: 'sales' | 'inventory' | 'customer' | 'performance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  timeframe: string;
  recommendation: string;
}

interface AdvancedAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'orders', 'customers']);
  const [showPredictions, setShowPredictions] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview', 'predictions']);

  // Mock analytics data - in real app this would come from ML models and APIs
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([
    {
      id: 'revenue',
      name: 'Total Revenue',
      value: 124750,
      change: 12.5,
      changeType: 'increase',
      unit: '$',
      description: 'Total sales revenue for the period',
      trend: [85000, 92000, 98000, 105000, 112000, 118000, 124750],
      prediction: 138200,
      confidence: 87
    },
    {
      id: 'orders',
      name: 'Total Orders',
      value: 2847,
      change: 8.3,
      changeType: 'increase',
      unit: '',
      description: 'Number of orders processed',
      trend: [2100, 2250, 2400, 2550, 2700, 2800, 2847],
      prediction: 3150,
      confidence: 92
    },
    {
      id: 'customers',
      name: 'New Customers',
      value: 342,
      change: -3.2,
      changeType: 'decrease',
      unit: '',
      description: 'New customer acquisitions',
      trend: [380, 365, 350, 340, 335, 330, 342],
      prediction: 320,
      confidence: 78
    },
    {
      id: 'avg-order',
      name: 'Average Order Value',
      value: 43.80,
      change: 3.8,
      changeType: 'increase',
      unit: '$',
      description: 'Average value per order',
      trend: [40.50, 41.20, 42.10, 42.80, 43.20, 43.50, 43.80],
      prediction: 45.20,
      confidence: 85
    },
    {
      id: 'conversion',
      name: 'Conversion Rate',
      value: 3.24,
      change: 0.8,
      changeType: 'increase',
      unit: '%',
      description: 'Visitor to customer conversion',
      trend: [2.80, 2.95, 3.05, 3.15, 3.20, 3.22, 3.24],
      prediction: 3.45,
      confidence: 82
    },
    {
      id: 'retention',
      name: 'Customer Retention',
      value: 68.5,
      change: 2.1,
      changeType: 'increase',
      unit: '%',
      description: 'Customer return rate',
      trend: [64.2, 65.8, 66.5, 67.2, 67.8, 68.1, 68.5],
      prediction: 71.2,
      confidence: 89
    }
  ]);

  const [insights, setInsights] = useState<PredictiveInsight[]>([
    {
      id: 'insight-1',
      type: 'sales',
      title: 'Peak Hours Optimization',
      description: 'Based on historical data, lunch hours (11:30-13:30) show 40% higher order volume than average.',
      impact: 'high',
      confidence: 94,
      timeframe: 'Next 7 days',
      recommendation: 'Increase staff during lunch hours and optimize menu pricing'
    },
    {
      id: 'insight-2',
      type: 'inventory',
      title: 'Low Stock Prediction',
      description: 'Espresso beans and croissants are predicted to run low by Friday based on current consumption trends.',
      impact: 'medium',
      confidence: 88,
      timeframe: 'Next 3 days',
      recommendation: 'Place reorder for espresso beans (25kg) and croissants (50 units)'
    },
    {
      id: 'insight-3',
      type: 'customer',
      title: 'Customer Segment Growth',
      description: 'Young professionals (25-34) segment shows 23% growth potential in evening hours.',
      impact: 'medium',
      confidence: 76,
      timeframe: 'Next 30 days',
      recommendation: 'Create targeted promotions for evening happy hour 5-7 PM'
    },
    {
      id: 'insight-4',
      type: 'performance',
      title: 'Staff Performance Opportunity',
      description: 'Server efficiency could improve by 15% with optimized table assignments.',
      impact: 'low',
      confidence: 71,
      timeframe: 'Next 14 days',
      recommendation: 'Implement automated table assignment system'
    }
  ]);

  const timeRanges = [
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
    { id: '1y', label: 'Last year' }
  ];

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'revenue': return <DollarSign size={20} className="text-green-600" />;
      case 'orders': return <ShoppingCart size={20} className="text-blue-600" />;
      case 'customers': return <Users size={20} className="text-purple-600" />;
      case 'avg-order': return <Target size={20} className="text-orange-600" />;
      case 'conversion': return <Activity size={20} className="text-indigo-600" />;
      case 'retention': return <CheckCircle size={20} className="text-teal-600" />;
      default: return <BarChart3 size={20} className="text-gray-600" />;
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp size={16} className="text-green-600" />;
      case 'decrease': return <TrendingDown size={16} className="text-red-600" />;
      default: return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call to ML models
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    showToast({
      title: 'Analytics Updated',
      description: 'Latest predictions and insights have been loaded',
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

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } else if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else {
      return new Intl.NumberFormat('en-US').format(value);
    }
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
                  <Brain size={20} />
                </div>
                <div>
                  <h2 className="heading-sm text-ink">Advanced Analytics & Intelligence</h2>
                  <p className="body-xs text-muted">AI-powered insights, predictions, and business intelligence</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {timeRanges.map(range => (
                    <option key={range.id} value={range.id}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPredictions(!showPredictions)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    showPredictions
                      ? 'border-primary-200 bg-primary-100 text-primary-700'
                      : 'border-line bg-surface-200 text-muted hover:text-ink'
                  }`}
                >
                  <Brain size={14} />
                  Predictions
                  {showPredictions ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="heading-sm text-ink">Key Performance Metrics</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('overview')}
                  className="gap-2"
                >
                  {expandedSections.includes('overview') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {expandedSections.includes('overview') ? 'Collapse' : 'Expand'}
                </Button>
              </div>

              {expandedSections.includes('overview') && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {metrics.map((metric) => (
                    <motion.div
                      key={metric.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-surface-200 rounded-xl p-6 border border-line"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-surface-300">
                          {getMetricIcon(metric.id)}
                        </div>
                        <div className="flex items-center gap-2">
                          {getChangeIcon(metric.changeType)}
                          <span className={`text-sm font-medium ${
                            metric.changeType === 'increase' ? 'text-green-600' :
                            metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-2xl font-bold text-ink">
                          {formatValue(metric.value, metric.unit)}
                        </p>
                        <p className="text-sm text-muted">{metric.name}</p>
                        <p className="text-xs text-muted mt-1">{metric.description}</p>
                      </div>

                      {showPredictions && metric.prediction && (
                        <div className="pt-3 border-t border-line/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted">Predicted</span>
                            <span className="text-xs text-primary-600 font-medium">
                              {formatValue(metric.prediction, metric.unit)}
                            </span>
                          </div>
                          <div className="w-full bg-surface-300 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${metric.confidence}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted mt-1">
                            {metric.confidence}% confidence
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Predictive Insights */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="heading-sm text-ink">AI-Powered Insights</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('predictions')}
                  className="gap-2"
                >
                  {expandedSections.includes('predictions') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {expandedSections.includes('predictions') ? 'Collapse' : 'Expand'}
                </Button>
              </div>

              {expandedSections.includes('predictions') && (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {insights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-surface-200 rounded-xl p-6 border border-line"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getImpactColor(insight.impact)}`}>
                            <Zap size={16} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-ink">{insight.title}</h4>
                            <p className="text-sm text-muted">{insight.type}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact} impact
                        </span>
                      </div>

                      <p className="text-sm text-muted mb-4">{insight.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span>Confidence: {insight.confidence}%</span>
                          <span>Timeframe: {insight.timeframe}</span>
                        </div>
                      </div>

                      <div className="bg-surface-300 rounded-lg p-3">
                        <p className="text-sm font-medium text-ink mb-1">Recommendation:</p>
                        <p className="text-sm text-muted">{insight.recommendation}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Trend Analysis */}
            <div className="mb-8">
              <h3 className="heading-sm text-ink mb-6">Trend Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-200 rounded-xl p-6 border border-line">
                  <div className="flex items-center gap-2 mb-4">
                    <LineChart size={18} className="text-primary-600" />
                    <h4 className="font-semibold text-ink">Revenue Trend</h4>
                  </div>
                  <div className="h-48 bg-surface-300 rounded-lg flex items-center justify-center">
                    <p className="text-muted">Interactive chart would go here</p>
                  </div>
                </div>

                <div className="bg-surface-200 rounded-xl p-6 border border-line">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart size={18} className="text-primary-600" />
                    <h4 className="font-semibold text-ink">Sales Distribution</h4>
                  </div>
                  <div className="h-48 bg-surface-300 rounded-lg flex items-center justify-center">
                    <p className="text-muted">Interactive chart would go here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-surface-200 rounded-xl border border-line">
              <h3 className="heading-sm text-ink mb-4">Analytics Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="gap-2">
                  <BarChart3 size={16} />
                  Custom Reports
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download size={16} />
                  Export Data
                </Button>
                <Button variant="outline" className="gap-2">
                  <Settings size={16} />
                  Configure Alerts
                </Button>
                <Button variant="outline" className="gap-2">
                  <Target size={16} />
                  Set Goals
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
