import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  Calculator,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Settings,
  FileText,
  PieChart,
  BarChart3
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { cn } from '@mas/utils';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  tips: number;
  hours: number;
  sales: number;
  tipout: number;
  netTips: number;
  status: 'active' | 'inactive';
}

interface TipReport {
  id: string;
  date: string;
  totalTips: number;
  totalSales: number;
  totalHours: number;
  averageTipsPerHour: number;
  staff: StaffMember[];
  period: 'daily' | 'weekly' | 'monthly';
}

interface TipReportingProps {
  showPayoutCalculator?: boolean;
  showAnalytics?: boolean;
  showExport?: boolean;
}

const mockStaffData: StaffMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Server',
    hourlyRate: 15.50,
    tips: 245.67,
    hours: 8.5,
    sales: 1250.00,
    tipout: 45.23,
    netTips: 200.44,
    status: 'active'
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Bartender',
    hourlyRate: 18.00,
    tips: 189.34,
    hours: 7.0,
    sales: 890.00,
    tipout: 32.15,
    netTips: 157.19,
    status: 'active'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    role: 'Server',
    hourlyRate: 15.50,
    tips: 198.76,
    hours: 6.5,
    sales: 980.00,
    tipout: 38.92,
    netTips: 159.84,
    status: 'active'
  },
  {
    id: '4',
    name: 'James Wilson',
    role: 'Busser',
    hourlyRate: 12.00,
    tips: 67.23,
    hours: 8.0,
    sales: 0,
    tipout: 0,
    netTips: 67.23,
    status: 'active'
  },
  {
    id: '5',
    name: 'Lisa Park',
    role: 'Host',
    hourlyRate: 14.00,
    tips: 45.89,
    hours: 5.5,
    sales: 0,
    tipout: 0,
    netTips: 45.89,
    status: 'active'
  }
];

const mockReports: TipReport[] = [
  {
    id: '1',
    date: '2025-01-20',
    totalTips: 746.89,
    totalSales: 3120.00,
    totalHours: 35.5,
    averageTipsPerHour: 21.04,
    staff: mockStaffData,
    period: 'daily'
  }
];

export const TipReporting: React.FC<TipReportingProps> = ({
  showPayoutCalculator = true,
  showAnalytics = true,
  showExport = true
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TipReport>(mockReports[0]);

  const totalTips = useMemo(() =>
    selectedReport.staff.reduce((sum, staff) => sum + staff.tips, 0),
    [selectedReport]
  );

  const totalPayout = useMemo(() =>
    selectedReport.staff.reduce((sum, staff) => sum + staff.netTips, 0),
    [selectedReport]
  );

  const averageTipsPerHour = useMemo(() =>
    selectedReport.totalHours > 0 ? totalTips / selectedReport.totalHours : 0,
    [totalTips, selectedReport.totalHours]
  );

  const tipPercentage = useMemo(() =>
    selectedReport.totalSales > 0 ? (totalTips / selectedReport.totalSales) * 100 : 0,
    [totalTips, selectedReport.totalSales]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">Tip Reporting & Payouts</h2>
          <p className="text-muted">Track staff tips, calculate payouts, and manage tip distribution</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
          >
            {showSensitiveData ? <EyeOff size={16} /> : <Eye size={16} />}
            {showSensitiveData ? 'Hide Amounts' : 'Show Amounts'}
          </Button>

          {showExport && (
            <Button variant="outline" size="sm">
              <Download size={16} />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-muted" />
        <span className="text-sm font-medium text-ink">Period:</span>
        <div className="flex bg-surface-200 rounded-lg p-1">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                selectedPeriod === period
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              )}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Tips</p>
                <p className="text-2xl font-bold text-success">
                  {showSensitiveData ? formatCurrency(totalTips) : '••••••'}
                </p>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-success" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Payout</p>
                <p className="text-2xl font-bold text-primary-600">
                  {showSensitiveData ? formatCurrency(totalPayout) : '••••••'}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-primary-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Avg Tips/Hour</p>
                <p className="text-2xl font-bold text-ink">
                  {showSensitiveData ? formatCurrency(averageTipsPerHour) : '••••••'}
                </p>
              </div>
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-warning" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Tip % of Sales</p>
                <p className="text-2xl font-bold text-ink">
                  {tipPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <PieChart size={20} className="text-info" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Staff Breakdown */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-ink">Staff Breakdown</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Total Staff:</span>
            <span className="font-medium text-ink">{selectedReport.staff.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-3 px-4 font-semibold text-ink">Staff Member</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Hours</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Sales</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Tips Earned</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Tipout</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Net Tips</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Tips/Hour</th>
                <th className="text-left py-3 px-4 font-semibold text-ink">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedReport.staff.map((staff, index) => (
                <motion.tr
                  key={staff.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-line/50 hover:bg-surface-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-ink">{staff.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted">{staff.role}</td>
                  <td className="py-3 px-4 text-ink">{staff.hours}h</td>
                  <td className="py-3 px-4 text-ink">
                    {showSensitiveData ? formatCurrency(staff.sales) : '••••••'}
                  </td>
                  <td className="py-3 px-4 text-success font-medium">
                    {showSensitiveData ? formatCurrency(staff.tips) : '••••••'}
                  </td>
                  <td className="py-3 px-4 text-warning">
                    {showSensitiveData ? formatCurrency(staff.tipout) : '••••••'}
                  </td>
                  <td className="py-3 px-4 text-primary-600 font-semibold">
                    {showSensitiveData ? formatCurrency(staff.netTips) : '••••••'}
                  </td>
                  <td className="py-3 px-4 text-ink">
                    {showSensitiveData ? formatCurrency(staff.tips / staff.hours) : '••••••'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      staff.status === 'active'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted/10 text-muted'
                    )}>
                      {staff.status === 'active' ? (
                        <CheckCircle size={12} />
                      ) : (
                        <AlertCircle size={12} />
                      )}
                      {staff.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payout Calculator */}
      {showPayoutCalculator && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-ink">Payout Calculator</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium text-ink">Quick Calculations</h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-surface-100 rounded-lg">
                  <span className="text-sm text-muted">Total Tips to Distribute</span>
                  <span className="font-semibold text-ink">
                    {showSensitiveData ? formatCurrency(totalTips) : '••••••'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-surface-100 rounded-lg">
                  <span className="text-sm text-muted">Total Staff Hours</span>
                  <span className="font-semibold text-ink">{selectedReport.totalHours}h</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <span className="text-sm font-medium text-primary-800">Average per Hour</span>
                  <span className="font-bold text-primary-600">
                    {showSensitiveData ? formatCurrency(averageTipsPerHour) : '••••••'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-ink">Distribution Summary</h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Total Payout Amount</span>
                  <span className="font-semibold text-success">
                    {showSensitiveData ? formatCurrency(totalPayout) : '••••••'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Number of Staff</span>
                  <span className="font-semibold text-ink">{selectedReport.staff.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Average per Staff</span>
                  <span className="font-semibold text-ink">
                    {showSensitiveData ? formatCurrency(totalPayout / selectedReport.staff.length) : '••••••'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-line">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Ready to process payouts?</p>
                <p className="text-xs text-muted">All calculations are final and ready for payroll processing</p>
              </div>
              <Button>
                <Receipt size={16} />
                Process Payouts
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Analytics */}
      {showAnalytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-ink">Tip Trends</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-100 rounded-lg">
                <span className="text-sm text-muted">This Period vs Last Period</span>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-success" />
                  <span className="text-sm font-medium text-success">+12.5%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-100 rounded-lg">
                <span className="text-sm text-muted">Peak Hours Performance</span>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-success" />
                  <span className="text-sm font-medium text-success">+8.3%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-100 rounded-lg">
                <span className="text-sm text-muted">Staff Satisfaction</span>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-success" />
                  <span className="text-sm font-medium text-success">4.7/5</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-ink">Compliance & Reporting</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm text-success">Tip Reporting Compliant</span>
                <CheckCircle size={16} className="text-success" />
              </div>

              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm text-success">Tax Documentation Ready</span>
                <CheckCircle size={16} className="text-success" />
              </div>

              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                <span className="text-sm text-success">Payroll Integration Active</span>
                <CheckCircle size={16} className="text-success" />
              </div>

              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <span className="text-sm text-warning">Review Required</span>
                <AlertCircle size={16} className="text-warning" />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
