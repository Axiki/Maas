import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Search,
  MapPin,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Eye,
  Edit3,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3,
  PieChart,
  Calendar,
  Phone,
  Mail,
  Wifi,
  WifiOff,
  Shield,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  status: 'online' | 'offline' | 'maintenance' | 'closed';
  type: 'headquarters' | 'restaurant' | 'kiosk' | 'food-truck' | 'catering';
  timezone: string;
  currency: string;
  performance: {
    revenue: number;
    orders: number;
    customers: number;
    rating: number;
    efficiency: number;
  };
  settings: {
    operatingHours: {
      monday: { open: string; close: string; isOpen: boolean };
      tuesday: { open: string; close: string; isOpen: boolean };
      wednesday: { open: string; close: string; isOpen: boolean };
      thursday: { open: string; close: string; isOpen: boolean };
      friday: { open: string; close: string; isOpen: boolean };
      saturday: { open: string; close: string; isOpen: boolean };
      sunday: { open: string; close: string; isOpen: boolean };
    };
    taxRate: number;
    menuPricing: 'standard' | 'premium' | 'economy';
    staffCount: number;
    capacity: number;
  };
  lastSync: Date;
  alerts: {
    lowStock: number;
    offlineDevices: number;
    pendingOrders: number;
    maintenance: boolean;
  };
}

interface MultiLocationManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiLocationManagement: React.FC<MultiLocationManagementProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Mock location data - in real app this would come from enterprise API
  const [locations, setLocations] = useState<Location[]>([
    {
      id: 'loc-1',
      name: 'MAS Headquarters',
      address: '123 Main Street, Downtown, NY 10001',
      phone: '(555) 123-4567',
      email: 'hq@masrestaurant.com',
      manager: 'Sarah Johnson',
      status: 'online',
      type: 'headquarters',
      timezone: 'America/New_York',
      currency: 'USD',
      performance: {
        revenue: 124750,
        orders: 2847,
        customers: 342,
        rating: 4.8,
        efficiency: 92
      },
      settings: {
        operatingHours: {
          monday: { open: '09:00', close: '17:00', isOpen: true },
          tuesday: { open: '09:00', close: '17:00', isOpen: true },
          wednesday: { open: '09:00', close: '17:00', isOpen: true },
          thursday: { open: '09:00', close: '17:00', isOpen: true },
          friday: { open: '09:00', close: '17:00', isOpen: true },
          saturday: { open: '10:00', close: '16:00', isOpen: true },
          sunday: { open: '00:00', close: '00:00', isOpen: false }
        },
        taxRate: 8.5,
        menuPricing: 'standard',
        staffCount: 15,
        capacity: 0
      },
      lastSync: new Date('2025-01-20T10:30:00'),
      alerts: {
        lowStock: 2,
        offlineDevices: 0,
        pendingOrders: 1,
        maintenance: false
      }
    },
    {
      id: 'loc-2',
      name: 'MAS Downtown',
      address: '456 Business Ave, Financial District, NY 10002',
      phone: '(555) 234-5678',
      email: 'downtown@masrestaurant.com',
      manager: 'Mike Chen',
      status: 'online',
      type: 'restaurant',
      timezone: 'America/New_York',
      currency: 'USD',
      performance: {
        revenue: 89500,
        orders: 1920,
        customers: 285,
        rating: 4.6,
        efficiency: 88
      },
      settings: {
        operatingHours: {
          monday: { open: '11:00', close: '22:00', isOpen: true },
          tuesday: { open: '11:00', close: '22:00', isOpen: true },
          wednesday: { open: '11:00', close: '22:00', isOpen: true },
          thursday: { open: '11:00', close: '22:00', isOpen: true },
          friday: { open: '11:00', close: '23:00', isOpen: true },
          saturday: { open: '10:00', close: '23:00', isOpen: true },
          sunday: { open: '10:00', close: '21:00', isOpen: true }
        },
        taxRate: 8.5,
        menuPricing: 'premium',
        staffCount: 12,
        capacity: 85
      },
      lastSync: new Date('2025-01-20T10:25:00'),
      alerts: {
        lowStock: 5,
        offlineDevices: 1,
        pendingOrders: 3,
        maintenance: false
      }
    },
    {
      id: 'loc-3',
      name: 'MAS Airport Terminal',
      address: 'JFK International Airport, Terminal 4, NY 11430',
      phone: '(555) 345-6789',
      email: 'airport@masrestaurant.com',
      manager: 'Emily Rodriguez',
      status: 'online',
      type: 'kiosk',
      timezone: 'America/New_York',
      currency: 'USD',
      performance: {
        revenue: 67200,
        orders: 1450,
        customers: 520,
        rating: 4.4,
        efficiency: 95
      },
      settings: {
        operatingHours: {
          monday: { open: '06:00', close: '23:00', isOpen: true },
          tuesday: { open: '06:00', close: '23:00', isOpen: true },
          wednesday: { open: '06:00', close: '23:00', isOpen: true },
          thursday: { open: '06:00', close: '23:00', isOpen: true },
          friday: { open: '06:00', close: '23:00', isOpen: true },
          saturday: { open: '06:00', close: '23:00', isOpen: true },
          sunday: { open: '06:00', close: '23:00', isOpen: true }
        },
        taxRate: 8.5,
        menuPricing: 'economy',
        staffCount: 8,
        capacity: 0
      },
      lastSync: new Date('2025-01-20T10:28:00'),
      alerts: {
        lowStock: 1,
        offlineDevices: 0,
        pendingOrders: 0,
        maintenance: false
      }
    },
    {
      id: 'loc-4',
      name: 'MAS Food Truck - Central Park',
      address: 'Central Park, 5th Ave, NY 10001',
      phone: '(555) 456-7890',
      email: 'foodtruck@masrestaurant.com',
      manager: 'David Kim',
      status: 'offline',
      type: 'food-truck',
      timezone: 'America/New_York',
      currency: 'USD',
      performance: {
        revenue: 0,
        orders: 0,
        customers: 0,
        rating: 0,
        efficiency: 0
      },
      settings: {
        operatingHours: {
          monday: { open: '11:00', close: '20:00', isOpen: true },
          tuesday: { open: '11:00', close: '20:00', isOpen: true },
          wednesday: { open: '11:00', close: '20:00', isOpen: true },
          thursday: { open: '11:00', close: '20:00', isOpen: true },
          friday: { open: '11:00', close: '20:00', isOpen: true },
          saturday: { open: '10:00', close: '21:00', isOpen: true },
          sunday: { open: '10:00', close: '21:00', isOpen: true }
        },
        taxRate: 8.5,
        menuPricing: 'standard',
        staffCount: 3,
        capacity: 0
      },
      lastSync: new Date('2025-01-19T18:30:00'),
      alerts: {
        lowStock: 0,
        offlineDevices: 2,
        pendingOrders: 0,
        maintenance: true
      }
    },
    {
      id: 'loc-5',
      name: 'MAS Catering Services',
      address: '789 Catering Blvd, Industrial District, NY 10003',
      phone: '(555) 567-8901',
      email: 'catering@masrestaurant.com',
      manager: 'Lisa Thompson',
      status: 'maintenance',
      type: 'catering',
      timezone: 'America/New_York',
      currency: 'USD',
      performance: {
        revenue: 45600,
        orders: 120,
        customers: 45,
        rating: 4.9,
        efficiency: 78
      },
      settings: {
        operatingHours: {
          monday: { open: '08:00', close: '18:00', isOpen: true },
          tuesday: { open: '08:00', close: '18:00', isOpen: true },
          wednesday: { open: '08:00', close: '18:00', isOpen: true },
          thursday: { open: '08:00', close: '18:00', isOpen: true },
          friday: { open: '08:00', close: '18:00', isOpen: true },
          saturday: { open: '09:00', close: '16:00', isOpen: true },
          sunday: { open: '00:00', close: '00:00', isOpen: false }
        },
        taxRate: 8.5,
        menuPricing: 'premium',
        staffCount: 6,
        capacity: 0
      },
      lastSync: new Date('2025-01-20T09:15:00'),
      alerts: {
        lowStock: 3,
        offlineDevices: 0,
        pendingOrders: 2,
        maintenance: true
      }
    }
  ]);

  const types = ['all', 'headquarters', 'restaurant', 'kiosk', 'food-truck', 'catering'];
  const statuses = ['all', 'online', 'offline', 'maintenance', 'closed'];

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || location.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: Location['status']) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Location['status']) => {
    switch (status) {
      case 'online': return <CheckCircle size={16} className="text-green-600" />;
      case 'offline': return <WifiOff size={16} className="text-red-600" />;
      case 'maintenance': return <Settings size={16} className="text-yellow-600" />;
      case 'closed': return <Lock size={16} className="text-gray-600" />;
      default: return <MapPin size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: Location['type']) => {
    switch (type) {
      case 'headquarters': return 'text-purple-600 bg-purple-100';
      case 'restaurant': return 'text-blue-600 bg-blue-100';
      case 'kiosk': return 'text-green-600 bg-green-100';
      case 'food-truck': return 'text-orange-600 bg-orange-100';
      case 'catering': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call to sync all locations
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    showToast({
      title: 'Locations Synced',
      description: 'All location data has been synchronized',
      tone: 'success',
      duration: 2000
    });
  };

  const handleExport = () => {
    showToast({
      title: 'Export Started',
      description: 'Location report is being generated',
      tone: 'info',
      duration: 3000
    });
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setShowEditLocation(true);
  };

  const handleDeleteLocation = (locationId: string) => {
    if (confirm('Are you sure you want to remove this location?')) {
      setLocations(prev => prev.filter(loc => loc.id !== locationId));
      showToast({
        title: 'Location Removed',
        description: 'Location has been removed from the system',
        tone: 'info',
        duration: 2000
      });
    }
  };

  const getTotalRevenue = () => {
    return locations.reduce((total, loc) => total + loc.performance.revenue, 0);
  };

  const getTotalOrders = () => {
    return locations.reduce((total, loc) => total + loc.performance.orders, 0);
  };

  const getOnlineLocations = () => {
    return locations.filter(loc => loc.status === 'online').length;
  };

  const getAverageRating = () => {
    const totalRating = locations.reduce((total, loc) => total + loc.performance.rating, 0);
    return (totalRating / locations.length).toFixed(1);
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
                  <Globe size={20} />
                </div>
                <div>
                  <h2 className="heading-sm text-ink">Multi-Location Management</h2>
                  <p className="body-xs text-muted">Manage multiple locations, sync data, and monitor performance</p>
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
                  Sync All
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
                <Button
                  onClick={() => setShowAddLocation(true)}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Location
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{locations.length}</p>
                    <p className="text-xs text-muted">Total Locations</p>
                  </div>
                </div>
                <p className="text-sm text-muted">All managed locations</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <Wifi size={20} className="text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{getOnlineLocations()}</p>
                    <p className="text-xs text-muted">Online</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Currently connected</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <DollarSign size={20} className="text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">${getTotalRevenue().toLocaleString()}</p>
                    <p className="text-xs text-muted">Total Revenue</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Combined revenue</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-surface-200 rounded-xl p-6 border border-line"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Star size={20} className="text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">{getAverageRating()}</p>
                    <p className="text-xs text-muted">Avg Rating</p>
                  </div>
                </div>
                <p className="text-sm text-muted">Customer satisfaction</p>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
                <motion.div
                  key={location.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-surface-200 rounded-xl border border-line p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <Building2 size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-ink">{location.name}</h3>
                        <p className="text-sm text-muted">{location.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(location.status)}
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(location.status)}`}>
                        {location.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <MapPin size={14} />
                      {location.address}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Users size={14} />
                      Manager: {location.manager}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Phone size={14} />
                      {location.phone}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">${location.performance.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">{location.performance.orders}</p>
                      <p className="text-xs text-muted">Orders</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(location.type)}`}>
                      {location.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500" />
                      <span className="text-sm font-medium">{location.performance.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-muted">Last Sync</p>
                      <p className="font-medium">{location.lastSync.toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditLocation(location)}
                        className="p-1 text-muted hover:text-primary-600 transition-colors"
                        title="Edit location"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="p-1 text-muted hover:text-red-600 transition-colors"
                        title="Remove location"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Alerts */}
                  {(location.alerts.lowStock > 0 || location.alerts.offlineDevices > 0 || location.alerts.maintenance) && (
                    <div className="mt-4 pt-3 border-t border-line/50">
                      <div className="flex items-center gap-2 text-xs">
                        {location.alerts.lowStock > 0 && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle size={12} />
                            {location.alerts.lowStock} low stock
                          </span>
                        )}
                        {location.alerts.offlineDevices > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <WifiOff size={12} />
                            {location.alerts.offlineDevices} offline
                          </span>
                        )}
                        {location.alerts.maintenance && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Settings size={12} />
                            Maintenance
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredLocations.length === 0 && (
              <div className="flex items-center justify-center py-12 text-muted">
                <div className="text-center">
                  <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No locations found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 p-6 bg-surface-200 rounded-xl border border-line">
              <h3 className="heading-sm text-ink mb-4">Location Management</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="gap-2">
                  <Globe size={16} />
                  Sync All Locations
                </Button>
                <Button variant="outline" className="gap-2">
                  <BarChart3 size={16} />
                  Performance Reports
                </Button>
                <Button variant="outline" className="gap-2">
                  <Shield size={16} />
                  Security Settings
                </Button>
                <Button variant="outline" className="gap-2">
                  <Settings size={16} />
                  Bulk Configuration
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
