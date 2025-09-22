import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Settings,
  RotateCcw,
  Split,
  Merge,
  UserPlus,
  ChefHat,
  Edit3
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';
import { useCartStore } from '../../stores/cartStore';
import { TableEditor } from './TableEditor';

interface Table {
  id: string;
  number: number;
  section: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'dirty';
  currentOrder?: {
    id: string;
    customerName?: string;
    items: number;
    total: number;
    startTime: Date;
  };
  reservation?: {
    customerName: string;
    partySize: number;
    time: string;
  };
}

interface TableManagementProps {
  onTableSelect?: (table: Table) => void;
  onClose?: () => void;
}

export const TableManagement: React.FC<TableManagementProps> = ({
  onTableSelect,
  onClose
}) => {
  const { showToast } = useToast();
  const { setOrderType } = useCartStore();

  const [selectedSection, setSelectedSection] = useState('main');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableActions, setShowTableActions] = useState(false);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [showSeatCustomer, setShowSeatCustomer] = useState(false);
  const [customerCount, setCustomerCount] = useState(2);
  const [customerName, setCustomerName] = useState('');

  // Mock table data - in real app this would come from API
  const [tables, setTables] = useState<Table[]>([
    // Main Dining Section
    { id: '1', number: 1, section: 'main', seats: 4, status: 'occupied',
      currentOrder: { id: 'order-1', customerName: 'Johnson Family', items: 3, total: 45.50, startTime: new Date(Date.now() - 25 * 60000) } },
    { id: '2', number: 2, section: 'main', seats: 2, status: 'available' },
    { id: '3', number: 3, section: 'main', seats: 6, status: 'occupied',
      currentOrder: { id: 'order-2', customerName: 'Smith', items: 2, total: 28.75, startTime: new Date(Date.now() - 10 * 60000) } },
    { id: '4', number: 4, section: 'main', seats: 4, status: 'reserved',
      reservation: { customerName: 'Davis', partySize: 4, time: '7:30 PM' } },
    { id: '5', number: 5, section: 'main', seats: 8, status: 'available' },
    { id: '6', number: 6, section: 'main', seats: 4, status: 'dirty' },

    // Bar Section
    { id: '7', number: 7, section: 'bar', seats: 2, status: 'occupied',
      currentOrder: { id: 'order-3', customerName: 'Bar Seat 1', items: 1, total: 12.50, startTime: new Date(Date.now() - 5 * 60000) } },
    { id: '8', number: 8, section: 'bar', seats: 2, status: 'available' },
    { id: '9', number: 9, section: 'bar', seats: 4, status: 'available' },

    // Patio Section
    { id: '10', number: 10, section: 'patio', seats: 4, status: 'occupied',
      currentOrder: { id: 'order-4', customerName: 'Outdoor 1', items: 4, total: 67.25, startTime: new Date(Date.now() - 35 * 60000) } },
    { id: '11', number: 11, section: 'patio', seats: 6, status: 'available' },
    { id: '12', number: 12, section: 'patio', seats: 4, status: 'reserved',
      reservation: { customerName: 'Wilson', partySize: 4, time: '8:00 PM' } },
  ]);

  const sections = [
    { id: 'main', name: 'Main Dining', color: 'bg-primary-100' },
    { id: 'bar', name: 'Bar', color: 'bg-amber-100' },
    { id: 'patio', name: 'Patio', color: 'bg-green-100' }
  ];

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'border-success bg-success/10 text-success';
      case 'occupied': return 'border-warning bg-warning/10 text-warning';
      case 'reserved': return 'border-primary-500 bg-primary-500/10 text-primary-600';
      case 'dirty': return 'border-danger bg-danger/10 text-danger';
      default: return 'border-line bg-surface-100 text-muted';
    }
  };

  const getStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} />;
      case 'occupied': return <Users size={16} />;
      case 'reserved': return <Clock size={16} />;
      case 'dirty': return <AlertCircle size={16} />;
      default: return <MapPin size={16} />;
    }
  };

  const formatDuration = (startTime: Date) => {
    const minutes = Math.floor((Date.now() - startTime.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setShowTableActions(true);
  };

  const handleNewOrder = (table: Table) => {
    setOrderType('dine-in');
    showToast({
      title: 'Table Selected',
      description: `Starting new order for Table ${table.number}`,
      tone: 'success',
      duration: 2000
    });
    onTableSelect?.(table);
    onClose?.();
  };

  const handleSeatCustomer = (table: Table) => {
    setSelectedTable(table);
    setCustomerName('');
    setCustomerCount(Math.min(table.seats, 4)); // Default to table capacity or 4, whichever is smaller
    setShowSeatCustomer(true);
  };

  const handleConfirmSeating = () => {
    if (!selectedTable || !customerName.trim()) return;

    // Update table status to occupied
    setTables(prev => prev.map(t =>
      t.id === selectedTable.id
        ? {
            ...t,
            status: 'occupied' as const,
            currentOrder: {
              id: `order-${Date.now()}`,
              customerName: customerName.trim(),
              items: 0,
              total: 0,
              startTime: new Date()
            }
          }
        : t
    ));

    showToast({
      title: 'Customer Seated',
      description: `${customerName} seated at Table ${selectedTable.number} (${customerCount} guests)`,
      tone: 'success',
      duration: 3000
    });

    setShowSeatCustomer(false);
    setSelectedTable(null);
  };

  const handleMarkDirty = (table: Table) => {
    setTables(prev => prev.map(t =>
      t.id === table.id ? { ...t, status: 'dirty' as const } : t
    ));
    showToast({
      title: 'Table Marked Dirty',
      description: `Table ${table.number} needs cleaning`,
      tone: 'warning',
      duration: 2000
    });
  };

  const handleMarkClean = (table: Table) => {
    setTables(prev => prev.map(t =>
      t.id === table.id ? { ...t, status: 'available' as const } : t
    ));
    showToast({
      title: 'Table Cleaned',
      description: `Table ${table.number} is now available`,
      tone: 'success',
      duration: 2000
    });
  };

  const handleFireOrder = (table: Table) => {
    showToast({
      title: 'Order Fired',
      description: `Order sent to kitchen for Table ${table.number}`,
      tone: 'success',
      duration: 2000
    });
  };

  const filteredTables = tables.filter(table => table.section === selectedSection);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg">Table Management</h1>
          <p className="body-sm text-muted">Manage dining areas and table assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTableEditor(true)}
            className="gap-2"
          >
            <Edit3 size={16} />
            Edit Layout
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setSelectedSection(section.id)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedSection === section.id
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-surface-100 text-ink border-line hover:bg-surface-200'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTables.map((table) => (
            <motion.div
              key={table.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => handleTableClick(table)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${getStatusColor(table.status)}
                ${selectedTable?.id === table.id ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                hover:shadow-lg hover:scale-105
              `}
            >
              {/* Table Number */}
              <div className="text-center mb-2">
                <div className="text-lg font-semibold">{table.number}</div>
                <div className="text-xs opacity-75">{table.seats} seats</div>
              </div>

              {/* Status Icon */}
              <div className="flex justify-center mb-2">
                {getStatusIcon(table.status)}
              </div>

              {/* Order Info */}
              {table.currentOrder && (
                <div className="text-center text-xs space-y-1">
                  <div className="font-medium truncate">{table.currentOrder.customerName}</div>
                  <div className="text-muted">{table.currentOrder.items} items</div>
                  <div className="font-semibold">${table.currentOrder.total.toFixed(2)}</div>
                  <div className="text-muted">{formatDuration(table.currentOrder.startTime)}</div>
                </div>
              )}

              {/* Reservation Info */}
              {table.reservation && (
                <div className="text-center text-xs space-y-1">
                  <div className="font-medium truncate">{table.reservation.customerName}</div>
                  <div className="text-muted">{table.reservation.partySize} guests</div>
                  <div className="font-semibold">{table.reservation.time}</div>
                </div>
              )}

              {/* Dirty Status */}
              {table.status === 'dirty' && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-danger rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Table Actions Modal */}
      <AnimatePresence>
        {showTableActions && selectedTable && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTableActions(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-line p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="heading-sm">Table {selectedTable.number}</h2>
                    <p className="body-xs text-muted">{selectedTable.seats} seats • {selectedTable.section}</p>
                  </div>
                  <button
                    onClick={() => setShowTableActions(false)}
                    className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 space-y-3">
                {selectedTable.status === 'available' && (
                  <Button
                    onClick={() => handleNewOrder(selectedTable)}
                    className="w-full justify-start gap-3"
                  >
                    <UserPlus size={18} />
                    New Order
                  </Button>
                )}

                {selectedTable.status === 'occupied' && selectedTable.currentOrder && (
                  <>
                    <Button
                      onClick={() => handleSeatCustomer(selectedTable)}
                      variant="outline"
                      className="w-full justify-start gap-3"
                    >
                      <Users size={18} />
                      Seat Customer
                    </Button>

                    <Button
                      onClick={() => handleFireOrder(selectedTable)}
                      className="w-full justify-start gap-3"
                    >
                      <ChefHat size={18} />
                      Fire Order
                    </Button>
                  </>
                )}

                {selectedTable.status === 'dirty' ? (
                  <Button
                    onClick={() => handleMarkClean(selectedTable)}
                    className="w-full justify-start gap-3"
                  >
                    <CheckCircle size={18} />
                    Mark Clean
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleMarkDirty(selectedTable)}
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <AlertCircle size={18} />
                    Mark Dirty
                  </Button>
                )}

                <div className="pt-4 border-t border-line">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="justify-start gap-2">
                      <Split size={16} />
                      Split
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2">
                      <Merge size={16} />
                      Merge
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seat Customer Modal */}
      <AnimatePresence>
        {showSeatCustomer && selectedTable && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSeatCustomer(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
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
                      <Users size={20} />
                    </div>
                    <div>
                      <h2 className="heading-sm">Seat Customer</h2>
                      <p className="body-xs text-muted">Table {selectedTable.number} • {selectedTable.seats} seats</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSeatCustomer(false)}
                    className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name..."
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Party Size</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCustomerCount(Math.max(1, customerCount - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-200 hover:bg-surface-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{customerCount}</span>
                    <button
                      onClick={() => setCustomerCount(Math.min(selectedTable.seats, customerCount + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-200 hover:bg-surface-300 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-muted ml-2">Max: {selectedTable.seats}</span>
                  </div>
                </div>

                <div className="bg-surface-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-primary-600" />
                    <span className="font-medium">Table {selectedTable.number}</span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">{selectedTable.seats} seats available</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-line p-6">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSeatCustomer(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSeating}
                    disabled={!customerName.trim()}
                    className="flex-1 gap-2"
                  >
                    <Users size={16} />
                    Seat Customer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success">{tables.filter(t => t.status === 'available').length}</div>
          <div className="text-sm text-muted">Available</div>
        </div>
        <div className="bg-surface-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-warning">{tables.filter(t => t.status === 'occupied').length}</div>
          <div className="text-sm text-muted">Occupied</div>
        </div>
        <div className="bg-surface-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{tables.filter(t => t.status === 'reserved').length}</div>
          <div className="text-sm text-muted">Reserved</div>
        </div>
        <div className="bg-surface-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-danger">{tables.filter(t => t.status === 'dirty').length}</div>
          <div className="text-sm text-muted">Need Cleaning</div>
        </div>
      </div>

      {/* Table Editor Modal */}
      <TableEditor
        isOpen={showTableEditor}
        onClose={() => setShowTableEditor(false)}
        onSave={(sections) => {
          // Convert sections back to tables format
          const newTables = sections.flatMap(section =>
            section.tables.map(table => ({
              id: table.id,
              number: table.number,
              section: table.section,
              seats: table.seats,
              status: table.status,
              currentOrder: tables.find(t => t.id === table.id)?.currentOrder,
              reservation: tables.find(t => t.id === table.id)?.reservation
            }))
          );
          setTables(newTables);
          setShowTableEditor(false);
        }}
        initialSections={sections.map(section => ({
          id: section.id,
          name: section.name,
          color: section.color,
          tables: tables
            .filter(table => table.section === section.id)
            .map(table => ({
              id: table.id,
              number: table.number,
              section: table.section,
              seats: table.seats,
              status: table.status,
              position: { x: Math.random() * 300, y: Math.random() * 300 }, // Random positions for editor
              shape: 'round' as const
            }))
        }))}
      />
    </div>
  );
};
