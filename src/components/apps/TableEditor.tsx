import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Save,
  MapPin,
  Users,
  Settings,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';

interface Table {
  id: string;
  number: number;
  section: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'dirty';
  position: { x: number; y: number };
  shape: 'round' | 'square' | 'rectangle';
}

interface Section {
  id: string;
  name: string;
  color: string;
  tables: Table[];
}

interface TableEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sections: Section[]) => void;
  initialSections?: Section[];
}

export const TableEditor: React.FC<TableEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSections = []
}) => {
  const { showToast } = useToast();
  const [sections, setSections] = useState<Section[]>(initialSections.length > 0 ? initialSections : [
    {
      id: 'main',
      name: 'Main Dining',
      color: 'bg-primary-100',
      tables: [
        { id: '1', number: 1, section: 'main', seats: 4, status: 'available', position: { x: 100, y: 100 }, shape: 'round' },
        { id: '2', number: 2, section: 'main', seats: 2, status: 'available', position: { x: 300, y: 100 }, shape: 'round' },
        { id: '3', number: 3, section: 'main', seats: 6, status: 'available', position: { x: 500, y: 100 }, shape: 'square' },
        { id: '4', number: 4, section: 'main', seats: 4, status: 'available', position: { x: 700, y: 100 }, shape: 'round' },
        { id: '5', number: 5, section: 'main', seats: 8, status: 'available', position: { x: 200, y: 300 }, shape: 'rectangle' },
        { id: '6', number: 6, section: 'main', seats: 4, status: 'available', position: { x: 500, y: 300 }, shape: 'round' },
      ]
    },
    {
      id: 'bar',
      name: 'Bar',
      color: 'bg-amber-100',
      tables: [
        { id: '7', number: 7, section: 'bar', seats: 2, status: 'available', position: { x: 100, y: 100 }, shape: 'round' },
        { id: '8', number: 8, section: 'bar', seats: 2, status: 'available', position: { x: 300, y: 100 }, shape: 'round' },
        { id: '9', number: 9, section: 'bar', seats: 4, status: 'available', position: { x: 500, y: 100 }, shape: 'square' },
      ]
    },
    {
      id: 'patio',
      name: 'Patio',
      color: 'bg-green-100',
      tables: [
        { id: '10', number: 10, section: 'patio', seats: 4, status: 'available', position: { x: 100, y: 100 }, shape: 'round' },
        { id: '11', number: 11, section: 'patio', seats: 6, status: 'available', position: { x: 300, y: 100 }, shape: 'square' },
        { id: '12', number: 12, section: 'patio', seats: 4, status: 'available', position: { x: 500, y: 100 }, shape: 'round' },
      ]
    }
  ]);

  const [selectedSection, setSelectedSection] = useState<string>(sections[0]?.id || '');
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [showAddTable, setShowAddTable] = useState(false);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPlacingTable, setIsPlacingTable] = useState(false);
  const [newTable, setNewTable] = useState({
    number: Math.max(...sections.flatMap(s => s.tables.map(t => t.number)), 0) + 1,
    seats: 4,
    shape: 'round' as const,
    position: { x: 150, y: 150 }
  });

  const handleSave = () => {
    onSave(sections);
    showToast({
      title: 'Table Layout Saved',
      description: 'Your table configuration has been updated successfully',
      tone: 'success',
      duration: 3000
    });
    onClose();
  };

  const handleAddTable = () => {
    const currentSection = sections.find(s => s.id === selectedSection);
    if (!currentSection) return;

    const table: Table = {
      id: Date.now().toString(),
      number: newTable.number,
      section: selectedSection,
      seats: newTable.seats,
      status: 'available',
      position: newTable.position,
      shape: newTable.shape
    };

    setSections(prev => prev.map(section =>
      section.id === selectedSection
        ? { ...section, tables: [...section.tables, table] }
        : section
    ));

    setNewTable(prev => ({
      ...prev,
      number: prev.number + 1,
      position: { x: prev.position.x + 50, y: prev.position.y + 50 }
    }));

    setShowAddTable(false);
    showToast({
      title: 'Table Added',
      description: `Table ${table.number} added to ${currentSection.name}`,
      tone: 'success',
      duration: 2000
    });
  };

  const handleUpdateTable = (tableId: string, updates: Partial<Table>) => {
    setSections(prev => prev.map(section => ({
      ...section,
      tables: section.tables.map(table =>
        table.id === tableId ? { ...table, ...updates } : table
      )
    })));
  };

  const handleDeleteTable = (tableId: string) => {
    const table = sections.flatMap(s => s.tables).find(t => t.id === tableId);
    if (!table) return;

    setSections(prev => prev.map(section => ({
      ...section,
      tables: section.tables.filter(t => t.id !== tableId)
    })));

    showToast({
      title: 'Table Deleted',
      description: `Table ${table.number} has been removed`,
      tone: 'info',
      duration: 2000
    });
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: `New Section ${sections.length + 1}`,
      color: 'bg-surface-200',
      tables: []
    };

    setSections(prev => [...prev, newSection]);
    setSelectedSection(newSection.id);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) {
      showToast({
        title: 'Cannot Delete Section',
        description: 'At least one section must remain',
        tone: 'warning',
        duration: 3000
      });
      return;
    }

    setSections(prev => prev.filter(s => s.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(sections[0]?.id || '');
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
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="heading-sm">Table Editor</h2>
                  <p className="body-xs text-muted">Create and manage your table layout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSection}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Section
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save size={16} />
                  Save Layout
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
            {/* Sections Sidebar */}
            <div className="w-64 border-r border-line p-4">
              <h3 className="font-medium mb-4">Sections</h3>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSection === section.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-line bg-surface-200 hover:bg-surface-300'
                    }`}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${section.color}`}></div>
                        <span className="font-medium text-sm">{section.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted">{section.tables.length}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newName = prompt('Enter section name:', section.name);
                            if (newName) handleUpdateSection(section.id, { name: newName });
                          }}
                          className="p-1 text-muted hover:text-ink"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete section "${section.name}"?`)) {
                              handleDeleteSection(section.id);
                            }
                          }}
                          className="p-1 text-muted hover:text-danger"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Canvas */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  {sections.find(s => s.id === selectedSection)?.name || 'Select Section'}
                </h3>
                <Button
                  size="sm"
                  onClick={() => setShowAddTable(true)}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Table
                </Button>
              </div>

              <div
                className="relative w-full h-96 bg-surface-200 rounded-lg border-2 border-dashed border-line overflow-hidden cursor-crosshair"
                onClick={(e) => {
                  if (isPlacingTable) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left - 40; // Center the table
                    const y = e.clientY - rect.top - 40; // Center the table

                    // Keep table within bounds
                    const clampedX = Math.max(0, Math.min(x, rect.width - 80));
                    const clampedY = Math.max(0, Math.min(y, rect.height - 80));

                    setNewTable(prev => ({ ...prev, position: { x: clampedX, y: clampedY } }));
                    setIsPlacingTable(false);
                    setShowAddTable(true);
                  }
                }}
                onMouseMove={(e) => {
                  if (draggedTable) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const centerX = e.clientX - rect.left;
                    const centerY = e.clientY - rect.top;

                    // Calculate table dimensions
                    const tableWidth = draggedTable.shape === 'round' ? 80 : draggedTable.shape === 'square' ? 80 : 120;
                    const tableHeight = draggedTable.shape === 'round' ? 80 : draggedTable.shape === 'square' ? 80 : 60;

                    // Center the table on cursor
                    const newX = centerX - tableWidth / 2;
                    const newY = centerY - tableHeight / 2;

                    // Keep table within bounds
                    const clampedX = Math.max(0, Math.min(newX, rect.width - tableWidth));
                    const clampedY = Math.max(0, Math.min(newY, rect.height - tableHeight));

                    handleUpdateTable(draggedTable.id, {
                      position: { x: clampedX, y: clampedY }
                    });
                  }
                }}
                onMouseUp={() => {
                  setDraggedTable(null);
                }}
                onMouseLeave={() => {
                  setDraggedTable(null);
                }}
              >
                {sections.find(s => s.id === selectedSection)?.tables.map((table) => (
                  <motion.div
                    key={table.id}
                    className={`
                      absolute cursor-move group select-none
                      ${table.shape === 'round' ? 'rounded-full' : table.shape === 'square' ? 'rounded-lg' : 'rounded-xl'}
                      border-2 transition-all duration-200
                      ${table.status === 'available' ? 'border-success bg-success/10 hover:bg-success/20' :
                        table.status === 'occupied' ? 'border-warning bg-warning/10 hover:bg-warning/20' :
                        table.status === 'reserved' ? 'border-primary-500 bg-primary-500/10 hover:bg-primary-500/20' :
                        'border-danger bg-danger/10 hover:bg-danger/20'}
                      ${draggedTable?.id === table.id ? 'z-10 shadow-lg scale-105' : ''}
                    `}
                    style={{
                      left: table.position.x,
                      top: table.position.y,
                      width: table.shape === 'round' ? 80 : table.shape === 'square' ? 80 : 120,
                      height: table.shape === 'round' ? 80 : table.shape === 'square' ? 80 : 60,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      if (e.detail === 2) { // Double click to edit
                        setEditingTable(table);
                      }
                    }}
                    onMouseDown={(e) => {
                      if (e.button === 0) { // Left click only
                        e.preventDefault();
                        setDraggedTable(table);
                      }
                    }}
                    drag
                    dragMomentum={false}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                      <div className="text-sm font-semibold">{table.number}</div>
                      <div className="text-xs opacity-75">{table.seats} seats</div>
                    </div>

                    {/* Edit/Delete buttons */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTable(table);
                        }}
                        className="w-6 h-6 bg-surface-100 rounded-full border border-line flex items-center justify-center hover:bg-surface-200"
                      >
                        <Edit3 size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(table.id);
                        }}
                        className="w-6 h-6 bg-danger text-white rounded-full border border-danger flex items-center justify-center hover:bg-danger/80"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>

                    {/* Drag indicator */}
                    {draggedTable?.id === table.id && (
                      <div className="absolute inset-0 border-2 border-primary-500 rounded-inherit pointer-events-none" />
                    )}
                  </motion.div>
                ))}

                {sections.find(s => s.id === selectedSection)?.tables.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No tables in this section</p>
                      <p className="text-sm">Click "Add Table" to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Table Modal */}
      <AnimatePresence>
        {showAddTable && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddTable(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-line p-6">
                <h3 className="heading-sm">Add New Table</h3>
                <p className="body-xs text-muted">Configure the new table settings</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Table Number</label>
                    <input
                      type="number"
                      value={newTable.number}
                      onChange={(e) => setNewTable(prev => ({ ...prev, number: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Seats</label>
                    <input
                      type="number"
                      value={newTable.seats}
                      onChange={(e) => setNewTable(prev => ({ ...prev, seats: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Shape</label>
                  <select
                    value={newTable.shape}
                    onChange={(e) => setNewTable(prev => ({ ...prev, shape: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                    <option value="rectangle">Rectangle</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-line p-6">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTable(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddTable}
                    className="flex-1 gap-2"
                  >
                    <Plus size={16} />
                    Add Table
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Table Modal */}
      <AnimatePresence>
        {editingTable && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingTable(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-line p-6">
                <h3 className="heading-sm">Edit Table {editingTable.number}</h3>
                <p className="body-xs text-muted">Update table configuration</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Table Number</label>
                    <input
                      type="number"
                      value={editingTable.number}
                      onChange={(e) => setEditingTable(prev => prev ? { ...prev, number: parseInt(e.target.value) || 1 } : null)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Seats</label>
                    <input
                      type="number"
                      value={editingTable.seats}
                      onChange={(e) => setEditingTable(prev => prev ? { ...prev, seats: parseInt(e.target.value) || 1 } : null)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Shape</label>
                  <select
                    value={editingTable.shape}
                    onChange={(e) => setEditingTable(prev => prev ? { ...prev, shape: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                    <option value="rectangle">Rectangle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editingTable.status}
                    onChange={(e) => setEditingTable(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="dirty">Dirty</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-line p-6">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTable(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingTable) {
                        handleUpdateTable(editingTable.id, editingTable);
                        setEditingTable(null);
                      }
                    }}
                    className="flex-1 gap-2"
                  >
                    <Save size={16} />
                    Update Table
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
