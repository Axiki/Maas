import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Star,
  Gift,
  History,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit: Date;
  favoriteItems: string[];
  tags: string[];
  status: 'active' | 'inactive';
}

interface CustomerManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerSelect?: (customer: Customer) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  isOpen,
  onClose,
  onCustomerSelect
}) => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, ST 12345',
      dateOfBirth: '1985-03-15',
      loyaltyPoints: 1250,
      totalSpent: 245.67,
      visitCount: 23,
      lastVisit: new Date('2025-01-15'),
      favoriteItems: ['Cappuccino', 'Croissant', 'Caesar Salad'],
      tags: ['Regular', 'VIP'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      loyaltyPoints: 450,
      totalSpent: 89.32,
      visitCount: 8,
      lastVisit: new Date('2025-01-10'),
      favoriteItems: ['Latte', 'Muffin'],
      tags: ['New Customer'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      phone: '+1 (555) 345-6789',
      address: '456 Oak Ave, City, ST 12345',
      loyaltyPoints: 2100,
      totalSpent: 567.89,
      visitCount: 45,
      lastVisit: new Date('2025-01-18'),
      favoriteItems: ['Espresso', 'Sandwich', 'Soup'],
      tags: ['VIP', 'Frequent'],
      status: 'active'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      showToast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        tone: 'warning',
        duration: 3000
      });
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      dateOfBirth: newCustomer.dateOfBirth,
      loyaltyPoints: 0,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: new Date(),
      favoriteItems: [],
      tags: ['New Customer'],
      status: 'active'
    };

    setCustomers(prev => [...prev, customer]);
    setNewCustomer({ name: '', email: '', phone: '', address: '', dateOfBirth: '' });
    setShowAddCustomer(false);

    showToast({
      title: 'Customer Added',
      description: `${customer.name} has been added successfully`,
      tone: 'success',
      duration: 3000
    });
  };

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect?.(customer);
    onClose();
  };

  const getLoyaltyTier = (points: number) => {
    if (points >= 2000) return { name: 'Platinum', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (points >= 1000) return { name: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (points >= 500) return { name: 'Silver', color: 'text-gray-600', bg: 'bg-gray-100' };
    return { name: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-100' };
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
          className="w-full max-w-6xl max-h-[90vh] rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
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
                  <User size={20} />
                </div>
                <div>
                  <h2 className="heading-sm text-ink">Customer Management</h2>
                  <p className="body-xs text-muted">Manage customer profiles and loyalty programs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowAddCustomer(true)}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Customer
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

          <div className="flex h-[calc(100%-80px)]">
            {/* Customer List */}
            <div className="w-1/2 border-r border-line p-6">
              {/* Search */}
              <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Customer List */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {filteredCustomers.map((customer) => {
                  const tier = getLoyaltyTier(customer.loyaltyPoints);
                  return (
                    <motion.div
                      key={customer.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCustomerClick(customer)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedCustomer?.id === customer.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-line bg-surface-200 hover:bg-surface-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-primary-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{customer.name}</h4>
                            <p className="text-xs text-muted">{customer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tier.bg} ${tier.color}`}>
                            <Star size={12} />
                            {tier.name}
                          </div>
                          <p className="text-xs text-muted mt-1">
                            {customer.loyaltyPoints} pts
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <ShoppingBag size={12} />
                            {customer.visitCount} visits
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} />
                            ${customer.totalSpent.toFixed(0)}
                          </span>
                        </div>
                        <span className="text-xs text-muted">
                          Last: {customer.lastVisit.toLocaleDateString()}
                        </span>
                      </div>

                      {customer.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {customer.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-surface-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Customer Details */}
            <div className="flex-1 p-6">
              {selectedCustomer ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="heading-sm">Customer Details</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCustomerSelect(selectedCustomer)}
                        className="gap-2"
                      >
                        <CheckCircle size={14} />
                        Select
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Basic Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User size={16} className="text-muted" />
                            <span className="text-sm">{selectedCustomer.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail size={16} className="text-muted" />
                            <span className="text-sm">{selectedCustomer.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone size={16} className="text-muted" />
                            <span className="text-sm">{selectedCustomer.phone}</span>
                          </div>
                          {selectedCustomer.address && (
                            <div className="flex items-center gap-3">
                              <MapPin size={16} className="text-muted" />
                              <span className="text-sm">{selectedCustomer.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Loyalty Program</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Points</span>
                            <span className="font-medium">{selectedCustomer.loyaltyPoints.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Total Spent</span>
                            <span className="font-medium">${selectedCustomer.totalSpent.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Visits</span>
                            <span className="font-medium">{selectedCustomer.visitCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted">Last Visit</span>
                            <span className="font-medium">{selectedCustomer.lastVisit.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Favorite Items</h4>
                        <div className="space-y-2">
                          {selectedCustomer.favoriteItems.map((item) => (
                            <div key={item} className="flex items-center gap-2 p-2 bg-surface-200 rounded-lg">
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCustomer.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-600 text-xs rounded-full"
                            >
                              <Star size={12} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Gift size={14} />
                            Send Reward
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <History size={14} />
                            View History
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted">
                  <div className="text-center">
                    <User size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Select a customer to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddCustomer && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddCustomer(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-line p-6">
                <h3 className="heading-sm">Add New Customer</h3>
                <p className="body-xs text-muted">Enter customer information</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={newCustomer.dateOfBirth}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="border-t border-line p-6">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddCustomer(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddCustomer}
                    className="flex-1 gap-2"
                  >
                    <Plus size={16} />
                    Add Customer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
