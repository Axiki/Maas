import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Shield, Key, Globe, Monitor, Save } from 'lucide-react';
import { Button } from '@mas/ui';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../providers/UXProvider';

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [accountData, setAccountData] = useState({
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    twoFactorEnabled: false,
    sessionTimeout: 30,
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    showToast({
      title: 'Account Settings Updated',
      description: 'Your account preferences have been saved successfully',
      tone: 'success',
      duration: 3000
    });
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
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
          className="w-full max-w-lg rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
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
                  <Settings size={20} />
                </div>
                <div>
                  <h2 className="heading-sm">Account Settings</h2>
                  <p className="body-xs text-muted">Manage your account preferences</p>
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
            {/* Regional Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-primary-600" />
                <h3 className="body-sm font-medium text-ink">Regional Settings</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="body-sm font-medium text-ink">Language</label>
                  <select
                    value={accountData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="body-sm font-medium text-ink">Timezone</label>
                  <select
                    value={accountData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="body-sm font-medium text-ink">Date Format</label>
                  <select
                    value={accountData.dateFormat}
                    onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="body-sm font-medium text-ink">Currency</label>
                  <select
                    value={accountData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-primary-600" />
                <h3 className="body-sm font-medium text-ink">Security</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-line">
                  <div>
                    <p className="body-sm font-medium text-ink">Two-Factor Authentication</p>
                    <p className="body-xs text-muted">Add an extra layer of security</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accountData.twoFactorEnabled}
                      onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="body-sm font-medium text-ink">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={accountData.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="5"
                    max="480"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Monitor size={18} className="text-primary-600" />
                <h3 className="body-sm font-medium text-ink">Notifications</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-line">
                  <div>
                    <p className="body-sm font-medium text-ink">Email Notifications</p>
                    <p className="body-xs text-muted">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accountData.emailNotifications}
                      onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-line">
                  <div>
                    <p className="body-sm font-medium text-ink">Push Notifications</p>
                    <p className="body-xs text-muted">Browser and mobile notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accountData.pushNotifications}
                      onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-line">
                  <div>
                    <p className="body-sm font-medium text-ink">Weekly Reports</p>
                    <p className="body-xs text-muted">Weekly summary emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accountData.weeklyReports}
                      onChange={(e) => handleInputChange('weeklyReports', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
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
