import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarRange
} from 'lucide-react';
import { Button } from '@mas/ui';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePreset {
  id: string;
  label: string;
  getValue: () => DateRange;
}

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRange: (range: DateRange) => void;
  onClearRange: () => void;
  currentRange?: DateRange;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const presets: DateRangePreset[] = [
  {
    id: 'today',
    label: 'Today',
    getValue: () => {
      const today = new Date();
      return { startDate: today, endDate: today };
    }
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: yesterday, endDate: yesterday };
    }
  },
  {
    id: 'last7days',
    label: 'Last 7 days',
    getValue: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      return { startDate, endDate };
    }
  },
  {
    id: 'last30days',
    label: 'Last 30 days',
    getValue: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      return { startDate, endDate };
    }
  },
  {
    id: 'last90days',
    label: 'Last 90 days',
    getValue: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      return { startDate, endDate };
    }
  },
  {
    id: 'thisMonth',
    label: 'This month',
    getValue: () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate, endDate };
    }
  },
  {
    id: 'lastMonth',
    label: 'Last month',
    getValue: () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate, endDate };
    }
  }
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  isOpen,
  onClose,
  onApplyRange,
  onClearRange,
  currentRange,
  triggerRef
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(currentRange || null);
  const [tempRange, setTempRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date()
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isDateInRange = (date: Date, range: DateRange) => {
    return date >= range.startDate && date <= range.endDate;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedRange) return false;
    return date.toDateString() === selectedRange.startDate.toDateString() ||
           date.toDateString() === selectedRange.endDate.toDateString();
  };

  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    if (selectingStart || !tempRange.startDate) {
      setTempRange({ startDate: date, endDate: date });
      setSelectingStart(false);
    } else {
      if (date < tempRange.startDate) {
        setTempRange({ startDate: date, endDate: tempRange.startDate });
      } else {
        setTempRange({ ...tempRange, endDate: date });
      }
      setSelectingStart(true);
    }
  };

  const handlePresetClick = (preset: DateRangePreset) => {
    const range = preset.getValue();
    setSelectedRange(range);
    setTempRange(range);
  };

  const handleApplyRange = () => {
    if (selectedRange) {
      onApplyRange(selectedRange);
      onClose();
    }
  };

  const handleClearRange = () => {
    setSelectedRange(null);
    setTempRange({ startDate: new Date(), endDate: new Date() });
    onClearRange();
    onClose();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-4 top-16 z-50 w-96"
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      >
        <div
          ref={dropdownRef}
          className="rounded-2xl border border-line bg-surface-100/95 shadow-2xl backdrop-blur-md overflow-hidden"
        >
          <div className="border-b border-line p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarRange size={18} className="text-primary-600" />
              <h3 className="heading-sm">Date Range</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          <div className="p-4">
            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className="text-left justify-start"
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Calendar */}
            <div className="border border-line rounded-xl p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft size={16} />
                </Button>
                <h4 className="body-sm font-medium">
                  {currentMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-muted">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="p-2" />;
                  }

                  const isInRange = selectedRange ? isDateInRange(date, selectedRange) : false;
                  const isSelected = isDateSelected(date);
                  const isToday = isDateToday(date);

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      className={`
                        p-2 text-sm rounded-lg transition-colors relative
                        ${isSelected
                          ? 'bg-primary-500 text-white'
                          : isInRange
                            ? 'bg-primary-100 text-primary-700'
                            : 'hover:bg-surface-200/70'
                        }
                        ${isToday && !isSelected ? 'ring-2 ring-primary-300' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Range Display */}
            {selectedRange && (
              <div className="mt-4 p-3 bg-surface-200/50 rounded-lg">
                <p className="body-xs text-muted mb-1">Selected Range:</p>
                <p className="body-sm font-medium">
                  {formatDate(selectedRange.startDate)} - {formatDate(selectedRange.endDate)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearRange}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleApplyRange}
                className="flex-1"
                disabled={!selectedRange}
              >
                Apply Range
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
