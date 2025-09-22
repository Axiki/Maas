import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  Filter,
  Check,
  Search,
  RotateCcw
} from 'lucide-react';
import { Button } from '@mas/ui';
import { Input } from '../../packages/ui/input';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
  checked?: boolean;
}

interface FilterSection {
  id: string;
  title: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio' | 'search';
}

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  sections: FilterSection[];
  onApplyFilters: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
  activeFilterCount?: number;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  onClose,
  sections,
  onApplyFilters,
  onClearFilters,
  activeFilterCount = 0,
  triggerRef
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // Initialize local filters from sections
  useEffect(() => {
    const initialFilters: Record<string, any> = {};
    sections.forEach(section => {
      if (section.type === 'checkbox') {
        initialFilters[section.id] = section.options
          .filter(option => option.checked)
          .map(option => option.id);
      } else if (section.type === 'radio') {
        const checkedOption = section.options.find(option => option.checked);
        initialFilters[section.id] = checkedOption?.id || '';
      }
    });
    setLocalFilters(initialFilters);
  }, [sections]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
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

  const handleFilterChange = (sectionId: string, value: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentFilters = prev[sectionId] || [];

      if (sections.find(s => s.id === sectionId)?.type === 'radio') {
        return { ...prev, [sectionId]: checked ? value : '' };
      } else {
        if (checked) {
          return { ...prev, [sectionId]: [...currentFilters, value] };
        } else {
          return { ...prev, [sectionId]: currentFilters.filter((v: string) => v !== value) };
        }
      }
    });
  };

  const handleSearchChange = (sectionId: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [sectionId]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    setLocalFilters({});
    setSearchTerms({});
    onClearFilters();
    onClose();
  };

  const getFilteredOptions = (section: FilterSection) => {
    const searchTerm = searchTerms[section.id] || '';
    return section.options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).reduce((count, filterValue) => {
      if (Array.isArray(filterValue)) {
        return count + filterValue.length;
      }
      return count + (filterValue ? 1 : 0);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-4 top-16 z-50 w-80"
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      >
        <div
          ref={dropdownRef}
          className="rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="border-b border-line p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-primary-600" />
              <h3 className="heading-sm">Filters</h3>
              {getActiveFilterCount() > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          {/* Filter Sections */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="space-y-3">
                <h4 className="body-sm font-medium text-ink">{section.title}</h4>

                {/* Search within section */}
                {section.type === 'checkbox' && section.options.length > 5 && (
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchTerms[section.id] || ''}
                      onChange={(e) => handleSearchChange(section.id, e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}

                {/* Options */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getFilteredOptions(section).map((option) => {
                    const isChecked = section.type === 'radio'
                      ? localFilters[section.id] === option.id
                      : (localFilters[section.id] || []).includes(option.id);

                    return (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-200/70 cursor-pointer transition-colors"
                      >
                        <input
                          type={section.type === 'radio' ? 'radio' : 'checkbox'}
                          name={section.type === 'radio' ? section.id : undefined}
                          checked={isChecked}
                          onChange={(e) => handleFilterChange(section.id, option.id, e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-line rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="body-sm text-ink">{option.label}</span>
                        </div>
                        {option.count !== undefined && (
                          <span className="body-xs text-muted bg-surface-200 px-2 py-1 rounded">
                            {option.count}
                          </span>
                        )}
                        {isChecked && (
                          <Check size={16} className="text-primary-600" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-line p-4 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="flex-1 gap-2"
              disabled={getActiveFilterCount() === 0}
            >
              <RotateCcw size={16} />
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFilters}
              className="flex-1 gap-2"
            >
              Apply Filters
              {getActiveFilterCount() > 0 && (
                <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
