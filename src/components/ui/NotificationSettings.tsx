import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Mail, Smartphone, Volume2, Clock, Save } from 'lucide-react';
import { Button } from '@mas/ui';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../providers/UXProvider';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [notificationData, setNotificationData] = useState({
    // Order Notifications
    orderUpdates: true,
    orderReady: true,
    orderCompleted: false,
    orderCancelled: true,

    // Inventory Notifications
    lowStock: true,
    outOfStock: true,
    stockReceived: false,
    inventoryCounts: true,

    // Financial Notifications
    dailySales: true,
    weeklyReports: false,
    paymentIssues: true,
    expenseAlerts: true,

    // System Notifications
    systemUpdates: true,
    maintenance: true,
    securityAlerts: true,
    backupStatus: false,

    // Communication Preferences
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    showToast({
      title: 'Notification Settings Updated',
      description: 'Your notification preferences have been saved successfully',
      tone: 'success',
      duration: 3000
    });
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setNotificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuietHoursChange = (field: string, value: any) => {
    setNotificationData(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
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
          className="w-full max-w-2xl rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
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
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="heading-sm">Notification Settings</h2>
                  <p className="body-xs text-muted">Manage your notification preferences</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Communication Methods */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary-600" />
                <h3 className="body-sm font-medium text-ink">Communication Methods</h3>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-line">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-muted" />
                    <div>
                      <p className="body-sm font-medium text-ink">Email Notifications</p>
                      <p className="body-xs text-muted">Receive notifications via email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationData.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-line">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-muted" />
                    <div>
                      <p className="body-sm font-medium text-ink">Push Notifications</p>
                      <p className="body-xs text-muted">Browser and mobile push notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationData.pushNotifications}
                      onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-line">
                  <div className="flex items-center gap-3">
                    <Volume2 size={16} className="text-muted" />
                    <div>
                      <p className="body-sm font-medium text-ink">SMS Notifications</p>
                      <p className="body-xs text-muted">Text message notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationData.smsNotifications}
                      onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Notifications */}
            <div className="space-y-4">
              <h3 className="body-sm font-medium text-ink">Order Notifications</h3>
              <div className="grid gap-3">
                {[
                  { key: 'orderUpdates', label: 'Order Updates', desc: 'Status changes and modifications' },
                  { key: 'orderReady', label: 'Order Ready', desc: 'When orders are ready for pickup' },
                  { key: 'orderCompleted', label: 'Order Completed', desc: 'When orders are fully processed' },
                  { key: 'orderCancelled', label: 'Order Cancelled', desc: 'When orders are cancelled' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-line">
                    <div>
                      <p className="body-sm font-medium text-ink">{item.label}</p>
                      <p className="body-xs text-muted">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationData[item.key as keyof typeof notificationData] as boolean}
                        onChange={(e) => handleInputChange(item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Notifications */}
            <div className="space-y-4">
              <h3 className="body-sm font-medium text-ink">Inventory Notifications</h3>
              <div className="grid gap-3">
                {[
                  { key: 'lowStock', label: 'Low Stock Alerts', desc: 'When items are running low' },
                  { key: 'outOfStock', label: 'Out of Stock', desc: 'When items are unavailable' },
                  { key: 'stockReceived', label: 'Stock Received', desc: 'When new inventory arrives' },
                  { key: 'inventoryCounts', label: 'Inventory Counts', desc: 'Scheduled count reminders' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-line">
                    <div>
                      <p className="body-sm font-medium text-ink">{item.label}</p>
                      <p className="body-xs text-muted">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationData[item.key as keyof typeof notificationData] as boolean}
                        onChange={(e) => handleInputChange(item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-primary-600" />
                  <h3 className="body-sm font-medium text-ink">Quiet Hours</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationData.quietHours.enabled}
                    onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              {notificationData.quietHours.enabled && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="body-sm font-medium text-ink">Start Time</label>
                    <input
                      type="time"
                      value={notificationData.quietHours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="body-sm font-medium text-ink">End Time</label>
                    <input
                      type="time"
                      value={notificationData.quietHours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-line p-6">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="flex-1 gap-2"
              >
                <Save size={16} />
                Save Settings
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
