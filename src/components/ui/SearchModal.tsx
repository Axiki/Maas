import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@mas/ui';
import { Input } from '../../packages/ui/input';
import { Select } from '../../packages/ui/select';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinDate: string;
  visits: number;
  lifetimeSpend: number;
  loyalty: number;
  status: 'VIP' | 'Member' | 'Inactive';
  lastVisit?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerSelect?: (customer: Customer) => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    name: 'Avery Bennett',
    email: 'avery@bennett.co',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, San Francisco, CA',
    joinDate: '2023-01-15',
    visits: 18,
    lifetimeSpend: 1245.50,
    loyalty: 320,
    status: 'VIP',
    lastVisit: '2024-01-15'
  },
  {
    id: 'cust-002',
    name: 'Jordan Lee',
    email: 'jordanlee@email.com',
    phone: '+1 (555) 234-5678',
    address: '456 Oak Ave, San Francisco, CA',
    joinDate: '2023-03-22',
    visits: 6,
    lifetimeSpend: 284.20,
    loyalty: 120,
    status: 'Member',
    lastVisit: '2024-01-10'
  },
  {
    id: 'cust-003',
    name: 'Taylor Morgan',
    email: 'taylor.morgan@email.com',
    phone: '+1 (555) 345-6789',
    address: '789 Pine St, San Francisco, CA',
    joinDate: '2023-06-10',
    visits: 12,
    lifetimeSpend: 892.75,
    loyalty: 240,
    status: 'Member',
    lastVisit: '2024-01-08'
  },
  {
    id: 'cust-004',
    name: 'Casey Rivera',
    email: 'casey.rivera@email.com',
    address: '321 Elm Dr, San Francisco, CA',
    joinDate: '2023-08-05',
    visits: 3,
    lifetimeSpend: 156.80,
    loyalty: 45,
    status: 'Inactive',
    lastVisit: '2023-12-20'
  },
  {
    id: 'cust-005',
    name: 'Riley Chen',
    email: 'riley.chen@email.com',
    phone: '+1 (555) 456-7890',
    address: '654 Cedar Ln, San Francisco, CA',
    joinDate: '2023-11-12',
    visits: 8,
    lifetimeSpend: 567.30,
    loyalty: 180,
    status: 'Member',
    lastVisit: '2024-01-12'
  }
];

const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'visits', label: 'Most Visits' },
  { value: 'spend', label: 'Highest Spend' },
  { value: 'loyalty', label: 'Most Points' },
  { value: 'recent', label: 'Recent Activity' }
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'vip', label: 'VIP' },
  { value: 'member', label: 'Member' },
  { value: 'inactive', label: 'Inactive' }
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onCustomerSelect,
  triggerRef
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Filter and sort customers
  useEffect(() => {
    let filtered = mockCustomers.filter(customer => {
      const matchesSearch = searchQuery === '' ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'vip' && customer.status === 'VIP') ||
        (statusFilter === 'member' && customer.status === 'Member') ||
        (statusFilter === 'inactive' && customer.status === 'Inactive');

      return matchesSearch && matchesStatus;
    });

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'visits':
          return b.visits - a.visits;
        case 'spend':
          return b.lifetimeSpend - a.lifetimeSpend;
        case 'loyalty':
          return b.loyalty - a.loyalty;
        case 'recent':
          return new Date(b.lastVisit || b.joinDate).getTime() - new Date(a.lastVisit || a.joinDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  }, [searchQuery, sortBy, statusFilter]);

  const handleCustomerClick = (customer: Customer) => {
    if (onCustomerSelect) {
      onCustomerSelect(customer);
      onClose();
    }
  };

  const handleExport = () => {
    // In a real app, this would export the filtered customers
    console.log('Exporting customers:', filteredCustomers);
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'VIP':
        return 'bg-primary-100 text-primary-600';
      case 'Member':
        return 'bg-success/10 text-success';
      case 'Inactive':
        return 'bg-muted/10 text-muted';
      default:
        return 'bg-surface-200 text-muted';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 pt-[10vh] backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          className="w-full max-w-4xl max-h-[80vh] rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-line p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <Search size={20} />
                </div>
                <div>
                  <h2 className="heading-md">Search Customers</h2>
                  <p className="body-sm text-muted">Find and manage customer information</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                className="w-48"
              />

              <Select
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
                className="w-48"
              />

              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <User size={48} className="mx-auto mb-4 opacity-50" />
                <p className="body-md">No customers found</p>
                <p className="body-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="border border-line rounded-xl p-4 hover:bg-surface-200/50 transition-colors cursor-pointer"
                    onClick={() => handleCustomerClick(customer)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="body-md font-semibold text-ink">{customer.name}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(customer.status)}`}>
                            <Star size={12} />
                            {customer.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted">
                          <div className="flex items-center gap-2">
                            <Mail size={14} />
                            <span className="truncate">{customer.email}</span>
                          </div>

                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={14} />
                              <span>{customer.phone}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>Joined {new Date(customer.joinDate).toLocaleDateString()}</span>
                          </div>

                          {customer.address && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span className="truncate">{customer.address}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="font-medium">Visits:</span>
                            <span>{customer.visits}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-medium">Spend:</span>
                            <span>${customer.lifetimeSpend.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-line/50">
                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span>{customer.loyalty} points</span>
                            {customer.lastVisit && (
                              <span>Last visit: {new Date(customer.lastVisit).toLocaleDateString()}</span>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-line p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Filter size={16} />
              <span>
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
