import React, { useCallback, useMemo, useState } from 'react';
import { Card, Button } from '@mas/ui';
import { useThemeStore } from '../../stores/themeStore';
import { useToast } from '../../providers/UXProvider';
import {
  Building2,
  Clock,
  Receipt,
  Users,
  Settings,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Package,
  AlertTriangle
} from 'lucide-react';
import { InventoryManagement } from './InventoryManagement';
import { EmployeeManagement } from './EmployeeManagement';
import { MultiLocationManagement } from './MultiLocationManagement';

const themeModes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
] as const;

export const BackOffice: React.FC = () => {
  const mode = useThemeStore((state) => state.mode);
  const paperShader = useThemeStore((state) => state.paperShader);
  const setMode = useThemeStore((state) => state.setMode);
  const updatePaperShader = useThemeStore((state) => state.updatePaperShader);

  const { showToast } = useToast();

  // Business settings state
  const [businessSettings, setBusinessSettings] = useState({
    storeName: 'MAS Restaurant',
    address: '123 Main Street, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@masrestaurant.com',
    website: 'www.masrestaurant.com',
    taxRate: 8.5,
    currency: 'USD',
    timezone: 'America/New_York',
    operatingHours: {
      monday: { open: '11:00', close: '22:00', closed: false },
      tuesday: { open: '11:00', close: '22:00', closed: false },
      wednesday: { open: '11:00', close: '22:00', closed: false },
      thursday: { open: '11:00', close: '22:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
    receiptSettings: {
      showLogo: true,
      showAddress: true,
      showPhone: true,
      footerMessage: 'Thank you for dining with us!',
      taxNumber: 'TAX-123456789'
    },
    inventorySettings: {
      lowStockThreshold: 10,
      autoReorder: true,
      reorderPoint: 5
    }
  });

  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [isMultiLocationOpen, setIsMultiLocationOpen] = useState(false);

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    showToast({
      title: 'Settings Saved',
      description: 'Business settings have been updated successfully',
      tone: 'success',
      duration: 3000
    });
  };

  const updateBusinessSetting = (key: string, value: any) => {
    setBusinessSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateOperatingHours = (day: string, field: string, value: any) => {
    setBusinessSettings(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }));
  };

  const updateReceiptSettings = (key: string, value: any) => {
    setBusinessSettings(prev => ({
      ...prev,
      receiptSettings: {
        ...prev.receiptSettings,
        [key]: value
      }
    }));
  };

  const updateInventorySettings = (key: string, value: any) => {
    setBusinessSettings(prev => ({
      ...prev,
      inventorySettings: {
        ...prev.inventorySettings,
        [key]: value
      }
    }));
  };

  const paperSurfaces = useMemo(() => ['background', 'cards'] as const, []);

  const toggleSurface = useCallback((surface: 'background' | 'cards') => {
    const set = new Set(paperShader.surfaces);
    if (set.has(surface)) {
      set.delete(surface);
    } else {
      set.add(surface);
    }
    const next = Array.from(set);
    updatePaperShader({ surfaces: next.length ? next : ['background'] });
  }, [paperShader.surfaces, updatePaperShader]);

  return (
    <div className="section-padding">
      <div className="page-container">
        <div className="content-container mx-auto space-y-10">
          <div className="space-y-3">
            <h1 className="heading-md">Backoffice Settings</h1>
            <p className="body-md text-muted max-w-2xl">
              Configure tenant appearance, theme behaviour, device experiences, and paper shader presentation. These controls roll out instantly across the suite.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr)] lg:items-start">
            <aside className="space-y-4 lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]">
              <Card className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="body-xs uppercase tracking-[0.2em] text-muted">Suite overview</p>
                    <h2 className="heading-xs text-ink">Theme snapshot</h2>
                  </div>
                  <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted capitalize">
                    {mode}
                  </span>
                </div>
                <p className="body-sm text-muted">
                  Current tenant palette, paper shader intensity and animation speed applied across Portal, POS, and operational surfaces.
                </p>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-lg border border-line/70 bg-surface-100 px-3 py-2 text-xs">
                    <span className="text-muted">Paper shader</span>
                    <span className="font-medium text-ink">{paperShader.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-line/70 bg-surface-100 px-3 py-2 text-xs">
                    <span className="text-muted">Intensity</span>
                    <span className="font-medium text-ink">{paperShader.intensity.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-line/70 bg-surface-100 px-3 py-2 text-xs">
                    <span className="text-muted">Animation speed</span>
                    <span className="font-medium text-ink">{paperShader.animationSpeed.toFixed(1)}x</span>
                  </div>
                </div>
              </Card>

              <Card className="space-y-3 p-5">
                <h2 className="heading-xs text-ink">Quick Actions</h2>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsInventoryOpen(true)}
                    className="gap-2 justify-start"
                  >
                    <Package size={14} />
                    Inventory Management
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEmployeeOpen(true)}
                    className="gap-2 justify-start"
                  >
                    <Users size={14} />
                    Employee Management
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMultiLocationOpen(true)}
                    className="gap-2 justify-start"
                  >
                    <Globe size={14} />
                    Multi-Location Management
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 justify-start"
                  >
                    <CreditCard size={14} />
                    Financial Reports
                  </Button>
                </div>
              </Card>

              <Card className="space-y-3 p-5">
                <h2 className="heading-xs text-ink">Upcoming configuration tasks</h2>
                <ul className="space-y-2">
                  <li className="rounded-lg border border-line/70 bg-surface-100 px-3 py-2 text-xs text-muted">
                    Define receipt template branding and payment footer messaging.
                  </li>
                  <li className="rounded-lg border border-line/70 bg-surface-100 px-3 py-2 text-xs text-muted">
                    Map POS quick actions to the new role presets and manager approval thresholds.
                  </li>
                  <li className="rounded-lg border border-line/70 bg-surface-100 px-3 py-2 text-xs text-muted">
                    Upload tenant favicon set for PWA manifests and kiosk devices.
                  </li>
                </ul>
              </Card>
            </aside>

            <section className="space-y-6">
              <Card className="space-y-6 p-6">
                <div>
                  <h2 className="heading-sm">Theme Mode</h2>
                  <p className="body-sm text-muted">
                    Choose how MAS adapts colours. Auto follows the system preference for each member of your team.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {themeModes.map((item) => (
                    <Button
                      key={item.id}
                      variant={mode === item.id ? 'primary' : 'outline'}
                      onClick={() => setMode(item.id)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>

                <div className="rounded-lg border border-line bg-surface-200/60 p-4">
                  <p className="body-sm text-muted">
                    Current mode: <span className="body-sm font-medium text-ink capitalize">{mode}</span>.
                  </p>
                </div>
              </Card>

              <Card className="space-y-6 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="heading-sm">Paper Shader</h2>
                    <p className="body-sm text-muted">
                      Toggle the tactile grain layer and fine-tune its intensity and animation speed.
                    </p>
                  </div>
                  <Button
                    variant={paperShader.enabled ? 'primary' : 'outline'}
                    onClick={() => updatePaperShader({ enabled: !paperShader.enabled })}
                  >
                    {paperShader.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <label className="flex flex-col gap-2">
                    <span className="body-sm font-medium text-ink">Grain intensity</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={paperShader.intensity}
                      onChange={(event) =>
                        updatePaperShader({ intensity: parseFloat(event.target.value) })
                      }
                      className="w-full accent-primary-500"
                    />
                    <span className="body-xs text-muted">{paperShader.intensity.toFixed(2)}</span>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="body-sm font-medium text-ink">Animation speed</span>
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={0.1}
                      value={paperShader.animationSpeed}
                      onChange={(event) =>
                        updatePaperShader({ animationSpeed: parseFloat(event.target.value) })
                      }
                      className="w-full accent-primary-500"
                    />
                    <span className="body-xs text-muted">{paperShader.animationSpeed.toFixed(1)}x</span>
                  </label>
                </div>

                <div>
                  <h3 className="body-sm font-medium text-ink mb-2">Apply shader to</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['background', 'cards'] as const).map((surface) => {
                      const active = paperShader.surfaces.includes(surface);
                      return (
                        <Button
                          key={surface}
                          variant={active ? 'primary' : 'outline'}
                          onClick={() => toggleSurface(surface)}
                        >
                          {surface === 'background' ? 'Background' : 'Cards'}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Business Information */}
              <Card className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="text-primary-600" />
                  <div>
                    <h2 className="heading-sm">Business Information</h2>
                    <p className="body-sm text-muted">Basic business details and contact information</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="body-sm font-medium text-ink">Store Name</label>
                    <input
                      type="text"
                      value={businessSettings.storeName}
                      onChange={(e) => updateBusinessSetting('storeName', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="body-sm font-medium text-ink">Phone Number</label>
                    <input
                      type="tel"
                      value={businessSettings.phone}
                      onChange={(e) => updateBusinessSetting('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="body-sm font-medium text-ink">Address</label>
                    <input
                      type="text"
                      value={businessSettings.address}
                      onChange={(e) => updateBusinessSetting('address', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="body-sm font-medium text-ink">Email</label>
                    <input
                      type="email"
                      value={businessSettings.email}
                      onChange={(e) => updateBusinessSetting('email', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="body-sm font-medium text-ink">Website</label>
                    <input
                      type="url"
                      value={businessSettings.website}
                      onChange={(e) => updateBusinessSetting('website', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </Card>

              {/* Operating Hours */}
              <Card className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-primary-600" />
                  <div>
                    <h2 className="heading-sm">Operating Hours</h2>
                    <p className="body-sm text-muted">Set your business hours for each day of the week</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(businessSettings.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-3 rounded-lg border border-line">
                      <div className="w-20">
                        <span className="body-sm font-medium capitalize">{day}</span>
                      </div>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => updateOperatingHours(day, 'closed', !e.target.checked)}
                        />
                        <span className="body-xs text-muted">Open</span>
                      </label>

                      {!hours.closed && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => updateOperatingHours(day, 'open', e.target.value)}
                            className="px-2 py-1 border border-line rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-muted">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => updateOperatingHours(day, 'close', e.target.value)}
                            className="px-2 py-1 border border-line rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </>
                      )}

                      {hours.closed && (
                        <span className="text-sm text-muted ml-4">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Receipt Settings */}
              <Card className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                  <Receipt size={20} className="text-primary-600" />
                  <div>
                    <h2 className="heading-sm">Receipt Configuration</h2>
                    <p className="body-sm text-muted">Customize receipt appearance and information</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showLogo"
                      checked={businessSettings.receiptSettings.showLogo}
                      onChange={(e) => updateReceiptSettings('showLogo', e.target.checked)}
                    />
                    <label htmlFor="showLogo" className="body-sm font-medium">Show logo on receipts</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showAddress"
                      checked={businessSettings.receiptSettings.showAddress}
                      onChange={(e) => updateReceiptSettings('showAddress', e.target.checked)}
                    />
                    <label htmlFor="showAddress" className="body-sm font-medium">Show address on receipts</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showPhone"
                      checked={businessSettings.receiptSettings.showPhone}
                      onChange={(e) => updateReceiptSettings('showPhone', e.target.checked)}
                    />
                    <label htmlFor="showPhone" className="body-sm font-medium">Show phone number on receipts</label>
                  </div>

                  <div className="space-y-2">
                    <label className="body-sm font-medium">Footer Message</label>
                    <input
                      type="text"
                      value={businessSettings.receiptSettings.footerMessage}
                      onChange={(e) => updateReceiptSettings('footerMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Thank you for your business!"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="body-sm font-medium">Tax ID / Business Number</label>
                    <input
                      type="text"
                      value={businessSettings.receiptSettings.taxNumber}
                      onChange={(e) => updateReceiptSettings('taxNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="TAX-123456789"
                    />
                  </div>
                </div>
              </Card>

              {/* Inventory Settings */}
              <Card className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-primary-600" />
                  <div>
                    <h2 className="heading-sm">Inventory Management</h2>
                    <p className="body-sm text-muted">Configure inventory tracking and alerts</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="body-sm font-medium">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={businessSettings.inventorySettings.lowStockThreshold}
                      onChange={(e) => updateInventorySettings('lowStockThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                    />
                    <p className="body-xs text-muted">Alert when items fall below this quantity</p>
                  </div>

                  <div className="space-y-2">
                    <label className="body-sm font-medium">Auto Reorder Point</label>
                    <input
                      type="number"
                      value={businessSettings.inventorySettings.reorderPoint}
                      onChange={(e) => updateInventorySettings('reorderPoint', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                    />
                    <p className="body-xs text-muted">Automatically reorder when stock reaches this level</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoReorder"
                    checked={businessSettings.inventorySettings.autoReorder}
                    onChange={(e) => updateInventorySettings('autoReorder', e.target.checked)}
                  />
                  <label htmlFor="autoReorder" className="body-sm font-medium">Enable automatic reordering</label>
                </div>
              </Card>

              {/* Tax Settings */}
              <Card className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-primary-600" />
                  <div>
                    <h2 className="heading-sm">Tax Configuration</h2>
                    <p className="body-sm text-muted">Set tax rates and currency preferences</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="body-sm font-medium">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={businessSettings.taxRate}
                      onChange={(e) => updateBusinessSetting('taxRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="body-sm font-medium">Currency</label>
                    <select
                      value={businessSettings.currency}
                      onChange={(e) => updateBusinessSetting('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="body-sm font-medium">Timezone</label>
                    <select
                      value={businessSettings.timezone}
                      onChange={(e) => updateBusinessSetting('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="heading-sm">Live Preview</h2>
                    <p className="body-sm text-muted">
                      Confirm contrast and tactile feel across sample surfaces before publishing changes.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Open style guide in new tab or modal
                      window.open('/ux-demo', '_blank');
                    }}
                  >
                    Launch style guide
                  </Button>
                </div>

                <div className="grid gap-grid md:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <Card key={item} className="paper-card space-y-3 p-4">
                      <p className="body-sm text-muted uppercase tracking-wide">Sample Tile</p>
                      <p className="heading-xs">Surface {item}</p>
                      <p className="body-sm text-muted text-balance">
                        The paper shader adds subtle grain and fiber texture, keeping contrast within accessible ranges.
                      </p>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Save Settings */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="heading-sm">Save Changes</h2>
                    <p className="body-sm text-muted">Apply all settings changes across your business</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSaveSettings}
                    className="gap-2"
                  >
                    <Save size={16} />
                    Save All Settings
                  </Button>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </div>

      {/* Inventory Management Modal */}
      <InventoryManagement
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />

      {/* Employee Management Modal */}
      <EmployeeManagement
        isOpen={isEmployeeOpen}
        onClose={() => setIsEmployeeOpen(false)}
      />

      {/* Multi-Location Management Modal */}
      <MultiLocationManagement
        isOpen={isMultiLocationOpen}
        onClose={() => setIsMultiLocationOpen(false)}
      />
    </div>
  );
};
